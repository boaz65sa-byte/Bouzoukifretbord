# v15 rerun of the v12 suite + v15 fix checks. bs-simple.com · פתרונות יצירתיים · בועז סעדה
import sys,json,os
from playwright.sync_api import sync_playwright
from PIL import Image,ImageChops
OUT='/workspace/dromoi/visualizer_shots/v15reel/regress/';T='/tmp/bzf/tests/v12/';FIX='/workspace/qa/reel-v15/fixtures/';SHOT='/workspace/qa/reel-v15/shots/'
os.makedirs(OUT,exist_ok=True);os.makedirs(SHOT,exist_ok=True)
SEED="Math.random=()=>0.37;window.__t=1000;performance.now=()=>window.__t;Date.now=()=>1700000000000+window.__t;window.__q=[];window.requestAnimationFrame=c=>{window.__q.push(c);return window.__q.length;};window.__pump=n=>{for(let i=0;i<n;i++){window.__t+=1000/60;const q=window.__q;window.__q=[];q.forEach(c=>c(window.__t));}};"
TARGET='reel-engine-v15.html'
res={};ok=True
def chk(k,c,i=''):
    global ok;ok&=bool(c);res[k]=('PASS' if c else 'FAIL')+(' '+str(i) if i!='' else '');print(k,res[k])
def run(p,name):
    pg=p.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda c:c.type=='error' and errs.append(c.text))
    pg.add_init_script(SEED)
    adv=lambda ms:pg.evaluate(f'__pump({round(ms*60/1000)})')
    pg.goto('file:///tmp/bzf/'+name);pg.wait_for_timeout(1500);adv(1500)
    shots=[]
    def snap(tag):
        f=OUT+f'{os.path.basename(name)[:-5]}_{tag}.png';pg.screenshot(path=f);shots.append(f)
    snap('t0')
    pg.click('#play')
    last=0
    for ms in [500,1500,3000,6000,10000]:
        adv(ms-last);last=ms;snap(f't{ms}')
    pg.click('#play');adv(200)
    for m in ['s','a','n']:
        pg.click(f'.mode[data-m="{m}"]');pg.click('#play');adv(2500);snap('mode'+m);pg.click('#play');adv(100)
    ev=pg.evaluate("()=>DATA.songs.map(s=>s.events.map(e=>[e.course,e.fret,e.t,e.dur,e.pick,e.chord]))")
    pg.close();return shots,errs,ev
_s=open('/tmp/bzf/reel-engine-v11.html').read();_i=_s.rindex('</body>')
open('/tmp/bzf/tests/v12/_ctrl_v11.html','w').write(_s[:_i].replace('href="visualizer-v9.html"','href="../../visualizer-v9.html"')+'<script>(function(){document.createElement("div");})();</script>'+_s[_i:])
with sync_playwright() as p:
    b=p.chromium.launch()
    s11,e11,ev11=run(b,'reel-engine-v11.html');sX,_,_=run(b,'tests/v12/_ctrl_v11.html');print('v11-vs-control',[ImageChops.difference(Image.open(a).convert('RGB'),Image.open(c).convert('RGB')).getbbox() for a,c in zip(s11,sX)]);s15,e15,ev15=run(b,TARGET)
    # Pixel regress: v15's shared v11 songs must not change the v11→control baseline; compare v11 events only.
    # Strict pixel identity of full page vs v11 fails once songs are added (list/UI), so we keep the v14 pattern:
    # compare events for the first len(ev11) songs, and optionally pixel vs control for v11 itself.
    chk('regress_v11_control_pixels',all(ImageChops.difference(Image.open(a).convert('RGB'),Image.open(c).convert('RGB')).getbbox() is None for a,c in zip(s11,sX)))
    n11=sum(len(x) for x in ev11)
    chk('regress_song_events_identical',ev11==ev15[:len(ev11)],f'v11={n11} events; v15_total={sum(len(x) for x in ev15)}')
    chk('regress_v11_event_count',n11==264,n11)
    chk('regress_v15_total_548_events',sum(len(x) for x in ev15)==548,sum(len(x) for x in ev15))
    chk('no_js_errors_v11_v15',not e11 and not e15,e11+e15)

    # ---- imports (same as v12/v14) ----
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///tmp/bzf/'+TARGET);pg.wait_for_timeout(800)
    def open_add():
        pg.evaluate("localStorage.clear()");pg.click('#addb')
    nc=pg.evaluate("()=>['Λα-','Ρεμ','Ντο','Σολ7','Μι7','ΛΑ-','Φα#-','Σιb','לה-','רהm7','מי7','Am','Dm7','Ρε-7','Ντο/Σολ'].map(normChord)")
    chk('chord_names_greek_hebrew_latin',nc==['Am','Dm','C','G7','E7','Am','F#m','Bb','Am','Dm7','E7','Am','Dm7','Dm7','C/G'],nc)
    open_add();pg.fill('#atext',open(T+'greek_chords.txt').read());pg.click('#aan');pg.wait_for_timeout(300)
    vis=pg.is_visible('#v12edit');bars=pg.input_value('#v12bars');pg.screenshot(path=OUT+'imp1_greek_confirm.png')
    chk('greek_sheet_parsed',vis and bars.split('\n')[0].startswith('Am | Μια φορά'),bars.replace('\n',' / '))
    pg.fill('#v12bpc','2');pg.click('#ago');pg.wait_for_timeout(1500)
    st=pg.evaluate("()=>({mode:MODE,chords:[...new Set(song.events.map(e=>e.chord))],ly:song.events[0].lyric,t1:song.events.find(e=>e.chord!=='Am').t,bpm:song.bpm})")
    pg.screenshot(path=OUT+'imp1_greek_playing.png')
    chk('greek_sheet_plays_accomp',st['mode']=='a' and st['chords']==['Am','Dm','E7','C','G','F','E'] and abs(st['t1']-2*60/st['bpm'])<.01,st)
    pg.click('#play')
    open_add();pg.fill('#atext',open(T+'hebrew_chords.txt').read());pg.click('#aan');pg.wait_for_timeout(300)
    hb=pg.input_value('#v12bars');chk('hebrew_sheet_parsed',hb.startswith('Am | הבאנו') and 'E7 |' in hb,hb.replace('\n',' / '))
    pg.click('#acl')
    open_add();pg.set_input_files('#afile',T+'dad_tab.txt');pg.wait_for_timeout(800);msg=pg.inner_text('#amsg')
    pg.screenshot(path=OUT+'imp2_dad_confirm.png');pg.click('#ago');pg.wait_for_timeout(800)
    dd=pg.evaluate("()=>song.events.map(e=>[e.course,e.fret,OPEN[e.course]+e.fret])")
    want=[62,64,65,67,57,59,60,50]
    chk('dad_tab_converted_keep_pitch','DAD' in msg and [x[2] for x in dd]==want and dd[-1][:2]==['C',2] and dd[0][:2]==['D',0],dd)
    pg.click('#play')
    open_add();pg.set_input_files('#afile',T+'multipart.musicxml');pg.wait_for_timeout(800)
    opts=pg.eval_on_selector_all('#v12sel option','os=>os.map(o=>o.textContent)');sel=pg.eval_on_selector('#v12sel','s=>s.options[s.selectedIndex].textContent')
    pg.screenshot(path=OUT+'imp4_xml_picker.png');pg.click('#v12prev');pg.wait_for_timeout(200)
    chk('musicxml_part_picker_default_melody',len(opts)>=4 and 'Bouzouki melody' in sel and 'קול 1' in sel,{'opts':opts,'sel':sel})
    pg.select_option('#v12sel',label=[o for o in opts if 'Piano' in o][0]);pn=pg.evaluate("()=>parsed.notes.map(n=>n.midi)")
    chk('musicxml_switch_part',pn==[52]*4,pn)
    pg.select_option('#v12sel',label=sel);pg.click('#ago');pg.wait_for_timeout(800)
    mm=pg.evaluate("()=>song.events.map(e=>OPEN[e.course]+e.fret)");chk('musicxml_melody_added',len(mm)==8,mm)
    pg.click('#play')
    open_add();pg.set_input_files('#afile',T+'multitrack.mid');pg.wait_for_timeout(800)
    opts=pg.eval_on_selector_all('#v12sel option','os=>os.map(o=>o.textContent)');sel=pg.eval_on_selector('#v12sel','s=>s.options[s.selectedIndex].textContent')
    pg.screenshot(path=OUT+'imp4_midi_picker.png')
    chk('midi_channel_picker_default_melody',sel.startswith('★ Melody') and not any('10' in o and 'ערוץ 10' in o for o in opts),{'opts':opts,'sel':sel})
    pg.click('#ago');pg.wait_for_timeout(800);n=pg.evaluate("()=>song.events.length");chk('midi_melody_added',n==16,n)
    pg.click('#play')
    open_add();pg.set_input_files('#afile',T+'greek_chords.png')
    try:
        pg.wait_for_selector('#v12edit',state='visible',timeout=180000);bars=pg.input_value('#v12bars');pg.screenshot(path=OUT+'imp3_ocr_greek_confirm.png')
        chk('ocr_greek_image',bars.startswith('Am') and 'Dm' in bars and ('Μια' in bars or 'φορά' in bars),bars.replace('\n',' / '))
    except Exception as e:
        pg.screenshot(path=OUT+'imp3_ocr_fail.png');chk('ocr_greek_image',False,pg.inner_text('#amsg')+' '+str(e))
    chk('no_js_errors_imports',not errs,errs)

    # ---- v15 FIX 1: Απόψε meter 9/8 ----
    pg2=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg2.goto('file:///tmp/bzf/'+TARGET);pg2.wait_for_timeout(800)
    meta=pg2.evaluate("""()=>{
      const s=DATA.songs.find(x=>x.id==='apopse');
      return s?{title:s.title,scale:s.scale,bpm:s.bpm}:null;
    }""")
    chk('fix1_apopse_title_9_8', meta and '9/8' in meta['title'] and '9/4' not in meta['title'], meta)
    chk('fix1_apopse_scale_9_8', meta and '9/8' in (meta['scale'] or '') and '9/4' not in (meta['scale'] or ''), meta)
    # load and screenshot header
    pg2.evaluate("()=>{const s=DATA.songs.find(x=>x.id==='apopse');load(s);}")
    pg2.wait_for_timeout(500)
    pg2.screenshot(path=SHOT+'FIX_apopse_meter_9_8.png')
    hdr=pg2.evaluate("()=>document.body.innerText")
    # canvas draws title; also check song object again after load
    song_now=pg2.evaluate("()=>({title:song.title,scale:song.scale})")
    chk('fix1_apopse_loaded_9_8', '9/8' in song_now['title'] and '9/4' not in song_now['title'], song_now)
    pg2.close()

    # ---- v15 FIX 2: isStaff must not treat Greek ι as staff ----
    pg3=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg3.goto('file:///tmp/bzf/'+TARGET);pg3.wait_for_timeout(800)
    unit=pg3.evaluate("""()=>{
      const greek=open?null:null;
      const gtxt=`Am\\nΜια φορά κι έναν καιρό\\nDm\\nΜια φορά κι έναν καιρό\\nE7\\nήταν ένα παλικάρι\\nAm\\nήταν ένα παλικάρι\\n`;
      const music='œ˙Œ‰∑Óœ˙Œ‰∑Óœ˙Œ‰'; // 15 real glyphs
      const iota_only='ιιιιιιιιιιιι'; // 12 iotas
      return {
        greek_iota_count:(gtxt.match(/ι/g)||[]).length,
        isStaff_greek:isStaff(gtxt),
        isStaff_iota_only:isStaff(iota_only),
        isStaff_music:isStaff(music),
        isStaff_mixed:isStaff(gtxt+music),
      };
    }""")
    chk('fix2_isStaff_false_on_greek_chords', unit['isStaff_greek'] is False and unit['greek_iota_count']>=8, unit)
    chk('fix2_isStaff_false_on_iota_only', unit['isStaff_iota_only'] is False, unit)
    chk('fix2_isStaff_true_on_music_glyphs', unit['isStaff_music'] is True, unit)

    # paste greek chord text via add → must open chord editor, NOT staff message
    pg3.evaluate("localStorage.clear()");pg3.click('#addb')
    gtxt=open(FIX+'chords_greek_v2.txt').read()
    pg3.fill('#atext',gtxt);pg3.click('#aan');pg3.wait_for_timeout(500)
    amsg=pg3.inner_text('#amsg')
    staff_blocked='חמשה' in amsg or 'דף תווים' in amsg
    edit_vis=pg3.is_visible('#v12edit')
    pg3.screenshot(path=SHOT+'FIX_greek_chords_not_staff.png')
    chk('fix2_paste_greek_chords_not_staff', edit_vis and not staff_blocked, {'amsg':amsg,'edit':edit_vis})
    pg3.click('#acl')

    # PDF chord sheet fixture (if present) — should not show staff block
    scan_pdf=FIX+'scan_chords.pdf'
    if os.path.isfile(scan_pdf):
        pg3.click('#addb');pg3.set_input_files('#afile',scan_pdf)
        try:
            # wait either for edit UI or message
            pg3.wait_for_timeout(120000)
            amsg=pg3.inner_text('#amsg')
            staff_blocked='חמשה' in amsg or 'דף תווים' in amsg
            # success if chord edit OR book edit OR chords parsed — not staff block
            ok_ui=pg3.is_visible('#v12edit') or pg3.is_visible('#v13edit') or (not staff_blocked and ('אקורד' in amsg or 'נמצאו' in amsg or 'OCR' in amsg or 'טקסט' in amsg))
            pg3.screenshot(path=SHOT+'FIX_scan_chords_pdf.png')
            chk('fix2_scan_chords_pdf_not_staff', not staff_blocked, {'amsg':amsg,'v12':pg3.is_visible('#v12edit'),'v13':pg3.is_visible('#v13edit'),'ok_ui':ok_ui})
        except Exception as e:
            pg3.screenshot(path=SHOT+'FIX_scan_chords_pdf_fail.png');chk('fix2_scan_chords_pdf_not_staff',False,str(e))
        try: pg3.click('#acl')
        except Exception: pass

    # Real book scans must still hit book importer (v13/v14 edit), not staffMsg alone
    for label,path in [('upload_test','/workspace/dromoi/boaz_inbox/2026-11-04_upload-test.pdf'),
                       ('upload2','/workspace/dromoi/boaz_inbox/2026-11-04_upload2.pdf')]:
        if not os.path.isfile(path):
            chk(f'fix2_book_{label}_still_book_importer',False,'missing '+path);continue
        try:
            if pg3.is_visible('#acl'): pg3.click('#acl')
        except Exception: pass
        pg3.evaluate("localStorage.clear()")
        pg3.click('#addb')
        pg3.set_input_files('#afile',path)
        try:
            pg3.wait_for_function("()=>{const t=document.getElementById('amsg').textContent;return /ספר בוזוקי|חמשה|לא נמצאו|דף אקורדים|שגיאה/.test(t)}",timeout=600000)
            pg3.wait_for_timeout(1500)
        except Exception as e:
            pg3.screenshot(path=SHOT+f'FIX_book_{label}_timeout.png');chk(f'fix2_book_{label}_still_book_importer',False,str(e));continue
        amsg=pg3.inner_text('#amsg')
        v13=pg3.is_visible('#v13edit')
        bookish=('ספר בוזוקי' in amsg) or v13
        only_staff=('חמשה' in amsg or 'דף תווים' in amsg) and not bookish
        pg3.screenshot(path=SHOT+f'FIX_book_{label}.png')
        chk(f'fix2_book_{label}_still_book_importer', bookish and not only_staff, {'amsg':amsg[:240],'v13':v13})
        try: pg3.click('#acl')
        except Exception: pass

    pg3.close();b.close()
json.dump(res,open(OUT+'results.json','w'),ensure_ascii=False,indent=1)
json.dump(res,open('/workspace/qa/reel-v15/results.json','w'),ensure_ascii=False,indent=1)
print('ALL PASS' if ok else 'SOME FAIL')
sys.exit(0 if ok else 1)
