from playwright.sync_api import sync_playwright
B="https://51.255.195.44.nip.io"
t={"lightelec":f"{B}/08_light-elec/","agp":f"{B}/07_agp-plomberie/",
   "bellomo":f"{B}/04_bellomo-plomberie/","lm":f"{B}/10_lm-artisan/"}
with sync_playwright() as p:
    b=p.chromium.launch(args=["--no-sandbox","--ignore-certificate-errors"])
    ctx=b.new_context(viewport={"width":1440,"height":900},ignore_https_errors=True)
    for n,u in t.items():
        pg=ctx.new_page(); pg.goto(u,wait_until="networkidle"); pg.wait_for_timeout(2000)
        pg.screenshot(path=f"_index/_qa2_{n}.png"); pg.close()
    b.close()
print("done")
