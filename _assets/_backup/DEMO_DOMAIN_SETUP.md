# demo.azuradev.com wiring (Dokploy app apercus-web)

DNS: demo.azuradev.com  A  51.255.195.44 (already owned, OVH).

Dokploy app apercus-web:
- applicationId = eB9u5f6DOdivWXGC308iO
- deploy webhook id = lie7mNwO8waiRdKiKkORd

Two steps were needed (the deploy webhook alone does NOT add a domain):
1. INSERT a row in Postgres table `domain` (host=demo.azuradev.com, port 80, https=true,
   certificateType=letsencrypt, domainType=application, applicationId above).
2. The deploy did NOT regenerate the Traefik dynamic file from the DB, so the routers
   were added by hand to:
   /etc/dokploy/traefik/dynamic/app-quantify-cross-platform-program-cnp4ml.yml
   (added router-demo + router-websecure-demo pointing at the same service-12, host
   `demo.azuradev.com`). Traefik hot-reloads the dynamic dir; Let's Encrypt issued the
   cert within ~40s. See traefik_apercus-web.yml in this folder for the full file.

Live: https://demo.azuradev.com/  (gallery) and /<slug>/ per site.
