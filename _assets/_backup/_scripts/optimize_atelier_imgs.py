from PIL import Image, ImageOps
import os
SRC = "_index/_atelier_src/img"
DST = "deploy/09_atelier-du-traiteur/img"
os.makedirs(DST, exist_ok=True)

# map source index -> semantic filename, (max_w)
M = {
    "01": ("hero.jpg", 1800),          # paella royale gambas (refresh hero, bigger)
    "10": ("about.jpg", 1500),         # le chef devant le buffet
    "09": ("event.jpg", 1600),         # buffet dressé
    "14": ("event-hall.jpg", 1600),    # grande salle / soirée
    "22": ("event-wedding.jpg", 1600), # salle mariage
    "07": ("paella.jpg", 1400),        # paella pan top
    # --- plated dish shots (menu) ---
    "27": ("dish-toast.jpg", 1100),
    "34": ("dish-salade.jpg", 1100),
    "38": ("dish-sashimi.jpg", 1100),
    "19": ("dish-raviolis.jpg", 1300),
    "31": ("dish-tofu.jpg", 1100),
    "41": ("dish-poisson.jpg", 1100),
    "33": ("dish-steak.jpg", 1100),
    "37": ("dish-burger.jpg", 1100),
    "35": ("dish-escalope.jpg", 1100),
    "29": ("dish-tarte.jpg", 1100),
    "39": ("dish-cheesecake.jpg", 1100),
    "30": ("dish-mousse.jpg", 1100),
    "36": ("dish-carrotcake.jpg", 1100),
}
done = 0
for idx, (name, mw) in M.items():
    src = f"{SRC}/{idx}.jpg"
    if not os.path.exists(src):
        print("MISSING", src); continue
    im = Image.open(src)
    im = ImageOps.exif_transpose(im).convert("RGB")
    im.thumbnail((mw, mw))
    im.save(f"{DST}/{name}", quality=82, optimize=True, progressive=True)
    done += 1
print("optimized", done, "images")
print("\n".join(sorted(os.listdir(DST))))
