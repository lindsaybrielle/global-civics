(function () {
  const CFG = window.APP_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const STORAGE_KEY = "downballot-v1";
  const OLD_STORAGE_KEY = "ballot-abroad-v1";

  const state = {
    where: { zip: "", state: "", district: "", districts: [], country: "", aiAddress: "" },
    status: "",
    ballot: null,       // { contests }
    picks: {},          // contestKey -> { choices: [], why: "" }
    theme: "sunset",
    quiz: {},           // issue key -> -2..2
    weights: {},        // issue key -> true if it matters most
    copied: false,      // copied the AI prompt at least once
    images: [],         // generated canvases
  };

  // ---------- persistence (per-browser convenience only) ----------
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        where: state.where, status: state.status, picks: state.picks, theme: state.theme,
        quiz: state.quiz, weights: state.weights, copied: state.copied,
      }));
    } catch (e) { /* storage unavailable: app still works */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      Object.assign(state, saved);
      state.where = Object.assign({ zip: "", state: "", district: "", districts: [], country: "", aiAddress: "" }, saved.where);
    } catch (e) { /* ignore */ }
  }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const stateName = (code) => (window.STATES.find(([c]) => c === code) || [code, code])[1];
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const ext = (href, text) => `<a href="${esc(href)}" target="_blank" rel="noopener">${text}</a>`;

  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  // ---------- countdown ----------
  function renderCountdown() {
    const election = new Date(CFG.electionDate + "T12:00:00");
    const days = Math.ceil((election - new Date()) / 86400000);
    $("#countdown").textContent = days > 0
      ? `${days} day${days === 1 ? "" : "s"} until Election Day, Nov 3`
      : "Election Day was Nov 3, 2026";
  }

  // ---------- ZIP -> state and 2026 House district ----------
  // data/zip/<first digit>.js maps each ZIP to "ST<district>" codes, largest
  // overlap first (at-large seats are 0), plus a 3-digit-prefix -> state fallback.
  async function lookupZip(zip) {
    window.ZIPS = window.ZIPS || {};
    if (!window.ZIPS[zip] && !(window.ZIP3 && window.ZIP3[zip.slice(0, 3)])) await loadScript(`data/zip/${zip[0]}.js`);
    const hit = (window.ZIPS || {})[zip];
    if (hit) {
      const codes = hit.split(" ");
      const st = codes[0].slice(0, 2);
      return { state: st, districts: codes.filter((c) => c.startsWith(st)).map((c) => +c.slice(2)) };
    }
    const guess = (window.ZIP3 || {})[zip.slice(0, 3)];
    return guess ? { state: guess, districts: [] } : null;
  }

  function initZip() {
    $("#zip").value = state.where.zip || "";
    $("#zip-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const zip = $("#zip").value.trim();
      if (!/^\d{5}$/.test(zip)) { zipMessage(`<p class="notice">Enter a 5-digit ZIP code.</p>`); return; }
      const found = await lookupZip(zip);
      if (!found) {
        zipMessage(`<p class="notice">We couldn't find ZIP ${esc(zip)}. Check it, or choose your state:</p>${statePicker()}`);
        return;
      }
      setWhere({ zip, state: found.state, districts: found.districts, district: found.districts[0] ?? "" });
    });
    $("#zip-result").addEventListener("change", (e) => {
      if (e.target.id === "state-pick" && e.target.value) setWhere({ zip: "", state: e.target.value, districts: [], district: "" });
    });
    // District switch buttons appear in the hero and above the ballot.
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-district]");
      if (!b) return;
      state.where.district = +b.dataset.district;
      save();
      renderZipResult();
      loadBallot();
    });
  }

  function statePicker() {
    return `<select id="state-pick" aria-label="Your voting state"><option value="">Choose your state</option>${
      window.STATES.map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join("")}</select>`;
  }

  function zipMessage(html) { $("#zip-result").innerHTML = html; }

  function setWhere(w) {
    Object.assign(state.where, w);
    save();
    renderZipResult();
    startSteps();
    $("#register").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function districtLabel() {
    const w = state.where;
    const data = state.stateData;
    if (w.district === 0 || (data && data.atLarge)) return stateName(w.state) === "District of Columbia" ? "Washington, DC" : `${stateName(w.state)} (one statewide House seat)`;
    return w.district !== "" && w.district != null ? `${stateName(w.state)}, District ${w.district}` : stateName(w.state);
  }

  // One line under the ZIP box, plus a switch when a ZIP crosses district lines.
  function districtSwitch() {
    const w = state.where;
    const others = (w.districts || []).filter((d) => d !== w.district && d !== 0);
    if (!others.length) return "";
    return `<p class="switch">Your ZIP crosses into ${others.length === 1 ? "another district" : "other districts"}. Not in District ${w.district}?
      ${others.map((d) => `<button type="button" class="link-btn" data-district="${d}">Switch to District ${d}</button>`).join(" ")}
      ${ext("https://www.house.gov/representatives/find-your-representative", "Check your address")}</p>`;
  }

  function renderZipResult() {
    const w = state.where;
    if (!w.state) { zipMessage(""); return; }
    if (!(window.DEADLINES || {})[w.state] && !window.STATES.find(([c]) => c === w.state)) {
      zipMessage(`<p class="notice">Downballot covers the 50 states and DC. For US territories, see ${ext("https://www.fvap.gov", "FVAP.gov")}.</p>`);
      return;
    }
    const noDistrict = !w.districts || !w.districts.length;
    zipMessage(`<p class="where-line">📍 Showing the ballot for <strong>${esc(districtLabel())}</strong></p>
      ${noDistrict && w.state !== "DC" ? `<p class="fine">We couldn't match ${w.zip ? "that ZIP" : "your ZIP"} to a House district, so your House race isn't shown. ${ext("https://www.house.gov/representatives/find-your-representative", "Find your district")}</p>` : ""}
      ${districtSwitch()}`);
  }

  function startSteps() {
    $("#steps").classList.remove("hidden");
    renderRegister();
    renderRequest();
    loadBallot();
    renderPrompt();
    updateProgress();
  }

  // ---------- step 1: register ----------
  // FVAP lists several methods or voter groups in one cell. Break them onto lines,
  // keep each group label with its date, and hide military-only rows (this app is
  // for civilians abroad; military voters are pointed to FVAP).
  function splitDates(s) {
    const parts = String(s || "").split(/\s(?=(?:By |Return by |Request |Within the U\.S\.|Outside the U\.S\.|Uniformed Services|Overseas Citizens|All other UOCAVA))/).map((x) => x.trim()).filter(Boolean);
    const lines = [];
    for (let i = 0; i < parts.length; i++) {
      const label = !/\d|Not Required|No Deadline|Not Permitted/.test(parts[i]) && i + 1 < parts.length;
      if (label) { parts[i + 1] = `${parts[i]} · ${parts[i + 1]}`; continue; }
      lines.push(parts[i]);
    }
    lines.forEach((l, i) => { lines[i] = l.replace(/\*+/g, ""); }); // FVAP footnote markers
    const civilian = lines.filter((l) => !/^Uniformed Services/.test(l));
    return civilian.length ? civilian : lines;
  }

  const deadlines = () => (window.DEADLINES || {})[state.where.state];
  const fvapUrl = () => `https://www.fvap.gov/guide/chapter2/${slug(stateName(state.where.state))}`;

  function dateCard(label, val) {
    return `<div class="date-card"><span class="date-label">${label}</span>${splitDates(val).map((x) => `<span class="date-val">${esc(x)}</span>`).join("")}</div>`;
  }

  const FPCA_BTN = `<a class="btn primary" href="https://www.fvap.gov/fpca" target="_blank" rel="noopener">Fill out the FPCA on FVAP.gov</a>`;

  function renderRegister() {
    $$("#register .chip").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.status === state.status));
      b.onclick = () => { state.status = b.dataset.status; save(); renderRegister(); renderRequest(); updateProgress(); };
    });
    const box = $("#register-body");
    const d = deadlines();
    const regDate = d ? `<div class="dates">${dateCard("Register by", d.register)}</div>` : "";
    if (state.status === "done") {
      box.innerHTML = `<p class="good">You're registered and your ballot is on its way. ${`<a href="#request">Check your return deadline</a>`}.</p>`;
    } else if (state.status === "registered") {
      box.innerHTML = `<p>You still need to ask for a 2026 ballot. Overseas voters send a new request, called the <strong>FPCA</strong>, every calendar year. It's one free form.</p>
        <div class="actions">${FPCA_BTN}</div>`;
    } else if (state.status === "no") {
      box.innerHTML = `<p>You can register and ask for your ballot with one free form, the <strong>FPCA</strong>. It's late in the season, so do it today.</p>
        ${regDate}
        <div class="actions">${FPCA_BTN}</div>
        <p class="fine">Not sure if you're registered? Send the FPCA anyway. It updates your registration if you already have one.</p>`;
    } else {
      box.innerHTML = "";
    }
  }

  // ---------- step 2: get your ballot ----------
  function renderRequest() {
    const d = deadlines();
    const st = stateName(state.where.state);
    const box = $("#request-body");
    const dates = d ? `<div class="dates">${dateCard("Ask for your ballot by", d.request)}${dateCard("Return it by", d.ret)}</div>
      <p class="fine"><strong>Received by</strong> means it has to arrive by then. <strong>Postmarked</strong> or <strong>sent by</strong> means it has to be sent by then.${d.runoff ? " Where you see two dates, the second is for the Dec. 1 runoff." : ""}</p>` : "";
    const steps = state.status === "done"
      ? [["Watch your inbox", "States had to send overseas ballots by Sept 19. Check your email, including spam. Nothing yet? Contact your local election office."],
         ["Vote and send it back", `Before your return deadline. ${ext(fvapUrl(), `${esc(st)}'s rules on FVAP`)} say whether you can return it by email or fax.`]]
      : [["Send your FPCA", `Many states take it by email or fax, and some only by mail. ${ext(fvapUrl(), `See how ${esc(st)} takes it`)}.`],
         ["Watch your inbox", "Your ballot usually arrives by email. Check spam too."],
         ["Vote and send it back", "Before your return deadline."]];
    box.innerHTML = `${dates}
      <ol class="steps-list">${steps.map(([t, p]) => `<li><strong>${t}</strong><span>${p}</span></li>`).join("")}</ol>
      <details class="quiet"><summary>Ballot hasn't arrived and time is short?</summary>
        <p>Use the backup ballot, the ${ext("https://www.fvap.gov/fwab", "Federal Write-In Absentee Ballot (FWAB)")}. You can vote with it right away. If your real ballot shows up later, send that too. Only one will count.</p></details>
      ${d && d.notes ? `<details class="quiet"><summary>Fine print for ${esc(st)}</summary><p class="fine">${esc(d.notes)}</p></details>` : ""}
      ${d ? `<p class="fine">Deadlines for civilians abroad from ${ext(d.fvap, `FVAP's ${esc(st)} page`)}, checked ${esc(window.DEADLINES_ASOF || "")}. Military voters: see FVAP.</p>` : ""}`;
  }

  // ---------- step 3: who's running ----------
  function loadStateData(code) {
    window.BALLOT_DATA = window.BALLOT_DATA || {};
    if (window.BALLOT_DATA[code]) return Promise.resolve(window.BALLOT_DATA[code]);
    return loadScript(`data/candidates/${code}.js`).then(() => window.BALLOT_DATA[code] || null);
  }

  // Researched races for this voter: everything statewide plus their own House seat.
  function staticContests(data) {
    const district = parseInt(state.where.district, 10);
    const order = ["usSenate", "usHouse", "governor", "ltGovernor", "attorneyGeneral", "secretaryOfState", "stateFinance", "education", "judge", "local", "other", "measure"];
    const rank = (k) => (order.indexOf(k) + 1) || order.length;
    return (data.races || []).slice().sort((a, b) => rank(a.kind) - rank(b.kind)).filter((r) => {
      if (r.kind === "usHouse") return data.atLarge || (Number.isInteger(district) && r.districtNumber === district);
      return !r.localArea;
    }).map((r) => r.kind === "measure"
      ? { kind: "measure", referendumTitle: r.office, referendumSubtitle: r.subtitle, referendumText: r.text, referendumBallotResponses: r.responses || ["Yes", "No"], district: { name: r.district || "Statewide" } }
      : { office: r.office, kind: r.kind, district: { name: r.district || "Statewide" }, numberVotingFor: r.numberVotingFor,
          competitive: r.competitive, rating: r.rating, note: r.note,
          candidates: r.candidates.map((c) => ({ name: c.name, party: c.party, candidateUrl: c.website, info: c })) });
  }

  async function loadBallot() {
    const status = $("#ballot-status");
    status.innerHTML = `<p class="hint">Loading…</p>`;
    $("#ballot").innerHTML = "";
    const code = state.where.state;
    const data = await loadStateData(code);
    if (code !== state.where.state) return; // a newer lookup started
    state.stateData = data;
    renderZipResult();
    if (!data) {
      state.ballot = { contests: [] };
      status.innerHTML = `<p class="notice">We don't have ${esc(stateName(code))}'s races yet. Use the AI prompt in step 4, or ${ext("https://ballotpedia.org/Sample_Ballot_Lookup", "Ballotpedia's sample ballot")}.</p>`;
    } else {
      state.ballot = { contests: staticContests(data) };
      status.innerHTML = `<p class="hint">Everyone running for Congress${data.races.some((r) => r.kind === "governor") ? " and governor" : ""} in <strong>${esc(districtLabel())}</strong>. Tick your picks to build your share image.</p>
        <p class="legend"><span class="hot">🔥 Close race</span> Forecasters expect these to be competitive, so we've summarized where each candidate stands.</p>
        ${districtSwitch()}`;
    }
    renderBallot();
    renderQuizSummary();
  }

  // Keyed by office and district, so switching districts never carries a pick across.
  const contestKey = (c) => `${c.office || c.referendumTitle || "contest"}|${(c.district && c.district.name) || ""}`;
  const contestTitle = (c) => c.office || c.referendumTitle || "Ballot measure";

  function partyColor(p) {
    const s = (p || "").toLowerCase();
    if (s.includes("democrat")) return "#3b6fd8";
    if (s.includes("republican")) return "#d84a3b";
    if (s.includes("green")) return "#3c9a5f";
    if (s.includes("libertarian")) return "#e0a526";
    return "#9a9aad";
  }
  const shortParty = (p) => String(p || "").replace(/ Party$/, "");

  // Three short "Topic: position" bullets, shown for competitive races.
  function keyPointsHtml(info) {
    if (!info || !info.keyPoints || !info.keyPoints.length) return "";
    return `<ul class="kp">${info.keyPoints.map((k) => {
      const i = k.indexOf(": ");
      return i > 0 ? `<li><strong>${esc(k.slice(0, i))}:</strong> ${esc(k.slice(i + 2))}</li>` : `<li>${esc(k)}</li>`;
    }).join("")}</ul>`;
  }

  function candidateMore(cand, stName) {
    const info = cand.info || {};
    const q = encodeURIComponent(cand.name);
    const links = [
      cand.candidateUrl && ext(cand.candidateUrl, "Campaign site"),
      ext(`https://ballotpedia.org/wiki/index.php?search=${q}`, "Ballotpedia"),
      ext(`https://www.google.com/search?q=${encodeURIComponent(`"${cand.name}" ${stName} 2026 positions`)}`, "News search"),
    ].filter(Boolean);
    const who = info.background ? `<p><strong>Who they are:</strong> ${esc(info.background)}</p>` : "";
    if (!info.summary || info.incomplete) return `${who}<div class="cand-links">${links.join("")}</div>`;
    return `${who}
      <p><strong>Where they stand:</strong> ${esc(info.summary)}</p>
      ${info.inPractice ? `<p><strong>In practice:</strong> ${esc(info.inPractice)}</p>` : ""}
      ${info.abroad ? `<p><strong>For you abroad:</strong> ${esc(info.abroad)}</p>` : ""}
      <div class="cand-links">${(info.sources || []).map((s, i) => ext(s, `Source ${i + 1}`)).join("")}${links.join("")}</div>
      <p class="fine">From campaign sites and news coverage${info.asOf ? `, as of ${esc(info.asOf)}` : ""}.</p>`;
  }

  function renderBallot() {
    const box = $("#ballot");
    const contests = (state.ballot && state.ballot.contests) || [];
    const stName = stateName(state.where.state);

    box.innerHTML = contests.map((c, i) => {
      const key = contestKey(c);
      const kind = c.kind;
      const guide = window.OFFICE_GUIDE[kind] || window.OFFICE_GUIDE.other;
      const pick = state.picks[key] || { choices: [], why: "" };
      const max = parseInt(c.numberVotingFor, 10) || 1;
      const isMeasure = kind === "measure";
      const options = isMeasure ? c.referendumBallotResponses.map((r) => ({ name: r })) : c.candidates;
      const matches = isMeasure || quizAnswered() < 3 ? [] : options.map((cand) => matchScore(cand.info && cand.info.stances));
      // Only highlight a "top" match when there's someone to compare against.
      const bestPct = matches.filter(Boolean).length >= 2 ? Math.max(...matches.filter(Boolean).map((m) => m.pct)) : -1;

      const opts = options.map((cand, j) => {
        const checked = pick.choices.includes(cand.name);
        const id = `c${i}-${j}`;
        const m = matches[j];
        return `<div class="cand ${checked ? "picked" : ""}">
          <label class="cand-top" for="${id}">
            <input type="checkbox" id="${id}" data-key="${esc(key)}" data-name="${esc(cand.name)}" data-max="${max}" ${checked ? "checked" : ""}>
            <span class="cand-id">
              <span class="cand-name">${esc(cand.name)}</span>
              ${cand.party ? `<span class="party"><span class="party-dot" style="background:${partyColor(cand.party)}"></span>${esc(shortParty(cand.party))}${cand.info && cand.info.incumbent ? " · incumbent" : ""}</span>` : ""}
            </span>
            ${m ? `<span class="match ${m.pct === bestPct ? "top" : ""}">${m.pct}% match</span>` : ""}
          </label>
          ${m ? `<p class="match-why">Compared on ${m.compared} issue${m.compared === 1 ? "" : "s"}.${m.agree.length ? ` You agree on ${esc(m.agree.join(", "))}.` : ""}${m.differ.length ? ` You differ on ${esc(m.differ.join(", "))}.` : ""}</p>` : ""}
          ${isMeasure ? "" : keyPointsHtml(cand.info)}
          ${isMeasure ? "" : `<details class="more"><summary>Read more about this candidate</summary>${candidateMore(cand, stName)}</details>`}
        </div>`;
      }).join("");

      return `<article class="contest" data-key="${esc(key)}">
        <div class="contest-head">
          <span class="tag">${esc(guide.label)}</span>
          ${c.competitive ? `<span class="hot" title="Rated ${esc(c.rating || "competitive")} by nonpartisan forecasters">🔥 Close race</span>` : ""}
        </div>
        <h3>${esc(contestTitle(c))}</h3>
        ${c.note ? `<p class="fine">${esc(c.note)}</p>` : ""}
        ${isMeasure && c.referendumSubtitle ? `<p class="measure-text">${esc(c.referendumSubtitle)}</p>` : ""}
        ${isMeasure && c.referendumText ? `<details class="quiet"><summary>Full text</summary><p>${esc(c.referendumText)}</p></details>` : ""}
        ${max > 1 ? `<p class="fine">Pick up to ${max}.</p>` : ""}
        ${opts}
        <details class="quiet small"><summary>What does this ${isMeasure ? "measure mean" : "office do"}?</summary>
          <p>${esc(guide.does)}</p>${guide.abroad ? `<p><strong>From abroad:</strong> ${esc(guide.abroad)}</p>` : ""}</details>
        <label class="why ${pick.choices.length ? "" : "hidden"}">Why this pick? <span class="opt">optional, goes on your image</span>
          <input data-why="${esc(key)}" maxlength="160" value="${esc(pick.why)}" placeholder="e.g. Wants to make it easier to vote from abroad">
        </label>
      </article>`;
    }).join("");

    box.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.addEventListener("change", onPick));
    box.querySelectorAll("input[data-why]").forEach((el) => el.addEventListener("input", () => {
      const k = el.dataset.why;
      state.picks[k] = state.picks[k] || { choices: [], why: "" };
      state.picks[k].why = el.value;
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
    contestEl.querySelector(".why").classList.toggle("hidden", !pick.choices.length);
    save();
    updateShareVisibility();
    updateProgress();
  }

  // ---------- step 4: AI prompt for the full, address-specific ballot ----------
  function aiPromptText() {
    const w = state.where;
    const st = stateName(w.state) || "[your state]";
    const addr = (w.aiAddress || "").trim() || (w.zip ? `[your street address], ${w.state} ${w.zip}` : `[your full US voting address in ${st}]`);
    return `I'm a US citizen living abroad and voting absentee in the November 3, 2026 midterm election. My US voting address is: ${addr}.

Please explain everything on my ballot in plain, everyday language, as if to a friend who doesn't follow politics:

1. List every race and ballot measure on my ballot at this address: federal, state, county, city, school board and judges. Use my official sample ballot or my state or county election office where you can, and tell me which source you used.
2. For each race, explain in one or two sentences what the job does and how it could affect my life.
3. For each candidate, give their party and a short, neutral summary of where they stand on 3 or 4 issues voters care about most (such as cost of living, health care, immigration, abortion, or whatever is biggest in that race). Link to where each position comes from. Don't tell me who to vote for.
4. For each ballot measure, explain what a YES vote does and what a NO vote does.
5. Remind me of ${st}'s deadlines for overseas voters: registering, requesting my ballot, and returning it, including whether I can return it by email or fax.

If you're not sure about something, say so instead of guessing.`;
  }

  function renderPrompt() {
    const input = $("#ai-address");
    if (document.activeElement !== input) input.value = state.where.aiAddress || "";
    $("#ai-prompt").value = aiPromptText();
  }

  function initPrompt() {
    $("#ai-address").addEventListener("input", (e) => { state.where.aiAddress = e.target.value; save(); $("#ai-prompt").value = aiPromptText(); });
    $("#copy-prompt").addEventListener("click", async () => {
      const note = $("#copy-prompt-note");
      try { await navigator.clipboard.writeText(aiPromptText()); note.textContent = "Copied. Paste it into your AI assistant."; }
      catch (e) { $("#ai-prompt").select(); note.textContent = "Select the text above and copy it."; }
      state.copied = true; save(); updateProgress();
    });
  }

  // ---------- values quiz (floating button + drawer) ----------
  const SCALE = [[-2, "Strongly disagree"], [-1, "Disagree"], [0, "Not sure"], [1, "Agree"], [2, "Strongly agree"]];

  function renderQuiz() {
    $("#quiz").innerHTML = window.ISSUES.map((q, n) => `<div class="q" data-issue="${q.key}">
      <div class="q-topic">${n + 1} of ${window.ISSUES.length} · ${esc(q.topic)}</div>
      <p class="q-text">${esc(q.statement)}</p>
      <div class="scale">${SCALE.map(([v, label]) =>
        `<button type="button" data-v="${v}" aria-pressed="${state.quiz[q.key] === v}">${label}</button>`).join("")}</div>
      <button type="button" class="star" aria-pressed="${!!state.weights[q.key]}">${state.weights[q.key] ? "★ Matters most to me" : "☆ Matters most to me"}</button>
    </div>`).join("");
    $("#quiz").querySelectorAll(".q").forEach((el) => {
      const key = el.dataset.issue;
      el.querySelectorAll(".scale button").forEach((b) => b.onclick = () => {
        const v = +b.dataset.v;
        if (state.quiz[key] === v) delete state.quiz[key]; else state.quiz[key] = v;
        afterQuizChange(el);
      });
      el.querySelector(".star").onclick = () => { state.weights[key] = !state.weights[key]; afterQuizChange(el); };
    });
    const n = quizAnswered();
    $("#quiz-count").textContent = n < 3 ? `Answer ${3 - n} more to see matches` : `${n} answered`;
    $("#quiz-fab").classList.toggle("has-answers", n >= 3);
  }

  function afterQuizChange(el) {
    save();
    const key = el && el.dataset.issue;
    renderQuiz();
    // Keep the answered question in view after re-render.
    if (key) { const again = $(`.q[data-issue="${key}"]`); if (again) again.querySelector(".scale button[aria-pressed='true']")?.focus({ preventScroll: true }); }
    renderBallot();
    renderQuizSummary();
  }

  function openQuiz() {
    $("#quiz-drawer").classList.remove("hidden");
    document.body.classList.add("no-scroll");
    $(".drawer-close").focus();
  }
  function closeQuiz() {
    $("#quiz-drawer").classList.add("hidden");
    document.body.classList.remove("no-scroll");
    $("#quiz-fab").focus({ preventScroll: true });
  }

  function initQuiz() {
    renderQuiz();
    $("#quiz-fab").addEventListener("click", openQuiz);
    $$("#quiz-drawer [data-close]").forEach((el) => el.addEventListener("click", closeQuiz));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#quiz-drawer").classList.contains("hidden")) closeQuiz(); });
    $("#quiz-done").addEventListener("click", () => {
      closeQuiz();
      if (state.where.state) $("#running").scrollIntoView({ behavior: "smooth", block: "start" });
      else { $("#zip").focus(); zipMessage(`<p class="notice">Enter your ZIP code to see your matches.</p>`); }
    });
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
    if (quizAnswered() < 3) { box.innerHTML = ""; return; }
    const contests = (state.ballot && state.ballot.contests) || [];
    const rows = contests.filter((c) => c.candidates).map((c) => {
      const scored = c.candidates.map((cand) => ({ cand, m: matchScore(cand.info && cand.info.stances) })).filter((x) => x.m);
      if (scored.length < 2) return "";
      scored.sort((a, b) => b.m.pct - a.m.pct);
      return `<li><span>${esc(c.office)}</span> <strong>${esc(scored[0].cand.name)}</strong> <span class="match top">${scored[0].m.pct}%</span></li>`;
    }).filter(Boolean);
    box.innerHTML = `<div class="matches"><p class="kicker">🧭 Your closest matches</p>${rows.length
      ? `<ul class="summary-list">${rows.join("")}</ul>`
      : `<p class="fine">We don't have enough recorded positions for the candidates on your ballot to compare them yet. Matches work best in close races.</p>`}</div>`;
  }

  // ---------- step 5: share ----------
  function pickedList() {
    const contests = (state.ballot && state.ballot.contests) || [];
    return contests.map((c) => {
      const p = state.picks[contestKey(c)];
      if (!p || !p.choices.length) return null;
      return {
        office: contestTitle(c),
        choice: c.kind === "measure" ? `${p.choices[0]} on this measure` : p.choices.join(" & "),
        why: (p.why || "").trim(),
      };
    }).filter(Boolean);
  }

  function updateShareVisibility() {
    const n = pickedList().length;
    $("#share-empty").classList.toggle("hidden", n > 0);
    $("#share-body").classList.toggle("hidden", n === 0);
  }

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
    $("#country").value = state.where.country || "";
    $("#country").addEventListener("input", (e) => { state.where.country = e.target.value.trim(); save(); });

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
      $("#share-actions").classList.remove("hidden");
      const canShareFiles = !!(navigator.canShare && navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] }));
      $("#share-btn").classList.toggle("hidden", !canShareFiles);
      $("#share-note").textContent = canShareFiles
        ? "On your phone, Share opens your apps. Pick Instagram (then Stories) or WhatsApp."
        : "Sharing images straight to apps works on phones. Here, save the image and post it from your phone.";
      updateProgress();
    } finally {
      btn.disabled = false; btn.textContent = "Remake my image";
    }
  }

  const toBlob = (c) => new Promise((r) => c.toBlob(r, "image/png"));

  async function shareImages() {
    const files = await Promise.all(state.images.map(async (c, i) =>
      new File([await toBlob(c)], `my-midterm-picks-${i + 1}.png`, { type: "image/png" })));
    try {
      await navigator.share({ files, title: "My 2026 midterm picks" });
    } catch (e) {
      if (e.name !== "AbortError") $("#share-note").textContent = "Sharing didn't work here. Use Save image instead.";
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

  // ---------- sticky progress bar ----------
  const STEP_IDS = ["register", "request", "running", "learn", "share"];

  function stepDone(id) {
    if (id === "register") return state.status === "done" || state.status === "registered";
    if (id === "request") return state.status === "done";
    if (id === "running") return pickedList().length > 0;
    if (id === "learn") return state.copied;
    if (id === "share") return state.images.length > 0;
    return false;
  }

  function activeStep() {
    if ($("#steps").classList.contains("hidden")) return -1;
    const line = window.innerHeight * 0.35;
    let idx = -1;
    STEP_IDS.forEach((id, i) => { if (document.getElementById(id).getBoundingClientRect().top <= line) idx = i; });
    // At the very bottom, the last short section may never reach the line.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) idx = STEP_IDS.length - 1;
    return idx;
  }

  function updateProgress() {
    const active = activeStep();
    $$("#progress-steps li").forEach((li, i) => {
      li.classList.toggle("active", i === active);
      li.classList.toggle("done", stepDone(STEP_IDS[i]));
      li.querySelector(".dot").textContent = stepDone(STEP_IDS[i]) && i !== active ? "✓" : String(i + 1);
    });
    $("#progress-fill").style.width = `${active < 0 ? 0 : ((active + 1) / STEP_IDS.length) * 100}%`;
  }

  function initProgress() {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateProgress(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", updateProgress);
    $$("#progress-steps a").forEach((a) => a.addEventListener("click", (e) => {
      if (!$("#steps").classList.contains("hidden")) return;
      e.preventDefault();
      $("#zip").focus();
      zipMessage(`<p class="notice">Start with your ZIP code.</p>`);
    }));
  }

  // ---------- boot ----------
  load();
  renderCountdown();
  initZip();
  initShare();
  initPrompt();
  initQuiz();
  initProgress();
  if (state.where.state) { renderZipResult(); startSteps(); }
  updateProgress();
})();
