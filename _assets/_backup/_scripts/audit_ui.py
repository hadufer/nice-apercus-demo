import asyncio, json
from playwright.async_api import async_playwright

SITES=["michel-peintre-v2","siamois-v2","romain-v2"]
WIDTHS=[320,390,768,1024,1440]

AUDIT_JS = """() => {
  const vw = document.documentElement.clientWidth;
  const out = {vw, scrollW: document.documentElement.scrollWidth, docH: document.body.scrollHeight, overflowers: [], sections: [], tinyText: []};
  // horizontal overflow culprits
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > vw + 1 && r.left < vw && r.right > vw + 1) {
      const tag = el.tagName.toLowerCase() + (el.className && typeof el.className==='string' ? '.'+el.className.trim().split(/\\s+/).slice(0,2).join('.') : '');
      out.overflowers.push({el: tag, w: Math.round(r.width), right: Math.round(r.right)});
    }
  });
  // section heights + padding (dead space detector)
  document.querySelectorAll('section, .hero, .statband, .dispo').forEach(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const padTop = parseFloat(cs.paddingTop), padBot = parseFloat(cs.paddingBottom);
    const cls = el.className && typeof el.className==='string' ? el.className.trim().split(/\\s+/).slice(0,2).join('.') : el.tagName.toLowerCase();
    // estimate content height = section height - padding ; flag if padding is a huge fraction
    const h = Math.round(r.height);
    const padTotal = Math.round(padTop+padBot);
    out.sections.push({cls, h, padTotal, padRatio: h>0 ? +(padTotal/h).toFixed(2) : 0});
  });
  // dedupe overflowers
  const seen=new Set(); out.overflowers = out.overflowers.filter(o=>{const k=o.el+o.w; if(seen.has(k))return false; seen.add(k); return true;}).slice(0,12);
  return out;
}"""

async def main():
    rep={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--no-sandbox","--ignore-certificate-errors"])
        for s in SITES:
            rep[s]={}
            for w in WIDTHS:
                c=await b.new_context(viewport={"width":w,"height":900},ignore_https_errors=True,
                                      is_mobile=(w<=420),device_scale_factor=2 if w<=420 else 1)
                pg=await c.new_page()
                await pg.goto(f"https://demo.azuradev.com/{s}/",wait_until="networkidle",timeout=30000)
                await pg.wait_for_timeout(800)
                data=await pg.evaluate(AUDIT_JS)
                rep[s][w]=data
                await c.close()
        await b.close()
    print(json.dumps(rep,ensure_ascii=False))

asyncio.run(main())
