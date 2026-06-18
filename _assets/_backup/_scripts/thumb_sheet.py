from playwright.sync_api import sync_playwright
import pathlib, glob, os
thumbs=sorted(glob.glob("_thumbs/*.jpg"))
cells="".join(f'<figure><img src="{pathlib.Path(t).resolve().as_uri()}"><figcaption>{os.path.basename(t)}</figcaption></figure>' for t in thumbs)
html=f'<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:8px;font-family:sans-serif">'+ \
     cells.replace("<figure>",'<figure style="margin:0">').replace("<figcaption>",'<figcaption style="color:#fff;font-size:13px;padding:4px">')+ \
     '<style>img{width:100%;display:block;border:1px solid #333}</style></body></html>'
open("_sheet.html","w",encoding="utf-8").write(html)
with sync_playwright() as p:
    b=p.chromium.launch(args=["--no-sandbox"])
    pg=b.new_context(viewport={"width":1100,"height":1400}).new_page()
    pg.goto(pathlib.Path("_sheet.html").resolve().as_uri()); pg.wait_for_timeout(900)
    pg.screenshot(path="../_index/_thumbs_sheet.png",full_page=True)
    b.close()
os.remove("_sheet.html")
print("sheet done")
