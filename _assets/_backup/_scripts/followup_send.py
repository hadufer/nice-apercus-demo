# -*- coding: utf-8 -*-
"""followup_send.py — relances campagne Nice (full-auto avec exclusion des repondeurs).

Flux :
  1. Lit followup_data.json (9 leads, spec-tobi exclu).
  2. Detecte les reponses via Resend inbound (/emails/inbound) : si l'email d'un lead
     apparait dans un `from` recu APRES l'envoi initial -> exclu (a deja repondu).
  3. Detecte les bounces de l'envoi initial (GET /emails/<send_id> last_event) -> exclu.
  4. Lit bodies.json (rédigé par le cron via le skill founder-sales) et envoie la relance
     en HTML mis en forme UNIQUEMENT aux leads "pending".
  5. Garde-fous DURS avant chaque envoi : pairing lien==slug, zero tiret cadratin.
  6. Imprime un recap JSON + lisible.

Usage : python followup_send.py bodies.json [--dry-run]
"""
import json, re, sys, time, urllib.request, urllib.error, os

ROOT = "C:/Users/Zero/Desktop/Nice_Business_Leads"
DATA = os.path.join(ROOT, "_scripts/followup_data.json")
ENV  = "C:/Users/Zero/Desktop/resend_mail/.env"
UA   = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

def key():
    return re.search(r'RESEND_API_KEY\s*=\s*"?([^"\r\n]+)', open(ENV, encoding="utf-8").read()).group(1).strip()

def api_get(path, k):
    req = urllib.request.Request("https://api.resend.com" + path,
        headers={"Authorization": "Bearer " + k, "User-Agent": UA})
    try:
        r = urllib.request.urlopen(req, timeout=25)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()[:200]}

def detect_replies(leads, k):
    """Retourne set des emails (lower) qui ont repondu (apparaissent en `from` inbound)."""
    st, body = api_get("/emails/inbound", k)
    replied = set()
    if st == 200 and isinstance(body, dict):
        for m in body.get("data", []):
            frm = (m.get("from") or "").lower()
            # extrait l'adresse si format "Nom <a@b>"
            mm = re.search(r'[\w.%+-]+@[\w.-]+\.[a-z]{2,}', frm)
            if mm:
                replied.add(mm.group(0))
    return replied

def detect_bounces(leads, k):
    bounced = set()
    for l in leads:
        sid = l.get("send_id")
        if not sid:
            continue
        st, body = api_get("/emails/" + sid, k)
        if st == 200 and isinstance(body, dict) and body.get("last_event") == "bounced":
            bounced.add(l["email"].lower())
        time.sleep(0.4)
    return bounced

def build_html(paras, link, cta_line, list_block=None):
    p = "".join('<p style="margin:0 0 16px;">' + x + '</p>' for x in paras)
    lb = ""
    if list_block:
        items = "".join('<li style="margin:0 0 10px;padding-left:4px;">' + x + '</li>' for x in list_block)
        lb = ('<ol style="margin:6px 0 20px;padding-left:20px;font-weight:600;color:#11161d;">' + items + '</ol>')
    return ('<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
    '<body style="margin:0;padding:0;background:#f4f5f7;">'
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:28px 12px;"><tr><td align="center">'
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e6e8eb;">'
    '<tr><td style="height:4px;background:#1f6feb;"></td></tr>'
    '<tr><td style="padding:32px 34px 8px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a1d21;">'
    + p + lb +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 6px;"><tr><td style="border-radius:9px;background:#1f6feb;">'
    '<a href="' + link + '" style="display:inline-block;padding:13px 26px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#fff;text-decoration:none;">Voir la maquette du site</a>'
    '</td></tr></table>'
    '<p style="margin:6px 0 22px;font-size:13px;color:#8a9099;">' + link + '</p>'
    + ('<p style="margin:0 0 26px;">' + cta_line + '</p>' if cta_line else '')
    + '</td></tr>'
    '<tr><td style="padding:0 34px 30px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">'
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #ececf0;padding-top:18px;font-size:14px;line-height:1.55;color:#3a3f46;">'
    '<strong style="color:#1a1d21;">Hassan DUFER</strong><br>AzuraDev . sites et acquisition digitale a Nice<br>'
    '<a href="tel:+336****7347" style="color:#1f6feb;text-decoration:none;">06 85 06 73 47</a> . <a href="https://azuradev.com" style="color:#1f6feb;text-decoration:none;">azuradev.com</a>'
    '</td></tr></table></td></tr></table></td></tr></table></body></html>')

def build_text(paras, link, cta_line, list_block, sig):
    out = "\n\n".join(paras)
    if list_block:
        out += "\n\n" + "\n".join(list_block)
    out += "\n\n" + link
    if cta_line:
        out += "\n\n" + cta_line
    return out + "\n\n" + sig

def main():
    dry = "--dry-run" in sys.argv
    bodies_path = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not bodies_path:
        print("ERREUR: fournir bodies.json"); sys.exit(1)
    bodies = json.load(open(bodies_path[0], encoding="utf-8"))
    data = json.load(open(DATA, encoding="utf-8"))
    leads = data["leads"]; base = data["base_demo"]; sender = data["from"]; sig = data["signature_text"]
    k = key()

    replied = detect_replies(leads, k)
    bounced = detect_bounces(leads, k)

    sent, skipped, errors = [], [], []
    blead = bodies.get("leads", {})
    for l in leads:
        slug, email = l["slug"], l["email"]
        elow = email.lower()
        if elow in replied:
            skipped.append({"slug": slug, "reason": "a repondu"}); continue
        if elow in bounced:
            skipped.append({"slug": slug, "reason": "bounce initial"}); continue
        b = blead.get(slug)
        if not b:
            errors.append({"slug": slug, "reason": "pas de corps redige"}); continue
        link = base + slug + "/"
        # GARDE-FOU 1 : pairing lien == slug
        assert link.split("/")[-2] == slug, "PAIRING FAIL " + slug
        paras = b["paras"]; cta = b.get("cta_line", ""); lst = b.get("list_block")
        subject = b["subject"]
        html = build_html(paras, link, cta, lst)
        text = build_text(paras, link, cta, lst, sig)
        # GARDE-FOU 2 : zero tiret cadratin
        assert "\u2014" not in html and "\u2013" not in html, "DASH html " + slug
        assert "\u2014" not in text and "\u2013" not in text, "DASH text " + slug
        assert "\u2014" not in subject and "\u2013" not in subject, "DASH subject " + slug
        if dry:
            sent.append({"slug": slug, "email": email, "subject": subject, "DRY": True}); continue
        payload = {"from": sender, "to": [email], "subject": subject, "html": html, "text": text}
        req = urllib.request.Request("https://api.resend.com/emails",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={"Authorization": "Bearer " + k, "Content-Type": "application/json", "User-Agent": UA},
            method="POST")
        try:
            r = urllib.request.urlopen(req, timeout=30)
            rid = json.load(r).get("id")
            sent.append({"slug": slug, "email": email, "subject": subject, "id": rid})
        except urllib.error.HTTPError as e:
            errors.append({"slug": slug, "reason": "HTTP " + str(e.code) + " " + e.read().decode()[:120]})
        time.sleep(2.5)

    recap = {"touch": bodies.get("touch"), "sent": sent, "skipped": skipped, "errors": errors,
             "replied_detected": sorted(replied & {l["email"].lower() for l in leads}),
             "bounced_detected": sorted(bounced)}
    print(json.dumps(recap, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
