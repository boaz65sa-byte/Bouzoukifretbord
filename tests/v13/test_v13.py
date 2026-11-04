# v13 tests · bs-simple.com · פתרונות יצירתיים · בועז סעדה
import json,os,sys
from playwright.sync_api import sync_playwright
OUT='/workspace/dromoi/visualizer_shots/v13reel/';PDF='/workspace/dromoi/boaz_inbox/2026-11-04_upload-test.pdf'
hand=json.load(open('/tmp/bzf/tests/v13/apopse_hand.json'))
res={}
with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda c:c.type=='error' and errs.append(c.text))
  pg.goto('file:///tmp/bzf/reel-engine-v13.html');pg.wait_for_timeout(1500)
  pg.evaluate("localStorage.clear()")
  # built-in song
  pg.evaluate("()=>load(DATA.songs.find(s=>s.id==='apopse'))");pg.wait_for_timeout(500);pg.screenshot(path=OUT+'builtin_t0.png')
  pg.click('#play')
  for ms in [1500,4000,9000,20000]:
    pg.wait_for_timeout(ms if ms==1500 else ms-[1500,4000,9000,20000][[1500,4000,9000,20000].index(ms)-1]);pg.screenshot(path=OUT+f'builtin_{ms}.png')
  res['ball']=pg.evaluate("()=>{try{return {idx, ev: evs[idx]}}catch(e){return String(e)}}")
  pg.click('#play')
  res['builtin_errors']=list(errs)
  # upload
  pg.click('#addb');pg.set_input_files('#afile',PDF);pg.wait_for_timeout(300);pg.click('#aan')
  pg.wait_for_function("()=>/נמצאו|לא|שגיאה|error/.test(document.getElementById('amsg').textContent)&&!/…/.test(document.getElementById('amsg').textContent)",timeout=600000)
  pg.wait_for_timeout(4000);res['msg']=pg.inner_text('#amsg');pg.screenshot(path=OUT+'upload_confirm.png',full_page=True)
  txt=pg.evaluate("()=>document.getElementById('v13bars')?document.getElementById('v13bars').value:''");res['bars']=txt
  got=pg.evaluate("()=>parsed&&parsed.book?parsed.notes.map(n=>[n.fret,n.course]):[]")
  res['raw_title']=pg.evaluate("()=>V13.last&&V13.last.title")
  pg.click('#ago');pg.wait_for_timeout(1500);res['after_ago']=pg.inner_text('#amsg');pg.screenshot(path=OUT+'after_ago.png');pg.evaluate("()=>{try{closeAdd()}catch(e){}}");pg.click('#play');pg.wait_for_timeout(3000);pg.screenshot(path=OUT+'upload_playing.png');pg.click('#play')
  res['errors']=errs
  json.dump({'got':got,'hand':hand},open('/tmp/bzf/tests/v13/_cmp.json','w'))
  print(json.dumps({k:v for k,v in res.items() if k!='bars'},ensure_ascii=False,indent=1));print(txt)
