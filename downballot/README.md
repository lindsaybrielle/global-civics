# Downballot

A free, static web app that helps Americans living abroad vote in the 2026 midterms. There's no backend, no account and no cost.

A voter enters the ZIP code of their last US address. Downballot works out their state and 2026 U.S. House district, then walks them through five steps, with a progress bar pinned to the top of the page:

1. **Register**: whether they're registered, and the FPCA form if not.
2. **Get your ballot**: their state's overseas deadlines for requesting and returning a ballot, plus the FWAB backup ballot.
3. **Who's running**: every candidate for U.S. Senate, their own House seat and governor, with party. Close races (rated Toss-up or Lean by Cook or Sabato) get three short position bullets. Voters tick their picks.
4. **Dig deeper**: a copy-and-paste prompt for any AI assistant that covers the whole ballot for their address, including state and local races.
5. **Share**: a story-sized image of their picks for Instagram or WhatsApp.

A floating **Values match** button opens a 10-question quiz that scores candidates on positions they've taken on record.

## Run it locally

```
cd downballot && python3 -m http.server 8000
```
Then open http://localhost:8000.

## ZIP codes to districts

`data/zip/<first digit>.js` maps each ZIP code to its 2026 House district(s). It was built by overlaying the Census Bureau's 2020 ZIP Code Tabulation Areas on its 120th Congress district boundaries (TIGERweb, which already includes the redrawn 2026 maps). A district is listed if it covers at least 2% of the ZIP's area, and the largest one comes first. When a ZIP crosses district lines, the app shows the largest district and offers a switch to the others. PO-box-only ZIPs aren't in the Census data, so the app falls back to the state from the ZIP's first three digits and skips the House race.

## Candidate positions

Researched, sourced summaries for each state are stored in `data/candidates/<STATE>.js` (format in `data/candidates/README.md`). They're written from campaign sites and news coverage, and they aren't updated automatically. Every candidate gets links to their campaign site, Ballotpedia and a news search. Check the data with `node data/candidates/validate.js`.
