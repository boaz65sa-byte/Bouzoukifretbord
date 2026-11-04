# usage: overlay.py <html> <pdf> <out.jpg>  → V14 detection overlay of page 1 (+ debug json on stdout)
import json,sys,base64
from playwright.sync_api import sync_playwright
html,pdf,out=sys.argv[1:4]
with sync_playwright() as p:
  b=p.chromium.launch(args=['--allow-file-access-from-files']);pg=b.new_page();pg.goto('file://'+html);pg.wait_for_timeout(1000)
  r=pg.evaluate("async u=>{const b=await (await fetch(u)).arrayBuffer();const cvs=await V13.renderPDF(b);V14.dbg=[];V14.cls=[];await V14.bookDetect(cvs[0]);return {dbg:V14.dbg,cls:V14.cls.map(c=>c.text),img:V14.overlay()}}",'file://'+pdf)
  open(out,'wb').write(base64.b64decode(r.pop('img').split(',')[1]));print(json.dumps(r,ensure_ascii=False))
