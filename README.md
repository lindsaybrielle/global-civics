# Global Civics

Free tools that help people take part in civic life.

| Project | What it does |
|---|---|
| **Downballot** · [open the app](https://downballot.netlify.app) · [code](downballot) | Helps Americans living abroad vote in the 2026 midterms: enter a ZIP code to get your overseas voting deadlines, everyone running for Congress and governor, short summaries of where candidates in close races stand, a values quiz, and a shareable image of your picks. |

## Hosting

Everything is static, so hosting is free.

**Netlify (main site).** `netlify.toml` tells Netlify to serve the `downballot` folder. To connect it the first time:

1. Open https://app.netlify.com/start/deploy?repository=https://github.com/lindsaybrielle/global-civics and sign in with GitHub (free).
2. Accept the defaults and deploy. Netlify picks up the settings from `netlify.toml`.
3. Under **Site configuration → Change site name**, set the name to `downballot`, which gives you `https://downballot.netlify.app`. If you pick another name, update `siteUrl` in `downballot/config.js`.

After that, every push to `main` redeploys the site automatically.

**GitHub Pages (backup).** Pages is still on, so the app is also at https://lindsaybrielle.github.io/global-civics/downballot/.
