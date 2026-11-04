# Hand transcription of «Του γάμου» (no.30, user-supplied scan; arrangement © Δημ. Μπουκουβάλα) — private use only.
# token: fret+course[+fret+course...][:weight][@chord]; '-:w' = tie/hold previous note; 'r:w' = rest. weights in quarter notes (bar=3)
import json
CH='3D+3A+4F'; RUN='11F:.5 12F:.5 10A:.5 12A:.5 13A:.5 10D:.5'
BARS={
'I1':('',f'5C@F {CH} {CH}'),'I2':('',f'0C {CH} {CH}'),'I3':('',f'5C {CH} {CH}'),'I4':('',RUN),
'A5':('','12D@Bb 12D 12D'),'A6':('','12D 10D 12D'),'A7':('','14D@F 10D:2'),'A8':('','-:2 12A'),
'A9':('','13A:2@Gm 10D@F'),'A10':('','14D@C7 12D 10D'),'A11':('','13A@F 12A:2'),'A12':('',RUN),
'A13':('','12D@Bb 12D 12D'),'A14':('','12D 10D 12D'),'A15':('','14D@F 10D:2'),'A16':('','-:2 12A'),
'A17':('','13A:2@Gm 10D@F'),'A18':('','14D@C7 12D 10D'),'A19':('','13A@F 12A:2'),'A20':('','-:3'),
'V1':('Σή-','10D:3@F'),'V2':('με-ρα γα,','14A@C7 10D 14A'),'V3':('σή-με-','12A:2@F 12F'),'V4':('ρα γα-','12A:2@C7 14A'),
'V5':('μος γί-','10D@F 12D 10D'),'V6':('νε-','10D@C7 12D 14A'),'V7':('ται','12A:3@F'),'V8':('','-:2 r'),
'V9':('ται','12A:3@F'),'V10':('',RUN),
'B1':('ώ-','12D:2@Bb 12D'),'B2':('ραί-ο','12D 10D 12D'),'B3':('πε-ρι-','14D@F 10D:.5 12D:.5 10D:.5 12D:.5'),'B4':('βό-λι, ώ-','10D:2 12A'),
'B5':('ραί-ο','13A:2@C7 10D@F'),'B6':('πε-ρι-','14D@C7 12D 10D'),'B7':('βό-λι','14A@F 12A:2'),'B8':('',RUN),
'B9':('βό-λι','14A@F 12A:2'),'B10':('','-:3')}
NOTATED=['I1','I2','I3','I4']+[f'A{i}' for i in range(5,21)]+[f'V{i}' for i in range(1,11)]+[f'B{i}' for i in range(1,11)]
ORDER=NOTATED[:20]+[f'V{i}' for i in range(1,9)]+[f'V{i}' for i in range(1,7)]+['V9','V10']+[f'B{i}' for i in range(1,9)]+[f'B{i}' for i in range(1,7)]+['B9','B10']
BPM=126
ev=[];beat=0;ch='F';last=[]
def parse(toks):
  out=[]
  for t in toks.split():
    c=None
    if '@' in t:t,c=t.split('@')
    w=1.0
    if ':' in t:t,w=t.split(':');w=float(w)
    notes=[] if t in('-','r') else [(int(x[:-1]),x[-1]) for x in t.split('+')]
    out.append((t,notes,w,c))
  return out
for lab in ORDER:
  ly,toks=BARS[lab];b=beat;first=True
  for kind,notes,w,c in parse(toks):
    if c:ch=c
    if kind=='-':
      for e in last:e['dur']=round(e['dur']+w*60/BPM,4)
    elif notes:
      on=abs(b-round(b))<1e-6;last=[]
      for fr,co in notes:
        e=dict(t=round(b*60/BPM,4),course=co,fret=fr,dur=round(w*60/BPM*.95,4),pick='down' if on else 'up',chord=ch)
        if first and ly:e['lyric']=ly
        ev.append(e);last.append(e)
      first=False
    else:last=[]
    b+=w
  beat+=3
hand=[[fr,co] for lab in NOTATED for k,n,w,c in parse(BARS[lab][1]) for fr,co in n]
for i,e in enumerate(ev):e['next']=next((x['chord'] for x in ev[i+1:] if x['chord']!=e['chord']),None)
song=dict(id='gamou',title='Του γάμου · Tempo di Vals 3/4',bpm=BPM,
 chords={'F':[5,0,0,3],'Bb':[2,0,1,0],'Gm':[2,2,1,0],'C7':[0,2,1,2]},events=ev,
 scale='Φα ματζόρε · ‏F G A B♭ C D E · βαλς 3/4',est='תועתק ביד מהדף שהועלה (שימוש פרטי) · קצב לפי התווים',scaleEst=False,
 match=['ΤΟΥΓΑΜΟΥ','ΣΗΜΕΡΑΓΑΜΟΣ','tougamou','τουγαμου','σημεραγαμος'])
json.dump(song,open('/tmp/bzf/tests/v14/gamou_song.json','w'),ensure_ascii=False)
json.dump(hand,open('/tmp/bzf/tests/v14/gamou_hand.json','w'))
print(len(ev),'events',len(hand),'notated notes',round(ev[-1]['t'],1),'s')
