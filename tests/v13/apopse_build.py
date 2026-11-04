# Hand transcription of «Απόψε κάνεις μπαμ» (user-supplied scan, private use only).
# token: fret+course[:weight][@chord]  weight in relative units inside the bar (default 1)
import json
B=[ # (bar label, lyric, tokens)
('pick','', '7F:1@C'),
('A1','', '7A@C 8F 7A 8F 7F 10A 8A 10A 8A 7A 7A 8F:.5 7A:.5 8F@Bbm 7F 10C 8F'),
('V1','', '7F:1.5@C 8F:.5 7F 6F 7F:.5 8F:.5 7A:.5 8A:.5 10A:1.5 7F'),
('A1','', '7A@C 8F 7A 8F 7F 10A 8A 10A 8A 7A 7A 8F:.5 7A:.5 8F@Bbm 7F 10C 8F'),
('V2','', '7F:.5@C 7A:.5 8A 10A 11A 10A:.5@Bbm 8A:.5 7A:.5 8F:.5 7F@C 7F'),
('V','Α-πό-ψε κά-νεις μπαμ, α-πό-ψε κά-νεις μπαμ', '8A@Fm 8A 10A:.5 7D:.5 8D 8D:3@Bbm 8A:.5 8D 8D 8D:.5 10D:.5 11D 10D:3@C 10D:1.5 10D:.5'),
('V','σε βλέ-πουν και φρε-νά-ρουν', '8D@Fm 11A 10A 8A 7A@C 8F 10A:1.5 8A:.5 7A'),
('V','ε και στα-μα-τούν τα τραμ', '8F:.5@Bbm 7A:.5 8F 7F 10C 7F:2@C 7F 7F 9F 7A'),
('V','στο-λί-στη-κες κυ-ρά μου', '8A@F 8A 10A:.5 7D:.5 10A 8A 10D@C7 10D 8D 7D 10A@F 8A 8A:2 7F'),
('V','στην πέν-να στο κα-ντί-νι, να ζή-σει ο λε-βέν-της', '8A 8A 10A 7D 10A 8A 10D 10D 10D@C7 8D 7D 10A@F 8A 8A 7A'),
('V','ο λε-βέν-της που σε ντύ-νει', '8D:1.5@Bbm 11A:.5@Fm 10A@C 8A 7A@Bbm 8F@C 7F'),
('V','α-πό-ψε κά-νεις μπαμ', '11D:.5 11D:.5 11D 8D@Bbm 11D:.5 10D:.5 8D 7A 8F 7F:.5 6F:.5 7F:2@C 7F'),
]
BPM=76;BAR=9.0
UNIQ=['pick','A1','V1','V2']  # unique notated bars (A1 counted once)
ev=[];beat=0;ch='C';hand=[];seen=set()
for lab,ly,toks in B:
  ts=[];
  for t in toks.split():
    c=None
    if '@' in t:t,c=t.split('@')
    w=1.0
    if ':' in t:t,w=t.split(':');w=float(w)
    ts.append((int(t[:-1]),t[-1],w,c))
  tot=sum(x[2] for x in ts); length=1.0 if lab=='pick' else BAR
  if lab=='pick':tot=1/.5
  b=beat
  first=True
  for fr,co,w,c in ts:
    if c:ch=c
    d=w/tot*length
    on=abs(b-round(b))<1e-6
    ev.append(dict(t=round(b*60/BPM,4),course=co,fret=fr,dur=round(d*60/BPM*.95,4),pick='down' if on else 'up',chord=ch,lyric=ly or None))
    b+=d
  beat=b if lab!='pick' else 0.5
  if not (lab=='A1' and lab in seen): hand+= [[fr,co] for fr,co,_,_ in ts]
  seen.add(lab)
for i,e in enumerate(ev):
  nx=next((x['chord'] for x in ev[i+1:] if x['chord']!=e['chord']),None);e['next']=nx
  if not e['lyric']:del e['lyric']
song=dict(id='apopse',title='Απόψε κάνεις μπαμ · ζεϊμπέκικο 9/4',bpm=BPM,
 chords={'C':[0,2,3,2],'C7':[0,2,1,2],'F':[5,0,0,3],'Fm':[0,3,3,3],'Bbm':[1,0,1,3]},
 events=ev,scale='Χιτζάζ σε Ντο · ‏C D♭ E F G A♭ B♭ · ζεϊμπέκικο 9/4 (9/8)',
 est='תועתק ביד מהדף שהועלה (שימוש פרטי) · קצב משוער',scaleEst=False,
 match=['ΑΠΟΨΕΚΑΝΕΙΣ','ΚΑΝΕΙΣΜΠΑΜ','apopsekaneis','αποψεκανεις','κανειςμπαμ'])
json.dump(song,open('/tmp/bzf/tests/v13/apopse_song.json','w'),ensure_ascii=False)
json.dump(hand,open('/tmp/bzf/tests/v13/apopse_hand.json','w'))
print(len(ev),'events',len(hand),'unique notated notes')
