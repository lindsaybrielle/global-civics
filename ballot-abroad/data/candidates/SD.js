// South Dakota: federal and governor races. Rosters come from 270towin.com's race
// data cross-checked against Wikipedia's nominee lists (Wikipedia wins on
// conflicts and adds minor parties). Platforms are researched only for
// competitive races; see data/candidates/README.md.
window.BALLOT_DATA = window.BALLOT_DATA || {};
window.BALLOT_DATA.SD = {
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
          name: "Mike Rounds",
          party: "Republican Party",
          incumbent: true,
          background: "Incumbent U.S. Senator, running for re-election.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-senate-election/", "https://en.wikipedia.org/wiki/2026_United_States_Senate_election_in_South_Dakota"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Brian Bengs",
          party: "Independent",
          incumbent: false,
          background: "Independent candidate.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-senate-election/", "https://en.wikipedia.org/wiki/2026_United_States_Senate_election_in_South_Dakota"],
          asOf: "Sept 2026",
          incomplete: true,
        },
      ],
    },
    {
      office: "Governor",
      kind: "governor",
      district: "Statewide",
      competitive: false,
      candidates: [
        {
          name: "Larry Rhoden",
          party: "Republican Party",
          incumbent: true,
          background: "Incumbent governor, running for re-election.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-governor-election/", "https://en.wikipedia.org/wiki/2026_South_Dakota_gubernatorial_election"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Dan Ahlers",
          party: "Democratic Party",
          incumbent: false,
          background: "Executive director of the South Dakota Democratic Party, former state senator (2008–2010), and nominee for U.S. Senate in 2020.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-governor-election/", "https://en.wikipedia.org/wiki/2026_South_Dakota_gubernatorial_election"],
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
          name: "Nikki Gronli",
          party: "Democratic Party",
          incumbent: false,
          background: "Former South Dakota state director for USDA Rural Development (2022–2025) and former vice chair of the South Dakota Democratic Party.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-house-election/", "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_South_Dakota"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Marty Jackley",
          party: "Republican Party",
          incumbent: false,
          background: "South Dakota Attorney General (2009–2019, 2023–present) and candidate for governor in 2018.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-house-election/", "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_South_Dakota"],
          asOf: "Sept 2026",
          incomplete: true,
        },
      ],
    },
  ],
};
