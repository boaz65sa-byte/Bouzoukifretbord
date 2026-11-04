# builds reel-engine-v14.html from v13 (v11–v13 untouched) · bs-simple.com · פתרונות יצירתיים · בועז סעדה
import json
L=open('reel-engine-v13.html',encoding='utf-8').read().split('\n')
assert L[64].startswith('/* v13:')
song=json.load(open('tests/v14/gamou_song.json',encoding='utf-8'))
ins='/* v14: «Του γάμου» (no.30) — transcribed by hand from a user-supplied scan (arrangement © Δημ. Μπουκουβάλα); private use only, not for redistribution. */DATA.songs.push('+json.dumps(song,ensure_ascii=False)+');'
L=L[:65]+[ins]+L[65:]
s='\n'.join(L)
mod=open('tests/v14/v14mod.js',encoding='utf-8').read()
s=s.replace('</body>',mod+'</body>',1).replace('reel-engine-v13','reel-engine-v14')
open('reel-engine-v14.html','w',encoding='utf-8').write(s)
