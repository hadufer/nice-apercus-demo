import os, re, urllib.request, ssl
ctx = ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
OUT="_index/_atelier_src/img"; os.makedirs(OUT, exist_ok=True)
urls=[u for u in open("_index/_atelier_src/all_images.txt",encoding="utf-8").read().split() if u.strip()]
hdr={"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
     "Referer":"https://www.latelierdutraiteur.com/"}
ok=0
for i,u in enumerate(urls):
    ext=re.search(r'\.(jpg|jpeg|png|webp|gif)',u,re.I)
    ext=ext.group(1).lower() if ext else "jpg"
    fn=f"{OUT}/{i:02d}.{ext}"
    try:
        req=urllib.request.Request(u,headers=hdr)
        data=urllib.request.urlopen(req,timeout=40,context=ctx).read()
        if len(data)<3000: continue
        open(fn,"wb").write(data); ok+=1
    except Exception as e:
        print("ERR",i,e)
print("downloaded",ok,"of",len(urls))
