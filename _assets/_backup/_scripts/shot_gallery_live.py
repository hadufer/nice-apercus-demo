from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=["--no-sandbox","--ignore-certificate-errors"])
    pg=b.new_context(viewport={"width":1440,"height":900},ignore_https_errors=True).new_page()
    pg.goto("https://51.255.195.44.nip.io/",wait_until="networkidle"); pg.wait_for_timeout(1500)
    pg.screenshot(path="_index/_gallery_live.png",full_page=True)
    b.close()
print("done")
