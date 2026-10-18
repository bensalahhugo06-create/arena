/* Cours de montage Adobe (30 leçons) : lire la leçon, faire l'exercice pratique, vérifier ses connaissances,
   suivre ses points faibles, cocher ses leçons Editing 360. État : S.mt = {lessons:{id:{seen,ok,err,prac:{d,note}}}, e360:[…]} */
"use strict";
const MTS=()=>S.mt||(S.mt={lessons:{},e360:[]});
const ML=id=>MTS().lessons[id]||(MTS().lessons[id]={});
const mcKnown=id=>!!(MTS().lessons[id]&&MTS().lessons[id].seen);
const mcUnlocked=id=>(MT_BY[id].req||[]).every(mcKnown);
const mcNext=()=>MT_PATH.find(id=>!mcKnown(id)&&mcUnlocked(id))||null;
function mcWeak(){return MT_LESSONS.map(l=>{const s=MTS().lessons[l.id]||{};return{l,v:(s.err||0)-(s.ok||0)/2+(s.prac&&s.prac.d==="dur"?1.5:0)}}).filter(x=>x.v>=1&&mcKnown(x.l.id)).sort((a,b)=>b.v-a.v).slice(0,3)}
function courseView(){const n=mcNext(),done=MT_LESSONS.filter(l=>mcKnown(l.id)).length,e=MTS().e360,ed=e.filter(x=>x.done).length,w=mcWeak();
  const groups=Object.keys(MT_SOFT).map(k=>({k,ls:MT_PATH.map(id=>MT_BY[id]).filter(l=>l.soft===k)})).filter(g=>g.ls.length);
  pSheet("Cours de montage",`<div class="card"><div class="grow"><b>${done} / ${MT_LESSONS.length} leçons vues</b><div class="pbar"><i style="width:${Math.round(done/MT_LESSONS.length*100)}%"></i></div></div></div>
  ${n?`<button class="card" data-a="lesson2" data-id="${n}" style="text-align:left;width:100%"><div class="grow"><small>Leçon suivante · ${esc(MT_SOFT[MT_BY[n].soft].name)}</small><b>${esc(MT_BY[n].title)}</b></div></button>`:""}
  ${w.length?`<div class="sect">À retravailler</div><div class="plist">${w.map(x=>`<button class="prow" data-a="lesson2" data-id="${x.l.id}"><div class="grow"><b>${esc(x.l.title)}</b><small>${(MTS().lessons[x.l.id].err||0)} erreur(s)${MTS().lessons[x.l.id].prac&&MTS().lessons[x.l.id].prac.d==="dur"?" · exercice difficile":""}</small></div></button>`).join("")}</div>`:""}
  <div class="sect sh">Editing 360 · ${ed}/${e.length}<button class="btn sm" data-a="e360edit">${e.length?"Modifier":"Importer"}</button></div>
  ${e.length?`<div class="plist">${e.map((x,i)=>`${i===0||e[i-1].mod!==x.mod?`<div class="dh"><span>${esc(x.mod||"Leçons")}</span></div>`:""}<div class="prow"><button class="chk ${x.done?"on":""}" data-a="e360t" data-i="${i}" aria-label="Terminée">${x.done?"✓":""}</button><span class="grow ${x.done?"done":""}">${esc(x.title)}</span></div>`).join("")}</div>`:`<p class="mut">Colle les titres de tes leçons Editing 360 pour cocher celles que tu as terminées.</p>`}
  ${groups.map(g=>`<div class="sect">${esc(MT_SOFT[g.k].name)}</div><div class="plist">${g.ls.map(l=>`<button class="prow" data-a="lesson2" data-id="${l.id}"><div class="grow"><b>${esc(l.title)}</b><small>${MT_LEVEL[l.level]}${mcKnown(l.id)?" · vue":!mcUnlocked(l.id)?" · plus tard":""}</small></div>${mcKnown(l.id)?`<span class="okmark">✓</span>`:""}</button>`).join("")}</div>`).join("")}`)}
function mcLessonView(id){const l=MT_BY[id],s=ML(id),P=s.prac||{},miss=(l.req||[]).filter(r=>!mcKnown(r));
  pSheet(l.title,`<small class="mut">${esc(MT_SOFT[l.soft].name)} · ${MT_LEVEL[l.level]}</small>
  ${miss.length?`<div class="card warncard"><div class="grow"><small>S'appuie sur : ${miss.map(r=>esc(MT_BY[r].title)).join(", ")}</small></div></div>`:""}
  <div class="lsec"><div class="sect">Objectif</div><p>${esc(l.goal)}</p></div><div class="lsec"><div class="sect">Le principe</div><p>${esc(l.why)}</p></div>
  <div class="lsec"><div class="sect">Effet sur le spectateur</div><p>${esc(l.effect)}</p></div><div class="lsec"><div class="sect">Quand ne pas l'utiliser</div><p>${esc(l.avoid)}</p></div>
  <div class="lsec"><div class="sect">Dans ${esc(["cr","cp","wf"].includes(l.soft)?"la pratique":MT_SOFT[l.soft].name)}</div><ol class="steps">${l.how.map(h=>`<li>${esc(h.replace(/^\d\.\s*/,""))}</li>`).join("")}</ol></div>
  <div class="card col"><div class="sect">Exercice pratique</div><p>${esc(l.practice)}</p><small class="mut">Comment ça s'est passé ?</small><div class="row3">${[["facile","Facile"],["ok","Correct"],["dur","Difficile"]].map(([k,t])=>`<button class="btn sm ${P.d===k?"gold":"grey"}" data-a="prac" data-id="${id}" data-d="${k}">${t}</button>`).join("")}</div>
   <textarea class="nbody sm" data-mtnote="${id}" placeholder="Ce que j'ai appris, ce qui a bloqué…">${esc(P.note||"")}</textarea></div>
  <button class="btn gold" data-a="lcheck" data-id="${id}">${s.seen?"Refaire la vérification":"J'ai lu, vérifier"}</button>`)}
let LQ=null;
function mcQuiz(id,i=0){const l=MT_BY[id];if(i===0){ML(id).seen=ML(id).seen||Date.now();save();LQ={id,ok:0}}if(i>=l.quiz.length){const ok=LQ.ok;LQ=null;return pSheet("Vérification",`<div class="center"><div class="big" style="color:var(--gold)">${ok}/${l.quiz.length}</div><p class="mut">Leçon marquée comme vue. Ses questions reviennent dans Cut Duel.</p><button class="btn gold" data-a="course">Retour au cours</button></div>`)}
  const q=l.quiz[i],ord=shuffle([0,1,2,3].slice(0,q[1].length));LQ.i=i;LQ.ord=ord;
  pSheet("Vérification · "+(i+1)+"/"+l.quiz.length,`<div class="qcard"><div class="qtxt long">${esc(q[0])}</div></div><div class="answers single" style="padding:0">${ord.map((o,j)=>`<button class="ans small" data-a="lqa2" data-j="${j}">${esc(q[1][o])}</button>`).join("")}</div><div class="dfb" id="lqfb"></div>`)}
function mcQuizAns(j,btn){const l=MT_BY[LQ.id],q=l.quiz[LQ.i],right=LQ.ord.indexOf(q[2]);if(LQ.lock)return;LQ.lock=true;const s=ML(LQ.id);
  document.querySelectorAll("[data-a=lqa2]").forEach(b=>b.disabled=true);document.querySelectorAll("[data-a=lqa2]")[right].classList.add("ok");
  if(j===right){LQ.ok++;s.ok=(s.ok||0)+1}else{btn.classList.add("ko");s.err=(s.err||0)+1}save();$("#lqfb").innerHTML=`<b style="color:${j===right?"var(--green)":"var(--red)"}">${j===right?"Juste !":"Raté."}</b> ${esc(q[3])}<br><button class="btn gold" style="margin-top:10px" data-a="lqnext">Suivant</button>`}
function e360Edit(){const e=MTS().e360;let cur="";const txt=e.map(x=>{let s="";if(x.mod!==cur){cur=x.mod;if(x.mod)s+=x.mod+" :\n"}return s+x.title}).join("\n");
  pSheet("Mes leçons Editing 360",`<p class="mut">Un titre par ligne. Une ligne qui finit par « : » devient un module. Les leçons déjà cochées restent cochées.</p><textarea class="nbody" id="e360-txt">${esc(txt)}</textarea><button class="btn gold" data-a="e360save">Enregistrer</button>`)}
Object.assign(ACT,{course:courseView,lesson2:el=>mcLessonView(el.dataset.id),lcheck:el=>mcQuiz(el.dataset.id,0),lqa2:el=>mcQuizAns(+el.dataset.j,el),lqnext:()=>{const id=LQ.id,i=LQ.i+1;LQ.lock=false;mcQuiz(id,i)},
 prac:el=>{const s=ML(el.dataset.id);s.prac=Object.assign(s.prac||{},{d:el.dataset.d,at:Date.now()});save();mcLessonView(el.dataset.id)},
 e360edit:e360Edit,e360t:el=>{const x=MTS().e360[+el.dataset.i];if(x){x.done=!x.done;save()}courseView()},
 e360save:()=>{const lines=$("#e360-txt").value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);let mod="";const old={};MTS().e360.forEach(x=>old[x.mod+"|"+x.title]=x.done);const items=[];
   lines.forEach(s=>{if(/[:：]$/.test(s)){mod=s.replace(/\s*[:：]$/,"");return}const title=s.replace(/^[-•*\d.)\s]+/,"")||s;items.push({mod,title,done:!!old[mod+"|"+title]})});MTS().e360=items;save();courseView()}});
document.addEventListener("input",e=>{const t=e.target;if(t.dataset.mtnote){const s=ML(t.dataset.mtnote);s.prac=Object.assign(s.prac||{},{note:t.value});clearTimeout(window._mtT);window._mtT=setTimeout(save,400)}});
