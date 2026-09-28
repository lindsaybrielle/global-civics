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
        incomplete: true, // optional: platform not yet researched; the app says so
      }],
    },
    // Ballot measures: { office, kind: "measure", subtitle, text, responses: ["Yes","No"] }
  ],
};
```

Writing rules: neutral wording, no adjectives borrowed from either campaign or its opponents, and every claim traceable to a listed source. Leave `abroad` out rather than guessing.

## Depth

The stored data is deliberately light. The full deep dive happens on request (see below).

- **Every federal race and every governor race**: list everyone on the ballot, including name, party, incumbent flag and a one-line `background` where known. Candidates who haven't been researched get `summary: "Platform not yet researched for this guide."`, `incomplete: true`, and the official candidate list (or its closest substitute) as the source.
- **Competitive races** (`competitive: true`, meaning Cook or Sabato rates it Toss-up or Lean): each Democratic and Republican candidate gets a `summary` covering **at least 3 positions voters care most about**: cost of living and taxes, health care, immigration, abortion, tariffs and trade, and so on. Add the matching `stances` scores where there's evidence, plus 2–3 sources. `inPractice` is optional.
- **Everything else** (down-ballot statewide offices, courts, measures, and platforms in safe seats) is optional in the stored data. Earlier files go further; that's fine, but don't expand them now.

### On-demand deep dive

When someone asks for "the full voter guide for my ZIP code or address," research that ballot live instead of pre-storing it for every state. Look up their districts (congressional, state legislative, county), list every race on their ballot from the official sample ballot or the state's candidate list, and write full entries (background, summary, `inPractice`, stances, 3+ sources) for those races only. Add the results to the state file so the next person with the same ballot benefits.

### Roster sources that work

- **270towin.com** (`/2026-house-election/`, `/2026-senate-election/`, `/2026-governor-election/`) embeds JSON with every Democratic and Republican nominee and incumbent flags. It has occasional typos and few minor-party candidates, so cross-check it.
- **Wikipedia's raw wikitext** (`index.php?title=<page>&action=raw`) for each state's House, Senate and governor pages lists nominees, including minor parties, under "Nominee" headings.
- **Official state lists** where they can be downloaded, such as the NC State Board PDF, MI Dept. of State listing and TX SOS ballot certification.

## Stances (for the values quiz)

For each quiz statement in `data/issues.js`, score how strongly the candidate agrees: +2 strongly agree, +1 lean agree, 0 mixed, -1 lean disagree, -2 strongly disagree. **Only score an issue when there's evidence**: the candidate's own statements, campaign site, voting record, or a questionnaire they answered. Never infer a score from party alone. Leave the key out when unsure. Four or more scored issues per candidate is the goal.
