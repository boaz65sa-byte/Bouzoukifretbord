<script>
// ===== v13 (תוספת בלבד): קורא דפי "ספר בוזוקי" יווני סרוקים — שורת סריגים אחת מעל החמשה · bs-simple.com · פתרונות יצירתיים · בועז סעדה =====
(function(){
const V13=window.V13={};const OPEN={C:48,F:53,A:57,D:62};const CO=['C','F','A','D'];
function solChord(t){t=(t||'').replace(/[–—−_]/g,'-').replace(/♭/g,'b').replace(/\s/g,'');const m=t.match(/^(Do|Re|Mi|Fa|Sol|So|La|Si|Ντο|Ρε|Μι|Φα|Σολ|Λα|Σι)(#|b)?(\+|-|7|-7|\+7|m)?$/i);if(!m)return null;
 const R={do:'C',re:'D',mi:'E',fa:'F',sol:'G',so:'G',la:'A',si:'B','ντο':'C','ρε':'D','μι':'E','φα':'F','σολ':'G','λα':'A','σι':'B'}[m[1].toLowerCase()];const q=m[3]||'+';
 return R+(m[2]||'')+(q==='-'||q==='m'?'m':q==='-7'?'m7':q==='7'||q==='+7'?'7':'');}
V13.solChord=solChord;
function deskew(cv){const sc=600/cv.width,w=600,h=Math.round(cv.height*sc),t=document.createElement('canvas');t.width=w;t.height=h;const x=t.getContext('2d',{willReadFrequently:true});x.drawImage(cv,0,0,w,h);const d=x.getImageData(0,0,w,h).data,b=new Uint8Array(w*h);for(let i=0;i<w*h;i++)b[i]=d[i*4]<160?1:0;
 let best=0,ba=0;for(let a=-4;a<=4.001;a+=.1){const tn=Math.tan(a*Math.PI/180),r=new Float32Array(h+200);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)if(b[yy*w+xx]){const k=Math.round(yy-xx*tn)+100;if(k>=0&&k<h+200)r[k]++;}let s=0;for(const v of r)s+=v*v;if(s>best){best=s;ba=a;}}
 V13.skew=ba;if(Math.abs(ba)<.05)return cv;const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;const c=o.getContext('2d',{willReadFrequently:true});c.fillStyle='#fff';c.fillRect(0,0,o.width,o.height);c.translate(o.width/2,o.height/2);c.rotate(-ba*Math.PI/180);c.drawImage(cv,-cv.width/2,-cv.height/2);return o;}
function gray(cv){const W=cv.width,H=cv.height,d=cv.getContext('2d').getImageData(0,0,W,H).data,g=new Uint8Array(W*H);for(let i=0;i<W*H;i++)g[i]=d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11<150?1:0;return{W,H,g};}
function staves(G){const{W,H,g}=G,row=new Float32Array(H);for(let y=0;y<H;y++){let n=0;for(let x=0;x<W;x++)n+=g[y*W+x];row[y]=n/W;}
 let mx=0;for(const v of row)mx=Math.max(mx,v);const th=Math.max(.2,mx*.55);const L=[];for(let y=0;y<H;y++)if(row[y]>th){let y2=y;while(y2+1<H&&row[y2+1]>th)y2++;L.push((y+y2)/2);y=y2;}
 const S=[];for(let i=0;i+4<L.length;i++){const d=[1,2,3,4].map(k=>L[i+k]-L[i+k-1]);const m=d.reduce((a,b)=>a+b)/4;if(m>4&&d.every(v=>Math.abs(v-m)<m*.2)){S.push({top:L[i],bot:L[i+4],gap:m});i+=4;}}return{S,row};}
function crop(cv,x0,y0,w,h,sc){const c=document.createElement('canvas');c.width=Math.round(w*sc);c.height=Math.round(h*sc);const t=c.getContext('2d');t.fillStyle='#fff';t.fillRect(0,0,c.width,c.height);t.drawImage(cv,x0,y0,w,h,0,0,c.width,c.height);return c;}
async function ocr(c,wl,psm){const w=await getOCR();await w.setParameters({tessedit_char_whitelist:wl||'',tessedit_pageseg_mode:String(psm||7)});const{data}=await w.recognize(c,{},{text:true,blocks:true});
 const words=[];(data.blocks||[]).forEach(bl=>bl.paragraphs.forEach(pa=>pa.lines.forEach(li=>li.words.forEach(wd=>words.push(wd)))));await w.setParameters({tessedit_char_whitelist:'',tessedit_pageseg_mode:'6'});return{text:data.text,words};}
// string (course) choice: DP over candidates, prefers small melodic moves, chord tones, staying on a course
function chooseCourses(ns){const cand=n=>CO.filter(c=>n.fret<=22).map(c=>({c,m:OPEN[c]+n.fret}));let prev=null;const P=[];
 ns.forEach((n,i)=>{const cs=cand(n),ci=n.chord?chordInfo(n.chord):null;const row=cs.map(o=>{let base=(ci&&ci.pcs.includes(o.m%12))?-0.6:0;base+=(o.c==='C')?1.2:(o.c==='D'&&n.fret<8)?.4:0;
   if(!prev)return{...o,cost:base+Math.abs(o.m-60)*.3,from:-1};let best=1e9,bf=-1;prev.forEach((p,j)=>{const iv=Math.abs(o.m-p.m);const c=p.cost+Math.min(iv,12)*.55+(iv>7?2:0)+(o.c!==p.c?.5:0)+base;if(c<best){best=c;bf=j;}});return{...o,cost:best,from:bf};});P.push(row);prev=row;});
 let j=P.length?P[P.length-1].reduce((b,o,k,a)=>o.cost<a[b].cost?k:b,0):0;for(let i=P.length-1;i>=0;i--){const o=P[i][j];ns[i].course=o.c;ns[i].midi=o.m;j=o.from;}return ns;}
V13.chooseCourses=chooseCourses;
async function bookDetect(cv){cv=deskew(cv);const G=gray(cv),{S,row}=staves(G);if(S.length<2)return null;const{W,g}=G;const systems=[];let title='';
 try{const tb=Math.max(0,S[0].top-S[0].gap*9);if(tb>10){const r=await ocr(crop(cv,0,0,W,tb,1),'',6);title=r.text.replace(/\s+/g,' ').trim();}}catch(e){}
 for(let si=0;si<S.length;si++){const s=S[si],gp=s.gap;const lo=Math.round(s.top-gp*7.5),hi=Math.round(s.top-gp*2.2);let dy=-1,dv=0;
  for(let y=Math.max(0,lo);y<hi;y++){let n=0,runs=0,inr=0;for(let x=0;x<W;x++){const v=g[y*W+x];if(v&&!inr)runs++;inr=v;n+=v;}const sc=runs>=12?n:0;if(sc>dv){dv=sc;dy=y;}}
  (V13.dbg=V13.dbg||[]).push({si,dy,dv,W});if(dy<0||dv<W*.12)continue;
  // barlines: columns dark through whole staff
  const bars=[];for(let x=0;x<W;x++){let ok=true;for(let y=Math.round(s.top);y<=Math.round(s.bot)&&ok;y+=2)ok=g[y*W+x]||g[y*W+x+1]||g[y*W+x-1];if(ok){if(!bars.length||x-bars[bars.length-1]>gp)bars.push(x);}}
  let dt=dy;const rc0=y=>{let n=0;for(let x=0;x<W;x++)n+=g[y*W+x];return n;};while(dt>0&&rc0(dt-1)>dv*.3)dt--;
  const by0=Math.round(dt-gp*1.9),bh=Math.round(gp*1.75);const dc=crop(cv,0,by0,W,bh,2);{const t=dc.getContext('2d',{willReadFrequently:true}),im=t.getImageData(0,0,dc.width,dc.height),D=im.data,w2=dc.width,h2=dc.height;
   for(let x=0;x<w2;x++){let k=0;for(let y=0;y<h2;y++)if(D[(y*w2+x)*4]<150)k++;if(k>h2*.8)for(let y=0;y<h2;y++){const i=(y*w2+x)*4;D[i]=D[i+1]=D[i+2]=255;}}t.putImageData(im,0,0);}
  const pad=document.createElement('canvas');pad.width=dc.width;pad.height=dc.height+60;{const t=pad.getContext('2d');t.fillStyle='#fff';t.fillRect(0,0,pad.width,pad.height);t.drawImage(dc,0,30);}
  const r=await ocr(pad,'0123456789',11);r.words.forEach(w=>{w.bbox={x0:w.bbox.x0/2,x1:w.bbox.x1/2};});const frets=[];
  r.words.forEach(w=>{const d=w.text.replace(/\D/g,'');if(!d||d==='1'||/^1{3,}$/.test(d))return;const x=(w.bbox.x0+w.bbox.x1)/2;if(+d<=22)frets.push({x,f:+d});else if(d.length===2&&+d[0]<=9)frets.push({x:w.bbox.x0,f:+d[0]},{x:w.bbox.x1,f:+d[1]});else if(d.length>=3){const k=Math.ceil(d.length/2);for(let i=0;i<d.length;){const two=+d.slice(i,i+2);const t=(d[i]==='1'&&two>=10&&two<=22)?2:1;frets.push({x:w.bbox.x0+(w.bbox.x1-w.bbox.x0)*(i+t/2)/d.length,f:+d.slice(i,i+t)});i+=t;}}});
  const cc=crop(cv,0,Math.round(dy+gp*.2),W,Math.round(Math.max(gp,s.top-dy-gp*.4)),1);const rc=await ocr(cc,'',11);const chords=[];
  rc.words.forEach(w=>{rc.text&&0;const parts=w.text.split(/(?<=[+\-–—7])(?=[A-ZΑ-Ω])/);parts.forEach((p,i)=>{const c=solChord(p)||normChord(p.replace(/[–—]/g,'-'));if(c&&grip(c))chords.push({x:w.bbox.x0+(w.bbox.x1-w.bbox.x0)*i/parts.length,c});});});
  let lyric='';try{const nb=S[si+1]?S[si+1].top-gp*7.5:s.bot+gp*6;const lc=crop(cv,0,Math.round(s.bot+gp*1.6),W,Math.round(Math.max(gp*1.5,Math.min(gp*3.5,nb-s.bot-gp*1.6))),1);const rl=await ocr(lc,'',7);
   lyric=rl.text.replace(/[^\u0370-\u03ff\u1f00-\u1fff\s\-]/g,'').replace(/\s*-\s*/g,'-').replace(/\s+/g,' ').trim();if((lyric.match(/[\u0370-\u03ff]/g)||[]).length<4)lyric='';}catch(e){}
  V13.dbg.push({si,ocr:r.text,nf:frets.length,nb:bars.length});frets.sort((a,b)=>a.x-b.x);chords.sort((a,b)=>a.x-b.x);systems.push({frets,chords,bars,lyric,gap:gp});}
 const nf=systems.reduce((a,s)=>a+s.frets.length,0);if(nf<8)return null;
 // assemble bars → notes (even subdivision of 9 beats per bar; user can correct)
 const BAR=+(V13.beats||9);const out=[];let ch=null;
 for(const sy of systems){const cuts=sy.bars.filter(x=>x>sy.frets[0].x+sy.gap&&x<sy.frets[sy.frets.length-1].x);const groups=[[]];
  sy.frets.forEach(f=>{while(cuts.length&&f.x>cuts[0]){cuts.shift();if(groups[groups.length-1].length)groups.push([]);}groups[groups.length-1].push(f);});
  groups.forEach((gr,gi)=>{if(!gr.length)return;const toks=gr.map(f=>{const c=sy.chords.filter(c=>c.x<=f.x+sy.gap*1.2).pop();return{fret:f.f,chord:c?c.c:ch};});
   toks.forEach(t=>{if(t.chord)ch=t.chord;else t.chord=ch;});out.push({chord:toks[0].chord,lyric:gi===0?sy.lyric:'',notes:toks});});}
 return{title,bars:out};}
V13.bookDetect=bookDetect;
function barsToText(bars){return bars.map(b=>{let c=null;return b.notes.map(n=>{const s=n.fret+(n.course||'')+(n.chord&&n.chord!==c?'@'+n.chord:'');c=n.chord;return s;}).join(' ')+(b.lyric?' | '+b.lyric:'');}).join('\n');}
function textToBars(t){const bars=[];let ch=null;t.split('\n').forEach(l=>{if(!l.trim())return;const i=l.indexOf('|');const body=i<0?l:l.slice(0,i),ly=i<0?'':l.slice(i+1).trim();const notes=[];
 body.trim().split(/\s+/).forEach(tok=>{const m=tok.match(/^(\d{1,2})([CFAD])?(?::([\d.]+))?(?:@(.+))?$/);if(!m)throw 'לא הבנתי את "'+tok+'" — כתוב סריג, אופציונלי מיתר (C/F/A/D) ואקורד: 7A@C';if(m[4]){const c=solChord(m[4])||normChord(m[4]);if(!c||!grip(c))throw 'אקורד לא מזוהה: '+m[4];ch=c;}notes.push({fret:+m[1],course:m[2]||null,w:+(m[3]||1),chord:ch});});
 if(notes.length)bars.push({notes,lyric:ly});});if(!bars.length)throw 'אין תווים';return bars;}
function buildBook(bars,bpm){const BAR=+(V13.beats||9);const flat=[];bars.forEach(b=>b.notes.forEach(n=>flat.push(n)));
 const need=flat.filter(n=>!n.course);if(need.length){const tmp=flat.map(n=>({fret:n.fret,chord:n.chord}));chooseCourses(tmp);flat.forEach((n,i)=>{if(!n.course)n.course=tmp[i].course;});}
 const spb=60/bpm,ev=[],chords={};let beat=0;
 bars.forEach(b=>{const tot=b.notes.reduce((a,n)=>a+(n.w||1),0);b.notes.forEach((n,k)=>{const d=(n.w||1)/tot*BAR;if(n.chord)chords[n.chord]=grip(n.chord);
  ev.push({t:+(beat*spb).toFixed(4),course:n.course,fret:n.fret,dur:+(d*spb*.95).toFixed(4),pick:Math.abs(beat-Math.round(beat))<1e-6?'down':'up',chord:n.chord||undefined,lyric:b.lyric||undefined});beat+=d;});});
 ev.forEach((e,i)=>{e.next=(ev.slice(i+1).find(x=>x.chord&&x.chord!==e.chord)||{}).chord||null;});return{events:ev,chords};}
V13.buildBook=buildBook;V13.textToBars=textToBars;
// --- hook: scanned PDF / photo → try bouzouki-book format first ---
const css=document.createElement('style');css.textContent='#v13edit{display:none;margin-top:10px;background:#1f1a12;border:1px solid #7a5a1f;border-radius:10px;padding:9px}#v13edit textarea{width:100%;height:170px;background:#111;color:#fff;border:1px solid #444;border-radius:10px;padding:8px;font-size:14px;font-family:monospace;direction:ltr}';document.head.appendChild(css);
const ed=document.createElement('div');ed.id='v13edit';ed.innerHTML='<b>📖 זוהה דף «ספר בוזוקי» (שורת סריגים מעל החמשה)</b><div class="note" style="margin-top:2px">כל שורה = תיבה. כל תו: סריג+מיתר (C/F/A/D), ‏<b>:2</b> = ארוך פי 2, ‏<b>@Do+</b> = אקורד. המיתר נבחר אוטומטית לפי רצף ונוחות — אפשר לתקן. אחרי | — מילים.</div><textarea id="v13bars" dir="ltr"></textarea><div class="row"><div><label>פעמות בתיבה</label><input id="v13beats" type="number" value="9" min="2" max="16"></div></div><div id="v13hit"></div>';
$('amsg').after(ed);
async function renderPDF(buf){const lib=await getPDF();const pdf=await lib.getDocument({data:new Uint8Array(buf.slice(0))}).promise;let any=0;
 for(let p=1;p<=Math.min(pdf.numPages,8);p++){const pg=await pdf.getPage(p);const tc=await pg.getTextContent();any+=tc.items.map(i=>i.str).join('').replace(/\s/g,'').length;}
 if(any>=30)return null;const cvs=[];for(let p=1;p<=Math.min(pdf.numPages,4);p++){const pg=await pdf.getPage(p);const vp=pg.getViewport({scale:300/72});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;const c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);await pg.render({canvasContext:c,viewport:vp}).promise;cvs.push(cv);}return cvs;}
async function tryBook(f,buf,h,n){let cvs=null;
 if(/^%PDF/.test(h)||/\.pdf$/.test(n))cvs=await renderPDF(buf);
 else if(/^\x89PNG/.test(h)||/\.(png|jpe?g|webp|gif)$/.test(n)){const url=URL.createObjectURL(new Blob([buf],{type:f.type||'image/png'}));const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url;});const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;cv.getContext('2d').drawImage(img,0,0);cvs=[cv];}
 if(!cvs)return null;setMsg('דף סרוק — מחפש שורת סריגים בסגנון ספר בוזוקי…',false);let bars=[],title='';
 for(const cv of cvs){const r=await bookDetect(cv);if(r){bars=bars.concat(r.bars);title=title||r.title;}}
 if(!bars.length)return null;return{bars,title};}
Object.assign(V13,{deskew,renderPDF,bookDetect,tryBook,gray,staves,chooseCourses});
const oldAnalyze=analyze;
analyze=async function(){ed.style.display='none';V13.last=null;const f=$('afile').files[0];
 if(f){try{const buf=await readBuf(f),u=new Uint8Array(buf),h=String.fromCharCode(...u.slice(0,12)),n=(f.name||'').toLowerCase();const r=await tryBook(f,buf,h,n);
  if(r){V13.last=r;const notes=r.bars.reduce((a,b)=>a+b.notes.length,0);const flat=[];r.bars.forEach(b=>b.notes.forEach(x=>flat.push(x)));chooseCourses(flat);
   parsed={book:true,notes:flat.map((x,i)=>({beat:i,dur:1,midi:x.midi,course:x.course,fret:x.fret})),title:r.title};
   $('v13bars').value=barsToText(r.bars);ed.style.display='block';
   const k=(r.title||'').replace(/\s/g,'').toLowerCase();const hit=DATA.songs.find(s=>s.match&&s.match.some(w=>k.includes(w.replace(/\s/g,'').toLowerCase())));
   $('v13hit').innerHTML=hit?'<div class="note" style="margin-top:8px">יש לשיר הזה גם גרסה מתועתקת ביד, מדויקת יותר: <button class="bs" id="v13use">▶ נגן את “'+hit.title+'”</button></div>':'';
   if(hit)$('v13use').onclick=()=>{closeAdd();load(hit);};
   if(!$('atitle').value)$('atitle').value=(hit?hit.title.split(' · ')[0]:'')||(f.name||'שיר').replace(/\.[^.]+$/,'');$('abpm').value=76;
   setMsg('זיהוי ספר בוזוקי (OCR מסריקה) · נמצאו '+notes+' תווים ב-'+r.bars.length+' תיבות · מקצב: חלוקה שווה בתיבה — בדוק ותקן למטה',false);return true;}}catch(e){console.warn('v13 book',e);}}
 return await oldAnalyze();};
const oldAdd=addSong;
addSong=async function(){if(!parsed&&!(await analyze()))return;if(!parsed||!parsed.book)return await oldAdd();
 let bars;try{V13.beats=+$('v13beats').value||9;bars=textToBars($('v13bars').value);}catch(e){setMsg(String(e),true);return;}const bpm=+$('abpm').value||76;const b=buildBook(bars,bpm);
 const s={id:'u'+Date.now(),title:$('atitle').value.trim()||'שיר חדש',bpm,scale:$('ascale').value.trim()||'סולם לא צוין',est:'ספר בוזוקי · מקצב משוער',scaleEst:true,chords:b.chords,user:true,events:b.events};
 const er=validate(s);if(er.length){setMsg('<b>השיר לא תקין — לא נוסף</b><br>'+er.slice(0,6).join('<br>'),true);return;}
 USER.push(s);saveUser();addBtn(s);closeAdd();parsed=null;ed.style.display='none';$('afile').value='';$('atitle').value='';load(s);};
{const inner=analyze;let run=null,runF=null;analyze=function(){const f=$('afile').files[0];if(run&&f&&f===runF)return run;runF=f;run=inner().finally(()=>{run=null;runF=null;});return run;};}
$('aan').onclick=()=>analyze();
})();
</script>
