# assemble v7.js from the approved preview parts + game glue
import re
P='preview-parts/'
s=open(P+'setup.js',encoding='utf-8').read().split('\n')
people='\n'.join(s[1:49])          # SKIN, PEOPLE, shade, person, BLANK
i0=[k for k,l in enumerate(s) if l.startswith('function pawnS(')][0]
i1=[k for k,l in enumerate(s) if l.startswith('var MODE_ORDER=')][0]
art='\n'.join(s[i0:i1]).replace('var MODES={','var MART={')
ch=open(P+'chest3.js',encoding='utf-8').read().replace('function chestSvg(t,open){','var CHN=0;chestSvg=function(t,open){').replace("u='q'+t+(open?'o':'c')","u='q'+t+(open?'o':'c')+(++CHN)")
glue=open('v7glue.js',encoding='utf-8').read()
out='/* ===================== v1.3: white look, swipe home, setup screens, colours, winner takes all, chest tiers, people pictures ===================== */\n(function(){\n'+people+'\n'+art+'\n'+ch+'\n'+glue+'\n})();\n'
open('v7.js','w',encoding='utf-8').write(out)
print(len(out))
