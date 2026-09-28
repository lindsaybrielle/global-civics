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
      candidates: [{
        name, party, incumbent, website,  // website = campaign site only
        background,   // who they are, one or two sentences
        summary,      // where they stand
        inPractice,   // what that would actually change
        abroad,       // only when they've said something relevant to Americans abroad
        sources: [],  // links the summary was written from
        asOf: "Sept 2026",
      }],
    },
    // Ballot measures: { office, kind: "measure", subtitle, text, responses: ["Yes","No"] }
  ],
};
```

Writing rules: neutral wording, no adjectives borrowed from either campaign or its opponents, and every claim traceable to a listed source. Leave `abroad` out rather than guessing.
