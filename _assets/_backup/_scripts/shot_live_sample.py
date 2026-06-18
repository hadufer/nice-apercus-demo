from playwright.sync_api import sync_playwright
B="https://51.255.195.44.nip.io"
targets={
 "siamois_gsap":f"{B}/02_le-siamois-traiteur/",      # GSAP
 "spectobi_motion":f"{B}/03_spec-tobi/",             # Motion (font fix)
 "nicetravaux_kinetic":f"{B}/05_nice-travaux-renov/",# kinetic (font fix)
 "lightelec_motion":f"{B}/08_light-elec/",           # Motion (font fix)
 "bellomo_css":f"{B}/04_bellomo-plomberie/",         # CSS sober
}
with sync_playwright() as p:
    b=p.chromium.launch(args=["--no-sandbox","--ignore-certificate-errors"])
    ctx=b.new_context(viewport={"width":1440,"height":900},ignore_https_errors=True)
    for name,url in targets.items():
        pg=ctx.new_page(); pg.goto(url,wait_until="networkidle"); pg.wait_for_timeout(2200)
        pg.screenshot(path=f"_index/_qa_{name}.png")  # above-fold = hero signature
        pg.close()
    b.close()
print("shots done")
