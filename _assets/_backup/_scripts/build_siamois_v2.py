# -*- coding: utf-8 -*-
"""Pilote archetype TRAITEUR : Le Siamois (hero diptyque + carte-menu signature)."""
import os
OUT="deploy/siamois-v2"
PHONE="06 60 35 70 74"; TEL="+336****7074"

NAV=[("index.html","Accueil"),("#formules","Formules"),("#carte","La carte"),
     ("#galerie","Galerie"),("#reserver","Reserver")]
def navlinks(): return "\n".join(f'<a href="{h}">{l}</a>' for h,l in NAV)

HEAD=f"""<!DOCTYPE html><html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Le Siamois - traiteur thai a Nice - cocktail, buffet, chef a domicile</title>
<meta name="description" content="Le Siamois, traiteur thai a Nice. Cocktail et finger food, buffet thai, chef a domicile. Une cuisine du Siam dressee a la main pour vos receptions.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css"></head><body>
<header class="nav"><div class="wrap">
  <a href="index.html" class="brand">Le Siamois<span class="th">{chr(3626)+chr(3618)+chr(3634)+chr(3617)}</span></a>
  <nav>{navlinks()}</nav>
  <a class="resa" href="#reserver">Reserver une date</a>
  <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
</div>
<div class="mobile-menu" id="mm">{navlinks()}<a class="btn" style="margin-top:14px;justify-content:center" href="#reserver">Reserver</a></div>
</header>"""

FOOT=f"""<footer><div class="wrap"><div class="fgrid">
  <div><div class="brand" style="font-size:1.5rem;margin-bottom:12px">Le Siamois</div>
    <p>Traiteur thai a Nice. Cocktail, buffet et chef a domicile. Une cuisine du Siam, dressee a la main, pour vos receptions et evenements.</p></div>
  <div><h4>Formules</h4><a href="#formules">Cocktail & finger food</a><a href="#formules">Buffet thai</a><a href="#carte">Chef a domicile</a><a href="#galerie">Galerie</a></div>
  <div><h4>Reservation</h4><a href="tel:{TEL}">{PHONE}</a><p>Nice et alentours (06)</p><a href="#reserver" class="btn" style="margin-top:10px">Reserver une date</a></div>
</div><div class="fbot"><span>(c) 2026 Le Siamois - traiteur thai - Nice</span><span class="demo">Demo realisee par Azura Dev</span></div>
</div></footer>
<script defer src="animate.js"></script>
<script>var b=document.getElementById('burger'),m=document.getElementById('mm');
if(b){{b.addEventListener('click',function(){{b.classList.toggle('open');m.classList.toggle('open');}});}}</script>
</body></html>"""

REVIEWS=[
 ("Sophie M.","Un cocktail dinatoire d'exception pour notre mariage. Les bouchees thai ont fait l'unanimite, tout etait dresse a la main avec une finesse rare."),
 ("Karim B.","Le chef est venu cuisiner chez nous, un veritable voyage. Produits frais du jour, service impeccable et cuisine laissee nickel."),
 ("Laure D.","Buffet thai pour 40 personnes, varie et genereux. Ponctuel, soigne, savoureux. On recommande les yeux fermes."),
]
def quotes():
    return "".join(f'<div class="quote reveal"><div class="stars">★★★★★</div><p>« {t} »</p><div class="who">{w} · Nice</div></div>' for w,t in REVIEWS)

# carte-menu editoriale : formules CHEF (4 menus verbatim) th deco
TH={"bangkok":chr(3626)+chr(3605)+chr(3619)+chr(3637)+chr(3607)+chr(3615)+chr(3641)+chr(3657)+chr(3604),
    "royal":chr(3619)+chr(3629)+chr(3618)+chr(3633)+chr(3621),"samed":chr(3648)+chr(3585)+chr(3634)+chr(3632)+chr(3648)+chr(3626)+chr(3617)+chr(3655)+chr(3604)}
MENUS=[
 ("Bangkok Street Food","50 € / convive",
  [("Amuse-bouche","Croustilles de galette de riz"),
   ("Entree","Aumoniere croustillante au porc, sauce aigre-douce"),
   ("Plat","Pad Thai, nouilles sautees aux crevettes & tamarin"),
   ("Dessert","Banane au riz gluant grillee en feuille de bananier")]),
 ("Royal Thai","60 € / convive",
  [("Amuse-bouche","Maa Hor, ananas au porc hache & arachides"),
   ("Entree","Mee Grob, nouilles croquantes, crevettes & porc"),
   ("Plat","Massaman Nua, curry de boeuf massaman, riz nature"),
   ("Dessert","Tabtim Grob, chataignes d'eau au lait de coco")]),
 ("Koh Samed","50 € / convive",
  [("Amuse-bouche","Maa Hor, ananas au porc hache"),
   ("Entree","Toasts aux crevettes"),
   ("Plat","Chuchee Pla, curry chu chi de saumon, riz nature"),
   ("Dessert","Nem au chocolat")]),
 ("Khaosan Road","45 € / convive",
  [("Amuse-bouche","Croustilles maison"),
   ("Entree","Nems au poulet, sauce nuoc-mam"),
   ("Plat","Emince de poulet au basilic thai, riz parfume"),
   ("Dessert","Mangue au riz gluant")]),
]
def menu_html():
    out=""
    for nm,pr,courses in MENUS:
        lines="".join(f'<div class="line"><span class="role">{r}</span><span class="dish">{d}</span></div>' for r,d in courses)
        out+=f"""<div class="formula reveal">
        <div class="fhead"><span class="nm">{nm}</span><span class="pr">{pr}</span></div>
        <div class="courses">{lines}</div></div>"""
    return out

# formules cocktail/buffet (B11 tableau prix editorial condense)
FORMULES=[
 ("Cocktail & finger food","De 27 à 37 € HT / pers","10 à 16 pieces dressees a la main, 3 menus a la piece. Minimum 20 personnes.","cocktail-hero.jpg"),
 ("Buffet thai","De 31 à 44 € HT / convive","Entrees, plats au wok, accompagnements et desserts. 3 tables au choix, minimum 30 convives.","buffet-grand.jpg"),
 ("Chef a domicile","Forfait 150 € + 45 à 60 € / convive","Un veritable chef chez vous le temps d'une soiree. Achat des produits frais, service et nettoyage compris.","chef-station.jpg"),
]
def formules_bands():
    out=""
    for i,(nm,pr,desc,img) in enumerate(FORMULES):
        rev=" rev" if i%2 else ""
        out+=f"""<div class="band{rev} reveal">
        <div class="ph"><img src="img/{img}" alt="{nm}"></div>
        <div class="tx"><span class="kick">Formule</span><h3>{nm}</h3><p>{desc}</p>
          <div style="font-family:var(--ff-display);font-size:1.5rem;color:var(--or);font-weight:600">{pr}</div></div>
      </div>"""
    return out

GALLERY=[("padthai-plate.jpg","w2"),("satay.jpg",""),("mango-rice.jpg","h2"),("verrines-green.jpg",""),
         ("curry-rice.jpg",""),("nems.jpg","w2"),("dumplings.jpg",""),("beef-salad.jpg",""),("plated-dessert.jpg","")]
def mosaic():
    return "".join(f'<a href="#reserver" class="{c}"><img src="img/{img}" alt="Plat thai Le Siamois"></a>' for img,c in GALLERY)

HOME=HEAD+f"""
<section class="hero">
  <div class="dip">
    <div class="panel reveal"><img src="img/cocktail-hero.jpg" alt="Cocktail finger food thai">
      <div class="pl"><span class="th">{chr(3588)+chr(3655)+chr(3629)+chr(3585)+chr(3648)+chr(3607)+chr(3621)}</span><b>Cocktail & buffet</b><span>Pour vos receptions</span></div></div>
    <div class="panel reveal"><img src="img/chef-station.jpg" alt="Chef thai a domicile">
      <div class="pl"><span class="th">{chr(3648)+chr(3594)+chr(3615)}</span><b>Chef a domicile</b><span>Le Siam a votre table</span></div></div>
  </div>
  <div class="center"><div class="box">
    <span class="th">{chr(3629)+chr(3634)+chr(3627)+chr(3634)+chr(3619)+chr(3652)+chr(3607)+chr(3618)}</span>
    <h1>Une cuisine<br>du <em>Siam</em></h1>
    <p>Traiteur thai a Nice. Cocktail, buffet et chef a domicile, dresses a la main pour vos plus belles tables.</p>
    <div class="acts"><a class="btn" href="#reserver">Reserver une date</a><a class="btn line" href="#formules">Voir les formules</a></div>
  </div></div>
</section>

<div class="statband"><div class="wrap"><div class="row">
  <div><b>3</b><span>formules sur mesure</span></div>
  <div><b>20+</b><span>plats thai a la carte</span></div>
  <div><b>100%</b><span>frais, fait main</span></div>
  <div><b>Nice</b><span>et alentours (06)</span></div>
</div></div></div>

<section id="formules">
  <div class="wrap">
    <div class="sec-head"><span class="kick">Trois facons de recevoir</span><h2>Nos formules</h2>
      <p>Du cocktail dinatoire au chef qui cuisine chez vous, une cuisine thaie genereuse et raffinee.</p></div>
  </div>
  {formules_bands()}
</section>

<section class="jade-sec" id="carte">
  <div class="wrap">
    <div class="sec-head"><span class="kick">Chef a domicile</span><h2>Quatre diners signes</h2>
      <p>Amuse-bouche, entree, plat et dessert, tout est fait sur place. Minimum 4 convives, hors forfait chef.</p></div>
    <div class="menu">{menu_html()}</div>
  </div>
</section>

<section id="galerie">
  <div class="wrap">
    <div class="sec-head"><span class="kick">Galerie</span><h2>Quelques tables recentes</h2>
      <p>Bouchees, buffets et assiettes signees Le Siamois.</p></div>
    <div class="mosaic">{mosaic()}</div>
  </div>
</section>

<section class="jade-sec">
  <div class="wrap">
    <div class="sec-head"><span class="kick">Ils ont recu</span><h2>La voix de nos convives</h2></div>
    <div class="quotes">{quotes()}</div>
  </div>
</section>

<section id="reserver">
  <div class="wrap">
    <div class="cta reveal" style="background:var(--jade);color:var(--creme);border-radius:8px;padding:60px 40px">
      <span class="kick" style="justify-content:center">Reservation</span>
      <h2 style="color:var(--creme)">Reservez votre date</h2>
      <p>Dites-nous votre evenement, le nombre de convives et la date. Nous composons votre menu thai sur mesure.</p>
      <div class="acts" style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
        <a class="btn" href="tel:{TEL}">Appeler le {PHONE}</a>
        <a class="btn line" href="tel:{TEL}">Demander un menu</a></div>
    </div>
  </div>
</section>
"""+FOOT

open(os.path.join(OUT,"index.html"),"w",encoding="utf-8").write(HOME)
print("wrote index.html",len(HOME),"chars")
