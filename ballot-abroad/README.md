# Ballot Abroad

A free, static web app that helps Americans living abroad get ready for the 2026 midterms:

1. **Where you vote**: state, ZIP and (optionally) street address of your last US address.
2. **Registration**: step-by-step instructions based on whether you're registered (FPCA, ballot return, and the FWAB backup ballot), with links to your state's official pages.
3. **Your ballot**: every race and measure for that address, with a plain-language explainer of what each office does and why it matters from abroad, plus research links for each candidate. Tick who you're voting for and add an optional "why".
4. **Share or save**: makes 1080×1920 story images (all picks, or one per story, in 4 styles). On phones, **Share** opens the share menu so you can post to Instagram Stories or WhatsApp. On desktop, you save the PNGs. You can also send your picks as WhatsApp text or copy them.

Everything runs in the browser. There's no backend, no account and no cost.

## Run it locally

```
cd ballot-abroad && python3 -m http.server 8000
```
Then open http://localhost:8000. Without an API key, the app shows the researched races for states that have a data file, and made-up demo candidates for states that don't yet.

## Get a free API key (real ballots)

Real ballot data comes from the Google Civic Information API, which is free.

1. Go to https://console.cloud.google.com, create a project, and enable **Google Civic Information API**.
2. Under **APIs & Services → Credentials**, create an API key.
3. Restrict the key to your site's URL (HTTP referrers, for example `https://YOURNAME.github.io/*`). The key is visible to anyone who opens the site, so this restriction matters.
4. Paste the key into `ballot-abroad/config.js` as `civicApiKey`, and set `siteUrl`.

Things to know:
- Ballot data usually appears a few weeks before the election, and down-ballot coverage varies by state.
- With only a ZIP code, district and local races may be missing, so a street address works best.

## Host it free on GitHub Pages

See the main README of this repo. Once Pages is on, the app lives at `https://<user>.github.io/global-civics/ballot-abroad/`.

## Candidate positions

Researched, sourced summaries for each state are stored in `data/candidates/<STATE>.js` (format in `data/candidates/README.md`). They're written once from campaign sites and news coverage, and they aren't updated automatically. With no API key, the app shows these federal and statewide races directly. Voters enter their congressional district to see their House race. Candidates without a summary get links to their campaign site, Ballotpedia, Vote411 and a news search.
