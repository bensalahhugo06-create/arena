/* Suivi du temps : chrono (démarrer, pause, reprendre, arrêter), ajout et correction manuels, historique,
   statistiques, objectifs. Une même période n'est jamais comptée deux fois. Les parties des jeux sont comptées
   automatiquement (Kana Rush → japonais, Word Duel → anglais, Cut Duel → montage). État : S.tm */
"use strict";
const ACTS=["mt","en","jp"],ACTN={mt:"Montage",en:"Anglais",jp:"Japonais"},ACTC={mt:"#ffb347",en:"#7c96ff",jp:"#ff6fae"};
const MIN=6e4,HOUR=36e5,DAY=864e5;
const TM=()=>S.tm||(S.tm={timer:null,sessions:[],goals:{mt:{day:30,week:180},en:{day:20,week:120},jp:{day:20,week:120}}});
const segsDur=s=>s.reduce((a,[x,y])=>a+Math.max(0,y-x),0);
const timer=()=>{const t=TM().timer;return t&&t.act&&t.segs&&t.segs.length?t:null};
const running=()=>{const t=timer();return!!(t&&t.segs[t.segs.length-1][1]==null)};
const tSegs=(now=Date.now())=>{const t=timer();return t?t.segs.map(([a,b])=>[a,b==null?now:b]):[]};
const elapsed=()=>segsDur(tSegs());
const fDur=(ms,short)=>{const m=Math.round(Math.max(0,ms)/MIN);if(m<60)return m+" min";const h=Math.floor(m/60),r=m%60;return short?h+"h"+(r?p2(r):""):h+" h "+p2(r)};
const fClock=ms=>{const s=Math.floor(Math.max(0,ms)/1000),h=Math.floor(s/3600);return(h?h+":"+p2(Math.floor(s/60)%60):Math.floor(s/60))+":"+p2(s%60)};
const hm=ms=>{const d=new Date(ms);return p2(d.getHours())+"h"+p2(d.getMinutes())};
function subtract(segs,others){let res=segs.map(s=>s.slice());others.forEach(([a,b])=>{const nx=[];res.forEach(([x,y])=>{if(b<=x||a>=y){nx.push([x,y]);return}if(a>x)nx.push([x,a]);if(b<y)nx.push([b,y])});res=nx});return res.filter(([x,y])=>y-x>=1000)}
function otherSegs(ex,withTimer=true){const o=[];TM().sessions.forEach(s=>{if(s.id!==ex)s.segs.forEach(x=>o.push(x))});const t=timer();if(withTimer&&t&&t.id!==ex)tSegs().forEach(x=>o.push(x));return o}
function overlaps(segs,ex){const hits=TM().sessions.filter(s=>s.id!==ex&&s.segs.some(([a,b])=>segs.some(([x,y])=>a<y&&x<b)));const t=timer();if(t&&tSegs().some(([a,b])=>segs.some(([x,y])=>a<y&&x<b)))hits.push({act:t.act,segs:tSegs(),live:true});return hits}
function tStart(act){const t=timer(),now=Date.now();if(t&&t.act===act){if(!running())t.segs.push([now,null]);save();return}if(t)tStop(true);TM().timer={act,id:"t"+pid(),segs:[[now,null]]};save()}
function tPause(){if(running()){const t=timer();t.segs[t.segs.length-1][1]=Date.now();save()}}
function tStop(silent,endAt){const t0=timer();if(!t0)return 0;const t=JSON.parse(JSON.stringify(t0)),end=endAt||Date.now();
  const segs=t.segs.map(([a,b])=>[Math.min(a,end),Math.min(b==null?end:b,end)]).filter(([a,b])=>b>a);const clean=subtract(segs,otherSegs(t.id,false));TM().timer=null;
  const d=segsDur(clean);if(d>=30e3)TM().sessions.push({id:t.id,act:t.act,segs:clean,src:"chrono"});save();return d}
/* temps d'une partie de jeu : compté, sauf si le chrono de la même matière tourne déjà */
function logPlay(act,t0){if(!t0)return;const t=timer();if(t&&t.act===act&&running())return;const segs=subtract([[t0,Date.now()]],otherSegs(null));if(segsDur(segs)>=30e3){TM().sessions.push({id:"g"+pid(),act,segs,src:"jeu"});save()}}
{const base=reward;reward=function(mode,win,perf){const act=mode==="kana"?"jp":mode==="duel"?"en":"mt";logPlay(act,S._t0);S._t0=null;return base(mode,win,perf)}}
document.addEventListener("click",e=>{const el=e.target.closest("[data-a]");if(el&&["kplay","dplay","mplay"].includes(el.dataset.a))S._t0=Date.now()},true);

/* ---------- totaux ---------- */
function dayTotals(){const days={};const add=(act,a,b)=>{while(a<b){const k=kOf(new Date(a));const e=Math.min(b,kD(addD(k,1)).getTime());const o=days[k]||(days[k]={mt:0,en:0,jp:0});o[act]+=e-a;a=e}};
  TM().sessions.forEach(s=>{if(ACTS.includes(s.act))s.segs.forEach(([a,b])=>add(s.act,a,b))});const t=timer();if(t)tSegs().forEach(([a,b])=>add(t.act,a,b));return days}
function sumR(days,f,t){const o={mt:0,en:0,jp:0};for(const k in days)if(k>=f&&k<t)ACTS.forEach(a=>o[a]+=days[k][a]||0);o.all=o.mt+o.en+o.jp;return o}
function periods(days){const t=tk(),ws=weekStart(t),m1=t.slice(0,8)+"01",d=kD(m1);d.setMonth(d.getMonth()+1);return{today:sumR(days,t,addD(t,1)),week:sumR(days,ws,addD(ws,7)),month:sumR(days,m1,kOf(d)),total:sumR(days,"0","9")}}
const todayOf=act=>(dayTotals()[tk()]||{})[act]||0;

/* ---------- vues ---------- */
let tmMode="chrono",chMode="days",histN=30;
const gbar=(v,g)=>{const p=g?Math.min(100,Math.round(v/(g*MIN)*100)):0;return`<div class="pbar"><i style="width:${p}%"></i></div>`};
function forgotten(){const t=timer();if(!t||!running()||elapsed()<4*HOUR)return"";return`<div class="card warncard"><div class="grow"><b>Le chrono ${ACTN[t.act].toLowerCase()} tourne depuis ${fDur(elapsed())}.</b><small>Tu as peut-être oublié de l'arrêter.</small></div><button class="btn sm" data-a="tfix">Corriger</button></div>`}
function trackerMini(){const t=timer(),G=TM().goals;return`${forgotten()}<div class="mini3">${ACTS.map(a=>{const on=t&&t.act===a,run=on&&running();return`<div class="mini ${on?"on":""}" style="--ac:${ACTC[a]}"><button class="mmain" data-a="${run?"tpause":"tstart"}" data-act="${a}"><span class="mic">${run?"❚❚":"▶"}</span><b>${ACTN[a]}</b><small>${on?`<span class="live-clock">${fClock(elapsed())}</span>`:fDur(todayOf(a),true)+" / "+fDur((G[a]||{}).day*MIN,true)}</small></button>${on?`<button class="mstop" data-a="tstop">■ Arrêter</button>`:""}</div>`}).join("")}</div>`}
function vTime(){return`<div class="ptitle"><b class="g">Temps</b><span>${fDur(periods(dayTotals()).today.all)} aujourd'hui</span></div>
  <div class="seg3">${[["chrono","Chrono"],["hist","Historique"],["stats","Stats"]].map(([k,l])=>`<button data-a="tmode" data-m="${k}" class="${tmMode===k?"on":""}">${l}</button>`).join("")}</div>
  ${tmMode==="chrono"?vChrono():tmMode==="hist"?vHist():vStats()}`}
function vChrono(){const t=timer(),G=TM().goals;const tdy=TM().sessions.filter(s=>kOf(new Date(s.segs[0][0]))===tk()).sort((a,b)=>b.segs[0][0]-a.segs[0][0]);
  return`${forgotten()}${ACTS.map(a=>{const on=t&&t.act===a,run=on&&running();return`<div class="card actc ${on?"on":""}" style="--ac:${ACTC[a]}"><div class="grow"><b>${ACTN[a]}</b>${on?`<div class="bigclock live-clock">${fClock(elapsed())}</div><small>${run?"En cours":"En pause"} · aujourd'hui ${fDur(todayOf(a))}</small>`:`<div class="bigclock">${fDur(todayOf(a))}</div><small>aujourd'hui · objectif ${fDur((G[a]||{}).day*MIN)}</small>`}${gbar(todayOf(a),(G[a]||{}).day)}
   <div class="row2" style="margin-top:8px">${on?`<button class="btn gold" data-a="${run?"tpause":"tstart"}" data-act="${a}">${run?"Pause":"Reprendre"}</button><button class="btn grey" data-a="tstop">Arrêter</button>`:`<button class="btn gold" data-a="tstart" data-act="${a}">Démarrer</button>`}</div></div></div>`}).join("")}
  <button class="btn" data-a="snew">Ajouter du temps oublié</button>
  <div class="sect">Sessions d'aujourd'hui</div><div class="plist">${tdy.map(sRow).join("")||`<div class="pempty">Aucune session terminée aujourd'hui.</div>`}</div>`}
function sRow(s){const a=s.segs[0][0],b=s.segs[s.segs.length-1][1];return`<button class="prow" data-a="sedit" data-id="${s.id}"><span class="dotc" style="background:${ACTC[s.act]}"></span><div class="grow"><b>${ACTN[s.act]||s.act}</b><small>${hm(a)} – ${hm(b)} · ${s.src==="manuel"?"ajout manuel":s.src==="jeu"?"partie de jeu":s.src==="quiz"?"révision":"chrono"}${s.edited?" · corrigée":""}</small></div><b>${fDur(segsDur(s.segs))}</b></button>`}
function vHist(){const from=addD(tk(),-histN+1);const by={};TM().sessions.forEach(s=>{const k=kOf(new Date(s.segs[0][0]));if(k>=from)(by[k]=by[k]||[]).push(s)});const ks=Object.keys(by).sort().reverse();
  return`<button class="btn" data-a="snew">Ajouter du temps oublié</button><div class="plist">${ks.map(k=>`<div class="dh"><span>${k===tk()?"Aujourd'hui":fDay(k)}</span><span>${fDur(by[k].reduce((x,s)=>x+segsDur(s.segs),0))}</span></div>${by[k].sort((a,b)=>b.segs[0][0]-a.segs[0][0]).map(sRow).join("")}`).join("")||`<div class="pempty">Pas encore de session.</div>`}</div>
  ${TM().sessions.some(s=>kOf(new Date(s.segs[0][0]))<from)?`<button class="btn grey" data-a="smore">30 jours de plus</button>`:""}`}
let bars=[];
function buckets(days){const t=tk(),out=[];if(chMode==="days"){for(let i=13;i>=0;i--){const k=addD(t,-i);out.push({lab:String(kD(k).getDate()),full:fDay(k),v:sumR(days,k,addD(k,1))})}}
  else if(chMode==="weeks"){const ws=weekStart(t);for(let i=11;i>=0;i--){const k=addD(ws,-7*i);out.push({lab:kD(k).getDate()+"/"+(kD(k).getMonth()+1),full:"Semaine du "+fDay(k),v:sumR(days,k,addD(k,7))})}}
  else{const d=kD(t.slice(0,8)+"01");for(let i=11;i>=0;i--){const a=new Date(d.getFullYear(),d.getMonth()-i,1),b=new Date(d.getFullYear(),d.getMonth()-i+1,1);out.push({lab:MSC[a.getMonth()],full:MS[a.getMonth()]+" "+a.getFullYear(),v:sumR(days,kOf(a),kOf(b))})}}return out}
function chart(bs){const W=340,H=180,L=36,R=4,T=8,B=22,iw=W-L-R,ih=H-T-B;const mx=Math.max(30,...bs.map(b=>b.v.all/MIN));const st=[15,30,60,120,180,300,600,1200,3000].find(s=>mx/s<=4)||6000;const top=Math.ceil(mx/st)*st;const y=v=>T+ih-v/top*ih;const bw=iw/bs.length,w=Math.min(20,bw*0.62);
  let g="";for(let v=0;v<=top;v+=st)g+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,.12)"/><text x="${L-5}" y="${y(v)+4}" fill="#b8c5ff" font-size="10" text-anchor="end">${v?fDur(v*MIN,true):"0"}</text>`;
  bs.forEach((b,i)=>{const cx=L+bw*i+bw/2;let base=T+ih;ACTS.forEach(a=>{if(!b.v[a])return;const h=b.v[a]/MIN/top*ih;g+=`<rect x="${cx-w/2}" y="${base-h}" width="${w}" height="${Math.max(0,h-1.5)}" rx="2" fill="${ACTC[a]}" stroke="#0b0f24" stroke-width="1"/>`;base-=h});
    g+=`<text x="${cx}" y="${H-6}" fill="#b8c5ff" font-size="10" text-anchor="middle">${b.lab}</text><rect x="${L+bw*i}" y="${T}" width="${bw}" height="${ih+B}" fill="transparent" data-bar="${i}"/>`});
  return`<svg viewBox="0 0 ${W} ${H}" class="chart">${g}</svg>`}
const binfo=i=>{const b=bars[i];return b?`<b>${b.full}</b> · ${fDur(b.v.all)}<br>${ACTS.map(a=>`<span style="color:${ACTC[a]}">●</span> ${ACTN[a]} ${fDur(b.v[a])}`).join(" · ")}`:""};
function vStats(){const days=dayTotals(),P=periods(days),G=TM().goals,t=tk();const first=Object.keys(days).filter(k=>ACTS.some(a=>days[k][a]>0)).sort()[0];const since=first?Math.round((kD(t)-kD(first))/DAY)+1:0;const l30=sumR(days,addD(t,-29),addD(t,1));bars=buckets(days);
  const tile=(l,o)=>`<div class="card stt"><small>${l}</small><b>${fDur(o.all)}</b><div class="stb">${ACTS.map(a=>o.all?`<i style="flex:${o[a]};background:${ACTC[a]}"></i>`:"").join("")}</div></div>`;
  return`<div class="g4">${tile("Aujourd'hui",P.today)}${tile("Semaine",P.week)}${tile("Mois",P.month)}${tile("Total",P.total)}</div>
  <div class="sect sh">Objectifs<button class="btn sm" data-a="goals">Modifier</button></div><div class="plist">${ACTS.map(a=>`<div class="prow"><span class="dotc" style="background:${ACTC[a]}"></span><div class="grow"><b>${ACTN[a]}</b><small>Jour ${fDur(P.today[a],true)} / ${fDur(G[a].day*MIN,true)}</small>${gbar(P.today[a],G[a].day)}<small>Semaine ${fDur(P.week[a],true)} / ${fDur(G[a].week*MIN,true)}</small>${gbar(P.week[a],G[a].week)}</div></div>`).join("")}</div>
  <div class="sect">Évolution</div><div class="seg3">${[["days","14 jours"],["weeks","12 sem."],["months","12 mois"]].map(([k,l])=>`<button data-a="cmode2" data-m="${k}" class="${chMode===k?"on":""}">${l}</button>`).join("")}</div>
  <div class="card col">${chart(bars)}<div class="mut" id="binfo">${binfo(bars.length-1)}</div></div>
  <div class="sect">Moyenne par jour</div><div class="plist">${ACTS.map(a=>`<div class="prow"><span class="dotc" style="background:${ACTC[a]}"></span><div class="grow"><b>${ACTN[a]}</b><small>30 derniers jours : ${fDur(l30[a]/Math.max(1,Math.min(30,since)))} · depuis le début : ${since?fDur(P.total[a]/since):"–"} · total ${fDur(P.total[a])}</small></div></div>`).join("")}</div>`}

/* ---------- feuilles ---------- */
function sessSheet(id){const s=id?TM().sessions.find(x=>x.id===id):null;const st=s?s.segs[0][0]:Date.now()-30*MIN,dur=s?Math.round(segsDur(s.segs)/MIN):30,a=s?s.act:"mt";const d=new Date(st);
  pSheet(s?"Corriger la session":"Ajouter du temps",`<form class="card pform" data-f="sess" data-id="${id||""}"><div class="row3">${ACTS.map(x=>`<label class="radio2"><input type="radio" name="act" value="${x}" ${x===a?"checked":""}><span style="--ac:${ACTC[x]}">${ACTN[x]}</span></label>`).join("")}</div>
   <label>Date<input type="date" name="date" id="s-date" value="${kOf(d)}" max="${tk()}"></label><label>Début<input type="time" name="time" id="s-time" value="${p2(d.getHours())}:${p2(d.getMinutes())}"></label><label>Durée (minutes)<input type="number" name="dur" id="s-dur" value="${dur}" min="1" max="960"></label>
   <p class="mut" id="s-err"></p><button class="btn gold">${s?"Enregistrer":"Ajouter"}</button></form>${s?`<button class="btn" style="background:var(--red)" data-a="sdel" data-id="${id}">Supprimer cette session</button>`:""}`)}
function goalsSheet(){const G=TM().goals;pSheet("Mes objectifs",`<p class="mut">En minutes. Des repères, pas des obligations.</p>${ACTS.map(a=>`<div class="card pform"><b>${ACTN[a]}</b><label>Par jour<input type="number" data-goal="${a}" data-k="day" value="${G[a].day}" min="0" max="600"></label><label>Par semaine<input type="number" data-goal="${a}" data-k="week" value="${G[a].week}" min="0" max="4000"></label></div>`).join("")}`)}
function fixSheet(){const t=timer();if(!t)return;const st=new Date(t.segs[0][0]),e=new Date(Math.min(Date.now(),t.segs[0][0]+HOUR));pSheet("Arrêter le chrono à…",`<p class="mut">Démarré ${fDay(kOf(st))} à ${hm(st)}.</p><form class="card pform" data-f="tfix"><label>Date<input type="date" name="date" value="${kOf(e)}"></label><label>Heure<input type="time" name="time" value="${p2(e.getHours())}:${p2(e.getMinutes())}"></label><p class="mut" id="tf-err"></p><button class="btn gold">Arrêter et enregistrer</button></form>`)}
const atT=(k,t)=>{const d=kD(k);const[h,m]=t.split(":").map(Number);d.setHours(h||0,m||0,0,0);return d.getTime()};

/* ---------- actions ---------- */
const reT=()=>{if(S.tab==="time"||S.tab==="today")rerender()};
Object.assign(ACT,{tstart:el=>{tStart(el.dataset.act);reT()},tpause:()=>{tPause();reT()},tstop:()=>{const d=tStop();reT();void d},tfix:fixSheet,
 tmode:el=>{tmMode=el.dataset.m;rerender()},cmode2:el=>{chMode=el.dataset.m;rerender()},smore:()=>{histN+=30;rerender()},snew:()=>sessSheet(null),sedit:el=>sessSheet(el.dataset.id),goals:goalsSheet,
 sdel:el=>{if(el.dataset.sure!=="1"){el.dataset.sure="1";el.textContent="Sûr ? Touche encore";return}TM().sessions=TM().sessions.filter(s=>s.id!==el.dataset.id);save();rerender()}});
document.addEventListener("submit",e=>{const f=e.target.closest("form[data-f=sess],form[data-f=tfix]");if(!f)return;e.preventDefault();e.stopImmediatePropagation();const fd=new FormData(f);
  if(f.dataset.f==="tfix"){const t=timer();if(!t)return rerender();const end=atT(fd.get("date"),fd.get("time"));if(end<=t.segs[0][0]||end>Date.now()){$("#tf-err").textContent="L'heure doit être après le démarrage et pas dans le futur.";return}tStop(true,end);return rerender()}
  const id=f.dataset.id||null,old=id?TM().sessions.find(s=>s.id===id):null,act=fd.get("act"),dur=+fd.get("dur"),err=$("#s-err");if(!ACTS.includes(act)||!(dur>=1&&dur<=960)){err.textContent="Choisis une activité et une durée entre 1 et 960 min.";return}
  const a=atT(fd.get("date"),fd.get("time")),b=a+dur*MIN;if(b>Date.now()+MIN){err.textContent="Cette période se termine dans le futur.";return}
  const h=overlaps([[a,b]],id);if(h.length){err.textContent="Ça chevauche "+(h[0].live?"le chrono en cours":"une session "+ACTN[h[0].act]+" ("+hm(h[0].segs[0][0])+"–"+hm(h[0].segs[h[0].segs.length-1][1])+")")+" : une même période ne peut pas compter deux fois.";return}
  if(old){old.act=act;old.segs=[[a,b]];old.edited=Date.now()}else TM().sessions.push({id:"m"+pid(),act,segs:[[a,b]],src:"manuel"});save();rerender()},true);
document.addEventListener("change",e=>{const t=e.target;if(t.dataset.goal){TM().goals[t.dataset.goal][t.dataset.k]=Math.max(0,Math.min(4000,+t.value||0));save()}});
document.addEventListener("pointerover",e=>{const r=e.target.closest&&e.target.closest("[data-bar]");if(r&&$("#binfo"))$("#binfo").innerHTML=binfo(+r.dataset.bar)});
setInterval(()=>{if(!timer())return;document.querySelectorAll(".live-clock").forEach(e=>e.textContent=fClock(elapsed()))},1000);
