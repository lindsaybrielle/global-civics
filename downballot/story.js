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

  // Splits text into lines that fit maxWidth. With breakWords, a single word
  // wider than the line is split across lines instead of overflowing.
  function wrap(ctx, text, maxWidth, breakWords) {
    const words = String(text || "").split(/[ \t\n]+/).filter(Boolean); // a no-break space keeps words together
    const lines = [];
    let line = "";
    for (let word of words) {
      if (breakWords) {
        while (ctx.measureText(word).width > maxWidth && word.length > 1) {
          let n = word.length - 1;
          while (n > 1 && ctx.measureText(word.slice(0, n) + "-").width > maxWidth) n--;
          if (line) { lines.push(line); line = ""; }
          lines.push(word.slice(0, n) + "-");
          word = word.slice(n);
        }
      }
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // Picks the largest size in `sizes` where the text fits in maxLines without
  // any line running past maxWidth. Never cuts text off: at the smallest size,
  // long words are broken and extra lines are allowed.
  function fit(ctx, text, font, sizes, maxWidth, maxLines) {
    for (const size of sizes) {
      ctx.font = font(size);
      const lines = wrap(ctx, text, maxWidth);
      if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxWidth)) return { size, lines };
    }
    const size = sizes[sizes.length - 1];
    ctx.font = font(size);
    return { size, lines: wrap(ctx, text, maxWidth, true) };
  }

  // Instagram draws its profile bar over the top ~250px of a story and the
  // reply bar over the bottom ~250px, so all text stays between these lines.
  const SAFE_TOP = 260, SAFE_BOTTOM = 1650;

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
      if (y > 1440 && y < SAFE_BOTTOM) continue; // keep the footer text clear
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = "56px sans-serif";
    ctx.textAlign = "center";
    [["✨", 110, 470], ["⭐", 970, 440], ["💌", 960, 1850], ["🌍", 120, 1850]].forEach(([e, x, y]) => ctx.fillText(e, x, y));
  }

  const FONT = {
    pill: (n) => `700 ${n}px 'DM Sans', sans-serif`,
    office: (n) => `700 ${n}px 'DM Sans', sans-serif`,
    name: (n) => `${n}px 'DM Serif Display', Georgia, serif`,
    why: (n) => `italic 400 ${n}px 'DM Sans', sans-serif`,
  };

  function drawHeader(ctx, t, opts, subtitle) {
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const pill = "✈️ " + (opts.country ? `VOTING FROM ${opts.country.toUpperCase()}` : "VOTING FROM ABROAD");
    const maxPill = W - 200;
    const { size, lines } = fit(ctx, pill, FONT.pill, [34, 30, 26, 22], maxPill - 60, 1);
    ctx.font = FONT.pill(size);
    const lh = size * 1.25;
    const pw = Math.min(Math.max(...lines.map((l) => ctx.measureText(l).width)) + 80, maxPill);
    const ph = lines.length * lh + 34;
    ctx.fillStyle = t.accent;
    roundRect(ctx, (W - pw) / 2, SAFE_TOP, pw, ph, Math.min(38, ph / 2));
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    lines.forEach((l, i) => ctx.fillText(l, W / 2, SAFE_TOP + 17 + size + i * lh));

    const y = SAFE_TOP + ph;
    ctx.fillStyle = t.head;
    ctx.font = "92px 'DM Serif Display', Georgia, serif";
    ctx.fillText("My 2026", W / 2, y + 105);
    ctx.fillText("midterm picks 🗳️", W / 2, y + 195);
    if (subtitle) {
      ctx.font = "500 36px 'DM Sans', sans-serif";
      ctx.globalAlpha = 0.85;
      ctx.fillText(subtitle, W / 2, y + 248);
      ctx.globalAlpha = 1;
    }
    return y + (subtitle ? 280 : 235); // where the cards can start
  }

  function drawFooter(ctx, t, opts) {
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = t.head;
    ctx.font = "700 40px 'DM Sans', sans-serif";
    ctx.fillText("Your vote travels too 💫", W / 2, SAFE_BOTTOM - 108);
    ctx.font = "700 34px 'DM Sans', sans-serif";
    ctx.fillText("Request your ballot: votefromabroad.org", W / 2, SAFE_BOTTOM - 58);
    ctx.font = "500 32px 'DM Sans', sans-serif";
    ctx.globalAlpha = 0.85;
    ctx.fillText(opts.siteUrl ? `Make your plan: ${opts.siteUrl}` : "#VoteFromAbroad", W / 2, SAFE_BOTTOM - 12);
    ctx.globalAlpha = 1;
  }
  const FOOTER_TOP = SAFE_BOTTOM - 175;

  // One card: office label, candidate name(s), optional "why".
  // Text shrinks to fit rather than being cut off.
  function layoutPick(ctx, pick, inner, big) {
    const office = fit(ctx, pick.office.toUpperCase(), FONT.office, big ? [34, 30, 26] : [28, 25, 22], inner, 2);
    const name = fit(ctx, "✔\u00a0" + pick.choice, FONT.name, big ? [84, 74, 64, 56] : [56, 50, 44, 40], inner, big ? 3 : 2);
    const why = pick.why ? fit(ctx, "“" + pick.why + "”", FONT.why, big ? [42, 38, 34, 30] : [32, 29, 26, 24], inner, big ? 6 : 4) : null;
    return { office, name, why, oh: office.size * 1.3, nh: name.size * 1.15, wh: why ? why.size * 1.4 : 0 };
  }

  function drawPick(ctx, t, pick, x, y, w, big) {
    const pad = 44;
    const L = layoutPick(ctx, pick, w - pad * 2, big);
    const h = pad * 2 + L.office.lines.length * L.oh + 8 + L.name.lines.length * L.nh + (L.why ? 14 + L.why.lines.length * L.wh : 0);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = t.card;
    roundRect(ctx, x, y, w, h, 40);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    let cy = y + pad;
    ctx.fillStyle = t.accent;
    ctx.font = FONT.office(L.office.size);
    L.office.lines.forEach((l) => { ctx.fillText(l, x + pad, cy); cy += L.oh; });
    cy += 8;
    ctx.fillStyle = t.ink;
    ctx.font = FONT.name(L.name.size);
    L.name.lines.forEach((l) => { ctx.fillText(l, x + pad, cy); cy += L.nh; });
    if (L.why) {
      cy += 14;
      ctx.fillStyle = t.sub;
      ctx.font = FONT.why(L.why.size);
      L.why.lines.forEach((l) => { ctx.fillText(l, x + pad, cy); cy += L.wh; });
    }
    ctx.textBaseline = "alphabetic";
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

    const gap = 30, x = 90, w = W - 180, bottom = FOOTER_TOP - 12;
    // The header height depends on the pill, so measure it once up front.
    const top = drawHeader(newCanvas().getContext("2d"), t, opts, "Part 1 of 2");
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
      const cardsTop = drawHeader(ctx, t, opts, label);
      // Center the block of cards in the space between header and footer.
      const total = items.reduce((sum, it) => sum + it.h, 0) + gap * (items.length - 1);
      let y = cardsTop + Math.max(0, (bottom - cardsTop - total) / 2);
      items.forEach((it) => { drawPick(ctx, t, it.p, x, y, w, big); y += it.h + gap; });
      drawFooter(ctx, t, opts);
      canvases.push(c);
    });
    return canvases;
  }

  window.Story = { render, THEMES };
})();
