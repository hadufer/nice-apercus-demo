import re, json, os, urllib.parse
from scrapling.fetchers import StealthyFetcher

BASE = "https://www.latelierdutraiteur.com"
OUT = "_index/_atelier_src"
os.makedirs(OUT, exist_ok=True)

SLUGS = ["menus", "nos-spécialitées", "galerie", "a-propos", "accueil"]

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

def visible(html):
    t = re.sub(r'<script[\s\S]*?</script>', ' ', html)
    t = re.sub(r'<style[\s\S]*?</style>', ' ', t)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = t.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&#39;', "'").replace('&eacute;','é')
    return re.sub(r'\s+', ' ', t).strip()

all_imgs = set()
prices = []
for slug in SLUGS:
    url = BASE + "/" + urllib.parse.quote(slug)
    try:
        print("fetch", url, flush=True)
        p = StealthyFetcher.fetch(url, headless=True, network_idle=True, timeout=60000)
        b = body_of(p)
        safe = slug.encode("ascii", "ignore").decode() or "page"
        open(f"{OUT}/p_{safe}.html", "w", encoding="utf-8").write(b)
        vt = visible(b)
        open(f"{OUT}/text_{safe}.txt", "w", encoding="utf-8").write(vt)
        all_imgs |= imgs_from(b)
        for m in re.finditer(r'.{0,90}?\d+[\s,.]*\d*\s*(?:€|euros)', vt):
            prices.append(f"[{safe}] {m.group(0).strip()}")
    except Exception as e:
        print("ERR", slug, e, flush=True)

# merge with earlier home images
prev = f"{OUT}/all_images.txt"
if os.path.exists(prev):
    all_imgs |= set(open(prev, encoding="utf-8").read().split())
open(f"{OUT}/all_images.txt", "w", encoding="utf-8").write("\n".join(sorted(all_imgs)))
open(f"{OUT}/prices.txt", "w", encoding="utf-8").write("\n".join(prices))
print(f"\nTOTAL IMAGES: {len(all_imgs)}", flush=True)
print(f"PRICE SNIPPETS: {len(prices)}", flush=True)
for x in prices[:60]: print(x)
