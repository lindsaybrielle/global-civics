// Wyoming: federal and governor races. Rosters come from 270towin.com's race
// data cross-checked against Wikipedia's nominee lists (Wikipedia wins on
// conflicts and adds minor parties). Platforms are researched only for
// competitive races; see data/candidates/README.md.
window.BALLOT_DATA = window.BALLOT_DATA || {};
window.BALLOT_DATA.WY = {
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
          name: "James Byrd",
          party: "Democratic Party",
          incumbent: false,
          background: "Former state representative from the 44th district (2009–2019) and nominee for secretary of state in 2018.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-senate-election/", "https://en.wikipedia.org/wiki/2026_United_States_Senate_election_in_Wyoming"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Harriet Hageman",
          party: "Republican Party",
          incumbent: false,
          background: "U.S. representative from Wyoming's at-large congressional district (2023–present) and candidate for governor in 2018.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-senate-election/", "https://en.wikipedia.org/wiki/2026_United_States_Senate_election_in_Wyoming"],
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
          name: "Kenneth Casner",
          party: "Democratic Party",
          incumbent: false,
          background: "Candidate for governor in 2002 and 2018.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-governor-election/", "https://en.wikipedia.org/wiki/2026_Wyoming_gubernatorial_election"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Eric Barlow",
          party: "Republican Party",
          incumbent: false,
          background: "State senator from the 23rd district (2023–present).",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-governor-election/", "https://en.wikipedia.org/wiki/2026_Wyoming_gubernatorial_election"],
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
          name: "Lisa F. Kinney",
          party: "Democratic Party",
          incumbent: false,
          background: "Former minority leader of the Wyoming Senate.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-house-election/", "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_Wyoming"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Chuck Gray",
          party: "Republican Party",
          incumbent: false,
          background: "Wyoming Secretary of State (2023–present) and candidate for this seat in 2022.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://www.270towin.com/2026-house-election/", "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_Wyoming"],
          asOf: "Sept 2026",
          incomplete: true,
        },
      ],
    },
  ],
};
