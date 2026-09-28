// Draws Instagram-story-sized (1080x1920) PNGs of the user's picks.
(function () {
  const W = 1080, H = 1920;

  const THEMES = {
    sunset: { bg: ["#ffb199", "#ff6f61", "#c84b7a"], card: "#fffaf5", ink: "#2b1d33", sub: "#8a5a6b", accent: "#e0584b", head: "#2b1d33" },
    navy:   { bg: ["#233a8b", "#1b2559", "#0e1233"], card: "#ffffff", ink: "#1b2559", sub: "#5d6690", accent: "#e8434f", head: "#ffffff" },
    mint:   { bg: ["#d9f5e5", "#a8e6cf", "#7fcdbb"], card: "#ffffff", ink: "#16423c", sub: "#4f7a70", accent: "#16423c", head: "#16423c" },
    peach:  { bg: ["#fff1e0", "#ffd6ba", "#ffc3a0"], card: "#ffffff", ink: "#3d2c29", sub: "#8c6a5d", accent: "#d9534f", head: "#3d2c29" },
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Splits text into lines that fit maxWidth, truncating after maxLines.
  function wrap(ctx, text, maxWidth, maxLines) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      let last = kept[maxLines - 1];
      while (ctx.measureText(last + "…").width > maxWidth && last.length) last = last.slice(0, -1);
      kept[maxLines - 1] = last.trimEnd() + "…";
      return kept;
    }
    return lines;
  }

  function drawBackground(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
    t.bg.forEach((c, i) => g.addColorStop(i / (t.bg.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Scattered stars and dots, seeded so every image in a set matches.
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 26; i++) {
      const x = rand() * W, y = rand() * H, r = 3 + rand() * 7;
      if (y > 1630 && y < 1790) continue; // keep the footer text clear
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = "56px sans-serif";
    ctx.textAlign = "center";
    [["✨", 120, 250], ["⭐", 950, 190], ["💌", 960, 1870], ["🌍", 120, 1870]].forEach(([e, x, y]) => ctx.fillText(e, x, y));
  }

  function drawHeader(ctx, t, opts, subtitle) {
    ctx.textAlign = "center";
    const pill = "✈️ " + (opts.country ? `VOTING FROM ${opts.country.toUpperCase()}` : "VOTING FROM ABROAD");
    ctx.font = "700 34px 'DM Sans', sans-serif";
    const pw = Math.min(ctx.measureText(pill).width + 90, W - 160);
    ctx.fillStyle = t.accent;
    roundRect(ctx, (W - pw) / 2, 170, pw, 76, 38);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(wrap(ctx, pill, pw - 40, 1)[0], W / 2, 220);

    ctx.fillStyle = t.head;
    ctx.font = "96px 'DM Serif Display', Georgia, serif";
    ctx.fillText("My 2026", W / 2, 370);
    ctx.fillText("midterm picks 🗳️", W / 2, 470);
    if (subtitle) {
      ctx.font = "500 36px 'DM Sans', sans-serif";
      ctx.globalAlpha = 0.85;
      ctx.fillText(subtitle, W / 2, 535);
      ctx.globalAlpha = 1;
    }
  }

  function drawFooter(ctx, t, opts) {
    ctx.textAlign = "center";
    ctx.fillStyle = t.head;
    ctx.font = "700 40px 'DM Sans', sans-serif";
    ctx.fillText("Your vote travels too. Make your plan 💫", W / 2, 1700);
    ctx.font = "500 32px 'DM Sans', sans-serif";
    ctx.globalAlpha = 0.85;
    ctx.fillText(opts.siteUrl || "#VoteFromAbroad", W / 2, 1756);
    ctx.globalAlpha = 1;
  }

  // One card: office label, candidate name(s), optional "why".
  function drawPick(ctx, t, pick, x, y, w, big) {
    const pad = 44;
    const inner = w - pad * 2;
    ctx.textAlign = "left";

    ctx.font = `700 ${big ? 34 : 28}px 'DM Sans', sans-serif`;
    const officeLines = wrap(ctx, pick.office.toUpperCase(), inner, 2);
    ctx.font = `${big ? 84 : 56}px 'DM Serif Display', Georgia, serif`;
    const nameLines = wrap(ctx, "✔ " + pick.choice, inner, big ? 3 : 2);
    ctx.font = `italic 400 ${big ? 42 : 32}px 'DM Sans', sans-serif`;
    const whyLines = pick.why ? wrap(ctx, "“" + pick.why + "”", inner, big ? 8 : 3) : [];

    const oh = big ? 44 : 36, nh = big ? 96 : 66, wh = big ? 58 : 44;
    const h = pad * 2 + officeLines.length * oh + nameLines.length * nh + (whyLines.length ? 16 + whyLines.length * wh : 0);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = t.card;
    roundRect(ctx, x, y, w, h, 40);
    ctx.fill();
    ctx.restore();

    let cy = y + pad + (big ? 34 : 28);
    ctx.fillStyle = t.accent;
    ctx.font = `700 ${big ? 34 : 28}px 'DM Sans', sans-serif`;
    officeLines.forEach((l) => { ctx.fillText(l, x + pad, cy); cy += oh; });

    ctx.fillStyle = t.ink;
    ctx.font = `${big ? 84 : 56}px 'DM Serif Display', Georgia, serif`;
    cy += nh - oh - (big ? 8 : 4);
    nameLines.forEach((l) => { ctx.fillText(l, x + pad, cy); cy += nh; });

    if (whyLines.length) {
      ctx.fillStyle = t.sub;
      ctx.font = `italic 400 ${big ? 42 : 32}px 'DM Sans', sans-serif`;
      cy += 16 - nh + wh;
      whyLines.forEach((l) => { ctx.fillText(l, x + pad, cy); cy += wh; });
    }
    return h;
  }

  function newCanvas() {
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    return c;
  }

  async function ensureFonts() {
    if (!document.fonts) return;
    await Promise.all([
      document.fonts.load("96px 'DM Serif Display'"),
      document.fonts.load("700 40px 'DM Sans'"),
      document.fonts.load("italic 400 40px 'DM Sans'"),
    ]).catch(() => {});
  }

  // picks: [{office, choice, why}]; opts: {layout, theme, country, siteUrl}
  async function render(picks, opts) {
    await ensureFonts();
    const t = THEMES[opts.theme] || THEMES.sunset;
    const canvases = [];

    const top = 590, bottom = 1600, gap = 30, x = 90, w = W - 180;
    const measure = (p, big) => drawPick(newCanvas().getContext("2d"), t, p, 0, 0, w, big);

    // Group picks into pages: one per page, or as many as fit (max 4).
    const big = opts.layout === "each";
    const pages = [];
    for (const p of picks) {
      const h = measure(p, big);
      const last = pages[pages.length - 1];
      const used = last ? last.reduce((sum, it) => sum + it.h + gap, 0) : 0;
      if (!last || big || used + h > bottom - top || last.length >= 4) pages.push([{ p, h }]);
      else last.push({ p, h });
    }

    pages.forEach((items, i) => {
      const c = newCanvas(), ctx = c.getContext("2d");
      drawBackground(ctx, t);
      const label = pages.length < 2 ? "" : big ? `${i + 1} of ${pages.length}` : `Part ${i + 1} of ${pages.length}`;
      drawHeader(ctx, t, opts, label);
      // Center the block of cards in the space between header and footer.
      const total = items.reduce((sum, it) => sum + it.h, 0) + gap * (items.length - 1);
      let y = top + Math.max(0, (bottom - top - total) / 2);
      items.forEach((it) => { drawPick(ctx, t, it.p, x, y, w, big); y += it.h + gap; });
      drawFooter(ctx, t, opts);
      canvases.push(c);
    });
    return canvases;
  }

  window.Story = { render, THEMES };
})();
