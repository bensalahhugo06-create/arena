/* Kana Rush : apprentissage ligne par ligne (découvrir → tracer → écrire de mémoire → reconnaître),
   puis matchs avec uniquement les kana appris. La ligne suivante se débloque quand les kana appris sont maîtrisés.
   Ordre : hiragana, puis katakana (les kanji viendront ensuite). */
"use strict";
const K=c=>S.kana[c]||(S.kana[c]={ok:0,ko:0,w:0});
const mastery=c=>{const k=S.kana[c];if(!k)return 0;return Math.max(0,Math.min(5,Math.floor((k.ok-k.ko+2*(k.w||0))/3)))};
const READY=2; /* niveau de maîtrise demandé avant d'ajouter la ligne suivante */
const learnedRows=()=>S.learned.map(id=>ROWS.find(r=>r.id===id)).filter(Boolean);
const pool=()=>learnedRows().flatMap(r=>r.k);
const nextRow=()=>ROWS[S.learned.length]||null;
const readyCount=()=>pool().filter(([c])=>mastery(c)>=READY).length;
const lessonOpen=()=>!!nextRow()&&(S.learned.length===0||readyCount()===pool().length);
function weightedKana(exclude){const p=pool().filter(([c])=>!exclude.includes(c));if(!p.length)return pick(pool());
  const w=p.map(([c])=>{const k=S.kana[c]||{ok:0,ko:0};return 1+k.ko*2.5/(1+k.ok*0.15)+(k.ok<3?2:0)+(5-mastery(c))*0.5});
  let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<p.length;i++){r-=w[i];if(r<=0)return p[i]}return p[p.length-1]}
function wordsFor(set){return WORDS.filter(([w])=>[...w].every(ch=>set.has(ch)))}

function kanaHomeInfo(){const n=nextRow(),p=pool();const rd=readyCount();
  const rows=learnedRows().map(r=>r.k[0][0]).join(" ")||"aucune";
  const hero=`<div class="kinfo"><div class="muted">Lignes apprises : <b class="jp" style="color:#fff">${rows}</b></div>
   ${n?(S.learned.length?`<div class="road-mini"><div class="lab"><span>Kana maîtrisés pour débloquer « ${esc(n.name)} »</span><span>${rd} / ${p.length}</span></div><div class="bar"><i style="width:${Math.round(rd/p.length*100)}%"></i></div></div>`:""):`<div class="muted">Tous les kana sont appris. Les kanji arrivent bientôt !</div>`}</div>`;
  const lesson=lessonOpen()?`<button class="play lessonbtn" data-a="lesson">NOUVELLE LEÇON<small>Ligne ${esc(n.name)} · découvrir, écrire, reconnaître</small></button>`:"";
  const play=S.learned.length?`<button class="play ${lesson?"second":""}" data-a="kplay">JOUER<small>${p.length} kana en jeu · environ 2 min</small></button>`:"";
  const extra=S.learned.length?`<div class="row2"><button class="tile" data-a="writepr">${I.pen}Écrire</button><button class="tile" data-a="coll">${I.cards}Collection</button></div>`:"";
  return{hero,play:lesson+play,extra}}

/* ---------- écriture au doigt ---------- */
const N=256;
async function fontReady(ch){try{await document.fonts.load('700 200px "Noto Sans JP"',ch)}catch(e){}}
function drawGlyph(ctx,ch,color){ctx.clearRect(0,0,N,N);ctx.fillStyle=color;ctx.textAlign="center";ctx.textBaseline="middle";ctx.font='700 196px "Noto Sans JP","Hiragino Sans","Hiragino Kaku Gothic ProN",sans-serif';ctx.fillText(ch,N/2,N*0.53)}
function gridOf(data,G){const cell=N/G,out=new Uint8Array(G*G);for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(data[(y*N+x)*4+3]>60)out[Math.floor(y/cell)*G+Math.floor(x/cell)]=1}return out}
function dilate(a,G,r){const o=new Uint8Array(G*G);for(let y=0;y<G;y++)for(let x=0;x<G;x++)if(a[y*G+x])for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<G&&Y<G)o[Y*G+X]=1}return o}
/* Reconnaissance : le tracé est comparé à tous les kana du même alphabet (score F1 de recouvrement).
   Il est accepté s'il ressemble assez au kana demandé ET pas nettement plus à un autre (ex. お au lieu de あ). */
const RG=48,maskCache={};
function gmask(ch){if(maskCache[ch])return maskCache[ch];const m=document.createElement("canvas");m.width=m.height=N;const mc=m.getContext("2d");drawGlyph(mc,ch,"#000");return maskCache[ch]=gridOf(mc.getImageData(0,0,N,N).data,RG)}
function f1(g,k){const gd=dilate(g,RG,1),kd=dilate(k,RG,1);let gc=0,gh=0,kc=0,kh=0;for(let i=0;i<RG*RG;i++){if(g[i]){gc++;if(kd[i])gh++}if(k[i]){kc++;if(gd[i])kh++}}const c=gc?gh/gc:0,p=kc?kh/kc:0;return c+p?2*c*p/(c+p):0}
function recognize(ch,inkCtx){const k=gridOf(inkCtx.getImageData(0,0,N,N).data,RG);let ink=0;for(let i=0;i<k.length;i++)ink+=k[i];
  const set=ROWS.find(r=>r.k.some(x=>x[0]===ch)).set;const cands=ROWS.filter(r=>r.set===set).flatMap(r=>r.k.map(x=>x[0]));
  const target=f1(gmask(ch),k);let best=null,bs=-1;cands.forEach(c=>{if(c===ch)return;const v=f1(gmask(c),k);if(v>bs){bs=v;best=c}});return{target,best,bs,ink}}
function padHTML(ch,ghost){return`<div class="pad"><canvas class="ghost" id="ghost" width="${N}" height="${N}"></canvas><canvas class="ink" id="ink" width="${N}" height="${N}"></canvas><div class="padgrid"></div></div>`}
let PAD=null;
async function setupPad(ch,ghost){await fontReady(ch);const gc=$("#ghost").getContext("2d");if(ghost)drawGlyph(gc,ch,"rgba(255,255,255,.22)");else gc.clearRect(0,0,N,N);
  const cv=$("#ink"),ctx=cv.getContext("2d");ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=19;ctx.strokeStyle="#ffc83d";
  PAD={ch,ctx,strokes:0,drawing:false,last:null,moved:0};
  const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*N,(e.clientY-r.top)/r.height*N]};
  cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);PAD.drawing=true;PAD.moved=0;PAD.last=pos(e);ctx.beginPath();ctx.arc(PAD.last[0],PAD.last[1],ctx.lineWidth/2,0,7);ctx.fillStyle="#ffc83d";ctx.fill()};
  cv.onpointermove=e=>{if(!PAD.drawing)return;const p=pos(e);ctx.beginPath();ctx.moveTo(...PAD.last);ctx.lineTo(...p);ctx.stroke();PAD.moved+=Math.hypot(p[0]-PAD.last[0],p[1]-PAD.last[1]);PAD.last=p};
  cv.onpointerup=cv.onpointercancel=()=>{if(PAD.drawing){PAD.drawing=false;PAD.strokes++}}}
function clearPad(){if(!PAD)return;PAD.ctx.clearRect(0,0,N,N);PAD.strokes=0;const f=$("#wfb");if(f)f.innerHTML=""}

/* ---------- leçon d'une ligne ---------- */
let L=null;
function startLesson(row,practice){L={row,list:practice||row.k,i:0,step:"see",fails:0,practice:!!practice,quiz:null};lessonStep()}
function lessonShell(inner,title){$("#app").innerHTML=topBar()+`<div class="screen lesson"><div class="lhead2"><button class="close" data-a="home" aria-label="Quitter">✕</button><b class="g">${esc(title)}</b><div class="dots">${L.list.map((_,j)=>`<i class="${j<L.i||(j===L.i&&L.step==="done")?"on":j===L.i?"cur":""}"></i>`).join("")}</div></div>${inner}</div>`}
async function lessonStep(){const[c,R,n]=L.list[L.i]||[];const title=L.practice?"Entraînement d'écriture":"Leçon · "+L.row.name;
  if(L.step==="see"){const learned=new Set(pool().map(x=>x[0]).concat(L.row.k.map(x=>x[0])));const ex=WORDS.find(([w])=>w.includes(c)&&[...w].every(x=>learned.has(x)))||WORDS.find(([w])=>w.includes(c));
    lessonShell(`<div class="center"><div class="introk jp">${c}</div><div class="big">${R.toUpperCase()}</div><div class="muted">${n} trait${n>1?"s":""}</div>
     ${ex?`<div class="wordline">Comme dans <b>${ex[0]}</b> (${ex[1]}) : ${esc(ex[2])}</div>`:""}
     <button class="play" style="max-width:340px" data-a="lnext">JE L'ÉCRIS</button></div>`,title);return}
  if(L.step==="trace"||L.step==="free"){const ghost=L.step==="trace";
    lessonShell(`<div class="center wcol"><div class="g" style="font-size:22px">${ghost?"Repasse sur le modèle":"Écris-le de mémoire"}</div>
     <div class="muted">${ghost?`« ${R} » · ${n} trait${n>1?"s":""} · de haut en bas, de gauche à droite`:`« ${R} » · ${n} trait${n>1?"s":""}`}</div>
     ${padHTML(c,ghost)}<div id="wfb" class="wfb" role="status"></div>
     <div class="wbtns"><button class="btn grey" data-a="wclear">Effacer</button><button class="btn gold" data-a="wcheck">Vérifier</button></div>
     ${L.fails>=2?`<button class="linkb" data-a="lskip">Passer pour l'instant</button>`:""}</div>`,title);await setupPad(c,ghost);return}
  if(L.step==="quiz")return lessonQuiz();
}
function checkWriting(){if(!PAD)return;const[c,R,n]=L.list[L.i];const s=recognize(c,PAD.ctx);const fb=$("#wfb");
  if(s.ink<4){fb.innerHTML="Trace le caractère avec ton doigt.";return}
  const trace=L.step==="trace";const thr=trace?0.8:0.74;const other=s.bs>s.target+0.03;const ok=s.target>=thr&&!other;
  const strokeMsg=PAD.strokes!==n?` Tu as fait ${PAD.strokes} trait${PAD.strokes>1?"s":""}, il en faut ${n}.`:"";
  /* montre le caractère par-dessus le tracé pour comparer */
  drawGlyph($("#ghost").getContext("2d"),c,ok?"rgba(69,224,122,.45)":"rgba(255,75,92,.4)");
  if(ok){K(c).w=(K(c).w||0)+1;quest("write",1);save();fb.innerHTML=`<b style="color:var(--green)">${trace?"Bien tracé !":"Bravo, c'est juste !"}</b>${strokeMsg?`<span class="muted">${strokeMsg}</span>`:""}`;
    $(".wbtns").innerHTML=`<button class="btn gold" style="flex:1" data-a="wok">${trace?"De mémoire maintenant":"Suivant"}</button>`}
  else{L.fails++;fb.innerHTML=`<b style="color:var(--red)">Pas encore.</b> <span class="muted">${other?`Ça ressemble plutôt à <b class="jp" style="color:#fff">${s.best}</b> (${READ[s.best]}).`:"Le tracé ne ressemble pas assez au modèle : compare avec le caractère affiché."}${strokeMsg}</span>`;
    $(".wbtns").innerHTML=`<button class="btn grey" data-a="wretry">Recommencer</button>${!trace?`<button class="btn" data-a="wmodel">Revoir le modèle</button>`:""}`;
    if(L.fails>=2&&!$(".linkb"))$(".wcol").insertAdjacentHTML("beforeend",`<button class="linkb" data-a="lskip">Passer pour l'instant</button>`)}}
function lessonAdvance(){if(L.step==="see"){L.step="trace";L.fails=0}else if(L.step==="trace"){L.step="free";L.fails=0}
  else{L.i++;L.step="see";L.fails=0;if(L.i>=L.list.length){if(L.practice){S.coins+=5*L.list.length;save();return lessonDone(true)}L.step="quiz"}}lessonStep()}
/* petit quiz de reconnaissance de fin de leçon : chaque kana de la ligne, mélangé avec ceux déjà appris */
function lessonQuiz(){if(!L.quiz)L.quiz={order:shuffle(L.row.k),i:0,errs:0};const q=L.quiz;if(q.i>=q.order.length)return lessonDone(false);
  const[c,R]=q.order[q.i];const others=shuffle(pool().concat(L.row.k).map(x=>x[1]).filter((r,i,a)=>r!==R&&a.indexOf(r)===i)).slice(0,3);q.opts=shuffle([R,...others]);
  lessonShell(`<div class="center"><div class="g" style="font-size:22px">Comment se lit-il ?</div><div class="introk jp">${c}</div><div class="answers" style="width:100%;max-width:400px;padding:0">${q.opts.map((r,i)=>`<button class="ans" data-a="lqa" data-i="${i}">${r}</button>`).join("")}</div><div id="qfb" class="muted"> </div></div>`,"Petit quiz · "+L.row.name)}
function lessonQuizAnswer(i,btn){const q=L.quiz;const[c,R]=q.order[q.i];if(q.lock)return;q.lock=true;
  if(q.opts[i]===R){btn.classList.add("ok");K(c).ok++;$("#qfb").textContent="Juste !"}else{btn.classList.add("ko");q.errs++;K(c).ko++;document.querySelectorAll(".ans")[q.opts.indexOf(R)].classList.add("ok");$("#qfb").textContent=c+" se lit « "+R+" »";q.order.push(q.order[q.i])}
  save();setTimeout(()=>{q.i++;q.lock=false;lessonQuiz()},q.opts[i]===R?600:1400)}
function lessonDone(practice){const coins=practice?5*L.list.length:20;if(!practice){S.learned.push(L.row.id);S.coins+=20;S.xp+=30}save();const row=L.row;L=null;
  $("#app").innerHTML=topBar()+`<div class="center"><div class="big" style="color:var(--gold)">${practice?"BIEN ÉCRIT !":"LIGNE APPRISE !"}</div>
   <div class="introk jp" style="font-size:64px">${practice?"✍":row.k.map(x=>x[0]).join("")}</div>
   <div class="gain"><span class="res">${I.coin}+${coins}</span>${practice?"":`<span class="res" style="color:var(--cyan)">XP +30</span>`}</div>
   <div class="muted">${practice?"Continue comme ça.":"Ces kana entrent dans tes matchs. Maîtrise-les tous pour débloquer la ligne suivante."}</div>
   <div style="display:flex;gap:10px;width:100%;max-width:340px"><button class="btn grey" style="flex:1" data-a="home">Accueil</button><button class="btn gold" style="flex:1.4" data-a="kplay">JOUER</button></div></div>`}
function writePractice(){const p=pool();if(!p.length)return;const w=p.map(([c])=>1+(5-mastery(c))+(S.kana[c]&&S.kana[c].ko||0));const list=[];const used=new Set();
  for(let n=0;n<Math.min(3,p.length);n++){let r=Math.random()*w.reduce((a,b,i)=>a+(used.has(i)?0:b),0);for(let i=0;i<p.length;i++){if(used.has(i))continue;r-=w[i];if(r<=0){used.add(i);list.push(p[i]);break}}}
  L={row:{name:"écriture",k:list},list,i:0,step:"trace",fails:0,practice:true};lessonStep()}
function collView(){const ids=new Set(S.learned);openLayer("Collection",`<p class="muted" style="margin:0">Chaque bonne réponse et chaque kana bien écrit fait progresser la carte. ${READY} barres = prêt pour la ligne suivante, 5 = maîtrisé.</p>
  ${ROWS.map(r=>`<div class="sect">${esc(r.name)}${ids.has(r.id)?"":" · pas encore appris"}</div><div class="grid5">${r.k.map(([c,R])=>{const m=mastery(c);return`<div class="kc ${ids.has(r.id)?"":"lock"}"><b class="jp">${ids.has(r.id)?c:"?"}</b><span>${ids.has(r.id)?R:""}</span><div class="st"><i style="width:${m*20}%"></i></div></div>`}).join("")}</div>`).join("")}`)}

/* ---------- le match ---------- */
let M=null,raf=0;
function startMatch(){if(!pool().length)return startLesson(nextRow());const bo=S.boosts;const heart=!!bo.heart,slow=!!bo.slow,shield=!!bo.shield;delete bo.heart;delete bo.slow;delete bo.shield;save();
  const diff=1+Math.min(0.9,S.tr.kana/500);const H0=heart?4:3;
  M={total:16,spawned:0,cleared:0,hearts:H0,maxH:H0,shield,combo:0,best:0,ok:0,ko:0,items:[],next:0.6,speed:(slow?0.75:1)*diff,phase:"kana",target:null,opts:[],paused:false,last:0,id:0};
  const b=SHOP.bubbles[S.bubble]||SHOP.bubbles.classic;
  $("#app").insertAdjacentHTML("beforeend",`<div id="game" style="--bub:${b.css};--bubink:${b.ink}"><div class="hud"><button class="quit" data-a="kquit" aria-label="Abandonner">✕</button><div class="hearts" id="hearts"></div><div class="prog"><i id="pg" style="width:0"></i><span id="pgt"></span></div></div>
   <div class="arena" id="arena"><div class="ground"></div><div class="combo" id="combo"></div><div class="flash" id="flash"></div></div><div class="answers" id="answers"></div></div>`);
  hud();banner("PRÊT ?");M.last=performance.now();raf=requestAnimationFrame(loop)}
function hud(){$("#hearts").innerHTML=Array.from({length:M.maxH},(_,i)=>I.heart.replace("<svg",`<svg class="${i<M.hearts?"":"off"}"`)).join("")+(M.shield?I.shield:"");
  const p=M.phase==="boss"?100:Math.round(M.cleared/M.total*100);$("#pg").style.width=p+"%";$("#pgt").textContent=M.phase==="boss"?"BOSS !":M.cleared+" / "+M.total;$("#combo").textContent=M.combo>=3?"x"+M.combo:""}
function banner(t){const a=$("#arena");if(!a)return;const b=document.createElement("div");b.className="banner";b.textContent=t;a.appendChild(b);setTimeout(()=>b.remove(),1300)}
function spawn(){const a=$("#arena");const lanes=[0,1,2,3].filter(l=>!M.items.some(it=>!it.dead&&it.lane===l&&it.y<100));if(!lanes.length)return;
  const lane=pick(lanes);const[c,R]=weightedKana(M.items.filter(x=>!x.dead).map(x=>x.c));const el=document.createElement("div");el.className="fk";el.style.left=(lane*25)+"%";el.innerHTML=`<div class="bub jp">${c}</div>`;a.appendChild(el);
  M.items.push({id:++M.id,c,R,lane,y:-70,el});M.spawned++}
function spawnBoss(){const ws=wordsFor(new Set(pool().map(x=>x[0])));const w=ws.length?pick(ws):null;let c,R,mean="";if(w)[c,R,mean]=w;else[c,R]=weightedKana([]);
  const el=document.createElement("div");el.className="fk boss";el.innerHTML=`<div class="bub jp">${c}</div>`;$("#arena").appendChild(el);M.boss={c,R,mean};M.items.push({id:++M.id,c,R,lane:-1,y:-90,el,boss:true,mean});banner("BOSS !")}
const arenaH=()=>{const a=$("#arena");return a?a.clientHeight:500};
function loop(now){if(!M)return;const dt=Math.min(0.05,(now-M.last)/1000);M.last=now;
  if(!M.paused){const H=arenaH();const prog=M.cleared/M.total;
    if(M.phase==="kana"){M.next-=dt;const interval=Math.max(1.0,2.1-prog*0.6-(M.speed-1)*0.5);if(M.next<=0&&M.spawned<M.total&&M.items.filter(x=>!x.dead).length<3){spawn();M.next=interval}}
    const v=H/8.6*M.speed*(1+prog*0.35);
    M.items.forEach(it=>{if(it.dead)return;it.y+=(it.boss?v*0.5:v)*dt;it.el.style.transform=`translateY(${it.y}px)`;if(it.y>H-74)miss(it)});
    M.items=M.items.filter(x=>!x.gone);retarget()}
  raf=requestAnimationFrame(loop)}
function retarget(){const t=M.items.filter(x=>!x.dead).sort((a,b)=>b.y-a.y)[0]||null;if(t!==M.target){if(M.target&&M.target.el)M.target.el.classList.remove("target");M.target=t;if(t){t.el.classList.add("target");options(t)}else $("#answers").innerHTML=""}}
function options(t){const correct=t.R;let others;
  if(t.boss&&t.mean){others=shuffle(WORDS.filter(w=>w[1]!==correct).map(w=>w[1])).slice(0,3)}
  else{const p=pool().map(x=>x[1]).filter((r,i,a)=>r!==correct&&a.indexOf(r)===i);const near=p.filter(r=>r.slice(-1)===correct.slice(-1)||r[0]===correct[0]);others=shuffle(near).slice(0,3);if(others.length<3)others=others.concat(shuffle(p.filter(r=>!others.includes(r))).slice(0,3-others.length))}
  M.opts=shuffle([correct,...others]);$("#answers").innerHTML=M.opts.map((r,i)=>`<button class="ans" data-a="kans" data-i="${i}">${r}</button>`).join("")}
function answer(i,btn){const t=M.target;if(!t||t.dead)return;
  if(M.opts[i]===t.R){btn.classList.add("ok");M.combo++;M.best=Math.max(M.best,M.combo);M.ok++;quest("kana",1);
    if(t.boss)[...t.c].forEach(ch=>{if(READ[ch])K(ch).ok++});else K(t.c).ok++;
    t.dead=true;t.el.classList.remove("target");t.el.classList.add("pop");boom(t,t.boss?"BOSS K.O. !":M.combo>=5?"COMBO x"+M.combo:"+"+(10+M.combo));setTimeout(()=>{t.el.remove();t.gone=true},280);
    if(t.boss){M.bossDone=true;return setTimeout(()=>endMatch(true),700)}
    M.cleared++;if(M.cleared>=M.total&&M.phase==="kana"){M.phase="boss";setTimeout(()=>{if(M&&!M.over)spawnBoss()},500)}
    const c=$("#combo");c.classList.remove("bump");void c.offsetWidth;c.classList.add("bump")}
  else{btn.classList.add("ko");M.combo=0;M.ko++;if(!t.boss)K(t.c).ko++;
    if(!t.el.querySelector(".hint")){const h=document.createElement("div");h.className="hint";h.textContent=t.R;t.el.querySelector(".bub").appendChild(h)}
    const ok=$("#answers").querySelectorAll(".ans")[M.opts.indexOf(t.R)];if(ok)ok.classList.add("ok");setTimeout(()=>{if(btn.isConnected)btn.classList.remove("ko")},350)}
  hud()}
function miss(it){it.dead=true;it.el.remove();it.gone=true;M.combo=0;if(!it.boss)K(it.c).ko++;
  if(M.shield){M.shield=false;banner("BOUCLIER !")}else{M.hearts--;const f=$("#flash");f.classList.remove("on");void f.offsetWidth;f.classList.add("on")}
  if(M.hearts<=0)return endMatch(false);
  if(it.boss)setTimeout(()=>{if(M&&!M.over)spawnBoss()},400);else if(M.phase==="kana")M.spawned--;
  hud()}
function boom(t,txt){const b=document.createElement("div");b.className="boom";b.textContent=txt;b.style.left=(t.boss?40:t.lane*25+4)+"%";b.style.top=Math.max(0,t.y)+"px";$("#arena").appendChild(b);setTimeout(()=>b.remove(),700)}
function endMatch(win){if(!M||M.over)return;M.over=true;cancelAnimationFrame(raf);const total=M.ok+M.ko,acc=total?M.ok/total:0;
  quest("combo",M.best,"max");const perf=Math.min(1,acc*0.7+Math.min(1,M.best/15)*0.3);const r=reward("kana",win,perf);const stars=acc>=0.95?3:acc>=0.8?2:1;
  const missed=[...new Set(M.items.filter(x=>x.el&&x.el.querySelector&&x.el.querySelector(".hint")).map(x=>x.c))];const weak=pool().filter(([c])=>S.kana[c]&&S.kana[c].ko>0).sort((a,b)=>S.kana[b[0]].ko-S.kana[a[0]].ko).slice(0,4);
  const body=`<div class="muted">${win?`Précision ${Math.round(acc*100)} % · meilleur combo ${M.best}`:`${M.cleared} kana lus sur ${M.total}${M.phase==="boss"?" · le boss t'a eu":""}`}${win&&M.boss&&M.boss.mean?`<br>Boss : <b class="jp" style="color:#fff">${esc(M.boss.c)}</b> = ${esc(M.boss.R)} (${esc(M.boss.mean)})`:""}</div>
   ${weak.length?`<div class="muted">À revoir : ${weak.map(([c,R])=>`<b class="jp" style="color:#fff;font-size:20px">${c}</b> ${R}`).join(" · ")}</div>`:""}
   ${lessonOpen()?`<div class="card" style="max-width:340px;width:100%"><div class="rw">${I.pen}</div><div class="grow"><b>Nouvelle leçon disponible !</b><small>Ligne ${esc(nextRow().name)}</small></div></div>`:""}`;
  $("#game").innerHTML=resultsHTML(win,r,stars,body,"kplay");void missed;M=null}
Object.assign(ACT,{
 lesson:()=>{const n=nextRow();if(n&&lessonOpen())startLesson(n)},
 lnext:()=>lessonAdvance(),wok:()=>lessonAdvance(),
 lskip:()=>{L.fails=0;if(L.step==="trace"){L.step="free"}else{L.i++;L.step="see";if(L.i>=L.list.length){if(L.practice)return lessonDone(true);L.step="quiz"}}lessonStep()},
 wclear:()=>clearPad(),wcheck:()=>checkWriting(),wretry:()=>{lessonStep()},wmodel:()=>{L.step="trace";lessonStep()},
 lqa:el=>lessonQuizAnswer(+el.dataset.i,el),
 writepr:()=>writePractice(),coll:()=>collView(),
 kplay:()=>{const g=$("#game");if(g)g.remove();closeLayer();if(!S.learned.length)return startLesson(nextRow());startMatch()},
 kans:el=>{if(M)answer(+el.dataset.i,el)},
 kquit:()=>{if(!M||M.over)return;if(M.quitAsk)return endMatch(false);M.quitAsk=true;M.paused=true;banner("Encore ✕ pour abandonner");setTimeout(()=>{if(M){M.quitAsk=false;M.paused=false;M.last=performance.now()}},1600)}
});
document.addEventListener("visibilitychange",()=>{if(!M)return;if(document.hidden)M.paused=true;else{M.paused=false;M.last=performance.now()}});
