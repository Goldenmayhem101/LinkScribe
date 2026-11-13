#!/usr/bin/env python3
"""Build Ludora v1.2: orig.html + targeted fixes + v2.css + v2.js (+ i18n.js) -> index.html"""
import sys, os
D = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(D, 'orig.html'), encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n < 1:
        sys.exit('NOT FOUND: ' + old[:80])
    if count and n != count:
        sys.exit('COUNT %d != %d: %s' % (n, count, old[:80]))
    s = s.replace(old, new)

# bigger yard slots
rep("var SLOTS=[[2,1.95],[4,1.95],[2,3.55],[4,3.55]];", "var SLOTS=[[1.9,1.9],[4.1,1.9],[1.9,4.1],[4.1,4.1]];")
rep("se('circle',{cx:cx,cy:cy,r:.55,fill:'none'", "se('circle',{cx:cx,cy:cy,r:.8,fill:'none'")
rep("se('circle',{cx:cx,cy:cy,r:.55,fill:TH?", "se('circle',{cx:cx,cy:cy,r:.8,fill:TH?")

# entry fee + prize pool wording (no "bet")
rep('<h3>Entry bet</h3>', '<h3>Entry fee</h3>')
rep("$('#su-prize').textContent=wStake?('You pay '+nf(wStake)+' to enter. Win and you get '+nf(prize)+' coins. Balance: '+nf(set.coins)+'.'):('Free game, no coins at stake. Balance: '+nf(set.coins)+'.');",
    "$('#su-prize').textContent=wStake?('Entry fee: '+nf(wStake)+' coins. Prize pool: '+nf(prize)+' coins for 1st place'+(team?' (your team)':'')+'. Game coins only, never real money. Balance: '+nf(set.coins)+'.'):('Free game, no entry fee. Balance: '+nf(set.coins)+'.');")
rep("$('#x-text').textContent+=prize>S.stake?(' You won '+nf(prize)+' coins!'):(prize?(' Your bet of '+nf(S.stake)+' coins is returned.'):(' You lost your bet of '+nf(S.stake)+' coins.'));",
    "$('#x-text').textContent+=prize>S.stake?(' You won the prize pool: '+nf(prize)+' coins!'):(prize?(' Your entry fee of '+nf(S.stake)+' coins is returned.'):(' The prize pool went to the winner.'));")
rep("toast('Not enough coins for that bet. Playing a free game.')", "toast('Not enough coins for that entry fee. Playing a free game.')")
rep("Ludora is a casual game. There is no betting, no entry fees and no real-money prizes. Coins are earned by playing.",
    "Ludora is a casual game. Coin entry fees and prize pools use only coins earned in the game. There is no real money, no betting with money and no real-money prizes. Coins are earned by playing.")
rep("Ludora is a casual game: no betting, no entry fees, no real-money prizes.", "Ludora is a casual game: no real money and no real-money prizes.")

# teach as you play: no rule cards before the first game; old hand loop replaced in v2.js
rep("if(!set.seen){helpAfter=beginPlay;showHelp(0);}else beginPlay();", "if(!set.seen){set.seen=true;save();}beginPlay();")
rep("function handShow(x,y,text){\n  return;\n", "function handShow(x,y,text){\n")
rep("  setInterval(function(){\n    if(set.tut)return;\n    if($('#intro')", "  setInterval(function(){\n    return;\n    if($('#intro')")

# auto play must still count as you (prize pool, wins, stats)
rep("function sideMine(seat){return S.mode!=='pass'&&S.players.some(function(p){return teamOf(p.seat)===teamOf(seat)&&mine(p);});}",
    "function sideMine(seat){return S.mode!=='pass'&&S.players.some(function(p){return teamOf(p.seat)===teamOf(seat)&&(mine(p)||p.you);});}")

rep("if(pl.bot){say(nameOf(pl)+' is getting ready…');", "if(pl.bot){say(pl.you?'Auto play is rolling for you…':nameOf(pl)+' is getting ready…');")

rep("if(SPECIALFX[lookOf(pl).p]){await wait(Math.max(350,800*SPEED));", "if(SPECIALFX[lookOf(pl).p]){await wait(Math.max(700,1500*SPEED));")

# no dice upgrade progress in the item sheet
rep("if(cat==='die'&&owned('die',it.id)){var fq=set.dl[it.id]||0", "if(false){var fq=set.dl[it.id]||0")

# winner takes all: no refund for 2nd place
rep("    else if(!S.team&&sec&&sideMine(sec.seat))prize=S.stake;\n", "")

# inject CSS + JS
css = open(os.path.join(D, 'v2.css'), encoding='utf-8').read()
if os.path.exists(os.path.join(D, 'v7.css')):
    css += '\n' + open(os.path.join(D, 'v7.css'), encoding='utf-8').read()
i = s.index('</style>')
s = s[:i] + css + s[i:]
js = open(os.path.join(D, 'v2.js'), encoding='utf-8').read()
if os.path.exists(os.path.join(D, 'v3.js')):
    js += '\n' + open(os.path.join(D, 'v3.js'), encoding='utf-8').read()
if os.path.exists(os.path.join(D, 'v4.js')):
    js += '\n' + open(os.path.join(D, 'v4.js'), encoding='utf-8').read()
if os.path.exists(os.path.join(D, 'v5.js')):
    js += '\n' + open(os.path.join(D, 'v5.js'), encoding='utf-8').read()
if os.path.exists(os.path.join(D, 'v6.js')):
    js += '\n' + open(os.path.join(D, 'v6.js'), encoding='utf-8').read()
if os.path.exists(os.path.join(D, 'v7.js')):
    js += '\n' + open(os.path.join(D, 'v7.js'), encoding='utf-8').read()
if os.path.exists(os.path.join(D, 'i18n.js')):
    js += '\n' + open(os.path.join(D, 'i18n.js'), encoding='utf-8').read()
tail = '})();\n</script>'
i = s.rfind(tail)
dbg = '\nwindow.__ev=function(e){return eval(e);};\n' if '--debug' in sys.argv else '\n'
s = s[:i] + js + dbg + s[i:]
out = 'dbg.html' if '--debug' in sys.argv else 'index.html'
open(os.path.join(D, out), 'w', encoding='utf-8').write(s)
print('ok', out, len(s))
