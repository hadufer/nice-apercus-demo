from playwright.sync_api import sync_playwright
import pathlib
url = pathlib.Path("deploy/09_atelier-du-traiteur/menus.html").resolve().as_uri()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox"])
    # mobile
    m = b.new_context(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True)
    pg = m.new_page(); pg.goto(url); pg.wait_for_timeout(1200)
    for _ in range(6):
        pg.mouse.wheel(0,700); pg.wait_for_timeout(350)
    pg.wait_for_timeout(400)
    pg.screenshot(path="_index/_atelier_src/qa_menu_mobile.png", full_page=True)
    # desktop
    d = b.new_context(viewport={"width":1440,"height":900}, device_scale_factor=1)
    pg2 = d.new_page(); pg2.goto(url); pg2.wait_for_timeout(1200)
    for _ in range(5):
        pg2.mouse.wheel(0,800); pg2.wait_for_timeout(350)
    pg2.wait_for_timeout(400)
    pg2.screenshot(path="_index/_atelier_src/qa_menu_desktop.png", full_page=True)
    b.close()
print("shots done")
