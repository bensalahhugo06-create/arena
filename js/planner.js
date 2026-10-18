/* Planning dans Arena : Aujourd'hui (brief), Agenda (postes, rendez-vous, disponibilités), Notes.
   Tout est enregistré sur l'appareil (S.p). Import du planning par texte, sans IA, avec aperçu. */
"use strict";
const P0=()=>({shifts:{},tent:{},dnotes:{},rdv:[],tasks:{},todo:[],notes:[],
 types:[{code:"M4",label:"Matin",start:"06:30",end:"14:00",kind:"matin"},{code:"SH",label:"Soir",start:"12:30",end:"20:00",kind:"soir"},{code:"RH",label:"Repos",start:"",end:"",kind:"repos"},{code:"RSF",label:"Repos (RSF)",start:"",end:"",kind:"repos"},{code:"VAC",label:"Vacances",start:"",end:"",kind:"conge"}],
 avail:{from:"08:00",to:"21:00",travel:30,rdvDur:60,minSlot:60}});
const PL=()=>S.p||(S.p=P0());
const p2=n=>String(n).padStart(2,"0");
const kOf=d=>d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate());
const tk=()=>kOf(new Date());
const kD=k=>{const[y,m,d]=k.split("-").map(Number);return new Date(y,m-1,d)};
const addD=(k,n)=>{const d=kD(k);d.setDate(d.getDate()+n);return kOf(d)};
const JRS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],MS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],MSC=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const wdOf=k=>kD(k).getDay();
const fDay=k=>{const d=kD(k);return JRS[d.getDay()]+" "+d.getDate()+" "+MS[d.getMonth()]};
const fShort=k=>{const d=kD(k);return JRS[d.getDay()].slice(0,3)+". "+d.getDate()+" "+MSC[d.getMonth()]};
const hF=t=>t?t.replace(":","h"):"";
const toM=t=>{const[h,m]=t.split(":").map(Number);return h*60+m};
const mF=m=>{m=Math.max(0,Math.min(1440,m));return Math.floor(m/60)+"h"+(m%60?p2(m%60):"")};
const weekStart=k=>addD(k,-((wdOf(k)+6)%7));
const typeOf=c=>PL().types.find(t=>t.code===c)||null;
const shiftOn=k=>{const c=PL().shifts[k];return c?typeOf(c):null};
const kindOf=s=>s.kind||(!s.start?"repos":+s.start.slice(0,2)<10?"matin":+s.start.slice(0,2)>=19?"nuit":+s.start.slice(0,2)>=11?"soir":"jour");
const chip=(s,tent)=>s?`<span class="code k-${kindOf(s)} ${s.code.length>2?"c3":""} ${tent?"tent":""}">${esc(s.code)}</span>`:`<span class="code k-none">·</span>`;
const pid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const rdvOn=k=>PL().rdv.filter(r=>r.date===k).sort((a,b)=>(a.time||"").localeCompare(b.time||""));
const tasksOn=k=>PL().tasks[k]||[];

/* ---------- disponibilités ---------- */
function busyOn(k){const a=PL().avail,out=[];const s=shiftOn(k);
  if(s&&s.start&&s.end){const st=toM(s.start),en=toM(s.end);out.push([st-a.travel,(en>st?en:1440)+a.travel])}
  const p=shiftOn(addD(k,-1));if(p&&p.start&&p.end&&toM(p.end)<toM(p.start))out.push([0,toM(p.end)+a.travel]);
  rdvOn(k).forEach(r=>{if(!r.time){out.push([0,1440]);return}const st=toM(r.time),en=r.end?toM(r.end):st+a.rdvDur;out.push([st-a.travel,en+a.travel])});return out}
function freeOn(k){const a=PL().avail;let from=toM(a.from);const to=toM(a.to);if(k===tk()){const n=new Date();from=Math.max(from,Math.ceil((n.getHours()*60+n.getMinutes())/15)*15)}
  let free=from<to?[[from,to]]:[];busyOn(k).forEach(([b,e])=>{const nx=[];free.forEach(([x,y])=>{if(e<=x||b>=y){nx.push([x,y]);return}if(b>x)nx.push([x,b]);if(e<y)nx.push([e,y])});free=nx});
  return free.filter(([x,y])=>y-x>=a.minSlot)}
const freeTxt=fr=>fr.map(([x,y])=>mF(x)+"–"+mF(y)).join(", ");
function availText(n=21){const t=tk(),e=addD(t,n-1);let s=`Mes disponibilités du ${fShort(t)} au ${fShort(e)} :`;for(let k=t;k<=e;k=addD(k,1)){const f=freeOn(k);s+=`\n- ${fShort(k)} : ${f.length?freeTxt(f):"pas disponible"}${PL().tent[k]?" (provisoire)":""}`}return s}

/* ---------- onglets ---------- */
function navSync(){document.querySelectorAll("#nav button").forEach(b=>b.setAttribute("aria-current",b.dataset.t===S.tab?"page":"false"))}
function showTab(t){S.tab=t;save();closeLayer();const g=$("#game");if(g)g.remove();navSync();
  if(t==="play")return home();$("#app").dataset.skin=S.skin;$("#app").innerHTML=`<div class="screen plan">${t==="today"?vToday():t==="agenda"?vAgenda():vNotes()}</div>`}
const rerender=()=>showTab(S.tab||"today");
function rdvRow(r){const d=kD(r.date);return`<div class="prow"><div class="pdate"><b>${d.getDate()}</b><span>${r.date===tk()?"auj.":JRS[d.getDay()].slice(0,3)+"."}</span></div><div class="grow"><b>${esc(r.title)}</b><small>${r.time?hF(r.time)+(r.end?"–"+hF(r.end):""):"journée"}${r.place?" · "+esc(r.place):""}</small>${r.flag?`<small class="warnt">${esc(r.flag)}</small>`:""}${r.note?`<small>${esc(r.note)}</small>`:""}</div><button class="x" data-a="rdel" data-id="${r.id}" aria-label="Supprimer">✕</button></div>`}
function taskRow(t,k){return`<div class="prow"><button class="chk ${t.done?"on":""}" data-a="tdone" data-k="${k}" data-id="${t.id}" aria-label="Fait">${t.done?"✓":""}</button>${t.time?`<span class="tm">${hF(t.time)}</span>`:""}<span class="grow ${t.done?"done":""}">${esc(t.text)}</span><button class="x" data-a="tdel" data-k="${k}" data-id="${t.id}" aria-label="Supprimer">✕</button></div>`}
function vToday(){const t=tk(),tm=addD(t,1),P=PL(),s=shiftOn(t),fr=freeOn(t);
  const items=[];if(s&&s.start)items.push({t:s.start,h:`${chip(s,P.tent[t])}<span class="grow"><b>${esc(s.label)}</b> <small>${hF(s.start)}–${hF(s.end)}</small></span>`});
  rdvOn(t).forEach(r=>items.push({t:r.time||"",h:`<span class="dotr"></span><span class="grow"><b>${esc(r.title)}</b>${r.place?`<small>${esc(r.place)}</small>`:""}</span>`}));
  tasksOn(t).forEach(x=>items.push({t:x.time||"",h:null,task:x}));items.sort((a,b)=>(a.t||"99").localeCompare(b.t||"99"));
  const ws=weekStart(t);let mini="";for(let i=0;i<21;i++){const k=addD(ws,i);mini+=`<button class="mday ${k<t?"past":""} ${k===t?"today":""}" data-a="pday" data-k="${k}"><span>${kD(k).getDate()}</span>${chip(shiftOn(k),P.tent[k])}</button>`}
  const rd=P.rdv.filter(r=>r.date>t&&r.date<=addD(t,21)).sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")));
  let av="";for(let k=t;k<=addD(t,20);k=addD(k,1)){const f=freeOn(k);av+=`<button class="prow avr" data-a="pday" data-k="${k}"><span class="d2">${fShort(k)}</span><span class="grow ${f.length?"":"mut"}">${f.length?freeTxt(f):"pas disponible"}${P.tent[k]?" <small>· provisoire</small>":""}</span></button>`}
  const s2=shiftOn(tm),r2=rdvOn(tm);
  return`<div class="ptitle"><b class="g">Aujourd'hui</b><span>${fDay(t)}</span></div>
  <div class="card pbig">${s?chip(s,P.tent[t]):`<span class="code k-none">–</span>`}<div class="grow"><b>${s?esc(s.label)+(s.start?" · "+hF(s.start)+"–"+hF(s.end):""):"Pas de poste saisi"}</b>${P.dnotes[t]?`<small>${esc(P.dnotes[t])}</small>`:""}<small>${fr.length?"Libre : "+freeTxt(fr):"Plus de créneau libre aujourd'hui"}</small></div></div>
  <div class="sect">Au programme</div><div class="plist">${items.map(i=>i.task?taskRow(i.task,t):`<div class="prow"><span class="tm">${hF(i.t)}</span>${i.h}</div>`).join("")||`<div class="pempty">Rien de prévu aujourd'hui.</div>`}</div>
  <form class="padd" data-f="task" data-k="${t}"><input type="time" name="time" id="ta-time" aria-label="Heure"><input name="text" id="ta-text" placeholder="Ajouter une tâche" aria-label="Tâche"><button class="btn">+</button></form>
  <div class="sect">À faire</div><div class="plist">${P.todo.map(x=>taskRow(x,"todo")).join("")||`<div class="pempty">Rien en attente.</div>`}</div>
  <form class="padd" data-f="todo"><input name="text" id="todo-text" placeholder="Ex. appeler le dentiste" aria-label="À faire"><button class="btn">+</button></form>
  <button class="card tmw" data-a="pday" data-k="${tm}"><small>Demain · ${fDay(tm)}</small><b>${s2?esc(s2.label)+(s2.start?" "+hF(s2.start)+"–"+hF(s2.end):""):"Pas de poste saisi"}${r2.length?" · "+r2.map(r=>esc(r.title)+(r.time?" "+hF(r.time):"")).join(", "):""}</b></button>
  <button class="card playcta" data-a="tab" data-t="play"><span class="mg" style="background:linear-gradient(180deg,#ffe066,#ffc83d)">▶</span><div class="grow"><b>Une pause ? Joue 2 min</b><small>${esc(S.learned&&S.learned.length?"Kana, anglais ou montage":"Commence ta première leçon de japonais")}</small></div></button>
  <div class="sect">Mes postes · 3 semaines</div><div class="minical">${["L","M","M","J","V","S","D"].map(x=>`<span class="wd">${x}</span>`).join("")}${mini}</div>
  <div class="sect">Rendez-vous · 3 semaines</div><div class="plist">${rd.map(rdvRow).join("")||`<div class="pempty">Aucun rendez-vous à venir.</div>`}</div>
  <div class="sect sh">Mes disponibilités · 3 semaines<button class="btn sm gold" data-a="copyav">Copier</button></div><div class="plist">${av}</div>
  <p class="mut">Entre ${hF(P.avail.from)} et ${hF(P.avail.to)}, avec ${P.avail.travel} min de trajet autour des postes et rendez-vous. Ce sont des propositions.</p><pre class="copytxt" id="avtxt" hidden></pre>`}
let calOff=0;
function vAgenda(){const t=tk(),P=PL(),start=addD(weekStart(t),calOff*28);let cells="";
  for(let i=0;i<42;i++){const k=addD(start,i),d=kD(k);const has=rdvOn(k).length||tasksOn(k).length||P.dnotes[k];cells+=`<button class="day ${k<t?"past":""} ${k===t?"today":""}" data-a="pday" data-k="${k}"><span class="dn">${d.getDate()===1||i===0?d.getDate()+" "+MSC[d.getMonth()]:d.getDate()}</span>${chip(shiftOn(k),P.tent[k])}<span class="pip ${has?"":"off"}"></span></button>`}
  const end=addD(start,41),up=P.rdv.filter(r=>r.date>=t).sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")));
  return`<div class="ptitle"><b class="g">Agenda</b><span>${P.rdv.filter(r=>r.date>=t).length} rendez-vous à venir</span></div>
  <div class="calnav"><button class="btn sm" data-a="cal" data-d="-1" aria-label="Avant">‹</button><b>${kD(start).getDate()} ${MSC[kD(start).getMonth()]} – ${kD(end).getDate()} ${MSC[kD(end).getMonth()]}</b>${calOff?`<button class="btn sm grey" data-a="cal" data-d="0">Auj.</button>`:""}<button class="btn sm" data-a="cal" data-d="1" aria-label="Après">›</button></div>
  <div class="cal">${["L","M","M","J","V","S","D"].map(x=>`<div class="wd">${x}</div>`).join("")}${cells}</div>
  <div class="legend2">${P.types.map(s=>`<span>${chip(s)}${esc(s.label)}${s.start?" "+hF(s.start)+"–"+hF(s.end):""}</span>`).join("")}<span><span class="code k-soir tent">·</span>provisoire</span></div>
  <div class="row2"><button class="btn gold" data-a="pimport">Importer un planning</button><button class="btn grey" data-a="psettings">Réglages</button></div>
  <div class="sect">Ajouter un rendez-vous</div>
  <form class="card pform" data-f="rdv"><input name="title" id="r-title" placeholder="Quoi (ex. kiné)" required><input type="date" name="date" id="r-date" value="${t}" required><input type="time" name="time" id="r-time" aria-label="Heure"><input name="place" id="r-place" placeholder="Où (facultatif)"><button class="btn gold">Ajouter</button></form>
  <div class="sect">Tous les rendez-vous à venir</div><div class="plist">${up.map(rdvRow).join("")||`<div class="pempty">Aucun rendez-vous à venir.</div>`}</div>`}
let openNote=null;
function vNotes(){const P=PL();if(openNote){const n=P.notes.find(x=>x.id===openNote);if(n)return`<div class="ptitle"><button class="btn sm grey" data-a="nback">‹ Notes</button><button class="btn sm" style="background:var(--red)" data-a="ndel">Supprimer</button></div>
   <input class="ntitle" id="n-title" data-n="title" value="${esc(n.title)}" placeholder="Titre"><textarea class="nbody" id="n-body" data-n="body" placeholder="Écris ici…">${esc(n.body)}</textarea><p class="mut">Enregistré automatiquement.</p>`;openNote=null}
  return`<div class="ptitle"><b class="g">Notes</b><button class="btn sm gold" data-a="nnew">+ Nouvelle</button></div><div class="plist">${P.notes.slice().sort((a,b)=>b.t-a.t).map(n=>`<button class="prow" data-a="nopen" data-id="${n.id}"><div class="grow"><b>${esc(n.title||"Sans titre")}</b><small>${esc((n.body||"").split("\n")[0].slice(0,80)||"Vide")}</small></div></button>`).join("")||`<div class="pempty">Pas encore de note.</div>`}</div>`}

/* ---------- fiche d'un jour ---------- */
function pSheet(title,html){openLayer(title,html);const c=$("#layer .close");if(c)c.dataset.a="pclose"}
function dayView(k){const P=PL(),cur=P.shifts[k]||"";pSheet(fDay(k),`<div class="sect">Poste</div><div class="picker">${P.types.map(s=>`<button data-a="pset" data-k="${k}" data-c="${esc(s.code)}" aria-pressed="${cur===s.code}">${chip(s)}<span>${esc(s.label)}</span></button>`).join("")}<button data-a="pset" data-k="${k}" data-c="" aria-pressed="${!cur}"><span class="code k-none">–</span><span>Effacer</span></button></div>
  ${cur?`<label class="tog"><input type="checkbox" data-a="ptent" data-k="${k}" ${P.tent[k]?"checked":""}> Provisoire (peut encore changer)</label>`:""}
  <div class="sect">Note du jour</div><textarea class="nbody sm" id="dn-${k}" data-dn="${k}" placeholder="Ex. jour de paye">${esc(P.dnotes[k]||"")}</textarea>
  <div class="sect">Rendez-vous</div><div class="plist">${rdvOn(k).map(rdvRow).join("")||`<div class="pempty">Aucun.</div>`}</div>
  <form class="padd" data-f="rdvq" data-k="${k}"><input type="time" name="time" id="dq-time" aria-label="Heure"><input name="title" id="dq-title" placeholder="Nouveau rendez-vous" aria-label="Rendez-vous"><button class="btn">+</button></form>
  <div class="sect">Tâches</div><div class="plist">${tasksOn(k).map(x=>taskRow(x,k)).join("")||`<div class="pempty">Rien.</div>`}</div>
  <form class="padd" data-f="task" data-k="${k}"><input type="time" name="time" id="dt-time" aria-label="Heure"><input name="text" id="dt-text" placeholder="Nouvelle tâche" aria-label="Tâche"><button class="btn">+</button></form>`);S.openDay=k}
function settingsView(){const P=PL(),a=P.avail;pSheet("Réglages du planning",`<div class="sect">Mes types de postes</div>${P.types.map((s,i)=>`<div class="card"><div class="grow">${chip(s)} <b>${esc(s.label)}</b><div class="row2" style="margin-top:6px"><input type="time" id="ty-s-${i}" data-ty="start" data-i="${i}" value="${s.start}" aria-label="Début"><input type="time" id="ty-e-${i}" data-ty="end" data-i="${i}" value="${s.end}" aria-label="Fin"></div></div></div>`).join("")}
  <form class="padd" data-f="type"><input name="code" id="ty-code" placeholder="Code" maxlength="4" style="flex:0 0 80px"><input name="label" id="ty-label" placeholder="Libellé (ex. Journée)"><button class="btn">+</button></form>
  <div class="sect">Disponibilités</div><div class="card pform"><label>Disponible de<input type="time" data-av="from" value="${a.from}"></label><label>à<input type="time" data-av="to" value="${a.to}"></label><label>Trajet (min)<input type="number" data-av="travel" value="${a.travel}" min="0" max="180"></label><label>RDV sans fin (min)<input type="number" data-av="rdvDur" value="${a.rdvDur}" min="15" max="480"></label><label>Créneau minimum (min)<input type="number" data-av="minSlot" value="${a.minSlot}" min="15" max="480"></label></div>`)}

/* ---------- import d'un planning en texte (format : « - Jeu 15 : SH », « - Ven 16, 10h00 : kiné ») ---------- */
const JABR={lun:1,mar:2,mer:3,jeu:4,ven:5,sam:6,dim:0};const MNUM={janvier:1,fevrier:2,"février":2,mars:3,avril:4,mai:5,juin:6,juillet:7,aout:8,"août":8,septembre:9,octobre:10,novembre:11,decembre:12,"décembre":12};
const nrm=s=>s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
function parsePlanning(txt){const lines=txt.split(/\r?\n/);const yM=txt.match(/\b(20\d\d)\b/);let year=yM?+yM[1]:new Date().getFullYear();
  let sec="",month=0;const out={shifts:[],rdv:[],dnotes:[],todo:[],notes:[],issues:[]};const constraints=[];
  const codeOf=t=>{const n=nrm(t);if(/\brsf\b/.test(n))return"RSF";if(/\bm4\b/.test(n))return"M4";if(/\bsh\b/.test(n))return"SH";if(/vacance|conge/.test(n))return"VAC";if(/\brh\b|repos/.test(n))return"RH";
    const custom=PL().types.find(x=>new RegExp("\\b"+nrm(x.code)+"\\b").test(n));return custom?custom.code:null};
  const mkDate=(d,m)=>p2(year)+"-"+p2(m)+"-"+p2(d);
  for(let raw of lines){const L=raw.trim();if(!L)continue;const n=nrm(L);const bullet=/^[-•*]/.test(L);
    if(/^postes?\b/.test(n)||n.includes("postes a l")){sec="postes";continue}if(/^rendez-vous|^rdv\b/.test(n)){sec="rdv";continue}if(/^a faire|^taches?/.test(n)){sec="todo";continue}if(/^contraintes?/.test(n)){sec="contr";continue}
    const mh=n.match(/^(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\b/);if(mh&&!L.startsWith("-")){month=MNUM[mh[1]];continue}
    if(!bullet)continue;const body=L.replace(/^[-•*]\s*/,"");
    if(sec==="todo"){if(L.startsWith("-")||L.startsWith("•"))out.todo.push(body);continue}
    if(sec==="contr"){if(L.startsWith("-")||L.startsWith("•"))constraints.push(body);continue}
    const m=nrm(body).match(/^(lun|mar|mer|jeu|ven|sam|dim)\w*\.?\s+(\d{1,2})(?:\s*(?:→|->|a|au)\s*(lun|mar|mer|jeu|ven|sam|dim)\w*\.?\s+(\d{1,2}))?\s*(?:,\s*([^:]*?))?\s*:\s*(.*)$/);
    if(!m){if(sec==="postes"||sec==="rdv")out.issues.push(body+" (ligne non comprise)");continue}
    if(!month){out.issues.push(body+" (mois inconnu : ajoute « Octobre » au-dessus)");continue}
    const d1=+m[2],d2=m[4]?+m[4]:d1;const rest=body.slice(body.indexOf(":")+1).trim();
    const days=[];for(let d=d1;d<=d2;d++)days.push(mkDate(d,month));
    if(JABR[m[1]]!==undefined&&wdOf(days[0])!==JABR[m[1]]){out.issues.push(body+" (le jour ne correspond pas à la date)");continue}
    if(sec==="postes"){const c=codeOf(rest);if(!c){out.issues.push(body+" (code de poste inconnu)");continue}
      const note=(rest.match(/\(([^)]*)\)/)||[])[1]||"";days.forEach(k=>out.shifts.push({date:k,code:c,note:c==="RSF"?"":note,tent:false}))}
    else if(sec==="rdv"){const tp=(m[5]||"").replace(/\s/g,"");const tm=tp.match(/^(\d{1,2})h(\d{2})?(?:[–-](\d{1,2})h(\d{2})?)?$/);
      if(!tp){out.dnotes.push({date:days[0],text:rest});continue}
      if(!tm){out.issues.push(body+" (heure illisible)");continue}
      const time=p2(+tm[1])+":"+(tm[2]||"00"),end=tm[3]?p2(+tm[3])+":"+(tm[4]||"00"):"";
      const parts=rest.split(/,\s*/);let title=parts[0],place="",note="";const extra=parts.slice(1).join(", ");
      const paren=title.match(/^(.*?)\s*\((.*)\)\s*$/);if(paren){title=paren[1];note=paren[2]}
      if(extra){if(/^(salle|h[oô]pital|chez|cabinet|à |a )/i.test(extra)||/hôpital|salle/i.test(extra))place=extra;else note=(note?note+" · ":"")+extra}
      const flag=/a decaler|incompatible/.test(nrm(rest))?"À décaler":"";title=title.charAt(0).toUpperCase()+title.slice(1);
      out.rdv.push({date:days[0],time,end,title,place,note,flag})}}
  if(/prévisionnel|previsionnel/i.test(txt)){const mm=nrm(txt).match(/planning de (\w+) est previsionnel/);if(mm&&MNUM[mm[1]])out.shifts.forEach(s=>{if(+s.date.slice(5,7)===MNUM[mm[1]])s.tent=true})}
  out.shifts.forEach(s=>{if(s.code==="RSF")s.tent=true});
  if(constraints.length)out.notes.push({title:"Contraintes",body:constraints.map(c=>"- "+c).join("\n")});return out}
let IMP=null;
function importView(){pSheet("Importer un planning",`<p class="mut">Tu viens de l'ancienne app ? Colle simplement le code de transfert. Sinon, colle ton planning, dans le même format que d'habitude : une section POSTES puis RENDEZ-VOUS, avec les mois (« Octobre ») et des lignes comme « - Jeu 15 : SH » ou « - Ven 16, 10h00 : kiné ». Tu vérifies l'aperçu avant de valider.</p>
  <textarea class="nbody" id="imp-txt" placeholder="Colle ton planning ici">${esc(IMP&&IMP.txt||"")}</textarea><button class="btn gold" data-a="pparse">Analyser</button><div id="imp-out"></div>`)}
/* Code de transfert venant de l'ancienne app (commence par « TM1: ») */
function decodeTransfer(txt){try{return JSON.parse(decodeURIComponent(escape(atob(txt.trim().slice(4).replace(/\s/g,"")))))}catch(e){return null}}
function transferPreview(txt){const d=decodeTransfer(txt);const out=$("#imp-out");if(!d||d.v!==1){out.innerHTML=`<div class="card"><div class="grow"><b>Code illisible.</b><small>Recopie-le en entier depuis l'ancienne app (bouton « Copier le code »).</small></div></div>`;return}
  const P=PL();const nRdv=(d.rdv||[]).filter(r=>!P.rdv.some(y=>y.date===r.date&&(y.time||"")===(r.time||"")&&nrm(y.title)===nrm(r.title))).length;const nTasks=Object.values(d.tasks||{}).reduce((a,x)=>a+x.length,0);
  IMP={txt,transfer:d};out.innerHTML=`<div class="card"><div class="grow"><b>Données de l'ancienne app</b><small>${Object.keys(d.shifts||{}).length} jours de planning · ${nRdv} rendez-vous nouveaux · ${nTasks} tâches · ${(d.todo||[]).length} à faire · ${(d.notes||[]).length} notes</small><small>Ce qui est déjà dans cette app est gardé, sans doublon.</small></div></div><button class="btn gold" data-a="papply">Tout importer</button>`}
function transferApply(d){const P=PL();
  (d.types||[]).forEach(t=>{if(t&&t.code&&!typeOf(t.code))P.types.push({code:t.code,label:t.label||t.code,start:t.start||"",end:t.end||"",kind:t.kind||""})});
  Object.entries(d.shifts||{}).forEach(([k,c])=>{if(typeOf(c))P.shifts[k]=c});Object.keys(d.tent||{}).forEach(k=>P.tent[k]=true);
  Object.entries(d.dnotes||{}).forEach(([k,t])=>{if(t&&!(P.dnotes[k]||"").includes(t))P.dnotes[k]=(P.dnotes[k]?P.dnotes[k]+" · ":"")+t});
  (d.rdv||[]).forEach(r=>{if(!r.date||!r.title)return;if(P.rdv.some(y=>y.date===r.date&&(y.time||"")===(r.time||"")&&nrm(y.title)===nrm(r.title)))return;P.rdv.push({id:pid(),date:r.date,time:r.time||"",end:r.end||"",title:r.title,place:r.place||"",note:r.note||"",flag:r.flag||""})});
  Object.entries(d.tasks||{}).forEach(([k,a])=>{(a||[]).forEach(t=>{const cur=P.tasks[k]||(P.tasks[k]=[]);if(!cur.some(y=>nrm(y.text)===nrm(t.text||"")))cur.push({id:pid(),time:t.time||"",text:t.text||"",done:!!t.done})});if(P.tasks[k]&&!P.tasks[k].length)delete P.tasks[k]});
  (d.todo||[]).forEach(t=>{if(t.text&&!P.todo.some(y=>nrm(y.text)===nrm(t.text)))P.todo.push({id:pid(),text:t.text,done:!!t.done})});
  (d.notes||[]).forEach(n=>{if((n.title||n.body)&&!P.notes.some(y=>y.title===n.title&&y.body===n.body))P.notes.push({id:pid(),title:n.title||"",body:n.body||"",t:n.t||Date.now()})});
  if(d.avail&&d.avail.from)P.avail=Object.assign({},P.avail,d.avail);IMP=null;save();showTab("today")}
function importPreview(){const txt=$("#imp-txt").value;if(/^\s*TM1:/.test(txt))return transferPreview(txt);const r=parsePlanning(txt);const P=PL();IMP={txt,r};
  const exists=x=>P.rdv.some(y=>y.date===x.date&&(y.time===x.time||nrm(y.title)===nrm(x.title)));const changed=r.shifts.filter(s=>P.shifts[s.date]&&P.shifts[s.date]!==s.code);
  r.rdv.forEach(x=>x.dup=exists(x));const todoNew=r.todo.filter(x=>!P.todo.some(y=>nrm(y.text)===nrm(x)));
  $("#imp-out").innerHTML=`<div class="card"><div class="grow"><b>${r.shifts.length} postes · ${r.rdv.filter(x=>!x.dup).length} rendez-vous${r.rdv.some(x=>x.dup)?" (+"+r.rdv.filter(x=>x.dup).length+" déjà là)":""} · ${r.dnotes.length} notes de jour · ${todoNew.length} à faire${r.notes.length?" · 1 note":""}</b>
   ${changed.length?`<small>Changements : ${changed.map(s=>fShort(s.date)+" "+P.shifts[s.date]+" → "+s.code).join(", ")}</small>`:""}${r.issues.length?`<small class="warnt">Non importé, à vérifier : ${r.issues.map(esc).join(" · ")}</small>`:""}</div></div>
   <div class="plist">${r.rdv.map(x=>`<div class="prow"><div class="grow"><b>${esc(x.title)}${x.dup?" · déjà présent":""}</b><small>${fShort(x.date)} · ${hF(x.time)}${x.end?"–"+hF(x.end):""}${x.place?" · "+esc(x.place):""}${x.note?" · "+esc(x.note):""}</small>${x.flag?`<small class="warnt">${x.flag}</small>`:""}</div></div>`).join("")}</div>
   ${r.shifts.length||r.rdv.length||r.todo.length?`<button class="btn gold" data-a="papply">Tout importer</button>`:""}`}
function importApply(){if(IMP&&IMP.transfer)return transferApply(IMP.transfer);const P=PL(),r=IMP&&IMP.r;if(!r)return;r.shifts.forEach(s=>{P.shifts[s.date]=s.code;if(s.tent)P.tent[s.date]=true;else delete P.tent[s.date];if(s.note&&!(P.dnotes[s.date]||"").includes(s.note))P.dnotes[s.date]=(P.dnotes[s.date]?P.dnotes[s.date]+" · ":"")+s.note});
  r.dnotes.forEach(x=>{if(!(P.dnotes[x.date]||"").includes(x.text))P.dnotes[x.date]=(P.dnotes[x.date]?P.dnotes[x.date]+" · ":"")+x.text});
  r.rdv.filter(x=>!x.dup).forEach(x=>P.rdv.push({id:pid(),date:x.date,time:x.time,end:x.end,title:x.title,place:x.place,note:x.note,flag:x.flag}));
  r.todo.forEach(x=>{if(!P.todo.some(y=>nrm(y.text)===nrm(x)))P.todo.push({id:pid(),text:x,done:false})});
  r.notes.forEach(n=>{if(!P.notes.some(y=>y.title===n.title))P.notes.push({id:pid(),title:n.title,body:n.body,t:Date.now()})});
  IMP=null;save();showTab("today")}

/* ---------- actions ---------- */
Object.assign(ACT,{
 tab:el=>showTab(el.dataset.t),pday:el=>dayView(el.dataset.k),pclose:()=>{S.openDay=null;rerender()},
 cal:el=>{const d=+el.dataset.d;calOff=d===0?0:calOff+d;rerender()},
 pset:el=>{const k=el.dataset.k,P=PL();if(el.dataset.c)P.shifts[k]=el.dataset.c;else{delete P.shifts[k];delete P.tent[k]}save();dayView(k)},
 ptent:el=>{const k=el.dataset.k,P=PL();if(el.checked)P.tent[k]=true;else delete P.tent[k];save()},
 rdel:el=>{if(el.dataset.sure!=="1"){el.dataset.sure="1";el.textContent="?";setTimeout(()=>{if(el.isConnected){el.dataset.sure="";el.textContent="✕"}},2500);return}const P=PL();P.rdv=P.rdv.filter(r=>r.id!==el.dataset.id);save();S.openDay&&$("#layer")?dayView(S.openDay):rerender()},
 tdone:el=>{const P=PL(),k=el.dataset.k,a=k==="todo"?P.todo:(P.tasks[k]||[]);const x=a.find(y=>y.id===el.dataset.id);if(x)x.done=!x.done;save();S.openDay&&$("#layer")?dayView(S.openDay):rerender()},
 tdel:el=>{const P=PL(),k=el.dataset.k;if(k==="todo")P.todo=P.todo.filter(y=>y.id!==el.dataset.id);else{P.tasks[k]=(P.tasks[k]||[]).filter(y=>y.id!==el.dataset.id);if(!P.tasks[k].length)delete P.tasks[k]}save();S.openDay&&$("#layer")?dayView(S.openDay):rerender()},
 copyav:()=>{const t=availText();const ok=()=>{const b=$("[data-a=copyav]");if(b)b.textContent="Copié !"};const show=()=>{const p=$("#avtxt");if(p){p.textContent=t;p.hidden=false}};try{navigator.clipboard.writeText(t).then(ok,show)}catch(e){show()}},
 pimport:importView,pparse:importPreview,papply:importApply,psettings:settingsView,
 nnew:()=>{const P=PL(),id=pid();P.notes.push({id,title:"",body:"",t:Date.now()});save();openNote=id;rerender()},
 nopen:el=>{openNote=el.dataset.id;rerender()},nback:()=>{const P=PL(),n=P.notes.find(x=>x.id===openNote);if(n&&!n.title.trim()&&!n.body.trim()){P.notes=P.notes.filter(x=>x!==n);save()}openNote=null;rerender()},
 ndel:el=>{if(el.dataset.sure!=="1"){el.dataset.sure="1";el.textContent="Sûr ?";return}const P=PL();P.notes=P.notes.filter(x=>x.id!==openNote);openNote=null;save();rerender()}
});
document.addEventListener("submit",e=>{const f=e.target.closest("form[data-f]");if(!f||f.dataset.f==="addrew")return;e.preventDefault();const fd=new FormData(f),P=PL(),k=f.dataset.k,v=x=>String(fd.get(x)||"").trim();
  if(f.dataset.f==="task"){if(!v("text"))return;(P.tasks[k]=P.tasks[k]||[]).push({id:pid(),time:v("time"),text:v("text"),done:false})}
  else if(f.dataset.f==="todo"){if(!v("text"))return;P.todo.push({id:pid(),text:v("text"),done:false})}
  else if(f.dataset.f==="rdv"){if(!v("title")||!v("date"))return;P.rdv.push({id:pid(),date:v("date"),time:v("time"),end:"",title:v("title"),place:v("place"),note:"",flag:""})}
  else if(f.dataset.f==="rdvq"){if(!v("title"))return;P.rdv.push({id:pid(),date:k,time:v("time"),end:"",title:v("title"),place:"",note:"",flag:""})}
  else if(f.dataset.f==="type"){const c=v("code").toUpperCase();if(!c||!v("label")||typeOf(c))return;P.types.push({code:c,label:v("label"),start:"",end:"",kind:"jour"});save();return settingsView()}
  save();S.openDay&&$("#layer")?dayView(S.openDay):rerender()});
let nT=null;
document.addEventListener("input",e=>{const t=e.target,P=PL();
  if(t.dataset.n&&openNote){const n=P.notes.find(x=>x.id===openNote);if(n){n[t.dataset.n]=t.value;n.t=Date.now();clearTimeout(nT);nT=setTimeout(save,400)}}
  if(t.dataset.dn){const k=t.dataset.dn;if(t.value.trim())P.dnotes[k]=t.value;else delete P.dnotes[k];clearTimeout(nT);nT=setTimeout(save,400)}});
document.addEventListener("change",e=>{const t=e.target,P=PL();
  if(t.dataset.ty){const ty=P.types[+t.dataset.i];if(ty){ty[t.dataset.ty]=t.value;save()}}
  if(t.dataset.av){const k=t.dataset.av;if(k==="from"||k==="to"){if(t.value)P.avail[k]=t.value}else P.avail[k]=Math.max(0,Math.min(480,+t.value||0));save()}});
