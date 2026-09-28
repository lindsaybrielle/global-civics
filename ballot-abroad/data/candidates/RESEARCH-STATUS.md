# Research status

## Where things stand (Sept 28, wave 3)

The brief is now lighter (see README.md, "Depth"): rosters for every federal and governor race, 3+ positions for competitive races, and full voter guides only when someone asks for their address.

- **Rosters: done for all 50 states.** Every U.S. Senate, U.S. House and governor race is in the files, with nominees, party and incumbent flags, and minor-party candidates where Wikipedia or an official list confirms they're on the ballot.
  - **Louisiana:** its House primaries moved to Nov. 3 as all-candidate races with a December runoff, so every declared candidate is listed.
  - **DC** is not yet included.
- **Competitive races: done.** 138 of 139 Democratic and Republican candidates in races rated Toss-up or Lean by Cook or Sabato (late September) have at least 3 positions. The one exception is Gerald Heikes (AK Senate, a minor Republican candidate).
  - Positions for the newer states come from smarter.vote's sourced issue summaries (the first sentence of each issue). Stance scores for the quiz were **not** added for these; add them during a deep dive.
- **Known roster caveats:**
  - Minor-party and independent candidates are incomplete where neither source lists them. 270towin lists mostly Democrats and Republicans.
  - Spellings follow Wikipedia where it and 270towin differ, for example Andersen (FL-20), Udell (UT-3) and Anabilah-Azumah (NY-9).
  - Unexpected facts both sources agree on were kept, such as Darline Graham as the appointed SC senator.
- **Next steps:**
  - Add DC (delegate race).
  - Build the on-demand deep-dive flow into the app, or a documented prompt for it.
  - Refresh ratings and rosters in mid-October.

Everything below is the earlier log, kept for detail.

## Wave 2 progress (Sept 28 session)

**New state files, statewide plus all House seats:** AK, ME, MI, NC, NH, TX, WI.
**House races added to earlier files:** AL, GA, IA, MD, MO, MS, NJ, OH, VT.
That makes 16 of 50 states plus DC with House races. Each file passes `node validate.js`.

How the House work was done:
- **Ratings** come from the Wikipedia ratings table (Cook as of Sep 25, Sabato as of Sep 22). A race is `competitive` if either rater has it at Toss-up or Lean.
- **Competitive seats** were researched in full: background, summary, inPractice, and 2–4 sources.
- **Safe seats** list every ballot-qualified nominee, marked `incomplete: true`. The source is the state's official list where one could be fetched (NC State Board PDF, MI Dept. of State listing, TX SOS ballot certification). Otherwise it is the Wikipedia district page.
- **Minor-party candidates:** included only when an official list or a Nominee/Advanced section confirms they are on the ballot. Wikipedia "Declared" independents were left out.

Gaps found in this pass:
- **AK:** the governor candidates have no stance scores. Nick Begich (House) is marked incomplete.
- **ME:** no statewide referendum questions were found; the one citizen initiative was removed in May. Check for legislative bond questions. LePage (ME-2) and ME-1 are incomplete.
- **MI:** the Supreme Court candidates are incomplete. The State Board of Education and university board races (UM, MSU, WSU) are not in the file.
- **NC:** Court of Appeals seats 1–3 are incomplete. Check Brian McGinnis (NC-2 write-in).
- **NH:** Senate candidate Edmond LaPlante (Constitution) and governor candidate Stephen Villee (Libertarian) were left out because their ballot status is unconfirmed. Goodlander, Tang Williams and Mahrou (NH-2) are incomplete.
- **TX:** lieutenant governor, comptroller, land, agriculture and railroad commissioner races are incomplete (nominees and backgrounds only), and so are the Supreme Court and Court of Criminal Appeals seats. Attorney General (Middleton vs. Johnson) needs platforms. There are no statewide propositions in 2026.
- **WI:** AG, secretary of state and treasurer are incomplete. Declared independents in WI-3, WI-4 and WI-6 and Adam Follmer (WI-1) were left out because their ballot status is unconfirmed.
- **Wave-2 competitive seats with thin platforms:** Kaptur and Merrin (OH-9) are marked incomplete. Max Miller (OH-7), Kean and Bennett (NJ-7), and Conroy (OH-1) have short entries.
- **GA-13:** Everton Blair won the August special election, but Jasmine Clark is the Democratic nominee for the full term. Confirm this in the file note.
- **Independents missing from wave-2 rosters:** NJ-7 has Seamus Patrick O'Toole (I), and MD, MS and GA have "Declared" independents who were not added.

## Finished files
AL, GA, IA, MO, MS, NJ, VT (checked with `node validate.js`).

## Partial files (listed gaps)
- **AL:** governor platforms (Tuberville, Jones) are marked `incomplete`. The PSC Place 2 Democratic nominee is unconfirmed.
- **GA:** check the amendment numbering against the Secretary of State's ballot booklet.
- **IA:** Secretary of Agriculture race is missing. Measures and third parties are unchecked.
- **MD:** Attorney General and Comptroller are missing. Wes Moore's entry is thin.
- **OH:** governor platforms (Acton, Ramaswamy) are marked `incomplete`.

## Not started
AZ, AR, CA, CO, CT, DE, DC, FL, HI, ID, IL, IN, KS, KY, LA, MA, MN, MT, NE, NV, NM, NY, ND, OK, OR, PA, RI, SC, SD, TN, UT, VA, WA, WV, WY.
**US House:** done for the 16 states above. Every state on this list still needs its House races as well as its statewide races.

To list the competitive House seats still to research (Cook or Sabato at Toss-up or Lean, late Sept), read the Wikipedia page "2026 United States House of Representatives election ratings" (see the tips below). The largest groups are in CA, PA, NY, AZ, CO, VA and NE.

Tooling tips that saved searches:
- `curl "https://en.wikipedia.org/w/index.php?title=<page>&action=raw"` returns the raw wikitext of the ratings page and each state's House page. From those you can read every district's nominees under "Nominee" headings. Watch for special or redo primaries: in Alabama the later heading is the binding one.
- Official PDFs can be read with `pip install cffi pypdf`.

## Leads gathered before the limit (unverified)


CO (atLarge false): Senate Solid D: John Hickenlooper (D, inc) vs Mark Baisley (R). Governor Solid D: Phil Weiser (D) vs Victor Marx (R). AG: Jena Griswold (D) vs Michael Allen (R). SoS: Amanda Gonzalez (D) vs James Wiley (R). Treasurer: Jeff Bridges (D) vs Kevin Grantham (R).
Measures (14): Amend 81 immigration notification, 82 natural gas right, 83 hunt/fish right, 84 ID on mail ballots, 85 plain-language ballot questions, 86 congressional redistricting, 87 graduated income tax >$500k; Props NN K-12 funding (referred), 132 fentanyl penalties, 133 child sex trafficking penalties, 134 school sports by sex, 135 bans certain surgeries for minors, 136 income tax cap 4.4%, 137 sporting-goods tax for conservation.
Sources: cpr.org/2026/09/24/vg-2026-colorado-us-senate-voter-guide/ ; cpr.org/2026/09/24/vg-2026-colorado-governor-voter-guide/ ; coloradosun.com/2026/06/30/colorado-primary-election-attorney-general-results/ ; coloradonewsline.com/2026/09/08/14-measures-will-appear-on-colorados-statewide-ballot-in-2026/ ; cpr.org/2026/09/24/vg-2026-state-ballot-measures-voter-guide/
FL: Senate special Solid R: Ashley Moody (R, appointed inc) vs Angie Nixon (D). Governor Likely R: Byron Donalds (R) vs David Jolly (D); Jason Pizzo (NPA) ballot status unconfirmed. AG: James Uthmeier (R, inc) vs José Javier Rodríguez (D). CFO: Blaise Ingoglia (R, inc) vs Annette Taddeo (D). Ag Commissioner: Wilton Simpson (R, inc) vs Joey Mendoza Atkins (D).
Amendments (60% needed): 1 rainy-day fund cap 10%->25%; 2 ag equipment property-tax exemption; 3 bigger homestead exemption.
Sources: thehill.com/homenews/campaign/6037568-sabatos-crystal-ball-shifts-florida-senate-gop/ ; floridaphoenix.com/voter-guides/ballot-measures/2026-amendment-2/ ; union-bulletin.com/news/national/all-3-florida-amendments-on-the-2026-ballot-explained/article_3ac4ac93-968d-5c33-902e-5eaf064ade5c.html
CT: Governor Solid D (Lamont inc). DE: Senate Solid D. Nothing else.

IA.js DONE (Senate Toss-up Turek D vs Hinson R; Gov Lean D Sand D vs Lahn R; AG, SoS, Treas, Auditor). MISSING: Sec of Agriculture (Naig R inc vs D TBD, Chris Jones?), measures, third parties.
KS, KY, LA: not started. (ME done in wave 2.)

MS.js DONE (Senate: Hyde-Smith R inc, Scott Colom D, Ty Pinkins I; Solid R). No statewide/measures.
MD.js PARTIAL: Governor Wes Moore (D inc, thin, no stances) vs Dan Cox (R); Q1 union contracts, Q2 judicial disabilities commission, Q3 congressional redistricting. MISSING: AG (R James Rutledge III vs D probably Anthony Brown), Comptroller (R Sonya Dunn vs D probably Brooke Lierman), Moore detail, 3rd party check.
MA: Senate: Ed Markey (D inc) vs John Deaton (R). Gov (Healey), LtGov, AG, SoS, Treas, Auditor, questions: not researched.
MI.js DONE in wave 2 (Duggan withdrew in May 2026; gov is Benson vs James).
MN: Senate: Peggy Flanagan (D) vs Michele Tafoya (R). Gov, AG, SoS, Auditor, measures: not researched.

MO.js DONE (Auditor + measures 3,6,7,8, Prop A; Prop A status uncertain).
MT: Senate (open): Kurt Alme (R), Alani Bankhead (D), Seth Bodnar (I), Kyle Austin (L). 3 initiatives incl CI-132 nonpartisan judicial elections.
NE: Senate: Pete Ricketts (R, inc) vs Dan Osborn (I). Governor: Jim Pillen (R, inc) vs Lynne Walz (D). SoS/AG/Treas/Auditor nominees unknown. Measures: LR19CA term limits 2->3, Init 440 sports betting (+statute), 441 four-fifths to change initiatives, 442 girls' sports.
NV: No Senate. Governor unverified (Lombardo R inc vs Ford D presumed). AG: Nicole Cannizzaro (D) vs Adriana Guzmán Fralick (R). Treasurer: Tya Mathis-Coleman (D) vs R TBD. Q6 abortion right, Q7 voter ID (second votes).
NH.js DONE in wave 2 (only one statewide question found: register of probate; the "school property tax cap" lead did not check out as a statewide measure).

NJ.js DONE (Senate only; no statewide questions found).
NM: Governor: Deb Haaland (D) vs Gregg Hull (R). Senate (Luján), other offices, measures not researched.
NY: Governor: Kathy Hochul (D, inc) vs Bruce Blakeman (R/Conservative). LtGov mates: Adrienne Adams (D), Todd Hood (R). No Senate. AG, Comptroller, measures not researched.
NC.js DONE in wave 2.
ND (atLarge): No Senate/Gov. Up: SoS (Michael Howe R inc), AG (Drew Wrigley R inc), Ag Commissioner, Tax Commissioner, 2 PSC seats, Supt (nonpartisan), 2 supreme court seats. Opponents/measures not researched.

OH.js PARTIAL: Senate special Toss-up (Husted R inc, Brown D full; Redpath L, Levy I short). Governor Toss-up: Acton D / Ramaswamy R / Kissick L — NO PLATFORMS YET (needs follow-up). AG Faber R vs Kulewicz D; SoS Sprague R vs Russo D vs Pruss L; Treas Edwards R vs Walsh D; Auditor LaRose R vs Blackwell D. Issue 3 voter ID. Unconfirmed: Aidan Jeffery (L auditor), Stephen Faris (Senate).
OK, OR, PA, RI: not started.

SC: Governor: Alan Wilson (R, AG) vs Jermaine Johnson (D) vs Walid Hakim (Green). Senate (Graham seat), AG, SoS, Treasurer, Comptroller, Supt, Ag, measures: not researched.
SD (atLarge): Governor: Larry Rhoden (R, inc) vs Dan Ahlers (D). Senate: Mike Rounds (R) vs Brian Bengs (I); Dem Julian Beaudion withdrew Aug 4. AG: Lance Russell (R, unopposed). SoS: Heather Baxter (R) vs Terrence Davis (D) (+ possible third). R nominees: Melissa Hull (Treas), Catherine Barranco (Auditor), Don Haggar (PUC), Brock Greenfield (School & Public Lands). D down-ballot unreliable. Measures: Amend I (Medicaid expansion repeal trigger <90% fed), J (citizenship to vote), K (unclaimed property trust), L (60% for amendments).
TN: Governor: Marsha Blackburn (R) vs Jerri Green (D). Senate (Hagerty) not researched.
TX.js DONE in wave 2 (down-ballot statewide entries incomplete; see gaps above).
UT: No Senate/Gov/statewide exec. Measures: amendment 60% vote for tax-raising initiatives; amendment on publication of proposed amendments. Legislative session additions unchecked.

VT.js DONE (8 races; Gov rated Solid R by Cook, polls close; note in file).
VA: Senate: Mark Warner (D inc) vs Bert Mizusawa (R). No Gov. Rating/measures not researched.
WA: No Senate/Gov/statewide. Initiatives: IL26-638 girls' athletics + one unidentified.
WV: Senate: Shelley Moore Capito (R inc) vs Rachel Fetty Anderson (D), Solid R.
WI.js DONE in wave 2.
WY: Senate: Harriet Hageman (R) vs James Byrd (D). Governor: Eric Barlow (R) vs Kenneth Casner (D). Others not researched.
