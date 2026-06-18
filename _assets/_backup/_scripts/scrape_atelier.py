import re, json, sys
from scrapling.fetchers import StealthyFetcher

BASE = "http://latelierdutraiteur.com"
OUT = "_index/_atelier_src"
import os; os.makedirs(OUT, exist_ok=True)

def body_of(p):
    return p.html_content if hasattr(p, "html_content") else p.body.decode("utf-8", "ignore")

def imgs_from(html):
    found = set()
    for u in re.findall(r'https://static\.wixstatic\.com/media/[^\s"\')]+', html):
        m = re.search(r'(https://static\.wixstatic\.com/media/[^/]+\.(?:jpg|jpeg|png|webp|gif))', u)
        if m:
            full = m.group(1)
            if re.search(r'wix_logo|wixmp|sentry|avatar|favicon|blank|button|icon|/shapes/', full, re.I):
                continue
            found.add(full)
    return found

print("fetch home...", flush=True)
home = StealthyFetcher.fetch(BASE, headless=True, network_idle=True, timeout=60000)
hb = body_of(home)
open(f"{OUT}/home.html", "w", encoding="utf-8").write(hb)

# discover nav
navs = set()
for h in re.findall(r'href="(' + re.escape(BASE) + r'/[^"]*)"', hb):
    if re.search(r'\.(jpg|png|css|js|pdf)$', h, re.I): continue
    navs.add(h.split("#")[0].rstrip("/"))
navs.discard(BASE)
print("NAV:", sorted(navs), flush=True)

all_imgs = imgs_from(hb)
texts = {"home": hb}
for u in sorted(navs):
    try:
        print("fetch", u, flush=True)
        p = StealthyFetcher.fetch(u, headless=True, network_idle=True, timeout=60000)
        b = body_of(p)
        slug = u.rsplit("/", 1)[-1] or "page"
        open(f"{OUT}/{slug}.html", "w", encoding="utf-8").write(b)
        texts[slug] = b
        all_imgs |= imgs_from(b)
    except Exception as e:
        print("ERR", u, e, flush=True)

open(f"{OUT}/all_images.txt", "w", encoding="utf-8").write("\n".join(sorted(all_imgs)))
json.dump({"nav": sorted(navs), "n_images": len(all_imgs)}, open(f"{OUT}/scrape.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"TOTAL IMAGES: {len(all_imgs)}", flush=True)

# extract visible text with € prices
def visible(html):
    t = re.sub(r'<script[\s\S]*?</script>', ' ', html)
    t = re.sub(r'<style[\s\S]*?</style>', ' ', t)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = re.sub(r'&nbsp;', ' ', t); t = re.sub(r'&amp;', '&', t)
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

price_ctx = []
for slug, html in texts.items():
    vt = visible(html)
    open(f"{OUT}/text_{slug}.txt", "w", encoding="utf-8").write(vt)
    for m in re.finditer(r'.{0,80}\d+[\s,.]*\d*\s*(?:€|euros)', vt):
        price_ctx.append(f"[{slug}] {m.group(0).strip()}")
open(f"{OUT}/prices.txt", "w", encoding="utf-8").write("\n".join(price_ctx))
print("PRICE SNIPPETS:", len(price_ctx), flush=True)
print("\n".join(price_ctx[:40]))
