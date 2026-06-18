import os,glob,math
from PIL import Image, ImageDraw, ImageFont
src=sorted(glob.glob("_index/_atelier_src/img/*"))
keep=[]
for p in src:
    try:
        im=Image.open(p); w,h=im.size
        if min(w,h)>=400 and w*h>=260000: keep.append((p,w,h))
    except: pass
cols=5; cell=300; pad=28; rows=math.ceil(len(keep)/cols)
sheet=Image.new("RGB",(cols*cell, rows*cell),(245,243,238))
d=ImageDraw.Draw(sheet)
for i,(p,w,h) in enumerate(keep):
    im=Image.open(p).convert("RGB"); im.thumbnail((cell-pad,cell-pad))
    x=(i%cols)*cell; y=(i//cols)*cell
    sheet.paste(im,(x+10,y+10))
    d.text((x+12,y+cell-22),f"{i}: {os.path.basename(p)} {w}x{h}",fill=(20,20,20))
sheet.save("_index/_atelier_src/contact_sheet.jpg",quality=85)
print("kept",len(keep),"-> contact_sheet.jpg")
for i,(p,w,h) in enumerate(keep): print(i,os.path.basename(p),w,h)
