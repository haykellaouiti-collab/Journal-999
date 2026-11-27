// Génère icon-192/512, apple-icon et og.png (node scripts/make-images.cjs). Nécessite playwright.
const { chromium } = require("playwright");
const fs = require("fs");
const svg = fs.readFileSync("src/app/icon.svg", "utf8");
(async () => {
  const b = await chromium.launch();
  for (const [name, size] of [["icon-192", 192], ["icon-512", 512], ["apple-touch-icon", 180]]) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<body style="margin:0;background:#0d1228">${svg.replace("<svg", `<svg width="${size}" height="${size}"`)}</body>`);
    await p.screenshot({ path: `public/${name}.png` });
  }
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(`<body style="margin:0;width:1200px;height:630px;background:linear-gradient(135deg,#0d1228,#26315f);color:#fff;font-family:Georgia,serif;display:flex;align-items:center;padding:0 90px;gap:60px">
    <div style="width:220px;height:220px">${svg.replace("<svg", '<svg width="220" height="220"')}</div>
    <div><div style="font-size:92px;font-weight:700;letter-spacing:-2px">Journal <span style="color:#ff5a42">999</span></div>
    <div style="font-size:38px;opacity:.85;margin-top:14px;font-family:Arial,sans-serif">The world's press · La presse mondiale · الصحافة العالمية · La prensa mundial</div></div></body>`);
  await p.screenshot({ path: "public/og.png" });
  await b.close();
})();
