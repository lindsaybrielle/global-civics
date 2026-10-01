# Global Civics

Free tools that help people take part in civic life.

| Project | What it does |
|---|---|
| **Downballot** · [open the app](https://downballot.netlify.app) · [code](downballot) | Helps Americans living abroad vote in the 2026 midterms: enter a ZIP code to get your overseas voting deadlines, everyone running for Congress and governor, short summaries of where candidates in close races stand, a values quiz, and a shareable image of your picks. |

## Hosting

Everything is static, so hosting is free.

**Netlify (main site): https://downballot.netlify.app.** `netlify.toml` tells Netlify to serve the `downballot` folder. Netlify's Deploy button made a copy of this repo, [`global-civics-aa5c0`](https://github.com/lindsaybrielle/global-civics-aa5c0), and the Netlify site builds from that copy. After merging a change here, bring the copy up to date or the Netlify site won't change:

```
git clone https://github.com/lindsaybrielle/global-civics-aa5c0 && cd global-civics-aa5c0
git pull --ff-only https://github.com/lindsaybrielle/global-civics main && git push origin main
```

To stop needing this, point Netlify at this repo: in Netlify, open the site, go to **Site configuration → Build & deploy → Continuous deployment → Manage repository → Link to a different repository**, and choose `lindsaybrielle/global-civics`.

**GitHub Pages (backup).** Pages is still on, so the app is also at https://lindsaybrielle.github.io/global-civics/downballot/.
