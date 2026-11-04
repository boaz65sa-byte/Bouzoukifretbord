# fret/string accuracy of the OCR import vs the hand transcription (sequence alignment)
import json
d=json.load(open('/tmp/bzf/tests/v13/_cmp.json'));G=d['got'];H=d['hand']
n,m=len(H),len(G);D=[[0]*(m+1) for _ in range(n+1)]
for i in range(n+1):D[i][0]=i
for j in range(m+1):D[0][j]=j
for i in range(1,n+1):
  for j in range(1,m+1):D[i][j]=min(D[i-1][j]+1,D[i][j-1]+1,D[i-1][j-1]+(H[i-1][0]!=G[j-1][0]))
i,j,fm,sm=n,m,0,0
while i and j:
  if D[i][j]==D[i-1][j-1]+(H[i-1][0]!=G[j-1][0]):
    if H[i-1][0]==G[j-1][0]:
      fm+=1;sm+=H[i-1][1]==G[j-1][1]
    i-=1;j-=1
  elif D[i][j]==D[i-1][j]+1:i-=1
  else:j-=1
print(json.dumps({'hand':n,'ocr':m,'fret_match':fm,'fret_acc':round(100*fm/n,1),'fret+string':sm,'full_acc':round(100*sm/n,1)}))
