/* ===================== languages: 10-language picker, Arabic flips right-to-left =====================
   Text on screen is translated as it appears (menus, messages, toasts). Names of boards, dice and other
   collectibles stay as they are. Order in each line: English|es|pt|fr|de|it|id|tr|hi|ar */
(function(){
var LANGS=[['en','English'],['es','Español'],['pt','Português'],['fr','Français'],['de','Deutsch'],['it','Italiano'],['id','Bahasa Indonesia'],['tr','Türkçe'],['hi','हिन्दी'],['ar','العربية']];
var CODES=LANGS.map(function(l){return l[0];});
var RAW=`You|Tú|Você|Toi|Du|Tu|Kamu|Sen|आप|أنت
Player|Jugador|Jogador|Joueur|Spieler|Giocatore|Pemain|Oyuncu|खिलाड़ी|لاعب
Red|Rojo|Vermelho|Rouge|Rot|Rosso|Merah|Kırmızı|लाल|أحمر
Green|Verde|Verde|Vert|Grün|Verde|Hijau|Yeşil|हरा|أخضر
Yellow|Amarillo|Amarelo|Jaune|Gelb|Giallo|Kuning|Sarı|पीला|أصفر
Blue|Azul|Azul|Bleu|Blau|Blu|Biru|Mavi|नीला|أزرق
Frame|Marco|Moldura|Cadre|Rahmen|Cornice|Bingkai|Çerçeve|फ्रेम|إطار
Board|Tablero|Tabuleiro|Plateau|Spielbrett|Tabellone|Papan|Tahta|बोर्ड|اللوحة
Pawn|Ficha|Peão|Pion|Figur|Pedina|Bidak|Piyon|गोटी|قطعة
Dice|Dado|Dado|Dé|Würfel|Dado|Dadu|Zar|पासा|نرد
Emoji pack|Paquete de emojis|Pacote de emojis|Pack d'emojis|Emoji-Paket|Pacchetto emoji|Paket emoji|Emoji paketi|इमोजी पैक|حزمة إيموجي
Wooden|Madera|Madeira|Bois|Holz|Legno|Kayu|Tahta|लकड़ी|خشبي
Silver|Plata|Prata|Argent|Silber|Argento|Perak|Gümüş|चाँदी|فضي
Golden|Dorado|Dourado|Doré|Gold|Dorato|Emas|Altın|सुनहरा|ذهبي
Roll. Race. Get home first.|Tira. Corre. Llega primero a casa.|Role. Corra. Chegue primeiro em casa.|Lance. Foncez. Rentrez le premier.|Würfeln. Rennen. Als Erster heim.|Tira. Corri. Arriva prima a casa.|Lempar. Balapan. Pulang duluan.|At. Yarış. Eve ilk sen var.|पासा फेंको। दौड़ो। सबसे पहले घर पहुँचो।|ارمِ. تسابق. اصل إلى البيت أولاً.
Play vs computer|Jugar contra la computadora|Jogar contra o computador|Jouer contre l'ordinateur|Gegen den Computer|Gioca contro il computer|Main lawan komputer|Bilgisayara karşı oyna|कंप्यूटर के साथ खेलें|العب ضد الكمبيوتر
Start right away|Empieza ya|Comece agora|Commencez tout de suite|Sofort loslegen|Inizia subito|Mulai sekarang|Hemen başla|अभी शुरू करें|ابدأ فوراً
Team match 2 vs 2|Partida por equipos 2 contra 2|Partida em equipe 2 contra 2|Match en équipe 2 contre 2|Teamspiel 2 gegen 2|Partita a squadre 2 contro 2|Pertandingan tim 2 lawan 2|Takım maçı 2'ye 2|टीम मैच 2 बनाम 2|مباراة فرق 2 ضد 2
You and a partner across the board|Tú y un compañero enfrente|Você e um parceiro do outro lado|Vous et un partenaire en face|Du und ein Partner gegenüber|Tu e un compagno di fronte|Kamu dan rekan di seberang papan|Sen ve karşındaki ortağın|आप और सामने बैठा साथी|أنت وشريك في الجهة المقابلة
Pass & play|Pasar y jugar|Passe e jogue|Passer et jouer|Weitergeben & spielen|Passa e gioca|Gantian main|Sırayla oyna|बारी-बारी खेलें|مرّر والعب
Friends on one phone|Amigos en un solo teléfono|Amigos em um só celular|Entre amis sur un seul téléphone|Freunde an einem Handy|Amici su un solo telefono|Teman dalam satu ponsel|Arkadaşlarla tek telefonda|एक फ़ोन पर दोस्तों के साथ|أصدقاء على هاتف واحد
Online room|Sala en línea|Sala online|Salon en ligne|Online-Raum|Stanza online|Ruang online|Çevrimiçi oda|ऑनलाइन रूम|غرفة عبر الإنترنت
Play with friends with a code|Juega con amigos con un código|Jogue com amigos usando um código|Jouez avec des amis grâce à un code|Mit Freunden per Code spielen|Gioca con gli amici con un codice|Main bersama teman dengan kode|Arkadaşlarınla kodla oyna|कोड से दोस्तों के साथ खेलें|العب مع الأصدقاء باستخدام رمز
Swipe to pick how to play|Desliza para elegir cómo jugar|Deslize para escolher como jogar|Balayez pour choisir comment jouer|Wische, um den Spielmodus zu wählen|Scorri per scegliere come giocare|Geser untuk memilih cara bermain|Nasıl oynayacağını seçmek için kaydır|खेलने का तरीका चुनने के लिए स्वाइप करें|اسحب لاختيار طريقة اللعب
How to play|Cómo jugar|Como jogar|Comment jouer|Spielanleitung|Come si gioca|Cara bermain|Nasıl oynanır|कैसे खेलें|طريقة اللعب
Store|Tienda|Loja|Boutique|Shop|Negozio|Toko|Mağaza|स्टोर|المتجر
Profile|Perfil|Perfil|Profil|Profil|Profilo|Profil|Profil|प्रोफ़ाइल|الملف الشخصي
Daily|Diario|Diário|Quotidien|Täglich|Giornaliero|Harian|Günlük|दैनिक|يومي
Lucky|Suerte|Sorte|Chance|Glück|Fortuna|Hoki|Şans|लकी|حظ
Pass|Pase|Passe|Passe|Pass|Pass|Pass|Kart|पास|التذكرة
Events|Eventos|Eventos|Événements|Events|Eventi|Acara|Etkinlikler|इवेंट|الفعاليات
Empty|Vacío|Vazio|Vide|Leer|Vuoto|Kosong|Boş|खाली|فارغ
Start|Iniciar|Iniciar|Démarrer|Start|Avvia|Mulai|Başlat|शुरू|ابدأ
OPEN!|¡ABRIR!|ABRIR!|OUVRIR !|ÖFFNEN!|APRI!|BUKA!|AÇ!|खोलें!|افتح!
Finish a game to earn a chest.|Termina una partida para ganar un cofre.|Termine uma partida para ganhar um baú.|Terminez une partie pour gagner un coffre.|Beende ein Spiel, um eine Truhe zu verdienen.|Finisci una partita per guadagnare uno scrigno.|Selesaikan permainan untuk mendapat peti.|Sandık kazanmak için bir oyun bitir.|संदूक पाने के लिए एक गेम पूरा करें।|أنهِ مباراة لتربح صندوقاً.
VS COMPUTER|CONTRA LA PC|CONTRA O PC|CONTRE L'ORDI|GEGEN PC|CONTRO IL PC|LAWAN KOMPUTER|BİLGİSAYARA KARŞI|कंप्यूटर से|ضد الكمبيوتر
TEAM MATCH|POR EQUIPOS|EM EQUIPE|EN ÉQUIPE|TEAMSPIEL|A SQUADRE|PERTANDINGAN TIM|TAKIM MAÇI|टीम मैच|مباراة فرق
PASS & PLAY|PASAR Y JUGAR|PASSE E JOGUE|PASSER ET JOUER|WEITERGEBEN|PASSA E GIOCA|GANTIAN MAIN|SIRAYLA OYNA|बारी-बारी|مرّر والعب
Players|Jugadores|Jogadores|Joueurs|Spieler|Giocatori|Pemain|Oyuncular|खिलाड़ी|اللاعبون
Game mode|Modo de juego|Modo de jogo|Mode de jeu|Spielmodus|Modalità|Mode permainan|Oyun modu|गेम मोड|نمط اللعب
Your team|Tu equipo|Sua equipe|Votre équipe|Dein Team|La tua squadra|Timmu|Takımın|आपकी टीम|فريقك
(your partner)|(tu compañero)|(seu parceiro)|(votre partenaire)|(dein Partner)|(il tuo compagno)|(rekanmu)|(ortağın)|(आपका साथी)|(شريكك)
Entry fee|Cuota de entrada|Taxa de entrada|Droit d'entrée|Startgebühr|Quota d'ingresso|Biaya masuk|Giriş ücreti|प्रवेश शुल्क|رسوم الدخول
Free|Gratis|Grátis|Gratuit|Gratis|Gratis|Gratis|Ücretsiz|मुफ़्त|مجاناً
Start game|Empezar partida|Começar partida|Lancer la partie|Spiel starten|Inizia la partita|Mulai permainan|Oyunu başlat|गेम शुरू करें|ابدأ اللعبة
Classic|Clásico|Clássico|Classique|Klassisch|Classica|Klasik|Klasik|क्लासिक|كلاسيكي
Blitz|Relámpago|Relâmpago|Éclair|Blitz|Lampo|Kilat|Yıldırım|ब्लिट्ज़|خاطف
Hunter|Cazador|Caçador|Chasseur|Jäger|Cacciatore|Pemburu|Avcı|शिकारी|الصياد
Safe Haven|Refugio|Refúgio|Refuge|Sicherer Hafen|Rifugio|Tempat Aman|Güvenli Liman|सुरक्षित ठिकाना|الملاذ الآمن
Speed Turns|Turnos rápidos|Turnos rápidos|Tours rapides|Schnelle Züge|Turni veloci|Giliran cepat|Hızlı turlar|तेज़ बारी|أدوار سريعة
Surprise Squares|Casillas sorpresa|Casas surpresa|Cases surprise|Überraschungsfelder|Caselle sorpresa|Kotak kejutan|Sürpriz kareler|सरप्राइज़ खाने|مربعات المفاجأة
Daily Twist|Giro del día|Desafio do dia|Défi du jour|Tagesvariante|Variante del giorno|Kejutan harian|Günün sürprizi|आज का ट्विस्ट|تحدي اليوم
The standard race. Four pawns each. Roll a 6 to leave home.|La carrera de siempre. Cuatro fichas cada uno. Saca un 6 para salir de casa.|A corrida padrão. Quatro peões cada. Tire 6 para sair de casa.|La course classique. Quatre pions chacun. Faites 6 pour sortir.|Das normale Rennen. Je vier Figuren. Würfle eine 6, um rauszukommen.|La corsa classica. Quattro pedine a testa. Fai 6 per uscire di casa.|Balapan biasa. Masing-masing empat bidak. Lempar 6 untuk keluar rumah.|Standart yarış. Herkese dört piyon. Evden çıkmak için 6 at.|सामान्य दौड़। हर किसी की चार गोटियाँ। घर से निकलने के लिए 6 लाएँ।|السباق المعتاد. أربع قطع لكل لاعب. ارمِ 6 لتخرج من البيت.
Only 2 pawns each. Short, fast games.|Solo 2 fichas cada uno. Partidas cortas y rápidas.|Só 2 peões cada. Partidas curtas e rápidas.|Seulement 2 pions chacun. Parties courtes et rapides.|Nur 2 Figuren pro Spieler. Kurze, schnelle Spiele.|Solo 2 pedine a testa. Partite brevi e veloci.|Hanya 2 bidak masing-masing. Permainan singkat dan cepat.|Herkese sadece 2 piyon. Kısa, hızlı oyunlar.|हर किसी की सिर्फ़ 2 गोटियाँ। छोटे, तेज़ गेम।|قطعتان فقط لكل لاعب. مباريات قصيرة وسريعة.
Only start squares are safe. Every bump gives you another roll.|Solo las casillas de salida son seguras. Cada captura te da otra tirada.|Só as casas de saída são seguras. Cada captura dá outra jogada.|Seules les cases de départ protègent. Chaque capture donne un autre lancer.|Nur Startfelder sind sicher. Jedes Schlagen gibt einen weiteren Wurf.|Solo le caselle di partenza sono sicure. Ogni cattura ti dà un altro tiro.|Hanya kotak start yang aman. Setiap tabrakan memberi lemparan lagi.|Sadece başlangıç kareleri güvenli. Her vuruş sana bir atış daha verir.|सिर्फ़ शुरुआती खाने सुरक्षित हैं। हर बार काटने पर एक और बारी।|مربعات البداية فقط آمنة. كل إقصاء يمنحك رمية أخرى.
Four extra safe squares on the track. Hide and sprint.|Cuatro casillas seguras extra en el recorrido. Escóndete y corre.|Quatro casas seguras extras na pista. Esconda-se e corra.|Quatre cases sûres en plus. Cachez-vous et foncez.|Vier zusätzliche sichere Felder. Verstecken und sprinten.|Quattro caselle sicure in più. Nasconditi e scatta.|Empat kotak aman tambahan. Bersembunyi dan berlari.|Pistte dört ekstra güvenli kare. Saklan ve koş.|ट्रैक पर चार अतिरिक्त सुरक्षित खाने। छिपो और दौड़ो।|أربعة مربعات آمنة إضافية. اختبئ وانطلق.
Only 6 seconds per turn. Be quick or the game plays for you.|Solo 6 segundos por turno. Sé rápido o el juego jugará por ti.|Só 6 segundos por vez. Seja rápido ou o jogo joga por você.|Seulement 6 secondes par tour. Soyez rapide ou le jeu joue pour vous.|Nur 6 Sekunden pro Zug. Sei schnell, sonst spielt das Spiel für dich.|Solo 6 secondi per turno. Sii veloce o il gioco gioca per te.|Hanya 6 detik per giliran. Cepat, atau permainan bermain untukmu.|Tur başına sadece 6 saniye. Hızlı ol yoksa oyun senin yerine oynar.|हर बारी में सिर्फ़ 6 सेकंड। जल्दी करें वरना गेम आपकी जगह खेलेगा।|6 ثوانٍ فقط لكل دور. أسرع وإلا ستلعب اللعبة عنك.
Gold ? squares are hidden on the track. Land on one to roll again.|Hay casillas doradas ? en el recorrido. Cae en una para volver a tirar.|Há casas douradas ? na pista. Pare em uma para jogar de novo.|Des cases dorées ? sont sur le parcours. Arrêtez-vous dessus pour rejouer.|Goldene ?-Felder liegen auf der Strecke. Lande darauf, um nochmal zu würfeln.|Ci sono caselle dorate ? sul percorso. Fermati su una per ritirare.|Ada kotak emas ? di lintasan. Berhenti di sana untuk melempar lagi.|Pistte altın ? kareler var. Birine gelirsen tekrar atarsın.|ट्रैक पर सुनहरे ? खाने हैं। उस पर रुकें तो फिर से पासा फेंकें।|توجد مربعات ؟ ذهبية على المسار. قف على واحد لترمي مرة أخرى.
Free game, no entry fee.|Partida gratis, sin cuota de entrada.|Partida grátis, sem taxa de entrada.|Partie gratuite, sans droit d'entrée.|Kostenloses Spiel, keine Startgebühr.|Partita gratis, senza quota d'ingresso.|Permainan gratis, tanpa biaya masuk.|Ücretsiz oyun, giriş ücreti yok.|मुफ़्त गेम, कोई प्रवेश शुल्क नहीं।|مباراة مجانية بلا رسوم دخول.
Game coins only, never real money.|Solo monedas del juego, nunca dinero real.|Só moedas do jogo, nunca dinheiro real.|Uniquement des pièces du jeu, jamais d'argent réel.|Nur Spielmünzen, niemals echtes Geld.|Solo monete del gioco, mai soldi veri.|Hanya koin permainan, bukan uang sungguhan.|Sadece oyun parası, asla gerçek para değil.|सिर्फ़ गेम के सिक्के, असली पैसा कभी नहीं।|عملات اللعبة فقط، وليس مالاً حقيقياً أبداً.
Midnight Neon|Neón de medianoche|Neon da meia-noite|Néon de minuit|Mitternachtsneon|Neon di mezzanotte|Neon Tengah Malam|Gece Yarısı Neonu|मिडनाइट नियॉन|نيون منتصف الليل
STARTING GAME|EMPIEZA LA PARTIDA|COMEÇANDO|LA PARTIE COMMENCE|SPIELSTART|SI COMINCIA|PERMAINAN DIMULAI|OYUN BAŞLIYOR|गेम शुरू हो रहा है|بدء اللعبة
Picking one player’s board…|Eligiendo el tablero de un jugador…|Escolhendo o tabuleiro de um jogador…|Choix du plateau d'un joueur…|Das Brett eines Spielers wird gewählt…|Scelgo il tabellone di un giocatore…|Memilih papan salah satu pemain…|Bir oyuncunun tahtası seçiliyor…|एक खिलाड़ी का बोर्ड चुना जा रहा है…|يتم اختيار لوحة أحد اللاعبين…
Tap the dice to roll.|Toca el dado para tirar.|Toque no dado para jogar.|Touchez le dé pour lancer.|Tippe auf den Würfel.|Tocca il dado per tirare.|Ketuk dadu untuk melempar.|Atmak için zara dokun.|पासा फेंकने के लिए उसे टैप करें।|اضغط على النرد للرمي.
Tap the dice to roll!|¡Toca el dado para tirar!|Toque no dado para jogar!|Touchez le dé pour lancer !|Tippe auf den Würfel!|Tocca il dado per tirare!|Ketuk dadu untuk melempar!|Atmak için zara dokun!|पासा फेंकने के लिए टैप करें!|اضغط على النرد للرمي!
Your turn: tap the dice|Tu turno: toca el dado|Sua vez: toque no dado|À vous : touchez le dé|Du bist dran: tippe auf den Würfel|Tocca a te: tocca il dado|Giliranmu: ketuk dadu|Sıra sende: zara dokun|आपकी बारी: पासा टैप करें|دورك: اضغط على النرد
Tap a glowing pawn to move it|Toca una ficha brillante para moverla|Toque em um peão brilhante para movê-lo|Touchez un pion lumineux pour le déplacer|Tippe auf eine leuchtende Figur|Tocca una pedina luminosa per muoverla|Ketuk bidak yang bersinar untuk memindahkannya|Oynatmak için parlayan piyona dokun|चलाने के लिए चमकती गोटी टैप करें|اضغط على قطعة مضيئة لتحريكها
Tap a glowing pawn to move it.|Toca una ficha brillante para moverla.|Toque em um peão brilhante para movê-lo.|Touchez un pion lumineux pour le déplacer.|Tippe auf eine leuchtende Figur, um sie zu ziehen.|Tocca una pedina luminosa per muoverla.|Ketuk bidak yang bersinar untuk memindahkannya.|Oynatmak için parlayan piyona dokun.|चलाने के लिए चमकती गोटी टैप करें।|اضغط على قطعة مضيئة لتحريكها.
You rolled a 6! Tap a pawn to bring it out|¡Sacaste un 6! Toca una ficha para sacarla|Você tirou 6! Toque em um peão para tirá-lo|Vous avez fait 6 ! Touchez un pion pour le sortir|Eine 6! Tippe auf eine Figur, um sie rauszubringen|Hai fatto 6! Tocca una pedina per farla uscire|Kamu dapat 6! Ketuk bidak untuk mengeluarkannya|6 attın! Çıkarmak için bir piyona dokun|आपने 6 लाया! बाहर निकालने के लिए गोटी टैप करें|حصلت على 6! اضغط على قطعة لإخراجها
No move this time.|Esta vez no hay movimiento.|Sem jogada desta vez.|Pas de déplacement cette fois.|Diesmal kein Zug.|Nessuna mossa stavolta.|Tidak ada langkah kali ini.|Bu sefer hamle yok.|इस बार कोई चाल नहीं।|لا حركة هذه المرة.
No pawn can move.|Ninguna ficha puede moverse.|Nenhum peão pode se mover.|Aucun pion ne peut bouger.|Keine Figur kann ziehen.|Nessuna pedina può muoversi.|Tidak ada bidak yang bisa bergerak.|Hiçbir piyon hareket edemez.|कोई गोटी नहीं चल सकती।|لا توجد قطعة يمكنها التحرك.
Turn skipped.|Turno perdido.|Vez pulada.|Tour passé.|Zug übersprungen.|Turno saltato.|Giliran dilewati.|Tur atlandı.|बारी छूट गई।|تم تخطي الدور.
Roll again!|¡Tira otra vez!|Jogue de novo!|Rejouez !|Nochmal würfeln!|Tira ancora!|Lempar lagi!|Tekrar at!|फिर से फेंकें!|ارمِ مرة أخرى!
A 6 gives another roll.|Un 6 da otra tirada.|Um 6 dá outra jogada.|Un 6 donne un autre lancer.|Eine 6 gibt einen weiteren Wurf.|Un 6 dà un altro tiro.|Angka 6 memberi lemparan lagi.|6 bir atış daha verir.|6 आने पर एक और बारी मिलती है।|الرقم 6 يمنحك رمية أخرى.
A pawn made it home!|¡Una ficha llegó a casa!|Um peão chegou em casa!|Un pion est rentré !|Eine Figur ist im Ziel!|Una pedina è arrivata a casa!|Satu bidak sampai di rumah!|Bir piyon eve vardı!|एक गोटी घर पहुँच गई!|وصلت قطعة إلى البيت!
The race for 2nd place continues.|Sigue la carrera por el 2.º puesto.|A corrida pelo 2º lugar continua.|La course pour la 2e place continue.|Das Rennen um Platz 2 geht weiter.|La corsa per il 2° posto continua.|Perebutan juara 2 berlanjut.|2.lik yarışı devam ediyor.|दूसरे स्थान की दौड़ जारी है।|يستمر السباق على المركز الثاني.
Auto play is rolling for you…|El juego automático tira por ti…|O jogo automático está jogando por você…|Le jeu auto lance pour vous…|Auto-Spiel würfelt für dich…|Il gioco automatico tira per te…|Main otomatis melempar untukmu…|Otomatik oyun senin için atıyor…|ऑटो प्ले आपके लिए खेल रहा है…|اللعب التلقائي يرمي عنك…
Choose a game to begin.|Elige un juego para empezar.|Escolha um jogo para começar.|Choisissez une partie pour commencer.|Wähle ein Spiel.|Scegli una partita per iniziare.|Pilih permainan untuk mulai.|Başlamak için bir oyun seç.|शुरू करने के लिए गेम चुनें।|اختر لعبة للبدء.
Game over|Fin de la partida|Fim de jogo|Partie terminée|Spiel vorbei|Partita finita|Permainan selesai|Oyun bitti|गेम ख़त्म|انتهت اللعبة
YOU WIN|¡GANASTE!|VOCÊ VENCEU|VICTOIRE|GEWONNEN|HAI VINTO|KAMU MENANG|KAZANDIN|आप जीते|لقد فزت
WINNER|GANADOR|VENCEDOR|GAGNANT|SIEGER|VINCITORE|PEMENANG|KAZANAN|विजेता|الفائز
2ND PLACE|2.º PUESTO|2º LUGAR|2E PLACE|PLATZ 2|2° POSTO|JUARA 2|2.LİK|दूसरा स्थान|المركز الثاني
TEAM WINS|GANA EL EQUIPO|EQUIPE VENCE|L'ÉQUIPE GAGNE|TEAM GEWINNT|VINCE LA SQUADRA|TIM MENANG|TAKIM KAZANDI|टीम जीती|الفريق فاز
Congratulations!|¡Felicidades!|Parabéns!|Félicitations !|Glückwunsch!|Congratulazioni!|Selamat!|Tebrikler!|बधाई हो!|تهانينا!
Well played!|¡Bien jugado!|Bem jogado!|Bien joué !|Gut gespielt!|Ben giocato!|Main bagus!|İyi oynadın!|बहुत बढ़िया खेले!|أحسنت اللعب!
The prize pool went to the winner.|El premio fue para el ganador.|O prêmio foi para o vencedor.|La cagnotte revient au gagnant.|Der Preistopf ging an den Sieger.|Il montepremi è andato al vincitore.|Hadiah diberikan kepada pemenang.|Ödül havuzu kazanana gitti.|इनाम विजेता को मिला।|ذهبت الجائزة إلى الفائز.
Play again|Jugar otra vez|Jogar de novo|Rejouer|Nochmal spielen|Gioca ancora|Main lagi|Tekrar oyna|फिर से खेलें|العب مجدداً
Change game|Cambiar juego|Mudar de jogo|Changer de partie|Spiel wechseln|Cambia partita|Ganti permainan|Oyunu değiştir|गेम बदलें|غيّر اللعبة
You earned|Ganaste|Você ganhou|Vous avez gagné|Du hast verdient|Hai guadagnato|Kamu mendapat|Kazandığın|आपने कमाए|لقد ربحت
SETTINGS|AJUSTES|CONFIGURAÇÕES|RÉGLAGES|EINSTELLUNGEN|IMPOSTAZIONI|PENGATURAN|AYARLAR|सेटिंग्स|الإعدادات
In the game|En la partida|No jogo|En jeu|Im Spiel|In partita|Dalam permainan|Oyunda|गेम में|داخل اللعبة
Auto play|Juego automático|Jogo automático|Jeu auto|Auto-Spiel|Gioco automatico|Main otomatis|Otomatik oyun|ऑटो प्ले|اللعب التلقائي
Let the computer play for me|Deja que la computadora juegue por mí|Deixe o computador jogar por mim|Laisser l'ordinateur jouer pour moi|Den Computer für mich spielen lassen|Lascia giocare il computer per me|Biarkan komputer bermain untukku|Bilgisayar benim yerime oynasın|कंप्यूटर को मेरी जगह खेलने दें|دع الكمبيوتر يلعب عني
Reactions|Reacciones|Reações|Réactions|Reaktionen|Reazioni|Reaksi|Tepkiler|प्रतिक्रियाएँ|التفاعلات
Quick chat|Chat rápido|Chat rápido|Chat rapide|Schnell-Chat|Chat rapida|Obrolan cepat|Hızlı sohbet|क्विक चैट|دردشة سريعة
Sounds|Sonidos|Sons|Sons|Töne|Suoni|Suara|Sesler|आवाज़ें|الأصوات
Music|Música|Música|Musique|Musik|Musica|Musik|Müzik|संगीत|الموسيقى
Soft and quiet|Suave y tranquila|Suave e tranquila|Douce et calme|Sanft und leise|Dolce e tranquilla|Lembut dan tenang|Yumuşak ve sakin|धीमा और मधुर|هادئة ولطيفة
Vibration|Vibración|Vibração|Vibration|Vibration|Vibrazione|Getar|Titreşim|कंपन|الاهتزاز
Bonus roll|Tirada extra|Jogada bônus|Lancer bonus|Bonuswurf|Tiro bonus|Lemparan bonus|Bonus atış|बोनस बारी|رمية إضافية
Roll again after a bump or reaching home|Tira otra vez tras capturar o llegar a casa|Jogue de novo após capturar ou chegar em casa|Rejouez après une capture ou une arrivée|Nochmal würfeln nach Schlagen oder Heimkehr|Tira ancora dopo una cattura o un arrivo|Lempar lagi setelah menabrak atau sampai rumah|Vurduktan veya eve vardıktan sonra tekrar at|काटने या घर पहुँचने पर फिर से फेंकें|ارمِ مجدداً بعد الإقصاء أو الوصول إلى البيت
Number the pawns|Numerar las fichas|Numerar os peões|Numéroter les pions|Figuren nummerieren|Numera le pedine|Beri nomor bidak|Piyonları numaralandır|गोटियों पर नंबर|ترقيم القطع
Helps tell pawns apart|Ayuda a distinguir las fichas|Ajuda a diferenciar os peões|Aide à distinguer les pions|Hilft, Figuren zu unterscheiden|Aiuta a distinguere le pedine|Membantu membedakan bidak|Piyonları ayırt etmeye yardımcı olur|गोटियों को पहचानने में मदद|يساعد على تمييز القطع
Daily reminder|Recordatorio diario|Lembrete diário|Rappel quotidien|Tägliche Erinnerung|Promemoria giornaliero|Pengingat harian|Günlük hatırlatma|रोज़ का रिमाइंडर|تذكير يومي
A gentle nudge to claim your reward|Un aviso amable para reclamar tu premio|Um lembrete para pegar sua recompensa|Un petit rappel pour réclamer votre récompense|Ein sanfter Hinweis auf deine Belohnung|Un piccolo promemoria per il tuo premio|Pengingat ringan untuk klaim hadiahmu|Ödülünü almak için nazik bir hatırlatma|इनाम लेने की हल्की याद|تذكير لطيف لاستلام مكافأتك
Rate Ludora|Califica Ludora|Avalie o Ludora|Notez Ludora|Ludora bewerten|Valuta Ludora|Beri nilai Ludora|Ludora'yı puanla|Ludora को रेट करें|قيّم Ludora
⭐ Rate Ludora|⭐ Califica Ludora|⭐ Avalie o Ludora|⭐ Notez Ludora|⭐ Ludora bewerten|⭐ Valuta Ludora|⭐ Beri nilai Ludora|⭐ Ludora'yı puanla|⭐ Ludora को रेट करें|⭐ قيّم Ludora
Ad privacy options|Opciones de privacidad de anuncios|Opções de privacidade de anúncios|Options de confidentialité des annonces|Datenschutzoptionen für Werbung|Opzioni privacy annunci|Opsi privasi iklan|Reklam gizlilik seçenekleri|विज्ञापन गोपनीयता विकल्प|خيارات خصوصية الإعلانات
Privacy policy|Política de privacidad|Política de privacidade|Politique de confidentialité|Datenschutzerklärung|Informativa sulla privacy|Kebijakan privasi|Gizlilik politikası|गोपनीयता नीति|سياسة الخصوصية
Your photo|Tu foto|Sua foto|Votre photo|Dein Foto|La tua foto|Fotomu|Fotoğrafın|आपकी फ़ोटो|صورتك
Shown on your avatar|Se muestra en tu avatar|Aparece no seu avatar|Affichée sur votre avatar|Wird auf deinem Avatar gezeigt|Mostrata sul tuo avatar|Ditampilkan di avatarmu|Avatarında gösterilir|आपके अवतार पर दिखती है|تظهر على صورتك الرمزية
Stays on this device|Se queda en este dispositivo|Fica neste aparelho|Reste sur cet appareil|Bleibt auf diesem Gerät|Resta su questo dispositivo|Tetap di perangkat ini|Bu cihazda kalır|इसी डिवाइस पर रहती है|تبقى على هذا الجهاز
Choose|Elegir|Escolher|Choisir|Wählen|Scegli|Pilih|Seç|चुनें|اختر
Remove|Quitar|Remover|Retirer|Entfernen|Rimuovi|Hapus|Kaldır|हटाएँ|إزالة
Your flag|Tu bandera|Sua bandeira|Votre drapeau|Deine Flagge|La tua bandiera|Benderamu|Bayrağın|आपका झंडा|علمك
Computer level|Nivel de la computadora|Nível do computador|Niveau de l'ordinateur|Computerstärke|Livello del computer|Level komputer|Bilgisayar seviyesi|कंप्यूटर का स्तर|مستوى الكمبيوتر
Easy|Fácil|Fácil|Facile|Leicht|Facile|Mudah|Kolay|आसान|سهل
Normal|Normal|Normal|Normal|Normal|Normale|Normal|Normal|सामान्य|عادي
Hard|Difícil|Difícil|Difficile|Schwer|Difficile|Sulit|Zor|कठिन|صعب
New game|Nueva partida|Novo jogo|Nouvelle partie|Neues Spiel|Nuova partita|Permainan baru|Yeni oyun|नया गेम|لعبة جديدة
Language|Idioma|Idioma|Langue|Sprache|Lingua|Bahasa|Dil|भाषा|اللغة
LANGUAGE|IDIOMA|IDIOMA|LANGUE|SPRACHE|LINGUA|BAHASA|DİL|भाषा|اللغة
STORE|TIENDA|LOJA|BOUTIQUE|SHOP|NEGOZIO|TOKO|MAĞAZA|स्टोर|المتجر
Shop|Tienda|Loja|Boutique|Shop|Negozio|Toko|Mağaza|दुकान|المتجر
Special|Especial|Especial|Spécial|Spezial|Speciale|Spesial|Özel|ख़ास|خاص
Chest|Cofre|Baú|Coffre|Truhe|Scrigno|Peti|Sandık|संदूक|صندوق
Boards|Tableros|Tabuleiros|Plateaux|Bretter|Tabelloni|Papan|Tahtalar|बोर्ड|اللوحات
Pawns|Fichas|Peões|Pions|Figuren|Pedine|Bidak|Piyonlar|गोटियाँ|القطع
Frames|Marcos|Molduras|Cadres|Rahmen|Cornici|Bingkai|Çerçeveler|फ्रेम|الإطارات
Emoji|Emoji|Emoji|Emoji|Emoji|Emoji|Emoji|Emoji|इमोजी|إيموجي
Equipped|Equipado|Equipado|Équipé|Ausgerüstet|Equipaggiato|Dipakai|Kuşanıldı|लगाया हुआ|مُستخدم
Common|Común|Comum|Commun|Gewöhnlich|Comune|Biasa|Sıradan|सामान्य|عادي
Rare|Raro|Raro|Rare|Selten|Raro|Langka|Nadir|दुर्लभ|نادر
Epic|Épico|Épico|Épique|Episch|Epico|Epik|Epik|एपिक|ملحمي
Legendary|Legendario|Lendário|Légendaire|Legendär|Leggendario|Legendaris|Efsanevi|लेजेंडरी|أسطوري
Bundles|Paquetes|Pacotes|Lots|Pakete|Pacchetti|Paket|Paketler|बंडल|الحزم
Free coins|Monedas gratis|Moedas grátis|Pièces gratuites|Gratis-Münzen|Monete gratis|Koin gratis|Ücretsiz altın|मुफ़्त सिक्के|عملات مجانية
Your chests|Tus cofres|Seus baús|Vos coffres|Deine Truhen|I tuoi scrigni|Petimu|Sandıkların|आपके संदूक|صناديقك
Empty slot|Espacio vacío|Espaço vazio|Emplacement vide|Leerer Platz|Slot vuoto|Slot kosong|Boş yuva|खाली जगह|خانة فارغة
Finish a game to earn a chest|Termina una partida para ganar un cofre|Termine uma partida para ganhar um baú|Terminez une partie pour gagner un coffre|Beende ein Spiel für eine Truhe|Finisci una partita per uno scrigno|Selesaikan permainan untuk mendapat peti|Sandık için bir oyun bitir|संदूक पाने के लिए गेम पूरा करें|أنهِ مباراة لتربح صندوقاً
Open!|¡Abrir!|Abrir!|Ouvrir !|Öffnen!|Apri!|Buka!|Aç!|खोलें!|افتح!
Watch a video|Ver un video|Assistir a um vídeo|Regarder une vidéo|Video ansehen|Guarda un video|Tonton video|Video izle|वीडियो देखें|شاهد فيديو
Watch|Ver|Assistir|Regarder|Ansehen|Guarda|Tonton|İzle|देखें|شاهد
Your video plays here in the Android app.|Tu video se reproduce aquí en la app de Android.|Seu vídeo aparece aqui no app Android.|Votre vidéo s'affiche ici dans l'appli Android.|Dein Video läuft hier in der Android-App.|Il tuo video appare qui nell'app Android.|Videomu diputar di sini di aplikasi Android.|Videon burada Android uygulamasında oynar.|आपका वीडियो Android ऐप में यहाँ चलेगा।|يُعرض الفيديو هنا في تطبيق أندرويد.
PROFILE|PERFIL|PERFIL|PROFIL|PROFIL|PROFILO|PROFIL|PROFİL|प्रोफ़ाइल|الملف الشخصي
Achievements|Logros|Conquistas|Succès|Erfolge|Obiettivi|Pencapaian|Başarılar|उपलब्धियाँ|الإنجازات
Games played|Partidas jugadas|Partidas jogadas|Parties jouées|Gespielte Spiele|Partite giocate|Permainan dimainkan|Oynanan oyun|खेले गए गेम|المباريات الملعوبة
Games won|Partidas ganadas|Partidas vencidas|Parties gagnées|Gewonnene Spiele|Partite vinte|Permainan dimenangkan|Kazanılan oyun|जीते गए गेम|المباريات الفائزة
Win rate|Porcentaje de victorias|Taxa de vitórias|Taux de victoire|Siegquote|Percentuale vittorie|Tingkat menang|Kazanma oranı|जीत दर|نسبة الفوز
Current win streak|Racha actual|Sequência atual|Série en cours|Aktuelle Siegesserie|Serie attuale|Rentetan menang saat ini|Mevcut galibiyet serisi|मौजूदा जीत का सिलसिला|سلسلة الفوز الحالية
Best win streak|Mejor racha|Melhor sequência|Meilleure série|Beste Siegesserie|Serie migliore|Rentetan menang terbaik|En iyi galibiyet serisi|सबसे लंबा जीत का सिलसिला|أفضل سلسلة فوز
Pawns sent home|Fichas capturadas|Peões capturados|Pions renvoyés|Geschlagene Figuren|Pedine mangiate|Bidak dipulangkan|Eve yollanan piyon|घर भेजी गई गोटियाँ|القطع المُقصاة
Pawns brought home|Fichas llevadas a casa|Peões levados para casa|Pions rentrés|Heimgebrachte Figuren|Pedine portate a casa|Bidak sampai rumah|Eve getirilen piyon|घर पहुँचाई गोटियाँ|القطع التي وصلت
6s rolled|6 sacados|6 tirados|6 obtenus|Gewürfelte 6en|6 ottenuti|Angka 6 didapat|Atılan 6'lar|आए हुए 6|عدد مرات الـ6
Team wins|Victorias por equipo|Vitórias em equipe|Victoires en équipe|Teamsiege|Vittorie a squadre|Kemenangan tim|Takım galibiyeti|टीम जीत|انتصارات الفريق
Gifts sent|Regalos enviados|Presentes enviados|Cadeaux envoyés|Gesendete Geschenke|Regali inviati|Hadiah dikirim|Gönderilen hediye|भेजे गए तोहफ़े|الهدايا المُرسلة
Medals|Medallas|Medalhas|Médailles|Medaillen|Medaglie|Medali|Madalyalar|मेडल|الميداليات
Done|Hecho|Feito|Terminé|Erledigt|Fatto|Selesai|Tamam|पूरा|تم
Ludo Love|Amor por el Ludo|Amor pelo Ludo|Fan de Ludo|Ludo-Liebe|Amore per il Ludo|Cinta Ludo|Ludo Aşkı|लूडो प्रेम|حب اللودو
Finish games|Termina partidas|Termine partidas|Terminez des parties|Spiele beenden|Finisci partite|Selesaikan permainan|Oyun bitir|गेम पूरे करें|أنهِ مباريات
Champion|Campeón|Campeão|Champion|Champion|Campione|Juara|Şampiyon|चैंपियन|البطل
Win games|Gana partidas|Vença partidas|Gagnez des parties|Spiele gewinnen|Vinci partite|Menangkan permainan|Oyun kazan|गेम जीतें|اربح مباريات
On Fire|En racha|Em chamas|En feu|Im Feuer|In fiamme|Membara|Alev alev|जोश में|مشتعل
Win games in a row|Gana partidas seguidas|Vença partidas seguidas|Gagnez d'affilée|Spiele in Folge gewinnen|Vinci partite di fila|Menang berturut-turut|Üst üste kazan|लगातार जीतें|اربح مباريات متتالية
The Bumper|El cazador|O derrubador|Le chasseur|Der Rammer|L'acchiappatore|Si Penabrak|Çarpıcı|धक्का मास्टर|المُقصي
Send rival pawns home|Manda fichas rivales a casa|Mande peões rivais para casa|Renvoyez les pions adverses|Gegnerfiguren heimschicken|Rimanda a casa le pedine rivali|Pulangkan bidak lawan|Rakip piyonları eve yolla|विरोधी गोटियाँ घर भेजें|أعد قطع المنافسين إلى البيت
Home Runner|Corredor a casa|Corredor de casa|Coureur|Heimläufer|Corridore|Pelari Pulang|Eve Koşucu|घर का धावक|عدّاء البيت
Bring pawns home|Lleva fichas a casa|Leve peões para casa|Rentrez des pions|Figuren heimbringen|Porta pedine a casa|Bawa bidak pulang|Piyonları eve getir|गोटियाँ घर लाएँ|أوصل القطع إلى البيت
Six Seeker|Buscador de seises|Caçador de seis|Chasseur de six|Sechser-Jäger|Cacciatore di sei|Pemburu Enam|Altı Avcısı|छक्का खोजी|صائد الستات
Roll a 6|Saca un 6|Tire um 6|Faites un 6|Würfle eine 6|Fai un 6|Dapatkan 6|6 at|6 लाएँ|احصل على 6
Team Player|Jugador de equipo|Jogador de equipe|Joueur d'équipe|Teamplayer|Gioco di squadra|Pemain Tim|Takım Oyuncusu|टीम खिलाड़ी|لاعب فريق
Win team matches|Gana partidas por equipos|Vença partidas em equipe|Gagnez en équipe|Teamspiele gewinnen|Vinci partite a squadre|Menangkan pertandingan tim|Takım maçı kazan|टीम मैच जीतें|اربح مباريات الفرق
Social Butterfly|Mariposa social|Borboleta social|Papillon social|Geselliger Typ|Farfalla sociale|Kupu-kupu Sosial|Sosyal Kelebek|सोशल तितली|الفراشة الاجتماعية
Send gifts|Envía regalos|Envie presentes|Envoyez des cadeaux|Geschenke senden|Invia regali|Kirim hadiah|Hediye gönder|तोहफ़े भेजें|أرسل هدايا
Power Player|Jugador poderoso|Jogador poderoso|Joueur puissant|Power-Spieler|Giocatore potente|Pemain Kuat|Güçlü Oyuncu|पावर खिलाड़ी|لاعب قوي
Use Lucky Rolls|Usa tiradas de suerte|Use jogadas da sorte|Utilisez des lancers chance|Glückswürfe nutzen|Usa tiri fortunati|Pakai lemparan hoki|Şans atışı kullan|लकी रोल इस्तेमाल करें|استخدم رميات الحظ
Treasure Hunter|Cazatesoros|Caçador de tesouros|Chasseur de trésors|Schatzjäger|Cacciatore di tesori|Pemburu Harta|Hazine Avcısı|ख़ज़ाना खोजी|صائد الكنوز
Open chests|Abre cofres|Abra baús|Ouvrez des coffres|Truhen öffnen|Apri scrigni|Buka peti|Sandık aç|संदूक खोलें|افتح صناديق
Token Collector|Coleccionista de fichas|Colecionador de fichas|Collectionneur de jetons|Marken-Sammler|Collezionista di gettoni|Kolektor Token|Jeton Toplayıcı|टोकन कलेक्टर|جامع الرموز
Collect event tokens|Junta fichas del evento|Colete fichas do evento|Collectez des jetons d'événement|Event-Marken sammeln|Raccogli gettoni evento|Kumpulkan token acara|Etkinlik jetonu topla|इवेंट टोकन जमा करें|اجمع رموز الفعالية
Season Climber|Escalador de temporada|Escalador da temporada|Grimpeur de saison|Saison-Kletterer|Scalatore di stagione|Pendaki Musim|Sezon Tırmanıcısı|सीज़न पर्वतारोही|متسلق الموسم
Reach season pass tiers|Alcanza niveles del pase|Alcance níveis do passe|Atteignez des paliers du passe|Pass-Stufen erreichen|Raggiungi livelli del pass|Capai tingkat pass musim|Sezon kartı seviyesine ulaş|सीज़न पास के स्तर पाएँ|بلغ مستويات تذكرة الموسم
SEASON PASS|PASE DE TEMPORADA|PASSE DA TEMPORADA|PASSE DE SAISON|SAISONPASS|PASS STAGIONALE|PASS MUSIM|SEZON KARTI|सीज़न पास|تذكرة الموسم
Play games to earn XP.|Juega para ganar XP.|Jogue para ganhar XP.|Jouez pour gagner de l'XP.|Spiele, um XP zu sammeln.|Gioca per guadagnare XP.|Bermain untuk dapat XP.|XP kazanmak için oyna.|XP कमाने के लिए खेलें।|العب لتكسب نقاط الخبرة.
Claim|Reclamar|Pegar|Réclamer|Abholen|Riscatta|Klaim|Al|लें|استلم
Each game gives XP: 40 for playing, 30 more for a win, 3 for each bump and 5 for each token.|Cada partida da XP: 40 por jugar, 30 más por ganar, 3 por cada captura y 5 por cada ficha.|Cada partida dá XP: 40 por jogar, 30 a mais por vencer, 3 por captura e 5 por ficha.|Chaque partie donne de l'XP : 40 pour jouer, 30 de plus pour une victoire, 3 par capture et 5 par jeton.|Jedes Spiel gibt XP: 40 fürs Spielen, 30 mehr für einen Sieg, 3 pro Schlagen und 5 pro Marke.|Ogni partita dà XP: 40 per giocare, 30 in più per una vittoria, 3 per ogni cattura e 5 per ogni gettone.|Setiap permainan memberi XP: 40 untuk bermain, 30 lagi jika menang, 3 per tabrakan dan 5 per token.|Her oyun XP verir: oynamak için 40, galibiyet için 30 daha, her vuruş için 3, her jeton için 5.|हर गेम XP देता है: खेलने के 40, जीत पर 30 और, हर काट पर 3 और हर टोकन पर 5।|كل مباراة تمنح خبرة: 40 للعب، و30 إضافية للفوز، و3 لكل إقصاء، و5 لكل رمز.
A new season starts every month.|Cada mes empieza una temporada nueva.|Uma nova temporada começa todo mês.|Une nouvelle saison commence chaque mois.|Jeden Monat beginnt eine neue Saison.|Ogni mese inizia una nuova stagione.|Musim baru dimulai setiap bulan.|Her ay yeni bir sezon başlar.|हर महीने नया सीज़न शुरू होता है।|يبدأ موسم جديد كل شهر.
All tiers reached!|¡Todos los niveles alcanzados!|Todos os níveis alcançados!|Tous les paliers atteints !|Alle Stufen erreicht!|Tutti i livelli raggiunti!|Semua tingkat tercapai!|Tüm seviyelere ulaşıldı!|सभी स्तर पूरे!|تم بلوغ كل المستويات!
TOKEN HUNT|CAZA DE FICHAS|CAÇA ÀS FICHAS|CHASSE AUX JETONS|MARKENJAGD|CACCIA AI GETTONI|BURU TOKEN|JETON AVI|टोकन हंट|صيد الرموز
Tokens appear in games against the computer.|Las fichas aparecen en partidas contra la computadora.|As fichas aparecem em partidas contra o computador.|Les jetons apparaissent dans les parties contre l'ordinateur.|Marken erscheinen in Spielen gegen den Computer.|I gettoni compaiono nelle partite contro il computer.|Token muncul di permainan melawan komputer.|Jetonlar bilgisayara karşı oyunlarda çıkar.|टोकन कंप्यूटर वाले गेम में आते हैं।|تظهر الرموز في المباريات ضد الكمبيوتر.
The hunt restarts every Monday.|La caza vuelve a empezar cada lunes.|A caça recomeça toda segunda-feira.|La chasse recommence chaque lundi.|Die Jagd startet jeden Montag neu.|La caccia ricomincia ogni lunedì.|Perburuan dimulai ulang setiap Senin.|Av her pazartesi yeniden başlar.|हंट हर सोमवार फिर से शुरू होता है।|يبدأ الصيد من جديد كل اثنين.
DAILY|DIARIO|DIÁRIO|QUOTIDIEN|TÄGLICH|GIORNALIERO|HARIAN|GÜNLÜK|दैनिक|يومي
7-day reward|Premio de 7 días|Prêmio de 7 dias|Récompense 7 jours|7-Tage-Belohnung|Premio di 7 giorni|Hadiah 7 hari|7 günlük ödül|7 दिन का इनाम|مكافأة 7 أيام
Daily goals|Metas diarias|Metas diárias|Objectifs du jour|Tagesziele|Obiettivi del giorno|Target harian|Günlük hedefler|रोज़ के लक्ष्य|الأهداف اليومية
Claim today’s reward.|Reclama el premio de hoy.|Pegue o prêmio de hoje.|Réclamez la récompense du jour.|Hol dir die heutige Belohnung.|Riscatta il premio di oggi.|Klaim hadiah hari ini.|Bugünün ödülünü al.|आज का इनाम लें।|استلم مكافأة اليوم.
Miss a day and the streak starts over.|Si faltas un día, la racha vuelve a empezar.|Se perder um dia, a sequência recomeça.|Manquez un jour et la série repart à zéro.|Verpasst du einen Tag, beginnt die Serie neu.|Se salti un giorno, la serie ricomincia.|Lewatkan sehari dan rentetan dimulai lagi.|Bir gün kaçırırsan seri baştan başlar.|एक दिन छूटा तो सिलसिला फिर से शुरू।|إذا فاتك يوم تبدأ السلسلة من جديد.
Today’s reward is claimed.|El premio de hoy ya está reclamado.|O prêmio de hoje já foi pego.|La récompense du jour est réclamée.|Die heutige Belohnung ist abgeholt.|Il premio di oggi è stato riscattato.|Hadiah hari ini sudah diklaim.|Bugünün ödülü alındı.|आज का इनाम ले लिया गया है।|تم استلام مكافأة اليوم.
Come back tomorrow to keep your streak!|¡Vuelve mañana para mantener tu racha!|Volte amanhã para manter a sequência!|Revenez demain pour garder votre série !|Komm morgen wieder, um die Serie zu halten!|Torna domani per mantenere la serie!|Kembali besok untuk menjaga rentetanmu!|Serini korumak için yarın gel!|सिलसिला बनाए रखने के लिए कल आएँ!|عُد غداً للحفاظ على سلسلتك!
Day|Día|Dia|Jour|Tag|Giorno|Hari|Gün|दिन|يوم
Claimed|Reclamado|Pego|Réclamé|Abgeholt|Riscattato|Diklaim|Alındı|लिया गया|تم الاستلام
▶ Watch a video: claim 2×|▶ Ve un video: reclama 2×|▶ Assista a um vídeo: pegue 2×|▶ Regardez une vidéo : 2× la récompense|▶ Video ansehen: 2× abholen|▶ Guarda un video: riscatta 2×|▶ Tonton video: klaim 2×|▶ Video izle: 2× al|▶ वीडियो देखें: 2× लें|▶ شاهد فيديو: استلم ×2
All 3 goals|Las 3 metas|As 3 metas|Les 3 objectifs|Alle 3 Ziele|Tutti e 3 gli obiettivi|Semua 3 target|3 hedefin hepsi|तीनों लक्ष्य|الأهداف الثلاثة
Finish every goal today for 10 bonus gems|Cumple todas las metas de hoy y gana 10 gemas extra|Cumpra todas as metas de hoje e ganhe 10 gemas|Terminez tous les objectifs du jour pour 10 gemmes bonus|Erfülle heute alle Ziele für 10 Bonus-Edelsteine|Completa tutti gli obiettivi di oggi per 10 gemme bonus|Selesaikan semua target hari ini untuk 10 permata bonus|Bugün tüm hedefleri bitir, 10 bonus mücevher kazan|आज सभी लक्ष्य पूरे करें और 10 बोनस रत्न पाएँ|أكمل كل أهداف اليوم لتربح 10 جواهر إضافية
New goals every day.|Nuevas metas cada día.|Novas metas todo dia.|De nouveaux objectifs chaque jour.|Jeden Tag neue Ziele.|Nuovi obiettivi ogni giorno.|Target baru setiap hari.|Her gün yeni hedefler.|हर दिन नए लक्ष्य।|أهداف جديدة كل يوم.
Goals count in games against the computer and in team matches.|Las metas cuentan en partidas contra la computadora y por equipos.|As metas contam em partidas contra o computador e em equipe.|Les objectifs comptent contre l'ordinateur et en équipe.|Ziele zählen in Spielen gegen den Computer und im Teamspiel.|Gli obiettivi contano contro il computer e nelle partite a squadre.|Target dihitung saat melawan komputer dan pertandingan tim.|Hedefler bilgisayara karşı ve takım maçlarında sayılır.|लक्ष्य कंप्यूटर और टीम मैच में गिने जाते हैं।|تُحسب الأهداف في المباريات ضد الكمبيوتر ومباريات الفرق.
Go|Ir|Ir|Aller|Los|Vai|Ayo|Git|चलें|اذهب
LUCKY ROLL|TIRADA DE SUERTE|JOGADA DA SORTE|LANCER CHANCE|GLÜCKSWURF|TIRO FORTUNATO|LEMPARAN HOKI|ŞANS ATIŞI|लकी रोल|رمية الحظ
Lucky Roll|Tirada de suerte|Jogada da sorte|Lancer chance|Glückswurf|Tiro fortunato|Lemparan hoki|Şans atışı|लकी रोल|رمية الحظ
Pick what kind of number you want.|Elige qué tipo de número quieres.|Escolha o tipo de número que você quer.|Choisissez le type de nombre voulu.|Wähle, welche Art Zahl du willst.|Scegli che tipo di numero vuoi.|Pilih jenis angka yang kamu mau.|İstediğin sayı türünü seç.|चुनें कि आपको किस तरह का नंबर चाहिए।|اختر نوع الرقم الذي تريده.
Your next roll will be one of them.|Tu próxima tirada será uno de ellos.|Sua próxima jogada será um deles.|Votre prochain lancer en fera partie.|Dein nächster Wurf ist eine davon.|Il tuo prossimo tiro sarà uno di questi.|Lemparan berikutnya akan salah satunya.|Bir sonraki atışın bunlardan biri olur.|आपकी अगली बारी इनमें से एक होगी।|ستكون رميتك القادمة واحداً منها.
Even|Par|Par|Pair|Gerade|Pari|Genap|Çift|सम|زوجي
Odd|Impar|Ímpar|Impair|Ungerade|Dispari|Ganjil|Tek|विषम|فردي
High|Alto|Alto|Haut|Hoch|Alto|Tinggi|Yüksek|ऊँचा|مرتفع
Low|Bajo|Baixo|Bas|Niedrig|Basso|Rendah|Düşük|नीचा|منخفض
Roll normally|Tirar normal|Jogar normal|Lancer normalement|Normal würfeln|Tira normalmente|Lempar biasa|Normal at|सामान्य फेंकें|ارمِ بشكل عادي
SEND A GIFT|ENVIAR UN REGALO|ENVIAR PRESENTE|ENVOYER UN CADEAU|GESCHENK SENDEN|INVIA UN REGALO|KIRIM HADIAH|HEDİYE GÖNDER|तोहफ़ा भेजें|أرسل هدية
Everyone|Todos|Todos|Tout le monde|Alle|Tutti|Semua|Herkes|सभी|الجميع
Gifts use coins you earn in the game.|Los regalos usan monedas que ganas en el juego.|Os presentes usam moedas ganhas no jogo.|Les cadeaux utilisent des pièces gagnées en jeu.|Geschenke kosten im Spiel verdiente Münzen.|I regali usano monete guadagnate nel gioco.|Hadiah memakai koin yang kamu dapat di permainan.|Hediyeler oyunda kazandığın altınla alınır.|तोहफ़े गेम में कमाए सिक्कों से मिलते हैं।|تُشترى الهدايا بعملات تربحها في اللعبة.
They stay on the player’s picture until the game ends.|Se quedan en la foto del jugador hasta que acaba la partida.|Ficam na foto do jogador até o fim da partida.|Ils restent sur la photo du joueur jusqu'à la fin.|Sie bleiben bis Spielende am Bild des Spielers.|Restano sulla foto del giocatore fino alla fine.|Hadiah tetap di foto pemain sampai permainan selesai.|Oyun bitene kadar oyuncunun resminde kalır.|गेम ख़त्म होने तक खिलाड़ी की तस्वीर पर रहते हैं।|تبقى على صورة اللاعب حتى نهاية اللعبة.
Not enough coins.|No tienes suficientes monedas.|Moedas insuficientes.|Pas assez de pièces.|Nicht genug Münzen.|Monete insufficienti.|Koin tidak cukup.|Yeterli altın yok.|पर्याप्त सिक्के नहीं।|لا توجد عملات كافية.
Rose|Rosa|Rosa|Rose|Rose|Rosa|Mawar|Gül|गुलाब|وردة
Cupcake|Magdalena|Cupcake|Cupcake|Cupcake|Cupcake|Kue mangkuk|Kek|कपकेक|كب كيك
Balloon|Globo|Balão|Ballon|Ballon|Palloncino|Balon|Balon|गुब्बारा|بالون
Clover|Trébol|Trevo|Trèfle|Kleeblatt|Quadrifoglio|Semanggi|Yonca|तिपतिया|برسيم
Cocoa|Chocolate|Chocolate|Chocolat|Kakao|Cioccolata|Cokelat|Kakao|कोको|كاكاو
Pizza|Pizza|Pizza|Pizza|Pizza|Pizza|Pizza|Pizza|पिज़्ज़ा|بيتزا
Guitar|Guitarra|Violão|Guitare|Gitarre|Chitarra|Gitar|Gitar|गिटार|غيتار
Trophy|Trofeo|Troféu|Trophée|Pokal|Trofeo|Piala|Kupa|ट्रॉफ़ी|كأس
Crown|Corona|Coroa|Couronne|Krone|Corona|Mahkota|Taç|ताज|تاج
Diamond|Diamante|Diamante|Diamant|Diamant|Diamante|Berlian|Elmas|हीरा|ماسة
Rocket|Cohete|Foguete|Fusée|Rakete|Razzo|Roket|Roket|रॉकेट|صاروخ
Unicorn|Unicornio|Unicórnio|Licorne|Einhorn|Unicorno|Unicorn|Tek boynuz|यूनिकॉर्न|حصان وحيد القرن
PLAYER|JUGADOR|JOGADOR|JOUEUR|SPIELER|GIOCATORE|PEMAIN|OYUNCU|खिलाड़ी|لاعب
Pawns home|Fichas en casa|Peões em casa|Pions rentrés|Figuren im Ziel|Pedine a casa|Bidak di rumah|Evdeki piyon|घर पहुँची गोटियाँ|القطع في البيت
Bumps this game|Capturas en esta partida|Capturas nesta partida|Captures dans cette partie|Geschlagen in diesem Spiel|Catture in questa partita|Tabrakan di permainan ini|Bu oyundaki vuruş|इस गेम में काटे|الإقصاءات في هذه المباراة
Team|Equipo|Equipe|Équipe|Team|Squadra|Tim|Takım|टीम|الفريق
🎁 Send a gift|🎁 Enviar un regalo|🎁 Enviar presente|🎁 Envoyer un cadeau|🎁 Geschenk senden|🎁 Invia un regalo|🎁 Kirim hadiah|🎁 Hediye gönder|🎁 तोहफ़ा भेजें|🎁 أرسل هدية
Mute reactions|Silenciar reacciones|Silenciar reações|Masquer les réactions|Reaktionen stummschalten|Silenzia reazioni|Bisukan reaksi|Tepkileri sessize al|प्रतिक्रियाएँ म्यूट करें|كتم التفاعلات
Unmute reactions|Activar reacciones|Ativar reações|Afficher les réactions|Reaktionen einschalten|Riattiva reazioni|Aktifkan reaksi|Tepkileri aç|प्रतिक्रियाएँ चालू करें|إلغاء كتم التفاعلات
Hi!|¡Hola!|Oi!|Salut !|Hallo!|Ciao!|Hai!|Selam!|नमस्ते!|مرحباً!
Good luck!|¡Suerte!|Boa sorte!|Bonne chance !|Viel Glück!|Buona fortuna!|Semoga beruntung!|Bol şans!|शुभकामनाएँ!|حظاً سعيداً!
Nice move!|¡Buena jugada!|Boa jogada!|Joli coup !|Guter Zug!|Bella mossa!|Langkah bagus!|Güzel hamle!|बढ़िया चाल!|حركة رائعة!
Oops!|¡Ups!|Ops!|Oups !|Hoppla!|Ops!|Ups!|Hay aksi!|अरे!|عذراً!
Add me as a friend!|¡Agrégame como amigo!|Me adicione como amigo!|Ajoute-moi en ami !|Füge mich als Freund hinzu!|Aggiungimi come amico!|Tambahkan aku sebagai teman!|Beni arkadaş ekle!|मुझे दोस्त बनाओ!|أضفني كصديق!
Nice roll!|¡Buena tirada!|Boa jogada!|Beau lancer !|Guter Wurf!|Bel tiro!|Lemparan bagus!|Güzel atış!|बढ़िया पासा!|رمية رائعة!
Too close!|¡Por poco!|Foi por pouco!|De justesse !|Knapp!|Per un pelo!|Hampir saja!|Kıl payı!|बाल-बाल बचे!|كان ذلك قريباً!
Rematch?|¿Revancha?|Revanche?|Revanche ?|Revanche?|Rivincita?|Tanding ulang?|Rövanş?|फिर से?|مباراة ثأرية؟
Thanks!|¡Gracias!|Obrigado!|Merci !|Danke!|Grazie!|Terima kasih!|Teşekkürler!|धन्यवाद!|شكراً!
Your move|Tu turno|Sua vez|À toi|Du bist dran|Tocca a te|Giliranmu|Sıra sende|आपकी चाल|دورك
Great game!|¡Gran partida!|Ótima partida!|Belle partie !|Tolles Spiel!|Bella partita!|Permainan hebat!|Harika oyun!|शानदार गेम!|مباراة رائعة!
RULES|REGLAS|REGRAS|RÈGLES|REGELN|REGOLE|ATURAN|KURALLAR|नियम|القواعد
Next|Siguiente|Próximo|Suivant|Weiter|Avanti|Lanjut|İleri|आगे|التالي
Back|Atrás|Voltar|Retour|Zurück|Indietro|Kembali|Geri|पीछे|رجوع
Got it|Entendido|Entendi|Compris|Verstanden|Capito|Mengerti|Anladım|समझ गया|فهمت
Got it, let's play|Entendido, a jugar|Entendi, vamos jogar|Compris, on joue|Verstanden, los geht's|Capito, giochiamo|Mengerti, ayo main|Anladım, oynayalım|समझ गया, खेलते हैं|فهمت، لنلعب
Get all four pawns home|Lleva tus cuatro fichas a casa|Leve os quatro peões para casa|Rentrez vos quatre pions|Bring alle vier Figuren heim|Porta a casa tutte e quattro le pedine|Bawa keempat bidak pulang|Dört piyonu da eve getir|चारों गोटियाँ घर पहुँचाएँ|أوصل قطعك الأربع إلى البيت
Race your four pawns once around the board and into the middle. The first player with all four home wins.|Lleva tus cuatro fichas una vuelta al tablero hasta el centro. Gana el primero en llevar las cuatro a casa.|Leve seus quatro peões uma volta no tabuleiro até o centro. Vence quem levar os quatro primeiro.|Faites faire un tour à vos quatre pions jusqu'au centre. Le premier à tous les rentrer gagne.|Lauf mit deinen vier Figuren einmal ums Brett in die Mitte. Wer zuerst alle vier heimbringt, gewinnt.|Fai fare un giro del tabellone alle tue quattro pedine fino al centro. Vince chi le porta tutte a casa per primo.|Bawa keempat bidakmu memutari papan sampai ke tengah. Yang pertama membawa keempatnya pulang menang.|Dört piyonunu tahtanın etrafında dolaştırıp ortaya getir. Dördünü de ilk getiren kazanır.|अपनी चारों गोटियों को बोर्ड का एक चक्कर लगवाकर बीच में पहुँचाएँ। सबसे पहले चारों घर पहुँचाने वाला जीतता है।|حرّك قطعك الأربع دورة كاملة حول اللوحة إلى المنتصف. أول من يوصل قطعه الأربع يفوز.
Tap the dice|Toca el dado|Toque no dado|Touchez le dé|Tippe auf den Würfel|Tocca il dado|Ketuk dadu|Zara dokun|पासा टैप करें|اضغط على النرد
On your turn, tap the dice next to your picture. Then move one pawn forward by the number you rolled.|En tu turno, toca el dado junto a tu foto. Luego avanza una ficha según el número que sacaste.|Na sua vez, toque no dado ao lado da sua foto. Depois avance um peão pelo número tirado.|À votre tour, touchez le dé près de votre photo. Avancez ensuite un pion du nombre obtenu.|Tippe in deinem Zug auf den Würfel neben deinem Bild. Ziehe dann eine Figur um die gewürfelte Zahl vor.|Al tuo turno, tocca il dado vicino alla tua foto. Poi muovi una pedina del numero uscito.|Saat giliranmu, ketuk dadu di samping fotomu. Lalu majukan satu bidak sesuai angka yang keluar.|Sıran gelince resminin yanındaki zara dokun. Sonra bir piyonu attığın sayı kadar ilerlet.|अपनी बारी पर अपनी तस्वीर के पास वाला पासा टैप करें। फिर जितना नंबर आए, उतना एक गोटी आगे बढ़ाएँ।|في دورك، اضغط على النرد بجانب صورتك. ثم حرّك قطعة واحدة بعدد ما حصلت عليه.
Roll a 6 to start|Saca un 6 para empezar|Tire 6 para começar|Faites 6 pour commencer|Würfle eine 6 zum Start|Fai 6 per iniziare|Dapatkan 6 untuk mulai|Başlamak için 6 at|शुरू करने के लिए 6 लाएँ|احصل على 6 لتبدأ
Your pawns wait at home until you roll a 6. A 6 also gives you another roll. Three 6s in a row skips your turn.|Tus fichas esperan en casa hasta que sacas un 6. Un 6 también te da otra tirada. Tres 6 seguidos te hacen perder el turno.|Seus peões esperam em casa até você tirar 6. Um 6 também dá outra jogada. Três 6 seguidos pulam sua vez.|Vos pions attendent jusqu'à ce que vous fassiez 6. Un 6 donne aussi un autre lancer. Trois 6 d'affilée font passer votre tour.|Deine Figuren warten, bis du eine 6 würfelst. Eine 6 gibt auch einen weiteren Wurf. Drei 6en in Folge lassen deinen Zug ausfallen.|Le tue pedine aspettano finché non fai 6. Un 6 ti dà anche un altro tiro. Tre 6 di fila ti fanno saltare il turno.|Bidakmu menunggu di rumah sampai kamu dapat 6. Angka 6 juga memberi lemparan lagi. Tiga kali 6 berturut-turut melewatkan giliranmu.|Piyonların 6 atana kadar evde bekler. 6 sana bir atış daha verir. Üst üste üç 6 turunu atlatır.|आपकी गोटियाँ 6 आने तक घर में रहती हैं। 6 आने पर एक और बारी मिलती है। लगातार तीन 6 आने पर बारी छूट जाती है।|تنتظر قطعك في البيت حتى تحصل على 6. الرقم 6 يمنحك رمية أخرى أيضاً. ثلاث ستات متتالية تُفقدك دورك.
Bump to send home|Captura para mandar a casa|Capture para mandar para casa|Capturez pour renvoyer|Schlagen schickt heim|Cattura per rimandare a casa|Tabrak untuk memulangkan|Vurarak eve yolla|काटकर घर भेजें|أقصِ لتعيد إلى البيت
Land on a lone rival pawn to send it flying back home. Pawns on a star or on a start square are safe.|Cae sobre una ficha rival sola para mandarla de vuelta a casa. Las fichas sobre una estrella o una casilla de salida están a salvo.|Pare sobre um peão rival sozinho para mandá-lo de volta para casa. Peões em estrelas ou casas de saída estão seguros.|Arrêtez-vous sur un pion adverse seul pour le renvoyer chez lui. Les pions sur une étoile ou une case de départ sont protégés.|Lande auf einer einzelnen Gegnerfigur, um sie heimzuschicken. Figuren auf einem Stern oder Startfeld sind sicher.|Fermati su una pedina rivale sola per rimandarla a casa. Le pedine su una stella o su una casella di partenza sono al sicuro.|Berhenti di bidak lawan yang sendirian untuk memulangkannya. Bidak di bintang atau kotak start aman.|Yalnız bir rakip piyonun üstüne gelirsen onu eve yollarsın. Yıldız veya başlangıç karesindeki piyonlar güvendedir.|किसी अकेली विरोधी गोटी पर रुकें तो वह घर लौट जाती है। तारे या शुरुआती खाने पर गोटियाँ सुरक्षित हैं।|قف على قطعة منافسة وحيدة لتعيدها إلى البيت. القطع على النجمة أو مربع البداية آمنة.
Stacks|Pilas|Pilhas|Piles|Stapel|Pile|Tumpukan|Yığınlar|ढेर|الأكوام
Take the home stretch|Toma la recta final|Pegue a reta final|Prenez la dernière ligne droite|Die Zielgerade|La dirittura d'arrivo|Jalur pulang|Son düzlüğe gir|आख़िरी रास्ता|الطريق الأخير
Your colored path leads to the middle. You need the exact number to land on the center.|Tu camino de color lleva al centro. Necesitas el número exacto para llegar al centro.|Seu caminho colorido leva ao centro. Você precisa do número exato para chegar ao centro.|Votre chemin coloré mène au centre. Il faut le nombre exact pour y arriver.|Dein farbiger Weg führt zur Mitte. Du brauchst die genaue Zahl für die Mitte.|Il tuo percorso colorato porta al centro. Serve il numero esatto per arrivarci.|Jalur berwarnamu menuju ke tengah. Kamu butuh angka yang pas untuk sampai di tengah.|Renkli yolun ortaya gider. Ortaya varmak için tam sayıyı atmalısın.|आपका रंगीन रास्ता बीच तक जाता है। बीच में पहुँचने के लिए सही नंबर चाहिए।|يقودك مسارك الملوّن إلى المنتصف. تحتاج إلى الرقم المضبوط للوصول إليه.
Casual and fair|Casual y justo|Casual e justo|Détendu et équitable|Locker und fair|Casual e giusto|Santai dan adil|Eğlenceli ve adil|आरामदेह और निष्पक्ष|ممتعة وعادلة
Tap a glowing pawn|Toca una ficha brillante|Toque em um peão brilhante|Touchez un pion lumineux|Tippe auf eine leuchtende Figur|Tocca una pedina luminosa|Ketuk bidak yang bersinar|Parlayan piyona dokun|चमकती गोटी टैप करें|اضغط على قطعة مضيئة
WELCOME!|¡BIENVENIDO!|BEM-VINDO!|BIENVENUE !|WILLKOMMEN!|BENVENUTO!|SELAMAT DATANG!|HOŞ GELDİN!|स्वागत है!|أهلاً بك!
Your welcome gift|Tu regalo de bienvenida|Seu presente de boas-vindas|Votre cadeau de bienvenue|Dein Willkommensgeschenk|Il tuo regalo di benvenuto|Hadiah selamat datangmu|Hoş geldin hediyen|आपका स्वागत तोहफ़ा|هدية الترحيب
Collect|Recoger|Pegar|Récupérer|Einsammeln|Raccogli|Ambil|Topla|लें|اجمع
Maybe later|Quizás luego|Talvez depois|Plus tard|Vielleicht später|Forse dopo|Nanti saja|Belki sonra|शायद बाद में|ربما لاحقاً
ENJOYING LUDORA?|¿TE GUSTA LUDORA?|CURTINDO O LUDORA?|VOUS AIMEZ LUDORA ?|GEFÄLLT DIR LUDORA?|TI PIACE LUDORA?|SUKA LUDORA?|LUDORA'YI SEVDİN Mİ?|LUDORA पसंद आया?|هل تستمتع بـ LUDORA؟
A quick rating helps other players find the game.|Una calificación rápida ayuda a otros a encontrar el juego.|Uma avaliação rápida ajuda outros a achar o jogo.|Une note rapide aide d'autres joueurs à trouver le jeu.|Eine schnelle Bewertung hilft anderen, das Spiel zu finden.|Una valutazione veloce aiuta altri a trovare il gioco.|Nilai singkat membantu pemain lain menemukan game ini.|Kısa bir puan, başkalarının oyunu bulmasına yardım eder.|एक छोटी रेटिंग दूसरों को गेम ढूँढने में मदद करती है।|تقييم سريع يساعد الآخرين على إيجاد اللعبة.
NOTICE|AVISO|AVISO|INFO|HINWEIS|AVVISO|PEMBERITAHUAN|BİLGİ|सूचना|تنبيه
OK|OK|OK|OK|OK|OK|OK|Tamam|ठीक है|حسناً
Close|Cerrar|Fechar|Fermer|Schließen|Chiudi|Tutup|Kapat|बंद करें|إغلاق
Menu|Menú|Menu|Menu|Menü|Menu|Menu|Menü|मेन्यू|القائمة
Send a reaction|Enviar una reacción|Enviar uma reação|Envoyer une réaction|Reaktion senden|Invia una reazione|Kirim reaksi|Tepki gönder|प्रतिक्रिया भेजें|أرسل تفاعلاً
Send a gift|Enviar un regalo|Enviar presente|Envoyer un cadeau|Geschenk senden|Invia un regalo|Kirim hadiah|Hediye gönder|तोहफ़ा भेजें|أرسل هدية
Roll the dice|Tirar el dado|Jogar o dado|Lancer le dé|Würfeln|Tira il dado|Lempar dadu|Zarı at|पासा फेंकें|ارمِ النرد
Dark|Oscuro|Escuro|Sombre|Dunkel|Scuro|Gelap|Koyu|डार्क|داكن
Light|Claro|Claro|Clair|Hell|Chiaro|Terang|Açık|लाइट|فاتح
Look|Aspecto|Visual|Apparence|Aussehen|Aspetto|Tampilan|Görünüm|रूप|المظهر
Online rooms are not available in this view. Open the shared page link while signed in to play online.|Las salas en línea aún no están disponibles. Pronto podrás jugar en línea.|As salas online ainda não estão disponíveis. Em breve você poderá jogar online.|Les salons en ligne ne sont pas encore disponibles. Le jeu en ligne arrive bientôt.|Online-Räume sind noch nicht verfügbar. Online-Spiele kommen bald.|Le stanze online non sono ancora disponibili. Il gioco online arriverà presto.|Ruang online belum tersedia. Main online segera hadir.|Çevrimiçi odalar henüz yok. Çevrimiçi oyun yakında geliyor.|ऑनलाइन रूम अभी उपलब्ध नहीं हैं। ऑनलाइन खेल जल्द आ रहा है।|الغرف عبر الإنترنت غير متاحة بعد. اللعب عبر الإنترنت قريباً.
Empty seats are played by the computer.|Los asientos vacíos los juega la computadora.|Os lugares vazios são jogados pelo computador.|Les places vides sont jouées par l'ordinateur.|Leere Plätze spielt der Computer.|I posti vuoti sono giocati dal computer.|Kursi kosong dimainkan komputer.|Boş koltukları bilgisayar oynar.|खाली सीटों पर कंप्यूटर खेलता है।|يلعب الكمبيوتر في المقاعد الفارغة.
VS|VS|VS|VS|VS|VS|VS|VS|बनाम|ضد
A game by|Un juego de|Um jogo de|Un jeu de|Ein Spiel von|Un gioco di|Sebuah game dari|Bir oyun:|एक गेम|لعبة من
A gift is waiting for you|Un regalo te espera|Um presente espera por você|Un cadeau vous attend|Ein Geschenk wartet auf dich|Un regalo ti aspetta|Ada hadiah untukmu|Seni bir hediye bekliyor|आपके लिए एक तोहफ़ा है|هدية بانتظارك
Open the treasure chest|Abre el cofre del tesoro|Abra o baú do tesouro|Ouvrez le coffre au trésor|Öffne die Schatztruhe|Apri lo scrigno del tesoro|Buka peti harta|Hazine sandığını aç|ख़ज़ाने का संदूक खोलें|افتح صندوق الكنز
Tap the chest to open it|Toca el cofre para abrirlo|Toque no baú para abri-lo|Touchez le coffre pour l'ouvrir|Tippe auf die Truhe|Tocca lo scrigno per aprirlo|Ketuk peti untuk membukanya|Açmak için sandığa dokun|खोलने के लिए संदूक टैप करें|اضغط على الصندوق لفتحه
AUTO|AUTO|AUTO|AUTO|AUTO|AUTO|OTO|OTO|ऑटो|تلقائي
Auto|Auto|Auto|Auto|Auto|Auto|Otomatis|Otomatik|ऑटो|تلقائي
BUMP!|¡ZAS!|PUM!|BOUM !|BUMM!|BUM!|TABRAK!|ÇARP!|धड़ाम!|بوم!
Daily rewards|Premios diarios|Prêmios diários|Récompenses du jour|Tägliche Belohnungen|Premi giornalieri|Hadiah harian|Günlük ödüller|रोज़ के इनाम|المكافآت اليومية
Faces|Caras|Rostos|Visages|Gesichter|Facce|Wajah|Yüzler|चेहरे|وجوه
Animals|Animales|Animais|Animaux|Tiere|Animali|Hewan|Hayvanlar|जानवर|حيوانات
Food|Comida|Comida|Nourriture|Essen|Cibo|Makanan|Yiyecek|खाना|طعام
Hands|Manos|Mãos|Mains|Hände|Mani|Tangan|Eller|हाथ|أيدٍ
Hearts|Corazones|Corações|Cœurs|Herzen|Cuori|Hati|Kalpler|दिल|قلوب
Hype|Emoción|Empolgação|Ambiance|Hype|Carica|Semangat|Coşku|जोश|حماس
Nature|Naturaleza|Natureza|Nature|Natur|Natura|Alam|Doğa|प्रकृति|طبيعة
Sports|Deportes|Esportes|Sports|Sport|Sport|Olahraga|Spor|खेल|رياضة
Party|Fiesta|Festa|Fête|Party|Festa|Pesta|Parti|पार्टी|حفلة
Space|Espacio|Espaço|Espace|Weltall|Spazio|Luar angkasa|Uzay|अंतरिक्ष|الفضاء
Sweets|Dulces|Doces|Bonbons|Süßes|Dolci|Permen|Tatlılar|मिठाइयाँ|حلويات
Island|Isla|Ilha|Île|Insel|Isola|Pulau|Ada|द्वीप|جزيرة
Game controls|Controles del juego|Controles do jogo|Commandes du jeu|Spielsteuerung|Comandi di gioco|Kontrol permainan|Oyun kontrolleri|गेम कंट्रोल|أزرار اللعبة
ITEM|ARTÍCULO|ITEM|OBJET|ARTIKEL|OGGETTO|ITEM|EŞYA|आइटम|عنصر
Lucky Rolls|Tiradas de suerte|Jogadas da sorte|Lancers chance|Glückswürfe|Tiri fortunati|Lemparan hoki|Şans atışları|लकी रोल|رميات الحظ
Use a Lucky Roll|Usa una tirada de suerte|Use uma jogada da sorte|Utilisez un lancer chance|Glückswurf nutzen|Usa un tiro fortunato|Pakai lemparan hoki|Şans atışı kullan|एक लकी रोल इस्तेमाल करें|استخدم رمية حظ
PICK THE BOARD|ELIGE EL TABLERO|ESCOLHA O TABULEIRO|CHOISISSEZ LE PLATEAU|BRETT WÄHLEN|SCEGLI IL TABELLONE|PILIH PAPAN|TAHTAYI SEÇ|बोर्ड चुनें|اختر اللوحة
PLAY|JUGAR|JOGAR|JOUER|SPIELEN|GIOCA|MAIN|OYNA|खेलें|العب
Roll history|Historial de tiradas|Histórico de jogadas|Historique des lancers|Wurfverlauf|Cronologia dei tiri|Riwayat lemparan|Atış geçmişi|पासे का इतिहास|سجل الرميات
Rolls|Tiradas|Jogadas|Lancers|Würfe|Tiri|Lemparan|Atışlar|बारियाँ|الرميات
Roll three 6s|Saca tres 6|Tire três 6|Faites trois 6|Drei 6en würfeln|Fai tre 6|Dapatkan tiga 6|Üç 6 at|तीन 6 लाएँ|احصل على ثلاث ستات
Win a game|Gana una partida|Vença uma partida|Gagnez une partie|Ein Spiel gewinnen|Vinci una partita|Menangkan satu permainan|Bir oyun kazan|एक गेम जीतें|اربح مباراة
Sound effects|Efectos de sonido|Efeitos sonoros|Effets sonores|Soundeffekte|Effetti sonori|Efek suara|Ses efektleri|साउंड इफ़ेक्ट|المؤثرات الصوتية
WOODEN CHEST|COFRE DE MADERA|BAÚ DE MADEIRA|COFFRE EN BOIS|HOLZTRUHE|SCRIGNO DI LEGNO|PETI KAYU|TAHTA SANDIK|लकड़ी का संदूक|صندوق خشبي
SILVER CHEST|COFRE DE PLATA|BAÚ DE PRATA|COFFRE EN ARGENT|SILBERTRUHE|SCRIGNO D'ARGENTO|PETI PERAK|GÜMÜŞ SANDIK|चाँदी का संदूक|صندوق فضي
GOLDEN CHEST|COFRE DORADO|BAÚ DOURADO|COFFRE DORÉ|GOLDTRUHE|SCRIGNO D'ORO|PETI EMAS|ALTIN SANDIK|सुनहरा संदूक|صندوق ذهبي
Partners sit across from each other|Los compañeros se sientan enfrente|Os parceiros ficam frente a frente|Les partenaires sont face à face|Partner sitzen sich gegenüber|I compagni siedono di fronte|Rekan duduk berseberangan|Ortaklar karşılıklı oturur|साथी आमने-सामने बैठते हैं|يجلس الشريكان متقابلين
Two of your pawns on one square make a stack.|Dos de tus fichas en una casilla forman una pila.|Dois peões seus na mesma casa formam uma pilha.|Deux de vos pions sur une case forment une pile.|Zwei deiner Figuren auf einem Feld bilden einen Stapel.|Due tue pedine sulla stessa casella formano una pila.|Dua bidakmu di satu kotak membentuk tumpukan.|Aynı karedeki iki piyonun bir yığın oluşturur.|एक खाने पर आपकी दो गोटियाँ ढेर बनाती हैं।|قطعتان لك على مربع واحد تشكلان كومة.
A rival who lands there simply joins the square.|Un rival que cae ahí solo se une a la casilla.|Um rival que para ali apenas divide a casa.|Un adversaire qui s'y arrête rejoint simplement la case.|Ein Gegner, der dort landet, teilt sich einfach das Feld.|Un rivale che ci arriva si unisce alla casella.|Lawan yang berhenti di sana hanya ikut menempati kotak.|Oraya gelen rakip sadece kareye katılır.|वहाँ रुकने वाला विरोधी बस उसी खाने में आ जाता है।|المنافس الذي يقف هناك ينضم إلى المربع فقط.
To send a stack home, rivals need as many pawns on that square as the stack has.|Para mandar una pila a casa, el rival necesita tantas fichas en esa casilla como tenga la pila.|Para mandar uma pilha para casa, o rival precisa de tantos peões na casa quanto a pilha tem.|Pour renvoyer une pile, l'adversaire doit avoir autant de pions sur la case que la pile.|Um einen Stapel heimzuschicken, braucht der Gegner gleich viele Figuren auf dem Feld.|Per rimandare a casa una pila, al rivale servono tante pedine quante ne ha la pila.|Untuk memulangkan tumpukan, lawan butuh bidak sebanyak tumpukan itu di kotak tersebut.|Bir yığını eve yollamak için rakibin o karede yığın kadar piyonu olmalı.|ढेर को घर भेजने के लिए विरोधी को उस खाने पर उतनी ही गोटियाँ चाहिए।|لإعادة كومة إلى البيت يحتاج المنافس إلى عدد مماثل من القطع على المربع.
When you can move, your pawns glow and bounce.|Cuando puedes mover, tus fichas brillan y saltan.|Quando você pode mover, seus peões brilham e pulam.|Quand vous pouvez bouger, vos pions brillent et sautillent.|Wenn du ziehen kannst, leuchten und hüpfen deine Figuren.|Quando puoi muovere, le tue pedine brillano e saltano.|Saat bisa bergerak, bidakmu bersinar dan memantul.|Hamle yapabildiğinde piyonların parlar ve zıplar.|जब आप चल सकते हैं, आपकी गोटियाँ चमकती और उछलती हैं।|عندما يمكنك التحرك، تتوهج قطعك وتقفز.
Tap the one you want.|Toca la que quieras.|Toque no que quiser.|Touchez celui que vous voulez.|Tippe auf die gewünschte.|Tocca quella che vuoi.|Ketuk yang kamu mau.|İstediğine dokun.|जो चाहिए उसे टैप करें।|اضغط على التي تريدها.
If only one move is possible, it moves for you.|Si solo hay un movimiento posible, se mueve sola.|Se só houver uma jogada, ele se move sozinho.|S'il n'y a qu'un coup possible, il se joue tout seul.|Ist nur ein Zug möglich, zieht sie von selbst.|Se è possibile una sola mossa, si muove da sola.|Jika hanya satu langkah, bidak bergerak sendiri.|Tek hamle varsa kendiliğinden oynar.|अगर एक ही चाल हो, तो गोटी अपने आप चलती है।|إذا كانت هناك حركة واحدة فقط فستتحرك تلقائياً.
Tap AUTO to let the computer play for you.|Toca AUTO para que la computadora juegue por ti.|Toque em AUTO para o computador jogar por você.|Touchez AUTO pour laisser l'ordinateur jouer.|Tippe auf AUTO, damit der Computer für dich spielt.|Tocca AUTO per far giocare il computer per te.|Ketuk OTO agar komputer bermain untukmu.|Bilgisayarın senin yerine oynaması için OTO'ya dokun.|कंप्यूटर से खिलवाने के लिए ऑटो टैप करें।|اضغط تلقائي ليلعب الكمبيوتر عنك.
Partners sit across the board: Blue with Green (Team A) against Red with Yellow (Team B).|Los compañeros se sientan enfrente: Azul con Verde (Equipo A) contra Rojo con Amarillo (Equipo B).|Os parceiros ficam frente a frente: Azul com Verde (Equipe A) contra Vermelho com Amarelo (Equipe B).|Les partenaires sont face à face : Bleu avec Vert (équipe A) contre Rouge avec Jaune (équipe B).|Partner sitzen sich gegenüber: Blau mit Grün (Team A) gegen Rot mit Gelb (Team B).|I compagni siedono di fronte: Blu con Verde (Squadra A) contro Rosso con Giallo (Squadra B).|Rekan duduk berseberangan: Biru dengan Hijau (Tim A) melawan Merah dengan Kuning (Tim B).|Ortaklar karşılıklı oturur: Mavi ile Yeşil (A Takımı), Kırmızı ile Sarı'ya (B Takımı) karşı.|साथी आमने-सामने बैठते हैं: नीला और हरा (टीम A) बनाम लाल और पीला (टीम B)।|يجلس الشريكان متقابلين: الأزرق مع الأخضر (الفريق A) ضد الأحمر مع الأصفر (الفريق B).
Partners never bump each other and can share a square.|Los compañeros nunca se capturan y pueden compartir casilla.|Parceiros nunca se capturam e podem dividir uma casa.|Les partenaires ne se capturent jamais et peuvent partager une case.|Partner schlagen sich nie und dürfen ein Feld teilen.|I compagni non si mangiano mai e possono condividere una casella.|Rekan tidak saling menabrak dan boleh berbagi kotak.|Ortaklar birbirini vurmaz ve aynı karede durabilir.|साथी एक-दूसरे को नहीं काटते और एक खाना साझा कर सकते हैं।|لا يُقصي الشريكان بعضهما ويمكنهما مشاركة المربع.
When all your pawns are home you move your partner’s pawns.|Cuando todas tus fichas están en casa, mueves las de tu compañero.|Quando todos os seus peões chegam, você move os do parceiro.|Quand tous vos pions sont rentrés, vous jouez ceux de votre partenaire.|Sind alle deine Figuren im Ziel, ziehst du die deines Partners.|Quando tutte le tue pedine sono a casa, muovi quelle del compagno.|Saat semua bidakmu di rumah, kamu menggerakkan bidak rekanmu.|Tüm piyonların eve varınca ortağının piyonlarını oynatırsın.|जब आपकी सारी गोटियाँ घर पहुँच जाएँ, आप साथी की गोटियाँ चलाते हैं।|عندما تصل كل قطعك تحرّك قطع شريكك.
A team wins when all its pawns are home.|Un equipo gana cuando todas sus fichas están en casa.|Uma equipe vence quando todos os seus peões chegam.|Une équipe gagne quand tous ses pions sont rentrés.|Ein Team gewinnt, wenn alle seine Figuren im Ziel sind.|Una squadra vince quando tutte le sue pedine sono a casa.|Tim menang saat semua bidaknya sampai rumah.|Tüm piyonları eve varan takım kazanır.|जिस टीम की सारी गोटियाँ घर पहुँचें, वह जीतती है।|يفوز الفريق عندما تصل كل قطعه إلى البيت.
Ludora is a casual game.|Ludora es un juego casual.|Ludora é um jogo casual.|Ludora est un jeu détente.|Ludora ist ein Gelegenheitsspiel.|Ludora è un gioco casual.|Ludora adalah game santai.|Ludora eğlencelik bir oyundur.|Ludora एक आरामदेह गेम है।|Ludora لعبة ترفيهية.
Coin entry fees and prize pools use only coins earned in the game.|Las cuotas y los premios usan solo monedas ganadas en el juego.|Taxas e prêmios usam só moedas ganhas no jogo.|Droits d'entrée et cagnottes utilisent uniquement des pièces gagnées en jeu.|Startgebühren und Preistöpfe nutzen nur im Spiel verdiente Münzen.|Quote e montepremi usano solo monete guadagnate nel gioco.|Biaya masuk dan hadiah hanya memakai koin dari permainan.|Giriş ücretleri ve ödüller yalnızca oyunda kazanılan altınla olur.|प्रवेश शुल्क और इनाम सिर्फ़ गेम में कमाए सिक्कों से होते हैं।|رسوم الدخول والجوائز بعملات تُربح داخل اللعبة فقط.
There is no real money, no betting with money and no real-money prizes.|No hay dinero real, ni apuestas con dinero ni premios en dinero real.|Não há dinheiro real, apostas com dinheiro nem prêmios em dinheiro.|Pas d'argent réel, pas de paris d'argent, pas de gains en argent réel.|Kein echtes Geld, keine Geldwetten und keine Geldpreise.|Niente soldi veri, niente scommesse in denaro e niente premi in denaro.|Tidak ada uang sungguhan, taruhan uang, atau hadiah uang.|Gerçek para, parayla bahis veya para ödülü yoktur.|कोई असली पैसा, पैसों की बाज़ी या असली पैसों का इनाम नहीं है।|لا يوجد مال حقيقي ولا رهان بالمال ولا جوائز مالية.
Coins are earned by playing.|Las monedas se ganan jugando.|As moedas são ganhas jogando.|Les pièces se gagnent en jouant.|Münzen verdienst du durchs Spielen.|Le monete si guadagnano giocando.|Koin didapat dengan bermain.|Altınlar oynayarak kazanılır.|सिक्के खेलकर कमाए जाते हैं।|تُربح العملات باللعب.
Gems and coins only buy looks like boards, dice, frames and emoji, never an advantage in a game.|Gemas y monedas solo compran estilos como tableros, dados, marcos y emojis, nunca ventajas.|Gemas e moedas só compram visuais como tabuleiros, dados, molduras e emojis, nunca vantagens.|Gemmes et pièces n'achètent que des looks (plateaux, dés, cadres, emojis), jamais un avantage.|Edelsteine und Münzen kaufen nur Looks wie Bretter, Würfel, Rahmen und Emojis, nie einen Vorteil.|Gemme e monete comprano solo stili come tabelloni, dadi, cornici ed emoji, mai vantaggi.|Permata dan koin hanya membeli tampilan seperti papan, dadu, bingkai, dan emoji, bukan keunggulan.|Mücevher ve altın sadece tahta, zar, çerçeve ve emoji gibi görünümler alır, asla avantaj değil.|रत्न और सिक्के सिर्फ़ बोर्ड, पासे, फ्रेम और इमोजी जैसे लुक खरीदते हैं, कोई फ़ायदा नहीं।|الجواهر والعملات تشتري مظاهر فقط مثل اللوحات والنرد والإطارات والإيموجي، ولا تمنح أي أفضلية.
Everything in Ludora is earned by playing.|Todo en Ludora se gana jugando.|Tudo no Ludora é ganho jogando.|Tout dans Ludora se gagne en jouant.|In Ludora wird alles durchs Spielen verdient.|In Ludora tutto si guadagna giocando.|Semua di Ludora didapat dengan bermain.|Ludora'da her şey oynayarak kazanılır.|Ludora में सब कुछ खेलकर मिलता है।|كل شيء في Ludora يُربح باللعب.
Gems come from chests, goals, the 7-day calendar and achievements, and only buy looks.|Las gemas salen de cofres, metas, el calendario de 7 días y logros, y solo compran estilos.|As gemas vêm de baús, metas, calendário de 7 dias e conquistas, e só compram visuais.|Les gemmes viennent des coffres, objectifs, du calendrier 7 jours et des succès, et n'achètent que des looks.|Edelsteine gibt es aus Truhen, Zielen, dem 7-Tage-Kalender und Erfolgen; sie kaufen nur Looks.|Le gemme arrivano da scrigni, obiettivi, calendario di 7 giorni e obiettivi, e comprano solo stili.|Permata didapat dari peti, target, kalender 7 hari, dan pencapaian, dan hanya membeli tampilan.|Mücevherler sandık, hedef, 7 günlük takvim ve başarılardan gelir ve sadece görünüm alır.|रत्न संदूक, लक्ष्य, 7 दिन के कैलेंडर और उपलब्धियों से मिलते हैं और सिर्फ़ लुक खरीदते हैं।|تأتي الجواهر من الصناديق والأهداف وتقويم الأيام السبعة والإنجازات، وتشتري المظاهر فقط.
Nothing here gives an advantage in a game.|Nada de aquí da ventaja en una partida.|Nada aqui dá vantagem no jogo.|Rien ici ne donne d'avantage en partie.|Nichts hier verschafft einen Vorteil im Spiel.|Niente qui dà vantaggi in partita.|Tidak ada di sini yang memberi keunggulan.|Buradaki hiçbir şey oyunda avantaj sağlamaz.|यहाँ कुछ भी गेम में फ़ायदा नहीं देता।|لا شيء هنا يمنح أفضلية في اللعب.
Win or finish a game to earn a chest.|Gana o termina una partida para ganar un cofre.|Vença ou termine uma partida para ganhar um baú.|Gagnez ou terminez une partie pour un coffre.|Gewinne oder beende ein Spiel für eine Truhe.|Vinci o finisci una partita per uno scrigno.|Menang atau selesaikan permainan untuk dapat peti.|Sandık için bir oyun kazan veya bitir.|संदूक के लिए गेम जीतें या पूरा करें।|اربح أو أنهِ مباراة لتحصل على صندوق.
Only one chest opens at a time.|Solo se abre un cofre a la vez.|Só um baú abre por vez.|Un seul coffre s'ouvre à la fois.|Es öffnet sich immer nur eine Truhe.|Si apre un solo scrigno alla volta.|Hanya satu peti terbuka sekaligus.|Aynı anda tek sandık açılır.|एक बार में एक ही संदूक खुलता है।|يُفتح صندوق واحد في كل مرة.
Watch a video to skip 30 minutes.|Ve un video para saltar 30 minutos.|Assista a um vídeo para pular 30 minutos.|Regardez une vidéo pour gagner 30 minutes.|Sieh ein Video, um 30 Minuten zu überspringen.|Guarda un video per saltare 30 minuti.|Tonton video untuk melewati 30 menit.|30 dakika atlamak için video izle.|30 मिनट बचाने के लिए वीडियो देखें।|شاهد فيديو لتتخطى 30 دقيقة.
Ludora is a casual game: no real money and no real-money prizes.|Ludora es un juego casual: sin dinero real ni premios en dinero.|Ludora é um jogo casual: sem dinheiro real nem prêmios em dinheiro.|Ludora est un jeu détente : ni argent réel, ni gains en argent.|Ludora ist ein Gelegenheitsspiel: kein echtes Geld, keine Geldpreise.|Ludora è un gioco casual: niente soldi veri né premi in denaro.|Ludora adalah game santai: tanpa uang sungguhan dan hadiah uang.|Ludora eğlencelik bir oyundur: gerçek para ve para ödülü yok.|Ludora एक आरामदेह गेम है: न असली पैसा, न असली पैसों का इनाम।|Ludora لعبة ترفيهية: لا مال حقيقي ولا جوائز مالية.
You get 10 free Lucky Rolls every day.|Recibes 10 tiradas de suerte gratis cada día.|Você ganha 10 jogadas da sorte grátis por dia.|Vous recevez 10 lancers chance gratuits par jour.|Du bekommst jeden Tag 10 kostenlose Glückswürfe.|Ricevi 10 tiri fortunati gratis ogni giorno.|Kamu dapat 10 lemparan hoki gratis setiap hari.|Her gün 10 ücretsiz şans atışı alırsın.|आपको हर दिन 10 मुफ़्त लकी रोल मिलते हैं।|تحصل على 10 رميات حظ مجانية كل يوم.
You can use up to 10 per game, and unused ones are saved.|Puedes usar hasta 10 por partida y las que no uses se guardan.|Você pode usar até 10 por partida e as não usadas ficam guardadas.|Vous pouvez en utiliser 10 par partie ; le reste est gardé.|Du kannst bis zu 10 pro Spiel nutzen; übrige werden gespeichert.|Puoi usarne fino a 10 a partita; quelli non usati restano salvati.|Kamu bisa pakai hingga 10 per permainan, sisanya disimpan.|Oyun başına 10'a kadar kullanabilirsin, kalanlar saklanır.|हर गेम में 10 तक इस्तेमाल करें, बचे हुए सहेजे जाते हैं।|يمكنك استخدام حتى 10 في كل مباراة، وتُحفظ غير المستخدمة.
Watch a video on the home screen for +1.|Ve un video en la pantalla de inicio para +1.|Assista a um vídeo na tela inicial para +1.|Regardez une vidéo sur l'accueil pour +1.|Sieh auf dem Startbildschirm ein Video für +1.|Guarda un video nella schermata iniziale per +1.|Tonton video di layar utama untuk +1.|+1 için ana ekranda video izle.|+1 के लिए होम स्क्रीन पर वीडियो देखें।|شاهد فيديو في الشاشة الرئيسية لتحصل على +1.
Not available in online rooms.|No disponible en salas en línea.|Indisponível em salas online.|Indisponible dans les salons en ligne.|In Online-Räumen nicht verfügbar.|Non disponibile nelle stanze online.|Tidak tersedia di ruang online.|Çevrimiçi odalarda yok.|ऑनलाइन रूम में उपलब्ध नहीं।|غير متاح في الغرف عبر الإنترنت.
Blitz: 2 pawns each|Relámpago: 2 fichas cada uno|Relâmpago: 2 peões cada|Éclair : 2 pions chacun|Blitz: je 2 Figuren|Lampo: 2 pedine a testa|Kilat: 2 bidak masing-masing|Yıldırım: herkese 2 piyon|ब्लिट्ज़: हर किसी की 2 गोटियाँ|خاطف: قطعتان لكل لاعب
Hunter: bump and roll again|Cazador: captura y vuelve a tirar|Caçador: capture e jogue de novo|Chasseur : capturez et rejouez|Jäger: schlagen und nochmal würfeln|Cacciatore: cattura e ritira|Pemburu: tabrak dan lempar lagi|Avcı: vur ve tekrar at|शिकारी: काटो और फिर फेंको|الصياد: أقصِ وارمِ مجدداً
Safe Haven: extra safe stars|Refugio: estrellas seguras extra|Refúgio: estrelas seguras extras|Refuge : étoiles sûres en plus|Sicherer Hafen: extra sichere Sterne|Rifugio: stelle sicure in più|Tempat Aman: bintang aman tambahan|Güvenli Liman: ekstra güvenli yıldızlar|सुरक्षित ठिकाना: अतिरिक्त सुरक्षित तारे|الملاذ الآمن: نجوم آمنة إضافية
Speed Turns: 6 seconds|Turnos rápidos: 6 segundos|Turnos rápidos: 6 segundos|Tours rapides : 6 secondes|Schnelle Züge: 6 Sekunden|Turni veloci: 6 secondi|Giliran cepat: 6 detik|Hızlı turlar: 6 saniye|तेज़ बारी: 6 सेकंड|أدوار سريعة: 6 ثوانٍ
Surprise Squares: look for the ?|Casillas sorpresa: busca el ?|Casas surpresa: procure o ?|Cases surprise : cherchez le ?|Überraschungsfelder: such das ?|Caselle sorpresa: cerca il ?|Kotak kejutan: cari tanda ?|Sürpriz kareler: ? işaretini ara|सरप्राइज़ खाने: ? ढूँढें|مربعات المفاجأة: ابحث عن ؟
Only the colored start squares are safe.|Solo las casillas de salida de color son seguras.|Só as casas de saída coloridas são seguras.|Seules les cases de départ colorées protègent.|Nur die farbigen Startfelder sind sicher.|Solo le caselle di partenza colorate sono sicure.|Hanya kotak start berwarna yang aman.|Sadece renkli başlangıç kareleri güvenli.|सिर्फ़ रंगीन शुरुआती खाने सुरक्षित हैं।|مربعات البداية الملونة فقط آمنة.
The star squares do NOT protect you, so any pawn out on the track can be bumped.|Las estrellas NO te protegen, así que cualquier ficha en el recorrido puede ser capturada.|As estrelas NÃO protegem, então qualquer peão na pista pode ser capturado.|Les étoiles ne protègent PAS : tout pion sur le parcours peut être capturé.|Sterne schützen NICHT, jede Figur auf der Strecke kann geschlagen werden.|Le stelle NON proteggono, quindi ogni pedina sul percorso può essere mangiata.|Bintang TIDAK melindungi, jadi bidak mana pun di lintasan bisa ditabrak.|Yıldızlar korumaz, pistteki her piyon vurulabilir.|तारे सुरक्षा नहीं देते, इसलिए ट्रैक पर कोई भी गोटी काटी जा सकती है।|النجوم لا تحميك، لذا يمكن إقصاء أي قطعة على المسار.
Every time you bump a rival, you get another roll.|Cada vez que capturas a un rival, tiras otra vez.|Toda vez que capturar um rival, você joga de novo.|Chaque capture vous donne un autre lancer.|Jedes Mal, wenn du schlägst, würfelst du nochmal.|Ogni volta che mangi un rivale, tiri ancora.|Setiap menabrak lawan, kamu melempar lagi.|Her rakip vurduğunda bir atış daha kazanırsın.|हर बार विरोधी को काटने पर एक और बारी मिलती है।|كلما أقصيت منافساً حصلت على رمية أخرى.
Hunt carefully, and watch your back.|Caza con cuidado y cúbrete las espaldas.|Cace com cuidado e proteja-se.|Chassez prudemment et surveillez vos arrières.|Jage vorsichtig und pass auf dich auf.|Caccia con attenzione e guardati le spalle.|Berburu dengan hati-hati dan jaga dirimu.|Dikkatli avlan ve arkanı kolla.|सावधानी से शिकार करें और पीछे देखते रहें।|اصطد بحذر واحمِ ظهرك.
Each player has only 2 pawns instead of 4.|Cada jugador tiene solo 2 fichas en lugar de 4.|Cada jogador tem só 2 peões em vez de 4.|Chaque joueur n'a que 2 pions au lieu de 4.|Jeder Spieler hat nur 2 statt 4 Figuren.|Ogni giocatore ha solo 2 pedine invece di 4.|Setiap pemain hanya punya 2 bidak, bukan 4.|Her oyuncunun 4 yerine sadece 2 piyonu var.|हर खिलाड़ी के पास 4 की जगह सिर्फ़ 2 गोटियाँ हैं।|لكل لاعب قطعتان فقط بدلاً من أربع.
Get both pawns home to win.|Lleva las dos fichas a casa para ganar.|Leve os dois peões para casa para vencer.|Rentrez les deux pions pour gagner.|Bring beide Figuren heim, um zu gewinnen.|Porta a casa entrambe le pedine per vincere.|Bawa kedua bidak pulang untuk menang.|Kazanmak için iki piyonu da eve getir.|जीतने के लिए दोनों गोटियाँ घर पहुँचाएँ।|أوصل القطعتين إلى البيت لتفوز.
Games are short and fast.|Las partidas son cortas y rápidas.|As partidas são curtas e rápidas.|Les parties sont courtes et rapides.|Die Spiele sind kurz und schnell.|Le partite sono brevi e veloci.|Permainan singkat dan cepat.|Oyunlar kısa ve hızlıdır.|गेम छोटे और तेज़ होते हैं।|المباريات قصيرة وسريعة.
Use them to hide, then sprint for home.|Úsalas para esconderte y luego corre a casa.|Use-as para se esconder e depois corra para casa.|Cachez-vous dessus, puis foncez vers l'arrivée.|Versteck dich darauf und sprinte dann heim.|Usale per nasconderti, poi corri verso casa.|Gunakan untuk bersembunyi, lalu berlari pulang.|Saklanmak için kullan, sonra eve koş.|इनमें छिपें, फिर घर की ओर दौड़ें।|اختبئ عليها ثم انطلق نحو البيت.
Think fast.|Piensa rápido.|Pense rápido.|Réfléchissez vite.|Denk schnell.|Pensa in fretta.|Berpikir cepat.|Hızlı düşün.|जल्दी सोचें।|فكّر بسرعة.
Land on one and you roll again.|Cae en una y vuelves a tirar.|Pare em uma e jogue de novo.|Arrêtez-vous dessus et rejouez.|Lande darauf und würfle nochmal.|Fermati su una e tiri ancora.|Berhenti di sana dan lempar lagi.|Birine gelirsen tekrar atarsın.|उस पर रुकें और फिर से फेंकें।|قف على واحد وارمِ مجدداً.
The squares are in the same place for everyone, so plan your path through them.|Las casillas están en el mismo lugar para todos, así que planea tu camino.|As casas ficam no mesmo lugar para todos, então planeje seu caminho.|Les cases sont au même endroit pour tous : planifiez votre trajet.|Die Felder liegen für alle gleich, also plane deinen Weg.|Le caselle sono uguali per tutti, quindi pianifica il percorso.|Kotaknya sama untuk semua, jadi rencanakan jalurmu.|Kareler herkes için aynı yerde, yolunu planla.|खाने सबके लिए एक ही जगह हैं, अपना रास्ता सोचें।|المربعات في المكان نفسه للجميع، فخطط لمسارك.`;
var PAT=`^(.+) is getting ready…$|$1 se prepara…|$1 está se preparando…|$1 se prépare…|$1 macht sich bereit…|$1 si prepara…|$1 sedang bersiap…|$1 hazırlanıyor…|$1 तैयार हो रहा है…|$1 يستعد…
^Waiting for (.+) to roll…$|Esperando a que $1 tire…|Esperando $1 jogar…|En attente du lancer de $1…|Warte auf den Wurf von $1…|In attesa del tiro di $1…|Menunggu $1 melempar…|$1 bekleniyor…|$1 के पासा फेंकने का इंतज़ार…|بانتظار رمية $1…
^You rolled a (\\d)\\.$|Sacaste un $1.|Você tirou $1.|Vous avez fait $1.|Du hast eine $1 gewürfelt.|Hai fatto $1.|Kamu dapat $1.|$1 attın.|आपका $1 आया।|حصلت على $1.
^(.+) rolled a (\\d)\\.$|$1 sacó un $2.|$1 tirou $2.|$1 a fait $2.|$1 hat eine $2 gewürfelt.|$1 ha fatto $2.|$1 dapat $2.|$1, $2 attı.|$1 का $2 आया।|حصل $1 على $2.
^You rolled three 6s in a row\\.$|Sacaste tres 6 seguidos.|Você tirou três 6 seguidos.|Vous avez fait trois 6 d'affilée.|Du hast drei 6en in Folge gewürfelt.|Hai fatto tre 6 di fila.|Kamu dapat tiga 6 berturut-turut.|Üst üste üç 6 attın.|आपके लगातार तीन 6 आए।|حصلت على ثلاث ستات متتالية.
^(.+) rolled three 6s in a row\\.$|$1 sacó tres 6 seguidos.|$1 tirou três 6 seguidos.|$1 a fait trois 6 d'affilée.|$1 hat drei 6en in Folge gewürfelt.|$1 ha fatto tre 6 di fila.|$1 dapat tiga 6 berturut-turut.|$1 üst üste üç 6 attı.|$1 के लगातार तीन 6 आए।|حصل $1 على ثلاث ستات متتالية.
^(.+) sent (\\d+) pawns? back home \\((\\d+) vs (\\d+)\\)\\.$|$1 mandó $2 ficha(s) a casa ($3 contra $4).|$1 mandou $2 peão(ões) para casa ($3 contra $4).|$1 a renvoyé $2 pion(s) ($3 contre $4).|$1 hat $2 Figur(en) heimgeschickt ($3 gegen $4).|$1 ha rimandato a casa $2 pedina/e ($3 contro $4).|$1 memulangkan $2 bidak ($3 lawan $4).|$1, $2 piyonu eve yolladı ($3'e $4).|$1 ने $2 गोटी घर भेजी ($3 बनाम $4)।|أعاد $1 عدد $2 من القطع إلى البيت ($3 ضد $4).
^Pass the phone to (.+), then tap the dice\\.$|Pasa el teléfono a $1 y toca el dado.|Passe o celular para $1 e toque no dado.|Passez le téléphone à $1, puis touchez le dé.|Gib das Handy an $1 und tippe auf den Würfel.|Passa il telefono a $1, poi tocca il dado.|Berikan ponsel ke $1, lalu ketuk dadu.|Telefonu $1 oyuncusuna ver, sonra zara dokun.|फ़ोन $1 को दें, फिर पासा टैप करें।|مرّر الهاتف إلى $1 ثم اضغط على النرد.
^(.+) wins!$|¡$1 gana!|$1 venceu!|$1 gagne !|$1 gewinnt!|$1 vince!|$1 menang!|$1 kazandı!|$1 जीता!|$1 فاز!
^2nd place: (.+)\\.$|2.º puesto: $1.|2º lugar: $1.|2e place : $1.|Platz 2: $1.|2° posto: $1.|Juara 2: $1.|2.lik: $1.|दूसरा स्थान: $1।|المركز الثاني: $1.
^You finished in 1st place!$|¡Terminaste en 1.er lugar!|Você terminou em 1º lugar!|Vous finissez 1er !|Du bist Erster!|Sei arrivato 1°!|Kamu juara 1!|1. oldun!|आप पहले स्थान पर रहे!|أنهيت في المركز الأول!
^(.+) finished in 1st place!$|¡$1 terminó en 1.er lugar!|$1 terminou em 1º lugar!|$1 finit 1er !|$1 ist Erster!|$1 è arrivato 1°!|$1 juara 1!|$1 birinci oldu!|$1 पहले स्थान पर रहा!|أنهى $1 في المركز الأول!
^Entry fee: ([\\d,.]+) coins\\.$|Cuota de entrada: $1 monedas.|Taxa de entrada: $1 moedas.|Droit d'entrée : $1 pièces.|Startgebühr: $1 Münzen.|Quota d'ingresso: $1 monete.|Biaya masuk: $1 koin.|Giriş ücreti: $1 altın.|प्रवेश शुल्क: $1 सिक्के।|رسوم الدخول: $1 عملة.
^Prize pool: ([\\d,.]+) coins for 1st place \\(your team\\)\\.$|Premio: $1 monedas para el 1.er lugar (tu equipo).|Prêmio: $1 moedas para o 1º lugar (sua equipe).|Cagnotte : $1 pièces pour la 1re place (votre équipe).|Preistopf: $1 Münzen für Platz 1 (dein Team).|Montepremi: $1 monete al 1° posto (la tua squadra).|Hadiah: $1 koin untuk juara 1 (timmu).|Ödül havuzu: 1.ye $1 altın (takımın).|इनाम: पहले स्थान को $1 सिक्के (आपकी टीम)।|الجائزة: $1 عملة للمركز الأول (فريقك).
^Prize pool: ([\\d,.]+) coins for 1st place\\.$|Premio: $1 monedas para el 1.er lugar.|Prêmio: $1 moedas para o 1º lugar.|Cagnotte : $1 pièces pour la 1re place.|Preistopf: $1 Münzen für Platz 1.|Montepremi: $1 monete al 1° posto.|Hadiah: $1 koin untuk juara 1.|Ödül havuzu: 1.ye $1 altın.|इनाम: पहले स्थान को $1 सिक्के।|الجائزة: $1 عملة للمركز الأول.
^Balance: ([\\d,.]+)\\.$|Saldo: $1.|Saldo: $1.|Solde : $1.|Guthaben: $1.|Saldo: $1.|Saldo: $1.|Bakiye: $1.|बैलेंस: $1।|الرصيد: $1.
^You won the prize pool: ([\\d,.]+) coins!$|¡Ganaste el premio: $1 monedas!|Você ganhou o prêmio: $1 moedas!|Vous gagnez la cagnotte : $1 pièces !|Du gewinnst den Preistopf: $1 Münzen!|Hai vinto il montepremi: $1 monete!|Kamu menang hadiah: $1 koin!|Ödül havuzunu kazandın: $1 altın!|आपने इनाम जीता: $1 सिक्के!|ربحت الجائزة: $1 عملة!
^Your entry fee of ([\\d,.]+) coins is returned\\.$|Se te devuelve la cuota de $1 monedas.|Sua taxa de $1 moedas foi devolvida.|Votre droit d'entrée de $1 pièces est rendu.|Deine Startgebühr von $1 Münzen wird erstattet.|Ti viene restituita la quota di $1 monete.|Biaya masuk $1 koin dikembalikan.|$1 altınlık giriş ücretin iade edildi.|आपका $1 सिक्कों का शुल्क लौटा दिया गया।|تمت إعادة رسوم الدخول البالغة $1 عملة.
^All (\\d) of your pawns made it home\\.$|Tus $1 fichas llegaron a casa.|Seus $1 peões chegaram em casa.|Vos $1 pions sont rentrés.|Alle $1 deiner Figuren sind im Ziel.|Tutte le tue $1 pedine sono a casa.|Semua $1 bidakmu sampai rumah.|$1 piyonunun hepsi eve vardı.|आपकी सभी $1 गोटियाँ घर पहुँच गईं।|وصلت قطعك الـ$1 كلها إلى البيت.
^All (\\d) pawns made it home first\\.$|Sus $1 fichas llegaron primero a casa.|Os $1 peões chegaram primeiro em casa.|Ses $1 pions sont rentrés en premier.|Alle $1 Figuren waren zuerst im Ziel.|Le sue $1 pedine sono arrivate per prime.|Semua $1 bidak sampai rumah lebih dulu.|$1 piyonun hepsi eve ilk vardı.|सभी $1 गोटियाँ पहले घर पहुँचीं।|وصلت القطع الـ$1 أولاً إلى البيت.
^All (\\d+) pawns of the team made it home\\.$|Las $1 fichas del equipo llegaron a casa.|Os $1 peões da equipe chegaram em casa.|Les $1 pions de l'équipe sont rentrés.|Alle $1 Figuren des Teams sind im Ziel.|Tutte le $1 pedine della squadra sono a casa.|Semua $1 bidak tim sampai rumah.|Takımın $1 piyonunun hepsi eve vardı.|टीम की सभी $1 गोटियाँ घर पहुँचीं।|وصلت قطع الفريق الـ$1 كلها إلى البيت.
^Opens in (.+)$|Se abre en $1|Abre em $1|S'ouvre dans $1|Öffnet in $1|Si apre tra $1|Terbuka dalam $1|$1 içinde açılır|$1 में खुलेगा|يُفتح خلال $1
^Level (\\d+) · (.+) XP$|Nivel $1 · $2 XP|Nível $1 · $2 XP|Niveau $1 · $2 XP|Level $1 · $2 XP|Livello $1 · $2 XP|Level $1 · $2 XP|Seviye $1 · $2 XP|लेवल $1 · $2 XP|المستوى $1 · $2 XP
^Current streak: (\\d+) days?$|Racha actual: $1 días|Sequência atual: $1 dias|Série en cours : $1 jours|Aktuelle Serie: $1 Tage|Serie attuale: $1 giorni|Rentetan saat ini: $1 hari|Mevcut seri: $1 gün|मौजूदा सिलसिला: $1 दिन|السلسلة الحالية: $1 يوم
^Claim day (\\d)$|Reclamar día $1|Pegar dia $1|Réclamer le jour $1|Tag $1 abholen|Riscatta giorno $1|Klaim hari $1|$1. günü al|दिन $1 का इनाम लें|استلم اليوم $1
^(\\d+) tokens this week$|$1 fichas esta semana|$1 fichas nesta semana|$1 jetons cette semaine|$1 Marken diese Woche|$1 gettoni questa settimana|$1 token minggu ini|Bu hafta $1 jeton|इस हफ़्ते $1 टोकन|$1 رمزاً هذا الأسبوع
^Free for everyone\\. (\\d+) days left\\.$|Gratis para todos. Quedan $1 días.|Grátis para todos. Faltam $1 dias.|Gratuit pour tous. Encore $1 jours.|Für alle kostenlos. Noch $1 Tage.|Gratis per tutti. Mancano $1 giorni.|Gratis untuk semua. Sisa $1 hari.|Herkese ücretsiz. $1 gün kaldı.|सबके लिए मुफ़्त। $1 दिन बाकी।|مجانية للجميع. بقي $1 يوماً.
^Land exactly on a (.+) square to collect it before the computer players do\\.$|Cae justo en una casilla $1 para recogerla antes que la computadora.|Pare exatamente numa casa $1 para pegá-la antes do computador.|Arrêtez-vous pile sur une case $1 pour la prendre avant l'ordinateur.|Lande genau auf einem $1-Feld, bevor der Computer es tut.|Fermati esattamente su una casella $1 per prenderla prima del computer.|Berhenti tepat di kotak $1 untuk mengambilnya sebelum komputer.|Bilgisayardan önce almak için tam $1 karesine gel.|कंप्यूटर से पहले लेने के लिए ठीक $1 वाले खाने पर रुकें।|قف تماماً على مربع $1 لتأخذه قبل الكمبيوتر.
^(\\d+) days? left\\.$|Quedan $1 días.|Faltam $1 dias.|Encore $1 jours.|Noch $1 Tage.|Mancano $1 giorni.|Sisa $1 hari.|$1 gün kaldı.|$1 दिन बाकी।|بقي $1 يوماً.
^Tier (\\d+) → (\\d+) · (.+) XP$|Nivel $1 → $2 · $3 XP|Nível $1 → $2 · $3 XP|Palier $1 → $2 · $3 XP|Stufe $1 → $2 · $3 XP|Livello $1 → $2 · $3 XP|Tingkat $1 → $2 · $3 XP|Seviye $1 → $2 · $3 XP|स्तर $1 → $2 · $3 XP|المستوى $1 ← $2 · $3 XP
^Next goal: (.+) “(.+)” · (.+)$|Próxima meta: $1 “$2” · $3|Próxima meta: $1 “$2” · $3|Prochain objectif : $1 « $2 » · $3|Nächstes Ziel: $1 „$2“ · $3|Prossimo obiettivo: $1 “$2” · $3|Target berikutnya: $1 “$2” · $3|Sonraki hedef: $1 “$2” · $3|अगला लक्ष्य: $1 “$2” · $3|الهدف التالي: $1 «$2» · $3
^(.+)’s Board$|Tablero de $1|Tabuleiro de $1|Plateau de $1|Brett von $1|Tabellone di $1|Papan $1|$1 tahtası|$1 का बोर्ड|لوحة $1
^Playing on (.+)’s board: (.+)$|Jugando en el tablero de $1: $2|Jogando no tabuleiro de $1: $2|Partie sur le plateau de $1 : $2|Gespielt auf dem Brett von $1: $2|Si gioca sul tabellone di $1: $2|Bermain di papan $1: $2|$1 tahtasında: $2|$1 के बोर्ड पर: $2|اللعب على لوحة $1: $2
^You can use (\\d+) more in this game\\.$|Puedes usar $1 más en esta partida.|Você pode usar mais $1 nesta partida.|Vous pouvez en utiliser $1 de plus.|Du kannst noch $1 in diesem Spiel nutzen.|Puoi usarne altri $1 in questa partita.|Kamu bisa pakai $1 lagi di permainan ini.|Bu oyunda $1 tane daha kullanabilirsin.|इस गेम में आप $1 और इस्तेमाल कर सकते हैं।|يمكنك استخدام $1 أخرى في هذه المباراة.
^(\\d+) saved in total\\.$|$1 guardadas en total.|$1 guardadas no total.|$1 en réserve au total.|$1 insgesamt gespart.|$1 salvati in totale.|$1 tersimpan total.|Toplam $1 kayıtlı.|कुल $1 बचे हैं।|$1 محفوظة إجمالاً.
^🍀 Lucky Roll ×(\\d+)$|🍀 Tirada de suerte ×$1|🍀 Jogada da sorte ×$1|🍀 Lancer chance ×$1|🍀 Glückswurf ×$1|🍀 Tiro fortunato ×$1|🍀 Lemparan hoki ×$1|🍀 Şans atışı ×$1|🍀 लकी रोल ×$1|🍀 رمية الحظ ×$1
^Lucky Rolls: (\\d+)\\.$|Tiradas de suerte: $1.|Jogadas da sorte: $1.|Lancers chance : $1.|Glückswürfe: $1.|Tiri fortunati: $1.|Lemparan hoki: $1.|Şans atışı: $1.|लकी रोल: $1।|رميات الحظ: $1.
^Tap to watch a video for one more\\.$|Toca para ver un video y ganar una más.|Toque para ver um vídeo e ganhar mais uma.|Touchez pour regarder une vidéo et en gagner un.|Tippe für ein Video und erhalte einen mehr.|Tocca per guardare un video e averne uno in più.|Ketuk untuk menonton video dan dapat satu lagi.|Bir tane daha için video izlemeye dokun.|एक और पाने के लिए वीडियो देखें।|اضغط لمشاهدة فيديو والحصول على واحدة أخرى.
^Computer player · (.+) level$|Jugador de la computadora · nivel $1|Jogador do computador · nível $1|Joueur ordinateur · niveau $1|Computerspieler · Stufe $1|Giocatore computer · livello $1|Pemain komputer · level $1|Bilgisayar oyuncusu · $1 seviye|कंप्यूटर खिलाड़ी · $1 स्तर|لاعب الكمبيوتر · مستوى $1
^Move here to bump (.+)!$|¡Mueve aquí para capturar a $1!|Mova aqui para capturar $1!|Déplacez ici pour renvoyer $1 !|Zieh hierher und schlag $1!|Muovi qui per mangiare $1!|Pindah ke sini untuk menabrak $1!|$1 oyuncusunu vurmak için buraya oynat!|$1 को काटने के लिए यहाँ चलें!|تحرّك هنا لتُقصي $1!
^You earned a (.+) chest!$|¡Ganaste un cofre de $1!|Você ganhou um baú $1!|Vous gagnez un coffre $1 !|Du hast eine $1-Truhe verdient!|Hai guadagnato uno scrigno $1!|Kamu dapat peti $1!|$1 sandık kazandın!|आपको $1 संदूक मिला!|ربحت صندوقاً $1!
^(.+) \\(([\\d,.]+) / ([\\d,.]+)\\)$|$1 ($2 / $3)|$1 ($2 / $3)|$1 ($2 / $3)|$1 ($2 / $3)|$1 ($2 / $3)|$1 ($2 / $3)|$1 ($2 / $3)|$1 ($2 / $3)|$1 ($2 / $3)
^▶ Video: \\+([\\d,.]+) coins$|▶ Video: +$1 monedas|▶ Vídeo: +$1 moedas|▶ Vidéo : +$1 pièces|▶ Video: +$1 Münzen|▶ Video: +$1 monete|▶ Video: +$1 koin|▶ Video: +$1 altın|▶ वीडियो: +$1 सिक्के|▶ فيديو: +$1 عملة
^\\+([\\d,.]+) coins$|+$1 monedas|+$1 moedas|+$1 pièces|+$1 Münzen|+$1 monete|+$1 koin|+$1 altın|+$1 सिक्के|+$1 عملة
^(.+) Season$|Temporada $1|Temporada $1|Saison $1|Saison $1|Stagione $1|Musim $1|$1 Sezonu|$1 सीज़न|موسم $1
^(.+) is muted\\.$|$1 está silenciado.|$1 foi silenciado.|$1 est masqué.|$1 ist stummgeschaltet.|$1 è silenziato.|$1 dibisukan.|$1 sessize alındı.|$1 म्यूट है।|تم كتم $1.
^([^A-Za-z\\s]+) (\\S+)(  [AB])?$|$1 $2$3|$1 $2$3|$1 $2$3|$1 $2$3|$1 $2$3|$1 $2$3|$1 $2$3|$1 $2$3|$1 $2$3
^Daily Twist: today is (.+)\\.$|Giro del día: hoy toca $1.|Desafio do dia: hoje é $1.|Défi du jour : aujourd'hui, $1.|Tagesvariante: heute $1.|Variante del giorno: oggi è $1.|Kejutan harian: hari ini $1.|Günün sürprizi: bugün $1.|आज का ट्विस्ट: आज $1 है।|تحدي اليوم: اليوم $1.
^Daily Twist: (.+)$|Giro del día: $1|Desafio do dia: $1|Défi du jour : $1|Tagesvariante: $1|Variante del giorno: $1|Kejutan harian: $1|Günün sürprizi: $1|आज का ट्विस्ट: $1|تحدي اليوم: $1
^\\+([\\d,.]+) coins and \\+([\\d,.]+) gems$|+$1 monedas y +$2 gemas|+$1 moedas e +$2 gemas|+$1 pièces et +$2 gemmes|+$1 Münzen und +$2 Edelsteine|+$1 monete e +$2 gemme|+$1 koin dan +$2 permata|+$1 altın ve +$2 mücevher|+$1 सिक्के और +$2 रत्न|+$1 عملة و+$2 جوهرة
^\\+1 Lucky Roll$|+1 tirada de suerte|+1 jogada da sorte|+1 lancer chance|+1 Glückswurf|+1 tiro fortunato|+1 lemparan hoki|+1 şans atışı|+1 लकी रोल|+1 رمية حظ
^\\+([\\d,.]+) coins · (\\d+) left today$|+$1 monedas · quedan $2 hoy|+$1 moedas · restam $2 hoje|+$1 pièces · encore $2 aujourd'hui|+$1 Münzen · heute noch $2|+$1 monete · ne restano $2 oggi|+$1 koin · sisa $2 hari ini|+$1 altın · bugün $2 kaldı|+$1 सिक्के · आज $2 बाकी|+$1 عملة · تبقى $2 اليوم`;
var D={},P=[];
RAW.split('\n').forEach(function(l){var a=l.split('|');if(a.length===10)D[a[0]]=a.slice(1);});
PAT.split('\n').forEach(function(l){var a=l.split('|');if(a.length===10)P.push([new RegExp(a[0]),a.slice(1)]);});
var lang=set.lang;
if(!lang){var nl=(navigator.language||'en').slice(0,2).toLowerCase();lang=CODES.indexOf(nl)>=0?nl:'en';set.lang=lang;save();}
var LI=CODES.indexOf(lang)-1;
function word(t){if(t==null)return '';var d=D[t];return d&&LI>=0?d[LI]:t;}
function one(t){
  var d=D[t];if(d)return d[LI];
  for(var i=0;i<P.length;i++){var m=t.match(P[i][0]);if(m)return P[i][1][LI].replace(/\$(\d)/g,function(x,n){return word(m[+n]);});}
  return null;
}
function tr(s){
  if(LI<0||!s)return null;var t=s.trim();if(!t||!/[A-Za-z]/.test(t))return null;
  var r=one(t);
  if(r==null){var parts=t.split(/(?<=[.!?…])\s+/);if(parts.length>1){var hit=false;r=parts.map(function(p){var x=one(p);if(x!=null){hit=true;return x;}return p;}).join(' ');if(!hit)r=null;}}
  return r==null?null:s.replace(t,r);
}
var ATTR=['aria-label','placeholder','title'];
function doText(n){
  var v=n.nodeValue;if(v===n.__tr)return;
  n.__en=v;var r=tr(v);if(r!=null&&r!==v){n.__tr=r;n.nodeValue=r;}else n.__tr=null;
}
function doEl(e){
  ATTR.forEach(function(a){var v=e.getAttribute(a);if(v==null)return;e.__ta=e.__ta||{};if(v===e.__ta[a])return;e.__ea=e.__ea||{};e.__ea[a]=v;var r=tr(v);if(r!=null&&r!==v){e.__ta[a]=r;e.setAttribute(a,r);}});
}
function walk(n){
  if(n.nodeType===3){doText(n);return;}
  if(n.nodeType!==1||n.tagName==='SCRIPT'||n.tagName==='STYLE'||n.tagName==='TEXTAREA')return;
  doEl(n);for(var c=n.firstChild;c;c=c.nextSibling)walk(c);
}
function restore(n){
  if(n.nodeType===3){if(n.__en!=null&&n.nodeValue===n.__tr)n.nodeValue=n.__en;n.__tr=null;return;}
  if(n.nodeType!==1)return;
  if(n.__ea)Object.keys(n.__ea).forEach(function(a){if(n.getAttribute(a)===(n.__ta||{})[a])n.setAttribute(a,n.__ea[a]);});n.__ta={};
  for(var c=n.firstChild;c;c=c.nextSibling)restore(c);
}
var mo=new MutationObserver(function(ms){
  if(LI<0)return;
  ms.forEach(function(m){
    if(m.type==='characterData')doText(m.target);
    else if(m.type==='attributes')doEl(m.target);
    else m.addedNodes.forEach(walk);
  });
});
function applyDir(){
  var rtl=lang==='ar';
  document.documentElement.lang=lang;document.documentElement.dir=rtl?'rtl':'ltr';
}
function setLang(l){
  restore(document.body);lang=l;set.lang=l;save();LI=CODES.indexOf(l)-1;applyDir();
  if(LI>=0)walk(document.body);
}
applyDir();
mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR});
if(LI>=0)walk(document.body);
/* keep the play area left-to-right so seats stay next to their own corner of the board */
var st=document.createElement('style');
st.textContent='[dir="rtl"] .seatrow,[dir="rtl"] .stage,[dir="rtl"] .gbar,[dir="rtl"] .pillrow,[dir="rtl"] .hchests,[dir="rtl"] .seats{direction:ltr}[dir="rtl"] .msg,[dir="rtl"] .seat .who{direction:rtl}[dir="rtl"] .gbar .gcoin{direction:ltr}';
document.head.appendChild(st);
/* picker in Settings */
(function(){
  var s=$('#ov-settings .sb');if(!s)return;
  var row=document.createElement('div');row.className='row';row.style.cursor='pointer';
  row.innerHTML='<span>Language<small id="s-lang-now"></small></span><span style="font-size:22px">🌐</span>';
  var first=s.querySelector('h3');s.insertBefore(row,first?first.nextSibling:s.firstChild);
  function sync(){var n=LANGS.filter(function(x){return x[0]===lang;})[0];var e=document.getElementById('s-lang-now');if(e)e.textContent=n?n[1]:'English';}
  sync();
  row.addEventListener('click',function(){
    var o=document.getElementById('ov-lang');
    if(!o){o=el('div','overlay',document.body);o.id='ov-lang';o.hidden=true;o.style.zIndex=75;o.setAttribute('role','dialog');
      o.innerHTML='<div class="sheet"><h2 class="ribbon">LANGUAGE</h2><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="sb"><div class="langlist"></div></div></div>';
      o.querySelector('.close').addEventListener('click',function(){closeSheet('ov-lang');});}
    var g=o.querySelector('.langlist');g.innerHTML='';
    LANGS.forEach(function(L){var b=el('button','',g);b.type='button';b.textContent=L[1];b.setAttribute('aria-pressed',String(L[0]===lang));b.setAttribute('lang',L[0]);b.dir=L[0]==='ar'?'rtl':'ltr';
      b.addEventListener('click',function(){setLang(L[0]);sync();closeSheet('ov-lang');});});
    openSheet('ov-lang');
  });
})();
window.__ludoraLang={set:setLang,tr:tr,D:D,P:P};
})();
