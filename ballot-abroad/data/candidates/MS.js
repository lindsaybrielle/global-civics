// Mississippi: researched from campaign sites and news coverage. Neutral wording;
// every summary links its sources. Schema: see data/candidates/README.md.
// Mississippi's governor and other statewide offices are next elected in 2027, and
// no statewide ballot measures are slated for Nov 2026 (the initiative process has
// been void since a 2021 state Supreme Court ruling).
window.BALLOT_DATA = window.BALLOT_DATA || {};
window.BALLOT_DATA.MS = {
  updated: "Sept 2026",
  atLarge: false,
  races: [
    {
      office: "U.S. Senate",
      kind: "usSenate",
      district: "Statewide",
      competitive: false,
      rating: "Solid R",
      candidates: [
        {
          name: "Cindy Hyde-Smith",
          party: "Republican Party",
          incumbent: true,
          background: "U.S. senator since 2018 and former state agriculture commissioner; the first woman elected to represent Mississippi in Congress.",
          summary: "Seeking a second full term on her record for agriculture, rural health and election integrity, and on supporting President Trump's \"America First\" agenda. Lists her priorities as affordability, keeping rural hospitals open, farmers, shipyard jobs, securing the border, protecting Social Security and Medicare, and \"defending the unborn.\" Has proposed using tariff revenue on Chinese goods to pay for border barriers.",
          sources: [
            "https://www.starkvilledailynews.com/news/your-decision-2026-cindy-hyde-smith-q-a/article_4569ebff-c021-44cb-99e7-57644c542386.html",
            "https://www.wlox.com/2026/09/04/hyde-smith-faces-colom-pinkins-bid-keep-senate-seat/",
            "https://www.hydesmith.senate.gov/hyde-smith-proposes-using-tariff-revenues-fund-border-barriers",
          ],
          stances: { immigration: 2, abortion: -2, tariffs: 1 },
          asOf: "Sept 2026",
        },
        {
          name: "Scott Colom",
          party: "Democratic Party",
          incumbent: false,
          website: "https://scottcolom.com/",
          background: "District attorney for north Mississippi's 16th Circuit Court District for nearly a decade, based in Columbus.",
          summary: "Centers his campaign on health care, wages and costs. Supports expanding Medicaid and extending Affordable Care Act tax credits, says his first bill would reverse recent federal Medicaid cuts, and backs raising taxes on high earners to pay for it. Calls himself personally pro-life but says he would \"trust\" women to make their own choices, and supports IVF access. Calls tariffs \"a really good tool\" against unfair trade, while criticizing tariff votes he says hurt farmers.",
          sources: [
            "https://www.wlox.com/2026/02/08/democrat-scott-colom-lays-out-senate-primary-platform-targeting-rising-costs-healthcare-access/",
            "https://www.ddtonline.com/colom-champions-tax-increase-mississippians-continue-have-health-insurance-69370d03ce217",
            "https://www.starkvilledailynews.com/news/your-decision-2026-scott-colom-q-a/article_f2a64a2c-8d6a-4882-92f0-347a7121c29a.html",
          ],
          stances: { healthcare: 2, taxes: 2, abortion: 1, tariffs: 0 },
          asOf: "Sept 2026",
        },
        {
          name: "Ty Pinkins",
          party: "Independent",
          incumbent: false,
          website: "https://www.typinkins.com/",
          background: "Lawyer, author and 21-year U.S. Army veteran from Rolling Fork; he was the 2024 Democratic Senate nominee and left the party in 2025.",
          summary: "Argues that \"both parties have failed us\" and that independents should be sent to the Senate to reduce the influence of big donors. Has highlighted the rising cost of health care. Little detailed policy coverage has been published.",
          sources: [
            "https://mississippitoday.org/2026/05/12/senate-candidate-ty-pinkins-says-both-parties-have-failed-us/",
            "https://www.wlox.com/2026/09/27/independent-ty-pinkins-discusses-campaign-race-us-senate/",
          ],
          asOf: "Sept 2026",
        },
      ],
    },
  ],
};
