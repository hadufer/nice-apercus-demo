import re, os

DIR = "deploy/09_atelier-du-traiteur"

# ---- real scraped menu (verbatim prices) ----
MENU = [
    ("Entrees", "ideales a partager", [
        ("Toasts", "Pain au levain, houmous, betterave et creme de feta", "4,50 €", "", "Vegetarien"),
        ("Salade verte", "Salade fraiche du jardin, legumes de saison et amandes grillees", "3,50 € / 5,50 €", "Petite / Moyenne", "Sans lactose"),
        ("Sashimi de thon", "Thon poele, herbes fraiches et une touche de chili", "4,50 €", "", "Legerement piquant"),
    ]),
    ("Plats principaux", "prepares chaque jour avec des produits locaux", [
        ("Raviolis faits maison", "Raviolis artisanaux fourres aux fromages, sauce au pesto de basilic", "6,50 €", "", ""),
        ("Brochettes de tofu", "Tofu grille marine soja-sesame, legumes de saison rotis", "7,50 €", "", "Vegetalien"),
        ("Poisson du jour", "Poisson du jour, asperges et creme de patate douce", "8,00 €", "", "Poisson"),
        ("Steak croustillant aux cacahuetes", "Steak tendre cuit a votre gout, legumes a la vapeur", "8,00 €", "", "Arachides"),
        ("Hamburger classique", "Laitue, cornichons, tomates et frites maison", "7,00 € / 7,50 € / 9,00 €", "Champignon / Poulet / Boeuf", ""),
        ("Escalope panee", "Croustillante, chapelure d herbes et parmesan", "4,00 €", "", ""),
    ]),
    ("Desserts", "prepares sur place par notre patissier", [
        ("Glace et confiserie de dates", "Glace vanille, sauce caramel et crumble aux cacahuetes", "7,00 €", "", "Vegetarien"),
        ("Cheesecake classique", "Couche de confiture de framboise et fraises", "6,50 €", "", ""),
        ("Tarte au citron meringuee", "Meringue au citron, crumble pistache, creme chantilly", "5,50 €", "", "Fruits a coque"),
        ("Mousse au chocolat", "Notre mousse delicate et riche", "4,00 € / 7,00 €", "Une boule / Deux boules", ""),
        ("Carrot cake", "Saveurs legeres, glacage au fromage frais", "5,50 €", "", ""),
        ("Brownie", "Sorti du four, pepites de chocolat noir et noix", "5,00 €", "", "Sans lactose"),
    ]),
    ("Boissons", "", [
        ("Smoothie detox", "Notre selection de smoothies bienfaisants", "3,00 €", "", ""),
        ("Jus de fruit frais", "Orange pressee, pasteque, carotte et gingembre", "2,00 € / 3,00 € / 4,50 €", "Petite / Moyenne / Grand", ""),
        ("Vin", "Selection de rouges, blancs ou roses", "2,00 €", "", ""),
        ("Sodas", "Eau petillante, Sprite, Pepsi, Coca Light", "1,50 €", "", ""),
        ("Cafe", "Cafe torrefie local", "1,50 €", "", ""),
        ("Cocktails", "Aperol Spritz, Gin Tonic, Mojito", "2,50 €", "", ""),
    ]),
]

PHOTOS = [
    ("dish-raviolis.jpg", "Raviolis faits maison"),
    ("dish-poisson.jpg", "Poisson du jour"),
    ("dish-burger.jpg", "Hamburger maison"),
    ("dish-escalope.jpg", "Escalope panee"),
    ("dish-tarte.jpg", "Tarte au citron meringuee"),
    ("dish-cheesecake.jpg", "Cheesecake"),
]

def esc(s):
    return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def cat_block(name, note, items):
    out = ['<div class="menu-cat reveal"><div class="cat-h"><h3>%s</h3>%s</div><ul class="menu-list">' % (
        esc(name), ('<span class="cat-note">%s</span>' % esc(note)) if note else "")]
    for nm, desc, price, sublabel, tag in items:
        tag_html = ('<span class="m-tag">%s</span>' % esc(tag)) if tag else ""
        sub_html = ('<small>%s</small>' % esc(sublabel)) if sublabel else ""
        out.append(
            '<li class="m-item"><div><div class="m-name">%s%s</div><div class="m-desc">%s</div></div>'
            '<div class="m-price">%s%s</div></li>' % (esc(nm), tag_html, esc(desc), esc(price), sub_html))
    out.append('</ul></div>')
    return "".join(out)

photos_html = "".join(
    '<figure class="reveal"><img src="img/%s" alt="%s" loading="lazy"><figcaption>%s</figcaption></figure>' % (f, esc(c), esc(c))
    for f, c in PHOTOS)

cats_html = "".join(cat_block(n, note, it) for n, note, it in MENU)

# pull header + footer from index.html, set active nav = menus
idx = open(f"{DIR}/index.html", encoding="utf-8").read()
header = idx[idx.index("<header"):idx.index("</header>")+len("</header>")]
footer = idx[idx.index("<footer"):idx.index("</footer>")+len("</footer>")]

# add Menu link to nav + mark active. Insert after Specialites link in both navs.
def add_menu_link(h):
    h = h.replace('<a href="specialites.html">Specialites</a>',
                  '<a href="specialites.html">Specialites</a><a href="menus.html" aria-current="page">Menu</a>', 1)
    # also add to mobile nav (second occurrence already covered by count=1 above -> do again)
    h = re.sub(r'(<a href="specialites.html">Specialites</a>)(<a href="evenements.html">Evenements</a><a href="contact.html">Contact</a><a href="contact.html">Demander)',
               r'\1<a href="menus.html" aria-current="page">Menu</a>\2', h)
    # remove stray active marker on Accueil for this page
    h = h.replace('<a href="index.html" aria-current="page">Accueil</a>', '<a href="index.html">Accueil</a>')
    return h
header = add_menu_link(header)
footer = footer.replace('<a class="fl" href="specialites.html">Specialites</a>',
                        '<a class="fl" href="specialites.html">Specialites</a><a class="fl" href="menus.html">Menu</a>', 1)

HERO = ('<section class="hero" style="min-height:52vh"><div class="bg"><img src="img/paella.jpg" alt=""></div>'
        '<div class="hero-in"><span class="badge">Carte du soir · service 18h-23h</span>'
        '<h1>Notre carte<span>Faite maison, chaque jour</span></h1>'
        '<p class="sub">Une cuisine de saison preparee a partir de produits locaux en circuit court. '
        'Entrees a partager, plats du jour et desserts maison signes par notre patissier.</p>'
        '<div class="btns"><a class="btn btn-accent" href="contact.html">Demander un menu</a>'
        '<a class="btn btn-line" href="tel:+33489158465">04 89 15 84 65</a></div></div></section>')

INTRO = ('<section><div class="wrap"><div class="sec-head ctr"><div class="kicker ctr">La carte</div>'
         '<h2 class="sec">Entrees, plats, desserts</h2>'
         '<p class="lead" style="margin-inline:auto">Tous nos plats sont prepares sur place. '
         'Commande 48h a l avance, livraison a domicile possible.</p></div>'
         '<div class="menu-grid"><div>%s</div><div class="menu-photos">%s</div></div>'
         '<div class="menu-note reveal"><b>Bon a savoir :</b> la carte evolue avec les saisons et les arrivages. '
         'Pour vos evenements, nous composons un menu sur mesure, pensez a commander 48h a l avance.</div>'
         '</div></section>') % (cats_html, photos_html)

page = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        "<title>Notre carte et nos prix | L'Atelier du Traiteur</title>\n"
        '<meta name="description" content="La carte de L\'Atelier du Traiteur a Saint-Jeannet : entrees, plats et desserts faits maison avec prix. Cuisine de saison en circuit court.">\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">\n'
        '<link rel="stylesheet" href="style.css">\n</head>\n<body>\n'
        + header + HERO + INTRO + footer +
        '\n<script defer src="animate.js"></script>\n</body></html>')

open(f"{DIR}/menus.html", "w", encoding="utf-8").write(page)
print("wrote menus.html", len(page), "bytes")
print("em/en dashes:", page.count("\u2014") + page.count("\u2013"))
print("price hits:", page.count("€"))
