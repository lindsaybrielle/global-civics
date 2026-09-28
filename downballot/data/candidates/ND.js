// North Dakota: federal and governor races. Rosters come from 270towin.com's race
// data cross-checked against Wikipedia's nominee lists (Wikipedia wins on
// conflicts and adds minor parties). Platforms are researched only for
// competitive races; see data/candidates/README.md.
window.BALLOT_DATA = window.BALLOT_DATA || {};
window.BALLOT_DATA.ND = {
  updated: "Sept 2026",
  atLarge: true,
  races: [
    {
      office: "U.S. House, At-large",
      kind: "usHouse",
      district: "At-large",
      competitive: false,
      candidates: [
        {
          name: "Julie Fedorchak",
          party: "Republican Party",
          incumbent: true,
          background: "Incumbent U.S. Representative for North Dakota, running for re-election.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-house-election/", "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_North_Dakota"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Trygve Hammer",
          party: "Democratic Party",
          incumbent: false,
          background: "Teacher and nominee for this district in 2024.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-house-election/", "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_North_Dakota"],
          asOf: "Sept 2026",
          incomplete: true,
        },
      ],
    },
  ],
};
