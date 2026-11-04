<script>
// ===== v14 (תוספת בלבד): קורא «ספר בוזוקי» משופר — ספרות בכתב יד (סגמנטציה לגליפים), סריגים מוערמים = אקורד, מספרי מיתר מוקפים ①–④ (התאמת תבנית טבעת),
// קווי תיבה עמידים, שמות אקורדים באותיות יווניות גדולות (ΦΑ, ΣΙb, ΣΟΛ, ΝΤΟ, ΡΕ, ΜΙ, ΛΑ + / - / 7), משקל 3/4 לוואלס · bs-simple.com · פתרונות יצירתיים · בועז סעדה =====
(function(){
const V13=window.V13,V14=window.V14={dbg:[]};const OPEN={C:48,F:53,A:57,D:62};const CO=['C','F','A','D'];const CIRC={1:'D',2:'A',3:'F',4:'C'};
function crop(cv,x0,y0,w,h,sc){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*sc));c.height=Math.max(1,Math.round(h*sc));const t=c.getContext('2d');t.fillStyle='#fff';t.fillRect(0,0,c.width,c.height);t.drawImage(cv,x0,y0,w,h,0,0,c.width,c.height);return c;}
async function ocr(c,wl,psm){const w=await getOCR();await w.setParameters({tessedit_char_whitelist:wl||'',tessedit_pageseg_mode:String(psm||7)});const{data}=await w.recognize(c,{},{text:true,blocks:true});
 const words=[];(data.blocks||[]).forEach(bl=>bl.paragraphs.forEach(pa=>pa.lines.forEach(li=>li.words.forEach(wd=>words.push(wd)))));await w.setParameters({tessedit_char_whitelist:'',tessedit_pageseg_mode:'6'});return{text:data.text,words};}
// --- Greek-capital chord names (and the Latin look-alikes OCR tends to return) ---
function greekChord(t){t=(t||'').replace(/[–—−_~]/g,'-').replace(/♭/g,'b').replace(/[\s.,:;'"`]/g,'');if(!t)return null;const U=t.toUpperCase();
 const R=[[/^(ΣΟΛ|ΣΟΛ|[ΣZΖE2Ε][ΟO0][ΛAΑЛ])/,'G'],[/^(ΣΙ|[ΣZΖE2Ε][ΙIL1|!])/,'B'],[/^(ΝΤΟ|[ΝN][ΤT][ΟO0])/,'C'],[/^(ΦΑ|[ΦФØ®Q0O][ΑA4])/,'F'],[/^(ΡΕ|[ΡP][ΕE])/,'D'],[/^(ΜΙ|[ΜM][ΙIL1|])/,'E'],[/^(ΛΑ|[ΛЛ][ΑA])/,'A']];
 for(const[re,root]of R){const m=U.match(re);if(!m)continue;const rest=t.slice(m[0].length);const s=rest.match(/^(#|b|B)?(\+|-|7|-7|\+7|m)?\+?$/);if(!s)continue;const q=s[2]||'+';
  return root+(s[1]==='#'?'#':s[1]?'b':'')+(q==='-'||q==='m'?'m':q==='-7'?'m7':q==='7'||q==='+7'?'7':'');}return null;}
V14.greekChord=greekChord;
function anyChord(p){const c=greekChord(p)||V13.solChord(p)||normChord((p||'').replace(/[–—]/g,'-'));return c&&grip(c)?c:null;}
// --- connected components in a band of the binary page ---
function components(m,w,h){const lab=new Int32Array(w*h),C=[];let id=0;const st=[];
 for(let i=0;i<w*h;i++){if(!m[i]||lab[i])continue;id++;let x0=1e9,y0=1e9,x1=-1,y1=-1,n=0;st.push(i);lab[i]=id;
  while(st.length){const k=st.pop(),x=k%w,y=(k-x)/w;n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const j=yy*w+xx;if(m[j]&&!lab[j]){lab[j]=id;st.push(j);}}}
  C.push({id,x0,y0,x1,y1,n,w:x1-x0+1,h:y1-y0+1});}return{lab,C};}
// classify a list of glyphs in one Tesseract pass: glyphs re-drawn clean, spaced on one line, mapped back by bbox
V14.TCONF=70;V14.tplDigit=function(c){const N=16,w=c.width,h=c.height,D=c.getContext('2d').getImageData(0,0,w,h).data;
 const nrm=(get,w,h)=>{let x0=w,x1=-1,y0=h,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(get(x,y)){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}if(x1<0)return null;const bw=x1-x0+1,bh=y1-y0+1,side=Math.max(bw,bh*.75),ox=x0+bw/2-side/2,v=new Float32Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){let a=0;for(let yy=0;yy<3;yy++)for(let xx=0;xx<3;xx++){const X=Math.floor(ox+(i+(xx+.5)/3)*side/N),Y=Math.floor(y0+(j+(yy+.5)/3)*bh/N);if(X>=0&&X<w&&get(X,Y))a++;}v[j*N+i]=a/9;}
  let m=0;v.forEach(z=>m+=z);m/=v.length;let ss=0;for(let k=0;k<v.length;k++){v[k]-=m;ss+=v[k]*v[k];}ss=Math.sqrt(ss)||1;for(let k=0;k<v.length;k++)v[k]/=ss;return{v,bw,bh};};
 if(!V14._dtpl){V14._dtpl=[];const F=['bold 60px serif','60px serif','bold 60px sans-serif','60px sans-serif','italic 60px serif','bold 60px monospace','italic bold 60px sans-serif'];for(const d of'0123456789')for(const f of F)for(const sk of[-.25,0,.25]){const k=document.createElement('canvas');k.width=k.height=90;const t=k.getContext('2d');t.fillStyle='#fff';t.fillRect(0,0,90,90);t.setTransform(1,0,-sk,1,0,0);t.fillStyle='#000';t.font=f;t.textBaseline='middle';t.fillText(d,30,45);const E=t.getImageData(0,0,90,90).data,q=nrm((x,y)=>E[(y*90+x)*4]<128,90,90);if(q)V14._dtpl.push({d,v:q.v});}}
 const f=nrm((x,y)=>D[(y*w+x)*4]<128,w,h);if(!f)return null;const sc={};V14._dtpl.forEach(T=>{let a=0;for(let k=0;k<T.v.length;k++)a+=T.v[k]*f.v[k];if(!(a<=sc[T.d]))sc[T.d]=a;});let b=null;for(const d in sc)if(b==null||sc[d]>sc[b])b=d;return{d:b,s:sc[b]};};
async function classify(gl,lab,w,oy,wl){if(!gl.length)return;const H=56,P=22;const W0=getOCR?await getOCR():null;await W0.setParameters({tessedit_char_whitelist:wl,tessedit_pageseg_mode:'10'});
 for(const q of gl){const s=H/q.h,c=document.createElement('canvas');c.width=Math.ceil(q.w*s+2*P);c.height=H+2*P;const t=c.getContext('2d');t.fillStyle='#fff';t.fillRect(0,0,c.width,c.height);t.fillStyle='#000';
  for(let y=q.y0;y<=q.y1;y++)for(let x=q.x0;x<=q.x1;x++)if(lab[(y-oy)*w+x]===q.id)t.fillRect(P+(x-q.x0)*s,P+(y-q.y0)*s,Math.ceil(s),Math.ceil(s));
  const{data}=await W0.recognize(c);const tx=(data.text||'').replace(/[^0-9]/g,'');q.d=tx?tx[0]:null;q.conf=data.confidence;
  const tm=V14.tplDigit(c);q.tm=tm;if(tm&&(q.conf<V14.TCONF||!q.d))q.d=tm.d;}
 await W0.setParameters({tessedit_char_whitelist:'',tessedit_pageseg_mode:'6'});}
function slant(q,lab,w,oy){const cx=yy=>{let s=0,n=0;for(let x=q.x0;x<=q.x1;x++)if(lab[(yy-oy)*w+x]===q.id){s+=x;n++;}return n?s/n:null;};const a=cx(q.y0+Math.round(q.h*.15)),b=cx(q.y1-Math.round(q.h*.15));return a==null||b==null?0:(a-b)/q.h;}
// --- the fret-number row: underlined (dashed) digits, with chord notes stacked below the first digit ---
async function readFrets(G,s,dy){const{W,g}=G,gp=s.gap;const y0=Math.max(0,Math.round(dy-2.2*gp)),y1=Math.round(Math.min(s.top-.5*gp,dy+3*gp)),w=W,h=y1-y0;const m=new Uint8Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)m[y*w+x]=g[(y+y0)*W+x];
 const L=Math.round(gp*.7);for(let y=Math.round(dy-.3*gp);y<=Math.round(dy+.3*gp);y++){const yy=y-y0;if(yy<0||yy>=h)continue;for(let x=0;x<w;){if(!m[yy*w+x]){x++;continue;}let e=x;while(e<w&&m[yy*w+e])e++;if(e-x>=L)for(let k=x;k<e;k++)m[yy*w+k]=0;x=e;}}
 const{lab,C}=components(m,w,h);const ok=q=>q.h>=gp*.35&&q.h<=gp*1.8&&q.w<=gp*1.2&&q.n>=gp*gp*.03;
 C.forEach(q=>{q.y0+=y0;q.y1+=y0;});const top=C.filter(q=>ok(q)&&q.y1>=dy-.75*gp&&q.y1<=dy+.45*gp&&q.y0>=dy-2.1*gp).sort((a,b)=>a.x0-b.x0);
 // stack levels under each top glyph cluster
 const used=new Set(top.map(q=>q.id));const below=C.filter(q=>ok(q)&&!used.has(q.id)&&q.y0>dy).sort((a,b)=>a.y0-b.y0);
 const all=top.slice();below.forEach(q=>all.push(q));await classify(all,lab,w,y0,'0123456789');
 all.forEach(q=>{if(q.w<q.h*.55&&q.h>gp*.9)q.d='1';q.sl=slant(q,lab,w,y0);});
 // numbers in the top row (merge "1"/"2" + digit)
 const nums=[];for(let i=0;i<top.length;i++){const a=top[i];if(a.sl>.42&&a.w<gp*.8){const b=top[i+1];if(b&&b.sl>.42&&b.x0-a.x1<gp*.6){nums.push({x:(a.x0+b.x1)/2,x0:a.x0,x1:b.x1,y1:Math.max(a.y1,b.y1),f:0,slash:1});i++;continue;}}
  if(!a.d)continue;const b=top[i+1];if(b&&b.d&&b.x0-a.x1<gp*.75&&(a.d==='1'||a.d==='2')&&+(a.d+b.d)<=22){nums.push({x:(a.x0+b.x1)/2,x0:a.x0,x1:b.x1,y1:Math.max(a.y1,b.y1),f:+(a.d+b.d)});i++;}else nums.push({x:(a.x0+a.x1)/2,x0:a.x0,x1:a.x1,y1:a.y1,f:+a.d});}
 // stacks: digits directly under a number, each level close to the previous
 const taken=new Set();nums.forEach(n=>{n.stack=[];let py=n.y1;for(let lv=0;lv<3;lv++){const q=below.find(q=>!taken.has(q.id)&&q.d&&Math.abs((q.x0+q.x1)/2-n.x)<gp*.55&&q.y0>=py-.2*gp&&q.y0-py<=gp*.5&&q.h<=gp*1.15);if(!q)break;taken.add(q.id);n.stack.push(+q.d);py=q.y1;}});
 return{nums,glyphs:all.map(q=>({x0:q.x0,y0:q.y0,x1:q.x1,y1:q.y1,d:q.d||'?'}))};}
// --- circled string numbers ①–④: ring template matching under / on the staff, digit inside classified ---
async function readCircles(G,s){const{W,H,g}=G,gp=s.gap;const ya=Math.max(0,Math.round(s.top-.5*gp)),yb=Math.min(H-1,Math.round(s.bot+2.8*gp));const K=36,cs=[],sn=[];for(let k=0;k<K;k++){cs.push(Math.cos(2*Math.PI*k/K));sn.push(Math.sin(2*Math.PI*k/K));}
 const px=(x,y)=>{x=Math.round(x);y=Math.round(y);return x>=0&&y>=0&&x<W&&y<H?g[y*W+x]:0;};const near=(x,y)=>{x=Math.round(x);y=Math.round(y);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const xx=x+i,yy=y+j;if(xx>=0&&yy>=0&&xx<W&&yy<H&&g[yy*W+xx])return 1;}return 0;};const hits=[];
 const ring=(x,y,r,f)=>{let a=0;for(let k=0;k<K;k++)a+=f(x+r*cs[k],y+r*sn[k]);return a/K;};
 for(const rf of[.68,.74,.8,.86,.92]){const r=gp*rf;for(let y=ya;y<=yb;y++)for(let x=Math.round(r+2);x<W-r-2;x++){
   if(!near(x+r,y)||!near(x-r,y)||!near(x,y+r)||!near(x,y-r))continue;const a=ring(x,y,r,near);if(a<.82)continue;const o=ring(x,y,r*1.32,px);if(o>.3)continue;const i=ring(x,y,r*.72,px);if(i>.5)continue;
   if(px(x,y-r*1.45)&&px(x,y+r*1.45))continue;hits.push({x,y,r,sc:a-o-Math.max(0,i-.35)});}}
 hits.sort((a,b)=>b.sc-a.sc);const C=[];hits.forEach(h=>{if(!C.some(c=>Math.hypot(c.x-h.x,c.y-h.y)<gp*.9))C.push(h);});C.sort((a,b)=>a.x-b.x);if(!C.length)return[];
 // digit inside: pixels within .68r (ring dropped) → bbox-normalised 16×16 → best correlation to font-rendered 1–4 templates (no scan-specific training)
 const N=16,norm=(get,w,h)=>{let x0=w,x1=-1,y0=h,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(get(x,y)){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}if(x1<0)return null;
  const bw=x1-x0+1,bh=y1-y0+1,v=new Float32Array(N*N),side=Math.max(bw,bh*.75),ox=x0+bw/2-side/2;for(let j=0;j<N;j++)for(let i=0;i<N;i++){let c=0,n=0;for(let yy=0;yy<3;yy++)for(let xx=0;xx<3;xx++){const X=Math.floor(ox+(i+(xx+.5)/3)*side/N),Y=Math.floor(y0+(j+(yy+.5)/3)*bh/N);n++;if(X>=0&&X<w&&get(X,Y))c++;}v[j*N+i]=c/n;}
  let m=0;v.forEach(z=>m+=z);m/=v.length;let ss=0;for(let k=0;k<v.length;k++){v[k]-=m;ss+=v[k]*v[k];}ss=Math.sqrt(ss)||1;for(let k=0;k<v.length;k++)v[k]/=ss;return{v,bw,bh};};
 if(!V14._tpl){V14._tpl=[];const fonts=['bold 60px serif','60px serif','bold 60px sans-serif','60px sans-serif','italic 60px serif','bold 60px monospace','italic bold 60px sans-serif'];for(const d of'1234')for(const f of fonts)for(const sk of[-.2,0,.2]){const c=document.createElement('canvas');c.width=c.height=90;const t=c.getContext('2d');t.fillStyle='#fff';t.fillRect(0,0,90,90);t.setTransform(1,0,-sk,1,0,0);t.fillStyle='#000';t.font=f;t.textBaseline='middle';t.fillText(d,30,45);
   const D=t.getImageData(0,0,90,90).data,q=norm((x,y)=>D[(y*90+x)*4]<128,90,90);if(q)V14._tpl.push({d,v:q.v});}}
 for(const q of C){const r=q.r*.68,x0=Math.round(q.x-r),y0=Math.round(q.y-r),w=Math.round(2*r)+1;let ink=0;const get=(x,y)=>{const dx=x-r,dy=y-r;return dx*dx+dy*dy<=r*r&&px(x0+x,y0+y);};for(let y=0;y<w;y++)for(let x=0;x<w;x++)if(get(x,y))ink++;
  const f=ink/(w*w)>.05?norm(get,w,w):null;q.d=null;if(!f||f.bh<r*.9)continue;let best=-2,bd=null;const sc={};V14._tpl.forEach(T=>{let c=0;for(let k=0;k<T.v.length;k++)c+=T.v[k]*f.v[k];if(!(c<=sc[T.d]))sc[T.d]=c;});
  for(const d in sc)if(sc[d]>best){best=sc[d];bd=d;}if(f.bw<f.bh*.42)bd='1';q.cs=best;if(best>.35||bd==='1')q.d=bd;}
 return C.map(q=>({x:q.x,y:q.y,r:q.r,n:q.d?+q.d:0,course:q.d?CIRC[q.d]:null,img:q.img}));}
// --- barlines: thin columns dark through ≥85% of the staff, not a stem (clear above or below) ---
function readBars(G,s){const{W,g}=G,gp=s.gap,t=Math.round(s.top),b=Math.round(s.bot);const dk=(x,y)=>g[y*W+x]||g[y*W+x+1]||g[y*W+x-1];const fr=(x,a,z)=>{let n=0,k=0;for(let y=a;y<=z;y++){k++;n+=dk(x,y);}return n/k;};
 const raw=[];for(let x=2;x<W-2;x++){if(fr(x,t,b)<.85)continue;const up=fr(x,Math.round(t-.9*gp),Math.round(t-.25*gp)),dn=fr(x,Math.round(b+.25*gp),Math.round(b+.9*gp));if(up<.35&&dn<.35)raw.push(x);}
 const B=[];raw.forEach(x=>{const l=B[B.length-1];if(l&&x-l.x1<=gp*.9){l.x1=x;}else B.push({x0:x,x1:x});});return B.filter(q=>q.x1-q.x0<gp*.9).map(q=>(q.x0+q.x1)/2);}
function dashRow(G,s){const{W,g}=G,gp=s.gap;const lo=Math.max(0,Math.round(s.top-gp*7.5)),hi=Math.round(s.top-gp*2.2),L=gp*.4;let best=-1,bv=0;
 for(let y=lo;y<hi;y++){let tot=0;for(let x=0;x<W;){if(!g[y*W+x]){x++;continue;}let e=x;while(e<W&&g[y*W+e])e++;if(e-x>=L&&e-x<gp*4)tot+=e-x;x=e;}if(tot>bv){bv=tot;best=y;}}return{dy:best,dv:bv};}
async function bookDetect14(cv0){const cv=V13.deskew(cv0),G=V13.gray(cv),{S}=V13.staves(G);if(S.length<2)return null;const{W}=G;let title='',meter=null;const systems=[];
 try{const tb=Math.max(0,S[0].top-S[0].gap*9);if(tb>10){const r=await ocr(crop(cv,0,0,W,tb,1),'',6);title=r.text.replace(/\s+/g,' ').trim();}}catch(e){}
 for(let si=0;si<S.length;si++){const s=S[si],gp=s.gap;const{dy,dv}=dashRow(G,s);if(dy<0||dv<W*.08){V14.dbg.push({si,skip:1,dy,dv});continue;}
  if(si===0){try{const r=await ocr(crop(cv,0,Math.max(0,Math.round(dy-5*gp)),Math.round(W*.6),Math.round(3.6*gp),1),'',6);if(/val|walz|waltz|βαλς|vals/i.test(r.text))meter={beats:3,bpm:126,txt:r.text.trim()};else meter={txt:r.text.trim()};}catch(e){}}
  const F=await readFrets(G,s,dy),circ=await readCircles(G,s),bars=readBars(G,s);
  const chords=[];for(const[cy,ch]of[[dy+gp*.2,Math.max(gp,s.top-dy-gp*.4)],[s.bot+gp*.9,gp*2.6]]){try{const rc=await ocr(crop(cv,0,Math.round(cy),W,Math.round(ch),1),'',11);
   rc.words.forEach(w=>{const parts=w.text.split(/(?<=[+\-–—7])(?=[A-ZΑ-Ω])/);parts.forEach((p,i)=>{const c=anyChord(p);if(c)chords.push({x:w.bbox.x0+(w.bbox.x1-w.bbox.x0)*i/parts.length,c,raw:p});});});}catch(e){}}
  let lyric='';try{const nb=S[si+1]?S[si+1].top-gp*7.5:s.bot+gp*7;const ly0=s.bot+gp*2.4;const lc=crop(cv,0,Math.round(ly0),W,Math.round(Math.max(gp*1.5,Math.min(gp*2.6,nb-ly0))),1);const rl=await ocr(lc,'',7);
   lyric=rl.text.replace(/[^\u0370-\u03ff\u1f00-\u1fff\s\-]/g,'').replace(/\s*-\s*/g,'-').replace(/\s+/g,' ').trim();if((lyric.match(/[\u0370-\u03ff]/g)||[]).length<4)lyric='';}catch(e){}
  chords.sort((a,b)=>a.x-b.x);V14.dbg.push({si,dy,nums:F.nums.map(n=>n.f+(n.stack.length?'/'+n.stack.join('/'):'')).join(' '),circ:circ.map(c=>c.n+'@'+Math.round(c.x)+','+Math.round(c.y)).join(' '),bars:bars.map(Math.round).join(' '),chords:chords.map(c=>c.raw+'→'+c.c).join(' ')});
  systems.push({s,dy,nums:F.nums,glyphs:F.glyphs,circ,bars,chords,lyric,gap:gp});}
 const nf=systems.reduce((a,s)=>a+s.nums.length,0);if(nf<8)return null;
 // notes + strings: a circle marks the string of the note above it; the string then persists until the next circle (book convention)
 const out=[];let ch=null,cur=null;
 for(const sy of systems){const gp=sy.gap,N=sy.nums;if(!N.length)continue;
  sy.circ.filter(c=>c.course).forEach(c=>{let bi=-1,bd=1e9;N.forEach((n,i)=>{const d=Math.abs(n.x-c.x);if(d<bd){bd=d;bi=i;}});if(bi>=0&&bd<gp*1.3&&(!N[bi].cc||bd<N[bi].cd)){N[bi].cc=c.course;N[bi].cd=bd;}});
  const cuts=sy.bars.filter(x=>x>N[0].x0-gp*.3&&x<N[N.length-1].x1+gp*.3);const groups=[[]];
  N.forEach(n=>{while(cuts.length&&n.x>cuts[0]){cuts.shift();if(groups[groups.length-1].length)groups.push([]);}groups[groups.length-1].push(n);});
  groups.forEach((gr,gi)=>{if(!gr.length)return;const toks=gr.map(n=>{const c=sy.chords.filter(c=>c.x<=n.x+gp*1.2).pop();if(c)ch=c.c;
    let course=null,src='';if(n.stack.length){course='D';src='stack';}else if(n.cc){course=cur=n.cc;src='circle';}else if(cur){course=cur;src='persist';}
    const notes=[{fret:n.f,course,src}];n.stack.forEach((f,k)=>notes.push({fret:f,course:CO[CO.length-2-k]||'C',src:'stack'}));return{notes,chord:ch};});
   out.push({chord:toks[0].chord,lyric:gi===0?sy.lyric:'',toks});});}
 V14.overlayData={cv,systems};return{title,bars:out,meter};}
V14.bookDetect=bookDetect14;
// unknown strings (before the first circle) → v13 DP; frets impossible for the course are re-chosen
function fillCourses(bars){const flat=[];bars.forEach(b=>b.toks.forEach(t=>flat.push(t.notes[0])));const tmp=flat.map(n=>({fret:n.fret,chord:null}));V13.chooseCourses(tmp);flat.forEach((n,i)=>{if(!n.course){n.course=tmp[i].course;n.src='dp';}});}
function barsToText14(bars){return bars.map(b=>{let c=null;return b.toks.map(t=>{const s=t.notes.map(n=>n.fret+(n.course||'')).join('+')+(t.chord&&t.chord!==c?'@'+t.chord:'');c=t.chord;return s;}).join(' ')+(b.lyric?' | '+b.lyric:'');}).join('\n');}
function textToBars14(t){const bars=[];let ch=null;t.split('\n').forEach(l=>{if(!l.trim())return;const i=l.indexOf('|');const body=i<0?l:l.slice(0,i),ly=i<0?'':l.slice(i+1).trim();const toks=[];
 body.trim().split(/\s+/).forEach(tok=>{let c=null;const at=tok.indexOf('@');if(at>=0){c=tok.slice(at+1);tok=tok.slice(0,at);}let w=1;const co=tok.match(/:([\d.]+)$/);if(co){w=+co[1];tok=tok.slice(0,co.index);}
  const notes=tok.split('+').map(p=>{const m=p.match(/^(\d{1,2})([CFAD])?$/);if(!m)throw 'לא הבנתי את "'+p+'" — סריג+מיתר, אקורד מוערם עם +: ‏3D+3A+4F, אורך ‎:2, אקורד ‎@ΦΑ+';return{fret:+m[1],course:m[2]||null};});
  if(c){const cc=anyChord(c);if(!cc)throw 'אקורד לא מזוהה: '+c;ch=cc;}toks.push({notes,w,chord:ch});});if(toks.length)bars.push({toks,lyric:ly});});if(!bars.length)throw 'אין תווים';return bars;}
function buildBook14(bars,bpm,BAR){const need=[];bars.forEach(b=>b.toks.forEach(t=>t.notes.forEach(n=>{if(!n.course)need.push(n);})));if(need.length){const tmp=need.map(n=>({fret:n.fret,chord:null}));V13.chooseCourses(tmp);need.forEach((n,i)=>n.course=tmp[i].course);}
 const spb=60/bpm,ev=[],chords={};let beat=0;bars.forEach(b=>{const tot=b.toks.reduce((a,t)=>a+t.w,0);b.toks.forEach((t,k)=>{const d=t.w/tot*BAR;if(t.chord)chords[t.chord]=grip(t.chord);
  t.notes.forEach(n=>ev.push({t:+(beat*spb).toFixed(4),course:n.course,fret:n.fret,dur:+(d*spb*.95).toFixed(4),pick:Math.abs(beat-Math.round(beat))<1e-6?'down':'up',chord:t.chord||undefined,lyric:(k===0&&b.lyric)||undefined}));beat+=d;});});
 ev.forEach((e,i)=>{e.next=(ev.slice(i+1).find(x=>x.chord&&x.chord!==e.chord)||{}).chord||null;});return{events:ev,chords};}
Object.assign(V14,{readFrets,readCircles,readBars,dashRow,textToBars14,barsToText14,buildBook14,fillCourses});
// overlay of what was read (for checking): fret numbers green, stacks cyan, circles orange, barlines red
V14.overlay=function(){const o=V14.overlayData;if(!o)return null;const c=document.createElement('canvas');c.width=o.cv.width;c.height=o.cv.height;const t=c.getContext('2d');t.drawImage(o.cv,0,0);t.lineWidth=3;t.font='bold 30px sans-serif';
 o.systems.forEach(sy=>{t.strokeStyle='rgba(220,0,0,.7)';sy.bars.forEach(x=>{t.beginPath();t.moveTo(x,sy.s.top-10);t.lineTo(x,sy.s.bot+10);t.stroke();});
  sy.nums.forEach(n=>{t.fillStyle='rgba(0,150,0,.9)';t.fillText(n.f+(n.stack.length?'/'+n.stack.join('/'):''),n.x0,sy.dy-sy.gap*1.6);});
  sy.circ.forEach(q=>{t.strokeStyle='rgba(255,120,0,.95)';t.beginPath();t.arc(q.x,q.y,q.r+4,0,7);t.stroke();t.fillStyle='rgba(255,120,0,1)';t.fillText(q.course||'?',q.x-9,q.y+q.r+30);});
  sy.chords.forEach(q=>{t.fillStyle='rgba(0,90,220,1)';t.fillText(q.c,q.x,sy.s.bot+sy.gap*4.2);});});return c.toDataURL('image/jpeg',.8);};
async function tryBook14(f,buf,h,n){let cvs=null;if(/^%PDF/.test(h)||/\.pdf$/.test(n))cvs=await V13.renderPDF(buf);
 else if(/^\x89PNG/.test(h)||/\.(png|jpe?g|webp|gif)$/.test(n)){const url=URL.createObjectURL(new Blob([buf],{type:f.type||'image/png'}));const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url;});const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;cv.getContext('2d').drawImage(img,0,0);cvs=[cv];}
 if(!cvs)return null;setMsg('דף סרוק — קורא סריגים, מספרי מיתר מוקפים ואקורדים (v14)…',false);let bars=[],title='',meter=null;V14.dbg=[];
 for(const cv of cvs){const r=await bookDetect14(cv);if(r){bars=bars.concat(r.bars);title=title||r.title;meter=meter||r.meter;}}if(!bars.length)return null;return{bars,title,meter};}
const ed=$('v13edit'),prevAnalyze=analyze;let busy=null,busyF=null;
async function analyze14(){ed.style.display='none';V14.last=null;const f=$('afile').files[0];
 if(f){try{const buf=await readBuf(f),u=new Uint8Array(buf),h=String.fromCharCode(...u.slice(0,12)),n=(f.name||'').toLowerCase();const r=await tryBook14(f,buf,h,n);
  if(r){V14.last=r;fillCourses(r.bars);const flat=[];r.bars.forEach(b=>b.toks.forEach(t=>t.notes.forEach(x=>flat.push(x))));const nc=r.bars.reduce((a,b)=>a+b.toks.length,0);
   parsed={book:true,book14:true,notes:flat.map((x,i)=>({beat:i,dur:1,midi:OPEN[x.course]+x.fret,course:x.course,fret:x.fret})),title:r.title};
   $('v13bars').value=barsToText14(r.bars);const beats=r.meter&&r.meter.beats||9;$('v13beats').value=beats;ed.style.display='block';
   const k=(r.title||'').replace(/\s/g,'').toLowerCase();const hit=DATA.songs.find(s=>s.match&&s.match.some(w=>k.includes(w.replace(/\s/g,'').toLowerCase())));
   $('v13hit').innerHTML=hit?'<div class="note" style="margin-top:8px">יש לשיר הזה גם גרסה מתועתקת ביד, מדויקת יותר: <button class="bs" id="v13use">▶ נגן את “'+hit.title+'”</button></div>':'';
   if(hit)$('v13use').onclick=()=>{closeAdd();load(hit);};
   if(!$('atitle').value)$('atitle').value=(hit?hit.title.split(' · ')[0]:'')||(f.name||'שיר').replace(/\.[^.]+$/,'');$('abpm').value=r.meter&&r.meter.bpm||76;
   const nCirc=flat.filter(x=>x.src==='circle').length,nSt=r.bars.reduce((a,b)=>a+b.toks.filter(t=>t.notes.length>1).length,0);
   setMsg('זיהוי ספר בוזוקי (OCR מסריקה, v14) · נמצאו '+flat.length+' תווים ('+nSt+' אקורדים מוערמים) ב-'+r.bars.length+' תיבות · '+nCirc+' מספרי מיתר מוקפים זוהו'+(beats===3?' · משקל 3/4 (ואלס)':'')+' · מקצב: חלוקה שווה בתיבה — בדוק ותקן למטה',false);return true;}}catch(e){console.warn('v14 book',e);}}
 return await prevAnalyze();}
analyze=function(){const f=$('afile').files[0];if(busy&&f&&f===busyF)return busy;busyF=f;busy=analyze14().finally(()=>{busy=null;busyF=null;});return busy;};
$('aan').onclick=()=>analyze();
const prevAdd=addSong;
addSong=async function(){if(!parsed&&!(await analyze()))return;if(!parsed||!parsed.book14)return await prevAdd();
 let bars;try{bars=textToBars14($('v13bars').value);}catch(e){setMsg(String(e),true);return;}const BAR=+$('v13beats').value||9,bpm=+$('abpm').value||76;const b=buildBook14(bars,bpm,BAR);
 const s={id:'u'+Date.now(),title:$('atitle').value.trim()||'שיר חדש',bpm,scale:$('ascale').value.trim()||'סולם לא צוין',est:'ספר בוזוקי · מקצב משוער',scaleEst:true,chords:b.chords,user:true,events:b.events};
 const er=validate(s);if(er.length){setMsg('<b>השיר לא תקין — לא נוסף</b><br>'+er.slice(0,6).join('<br>'),true);return;}
 USER.push(s);saveUser();addBtn(s);closeAdd();parsed=null;ed.style.display='none';$('afile').value='';$('atitle').value='';load(s);};
})();
</script>
