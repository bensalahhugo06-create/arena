/* Contenu des trois jeux. Kana : [caractère, lecture, nombre de traits]. */
"use strict";
const ROWS=[
 {id:"a",set:"hira",name:"あ い う え お",k:[["あ","a",3],["い","i",2],["う","u",2],["え","e",2],["お","o",3]]},
 {id:"ka",set:"hira",name:"か き く け こ",k:[["か","ka",3],["き","ki",4],["く","ku",1],["け","ke",3],["こ","ko",2]]},
 {id:"sa",set:"hira",name:"さ し す せ そ",k:[["さ","sa",3],["し","shi",1],["す","su",2],["せ","se",3],["そ","so",1]]},
 {id:"ta",set:"hira",name:"た ち つ て と",k:[["た","ta",4],["ち","chi",2],["つ","tsu",1],["て","te",1],["と","to",2]]},
 {id:"na",set:"hira",name:"な に ぬ ね の",k:[["な","na",4],["に","ni",3],["ぬ","nu",2],["ね","ne",2],["の","no",1]]},
 {id:"ha",set:"hira",name:"は ひ ふ へ ほ",k:[["は","ha",3],["ひ","hi",1],["ふ","fu",4],["へ","he",1],["ほ","ho",4]]},
 {id:"ma",set:"hira",name:"ま み む め も",k:[["ま","ma",3],["み","mi",2],["む","mu",3],["め","me",2],["も","mo",3]]},
 {id:"ya",set:"hira",name:"や ゆ よ",k:[["や","ya",3],["ゆ","yu",2],["よ","yo",2]]},
 {id:"ra",set:"hira",name:"ら り る れ ろ",k:[["ら","ra",2],["り","ri",2],["る","ru",1],["れ","re",2],["ろ","ro",1]]},
 {id:"wa",set:"hira",name:"わ を ん",k:[["わ","wa",2],["を","wo",3],["ん","n",1]]},
 {id:"KA",set:"kata",name:"ア イ ウ エ オ",k:[["ア","a",2],["イ","i",2],["ウ","u",3],["エ","e",3],["オ","o",3]]},
 {id:"KKA",set:"kata",name:"カ キ ク ケ コ",k:[["カ","ka",2],["キ","ki",3],["ク","ku",2],["ケ","ke",3],["コ","ko",2]]},
 {id:"KSA",set:"kata",name:"サ シ ス セ ソ",k:[["サ","sa",3],["シ","shi",3],["ス","su",2],["セ","se",2],["ソ","so",2]]},
 {id:"KTA",set:"kata",name:"タ チ ツ テ ト",k:[["タ","ta",3],["チ","chi",3],["ツ","tsu",3],["テ","te",3],["ト","to",2]]},
 {id:"KNA",set:"kata",name:"ナ ニ ヌ ネ ノ",k:[["ナ","na",2],["ニ","ni",2],["ヌ","nu",2],["ネ","ne",4],["ノ","no",1]]},
 {id:"KHA",set:"kata",name:"ハ ヒ フ ヘ ホ",k:[["ハ","ha",2],["ヒ","hi",2],["フ","fu",1],["ヘ","he",1],["ホ","ho",4]]},
 {id:"KMA",set:"kata",name:"マ ミ ム メ モ",k:[["マ","ma",2],["ミ","mi",3],["ム","mu",2],["メ","me",2],["モ","mo",3]]},
 {id:"KYA",set:"kata",name:"ヤ ユ ヨ",k:[["ヤ","ya",2],["ユ","yu",2],["ヨ","yo",3]]},
 {id:"KRA",set:"kata",name:"ラ リ ル レ ロ",k:[["ラ","ra",2],["リ","ri",2],["ル","ru",2],["レ","re",1],["ロ","ro",3]]},
 {id:"KWA",set:"kata",name:"ワ ヲ ン",k:[["ワ","wa",2],["ヲ","wo",3],["ン","n",2]]}
];
const READ={},STROKES={};ROWS.forEach(r=>r.k.forEach(([c,R,n])=>{READ[c]=R;STROKES[c]=n}));
/* Mots en kana : [mot, lecture, sens]. Un mot n'est utilisé que si tous ses kana sont appris. */
const WORDS=[["あい","ai","amour"],["いえ","ie","maison"],["うえ","ue","au-dessus"],["あお","ao","bleu"],["いい","ii","bien, bon"],["かお","kao","visage"],["あか","aka","rouge"],["いく","iku","aller"],["えき","eki","gare"],["こい","koi","carpe"],["かき","kaki","kaki (fruit)"],["きく","kiku","écouter"],
 ["すし","sushi","sushi"],["あさ","asa","matin"],["いす","isu","chaise"],["かさ","kasa","parapluie"],["しお","shio","sel"],["そこ","soko","là-bas"],["せかい","sekai","monde"],["たこ","tako","poulpe"],["くつ","kutsu","chaussures"],["て","te","main"],["ちかい","chikai","proche"],["とし","toshi","année, âge"],
 ["なつ","natsu","été"],["ねこ","neko","chat"],["いぬ","inu","chien"],["なに","nani","quoi"],["あに","ani","grand frère"],["ひと","hito","personne"],["はな","hana","fleur, nez"],["ふね","fune","bateau"],["ほし","hoshi","étoile"],["へた","heta","maladroit"],
 ["みみ","mimi","oreille"],["むし","mushi","insecte"],["あめ","ame","pluie"],["もも","momo","pêche"],["やま","yama","montagne"],["ゆき","yuki","neige"],["よる","yoru","nuit"],["さくら","sakura","cerisier"],["くるま","kuruma","voiture"],["しろ","shiro","blanc"],
 ["わたし","watashi","je, moi"],["ほん","hon","livre"],["にほん","nihon","Japon"],["みかん","mikan","mandarine"],["ラーメン","raamen","ramen"],["テレビ","terebi","télé"],["カメラ","kamera","appareil photo"],["タクシー","takushii","taxi"],["コーヒー","koohii","café"],["ホテル","hoteru","hôtel"],["メニュー","menyuu","menu"],["トイレ","toire","toilettes"]];

/* Word Duel : [question, [4 choix], index de la bonne, explication]. Trois niveaux selon les trophées anglais. */
const EN=[
 {min:0,name:"Mots du quotidien",q:[
  ["Comment dit-on « chat » ?",["cat","dog","bird","horse"],0,"Cat = chat. Dog = chien."],["« Eau » se dit…",["water","wine","bread","milk"],0,""],["« Merci » se dit…",["Thank you","Please","Sorry","Hello"],0,"Please = s'il te plaît."],
  ["« Aujourd'hui » se dit…",["today","tonight","tomorrow","yesterday"],0,"Tomorrow = demain, yesterday = hier."],["« Travail » se dit…",["work","walk","word","world"],0,"Walk = marcher."],["« Je suis fatigué »",["I'm tired","I'm tied","I'm tidy","I'm tight"],0,""],
  ["« Combien ça coûte ? »",["How much is it?","How many is it?","How long is it?","How old is it?"],0,"How much pour un prix."],["« Où sont les toilettes ? »",["Where are the toilets?","Who are the toilets?","When are the toilets?","What are the toilets?"],0,"Where = où."],
  ["« Hôpital » se dit…",["hospital","hostel","hotel","host"],0,"Hostel = auberge de jeunesse."],["« La gare » se dit…",["the station","the stage","the stadium","the stair"],0,""],["« Je ne comprends pas »",["I don't understand","I don't stand","I'm not understand","I no understand"],0,"Don't + verbe."],
  ["« Pouvez-vous répéter ? »",["Can you repeat?","Can you report?","Can you return?","Can you replay?"],0,""],["« L'addition, s'il vous plaît »",["The bill, please","The bell, please","The ball, please","The bit, please"],0,"Bill (UK) ou check (US)."],
  ["« Demain » se dit…",["tomorrow","today","tonight","morning"],0,""],["« Lent » se dit…",["slow","low","slim","small"],0,"Slow ≠ fast."],["« Cher » (prix) se dit…",["expensive","cheap","dear","free"],0,"Cheap = pas cher, free = gratuit."],
  ["« Gauche » se dit…",["left","right","straight","back"],0,"Right = droite, straight = tout droit."],["« J'ai faim »",["I'm hungry","I'm angry","I have hungry","I'm hunger"],0,"Angry = en colère."],
  ["« Il pleut »",["It's raining","It's rainy day","It rains now","It's rain"],0,"Le présent continu pour ce qui se passe maintenant."],["« Mon frère »",["my brother","my sister","my father","my mother"],0,""]]},
 {min:60,name:"Phrases et grammaire de base",q:[
  ["She ___ a nurse.",["is","are","am","be"],0,"He/she/it → is."],["They ___ at work.",["are","is","am","be"],0,"We/you/they → are."],["I ___ coffee every morning.",["drink","drinks","drinking","am drink"],0,"I/you/we/they : pas de -s au présent simple."],
  ["He ___ in Lyon.",["lives","live","living","is live"],0,"He/she/it : -s au présent simple."],["___ you speak English?",["Do","Does","Are","Is"],0,"Question au présent simple : Do (Does avec he/she/it)."],["She ___ like fish.",["doesn't","don't","isn't","not"],0,"Négation avec he/she/it : doesn't + verbe."],
  ["I'm ___ the bus right now.",["on","in","at","by"],0,"On the bus, on the train."],["Yesterday I ___ to the gym.",["went","go","goes","going"],0,"Go → went au passé."],["There ___ two hospitals in my town.",["are","is","be","am"],0,"There are + pluriel."],
  ["I have ___ apple.",["an","a","the","some"],0,"An devant un son voyelle."],["What ___ you do last weekend?",["did","do","does","done"],0,"Question au passé : did + verbe à l'infinitif."],["I'm ___ than my brother.",["taller","more tall","tallest","the taller"],0,"Adjectif court : -er than."],
  ["We ___ watching a film.",["are","is","do","have"],0,"Présent continu : be + verbe-ing."],["Can I ___ a coffee, please?",["have","has","having","to have"],0,"Après can : verbe sans to."],["I've ___ been to Japan.",["never","ever","yet","still"],0,"Never = jamais (phrase affirmative)."]]},
 {min:160,name:"Expressions et pièges",q:[
  ["« Actually » veut dire…",["en fait","actuellement","activement","exactement"],0,"Faux ami : actuellement = currently."],["« Eventually » veut dire…",["finalement","éventuellement","évidemment","parfois"],0,"Faux ami."],["« Library » veut dire…",["bibliothèque","librairie","liberté","livret"],0,"Librairie = bookshop."],
  ["« give up »",["abandonner","donner","monter","rendre"],0,""],["« look forward to »",["avoir hâte de","regarder devant","chercher","prévoir"],0,"Suivi d'un verbe en -ing."],["« find out »",["découvrir","trouver dehors","sortir","perdre"],0,""],
  ["« Ça ne me dérange pas »",["I don't mind","I don't care","I'm not bother","It doesn't matter me"],0,""],["« Ça vaut le coup »",["It's worth it","It's cost it","It's value","It's good price"],0,""],["« Je suis débordé »",["I'm swamped","I'm overflowed","I'm passed","I'm full"],0,""],
  ["I ___ here since 2019.",["have been working","work","am working","worked"],0,"Depuis + action qui continue → present perfect."],["I'm looking forward to ___ you.",["seeing","see","saw","seen"],0,"To est une préposition ici."],["There are ___ people than yesterday.",["fewer","less","few","little"],0,"Fewer pour ce qui se compte."],
  ["« call off »",["annuler","appeler","éteindre","rappeler"],0,""],["« I'm agree » est…",["incorrect : I agree","correct","correct à l'oral","incorrect : I'm agreed"],0,"Agree est un verbe."],["« Sympathetic » veut dire…",["compatissant","sympathique","synthétique","simple"],0,"Sympa = nice, friendly."]]}];

/* Cut Master, « Bonne idée ? » : [situation, bonne idée ?, explication] */
const CUTCARDS=[
 ["Short TikTok : commencer par le moment le plus fort.",true,"Le spectateur décide de rester en 1 à 2 secondes."],
 ["Interview : un zoom punch-in sur chaque phrase.",false,"Utilisé partout, il perd son effet. Garde-le pour les phrases clés."],
 ["Couper pendant le mouvement d'une main.",true,"L'œil suit le geste : la coupe devient invisible."],
 ["Mettre une transition flashy pour cacher une mauvaise coupe.",false,"Elle attire l'attention dessus. Utilise un plan de coupe."],
 ["Baisser la musique quand quelqu'un parle.",true,"C'est le ducking : la voix reste toujours compréhensible."],
 ["Étalonner un look avant de corriger la balance des blancs.",false,"On corrige d'abord, on étalonne ensuite."],
 ["Sous-titrer un short vertical en bas de l'écran.",false,"L'interface de l'appli cache le bas : place-les vers le centre."],
 ["Un L-cut pour montrer la réaction de l'interlocuteur.",true,"On entend la fin de la phrase sur la réaction : plus naturel."],
 ["Un fondu enchaîné pour montrer que le temps passe.",true,"C'est exactement son sens."],
 ["5 styles de transitions différents dans la même vidéo.",false,"Une vidéo, un langage de transitions."],
 ["Un whoosh qui démarre juste avant le mouvement.",true,"Le son prépare l'œil."],
 ["Un effet sonore sur chaque mouvement de caméra.",false,"Ça devient fatigant et cheap."],
 ["Réduire le bruit au maximum sur une voix.",false,"La voix devient robotique. Mieux vaut un léger souffle."],
 ["Vérifier l'exposition avec la forme d'onde.",true,"Les scopes ne dépendent pas de ton écran."],
 ["Monter une interview en changeant le sens d'une phrase.",false,"Condenser oui, déformer jamais."],
 ["Laisser durer un plan long dans une scène émotionnelle.",true,"Les plans longs laissent le temps de ressentir."],
 ["Exporter un short en 1920 × 1080.",false,"Le vertical, c'est 1080 × 1920."],
 ["Des proxys pour monter de la 4K sur un petit ordi.",true,"Lecture fluide, export en pleine qualité."],
 ["Une intro de 15 secondes avec logo sur un short.",false,"Pas d'intro en format court : on va droit au but."],
 ["Une ambiance très basse sous une scène filmée sans son.",true,"Un silence numérique total sonne faux."],
 ["Un easing sur les images-clés d'un zoom.",true,"Le mouvement paraît filmé, pas mécanique."],
 ["Un zoom à 160 % sur une vidéo en 1080p.",false,"L'image devient pixelisée."],
 ["Garder un plan magnifique qui ne sert pas l'histoire.",false,"Le montage sert l'histoire. Coupe-le."],
 ["Regarder un montage pro sans le son pour l'analyser.",true,"On voit le rythme des images seul."],
 ["Mixer uniquement au haut-parleur de l'ordinateur.",false,"Vérifie aussi au casque et au téléphone."],
 ["Envoyer une V1 au client avec le code temporel visible.",true,"Ses retours seront précis (« 0:42 : couper »)."],
 ["Commencer un projet client sans brief écrit.",false,"Le brief évite les malentendus coûteux."],
 ["Une coupe franche sur un gag.",true,"La rupture nette renforce l'effet comique."],
 ["Animer tous les éléments d'un titre en même temps.",false,"Décale-les de quelques images pour guider l'œil."],
 ["Utiliser la coupe franche comme transition par défaut.",true,"Les autres transitions ont un sens : garde-les pour lui."]];

/* Boutique */
const SHOP={
 boosts:[{id:"heart",name:"Cœur bonus",desc:"Un cœur en plus au prochain match de Kana Rush.",cost:60},{id:"slow",name:"Ralenti",desc:"Les kana tombent 25 % moins vite au prochain match.",cost:80},
  {id:"shield",name:"Bouclier",desc:"Le premier kana qui tombe ne coûte pas de cœur.",cost:70},{id:"double",name:"Pièces x2",desc:"Double les pièces de ton prochain match, quel que soit le jeu.",cost:100}],
 bubbles:{classic:{name:"Classique",cost:0,css:"linear-gradient(180deg,#fff,#dfe6ff)",ink:"#0b0f24"},candy:{name:"Bonbon",cost:150,css:"linear-gradient(180deg,#ffe0f0,#ff9ccf)",ink:"#5a0d34"},
  mint:{name:"Menthe",cost:150,css:"linear-gradient(180deg,#e2fff0,#7ff0b4)",ink:"#0b3d24"},neon:{name:"Néon",cost:250,css:"linear-gradient(180deg,#1b1b3a,#2c2c63)",ink:"#3fd6ff"},gold:{name:"Or",cost:400,css:"linear-gradient(180deg,#fff3b0,#ffc83d)",ink:"#5a3a00"}},
 skins:{base:{name:"Nuit bleue",cost:0},sakura:{name:"Sakura",road:true},neon:{name:"Néon Tokyo",road:true},beach:{name:"Plage d'Okinawa",cost:200},volcan:{name:"Volcan",cost:300},space:{name:"Espace",gems:30}},
 avas:{"き":{name:"Kitsune",col:"#ff7a18",cost:0},"ね":{name:"Neko",col:"#8d6bff",cost:250},"だ":{name:"Daruma",col:"#e63946",cost:350},"た":{name:"Tanuki",col:"#a0632e",road:true},"お":{name:"Oni",col:"#d62828",road:true},"り":{name:"Ryū",col:"#2a9d8f",road:true}},
 chests:[{type:"rare",cost:120,cur:"coins"},{type:"epic",cost:30,cur:"gems"}]};
const CHESTS={common:{name:"Coffre commun",col:"#6ea8ff",coins:[15,30],gems:[0,0]},rare:{name:"Coffre rare",col:"#45e07a",coins:[50,80],gems:[0,3]},
 epic:{name:"Coffre épique",col:"#c86bff",coins:[120,200],gems:[3,8]},legend:{name:"Coffre légendaire",col:"#ffc83d",coins:[300,500],gems:[10,20]}};
/* Route des trophées commune (somme des trophées des 3 jeux) */
const ROAD=[{t:15,type:"chest",v:"rare",label:"Coffre rare"},{t:40,type:"skin",v:"sakura",label:"Arène Sakura"},{t:70,type:"chest",v:"epic",label:"Coffre épique"},
 {t:100,type:"ava",v:"た",label:"Avatar Tanuki"},{t:140,type:"coins",v:150,label:"150 pièces"},{t:180,type:"chest",v:"rare",label:"Coffre rare"},{t:230,type:"skin",v:"neon",label:"Arène Néon Tokyo"},
 {t:280,type:"chest",v:"epic",label:"Coffre épique"},{t:340,type:"ava",v:"お",label:"Avatar Oni"},{t:400,type:"gems",v:20,label:"20 gemmes"},{t:470,type:"chest",v:"legend",label:"Coffre légendaire"},
 {t:550,type:"coins",v:300,label:"300 pièces"},{t:640,type:"ava",v:"り",label:"Avatar Ryū"},{t:740,type:"chest",v:"legend",label:"Coffre légendaire"}];
const RANKS=[[0,"Bronze","#cd7f32"],[60,"Argent","#c9d6e8"],[150,"Or","#ffc83d"],[280,"Diamant","#3fd6ff"],[450,"Mythique","#c86bff"],[700,"Légendaire","#ff4b5c"]];
const QUESTS=[{id:"win",txt:n=>`Gagne ${n} match${n>1?"s":""}`,n:[2,3],r:40},{id:"play",txt:n=>`Joue ${n} matchs`,n:[3,4],r:30},{id:"kana",txt:n=>`Lis juste ${n} kana`,n:[30,50],r:40},
 {id:"combo",txt:n=>`Fais un combo de ${n} dans Kana Rush`,n:[8,12],r:45},{id:"duel",txt:n=>`Gagne ${n} duel${n>1?"s":""} d'anglais`,n:[1,2],r:45},{id:"mtduel",txt:n=>`Gagne ${n} duel${n>1?"s":""} de montage`,n:[1,2],r:45},
 {id:"write",txt:n=>`Écris ${n} kana à la main`,n:[3,5],r:40}];

/* Raccourcis (réglages par défaut, Mac ; sur PC, Cmd = Ctrl) */
const SHORTCUTS=[
 ["Premiere : l'outil cutter (lame) ?",["C","B","X","V"],0,"C comme cut. V = sélection."],["Premiere : l'outil sélection ?",["V","S","A","C"],0,""],
 ["Premiere : couper tous les plans à la tête de lecture ?",["Cmd+K","Cmd+B","Cmd+X","Cmd+L"],0,"« Ajouter un montage » sans changer d'outil."],
 ["Premiere : supprimer jusqu'à la coupe précédente et refermer le trou ?",["Q","W","E","R"],0,"W fait pareil vers la coupe suivante."],
 ["Premiere : poser un marqueur ?",["M","K","N","P"],0,""],["Premiere : points d'entrée et de sortie ?",["I et O","E et S","A et Z","D et F"],0,"In / Out."],
 ["Premiere : lecture en arrière ?",["J","K","L","H"],0,"J arrière, K pause, L avant."],["Premiere : ajuster le zoom pour voir toute la séquence ?",["\\ (antislash)","Z","Cmd+0","F"],0,""],
 ["Premiere : appliquer la transition vidéo par défaut ?",["Cmd+D","Cmd+T","Cmd+F","Cmd+E"],0,""],["After Effects : afficher les images-clés du calque ?",["U","K","I","Y"],0,""],
 ["After Effects : lissage de vitesse (Easy Ease) ?",["F9","F5","F1","F12"],0,""],["After Effects : afficher la position ?",["P","S","R","T"],0,"S échelle, R rotation, T opacité."]];
/* Récompenses réelles proposées au départ (modifiables par l'utilisateur) */
const REWARDS_DEFAULT=[{name:"Un épisode de série",cost:150},{name:"Un dessert ou une pâtisserie",cost:250},{name:"Une soirée jeu vidéo sans culpabilité",cost:400},
 {name:"Un manga ou une BD",cost:800},{name:"Un preset, une LUT ou un plugin de montage",cost:1200},{name:"Un restaurant japonais",cost:1500}];
