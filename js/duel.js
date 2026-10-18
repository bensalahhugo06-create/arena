/* Duels de questions contre un bot (anglais et montage). Le premier à 5 points gagne. Le bot devient plus rapide
   et plus précis quand tes trophées montent ; les niveaux de questions se débloquent avec les trophées. */
"use strict";
const BOTS=[["Max","#ff7a18"],["Lucy","#c86bff"],["Ben","#21b356"],["Emma","#ff4fa3"],["Sam","#3fd6ff"]];
const card2=c=>["Bonne idée ? "+c[0],["Bonne idée","Mauvaise idée"],c[1]?0:1,c[2]];
const MTT=[{min:0,name:"Bases et bons réflexes",q:MTQ_LESSONS[1].concat(CUTCARDS.slice(0,15).map(card2))},
 {min:60,name:"Décisions de monteur",q:MTQ_LESSONS[2].concat(CUTCARDS.slice(15).map(card2))},
 {min:160,name:"Pro, After Effects et raccourcis",q:MTQ_LESSONS[3].concat(SHORTCUTS)}];
const DK={en:{tiers:EN,tr:"duel",st:"en",quest:"duel",play:"dplay",title:"WORD DUEL"},mt:{tiers:MTT,tr:"cut",st:"mtq",quest:"mtduel",play:"mplay",title:"CUT DUEL"}};
const tierOf=k=>{let t=0;DK[k].tiers.forEach((x,i)=>{if(S.tr[DK[k].tr]>=x.min)t=i});return t};
function duelInfo(k){const d=DK[k],T=d.tiers,t=tierOf(k),nx=T[t+1],tr=S.tr[d.tr];
  const hero=`<div class="kinfo"><div class="muted">Niveau : <b style="color:#fff">${esc(T[t].name)}</b></div>${nx?`<div class="road-mini"><div class="lab"><span>Prochain : ${esc(nx.name)}</span><span>${tr} / ${nx.min}</span></div><div class="bar"><i style="width:${Math.round((tr-T[t].min)/(nx.min-T[t].min)*100)}%"></i></div></div>`:""}</div>`;
  return{hero,play:`<button class="play" data-a="${d.play}">DUEL !<small>Premier à 5 points · environ 2 min</small></button>`}}
const duelHomeInfo=()=>duelInfo("en"),cutHomeInfo=()=>duelInfo("mt");
function duelPick(k,used){const d=DK[k],t=tierOf(k),st=S[d.st]||(S[d.st]={});const items=[];
  d.tiers.forEach((tier,ti)=>{if(ti>t)return;tier.q.forEach((q,qi)=>{const key=ti+":"+qi;if(used.has(key))return;const s=st[key]||{ok:0,ko:0};items.push({key,q,w:(ti===t?3:1)*(1+s.ko*2/(1+s.ok*0.3))*(s.ok>=4&&!s.ko?0.4:1)})})});
  let r=Math.random()*items.reduce((a,b)=>a+b.w,0);for(const it of items){r-=it.w;if(r<=0)return it}return items[items.length-1]}
let D=null;
function startDuel(k){const g=$("#game");if(g)g.remove();closeLayer();const[bn,bc]=pick(BOTS);const tr=S.tr[DK[k].tr];
  D={k,me:0,bot:0,goal:5,bn,bc,botMean:Math.max(2.6,6-tr/70),botAcc:Math.min(0.88,0.6+tr/500),used:new Set(),errs:[],ok:0,ko:0,round:0,lock:false,timer:0,over:false};
  $("#app").insertAdjacentHTML("beforeend",`<div id="game"><div class="hud"><button class="quit" data-a="dquit" aria-label="Abandonner">✕</button><div class="vs"><span class="pl"><span class="ava sm" style="background:${(SHOP.avas[S.ava]||{}).col||"#ff7a18"}">${S.ava}</span><b id="dme">0</b></span><span class="g">VS</span><span class="pl"><b id="dbot">0</b><span class="ava sm" style="background:${bc}">${bn[0]}</span></span></div></div>
   <div class="duel"><div class="botbar"><span id="bname">${esc(bn)} réfléchit…</span><div class="pbar"><i id="bprog" style="width:0"></i></div></div><div class="qcard" id="qcard"></div><div class="dfb" id="dfb" role="status"></div></div><div class="answers single" id="danswers"></div></div>`);
  setTimeout(nextQ,500)}
function nextQ(){if(!D||D.over)return;if(D.me>=D.goal||D.bot>=D.goal)return endDuel();D.round++;D.lock=false;const it=duelPick(D.k,D.used);D.used.add(it.key);D.cur=it;
  const n=it.q[1].length;const ord=n===2?[0,1]:shuffle([...Array(n).keys()]);D.opts=ord.map(i=>it.q[1][i]);D.ans=ord.indexOf(it.q[2]);
  $("#bname").textContent=D.bn+" réfléchit…";$("#qcard").innerHTML=`<div class="muted">Question ${D.round}</div><div class="qtxt ${it.q[0].length>70?"long":""}">${esc(it.q[0])}</div>`;$("#dfb").innerHTML="";
  $("#danswers").className="answers "+(n===2?"two":"single");$("#danswers").innerHTML=D.opts.map((o,i)=>`<button class="ans small" data-a="dans" data-i="${i}">${esc(o)}</button>`).join("");
  const t=Math.max(1.6,D.botMean+(it.q[0].length/60)+(Math.random()-0.5)*2.2);D.t0=performance.now();D.tBot=t*1000;D.botRight=Math.random()<D.botAcc;
  cancelAnimationFrame(D.timer);const tick=now=>{if(!D||D.over||D.lock)return;if(D.paused){D.t0+=16;D.timer=requestAnimationFrame(tick);return}const p=Math.min(1,(now-D.t0)/D.tBot);const b=$("#bprog");if(b)b.style.width=Math.round(p*100)+"%";if(p>=1)return botAnswers();D.timer=requestAnimationFrame(tick)};D.timer=requestAnimationFrame(tick)}
function show(c,w){const bs=document.querySelectorAll("#danswers .ans");bs.forEach(b=>b.disabled=true);if(bs[c])bs[c].classList.add("ok");if(w!=null&&bs[w])bs[w].classList.add("ko")}
function stat(ok){const st=S[DK[D.k].st]||(S[DK[D.k].st]={});const s=st[D.cur.key]||(st[D.cur.key]={ok:0,ko:0});if(ok)s.ok++;else s.ko++}
const expl=q=>q[3]?esc(q[3]):"Réponse : "+esc(q[1][q[2]]);
function duelAnswer(i){if(!D||D.lock)return;D.lock=true;cancelAnimationFrame(D.timer);const q=D.cur.q;
  if(i===D.ans){D.me++;D.ok++;stat(true);show(D.ans);$("#dfb").innerHTML=`<b style="color:var(--green)">Point pour toi !</b>`;bump("#dme");setTimeout(nextQ,900)}
  else{D.bot++;D.ko++;stat(false);D.errs.push(q);show(D.ans,i);$("#dfb").innerHTML=`<b style="color:var(--red)">Raté, point pour ${esc(D.bn)}.</b> ${expl(q)}`;bump("#dbot");setTimeout(nextQ,2600)}
  save();upd()}
function botAnswers(){if(!D||D.lock)return;
  if(D.botRight){D.lock=true;D.bot++;D.errs.push(D.cur.q);show(D.ans);$("#dfb").innerHTML=`<b style="color:var(--red)">${esc(D.bn)} a été plus rapide.</b> ${expl(D.cur.q)}`;bump("#dbot");upd();setTimeout(nextQ,2400)}
  else{$("#bname").textContent=D.bn+" s'est trompé ! À toi.";const b=$("#bprog");if(b)b.style.width="100%"}}
function upd(){$("#dme").textContent=D.me;$("#dbot").textContent=D.bot}
function bump(s){const e=$(s);if(!e)return;e.classList.remove("bump");void e.offsetWidth;e.classList.add("bump")}
function endDuel(){if(!D||D.over)return;D.over=true;cancelAnimationFrame(D.timer);const k=D.k,win=D.me>D.bot;const acc=D.ok/Math.max(1,D.ok+D.ko);
  if(win)quest(DK[k].quest,1);const r=reward(DK[k].tr,win,Math.min(1,acc*0.6+Math.max(0,D.me-D.bot)/D.goal*0.4));const stars=D.bot===0?3:D.bot<=2?2:1;
  const seen=new Set();const errs=D.errs.filter(q=>!seen.has(q[0])&&seen.add(q[0]));
  const body=`<div class="muted">${D.me} – ${D.bot} contre ${esc(D.bn)} · précision ${Math.round(acc*100)} %</div>
   ${errs.length?`<div class="review"><div class="sect" style="margin:0">À retenir</div>${errs.slice(0,5).map(q=>`<div class="card"><div class="grow"><small>${esc(q[0])}</small><b>${esc(q[1][q[2]])}</b>${q[3]?`<small>${esc(q[3])}</small>`:""}</div></div>`).join("")}</div>`:""}`;
  $("#game").innerHTML=resultsHTML(win,r,stars,body,DK[k].play);D=null}
Object.assign(ACT,{dplay:()=>startDuel("en"),mplay:()=>startDuel("mt"),dans:el=>duelAnswer(+el.dataset.i),
 dquit:()=>{if(!D||D.over)return;if(D.quitAsk){D.bot=D.goal;return endDuel()}D.quitAsk=true;$("#dfb").innerHTML="Touche encore ✕ pour abandonner.";setTimeout(()=>{if(D)D.quitAsk=false},1800)}});
document.addEventListener("visibilitychange",()=>{if(D)D.paused=document.hidden});
