(function () {
  const CFG = window.APP_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);
  const STORAGE_KEY = "ballot-abroad-v1";

  const state = {
    where: { state: "", zip: "", city: "", street: "", country: "", district: "" },
    status: "",
    ballot: null,       // { contests, demo, admin }
    picks: {},          // contestKey -> { choices: [], why: "" }
    theme: "sunset",
    quiz: {},           // issue key -> -2..2
    weights: {},        // issue key -> true if it matters most
    images: [],         // generated canvases
  };

  // ---------- persistence (per-browser convenience only) ----------
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        where: state.where, status: state.status, picks: state.picks, theme: state.theme, quiz: state.quiz, weights: state.weights,
      }));
    } catch (e) { /* storage unavailable: app still works */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const stateName = (code) => (window.STATES.find(([c]) => c === code) || [code, code])[1];
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // ---------- countdown ----------
  function renderCountdown() {
    const election = new Date(CFG.electionDate + "T12:00:00");
    const days = Math.ceil((election - new Date()) / 86400000);
    $("#countdown").textContent = days > 0
      ? `${days} day${days === 1 ? "" : "s"} until Election Day · Nov 3, 2026`
      : "Election Day was Nov 3, 2026";
  }

  // ---------- step 1 ----------
  function initWhere() {
    const sel = $("#state");
    window.STATES.forEach(([code, name]) => sel.add(new Option(name, code)));
    ["state", "zip", "city", "street", "country", "district"].forEach((k) => { $("#" + k).value = state.where[k] || ""; });
    $("#local-form").addEventListener("submit", (e) => {
      e.preventDefault();
      ["zip", "city", "street"].forEach((k) => { state.where[k] = $("#" + k).value.trim(); });
      save();
      loadLocal();
    });

    $("#where-form").addEventListener("submit", (e) => {
      e.preventDefault();
      ["state", "country", "district"].forEach((k) => { state.where[k] = $("#" + k).value.trim(); });
      state.local = null;
      $("#local-ballot").innerHTML = ""; $("#local-status").innerHTML = "";
      save();
      show("#step-register");
      renderRegister();
      loadBallot();
      $("#step-register").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function show(sel) { $(sel).classList.remove("hidden"); }

  // ---------- step 2: registration ----------
  function renderRegister() {
    document.querySelectorAll("#step-register .chip").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.status === state.status));
      b.onclick = () => { state.status = b.dataset.status; save(); renderRegister(); };
    });
    const box = $("#register-steps");
    if (!state.status) { box.innerHTML = ""; return; }

    const st = stateName(state.where.state);
    const fvapState = `https://www.fvap.gov/guide/chapter2/${slug(st)}`;
    const admin = state.ballot && state.ballot.admin;
    const adminLinks = admin ? [
      admin.electionRegistrationUrl && `<a href="${esc(admin.electionRegistrationUrl)}" target="_blank" rel="noopener">${esc(st)} registration</a>`,
      admin.absenteeVotingInfoUrl && `<a href="${esc(admin.absenteeVotingInfoUrl)}" target="_blank" rel="noopener">${esc(st)} absentee voting</a>`,
      admin.electionInfoUrl && `<a href="${esc(admin.electionInfoUrl)}" target="_blank" rel="noopener">${esc(st)} election info</a>`,
    ].filter(Boolean).join(" · ") : "";

    const fpca = `<li><span class="n">1</span><div><strong>Fill out the FPCA today</strong>
      <p>The Federal Post Card Application registers you <em>and</em> requests your absentee ballot in one form. Use the free online assistant at <a href="https://www.fvap.gov" target="_blank" rel="noopener">FVAP.gov</a>, and pick <strong>email or online</strong> delivery so your ballot arrives fastest.</p></div></li>`;
    const send = `<li><span class="n">2</span><div><strong>Send it to your local election office</strong>
      <p>Many states accept the FPCA by email or fax, and some only take mail. Check the <a href="${fvapState}" target="_blank" rel="noopener">${esc(st)} rules on FVAP</a> for the deadline and how to send it.</p></div></li>`;
    const fwab = (n) => `<li><span class="n">${n}</span><div><strong>Backup plan: the FWAB</strong>
      <p>If your ballot hasn't arrived and time is short, use the <a href="https://www.fvap.gov" target="_blank" rel="noopener">Federal Write-In Absentee Ballot</a>. You can vote with it right away, and if your real ballot arrives later, send that too. Only one will be counted.</p></div></li>`;
    const ret = (n) => `<li><span class="n">${n}</span><div><strong>Return your ballot on time</strong>
      <p>Some states need your ballot <em>received</em> by Election Day; others accept it if it's postmarked by then. The <a href="${fvapState}" target="_blank" rel="noopener">${esc(st)} page on FVAP</a> has your deadline and whether email or fax return is allowed.</p></div></li>`;

    let html = "";
    if (state.status === "done") {
      html = `<p>Nice! States had to send overseas ballots by <strong>Sept 19</strong>, so yours may already be in your inbox or on its way.</p>
      <ol class="todo">
        <li><span class="n">1</span><div><strong>Watch for your ballot</strong><p>Check your email, including spam. If nothing has arrived, contact your local election office.</p></div></li>
        ${ret(2)}${fwab(3)}
      </ol>`;
    } else if (state.status === "registered") {
      html = `<p>Overseas voters have to send a new FPCA <strong>every calendar year</strong> to get a ballot, so even if you're registered, you still need to request one for 2026.</p>
      <ol class="todo">${fpca}${send}${ret(3)}${fwab(4)}</ol>`;
    } else {
      html = `<p>No problem, you can do it from abroad. The FPCA handles registration and your ballot request at once. It's late in the season, so <strong>do it today</strong>.</p>
      <ol class="todo">${fpca}${send}${ret(3)}${fwab(4)}</ol>
      <div class="callout">Not sure if you're registered? The FPCA is safe to send either way. It updates your registration if one already exists.</div>`;
    }
    if (adminLinks) html += `<p class="fine">Official ${esc(st)} links: ${adminLinks}</p>`;
    box.innerHTML = html;
    show("#step-ballot");
  }

  // ---------- step 3: ballot ----------
  function addressString() {
    const w = state.where;
    return [w.street, w.city, `${w.state} ${w.zip}`].filter(Boolean).join(", ");
  }

  // Researched candidate data lives in data/candidates/<STATE>.js and is
  // loaded on demand, so only the chosen state's file is downloaded.
  function loadStateData(code) {
    window.BALLOT_DATA = window.BALLOT_DATA || {};
    if (window.BALLOT_DATA[code]) return Promise.resolve(window.BALLOT_DATA[code]);
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = `data/candidates/${code}.js`;
      s.onload = () => resolve(window.BALLOT_DATA[code] || null);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }

  // Converts researched races into the same shape the Civic API returns.
  function staticContests(data) {
    const district = parseInt(state.where.district, 10);
    const order = ["usSenate", "usHouse", "governor", "ltGovernor", "attorneyGeneral", "secretaryOfState", "stateFinance", "education", "judge", "local", "other", "measure"];
    const rank = (k) => (order.indexOf(k) + 1) || order.length;
    return (data.races || []).slice().sort((a, b) => rank(a.kind) - rank(b.kind)).filter((r) => {
      if (r.kind !== "usHouse" && !r.localArea) return true;
      if (r.kind === "usHouse") return data.atLarge || (district && r.districtNumber === district);
      return false;
    }).map((r) => r.kind === "measure"
      ? { type: "Referendum", kind: "measure", sources: r.sources, referendumTitle: r.office, referendumSubtitle: r.subtitle, referendumText: r.text, referendumBallotResponses: r.responses || ["Yes", "No"], district: { name: r.district || "Statewide" } }
      : { office: r.office, kind: r.kind, district: { name: r.district || "Statewide" }, numberVotingFor: r.numberVotingFor,
          competitive: r.competitive, rating: r.rating, note: r.note,
          candidates: r.candidates.map((c) => ({ name: c.name, party: c.party, candidateUrl: c.website, info: c })) });
  }

  const lastName = (n) => String(n || "").toLowerCase().replace(/\b(jr|sr|ii|iii|iv)\b\.?/g, "").replace(/[^a-z\s-]/g, "").trim().split(/\s+/).pop();

  // Attaches researched summaries to API candidates, matching on race type and
  // last name (the API often uses legal names, e.g. "Thomas Jonathan Ossoff").
  function enrich(contests, data) {
    if (!data) return contests;
    contests.forEach((c) => {
      const kind = classify(c);
      (c.candidates || []).forEach((cand) => {
        for (const r of data.races || []) {
          if (r.kind !== kind) continue;
          const hit = (r.candidates || []).find((x) => lastName(x.name) === lastName(cand.name));
          if (hit) { cand.info = hit; break; }
        }
      });
    });
    return contests;
  }

  async function loadBallot() {
    const status = $("#ballot-status");
    show("#step-ballot");
    status.innerHTML = `<p class="hint">Loading your ballot…</p>`;
    $("#ballot").innerHTML = "";
    const data = await loadStateData(state.where.state);
    state.stateData = data;
    const stName = stateName(state.where.state);

    if (!data) {
      state.ballot = { ...window.DEMO_BALLOT, admin: null };
      status.innerHTML = `<div class="callout"><strong>Demo mode:</strong> we haven't finished researching ${esc(stName)} yet, so these are made-up examples. Use "Show me my local races" below for your real ballot.</div>`;
    } else {
      state.ballot = { contests: staticContests(data), demo: false };
      const houseNote = !data.atLarge && !parseInt(state.where.district, 10)
        ? ` <strong>Add your congressional district in step 1</strong> (or look up your local races below) to see your House race.` : "";
      status.innerHTML = `<p class="hint">Federal and statewide races for ${esc(stName)}, researched ${esc(data.updated || "")}.${houseNote}</p>`;
    }
    renderRegister();
    renderBallot();
    show("#step-quiz");
    renderQuizSummary();
  }

  // Races already covered by the researched data are left out of the live list.
  const COVERED_SCOPES = ["national", "statewide", "congressional"];

  async function loadLocal() {
    const status = $("#local-status");
    const box = $("#local-ballot");
    box.innerHTML = "";
    const fallback = `Find them on <a href="https://ballotpedia.org/Sample_Ballot_Lookup" target="_blank" rel="noopener">Ballotpedia's sample ballot</a>, <a href="https://www.vote411.org" target="_blank" rel="noopener">Vote411</a>, or your county election office's website.`;

    if (!CFG.civicApiKey) {
      status.innerHTML = `<div class="callout">Live local lookup isn't switched on for this site yet. ${fallback}</div>`;
      return;
    }
    status.innerHTML = `<p class="hint">Looking up races for ${esc(addressString())}…</p>`;
    try {
      const url = new URL("https://www.googleapis.com/civicinfo/v2/voterinfo");
      url.searchParams.set("key", CFG.civicApiKey);
      url.searchParams.set("address", addressString());
      url.searchParams.set("returnAllAvailableData", "true");
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error((json.error && json.error.message) || res.statusText);

      const resolvedState = json.normalizedInput && json.normalizedInput.state;
      if (resolvedState && resolvedState.toUpperCase() !== state.where.state) {
        throw new Error(`that ZIP is in ${resolvedState}, not ${state.where.state}. Check the state you picked in step 1`);
      }
      const all = (json.contests || []).filter((c) => (c.candidates && c.candidates.length) || c.type === "Referendum");

      // The lookup reveals the congressional district, so fill it in if missing.
      const house = all.find((c) => classify(c) === "usHouse");
      const m = house && /(\d+)/.exec((house.district && house.district.name) || house.office || "");
      if (m && !parseInt(state.where.district, 10) && state.stateData) {
        state.where.district = m[1];
        $("#district").value = m[1];
        save();
        loadBallot();
      }

      const covered = state.stateData && !(state.ballot && state.ballot.demo);
      const local = all.filter((c) => !covered || !COVERED_SCOPES.includes(((c.district && c.district.scope) || "").toLowerCase()));
      state.local = enrich(local, state.stateData);
      const admin = json.state && json.state[0] && json.state[0].electionAdministrationBody;
      if (admin) { state.ballot.admin = admin; renderRegister(); }

      const note = state.where.street ? "" : " Add your street address for a more complete list.";
      status.innerHTML = local.length
        ? `<p class="hint">${local.length} local races and measures found.${note}</p>`
        : `<div class="callout">No local races found for this address yet. Local ballot data often appears only a few weeks before the election.${note} ${fallback}</div>`;
      renderLocal();
    } catch (err) {
      status.innerHTML = `<div class="callout">We couldn't look up your local races: ${esc(err.message)}. ${fallback}</div>`;
    }
  }

  function classify(c) {
    if (c.kind) return c.kind;
    if (c.type === "Referendum") return "measure";
    const level = (c.level || [])[0] || "";
    const roles = c.roles || [];
    const o = (c.office || "").toLowerCase();
    if (level === "country" && roles.includes("legislatorUpperBody")) return "usSenate";
    if (level === "country" && roles.includes("legislatorLowerBody")) return "usHouse";
    if (/u\.?s\.? senat|united states senat/.test(o)) return "usSenate";
    if (/u\.?s\.? (house|rep)|united states rep|representative in congress|congress/.test(o)) return "usHouse";
    if (/lieutenant governor|lt\.? governor/.test(o)) return "ltGovernor";
    if (/governor/.test(o)) return "governor";
    if (/secretary of state/.test(o)) return "secretaryOfState";
    if (/attorney general/.test(o)) return "attorneyGeneral";
    if (/treasurer|comptroller|controller|auditor/.test(o)) return "stateFinance";
    if (/judge|justice|court/.test(o) || roles.includes("judge") || roles.includes("highestCourtJudge")) return "judge";
    if (/school|education|board of regents/.test(o)) return "education";
    if (/sheriff|district attorney|prosecut/.test(o)) return "lawEnforcement";
    if (/state senat|state rep|assembly|house of delegates|legislat/.test(o) || (level === "administrativeArea1" && roles.some((r) => r.startsWith("legislator")))) return "stateLegislature";
    if (/mayor|council|commission|supervisor|alder|county|city|town|village/.test(o) || /administrativeArea2|locality|subLocality/.test(level)) return "local";
    return "other";
  }

  const contestKey = (c, i, prefix) => `${prefix}${i}:${c.office || c.referendumTitle || "contest"}`;
  const contestTitle = (c) => c.office || c.referendumTitle || "Ballot measure";

  function partyColor(p) {
    const s = (p || "").toLowerCase();
    if (s.includes("democrat")) return "#3b6fd8";
    if (s.includes("republican")) return "#d84a3b";
    if (s.includes("green")) return "#3c9a5f";
    if (s.includes("libertarian")) return "#e0a526";
    return "#9a9aad";
  }

  function candidateMore(cand, stName) {
    const vetted = cand.info && cand.info.summary ? cand.info : null;
    const q = encodeURIComponent(cand.name);
    const links = [
      cand.candidateUrl && `<a href="${esc(cand.candidateUrl)}" target="_blank" rel="noopener">Campaign site</a>`,
      `<a href="https://ballotpedia.org/wiki/index.php?search=${q}" target="_blank" rel="noopener">Ballotpedia</a>`,
      `<a href="https://www.vote411.org/ballot" target="_blank" rel="noopener">Vote411 answers</a>`,
      `<a href="https://www.google.com/search?q=${encodeURIComponent(`"${cand.name}" ${stName} 2026 positions`)}" target="_blank" rel="noopener">News search</a>`,
    ].filter(Boolean).join("");
    if (vetted) {
      return `${vetted.incomplete ? `<p class="callout">Research in progress: we haven't summarized this candidate's platform yet. Use the links below in the meantime.</p>` : ""}
        ${vetted.background ? `<p><strong>Who they are:</strong> ${esc(vetted.background)}</p>` : ""}
        <p><strong>Where they stand:</strong> ${esc(vetted.summary)}</p>
        ${vetted.inPractice ? `<p><strong>In practice:</strong> ${esc(vetted.inPractice)}</p>` : ""}
        ${vetted.abroad ? `<p><strong>For you abroad:</strong> ${esc(vetted.abroad)}</p>` : ""}
        <p class="fine">Summary written from campaign sites and news coverage${vetted.asOf ? `, as of ${esc(vetted.asOf)}` : ""}. Check the sources for detail.</p>
        <div class="cand-links">${(vetted.sources || []).map((s, i) => `<a href="${esc(s)}" target="_blank" rel="noopener">Source ${i + 1}</a>`).join("")}${links}</div>`;
    }
    return `<p>We don't have a checked summary for this candidate yet. Their survey answers on Ballotpedia and Vote411 are the most direct way to compare them. Questions worth checking:</p>
      <ul>${window.ABROAD_QUESTIONS.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <div class="cand-links">${links}</div>`;
  }

  // ---------- values quiz ----------
  const SCALE = [[-2, "Strongly disagree"], [-1, "Disagree"], [0, "Not sure"], [1, "Agree"], [2, "Strongly agree"]];

  function renderQuiz() {
    $("#quiz").innerHTML = window.ISSUES.map((q, n) => `<div class="q" data-issue="${q.key}">
      <div class="q-topic">${n + 1}/10 · ${esc(q.topic)}</div>
      <p class="q-text">${esc(q.statement)}</p>
      <div class="scale">${SCALE.map(([v, label]) =>
        `<button type="button" data-v="${v}" aria-pressed="${state.quiz[q.key] === v}">${label}</button>`).join("")}</div>
      <button type="button" class="star" aria-pressed="${!!state.weights[q.key]}">${state.weights[q.key] ? "★ Matters most to me" : "☆ Mark as a top issue"}</button>
    </div>`).join("");
    $("#quiz").querySelectorAll(".q").forEach((el) => {
      const key = el.dataset.issue;
      el.querySelectorAll(".scale button").forEach((b) => b.onclick = () => {
        const v = +b.dataset.v;
        if (state.quiz[key] === v) delete state.quiz[key]; else state.quiz[key] = v;
        afterQuizChange();
      });
      el.querySelector(".star").onclick = () => { state.weights[key] = !state.weights[key]; afterQuizChange(); };
    });
  }

  function afterQuizChange() {
    save();
    renderQuiz();
    renderBallot();
    if (state.local) renderLocal();
    renderQuizSummary();
  }

  // Share of agreement (0–100) across the issues both sides have a position on.
  // "Not sure" (0) answers are ignored. Top issues count double.
  function matchScore(stances) {
    if (!stances) return null;
    let total = 0, weight = 0;
    const agree = [], differ = [];
    for (const q of window.ISSUES) {
      const u = state.quiz[q.key], c = stances[q.key];
      if (u === undefined || u === 0 || c === undefined) continue;
      const w = state.weights[q.key] ? 2 : 1;
      const sim = 1 - Math.abs(u - c) / 4;
      total += w * sim; weight += w;
      if (sim >= 0.75) agree.push(q.topic); else if (sim <= 0.25) differ.push(q.topic);
    }
    const compared = window.ISSUES.filter((q) => state.quiz[q.key] && stances[q.key] !== undefined).length;
    if (compared < 2) return null;
    return { pct: Math.round((total / weight) * 100), compared, agree, differ };
  }

  const quizAnswered = () => Object.values(state.quiz).filter((v) => v !== 0).length;

  function renderQuizSummary() {
    const box = $("#quiz-summary");
    if (quizAnswered() < 3) {
      box.innerHTML = quizAnswered() ? `<p class="fine">Answer at least 3 questions to see matches.</p>` : "";
      return;
    }
    const contests = (state.ballot && state.ballot.contests) || [];
    const rows = contests.filter((c) => c.candidates).map((c) => {
      const scored = c.candidates.map((cand) => ({ cand, m: matchScore(cand.info && cand.info.stances) })).filter((x) => x.m);
      if (scored.length < 2) {
        return `<li><strong>${esc(c.office)}:</strong> <span class="fine">not enough recorded positions to compare these candidates yet</span></li>`;
      }
      scored.sort((a, b) => b.m.pct - a.m.pct);
      const best = scored[0];
      return `<li><strong>${esc(c.office)}:</strong> ${esc(best.cand.name)} <span class="match top">${best.m.pct}% match</span></li>`;
    }).filter(Boolean);
    box.innerHTML = rows.length
      ? `<h3>Your closest matches</h3><ul class="summary-list">${rows.join("")}</ul><p class="fine">See the details on each race below.</p>`
      : `<p class="fine">We don't have enough recorded positions for the candidates on your ballot to match them yet.</p>`;
  }

  function renderBallot() {
    renderContests($("#ballot"), (state.ballot && state.ballot.contests) || [], "s", state.ballot && state.ballot.demo);
  }
  function renderLocal() {
    renderContests($("#local-ballot"), state.local || [], "l", false);
  }

  function renderContests(box, contests, prefix, demo) {
    const stName = stateName(state.where.state);
    const demoTag = demo ? " (demo)" : "";

    box.innerHTML = contests.map((c, i) => {
      const key = contestKey(c, i, prefix);
      const kind = classify(c);
      const guide = window.OFFICE_GUIDE[kind];
      const pick = state.picks[key] || { choices: [], why: "" };
      const max = parseInt(c.numberVotingFor, 10) || 1;
      const isMeasure = kind === "measure";
      const options = isMeasure
        ? (c.referendumBallotResponses || ["Yes", "No"]).map((r) => ({ name: r }))
        : c.candidates;
      const matches = isMeasure || quizAnswered() < 3 ? [] : options.map((cand) => matchScore(cand.info && cand.info.stances));
      // Only highlight a "top" match when there's someone to compare against.
      const bestPct = matches.filter(Boolean).length >= 2 ? Math.max(...matches.filter(Boolean).map((m) => m.pct)) : -1;

      const opts = options.map((cand, j) => {
        const checked = pick.choices.includes(cand.name);
        const id = `${prefix}${i}-${j}`;
        return `<div class="cand ${checked ? "picked" : ""}">
          <label class="cand-top" for="${id}">
            <input type="checkbox" id="${id}" data-key="${esc(key)}" data-name="${esc(cand.name)}" data-max="${max}" ${checked ? "checked" : ""}>
            <span><span class="cand-name">${esc(cand.name)}</span>
            ${cand.info && cand.info.incumbent ? ` <span class="party">· incumbent</span>` : ""}
            ${matches[j] ? `<span class="match ${matches[j].pct === bestPct ? "top" : ""}">${matches[j].pct}% match</span>` : ""}
            ${cand.party ? `<br><span class="party"><span class="party-dot" style="background:${partyColor(cand.party)}"></span>${esc(cand.party)}</span>` : ""}</span>
          </label>
          ${!matches[j] && matches.some(Boolean) ? `<p class="match-why">Not enough recorded positions to match this candidate on your answers.</p>` : ""}
          ${matches[j] ? `<p class="match-why">Compared on ${matches[j].compared} issue${matches[j].compared === 1 ? "" : "s"}.${matches[j].agree.length ? ` You agree on ${esc(matches[j].agree.join(", "))}.` : ""}${matches[j].differ.length ? ` You differ on ${esc(matches[j].differ.join(", "))}.` : ""}</p>` : ""}
          ${isMeasure ? "" : `<details class="more"><summary class="fine">Positions and what they mean</summary>${candidateMore(cand, stName)}</details>`}
        </div>`;
      }).join("");

      return `<div class="contest" data-key="${esc(key)}">
        <div class="contest-head">
          <span class="tag">${esc(guide.label)}${demoTag}</span>
          ${c.competitive ? `<span class="hot" title="Rated ${esc(c.rating || "competitive")} by nonpartisan forecasters">🔥 Competitive${c.rating ? ` · ${esc(c.rating)}` : ""}</span>` : c.rating ? `<span class="rating">Rated ${esc(c.rating)}</span>` : ""}
          <span class="district">${esc(c.district && c.district.name)}</span>
        </div>
        <h3>${esc(contestTitle(c))}</h3>
        ${c.note ? `<p class="fine">${esc(c.note)}</p>` : ""}
        ${isMeasure && c.referendumSubtitle ? `<p class="measure-text">${esc(c.referendumSubtitle)}</p>` : ""}
        ${isMeasure && c.referendumText ? `<details class="explain"><summary>Full text</summary><p>${esc(c.referendumText)}</p></details>` : ""}
        <details class="explain"><summary>What this ${isMeasure ? "means" : "office does"}, and why it matters abroad</summary>
          <p>${esc(guide.does)}</p>${guide.abroad ? `<p><strong>From abroad:</strong> ${esc(guide.abroad)}</p>` : ""}</details>
        ${max > 1 ? `<p class="fine">Pick up to ${max}.</p>` : ""}
        ${opts}
        <label class="why">Why? <span class="opt">optional, goes on your story</span>
          <textarea data-why="${esc(key)}" maxlength="160" placeholder="e.g. Wants to make it easier to vote from abroad">${esc(pick.why)}</textarea>
        </label>
      </div>`;
    }).join("");

    box.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.addEventListener("change", onPick));
    box.querySelectorAll("textarea[data-why]").forEach((ta) => ta.addEventListener("input", () => {
      const k = ta.dataset.why;
      state.picks[k] = state.picks[k] || { choices: [], why: "" };
      state.picks[k].why = ta.value;
      save();
    }));
    updateShareVisibility();
  }

  function onPick(e) {
    const cb = e.target;
    const key = cb.dataset.key, name = cb.dataset.name, max = +cb.dataset.max;
    const pick = state.picks[key] = state.picks[key] || { choices: [], why: "" };
    if (cb.checked) {
      pick.choices.push(name);
      // Single-seat races behave like a radio group; multi-seat drop the oldest pick.
      while (pick.choices.length > max) pick.choices.shift();
    } else {
      pick.choices = pick.choices.filter((n) => n !== name);
    }
    const contestEl = cb.closest(".contest");
    contestEl.querySelectorAll('input[type="checkbox"]').forEach((other) => {
      other.checked = pick.choices.includes(other.dataset.name);
      other.closest(".cand").classList.toggle("picked", other.checked);
    });
    save();
    updateShareVisibility();
  }

  // Picks in ballot order, ready for the story renderer.
  function pickedList() {
    const tagged = (list, prefix) => (list || []).map((c, i) => [c, contestKey(c, i, prefix)]);
    const all = [...tagged(state.ballot && state.ballot.contests, "s"), ...tagged(state.local, "l")];
    return all.map(([c, key]) => {
      const p = state.picks[key];
      if (!p || !p.choices.length) return null;
      const isMeasure = c.type === "Referendum";
      return {
        office: contestTitle(c),
        choice: isMeasure ? `${p.choices[0]} on this measure` : p.choices.join(" & "),
        why: (p.why || "").trim(),
      };
    }).filter(Boolean);
  }

  function updateShareVisibility() {
    const n = pickedList().length;
    $("#step-share").classList.toggle("hidden", n === 0);
  }

  // ---------- step 4: share ----------
  function initShare() {
    const themes = $("#themes");
    Object.entries(window.Story.THEMES).forEach(([name, t]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "theme";
      b.title = name;
      b.setAttribute("aria-label", `${name} style`);
      b.style.background = `linear-gradient(160deg, ${t.bg.join(", ")})`;
      b.setAttribute("aria-pressed", String(state.theme === name));
      b.onclick = () => {
        state.theme = name; save();
        themes.querySelectorAll(".theme").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      };
      themes.appendChild(b);
    });

    $("#make-images").addEventListener("click", makeImages);
    $("#share-btn").addEventListener("click", shareImages);
    $("#download-btn").addEventListener("click", downloadImages);
    $("#copy-text").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(shareText()); $("#share-note").textContent = "Copied!"; }
      catch (e) { $("#share-note").textContent = "Couldn't copy. Try the WhatsApp button instead."; }
    });
  }

  function shareText() {
    const lines = pickedList().map((p) => `• ${p.office}: ${p.choice}${p.why ? ` (${p.why})` : ""}`);
    const from = state.where.country ? ` from ${state.where.country}` : " from abroad";
    return `My 2026 midterm picks 🗳️ (voting${from})\n\n${lines.join("\n")}\n\nMake your plan${CFG.siteUrl ? `: ${CFG.siteUrl}` : "!"}`;
  }

  async function makeImages() {
    const btn = $("#make-images");
    btn.disabled = true; btn.textContent = "Making…";
    try {
      const layout = document.querySelector('input[name="layout"]:checked').value;
      state.images = await window.Story.render(pickedList(), {
        layout, theme: state.theme, country: state.where.country, siteUrl: CFG.siteUrl,
      });
      const prev = $("#previews");
      prev.innerHTML = "";
      state.images.forEach((c, i) => {
        const img = new Image();
        img.src = c.toDataURL("image/png");
        img.alt = `Story image ${i + 1}`;
        prev.appendChild(img);
      });
      $("#whatsapp-text").href = `https://wa.me/?text=${encodeURIComponent(shareText())}`;
      show("#share-actions");
      const canShareFiles = !!(navigator.canShare && navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] }));
      $("#share-btn").classList.toggle("hidden", !canShareFiles);
      $("#share-note").textContent = canShareFiles
        ? "On your phone, Share opens your apps. Pick Instagram (then Stories) or WhatsApp."
        : "Sharing images straight to apps only works on phones. Save the image here, then post it from your phone.";
    } finally {
      btn.disabled = false; btn.textContent = "Remake my story";
    }
  }

  const toBlob = (c) => new Promise((r) => c.toBlob(r, "image/png"));

  async function shareImages() {
    const files = await Promise.all(state.images.map(async (c, i) =>
      new File([await toBlob(c)], `my-midterm-picks-${i + 1}.png`, { type: "image/png" })));
    try {
      await navigator.share({ files, title: "My 2026 midterm picks" });
    } catch (e) {
      if (e.name !== "AbortError") $("#share-note").textContent = "Sharing didn't work here. Use Save image(s) instead.";
    }
  }

  async function downloadImages() {
    for (let i = 0; i < state.images.length; i++) {
      const url = URL.createObjectURL(await toBlob(state.images[i]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-midterm-picks-${i + 1}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      await new Promise((r) => setTimeout(r, 300)); // browsers block rapid multi-downloads
    }
  }

  // ---------- boot ----------
  load();
  renderCountdown();
  initWhere();
  initShare();
  renderQuiz();
  if (state.where.state) {
    show("#step-register");
    renderRegister();
    loadBallot();
  }
})();
