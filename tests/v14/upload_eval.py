# usage: upload_eval.py <html> <pdf> <hand.json> <shot.png>  → OCR-import a scan via ➕ הוסף and score it vs the hand transcription
import json,sys
from playwright.sync_api import sync_playwright
html,pdf,handf,shot=sys.argv[1:5];H=json.load(open(handf))
def score(G):
  n,m=len(H),len(G);D=[[0]*(m+1) for _ in range(n+1)]
  for i in range(n+1):D[i][0]=i
  for j in range(m+1):D[0][j]=j
  for i in range(1,n+1):
    for j in range(1,m+1):D[i][j]=min(D[i-1][j]+1,D[i][j-1]+1,D[i-1][j-1]+(H[i-1][0]!=G[j-1][0]))
  i,j,fm,sm=n,m,0,0
  while i and j:
    if D[i][j]==D[i-1][j-1]+(H[i-1][0]!=G[j-1][0]):
      if H[i-1][0]==G[j-1][0]:fm+=1;sm+=H[i-1][1]==G[j-1][1]
      i-=1;j-=1
    elif D[i][j]==D[i-1][j]+1:i-=1
    else:j-=1
  return dict(hand=n,ocr=m,fret_acc=round(100*fm/n,1),string_acc=round(100*sm/n,1))
with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto('file://'+html);pg.wait_for_timeout(1200);pg.evaluate("localStorage.clear()")
  pg.click('#addb');pg.set_input_files('#afile',pdf);pg.wait_for_timeout(300);pg.click('#aan')
  pg.wait_for_function("()=>{const t=document.getElementById('amsg').textContent;return /נמצאו|לא נמצאו|שגיאה/.test(t)}",timeout=600000);pg.wait_for_timeout(3000)
  msg=pg.inner_text('#amsg');pg.screenshot(path=shot,full_page=True)
  G=pg.evaluate("()=>parsed&&parsed.book?parsed.notes.map(n=>[n.fret,n.course]):[]")
  r=score(G) if G else dict(hand=len(H),ocr=0,fret_acc=0,string_acc=0)
  r.update(msg=msg,errors=errs,title=pg.evaluate("()=>V13.last&&V13.last.title"),bars=pg.evaluate("()=>{const e=document.getElementById('v13bars');return e?e.value:''}"))
  print(json.dumps(r,ensure_ascii=False))
