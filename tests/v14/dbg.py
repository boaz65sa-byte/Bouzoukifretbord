import json,sys,base64
from playwright.sync_api import sync_playwright
html,pdf=sys.argv[1:3];js=sys.argv[3] if len(sys.argv)>3 else "async()=>{const b=await (await fetch(window.__pdf)).arrayBuffer();const cvs=await V13.renderPDF(b);const cv=V13.deskew(cvs[0]);const G=V13.gray(cv);const r=V13.staves(G);V13.dbg=[];const bd=await V13.bookDetect(cvs[0]);return {skew:V13.skew,S:r.S,dbg:V13.dbg,n:bd&&bd.bars.length}}"
with sync_playwright() as p:
  b=p.chromium.launch(args=['--allow-file-access-from-files']);pg=b.new_page()
  pg.goto('file://'+html);pg.wait_for_timeout(1000)
  pg.evaluate("u=>window.__pdf=u",'file://'+pdf)
  print(json.dumps(pg.evaluate(js),ensure_ascii=False))
