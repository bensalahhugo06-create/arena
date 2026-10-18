/* Système commun : sauvegarde, trophées, récompenses, coffres, route, quêtes, boutique, accueil. */
"use strict";
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const dkey=d=>d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
const today=()=>dkey(new Date());

/* ---------- icônes ---------- */
const I={
 trophy:'<svg viewBox="0 0 32 32"><path d="M9 4h14v6a7 7 0 0 1-14 0z" fill="#ffc83d" stroke="#0b0f24" stroke-width="2.5" stroke-linejoin="round"/><path d="M9 6H5a4 4 0 0 0 4 6M23 6h4a4 4 0 0 1-4 6" fill="none" stroke="#0b0f24" stroke-width="2.5"/><path d="M13 17h6v5h-6z" fill="#d99400" stroke="#0b0f24" stroke-width="2.5"/><rect x="9" y="22" width="14" height="6" rx="2" fill="#ffc83d" stroke="#0b0f24" stroke-width="2.5"/></svg>',
 coin:'<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#ffc83d" stroke="#0b0f24" stroke-width="2.5"/><circle cx="16" cy="16" r="7.5" fill="none" stroke="#d99400" stroke-width="2.5"/><path d="M12 11l3 2" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/></svg>',
 gem:'<svg viewBox="0 0 32 32"><path d="M8 5h16l5 7-13 16L3 12z" fill="#3fd6ff" stroke="#0b0f24" stroke-width="2.5" stroke-linejoin="round"/><path d="M3 12h26M12 5l4 23 4-23" fill="none" stroke="#0b0f24" stroke-width="1.8" opacity=".55"/></svg>',
 heart:'<svg viewBox="0 0 32 32"><path d="M16 28S3 20 3 11a6.5 6.5 0 0 1 13-2 6.5 6.5 0 0 1 13 2c0 9-13 17-13 17z" fill="#ff4b5c" stroke="#0b0f24" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 10a3 3 0 0 1 3-3" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7" fill="none"/></svg>',
 shield:'<svg viewBox="0 0 32 32"><path d="M16 3l11 5v8c0 7-5 11-11 13C10 27 5 23 5 16V8z" fill="#3fd6ff" stroke="#0b0f24" stroke-width="2.5" stroke-linejoin="round"/><path d="M11 16l4 4 7-8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 star:'<svg viewBox="0 0 32 32"><path d="M16 3l4 8.5 9 1.2-6.6 6.3 1.7 9L16 23.6 7.9 28l1.7-9L3 12.7l9-1.2z" fill="#ffc83d" stroke="#0b0f24" stroke-width="2.5" stroke-linejoin="round"/></svg>',
 road:'<svg viewBox="0 0 32 32"><path d="M6 28L12 4h8l6 24z" fill="#4a5584" stroke="#0b0f24" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 7v4M16 15v4M16 23v3" stroke="#ffc83d" stroke-width="2.5" stroke-linecap="round"/></svg>',
 quest:'<svg viewBox="0 0 32 32"><rect x="6" y="4" width="20" height="25" rx="3" fill="#fff" stroke="#0b0f24" stroke-width="2.5"/><path d="M11 12l2 2 4-4M11 20l2 2 4-4" fill="none" stroke="#21b356" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 13h3M19 21h3" stroke="#0b0f24" stroke-width="2.5" stroke-linecap="round"/></svg>',
 shop:'<svg viewBox="0 0 32 32"><path d="M5 12h22l-2 15H7z" fill="#ff4fa3" stroke="#0b0f24" stroke-width="2.5" stroke-linejoin="round"/><path d="M11 12V9a5 5 0 0 1 10 0v3" fill="none" stroke="#0b0f24" stroke-width="2.5"/></svg>',
 cards:'<svg viewBox="0 0 32 32"><rect x="4" y="7" width="15" height="20" rx="3" fill="#7c96ff" stroke="#0b0f24" stroke-width="2.5" transform="rotate(-10 11 17)"/><rect x="13" y="5" width="15" height="20" rx="3" fill="#fff" stroke="#0b0f24" stroke-width="2.5"/><text x="20.5" y="20" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#0b0f24">あ</text></svg>',
 pen:'<svg viewBox="0 0 32 32"><path d="M6 26l3-9L22 4l6 6-13 13z" fill="#ffc83d" stroke="#0b0f24" stroke-width="2.5" stroke-linejoin="round"/><path d="M6 26l3-9 6 6z" fill="#fff" stroke="#0b0f24" stroke-width="2.5" stroke-linejoin="round"/></svg>',
 chest:c=>`<svg viewBox="0 0 64 60"><path d="M6 26h52v26a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="${c}" stroke="#0b0f24" stroke-width="3.5"/><path d="M6 26c0-12 8-20 26-20s26 8 26 20z" fill="${c}" stroke="#0b0f24" stroke-width="3.5" stroke-linejoin="round"/><path d="M6 26h52" stroke="#0b0f24" stroke-width="3.5"/><path d="M14 10v46M50 10v46" stroke="#0b0f24" stroke-width="3" opacity=".35"/><rect x="26" y="20" width="12" height="14" rx="3" fill="#ffc83d" stroke="#0b0f24" stroke-width="3"/><path d="M14 14c4-3 9-4 14-4" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6" fill="none"/></svg>`};
const sm=svg=>svg.replace("<svg",'<svg width="20" height="20"');

/* ---------- sauvegarde (sur l'appareil) ---------- */
const KEY="arena.v2";
const blank=()=>({v:2,tr:{kana:0,duel:0,cut:0},coins:50,gems:0,xp:0,chests:[{id:1,type:"common"}],claimed:[],skins:["base"],skin:"base",avas:["き"],ava:"き",bubbles:["classic"],bubble:"classic",
 boosts:{},kana:{},learned:[],en:{},mtq:{},rewards:null,won:[],quests:{day:"",list:[]},streak:{last:"",n:0},stats:{matches:0,wins:0},mode:"kana",nextId:2});
let S=blank();
try{const raw=localStorage.getItem(KEY);if(raw)S=Object.assign(blank(),JSON.parse(raw));
  else{const o=JSON.parse(localStorage.getItem("kanarush.v1")||"null");if(o){/* reprise de la première version */
    S.tr.kana=Math.min(60,Math.round((o.trophies||0)/2));S.coins=o.coins||50;S.gems=o.gems||0;S.xp=o.xp||0;S.chests=(o.chests||[]).slice(0,4).map((c,i)=>({id:i+1,type:c.type}));S.nextId=10;
    S.skins=(o.skins||["base"]).filter(k=>SHOP.skins[k]);S.avas=(o.avas||["き"]).filter(k=>SHOP.avas[k]);Object.entries(o.kana||{}).forEach(([c,k])=>{S.kana[c]={ok:k.ok||0,ko:k.ko||0,w:0}});save()}}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const totalTr=()=>S.tr.kana+S.tr.duel+S.tr.cut;
const level=()=>Math.floor(Math.sqrt(S.xp/40))+1;
const lvlBase=l=>(l-1)*(l-1)*40;
const rankOf=t=>{let r=RANKS[0];RANKS.forEach(x=>{if(t>=x[0])r=x});return r};
const rankBadge=(t,sz)=>{const r=rankOf(t);return`<svg class="badge" ${sz?`style="width:${sz}px;height:${sz}px"`:""} viewBox="0 0 32 32"><path d="M16 2l12 6v9c0 7-6 11-12 13C10 28 4 24 4 17V8z" fill="${r[2]}" stroke="#0b0f24" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 9l2.3 4.6 5 .7-3.6 3.5.9 5L16 20.4 11.4 22.8l.9-5-3.6-3.5 5-.7z" fill="#fff" stroke="#0b0f24" stroke-width="1.5" stroke-linejoin="round"/></svg>`};

/* ---------- quêtes, série ---------- */
function newQuests(){const d=today();if(S.quests.day===d)return;const ids=shuffle(QUESTS).slice(0,3);S.quests={day:d,list:ids.map(q=>{const n=rnd(q.n[0],q.n[1]);return{id:q.id,n,p:0,r:q.r,done:false,got:false,txt:q.txt(n)}})};save()}
function quest(id,v,mode){(S.quests.list||[]).forEach(q=>{if(q.id!==id||q.done)return;q.p=mode==="max"?Math.max(q.p,v):q.p+v;if(q.p>=q.n){q.p=q.n;q.done=true}})}
function touchStreak(){const d=today();if(S.streak.last===d)return;const y=new Date();y.setDate(y.getDate()-1);S.streak.n=S.streak.last===dkey(y)?S.streak.n+1:1;S.streak.last=d}

/* ---------- récompenses de fin de match (communes aux 3 jeux) ----------
   Victoire : 3 trophées + bonus de performance (0 à 5) = 3 à 8. Défaite : -2 (rien sous 30 trophées). */
function reward(mode,win,perf){const before=S.tr[mode];let dT=win?3+Math.max(0,Math.min(5,Math.round(perf*5))):(before<30?0:-2);
  S.tr[mode]=Math.max(0,before+dT);dT=S.tr[mode]-before;let coins=win?8+Math.round(perf*7):3;if(S.boosts.double){coins*=2;delete S.boosts.double}
  const xp=win?20+Math.round(perf*20):8;const lvlBefore=level();S.coins+=coins;S.xp+=xp;S.stats.matches++;if(win)S.stats.wins++;quest("play",1);if(win)quest("win",1);
  let chest=null;if(win&&S.chests.length<4){const r=Math.random();chest={id:S.nextId++,type:r<0.02?"legend":r<0.09?"epic":r<0.3?"rare":"common"};S.chests.push(chest)}
  touchStreak();save();return{dT,coins,xp,chest,lvlUp:level()>lvlBefore,full:win&&!chest}}
function resultsHTML(win,r,stars,body,again){return`<div class="center">
  <div class="big" style="color:${win?"var(--gold)":"var(--red)"}">${win?"VICTOIRE !":"DÉFAITE"}</div>
  ${win?`<div class="stars">${[1,2,3].map(i=>I.star.replace("<svg",`<svg class="${i<=stars?"":"off"}"`)).join("")}</div>`:""}
  <div class="gain"><span class="res">${I.trophy}${r.dT>=0?"+":""}${r.dT}</span><span class="res">${I.coin}+${r.coins}</span><span class="res" style="color:var(--cyan)">XP +${r.xp}</span></div>
  ${body}
  ${r.lvlUp?`<div class="g" style="font-size:24px;color:var(--cyan)">NIVEAU ${level()} !</div>`:""}
  ${r.chest?`<div class="card" style="max-width:340px;width:100%"><div class="rw">${I.chest(CHESTS[r.chest.type].col)}</div><div class="grow"><b>${CHESTS[r.chest.type].name} gagné !</b><small>Ouvre-le depuis l'accueil.</small></div></div>`:r.full?`<div class="muted">Emplacements de coffres pleins : ouvre-les pour en gagner d'autres.</div>`:""}
  <div style="display:flex;gap:10px;width:100%;max-width:340px"><button class="btn grey" style="flex:1" data-a="home">Accueil</button><button class="btn gold" style="flex:1.4" data-a="${again}">REJOUER</button></div></div>`}

/* ---------- accueil ---------- */
const MODES={kana:{name:"KANA RUSH",sub:"Japonais",glyph:"あ",col:"linear-gradient(180deg,#ffb347,#ff6a00)"},duel:{name:"WORD DUEL",sub:"Anglais",glyph:"EN",col:"linear-gradient(180deg,#7c96ff,#3a57d6)"},cut:{name:"CUT DUEL",sub:"Montage",glyph:"✂",col:"linear-gradient(180deg,#ff8fc8,#ff4fa3)"}};
function topBar(){const l=level(),b=lvlBase(l),n=lvlBase(l+1);const av=SHOP.avas[S.ava]||SHOP.avas["き"];return`<div class="top"><div class="me"><div class="ava" style="background:linear-gradient(180deg,#fff3,transparent),${av.col}">${S.ava}</div><div class="lvl"><b class="g">Niveau ${l}</b><div class="xpbar"><i style="width:${Math.round((S.xp-b)/(n-b)*100)}%"></i></div></div></div>
  <div class="res">${I.trophy}<span>${totalTr()}</span></div><div class="res">${I.coin}<span>${S.coins}</span></div><div class="res">${I.gem}<span>${S.gems}</span></div></div>`}
function home(){newQuests();closeLayer();const g=$("#game");if(g)g.remove();
  const m=S.mode,M_=MODES[m];const nx=ROAD.find((r,i)=>totalTr()<r.t);const prevT=[...ROAD].reverse().find(r=>r.t<=totalTr());const p0=prevT?prevT.t:0;
  const pct=nx?Math.round((totalTr()-p0)/(nx.t-p0)*100):100;const qn=(S.quests.list||[]).filter(q=>q.done&&!q.got).length;const rn=ROAD.filter((r,i)=>totalTr()>=r.t&&!S.claimed.includes(i)).length;
  const info=m==="kana"?kanaHomeInfo():m==="duel"?duelHomeInfo():cutHomeInfo();
  $("#app").dataset.skin=S.skin;
  $("#app").innerHTML=topBar()+`<div class="screen">
   <div class="modes">${Object.entries(MODES).map(([k,v])=>`<button class="mtab ${k===m?"on":""}" data-a="mode" data-m="${k}"><span class="mg" style="background:${v.col}">${v.glyph}</span><b>${v.sub}</b><span class="mt">${sm(I.trophy)}${S.tr[k]}</span></button>`).join("")}</div>
   <div class="hero"><div class="mode g">${M_.name}</div><div class="mascot ${m==="kana"?"jp":""}" style="background:radial-gradient(circle at 35% 30%,#fff7,transparent 40%),${M_.col}">${m==="kana"?esc(S.ava):M_.glyph}</div>
    <div class="rank">${rankBadge(S.tr[m])}<span class="g">${rankOf(S.tr[m])[1]}</span><span class="muted">· ${S.tr[m]} trophées</span></div>${info.hero}</div>
   ${info.play}
   <div class="row3"><button class="tile" data-a="road">${I.road}Route${rn?`<span class="notif">${rn}</span>`:""}</button><button class="tile" data-a="quests">${I.quest}Quêtes${qn?`<span class="notif">${qn}</span>`:""}</button><button class="tile" data-a="shop">${I.shop}Boutique</button></div>
   <button class="road-mini card" data-a="road"><div class="lab"><span>Route : ${nx?esc(nx.label):"terminée !"}</span><span>${totalTr()} / ${nx?nx.t:totalTr()}</span></div><div class="bar"><i style="width:${pct}%"></i></div></button>
   <div class="sect">Coffres · série ${S.streak.n} jour${S.streak.n>1?"s":""}</div>
   <div class="chests">${[0,1,2,3].map(i=>{const c=S.chests[i];return c?`<button class="slot full" data-a="chest" data-i="${i}" aria-label="${CHESTS[c.type].name}">${I.chest(CHESTS[c.type].col)}</button>`:`<div class="slot">Gagne un match</div>`}).join("")}</div>
   ${info.extra||""}
  </div>`}

/* ---------- couches : route, quêtes, boutique ---------- */
function openLayer(title,html){closeLayer();const d=document.createElement("div");d.className="layer";d.id="layer";d.innerHTML=`<div class="lhead"><h2>${title}</h2><button class="close" data-a="close" aria-label="Fermer">✕</button></div><div class="lbody">${html}</div>`;document.body.appendChild(d)}
function closeLayer(){const l=$("#layer");if(l)l.remove()}
function roadView(){const t=totalTr();openLayer("Route des trophées",`<div class="card"><div class="grow"><b>${t} trophées</b><small>La somme des trophées de tes 3 jeux. Chaque palier donne une récompense.</small></div>${rankBadge(t,44)}</div>
  <div class="road">${ROAD.map((m,i)=>{const got=t>=m.t,took=S.claimed.includes(i);const icon=m.type==="chest"?I.chest(CHESTS[m.v].col):m.type==="ava"?`<span class="k jp">${m.v}</span>`:m.type==="coins"?I.coin:m.type==="gems"?I.gem:I.star;
   return`<div class="ms ${got?"got":"locked"}"><div class="card"><div class="rw">${icon}</div><div class="grow"><div class="tr">${sm(I.trophy)}${m.t}</div><b>${esc(m.label)}</b><small>${got?(took?"Récupéré":"Disponible !"):"Verrouillé"}</small></div>${got&&!took?`<button class="btn gold" data-a="claim" data-i="${i}">Prendre</button>`:""}</div></div>`}).join("")}</div>`)}
function questsView(){openLayer("Quêtes du jour",`<p class="muted" style="margin:0">Nouvelles quêtes chaque jour à minuit.</p>${S.quests.list.map((q,i)=>`<div class="card"><div class="rw">${I.quest}</div><div class="grow"><b>${esc(q.txt)}</b><small>${q.p} / ${q.n}</small><div class="pbar"><i style="width:${Math.round(q.p/q.n*100)}%"></i></div></div>${q.got?`<span class="muted">Fait</span>`:q.done?`<button class="btn gold" data-a="qclaim" data-i="${i}">${sm(I.coin)} ${q.r}</button>`:`<span class="res">${I.coin}${q.r}</span>`}</div>`).join("")}`)}
const skinBg={base:"#1b2a63",sakura:"#6a2a6e",neon:"#0f3b4a",beach:"#0f6f8a",volcan:"#5a1f12",space:"#140a2e"};
function price(o){return o.gems?`${sm(I.gem)} ${o.gems}`:`${sm(I.coin)} ${o.cost}`}
const afford=o=>o.gems?S.gems>=o.gems:S.coins>=o.cost;
const myRewards=()=>S.rewards||(S.rewards=REWARDS_DEFAULT.map((r,i)=>({id:"d"+i,name:r.name,cost:r.cost})));
function shopView(){const B=SHOP.boosts;const RW=myRewards();openLayer("Boutique",`
  <div class="sect">Mes vraies récompenses</div><p class="muted" style="margin:0">Gagne des pièces en jouant, puis offre-toi une vraie récompense. C'est toi qui choisis les récompenses et leurs prix.</p>
  ${RW.map(r=>`<div class="card"><div class="rw">${I.star}</div><div class="grow"><b>${esc(r.name)}</b><small>${S.coins>=r.cost?"Tu peux te l'offrir !":"Encore "+(r.cost-S.coins)+" pièces"}</small></div><button class="btn gold" data-a="buyrew" data-id="${r.id}" ${S.coins<r.cost?"disabled":""}>${sm(I.coin)} ${r.cost}</button><button class="close mini" data-a="delrew" data-id="${r.id}" aria-label="Retirer">✕</button></div>`).join("")}
  <form class="card addrew" data-f="addrew"><input name="name" id="rw-name" placeholder="Ma récompense (ex. un ciné)" maxlength="60" required><input name="cost" id="rw-cost" type="number" min="10" max="99999" placeholder="Prix" required><button class="btn">Ajouter</button></form>
  ${S.won.length?`<div class="sect">Déjà gagnées</div>${S.won.slice(-5).reverse().map(w=>`<div class="card"><div class="rw">${I.trophy}</div><div class="grow"><b>${esc(w.name)}</b><small>${new Date(w.t).toLocaleDateString("fr-FR",{day:"numeric",month:"long"})} · ${w.cost} pièces</small></div></div>`).join("")}`:""}
  <div class="sect">Coffres</div>${SHOP.chests.map((c,i)=>`<div class="card"><div class="rw">${I.chest(CHESTS[c.type].col)}</div><div class="grow"><b>${CHESTS[c.type].name}</b><small>${S.chests.length>=4?"Emplacements pleins":"Ajouté à tes emplacements"}</small></div><button class="btn gold" data-a="buychest" data-i="${i}" ${(c.cur==="gems"?S.gems<c.cost:S.coins<c.cost)||S.chests.length>=4?"disabled":""}>${c.cur==="gems"?sm(I.gem):sm(I.coin)} ${c.cost}</button></div>`).join("")}
  <div class="sect">Boosts (un de chaque à la fois)</div>${B.map(b=>`<div class="card"><div class="rw">${b.id==="heart"?I.heart:b.id==="shield"?I.shield:b.id==="double"?I.coin:'<span class="k jp">遅</span>'}</div><div class="grow"><b>${esc(b.name)}</b><small>${esc(b.desc)}${S.boosts[b.id]?" · <b style='font-size:13px;color:var(--green)'>actif</b>":""}</small></div><button class="btn gold" data-a="buyboost" data-k="${b.id}" ${S.coins<b.cost||S.boosts[b.id]?"disabled":""}>${sm(I.coin)} ${b.cost}</button></div>`).join("")}
  <div class="sect">Bulles de kana</div>${Object.entries(SHOP.bubbles).map(([k,v])=>{const own=S.bubbles.includes(k);return`<div class="card"><div class="rw" style="background:${v.css};color:${v.ink}"><span class="k jp">か</span></div><div class="grow"><b>${esc(v.name)}</b><small>${own?(S.bubble===k?"Équipée":"Possédée"):"Change l'apparence des kana"}</small></div>${own?(S.bubble===k?"":`<button class="btn" data-a="bubble" data-k="${k}">Équiper</button>`):`<button class="btn gold" data-a="buybubble" data-k="${k}" ${S.coins<v.cost?"disabled":""}>${price(v)}</button>`}</div>`}).join("")}
  <div class="sect">Arènes</div>${Object.entries(SHOP.skins).map(([k,v])=>{const own=S.skins.includes(k);const r=ROAD.find(m=>m.type==="skin"&&m.v===k);return`<div class="card"><div class="rw" style="background:${skinBg[k]}"></div><div class="grow"><b>${esc(v.name)}</b><small>${own?(S.skin===k?"Équipée":"Possédée"):r?"Sur la route à "+r.t+" trophées":"Fond d'écran du jeu"}</small></div>${own?(S.skin===k?"":`<button class="btn" data-a="skin" data-k="${k}">Équiper</button>`):v.road?"":`<button class="btn gold" data-a="buyskin" data-k="${k}" ${afford(v)?"":"disabled"}>${price(v)}</button>`}</div>`}).join("")}
  <div class="sect">Avatars</div>${Object.entries(SHOP.avas).map(([k,v])=>{const own=S.avas.includes(k);const r=ROAD.find(m=>m.type==="ava"&&m.v===k);return`<div class="card"><div class="ava" style="background:${v.col}">${k}</div><div class="grow"><b>${esc(v.name)}</b><small>${own?(S.ava===k?"Équipé":"Débloqué"):r?"Sur la route à "+r.t+" trophées":"Personnage"}</small></div>${own?(S.ava===k?"":`<button class="btn" data-a="ava" data-k="${k}">Choisir</button>`):v.road?"":`<button class="btn gold" data-a="buyava" data-k="${k}" ${S.coins<v.cost?"disabled":""}>${price(v)}</button>`}</div>`}).join("")}`)}

/* ---------- coffres ---------- */
function openChest(i){const c=S.chests[i];if(!c)return;const def=CHESTS[c.type];let taps=0;
  openLayer("",`<div class="center"><div class="g" style="font-size:26px">${def.name}</div><button class="chestbig" id="cb" aria-label="Ouvrir">${I.chest(def.col)}</button><div class="muted" id="ctxt">Touche 3 fois pour ouvrir</div></div>`);
  $("#cb").onclick=()=>{taps++;const b=$("#cb");b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");$("#ctxt").textContent=taps<3?(3-taps)+"…":"";if(taps<3)return;
    const coins=rnd(...def.coins),gems=rnd(...def.gems);S.coins+=coins;S.gems+=gems;let extra="";
    const lockedBub=Object.keys(SHOP.bubbles).filter(k=>!S.bubbles.includes(k));
    if((c.type==="epic"&&Math.random()<0.35)||c.type==="legend"){if(lockedBub.length){const k=pick(lockedBub);S.bubbles.push(k);extra=`<div class="card" style="animation-delay:.24s"><div class="rw" style="background:${SHOP.bubbles[k].css};color:${SHOP.bubbles[k].ink}"><span class="k jp">か</span></div><div class="grow"><b>Bulles ${esc(SHOP.bubbles[k].name)} !</b><small>À équiper dans la boutique.</small></div></div>`}}
    else if(c.type!=="common"&&Math.random()<0.4){const k=pick(Object.keys(SHOP.boosts.reduce((o,b)=>(o[b.id]=1,o),{})).filter(k=>!S.boosts[k]));if(k){S.boosts[k]=true;const b=SHOP.boosts.find(x=>x.id===k);extra=`<div class="card" style="animation-delay:.24s"><div class="rw">${I.shield}</div><div class="grow"><b>Boost : ${esc(b.name)}</b><small>Actif pour ton prochain match.</small></div></div>`}}
    S.chests.splice(i,1);save();
    $("#layer .lbody").innerHTML=`<div class="center"><div class="g" style="font-size:28px">${def.name}</div><div class="loot"><div class="card"><div class="rw">${I.coin}</div><div class="grow"><b>+${coins} pièces</b></div></div>
      ${gems?`<div class="card" style="animation-delay:.12s"><div class="rw">${I.gem}</div><div class="grow"><b>+${gems} gemmes</b></div></div>`:""}${extra}</div><button class="btn gold" style="min-width:200px" data-a="close">Super !</button></div>`}}

/* ---------- actions communes ---------- */
const ACT={};
Object.assign(ACT,{
 buyrew:el=>{const r=myRewards().find(x=>x.id===el.dataset.id);if(!r||S.coins<r.cost)return;
   if(el.dataset.sure!=="1"){el.dataset.sure="1";el.innerHTML="Sûr ?";setTimeout(()=>{if(el.isConnected){el.dataset.sure="";el.innerHTML=sm(I.coin)+" "+r.cost}},2500);return}
   S.coins-=r.cost;S.won.push({name:r.name,cost:r.cost,t:Date.now()});save();shopView();
   openLayer("",`<div class="center"><div class="big" style="color:var(--gold)">BRAVO !</div><div class="g" style="font-size:26px">${esc(r.name)}</div><div class="muted">Tu l'as gagnée en jouant. Profite !</div><button class="btn gold" style="min-width:200px" data-a="shop">Retour à la boutique</button></div>`)},
 delrew:el=>{if(el.dataset.sure!=="1"){el.dataset.sure="1";el.textContent="?";setTimeout(()=>{if(el.isConnected){el.dataset.sure="";el.textContent="✕"}},2500);return}S.rewards=myRewards().filter(x=>x.id!==el.dataset.id);save();shopView()},
 home:()=>home(),close:()=>home(),road:roadView,quests:questsView,shop:shopView,
 mode:el=>{S.mode=el.dataset.m;save();home()},
 chest:el=>openChest(+el.dataset.i),
 claim:el=>{const i=+el.dataset.i,m=ROAD[i];if(totalTr()<m.t||S.claimed.includes(i))return;S.claimed.push(i);
   if(m.type==="chest"){if(S.chests.length<4)S.chests.push({id:S.nextId++,type:m.v});else S.coins+=CHESTS[m.v].coins[1]}
   if(m.type==="skin"&&!S.skins.includes(m.v))S.skins.push(m.v);if(m.type==="ava"&&!S.avas.includes(m.v))S.avas.push(m.v);if(m.type==="coins")S.coins+=m.v;if(m.type==="gems")S.gems+=m.v;save();roadView()},
 qclaim:el=>{const q=S.quests.list[+el.dataset.i];if(q&&q.done&&!q.got){q.got=true;S.coins+=q.r;S.xp+=20;save()}questsView()},
 buychest:el=>{const c=SHOP.chests[+el.dataset.i];if(S.chests.length>=4)return;if(c.cur==="gems"){if(S.gems<c.cost)return;S.gems-=c.cost}else{if(S.coins<c.cost)return;S.coins-=c.cost}S.chests.push({id:S.nextId++,type:c.type});save();shopView()},
 buyboost:el=>{const b=SHOP.boosts.find(x=>x.id===el.dataset.k);if(!b||S.boosts[b.id]||S.coins<b.cost)return;S.coins-=b.cost;S.boosts[b.id]=true;save();shopView()},
 buybubble:el=>{const k=el.dataset.k,v=SHOP.bubbles[k];if(S.bubbles.includes(k)||S.coins<v.cost)return;S.coins-=v.cost;S.bubbles.push(k);S.bubble=k;save();shopView()},
 bubble:el=>{S.bubble=el.dataset.k;save();shopView()},
 buyskin:el=>{const k=el.dataset.k,v=SHOP.skins[k];if(S.skins.includes(k)||!afford(v))return;if(v.gems)S.gems-=v.gems;else S.coins-=v.cost;S.skins.push(k);S.skin=k;save();$("#app").dataset.skin=k;shopView()},
 skin:el=>{S.skin=el.dataset.k;save();$("#app").dataset.skin=S.skin;shopView()},
 buyava:el=>{const k=el.dataset.k,v=SHOP.avas[k];if(S.avas.includes(k)||S.coins<v.cost)return;S.coins-=v.cost;S.avas.push(k);S.ava=k;save();shopView()},
 ava:el=>{S.ava=el.dataset.k;save();shopView()}
});
document.addEventListener("click",e=>{const el=e.target.closest("[data-a]");if(!el)return;const f=ACT[el.dataset.a];if(f)f(el,e)});
document.addEventListener("submit",e=>{const f=e.target.closest("form[data-f=addrew]");if(!f)return;e.preventDefault();const fd=new FormData(f);const name=String(fd.get("name")||"").trim(),cost=Math.round(+fd.get("cost"));
  if(!name||!(cost>=10))return;myRewards().push({id:"r"+Date.now().toString(36),name,cost});save();shopView()});
