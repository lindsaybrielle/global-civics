// Delaware: federal and governor races. Rosters come from 270towin.com's race
// data cross-checked against Wikipedia's nominee lists (Wikipedia wins on
// conflicts and adds minor parties). Platforms are researched only for
// competitive races; see data/candidates/README.md.
window.BALLOT_DATA = window.BALLOT_DATA || {};
window.BALLOT_DATA.DE = {
  updated: "Sept 2026",
  atLarge: true,
  races: [
    {
      office: "U.S. Senate",
      kind: "usSenate",
      district: "Statewide",
      competitive: false,
      candidates: [
        {
          name: "Chris Coons",
          party: "Democratic Party",
          incumbent: true,
          background: "Incumbent U.S. Senator, running for re-election.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-senate-election/", "https://en.wikipedia.org/wiki/2026_United_States_Senate_election_in_Delaware"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Michael Katz",
          party: "Republican Party",
          incumbent: false,
          background: "Former Democratic state senator (2009–2013) and Independent Party nominee for U.S. Senate in 2024.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-senate-election/", "https://en.wikipedia.org/wiki/2026_United_States_Senate_election_in_Delaware"],
          asOf: "Sept 2026",
          incomplete: true,
        },
      ],
    },
    {
      office: "U.S. House, At-large",
      kind: "usHouse",
      district: "At-large",
      competitive: false,
      candidates: [
        {
          name: "Sarah McBride",
          party: "Democratic Party",
          incumbent: true,
          background: "Incumbent U.S. Representative for Delaware, running for re-election.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-house-election/", "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_Delaware"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Joseph Arminio",
          party: "Republican Party",
          incumbent: false,
          background: "Medical doctor.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-house-election/", "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_Delaware"],
          asOf: "Sept 2026",
          incomplete: true,
        },
      ],
    },
  ],
};
