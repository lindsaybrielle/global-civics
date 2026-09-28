// Plain-language explainers for each kind of office: what the job is, and why it
// matters to someone living outside the US. Matched to contests in app.js.
window.OFFICE_GUIDE = {
  usSenate: {
    label: "US Senate",
    does: "Writes federal law with the House, confirms judges, cabinet members and ambassadors, and ratifies treaties. Each state has two senators, each serving six years.",
    abroad: "Tax treaties that stop you being taxed twice need Senate ratification, and many have been stuck for years. The Senate also votes on the tax code (the US taxes citizens wherever they live), confirms the ambassador to your host country, and funds the State Department that runs embassies and consulates.",
  },
  usHouse: {
    label: "US House",
    does: "Writes federal law and controls the federal budget: every tax bill has to start here. Representatives serve two-year terms and each covers one district.",
    abroad: "Changes to how Americans abroad are taxed (including FATCA and FBAR reporting, which make it hard for many to keep a local bank account) would start in the House. So does funding for passport processing, consular services and the overseas voting program.",
  },
  governor: {
    label: "Governor",
    does: "Runs the state government: signs or vetoes state laws, proposes the state budget, and appoints many officials and some judges.",
    abroad: "Some states can keep taxing you after you move abroad if they still treat you as a resident there. Governors also shape how easy it is to vote from overseas, for example whether ballots can be returned by email or fax.",
  },
  ltGovernor: {
    label: "Lieutenant Governor",
    does: "Takes over if the governor leaves office. In many states they also preside over the state senate and can cast tie-breaking votes.",
    abroad: "Rarely affects you directly, but can decide close state senate votes, including ones on election rules.",
  },
  secretaryOfState: {
    label: "Secretary of State",
    does: "In most states, this is the chief elections official. They oversee voter rolls, certify results and set the rules for how ballots are handled.",
    abroad: "This is the office most directly connected to you. They decide how overseas ballots are sent, whether you can return one by email or fax, and how fast problems get fixed.",
  },
  attorneyGeneral: {
    label: "Attorney General",
    does: "The state's top lawyer. They enforce state law, defend the state in court and handle consumer protection.",
    abroad: "Can take legal action to defend or challenge election rules, including those covering overseas and military ballots.",
  },
  stateFinance: {
    label: "State finance office",
    does: "Treasurers, controllers and auditors manage and check the state's money: investments, pension funds and how public money is spent.",
    abroad: "Mostly indirect, unless you still pay into state pensions or hold unclaimed property in the state.",
  },
  stateLegislature: {
    label: "State legislature",
    does: "Writes state laws on taxes, schools, healthcare, criminal justice and elections. In most states, it also draws the congressional district maps.",
    abroad: "Sets state residency and tax rules for people who move away, and state-level voting rules for overseas voters.",
  },
  judge: {
    label: "Judge / court",
    does: "Decides cases under state law. State supreme courts often have the final say on election disputes, district maps and constitutional questions.",
    abroad: "Courts decide challenges over which ballots count, including late-arriving overseas ballots.",
  },
  education: {
    label: "School board / education",
    does: "Sets school budgets, hires superintendents, and shapes curriculum and school policy.",
    abroad: "Matters if you have family in the district or plan to move back with kids.",
  },
  local: {
    label: "Local office",
    does: "Mayors, councils, county commissions and similar bodies run local services: roads, policing, housing, zoning and local taxes.",
    abroad: "Matters most if you own property in the area, have family there, or plan to move back.",
  },
  lawEnforcement: {
    label: "Sheriff / prosecutor",
    does: "Sheriffs run county law enforcement and jails. District attorneys decide which crimes are prosecuted and how.",
    abroad: "Local impact, mainly for family and property you have in the county.",
  },
  measure: {
    label: "Ballot measure",
    does: "A question put directly to voters. It might change the state constitution, pass a law, or approve spending or taxes.",
    abroad: "Read the full text. Measures on taxes, residency or elections can affect people who live overseas.",
  },
  other: {
    label: "Other office",
    does: "Check your state's official voter guide for what this office does.",
    abroad: "",
  },
};

// Questions worth asking about any candidate, from the point of view of an
// American living abroad. Shown when there's no vetted summary for a candidate.
window.ABROAD_QUESTIONS = [
  "Do they support changing how Americans abroad are taxed (citizenship-based taxation, FATCA reporting)?",
  "Do they back making it easier to vote from overseas, like returning ballots by email or fax?",
  "Where do they stand on State Department and consulate funding (passports, emergency help abroad)?",
  "What's their approach to relations with the country you live in?",
];
