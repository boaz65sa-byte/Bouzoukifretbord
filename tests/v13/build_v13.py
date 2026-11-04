# builds reel-engine-v13.html from v12 (v12 untouched) · bs-simple.com · פתרונות יצירתיים · בועז סעדה
import json
L=open('reel-engine-v12.html',encoding='utf-8').read().split('\n')
song=json.load(open('tests/v13/apopse_song.json',encoding='utf-8'))
ins='/* v13: «Απόψε κάνεις μπαμ» — transcribed by hand from a user-supplied scan; private use only, not for redistribution. */DATA.songs.push('+json.dumps(song,ensure_ascii=False)+');'
L=L[:64]+[ins]+L[64:]
s='\n'.join(L)
mod=open('tests/v13/v13mod.js',encoding='utf-8').read()
s=s.replace('</body>',mod+'</body>',1).replace('reel-engine-v12','reel-engine-v13')
open('reel-engine-v13.html','w',encoding='utf-8').write(s)
