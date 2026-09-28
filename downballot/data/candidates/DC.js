// District of Columbia: the delegate to the U.S. House (non-voting) and the
// open mayor's race. Nominees from Wikipedia's primary results; see
// data/candidates/README.md. Neither race is rated competitive.
window.BALLOT_DATA = window.BALLOT_DATA || {};
window.BALLOT_DATA.DC = {
  updated: "Sept 2026",
  atLarge: true,
  races: [
    {
      office: "U.S. House Delegate",
      kind: "usHouse",
      district: "At-large",
      competitive: false,
      note: "DC elects one delegate to the U.S. House, who can speak and serve on committees but cannot vote on final passage of bills. Open seat: Del. Eleanor Holmes Norton is not seeking re-election.",
      candidates: [
        {
          name: "Robert White",
          party: "Democratic Party",
          incumbent: false,
          background: "At-large DC councilmember since 2016; ran for mayor in 2022.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_the_District_of_Columbia"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Denise Rosado",
          party: "Republican Party",
          incumbent: false,
          background: "Attorney.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_the_District_of_Columbia"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Kymone Freeman",
          party: "DC Statehood Green Party",
          incumbent: false,
          background: "Radio host and the Statehood Green nominee for this seat in 2024.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_election_in_the_District_of_Columbia"],
          asOf: "Sept 2026",
          incomplete: true,
        },
      ],
    },
    {
      office: "Mayor",
      kind: "other",
      district: "Citywide",
      competitive: false,
      note: "Open seat: Mayor Muriel Bowser is not running for a fourth term. DC's mayor also carries many duties a governor has in a state.",
      candidates: [
        {
          name: "Janeese Lewis George",
          party: "Democratic Party",
          incumbent: false,
          background: "DC councilmember for Ward 4 since 2021.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://en.wikipedia.org/wiki/2026_Washington,_D.C.,_mayoral_election"],
          asOf: "Sept 2026",
          incomplete: true,
        },
        {
          name: "Robert L. Gross",
          party: "DC Statehood Green Party",
          incumbent: false,
          background: "Information technology specialist.",
          summary: "Platform not yet researched for this guide.",
          sources: ["https://en.wikipedia.org/wiki/2026_Washington,_D.C.,_mayoral_election"],
          asOf: "Sept 2026",
          incomplete: true,
        },
      ],
    },
  ],
};
