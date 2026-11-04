# v13 rerun of the v12 suite: v11-vs-v13 pixel regression + new imports. bs-simple.com · פתרונות יצירתיים · בועז סעדה
import sys,json,os
from playwright.sync_api import sync_playwright
from PIL import Image,ImageChops
OUT='/workspace/dromoi/visualizer_shots/v13reel/regress/';T='/tmp/bzf/tests/v12/'
SEED="Math.random=()=>0.37;window.__t=1000;performance.now=()=>window.__t;Date.now=()=>1700000000000+window.__t;window.__q=[];window.requestAnimationFrame=c=>{window.__q.push(c);return window.__q.length;};window.__pump=n=>{for(let i=0;i<n;i++){window.__t+=1000/60;const q=window.__q;window.__q=[];q.forEach(c=>c(window.__t));}};"  # constant: floating-note positions are random; v12 shifts call count, so neutralize randomness for pixel compare
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
# Control = v11 + an inert <script> (same timing effect as adding any script). v11-vs-control differs only by load-phase timing of animated floaters,
# so the strict pixel test is v12 vs control; v11 vs v12 events/mapping must be identical.
_s=open('/tmp/bzf/reel-engine-v11.html').read();_i=_s.rindex('</body>')
open('/tmp/bzf/tests/v12/_ctrl_v11.html','w').write(_s[:_i].replace('href="visualizer-v9.html"','href="../../visualizer-v9.html"')+'<script>(function(){document.createElement("div");})();</script>'+_s[_i:])
with sync_playwright() as p:
    b=p.chromium.launch()
    s11,e11,ev11=run(b,'reel-engine-v11.html');sX,_,_=run(b,'tests/v12/_ctrl_v11.html');print('v11-vs-control',[ImageChops.difference(Image.open(a).convert('RGB'),Image.open(c).convert('RGB')).getbbox() for a,c in zip(s11,sX)]);s12,e12,ev12=run(b,'reel-engine-v13.html')
    diffs=[]
    for a,c in zip(s11,s12):
        A=Image.open(a).convert('RGB');C=Image.open(c).convert('RGB');bb=ImageChops.difference(A,C).getbbox();diffs.append((os.path.basename(c),bb))
    chk('regress_pixels_identical',all(d[1] is None for d in diffs),[d for d in diffs if d[1]])
    chk('regress_song_events_identical',ev11==ev12[:len(ev11)],f'{sum(len(x) for x in ev12)} events')
    chk('no_js_errors_v11_v12',not e11 and not e12,e11+e12)
    # ---- imports ----
    pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///tmp/bzf/reel-engine-v13.html');pg.wait_for_timeout(800)
    def open_add():
        pg.evaluate("localStorage.clear()");pg.click('#addb')
    # normChord unit
    nc=pg.evaluate("()=>['Λα-','Ρεμ','Ντο','Σολ7','Μι7','ΛΑ-','Φα#-','Σιb','לה-','רהm7','מי7','Am','Dm7','Ρε-7','Ντο/Σολ'].map(normChord)")
    chk('chord_names_greek_hebrew_latin',nc==['Am','Dm','C','G7','E7','Am','F#m','Bb','Am','Dm7','E7','Am','Dm7','Dm7','C/G'],nc)
    # 1 Greek chord sheet via paste
    open_add();pg.fill('#atext',open(T+'greek_chords.txt').read());pg.click('#aan');pg.wait_for_timeout(300)
    vis=pg.is_visible('#v12edit');bars=pg.input_value('#v12bars');pg.screenshot(path=OUT+'imp1_greek_confirm.png')
    chk('greek_sheet_parsed',vis and bars.split('\n')[0].startswith('Am | Μια φορά'),bars.replace('\n',' / '))
    pg.fill('#v12bpc','2');pg.click('#ago');pg.wait_for_timeout(1500)
    st=pg.evaluate("()=>({mode:MODE,chords:[...new Set(song.events.map(e=>e.chord))],ly:song.events[0].lyric,t1:song.events.find(e=>e.chord!=='Am').t,bpm:song.bpm})")
    pg.screenshot(path=OUT+'imp1_greek_playing.png')
    chk('greek_sheet_plays_accomp',st['mode']=='a' and st['chords']==['Am','Dm','E7','C','G','F','E'] and abs(st['t1']-2*60/st['bpm'])<.01,st)
    pg.click('#play')
    # hebrew sheet
    open_add();pg.fill('#atext',open(T+'hebrew_chords.txt').read());pg.click('#aan');pg.wait_for_timeout(300)
    hb=pg.input_value('#v12bars');chk('hebrew_sheet_parsed',hb.startswith('Am | הבאנו') and 'E7 |' in hb,hb.replace('\n',' / '))
    pg.click('#acl')
    # 2 DAD tab
    open_add();pg.set_input_files('#afile',T+'dad_tab.txt');pg.wait_for_timeout(800);msg=pg.inner_text('#amsg')
    pg.screenshot(path=OUT+'imp2_dad_confirm.png');pg.click('#ago');pg.wait_for_timeout(800)
    dd=pg.evaluate("()=>song.events.map(e=>[e.course,e.fret,OPEN[e.course]+e.fret])")
    want=[62,64,65,67,57,59,60,50]
    chk('dad_tab_converted_keep_pitch','DAD' in msg and [x[2] for x in dd]==want and dd[-1][:2]==['C',2] and dd[0][:2]==['D',0],dd)
    pg.click('#play')
    # 4 MusicXML parts
    open_add();pg.set_input_files('#afile',T+'multipart.musicxml');pg.wait_for_timeout(800)
    opts=pg.eval_on_selector_all('#v12sel option','os=>os.map(o=>o.textContent)');sel=pg.eval_on_selector('#v12sel','s=>s.options[s.selectedIndex].textContent')
    pg.screenshot(path=OUT+'imp4_xml_picker.png');pg.click('#v12prev');pg.wait_for_timeout(200)
    chk('musicxml_part_picker_default_melody',len(opts)>=4 and 'Bouzouki melody' in sel and 'קול 1' in sel,{'opts':opts,'sel':sel})
    pg.select_option('#v12sel',label=[o for o in opts if 'Piano' in o][0]);pn=pg.evaluate("()=>parsed.notes.map(n=>n.midi)")
    chk('musicxml_switch_part',pn==[52]*4,pn)
    pg.select_option('#v12sel',label=sel);pg.click('#ago');pg.wait_for_timeout(800)
    mm=pg.evaluate("()=>song.events.map(e=>OPEN[e.course]+e.fret)");chk('musicxml_melody_added',len(mm)==8,mm)
    pg.click('#play')
    # 4 MIDI tracks
    open_add();pg.set_input_files('#afile',T+'multitrack.mid');pg.wait_for_timeout(800)
    opts=pg.eval_on_selector_all('#v12sel option','os=>os.map(o=>o.textContent)');sel=pg.eval_on_selector('#v12sel','s=>s.options[s.selectedIndex].textContent')
    pg.screenshot(path=OUT+'imp4_midi_picker.png')
    chk('midi_channel_picker_default_melody',sel.startswith('★ Melody') and not any('10' in o and 'ערוץ 10' in o for o in opts),{'opts':opts,'sel':sel})
    pg.click('#ago');pg.wait_for_timeout(800);n=pg.evaluate("()=>song.events.length");chk('midi_melody_added',n==16,n)
    pg.click('#play')
    # 3 OCR greek image (needs network for tesseract + ell/heb traineddata)
    open_add();pg.set_input_files('#afile',T+'greek_chords.png')
    try:
        pg.wait_for_selector('#v12edit',state='visible',timeout=180000);bars=pg.input_value('#v12bars');pg.screenshot(path=OUT+'imp3_ocr_greek_confirm.png')
        chk('ocr_greek_image',bars.startswith('Am') and 'Dm' in bars and ('Μια' in bars or 'φορά' in bars),bars.replace('\n',' / '))
    except Exception as e:
        pg.screenshot(path=OUT+'imp3_ocr_fail.png');chk('ocr_greek_image',False,pg.inner_text('#amsg'))
    langs=pg.evaluate("()=>window.OCRW?'worker':'none'")
    chk('no_js_errors_imports',not errs,errs)
    b.close()
json.dump(res,open(OUT+'results.json','w'),ensure_ascii=False,indent=1)
print('ALL PASS' if ok else 'SOME FAIL')
