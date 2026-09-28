// Maryland: researched from campaign sites and news coverage. Neutral wording;
// every summary links its sources. Schema: see data/candidates/README.md.
// INCOMPLETE (Sept 2026): Attorney General and Comptroller races still need to be
// added (Republican nominees: James Rutledge III for AG, Sonya Dunn for Comptroller;
// Democratic nominees not yet verified). Governor rating not yet verified.
// Maryland has no U.S. Senate race in 2026.
window.BALLOT_DATA = window.BALLOT_DATA || {};
window.BALLOT_DATA.MD = {
  updated: "Sept 2026",
  atLarge: false,
  races: [
    {
      office: "Governor",
      kind: "governor",
      district: "Statewide",
      competitive: false,
      note: "A rematch of the 2022 race, which Moore won with about 64% of the vote. Governor and Lieutenant Governor run as a ticket.",
      candidates: [
        {
          name: "Wes Moore",
          party: "Democratic Party",
          incumbent: true,
          background: "Governor since 2023, seeking a second term; won the June 23 Democratic primary.",
          summary: "Running for re-election on his first-term record. He has campaigned for a \"yes\" vote on Question 3, the constitutional amendment that would loosen state rules on drawing congressional districts. Detailed second-term policy coverage was not gathered for this entry.",
          sources: [
            "https://www.newsnationnow.com/politics/2026-midterm-elections/maryland-governor-primary-results-2026/",
            "https://marylandmatters.org/2026/09/18/moore-convinced-marylanders-will-check-yes-on-redistricting-ballot-question/",
          ],
          asOf: "Sept 2026",
        },
        {
          name: "Dan Cox",
          party: "Republican Party",
          incumbent: false,
          background: "Former state delegate and the 2022 Republican nominee for governor; won the June 23 Republican primary with Rob Krop as his running mate.",
          summary: "Makes affordability the center of his campaign, pointing to rising electric bills, taxes and living costs. Pledges to lower taxes and fees so residents don't leave the state. Says the race is \"about Maryland,\" not national politics.",
          sources: [
            "https://foxbaltimore.com/news/local/dan-cox-pitches-affordability-tax-cuts-bid-unseat-gov-wes-moore",
            "https://marylandmatters.org/2026/02/01/cox-files-to-make-second-bid-for-governor-adding-to-already-crowded-gop-field/",
          ],
          stances: { taxes: -1 },
          asOf: "Sept 2026",
        },
      ],
    },
    {
      office: "Question 1: State Employee Collective Bargaining and Budget Amendment",
      kind: "measure",
      district: "Statewide",
      subtitle: "Requires the governor's budget to fund state employee contracts, including terms set by a neutral arbitrator.",
      text: "A YES vote amends the constitution so each governor's proposed budget must include the money needed to carry out state employee union contracts (wages, hours, health and other benefits), whether the terms were agreed or chosen by a neutral arbitrator, and activates a binding-arbitration process for contract impasses; terms needing new appropriations or law changes would still need General Assembly action. A NO vote keeps the current process, with no constitutional requirement to fund arbitrated terms.",
      responses: ["Yes", "No"],
      sources: [
        "https://elections.maryland.gov/elections/2026/ballot_questions.html",
        "https://thebaynet.com/maryland-question-1-could-change-how-state-employee-contracts-and-budgets-are-decided/",
        "https://www.wypr.org/wypr-news/2026-05-01/maryland-voters-will-weigh-in-on-state-employee-wage-negotiation-process-in-november",
      ],
    },
    {
      office: "Question 2: Commission on Judicial Disabilities Temporary Appointments",
      kind: "measure",
      district: "Statewide",
      subtitle: "Allows temporary members on the commission that handles judicial misconduct.",
      text: "A YES vote allows temporary appointments to the Maryland Commission on Judicial Disabilities when a member is recused, disqualified or their term ends. A NO vote keeps the current rule, under which such temporary appointments are not allowed.",
      responses: ["Yes", "No"],
      sources: [
        "https://elections.maryland.gov/elections/2026/ballot_questions.html",
        "https://thedailyrecord.com/2026/09/08/maryland-elections-governor-race-congressional-redistricting/",
      ],
    },
    {
      office: "Question 3: Congressional Redistricting Amendment",
      kind: "measure",
      district: "Statewide",
      subtitle: "Removes state constitutional rules on drawing congressional districts and lets the state Supreme Court hear map challenges directly.",
      text: "A YES vote amends the constitution to say its district-drawing requirements apply only to state legislative districts, that nothing in it sets criteria for congressional districts, and that the General Assembly may give the Maryland Supreme Court original jurisdiction over congressional map challenges; supporters and opponents agree this would make it easier to redraw the congressional map in the future (not for 2026). A NO vote keeps the current constitutional rules applying to congressional maps.",
      responses: ["Yes", "No"],
      sources: [
        "https://cnsmaryland.org/2026/09/22/after-a-legal-battle-marylanders-will-vote-on-future-redistricting-in-november-heres-what-to-know/",
        "https://marylandmatters.org/2026/09/03/maryland-supreme-court-redistricting-constitutional-amendment-ruling/",
        "https://foxbaltimore.com/news/local/maryland-supreme-court-keeps-redistricting-question-on-ballot-orders-clearer-language",
      ],
    },
  ],
};
