# -*- coding: utf-8 -*-
"""Pilote refonte archetype : L'Atelier de Michel (home demonstrative)."""
import os
OUT="deploy/michel-peintre-v2"
PHONE="06 20 62 43 25"; TEL="+336****4325"
ADDR="59 Chem. du Val de Cagnes, 06800 Cagnes-sur-Mer"

def svg(p): return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'
CHECK=svg('<path d="M20 6 9 17l-5-5"/>')

# nuancier signature : teintes mediterraneennes nommees, derivees de la palette du peintre
SWATCHES=[
 ("#f4ece0","Blanc de chaux","Murs intérieurs","light"),
 ("#e0a86a","Ocre de Provence","Façades","dark"),
 ("#b85c2c","Terre de Sienne","Boiseries","dark"),
 ("#356b86","Bleu de Cagnes","Volets","dark"),
 ("#7d7a47","Olive","Extérieurs","dark"),
 ("#241c15","Brun encre","Ferronnerie","dark"),
]
def nuancier():
    sw="".join(f'<div class="sw {c}" style="background:{hexc}"><b>{name}</b><span>{use}</span></div>'
               for hexc,name,use,c in SWATCHES)
    return f"""<section class="nuancier" aria-label="Nuancier">
  <div class="row">
    <div class="label">Le nuancier de l atelier · teintes méditerranéennes</div>
    {sw}
  </div>
</section>"""

NAV=[("index.html","Accueil"),("#metier","Le métier"),("#prestations","Prestations"),
     ("#realisations","Réalisations"),("#contact","Contact")]
def navlinks():
    return "\n".join(f'<a href="{h}">{l}</a>' for h,l in NAV)

HEAD=f"""<!DOCTYPE html><html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>L'Atelier de Michel · artisan peintre à Cagnes-sur-Mer</title>
<meta name="description" content="Michel, artisan peintre à Cagnes-sur-Mer. Peinture intérieure, extérieure, ravalement de façade. La couleur juste, posée à la main. 5,0/5 sur 60 avis.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..560;1,9..144,400..560&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css"></head><body>
<header class="nav"><div class="wrap">
  <a href="index.html" class="brand">L<span class="a">'</span>Atelier de Michel<small>Artisan peintre · Cagnes-sur-Mer</small></a>
  <nav>{navlinks()}</nav>
  <a class="ph" href="tel:{TEL}">{PHONE}</a>
  <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
</div>
<div class="mobile-menu" id="mm">{navlinks()}<a class="btn ocre" style="margin-top:14px;justify-content:center" href="#contact">Devis gratuit</a></div>
</header>"""

FOOT=f"""<footer><div class="wrap"><div class="fgrid">
  <div><a href="index.html" class="brand" style="color:var(--paper);font-size:1.2rem">L<span class="a" style="color:var(--ocre)">'</span>Atelier de Michel</a>
    <p style="margin-top:14px">Peinture intérieure et extérieure, ravalement de façade et rénovation soignée à Cagnes-sur-Mer et sur la Côte d'Azur.</p>
    <p style="color:var(--or);font-weight:600">5,0 / 5 · 60 avis Google</p></div>
  <div><h4>Le métier</h4><a href="#prestations">Peinture intérieure</a><a href="#prestations">Peinture extérieure</a><a href="#prestations">Ravalement de façade</a><a href="#prestations">Enduits & finitions</a></div>
  <div><h4>Contact</h4><a href="tel:{TEL}">{PHONE}</a><p>{ADDR}</p><p>Lun - Sam · jusqu'à 20h30</p></div>
</div><div class="fbot"><span>© 2026 L'Atelier de Michel · Cagnes-sur-Mer (06)</span><span class="demo">Démo réalisée par Azura Dev</span></div>
</div></footer>
<script defer src="animate.js"></script>
<script>var b=document.getElementById('burger'),m=document.getElementById('mm');
if(b){{b.addEventListener('click',function(){{b.classList.toggle('open');m.classList.toggle('open');}});}}</script>
</body></html>"""

REVIEWS=[
 ("Audrey La font","Véritable expert en peinture intérieure et extérieure, il a réalisé une rénovation impeccable. Un professionnel de confiance."),
 ("Natalie Taro","Ponctuel, professionnel, il prend le temps d'écouter. Après plusieurs devis il a été le plus sérieux."),
 ("Anicet","Travail propre et soigné, intérieur comme extérieur. Résultat impeccable, je recommande !"),
]
def quotes():
    return "".join(f'<div class="quote reveal"><div class="stars">★★★★★</div><p>« {t} »</p><div class="who">{w} · avis Google</div></div>' for w,t in REVIEWS)

SERVICES=[
 ("01","Peinture intérieure","Murs, plafonds, boiseries et menuiseries. Une finition nette qui change une pièce, dans le respect de votre intérieur.",["Séjours & chambres","Plafonds","Boiseries","Cuisines & SDB"]),
 ("02","Peinture extérieure","Façades, murets, balcons et clôtures, avec des produits taillés pour le soleil et les embruns de la Côte.",["Façades","Balcons","Clôtures","Garde-corps"]),
 ("03","Ravalement de façade","Nettoyage, traitement, reprise des fissures et mise en peinture. On rend son éclat à votre maison.",["Haute pression","Anti-mousse","Fissures","Enduit"]),
 ("04","Enduits & finitions","Enduits lissés, effets matière et reprises ciblées pour un rendu haut de gamme, dedans comme dehors.",["Enduits lissés","Effets déco","Reprises","Préparation"]),
]
def elist():
    rows=""
    for idx,title,desc,chips in SERVICES:
        ch="".join(f"<span>{c}</span>" for c in chips)
        rows+=f"""<div class="erow reveal"><div class="top"><span class="idx">{idx}</span><h3>{title}</h3></div>
        <p>{desc}</p><div class="chips">{ch}</div></div>"""
    return rows

STEPS=[
 ("1","La visite","On regarde ensemble le support, la teinte et le budget. Conseil honnête, sans jargon."),
 ("2","Le devis","Un chiffrage clair et gratuit, détaillé poste par poste. Pas de surprise."),
 ("3","La préparation","Protection des sols et meubles, ponçage, rebouchage, sous-couche. Le détail commence ici."),
 ("4","La pose","Peinture en couches régulières, produits adaptés. Chantier propre chaque soir."),
 ("5","La livraison","Finitions vérifiées avec vous, chantier nettoyé. Vous validez le résultat."),
]
def timeline():
    return "".join(f'<div class="step reveal"><div class="n">{n}</div><div><h3>{t}</h3><p>{d}</p></div></div>' for n,t,d in STEPS)

GALLERY=[
 ("villa-provencale.jpg","Villa provençale · ravalement","w2"),
 ("interieur.jpg","Intérieur · préparation soignée",""),
 ("facade-ocre.jpg","Façade ocre · finitions","h2"),
 ("villa-terracotta.jpg","Façade terracotta",""),
 ("maison-toit.jpg","Maison · extérieur complet","w2"),
 ("echafaudage.jpg","Ravalement sur échafaudage",""),
 ("facade-moderne.jpg","Façade moderne",""),
]
def mosaic():
    return "".join(f'<a href="#contact" class="{cls}"><img src="img/{img}" alt="{cap}"><span class="cap">{cap}</span></a>' for img,cap,cls in GALLERY)

HOME=HEAD+f"""
<section class="hero">
  <div class="wrap">
    <div class="col-txt">
      <span class="kick">Artisan peintre · Cagnes-sur-Mer</span>
      <h1 id="h1"><span class="l"><i>La couleur</i></span><span class="l"><i>juste, posée</i></span><span class="l"><i>à la <em>main</em>.</i></span></h1>
      <p class="lead">Peinture intérieure, extérieure et ravalement de façade. Un seul artisan, du premier conseil à la dernière couche.</p>
      <div class="acts">
        <a class="btn ocre" href="#contact">Demander un devis gratuit</a>
        <a class="tel" href="tel:{TEL}">{PHONE}</a>
      </div>
    </div>
    <div class="col-img reveal">
      <div class="frame"><img src="img/villa-provencale.jpg" alt="Façade provençale rénovée par Michel"></div>
      <div class="badge"><div class="stars">★★★★★</div><b>5,0 / 5</b><span>60 avis Google</span></div>
    </div>
  </div>
</section>

{nuancier()}

<section id="metier">
  <div class="wrap">
    <div class="split">
      <div class="media reveal"><img src="img/echafaudage.jpg" alt="Ravalement de façade à Cagnes-sur-Mer">
        <div class="tag"><b>15 ans</b><span>de métier sur la Côte</span></div></div>
      <div class="reveal">
        <span class="kick">Le métier</span>
        <h2 style="margin:14px 0 16px">De la façade au plafond,<br>un même geste : le soin</h2>
        <p style="color:var(--ink-soft)">Rafraîchir un séjour, rénover une façade provençale ou protéger des murs des intempéries : le métier reste le même. Préparer, protéger, appliquer avec patience.</p>
        <ul>
          <li>{CHECK}<span>Un seul interlocuteur, du devis aux finitions</span></li>
          <li>{CHECK}<span>Chantier protégé et propre chaque jour</span></li>
          <li>{CHECK}<span>Le bon produit pour le bon support</span></li>
          <li>{CHECK}<span>Devis clair, sans surprise</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="alt" id="prestations">
  <div class="wrap">
    <div class="sec-head"><span class="kick">Prestations</span><h2>Quatre savoir-faire, un seul artisan</h2>
      <p>Tout ce qui touche à la peinture et à la façade, mené de bout en bout.</p></div>
    <div class="elist">{elist()}</div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head"><span class="kick">La méthode</span><h2>Comment se passe un chantier</h2>
      <p>Cinq étapes simples, pour un résultat dont vous serez fier.</p></div>
    <div class="timeline">{timeline()}</div>
  </div>
</section>

<section class="alt" id="realisations">
  <div class="wrap">
    <div class="sec-head"><span class="kick">Réalisations</span><h2>Des chantiers récents</h2>
      <p>Façades, intérieurs et rénovations autour de Cagnes-sur-Mer. Photos de chantiers réels.</p></div>
    <div class="mosaic">{mosaic()}</div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head"><span class="kick">Avis clients</span><h2>La voix de mes clients</h2>
      <p>Note de 5,0 / 5 sur 60 avis Google.</p></div>
    <div class="quotes">{quotes()}</div>
  </div>
</section>

<section class="alt" id="contact">
  <div class="wrap">
    <div class="cta reveal"><div class="in">
      <h2>Un projet de peinture ? Parlons-en.</h2>
      <p>Devis gratuit et sans engagement. Réponse rapide, conseil honnête et travail soigné.</p>
      <div class="acts"><a class="btn" href="tel:{TEL}">Appeler le {PHONE}</a>
        <a class="btn line" href="tel:{TEL}">Demander un devis</a></div>
    </div></div>
  </div>
</section>
"""+FOOT

open(os.path.join(OUT,"index.html"),"w",encoding="utf-8").write(HOME)
print("wrote index.html",len(HOME),"chars")
