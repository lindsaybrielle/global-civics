// Checks every state data file against the schema and writing rules.
// Usage: node downballot/data/candidates/validate.js
const fs = require("fs");
const path = require("path");
const dir = __dirname;
global.window = {};
eval(fs.readFileSync(path.join(dir, "..", "issues.js"), "utf8"));
const ISSUE_KEYS = window.ISSUES.map((i) => i.key);
const KINDS = ["usSenate", "usHouse", "governor", "ltGovernor", "secretaryOfState", "attorneyGeneral", "stateFinance", "stateLegislature", "judge", "education", "local", "lawEnforcement", "measure", "other"];
const LOADED = /\b(radical|extremis|extreme|maga|far-left|far-right|hard-right|hard-left|socialist|fascis|woke)\w*/i;

let problems = 0, totals = { states: 0, races: 0, candidates: 0, competitive: 0 };
const warn = (f, msg) => { problems++; console.log(`${f}: ${msg}`); };

for (const f of fs.readdirSync(dir).filter((x) => /^[A-Z]{2}\.js$/.test(x)).sort()) {
  const code = f.slice(0, 2);
  window.BALLOT_DATA = {};
  try { eval(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { warn(f, "does not parse: " + e.message); continue; }
  const d = window.BALLOT_DATA[code];
  if (!d) { warn(f, `does not define BALLOT_DATA.${code}`); continue; }
  totals.states++;
  for (const r of d.races || []) {
    totals.races++;
    const where = `${f} ${r.office}`;
    if (!KINDS.includes(r.kind)) warn(where, `unknown kind "${r.kind}"`);
    if (r.kind === "usHouse" && !Number.isInteger(r.districtNumber) && !d.atLarge) warn(where, "House race without districtNumber");
    if (r.competitive) totals.competitive++;
    if (r.kind === "measure") { if (!r.text) warn(where, "measure without text"); continue; }
    if (!r.candidates || !r.candidates.length) { warn(where, "no candidates"); continue; }
    for (const c of r.candidates) {
      totals.candidates++;
      const cw = `${where} / ${c.name}`;
      if (!c.party) warn(cw, "no party");
      if (!c.summary) warn(cw, "no summary");
      if (!c.sources || !c.sources.length) warn(cw, "no sources");
      const major = /democrat|republican/i.test(c.party || "");
      // Competitive races need at least 3 positions; a summary under ~3 sentences can't carry them.
      const sentences = ((c.summary || "") + " " + (c.inPractice || "")).match(/[.!?]["”)]?(\s|$)/g) || [];
      if (r.competitive && major && !c.incomplete && sentences.length < 3) warn(cw, "competitive race but fewer than 3 positions described");
      if (r.competitive && major && !c.incomplete && (!Array.isArray(c.keyPoints) || c.keyPoints.length < 3)) warn(cw, "competitive race but fewer than 3 keyPoints");
      for (const k of c.keyPoints || []) if (k.length > 90) warn(cw, `keyPoint too long (${k.length} chars): ${k}`);
      if (c.incomplete) totals.incomplete = (totals.incomplete || 0) + 1;
      if (c.website && /ballotpedia|wikipedia|\.gov\b|news|times|post/i.test(c.website)) warn(cw, `website is not a campaign site: ${c.website}`);
      for (const [k, v] of Object.entries(c.stances || {})) {
        if (!ISSUE_KEYS.includes(k)) warn(cw, `unknown stance key ${k}`);
        if (![-2, -1, 0, 1, 2].includes(v)) warn(cw, `bad stance value ${k}=${v}`);
      }
      const text = [c.background, c.summary, c.inPractice, c.abroad].join(" ");
      const m = LOADED.exec(text.replace(/"[^"]*"|“[^”]*”/g, "")); // quoted attributions are fine
      if (m) warn(cw, `loaded word "${m[0]}"`);
    }
  }
}
console.log(`\n${totals.states} states, ${totals.races} races (${totals.competitive} competitive), ${totals.candidates} candidates (${totals.incomplete || 0} marked incomplete), ${problems} problem(s)`);
process.exitCode = problems ? 1 : 0;
