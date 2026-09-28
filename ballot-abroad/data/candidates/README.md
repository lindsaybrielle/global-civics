# Candidate data

One file per state, named with the two-letter code (`GA.js`), loaded only when a voter picks that state. With no API key, the app shows these races directly. With a key, it attaches these summaries to the live ballot by matching the race type and the candidate's last name.

```js
window.BALLOT_DATA = window.BALLOT_DATA || {};
window.BALLOT_DATA.XX = {
  updated: "Sept 2026",
  atLarge: false,            // true if the state has a single House seat
  races: [
    {
      office: "U.S. House, District 7",
      kind: "usHouse",       // usSenate | usHouse | governor | ltGovernor | secretaryOfState |
                             // attorneyGeneral | stateFinance | stateLegislature | judge |
                             // education | local | lawEnforcement | measure | other
      district: "District 7",
      districtNumber: 7,     // House races only
      localArea: "Los Angeles County", // local races only (hidden in the no-API view)
      competitive: true,     // true if Cook Political Report or Sabato rates it Toss-up or Lean
      rating: "Toss-up",     // that rating, e.g. "Lean R", "Toss-up" (competitive races only)
      candidates: [{
        name, party, incumbent, website,  // website = campaign site only
        background,   // who they are, one or two sentences
        summary,      // where they stand
        inPractice,   // what that would actually change
        abroad,       // only when they've said something relevant to Americans abroad
        stances: { healthcare: 2, taxes: 2, guns: 2 }, // quiz issues, -2..+2 (see data/issues.js)
        sources: [],  // links the summary was written from
        asOf: "Sept 2026",
      }],
    },
    // Ballot measures: { office, kind: "measure", subtitle, text, responses: ["Yes","No"] }
  ],
};
```

Writing rules: neutral wording, no adjectives borrowed from either campaign or its opponents, and every claim traceable to a listed source. Leave `abroad` out rather than guessing.

## Depth

- **Competitive races** (`competitive: true`): full entry with `background`, `summary` (3–4 sentences), `inPractice` and 3+ sources.
- **Non-competitive races**: a shorter entry with `background` (1 sentence), `summary` (2–3 sentences), no `inPractice`, and 1–2 sources.

## Stances (for the values quiz)

For each quiz statement in `data/issues.js`, score how strongly the candidate agrees: +2 strongly agree, +1 lean agree, 0 mixed, -1 lean disagree, -2 strongly disagree. **Only score an issue when there's evidence**: the candidate's own statements, campaign site, voting record, or a questionnaire they answered. Never infer a score from party alone. Leave the key out when unsure. Four or more scored issues per candidate is the goal.
