// New Jersey: researched from campaign sites and news coverage. Neutral wording;
// every summary links its sources. Schema: see data/candidates/README.md.
window.BALLOT_DATA = window.BALLOT_DATA || {};
window.BALLOT_DATA.NJ = {
  updated: "Sept 2026",
  atLarge: false,
  races: [
    {
      office: "U.S. Senate",
      kind: "usSenate",
      district: "Statewide",
      competitive: false,
      rating: "Solid D",
      candidates: [
        {
          name: "Cory Booker",
          party: "Democratic Party",
          incumbent: true,
          background: "U.S. senator since 2013 and former mayor of Newark, seeking a third full term. He ran unopposed in the Democratic primary.",
          summary: "Opposes the tariffs imposed by President Trump and says he will use his Senate powers to check the administration. His Keep Your Pay Act would make the first $75,000 of a married couple's income free of federal income tax, paid for partly by raising the top two income tax rates and corporate taxes. With Sen. Andy Kim he reintroduced the Federal Firearm Licensing Act, which would require a federal license, background check and safety training to buy a gun.",
          sources: [
            "https://whyy.org/articles/election-2026-new-jersey-senate-voter-guide-booker/",
            "https://www.booker.senate.gov/news/press/booker-announces-keep-your-pay-act",
            "https://www.quiverquant.com/news/Press+Release:+Booker+and+Kim+Reintroduce+Federal+Firearm+Licensing+Act",
          ],
          stances: { taxes: 2, tariffs: -2, guns: 2 },
          asOf: "Sept 2026",
        },
        {
          name: "Justin Murphy",
          party: "Republican Party",
          incumbent: false,
          website: "https://jerseyjustin4senate.org/",
          background: "Navy veteran and former deputy mayor and committeeman of Tabernacle, a small Burlington County town. Won a four-way Republican primary with about 33% of the vote.",
          summary: "Runs on tax cuts, spending reductions and private-sector growth. Proposes abolishing the IRS and replacing the tax code with a flat income tax of 10% to 12%, with no capital gains or estate taxes. Also stresses border security, parental rights in education, protecting Medicare, and keeping the Jersey Shore free of offshore wind turbines.",
          sources: [
            "https://whyy.org/articles/new-jersey-election-2026-primary-senate-republican-nomination/",
            "https://newjerseymonitor.com/2026/06/02/justin-murphy-gop-primary-cory-booker/",
            "https://jerseyjustin4senate.org/",
          ],
          stances: { taxes: -2, smallGov: 2, immigration: 1, climate: -1 },
          asOf: "Sept 2026",
        },
        {
          name: "Veronica Fernandez",
          party: "Independent",
          incumbent: false,
          background: "Co-owner of a small electrical contracting business in Long Valley and a longtime League of Women Voters activist, running under the \"End the Corruption!\" ballot slogan.",
          summary: "Her campaign centers on reducing the influence of money in politics, including overturning the Citizens United Supreme Court decision. She has run before for U.S. Senate (2020), U.S. House (2022) and the state Assembly (2023). Little else about her positions has been published.",
          sources: [
            "https://whyy.org/articles/election-2026-new-jersey-senate-voter-guide-booker/",
            "https://ballotpedia.org/Veronica_Fernandez",
          ],
          asOf: "Sept 2026",
        },
        {
          name: "Joanne Kuniansky",
          party: "Socialist Workers Party",
          incumbent: false,
          background: "Longtime union activist from West New York who has worked as a refinery operator, meat packer and Walmart deli worker.",
          summary: "Calls for a government public works program paying union-scale wages to build hospitals, child care centers and other infrastructure, and for a shorter work week with no cut in pay. Little else about her positions has been published in mainstream coverage.",
          sources: [
            "https://whyy.org/articles/election-2026-new-jersey-senate-voter-guide-booker/",
            "https://www.insidernj.com/kuniansky-running-for-united-states-senate/",
          ],
          asOf: "Sept 2026",
        },
      ],
    },
  ],
};
