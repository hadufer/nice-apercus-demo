from playwright.sync_api import sync_playwright
import os
B="https://51.255.195.44.nip.io"
slugs=["01_plomberie-riviera","02_le-siamois-traiteur","03_spec-tobi","04_bellomo-plomberie",
       "05_nice-travaux-renov","06_romain-plomberie","07_agp-plomberie","08_light-elec",
       "09_atelier-du-traiteur","10_lm-artisan"]
os.makedirs("_thumbs",exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=["--no-sandbox","--ignore-certificate-errors"])
    # 800x500 @ dsf2 -> crisp 1600x1000 thumb matching the 8:5 gallery card, hero crop from top
    ctx=b.new_context(viewport={"width":800,"height":500},device_scale_factor=2,ignore_https_errors=True)
    for s in slugs:
        pg=ctx.new_page()
        pg.goto(f"{B}/{s}/",wait_until="networkidle")
        pg.wait_for_timeout(2300)   # let hero animation settle (GSAP/Motion/CSS)
        pg.screenshot(path=f"_thumbs/{s}.jpg",quality=86,type="jpeg")  # viewport only = hero
        pg.close()
        print("thumb",s)
    b.close()
print("ALL THUMBS DONE")
