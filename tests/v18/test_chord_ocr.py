#!/usr/bin/env python3
"""v18 chord-sheet OCR: junk filter + review UI. PNGs hard-gate; PDFs report honesty."""
from playwright.sync_api import sync_playwright
import json, time
from pathlib import Path

FIX=Path('/workspace/qa/reel-v18/fixtures')
# Also allow v17 fixtures for gen_* if linked
FIX17=Path('/workspace/qa/reel-v17/fixtures')
HTML='file:///tmp/bzf/reel-engine-v18.html'
OUT=Path('/workspace/qa/reel-v18/shots'); OUT.mkdir(parents=True, exist_ok=True)
RES=Path('/tmp/bzf/tests/v18'); RES.mkdir(parents=True, exist_ok=True)

CASES=[
  ('scan_chords.png', ['Am','Dm','E7','C','G'], True),
  ('scan_chords.pdf', ['Am','Dm','E7','C','G'], True),
  ('scan_new_serif_sameline.png', ['Am','Bb','E7','Dm','C','G'], True),
  ('scan_new_alt_stacked.png', ['Dm','Am','E7','Bb','F','C'], True),
  ('scan_fresh_mono_skew.png', ['Em','Am','D','G','C7','F'], True),
  ('scan_fresh_condensed_noise.png', ['G7','C','Am','Dm','Bb','E'], True),
  ('scan_new_serif_sameline.pdf', ['Am','Bb','E7','Dm','C','G'], False),
  ('scan_new_alt_stacked.pdf', ['Dm','Am','E7','Bb','F','C'], False),
  ('scan_fresh_mono_skew.pdf', ['Em','Am','D','G','C7','F'], False),
  ('scan_fresh_condensed_noise.pdf', ['G7','C','Am','Dm','Bb','E'], False),
]

def resolve(fname):
  for d in (FIX, FIX17):
    p=d/fname
    if p.exists(): return p
  return FIX/fname

def leads_from(page):
  return page.evaluate("""()=>{
    const m=(($('amsg')&&$('amsg').textContent)||'');
    const last=window.LASTTXT||'';
    const leads=[];
    for(const ln of last.split(/\\n/)){
      const t=(ln.trim().split(/\\s+/)[0]||'');
      const c=(typeof fixChordOCRTok==='function')?fixChordOCRTok(t):null;
      if(c) leads.push(c);
    }
    let bars=[];
    try{ if(parsed&&parsed.bars) bars=[...new Set(parsed.bars.map(b=>b&&b.c).filter(Boolean))]; }catch(e){}
    const rev=document.getElementById('v17rev');
    const revVis=!!(rev && rev.style.display!=='none' && getComputedStyle(rev).display!=='none');
    return {m, leads:[...new Set(leads)], bars, revVis};
  }""")

def run_case(page, fname, expect, timeout=240000):
  page.evaluate("()=>{ try{localStorage.clear()}catch(e){} }")
  try:
    if page.is_visible('#acl'): page.click('#acl')
  except Exception: pass
  page.click('#addb')
  path=resolve(fname)
  if not path.exists():
    return {'file':fname,'ok':False,'error':'missing','hit':0,'need':len(expect),'acc':0}
  page.set_input_files('#afile', str(path.resolve()))
  t0=time.time()
  try:
    page.wait_for_function("""()=>{
      const m=(($('amsg')&&$('amsg').textContent)||'');
      if(/מחפש|מזהה|קורא|OCR|טוען|PDF|ניסיון/.test(m) && !/דף אקורדים|לא נמצאו|תיבות/.test(m)) return false;
      return /דף אקורדים|לא נמצאו|תיבות|שגיאה/.test(m);
    }""", timeout=timeout)
  except Exception as e:
    page.screenshot(path=str(OUT/f'FAIL_ocr_{fname.replace(".","_")}_timeout.png'))
    return {'file':fname,'ok':False,'error':'timeout','sec':round(time.time()-t0,1),'hit':0,'need':len(expect),'acc':0,'got':[],'missing':expect,'extras':[]}
  info=leads_from(page)
  got=info['bars'] or info['leads']
  hit=[c for c in expect if c in got]
  miss=[c for c in expect if c not in got]
  extras=[c for c in got if c not in expect]
  acc=round(100.0*len(hit)/max(1,len(expect)),1)
  ok=not miss and 'לא נמצאו' not in info['m']
  page.screenshot(path=str(OUT/f'{"PASS" if ok else "FAIL"}_ocr_{fname.replace(".","_")}.png'))
  return {'file':fname,'ok':ok,'got':got,'missing':miss,'extras':extras,'hit':len(hit),'need':len(expect),'acc':acc,'revVis':info['revVis'],'msg':info['m'][:160],'sec':round(time.time()-t0,1)}

def main():
  results=[]; hard_fail=False
  with sync_playwright() as p:
    b=p.chromium.launch(); page=b.new_page(viewport={'width':430,'height':932})
    page.goto(HTML, wait_until='domcontentloaded', timeout=60000); page.wait_for_timeout(600)
    unit=page.evaluate("""()=>{
      const samples={};
      for(const s of ['ς','σας','F111','GAC','Am','Bb','E7','Em','Cb','Fb','E#','B#']) samples[s]=fixChordOCRTok(s);
      const pref=preferSheetChordForms(['Am','Em','E7','Bm','Bb','Fm','F']);
      const demo=filterOffSpineJunk(['Em','Am','D','G','C7','F','Ab','Cm','Eb6','Em9'],['Em','Am','D','G','C7','F']);
      return {samples, pref, demo, hasReview: typeof showV17ChordReview==='function', hasFilter: typeof filterOffSpineJunk==='function'};
    }""")
    # unit gates
    assert unit['samples']['ς'] is None
    assert unit['samples']['Cb'] is None
    assert unit['samples']['Am']=='Am'
    assert 'Ab' not in unit['demo'] and 'Eb6' not in unit['demo'] and 'Em9' not in unit['demo']
    assert unit['hasFilter'] and unit['hasReview']
    print('UNIT_OK', json.dumps(unit, ensure_ascii=False))
    for fname, expect, hard in CASES:
      print('CASE', fname, flush=True)
      r=run_case(page, fname, expect)
      r['hard']=hard
      results.append(r)
      print(json.dumps(r, ensure_ascii=False), flush=True)
      if hard and not r.get('ok'): hard_fail=True
    b.close()
  out={'unit':unit,'results':results,'hard_fail':hard_fail}
  (RES/'results_chord_ocr.json').write_text(json.dumps(out, indent=2, ensure_ascii=False))
  Path('/workspace/qa/reel-v18/accuracy_table.json').write_text(json.dumps([
    {'file':r['file'],'acc':r.get('acc'),'hit':r.get('hit'),'need':r.get('need'),'missing':r.get('missing'),'extras':r.get('extras'),'ok':r.get('ok')}
    for r in results
  ], indent=2, ensure_ascii=False))
  print('HARD_FAIL' if hard_fail else 'HARD_PASS')
  return 1 if hard_fail else 0

if __name__=='__main__':
  raise SystemExit(main())
