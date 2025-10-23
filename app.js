// IllusionLab v1.3.1 — Contrast Fix (local images, no filters)
(function(){
  const $=s=>document.querySelector(s); const root=document.documentElement;
  const host=$("#illusionHost"), qEl=$("#question"), aEl=$("#answers"), levelEl=$("#level"), scoreEl=$("#score"), timerEl=$("#timer");
  const btnNext=$("#next"), btnHint=$("#showHint"), btnExplain=$("#showExplain"), btnTheme=$("#btnTheme");
  const modal=$("#modal"), modalBody=$("#modalBody"), modalClose=$("#modalClose");
  const credits=$("#credits"), creditsClose=$("#creditsClose"), btnCredits=$("#btnCredits");
  let theme=localStorage.getItem("illusionlab_theme")||"dark"; const applyTheme=()=>{root.classList.toggle("light",theme==="light"); btnTheme.textContent=theme==="light"?"🌙":"☀️";}; applyTheme();
  btnTheme.addEventListener("click",()=>{theme=theme==="light"?"dark":"light"; localStorage.setItem("illusionlab_theme",theme); applyTheme();});
  const LANGS=["it","en"]; let lang=localStorage.getItem("illusionlab_lang")||(navigator.language||"it").slice(0,2); if(!LANGS.includes(lang)) lang="it";
  const i18n={ it:{introText:"Regole: 10 illusioni con immagini locali e contrasto ottimizzato. Funziona anche offline.",start:"Inizia",leaderboard:"Classifica",showProof:"Mostra prova",explain:"Spiegazione",next:"Avanti ▶",endTitle:"🎉 Fine partita",saveScore:"Salva punteggio",playAgain:"Rigioca",boardTitle:"🏆 Classifica locale",name:"Nome",pts:"Punti",time:"Tempo",date:"Data",close:"Chiudi",askName:"Il tuo nome (o iniziali) per la classifica:",saved:"Salvato!",credits:"Crediti"},
               en:{introText:"Rules: 10 illusions with local images and tuned contrast. Works offline.",start:"Start",leaderboard:"Leaderboard",showProof:"Show proof",explain:"Explanation",next:"Next ▶",endTitle:"🎉 Game over",saveScore:"Save score",playAgain:"Play again",boardTitle:"🏆 Local leaderboard",name:"Name",pts:"Pts",time:"Time",date:"Date",close:"Close",askName:"Your name (or initials) for the board:",saved:"Saved!",credits:"Credits"} };
  const T=k=>(i18n[lang]&&i18n[lang][k])||k; const applyI18n=()=>{document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=T(el.getAttribute("data-i18n"))); btnCredits.textContent=T("credits");}; applyI18n();
  $("#btnLang").addEventListener("click",()=>{lang=lang==="it"?"en":"it"; localStorage.setItem("illusionlab_lang",lang); applyI18n(); if(current) renderLevel();});
  const TIME_LIMIT=25; let timer=null,tLeft=TIME_LIMIT,totalTime=0; let idx=0,score=0,current=null;
  const IMG={ blivet:"img/blivet.svg", necker:"img/necker.svg", penroseTri:"img/penrose_triangle.svg", penroseStair:"img/penrose_stairs.svg",
              ames:"img/ames_room.svg", rubin:"img/rubin_vase.svg", duckRabbit:"img/duck_rabbit.svg", kanizsa:"img/kanizsa_triangle.svg",
              mullerLyer:"img/muller_lyer.svg", fraser:"img/fraser_spiral.svg" };
  const CREDITS=[
    {id:"blivet",title:"Blivet (disegno locale)",url:IMG.blivet},{id:"necker",title:"Necker Cube (disegno locale)",url:IMG.necker},
    {id:"penroseTri",title:"Penrose Triangle (disegno locale)",url:IMG.penroseTri},{id:"penroseStair",title:"Penrose Stairs (disegno locale)",url:IMG.penroseStair},
    {id:"ames",title:"Ames Room (schema locale)",url:IMG.ames},{id:"rubin",title:"Rubin Vase (disegno locale)",url:IMG.rubin},
    {id:"duckRabbit",title:"Duck–Rabbit (disegno locale)",url:IMG.duckRabbit},{id:"kanizsa",title:"Kanizsa Triangle (disegno locale)",url:IMG.kanizsa},
    {id:"mullerLyer",title:"Müller–Lyer (disegno locale)",url:IMG.mullerLyer},{id:"fraser",title:"Fraser Spiral (schema locale)",url:IMG.fraser}
  ];
  function renderCredits(){const ul=$("#creditsList"); ul.innerHTML=""; CREDITS.forEach(c=>{const li=document.createElement("li"); li.innerHTML=`<a href="${c.url}" target="_blank" rel="noopener">${c.title}</a>`; ul.appendChild(li);});}
  btnCredits.addEventListener("click",()=>{renderCredits(); credits.hidden=false;}); creditsClose.addEventListener("click",()=>credits.hidden=true);

  const illusions=[
    {id:"blivet", title:{it:"Tridente Impossibile",en:"Impossible Trident"}, question:{it:"Quante punte vedi davvero?",en:"How many prongs do you really see?"},
     options:{it:["Tre","Due","Non è definibile"],en:["Three","Two","Not well-defined"]}, correct:2,
     explanation:{it:"Tre punte si trasformano in due aste: oggetto impossibile.",en:"Three prongs morph into two bars: impossible object."},
     render:n=> n.innerHTML=`<img src="${IMG.blivet}" alt="Blivet">` },
    {id:"necker", title:{it:"Cubo di Necker",en:"Necker Cube"}, question:{it:"Quale faccia è davanti?",en:"Which face is in front?"},
     options:{it:["In alto a sinistra","In basso a destra","Dipende: ribalta"],en:["Top-left","Bottom-right","It flips"]}, correct:2,
     explanation:{it:"Figura bistabile: la profondità si inverte.",en:"Bistable figure: depth flips."},
     render:n=> n.innerHTML=`<img src="${IMG.necker}" alt="Necker cube">` },
    {id:"penroseTri", title:{it:"Triangolo di Penrose",en:"Penrose Triangle"}, question:{it:"Può esistere in 3D reale?",en:"Can it exist in real 3D?"},
     options:{it:["Sì, con trucco prospettico","No, è impossibile","Solo da un punto preciso"],en:["Yes, with forced perspective","No, it's impossible","Only from a fixed viewpoint"]}, correct:1,
     explanation:{it:"Valido solo come trucco prospettico.",en:"Works only as forced perspective."},
     render:n=> n.innerHTML=`<img src="${IMG.penroseTri}" alt="Penrose triangle">` },
    {id:"penroseStair", title:{it:"Scala di Penrose",en:"Penrose Stairs"}, question:{it:"Sale o scende?",en:"Up or down?"},
     options:{it:["Sale per sempre","Scende per sempre","Nessuna delle due"],en:["Up forever","Down forever","Neither"]}, correct:2,
     explanation:{it:"Ciclo chiuso impossibile.",en:"Closed impossible loop."},
     render:n=> n.innerHTML=`<img src="${IMG.penroseStair}" alt="Penrose stairs">` },
    {id:"ames", title:{it:"Camera di Ames",en:"Ames Room"}, question:{it:"Le due persone hanno altezze diverse?",en:"Are the two people different in height?"},
     options:{it:["Sì, a destra più alta","No, stessa altezza (prospettiva)","Poco diverse"],en:["Yes, right is taller","No, same height (perspective)","Slightly different"]}, correct:1,
     explanation:{it:"Stanza deformata che altera la scala.",en:"Skewed room alters scale."},
     render:n=> n.innerHTML=`<img src="${IMG.ames}" alt="Ames room">` },
    {id:"rubin", title:{it:"Vaso di Rubin",en:"Rubin's Vase"}, question:{it:"Cosa vedi per prima cosa?",en:"What do you see first?"},
     options:{it:["Un vaso","Due profili","Dipende"],en:["A vase","Two profiles","It alternates"]}, correct:2,
     explanation:{it:"Figura/sfondo si alternano.",en:"Figure/ground alternates."},
     render:n=> n.innerHTML=`<img src="${IMG.rubin}" alt="Rubin vase">` },
    {id:"duckRabbit", title:{it:"Anatra o Coniglio",en:"Duck or Rabbit"}, question:{it:"È un’anatra o un coniglio?",en:"Is it a duck or a rabbit?"},
     options:{it:["Anatra","Coniglio","Entrambi"],en:["Duck","Rabbit","Both"]}, correct:2,
     explanation:{it:"La stessa sagoma supporta due letture.",en:"Same outline supports two readings."},
     render:n=> n.innerHTML=`<img src="${IMG.duckRabbit}" alt="Duck-rabbit">` },
    {id:"kanizsa", title:{it:"Triangolo di Kanizsa",en:"Kanizsa Triangle"}, question:{it:"Vedi un triangolo bianco?",en:"Do you see a white triangle?"},
     options:{it:["Sì","No, è illusorio","Sì, semitrasparente"],en:["Yes","No, illusory","Yes, semi-transparent"]}, correct:1,
     explanation:{it:"Contorni illusori completati dal cervello.",en:"Illusory contours completed by the brain."},
     render:n=> n.innerHTML=`<img src="${IMG.kanizsa}" alt="Kanizsa triangle">` },
    {id:"mullerLyer", title:{it:"Müller–Lyer",en:"Müller–Lyer"}, question:{it:"Le linee sono lunghe uguali?",en:"Are the lines equal in length?"},
     options:{it:["Sì, identiche","No, frecce in fuori","No, frecce in dentro"],en:["Yes, identical","No, outward arrows longer","No, inward arrows longer"]}, correct:0,
     explanation:{it:"I segmenti centrali coincidono; il contesto inganna.",en:"Central segments match; context biases size."},
     render:n=> n.innerHTML=`<img src="${IMG.mullerLyer}" alt="Müller–Lyer">` },
    {id:"fraser", title:{it:"Spirale di Fraser",en:"Fraser Spiral"}, question:{it:"Sono spirali o cerchi?",en:"Spirals or circles?"},
     options:{it:["Spirali","Cerchi concentrici","Entrambi"],en:["Spirals","Concentric circles","Both"]}, correct:1,
     explanation:{it:"Sono cerchi; il pattern inclinato crea la falsa spirale.",en:"They are circles; the tilted pattern induces a false spiral."},
     render:n=> n.innerHTML=`<img src="${IMG.fraser}" alt="Fraser spiral">` }
  ];

  function setHUD(){ levelEl.textContent=(idx+1)+"/"+illusions.length; scoreEl.textContent=(lang==="it"?"Punti: ":"Pts: ")+score; }
  function startTimer(){ clearInterval(timer); tLeft=TIME_LIMIT; timerEl.textContent="⏱ "+tLeft+"s"; timer=setInterval(()=>{ tLeft--; totalTime++; timerEl.textContent="⏱ "+tLeft+"s"; if(tLeft<=0){ clearInterval(timer); lockAnswers(); btnNext.disabled=false; } },1000); }
  function lockAnswers(){ [...aEl.children].forEach(x=>x.disabled=true); }
  function renderLevel(){ const item=illusions[idx]; current=item; setHUD(); qEl.textContent=item.title[lang]+" — "+item.question[lang];
    item.render(host); aEl.innerHTML=""; btnNext.disabled=true;
    item.options[lang].forEach((opt,i)=>{ const b=document.createElement("button"); b.textContent=opt;
      b.addEventListener("click",()=>{ lockAnswers(); b.classList.add(i===item.correct?'correct':'wrong'); if(i===item.correct){score++; setHUD();} clearInterval(timer); btnNext.disabled=false; });
      aEl.appendChild(b); });
    btnHint.onclick=()=> alert(lang==='it'?'Suggerimento: copri porzioni o usa zoom per vedere meglio l’effetto.':'Hint: cover parts or zoom in to perceive the effect.');
    btnExplain.onclick=()=>{ modalBody.innerHTML="<p>"+item.explanation[lang]+"</p>"; modal.hidden=false; };
    startTimer();
  }

  $("#start").addEventListener("click",()=>{ $("#intro").hidden=true; $("#stage").hidden=false; $("#board").hidden=true; idx=0; score=0; totalTime=0; renderLevel(); });
  $("#next").addEventListener("click",()=>{ idx++; if(idx>=illusions.length){ $("#stage").hidden=true; $("#final").hidden=false;
    const msg=(lang==='it')?`Punteggio: <strong>${score}/10</strong>.<br>Tempo totale: <strong>${totalTime}s</strong>.`:`Score: <strong>${score}/10</strong>.<br>Total time: <strong>${totalTime}s</strong>.`; $("#finalMsg").innerHTML=msg;
  } else { renderLevel(); } });
  $("#restart").addEventListener("click",()=>{ $("#final").hidden=true; $("#intro").hidden=false; });

  function getBoard(){ try{return JSON.parse(localStorage.getItem('illusionlab_scores')||'[]');}catch(e){return[];} }
  function setBoard(a){ localStorage.setItem('illusionlab_scores', JSON.stringify(a)); }
  function renderBoard(){ const tbody=$("#boardTable tbody"); tbody.innerHTML=""; getBoard().slice(0,10).forEach(r=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td>${r.name}</td><td>${r.score}</td><td>${r.time}s</td><td>${r.date}</td>`; tbody.appendChild(tr); }); }
  $("#saveScore").addEventListener("click",()=>{ const name=prompt(T('askName'))||'Player'; const arr=getBoard(); arr.push({name,score,time:totalTime,date:new Date().toLocaleString()}); arr.sort((a,b)=> b.score-a.score || a.time-b.time ); setBoard(arr); alert(T('saved')); });
  function openBoard(){ renderBoard(); $("#board").hidden=false; $("#intro").hidden=true; $("#final").hidden=true; $("#stage").hidden=true; }
  $("#openBoard").addEventListener("click", openBoard); $("#showBoard").addEventListener("click", openBoard);
  $("#closeBoard").addEventListener("click",()=>{ $("#board").hidden=true; $("#intro").hidden=false; });
  modalClose.addEventListener("click",()=> modal.hidden=true);
})();
