import json
P=[('critter','Critter','rare','burst',['🌰','💥','🐾'],'NIBBLE!'),('robot','Robot','rare','zap',['⚡','🔩','⚙️'],'ZAP!'),('ghost','Ghost','epic','spook',['👻','💨','🕸️'],'BOO!'),
('rocket','Rocket','rare','blast',['🔥','💥','💨'],'BLAST OFF!'),('a_bear','Bear','rare','slam',['🐾','💥'],'BEAR HUG!'),('a_panda','Panda','rare','slam',['🎋','💥'],'KUNG FU!'),
('a_pup','Pup','rare','burst',['🦴','🐾','💥'],'WOOF!'),('a_fox','Fox','rare','swipe',['🍂','💨','🐾'],'SLY SWIPE!'),('a_lion','Lion','epic','roar',['💢','🐾','💥'],'ROAR!'),
('a_tiger','Tiger','epic','swipe',['🐾','💥','💢'],'POUNCE!'),('a_rabbit','Rabbit','rare','slam',['🥕','💫'],'THUMP!'),('a_monkey','Monkey','rare','slam',['🍌','💥'],'BANANA BONK!'),
('a_koala','Koala','rare','burst',['🍃','💤','💥'],'NAP ATTACK!'),('a_piglet','Piglet','rare','splash',['🟤','💦','💥'],'MUD SPLAT!'),('a_penguin','Penguin','rare','freeze',['❄️','🧊'],'ICE SLIDE!'),
('a_owl','Owl','rare','swirl',['🪶','🌙','✨'],'HOOT!'),('a_duck','Duck','rare','splash',['💦','🫧'],'QUACK!'),('a_chick','Chick','rare','burst',['🥚','🐣','💥'],'PECK!'),
('a_bee','Bee','rare','sting',['🍯','💢','✨'],'BZZZ STING!'),('a_ladybug','Ladybug','rare','burst',['🔴','✨','🍃'],'LUCKY HIT!'),('a_butterfly','Butterfly','rare','swirl',['🌸','✨','🦋'],'FLUTTER!'),
('a_spider','Spider','rare','web',['🕸️','💢'],'WEBBED!'),('a_clownfish','Clownfish','rare','splash',['🫧','🌊'],'SPLASH!'),('a_shark','Shark','epic','chomp',['🌊','💦','🫧'],'CHOMP!'),
('a_octopus','Octopus','epic','ink',['🖤','💦','🫧'],'INKED!'),('a_crab','Crab','rare','snip',['✂️','💦'],'SNIP!'),('a_whale','Whale','rare','splash',['🌊','💦','🐳'],'TIDAL WAVE!'),
('a_puffer','Pufferfish','rare','burst',['💥','🫧','📌'],'PUFF POP!'),('a_ufo','UFO','legendary','beam',['✨','🌀','💫'],'ABDUCTED!'),('a_satellite','Satellite','epic','zap',['⚡','📡','💥'],'ORBIT ZAP!'),
('a_alien','Alien','legendary','zap',['💚','⚡','✨'],'ZAPPED!'),('a_astronaut','Astronaut','legendary','blast',['🚀','⭐','💥'],'LIFT OFF!'),('a_comet','Comet','epic','meteor',['🔥','💥','⭐'],'METEOR!'),
('a_dragon','Dragon','legendary','fire',['🔥','🔥','💥'],'BURNED!'),('a_unicorn','Unicorn','legendary','rainbow',['🌈','✨','💖','⭐'],'RAINBOW BLAST!'),('a_wizard','Wizard','legendary','zap',['⚡','🔮','✨'],'KABOOM!'),
('a_fairy','Fairy','epic','swirl',['✨','🌸','💫'],'POOF!'),('a_bat','Bat','rare','swirl',['🦇','🌙'],'SWOOP!'),('a_rook','Rook','rare','slam',['🧱','💥'],'CRUSH!'),
('a_bishop','Bishop','rare','swirl',['✨','💫'],'BLESSED!'),('a_knight','Knight','epic','swipe',['⚔️','💥','🛡️'],'CHARGE!'),('a_queen','Queen','legendary','royal',['👑','💎','✨'],'OFF WITH YOU!'),
('a_king','King','epic','royal',['👑','⚔️','✨'],'BANISHED!')]
data=[dict(id=a,n=b,r=c,k=d,p=e,w=f) for a,b,c,d,e,f in P]
html=open('tpl.html',encoding='utf-8').read().replace('__DATA__',json.dumps(data,ensure_ascii=False))
open('ludora-pawns.html','w',encoding='utf-8').write(html)
print(len(data))
