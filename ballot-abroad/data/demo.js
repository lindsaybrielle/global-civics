// Fictional ballot used in demo mode (no API key set). These are not real
// candidates. The shape matches the Google Civic API voterinfo response.
window.DEMO_BALLOT = {
  demo: true,
  contests: [
    {
      office: "U.S. Senator", level: ["country"], roles: ["legislatorUpperBody"],
      district: { name: "Statewide" },
      candidates: [
        { name: "Avery Demo-Lin", party: "Democratic Party" },
        { name: "Morgan Sample", party: "Republican Party" },
        { name: "Riley Placeholder", party: "Libertarian Party" },
      ],
    },
    {
      office: "U.S. Representative, District 4", level: ["country"], roles: ["legislatorLowerBody"],
      district: { name: "Congressional District 4" },
      candidates: [
        { name: "Jordan Example", party: "Republican Party" },
        { name: "Casey Fictional", party: "Democratic Party" },
      ],
    },
    {
      office: "Governor", level: ["administrativeArea1"], roles: ["headOfGovernment"],
      district: { name: "Statewide" },
      candidates: [
        { name: "Sam Testperson", party: "Democratic Party" },
        { name: "Taylor Mockup", party: "Republican Party" },
        { name: "Drew Pretend", party: "Independent" },
      ],
    },
    {
      office: "Secretary of State", level: ["administrativeArea1"],
      district: { name: "Statewide" },
      candidates: [
        { name: "Quinn Specimen", party: "Republican Party" },
        { name: "Harper Stand-In", party: "Democratic Party" },
      ],
    },
    {
      office: "County School Board (Vote for 2)", numberVotingFor: "2",
      district: { name: "Demo County" },
      candidates: [
        { name: "Rowan Madeup", party: "Nonpartisan" },
        { name: "Emerson Hypothetical", party: "Nonpartisan" },
        { name: "Blake Notreal", party: "Nonpartisan" },
      ],
    },
    {
      type: "Referendum",
      referendumTitle: "Measure 1 (Demo): Email Ballot Return for Overseas Voters",
      referendumSubtitle: "Allows voters living outside the US to return their ballot by secure email.",
      referendumText: "A YES vote lets overseas and military voters return completed ballots electronically. A NO vote keeps the current rules, which require a mailed paper ballot.",
      referendumBallotResponses: ["Yes", "No"],
      district: { name: "Statewide" },
    },
  ],
};
