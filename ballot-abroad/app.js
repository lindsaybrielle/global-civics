(function () {
  const CFG = window.APP_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);
  const STORAGE_KEY = "ballot-abroad-v1";

  const state = {
    where: { state: "", zip: "", city: "", street: "", country: "" },
    status: "",
    ballot: null,       // { contests, demo, admin }
    picks: {},          // contestKey -> { choices: [], why: "" }
    theme: "sunset",
    images: [],         // generated canvases
  };

  // ---------- persistence (per-browser convenience only) ----------
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        where: state.where, status: state.status, picks: state.picks, theme: state.theme,
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
    ["state", "zip", "city", "street", "country"].forEach((k) => { $("#" + k).value = state.where[k] || ""; });

    $("#where-form").addEventListener("submit", (e) => {
      e.preventDefault();
      ["state", "zip", "city", "street", "country"].forEach((k) => { state.where[k] = $("#" + k).value.trim(); });
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

  async function loadBallot() {
    const status = $("#ballot-status");
    show("#step-ballot");

    if (!CFG.civicApiKey) {
      state.ballot = { ...window.DEMO_BALLOT, admin: null };
      status.innerHTML = `<div class="callout"><strong>Demo mode:</strong> these are made-up candidates so you can try the app. To show real ballots, add a free Google Civic API key to <code>config.js</code> (see README).</div>`;
      renderBallot();
      return;
    }

    status.innerHTML = `<p class="hint">Looking up the ballot for ${esc(addressString())}…</p>`;
    $("#ballot").innerHTML = "";
    try {
      const url = new URL("https://www.googleapis.com/civicinfo/v2/voterinfo");
      url.searchParams.set("key", CFG.civicApiKey);
      url.searchParams.set("address", addressString());
      url.searchParams.set("returnAllAvailableData", "true");
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error((data.error && data.error.message) || res.statusText);

      // Keep only contests in the selected state, in case the address resolved elsewhere.
      const contests = (data.contests || []).filter((c) => (c.candidates && c.candidates.length) || c.type === "Referendum");
      const admin = data.state && data.state[0] && data.state[0].electionAdministrationBody;
      const resolvedState = data.normalizedInput && data.normalizedInput.state;
      if (resolvedState && resolvedState.toUpperCase() !== state.where.state) {
        throw new Error(`That address matched ${resolvedState}, not ${state.where.state}. Please check your state and ZIP.`);
      }
      state.ballot = { contests, demo: false, admin };
      const note = state.where.street ? "" : " Without a street address, some local or district races may be missing. Add one in step 1 for your full ballot.";
      status.innerHTML = contests.length
        ? `<p class="hint">${contests.length} races and measures for ${esc(data.election ? data.election.name : "the next election")}.${note}</p>`
        : `<div class="callout">No races found yet for this address. Ballot data sometimes appears only a few weeks before the election.${note} Try the <a href="https://ballotpedia.org/Sample_Ballot_Lookup" target="_blank" rel="noopener">Ballotpedia sample ballot</a> in the meantime.</div>`;
      renderRegister();
      renderBallot();
    } catch (err) {
      state.ballot = null;
      status.innerHTML = `<div class="callout">We couldn't load your ballot: ${esc(err.message)}. Try adding your street address, or look it up on <a href="https://ballotpedia.org/Sample_Ballot_Lookup" target="_blank" rel="noopener">Ballotpedia</a> or <a href="https://www.vote411.org" target="_blank" rel="noopener">Vote411</a>.</div>`;
    }
  }

  function classify(c) {
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

  const contestKey = (c, i) => `${i}:${c.office || c.referendumTitle || "contest"}`;
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
    const vetted = window.CANDIDATE_POSITIONS[(cand.name || "").toLowerCase()];
    const q = encodeURIComponent(cand.name);
    const links = [
      cand.candidateUrl && `<a href="${esc(cand.candidateUrl)}" target="_blank" rel="noopener">Campaign site</a>`,
      `<a href="https://ballotpedia.org/wiki/index.php?search=${q}" target="_blank" rel="noopener">Ballotpedia</a>`,
      `<a href="https://www.vote411.org/ballot" target="_blank" rel="noopener">Vote411 answers</a>`,
      `<a href="https://www.google.com/search?q=${encodeURIComponent(`"${cand.name}" ${stName} 2026 positions`)}" target="_blank" rel="noopener">News search</a>`,
    ].filter(Boolean).join("");
    if (vetted) {
      return `<p><strong>Where they stand:</strong> ${esc(vetted.summary)}</p>
        ${vetted.inPractice ? `<p><strong>In practice:</strong> ${esc(vetted.inPractice)}</p>` : ""}
        ${vetted.abroad ? `<p><strong>For you abroad:</strong> ${esc(vetted.abroad)}</p>` : ""}
        <div class="cand-links">${(vetted.sources || []).map((s, i) => `<a href="${esc(s)}" target="_blank" rel="noopener">Source ${i + 1}</a>`).join("")}${links}</div>`;
    }
    return `<p>We don't have a checked summary for this candidate yet. Their survey answers on Ballotpedia and Vote411 are the most direct way to compare them. Questions worth checking:</p>
      <ul>${window.ABROAD_QUESTIONS.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <div class="cand-links">${links}</div>`;
  }

  function renderBallot() {
    const box = $("#ballot");
    const contests = (state.ballot && state.ballot.contests) || [];
    const stName = stateName(state.where.state);
    const demoTag = state.ballot && state.ballot.demo ? " (demo)" : "";

    box.innerHTML = contests.map((c, i) => {
      const key = contestKey(c, i);
      const kind = classify(c);
      const guide = window.OFFICE_GUIDE[kind];
      const pick = state.picks[key] || { choices: [], why: "" };
      const max = parseInt(c.numberVotingFor, 10) || 1;
      const isMeasure = kind === "measure";
      const options = isMeasure
        ? (c.referendumBallotResponses || ["Yes", "No"]).map((r) => ({ name: r }))
        : c.candidates;

      const opts = options.map((cand, j) => {
        const checked = pick.choices.includes(cand.name);
        const id = `c${i}-${j}`;
        return `<div class="cand ${checked ? "picked" : ""}">
          <label class="cand-top" for="${id}">
            <input type="checkbox" id="${id}" data-key="${esc(key)}" data-name="${esc(cand.name)}" data-max="${max}" ${checked ? "checked" : ""}>
            <span><span class="cand-name">${esc(cand.name)}</span>
            ${cand.party ? `<br><span class="party"><span class="party-dot" style="background:${partyColor(cand.party)}"></span>${esc(cand.party)}</span>` : ""}</span>
          </label>
          ${isMeasure ? "" : `<details class="more"><summary class="fine">Positions and what they mean</summary>${candidateMore(cand, stName)}</details>`}
        </div>`;
      }).join("");

      return `<div class="contest" data-key="${esc(key)}">
        <div class="contest-head">
          <span class="tag">${esc(guide.label)}${demoTag}</span>
          <span class="district">${esc(c.district && c.district.name)}</span>
        </div>
        <h3>${esc(contestTitle(c))}</h3>
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
    const contests = (state.ballot && state.ballot.contests) || [];
    return contests.map((c, i) => {
      const p = state.picks[contestKey(c, i)];
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
  if (state.where.state && state.where.zip) {
    show("#step-register");
    renderRegister();
    loadBallot();
  }
})();
