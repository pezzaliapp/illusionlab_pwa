// IllusionLab v1.1 — i18n, timer, leaderboard, explanations
(function(){
  const $ = sel => document.querySelector(sel);
  const host = $("#illusionHost");
  const qEl = $("#question");
  const aEl = $("#answers");
  const levelEl = $("#level");
  const scoreEl = $("#score");
  const timerEl = $("#timer");
  const btnNext = $("#next");
  const btnHint = $("#showHint");
  const btnExplain = $("#showExplain");

  const modal = $("#modal");
  const modalBody = $("#modalBody");
  const modalClose = $("#modalClose");

  const LANGS = ["it","en"];
  let lang = localStorage.getItem("illusionlab_lang") || (navigator.language||"it").slice(0,2);
  if(!LANGS.includes(lang)) lang = "it";
  const i18n = {
    it: {
      introText: "Regole: 10 illusioni, 1 domanda per ciascuna. Rispondi entro il tempo, poi usa «Mostra prova» per capire il trucco. Obiettivo: fare 10/10… o imparare a dubitare della percezione 😉",
      start:"Inizia", leaderboard:"Classifica", showProof:"Mostra prova", explain:"Spiegazione",
      next:"Avanti ▶", endTitle:"🎉 Fine partita", saveScore:"Salva punteggio", playAgain:"Rigioca",
      boardTitle:"🏆 Classifica locale", name:"Nome", pts:"Punti", time:"Tempo", date:"Data", close:"Chiudi",
      askName:"Il tuo nome (o iniziali) per la classifica:", saved:"Salvato!"
    },
    en: {
      introText: "Rules: 10 illusions, 1 question each. Answer before time runs out, then use “Show proof” to see the trick. Goal: get 10/10… or learn to question perception 😉",
      start:"Start", leaderboard:"Leaderboard", showProof:"Show proof", explain:"Explanation",
      next:"Next ▶", endTitle:"🎉 Game over", saveScore:"Save score", playAgain:"Play again",
      boardTitle:"🏆 Local leaderboard", name:"Name", pts:"Pts", time:"Time", date:"Date", close:"Close",
      askName:"Your name (or initials) for the board:", saved:"Saved!"
    }
  };
  function T(key){ return (i18n[lang] && i18n[lang][key]) || key; }
  function applyStaticI18n(){
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const k = el.getAttribute("data-i18n");
      el.textContent = T(k);
    });
  }
  applyStaticI18n();
  $("#btnLang").addEventListener("click", ()=>{
    lang = (lang==="it"?"en":"it");
    localStorage.setItem("illusionlab_lang", lang);
    applyStaticI18n();
    if(current){ renderLevel(); }
  });

  // Timer per domanda
  const TIME_LIMIT = 25;
  let timer = null, tLeft = TIME_LIMIT, totalTime = 0;

  let idx = 0, score = 0;
  let current = null;

  const illusions = [
    {
      id:"blivet",
      title:{it:"Tridente Impossibile", en:"Impossible Trident"},
      question:{it:"Quante punte ha davvero questo tridente?", en:"How many prongs does this trident really have?"},
      options:{it:["Tre","Due","Non è definibile"], en:["Three","Two","Not well-defined"]},
      correct:2,
      explanation:{
        it:"Le connessioni tra punte e barra sono ambigue: alcune linee suggeriscono tre cilindri, altre due barre piatte. È un oggetto impossibile.",
        en:"Connections between prongs and bar are ambiguous: some lines imply three cylinders, others two flat bars. It's an impossible object."
      },
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 400 220" width="360" role="img">
          <g stroke="#eaf1ff" fill="none" stroke-width="6" stroke-linecap="square">
            <path d="M40 40 L180 80" /><path d="M40 100 L180 100" /><path d="M40 160 L180 120" />
            <path d="M180 80 L340 40" /><path d="M180 100 L340 100" /><path d="M180 120 L340 160" />
            <path d="M40 40 L40 160" /><path d="M340 40 L340 160" />
          </g>
        </svg>
        <div class="helper">${lang==="it"?"Le barre anteriori non si collegano coerentemente alle punte.":"Front bars don't connect consistently to prongs."}</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = lang==="it"?"Ruota mentalmente: tre punte diventano due barre.":"Mentally rotate: three prongs become two bars."; }
    },
    {
      id:"necker",
      title:{it:"Cubo di Necker", en:"Necker Cube"},
      question:{it:"Quale faccia del cubo è davanti?", en:"Which face is in front?"},
      options:{it:["In alto a sinistra","In basso a destra","Dipende: la percezione può ribaltarsi"],
               en:["Top-left","Bottom-right","It depends: perception flips"]},
      correct:2,
      explanation:{
        it:"Figura bistabile: l'interpretazione della profondità si inverte spontaneamente.",
        en:"Bistable figure: depth interpretation flips spontaneously."
      },
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 300 220" width="320">
          <g stroke="#eaf1ff" fill="none" stroke-width="3">
            <rect x="60" y="40" width="120" height="120"/>
            <rect x="120" y="80" width="120" height="120"/>
            <line x1="60" y1="40" x2="120" y2="80"/>
            <line x1="180" y1="40" x2="240" y2="80"/>
            <line x1="60" y1="160" x2="120" y2="200"/>
            <line x1="180" y1="160" x2="240" y2="200"/>
          </g>
        </svg>
        <div class="helper">${lang==="it"?"Fissa un vertice: potrebbe capovolgersi.":"Fix a vertex: it may flip."}</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = lang==="it"?"Non esiste un 'davanti' univoco.":"There is no single correct 'front'."; }
    },
    {
      id:"penroseTri",
      title:{it:"Triangolo di Penrose", en:"Penrose Triangle"},
      question:{it:"Questo triangolo può esistere in 3D reale?", en:"Can this triangle exist in real 3D?"},
      options:{it:["Sì, con la stampa 3D","No, è impossibile","Solo da una prospettiva esatta"],
               en:["Yes, with 3D printing","No, it's impossible","Only from a specific viewpoint"]},
      correct:1,
      explanation:{
        it:"Le giunzioni violano la geometria euclidea: può essere costruito solo come trucco prospettico.",
        en:"Junctions violate Euclidean geometry: buildable only as a forced-perspective trick."
      },
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="340">
          <g stroke="#eaf1ff" stroke-width="16" fill="none">
            <path d="M180 40 L290 190 L70 190 Z"/>
            <path d="M180 40 L205 80 L115 190 L90 150 Z"/>
            <path d="M290 190 L245 190 L155 50 L180 40 Z"/>
            <path d="M70 190 L95 150 L275 150 L290 190 Z"/>
          </g>
        </svg>
        <div class="helper">${lang==="it"?"Le giunzioni non tornano.":"The joints don't add up."}</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = lang==="it"?"Valido solo da un punto di vista.":"Valid only from a single viewpoint."; }
    },
    {
      id:"penroseStair",
      title:{it:"Scala di Penrose", en:"Penrose Stairs"},
      question:{it:"La scala sale o scende?", en:"Do the stairs go up or down?"},
      options:{it:["Sale per sempre","Scende per sempre","Nessuna delle due"],
               en:["Up forever","Down forever","Neither: impossible loop"]},
      correct:2,
      explanation:{
        it:"Ciclo chiuso che collega piani incongruenti: l'altitudine non cambia mai.",
        en:"Closed loop connecting inconsistent planes: elevation never changes."
      },
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="340">
          <g stroke="#eaf1ff" fill="none" stroke-width="4">
            <rect x="60" y="60" width="240" height="100"/>
            <path d="M60 160 L100 160 L100 140 L140 140 L140 120 L180 120 L180 100 L220 100 L220 80 L260 80 L260 60" />
          </g>
        </svg>
        <div class="helper">${lang==="it"?"Gli spigoli si chiudono in anello.":"Edges close into a loop."}</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = lang==="it"?"Oggetto impossibile in 3D coerente.":"Impossible in consistent 3D."; }
    },
    {
      id:"ames",
      title:{it:"Camera di Ames", en:"Ames Room"},
      question:{it:"Le due figure hanno altezze diverse?", en:"Do the two figures have different heights?"},
      options:{it:["Sì, a destra è più alta","No, sono uguali: prospettiva","Sono diverse ma poco"],
               en:["Yes, right figure is taller","No, same height: perspective","A little different"]},
      correct:1,
      explanation:{
        it:"La stanza è deformata: il pavimento e le pareti non sono ortogonali all'osservatore.",
        en:"The room is distorted: floor and walls are skewed relative to the viewer."
      },
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="340">
          <g stroke="#eaf1ff" stroke-width="2" fill="none">
            <polygon points="40,180 140,60 320,60 260,180" />
            <line x1="140" y1="60" x2="160" y2="180"/>
            <line x1="320" y1="60" x2="300" y2="180"/>
          </g>
          <g fill="#eaf1ff">
            <rect x="90" y="120" width="16" height="44"/>
            <rect x="240" y="95" width="16" height="69"/>
          </g>
        </svg>
        <div class="helper">${lang==="it"?"Trapezio camuffato da rettangolo.":"A trapezoid masquerading as a rectangle."}</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = lang==="it"?"Rettifica la prospettiva: tornano uguali.":"Rectify perspective: they match."; }
    },
    {
      id:"rubin",
      title:{it:"Vaso di Rubin", en:"Rubin Vase"},
      question:{it:"Cosa vedi per prima cosa?", en:"What do you see first?"},
      options:{it:["Un vaso","Due profili","Dipende, alterno"], en:["A vase","Two profiles","It alternates"]},
      correct:2,
      explanation:{
        it:"Ambiguità figura/sfondo: non puoi percepire simultaneamente vaso e profili come figure.",
        en:"Figure/ground ambiguity: you cannot see both vase and faces as figures at once."
      },
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="300">
          <rect x="0" y="0" width="360" height="220" fill="#eaf1ff"/>
          <path d="M0,0 H360 V220 H0 Z M130,40 
                   c30,10 30,25 30,40 0,20-20,30-20,40 0,10 20,20 20,40 0,15 0,30-30,40 
                   H230 c-30-10-30-25-30-40 0-20 20-30 20-40 0-10-20-20-20-40 0-15 0-30 30-40 Z"
                fill="#0b1022" fill-rule="evenodd"/>
        </svg>
        <div class="helper">${lang==="it"?"Figura/sfondo si invertono.":"Figure/ground reverses."}</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = lang==="it"?"Coprire i bordi aiuta a invertire.":"Cover the edges to flip."; }
    },
    {
      id:"duckRabbit",
      title:{it:"Anatra o Coniglio", en:"Duck or Rabbit"},
      question:{it:"È un'anatra o un coniglio?", en:"Is it a duck or a rabbit?"},
      options:{it:["Anatra","Coniglio","Entrambi"], en:["Duck","Rabbit","Both"]},
      correct:2,
      explanation:{
        it:"Una singola traccia si presta a due etichette semantiche opposte.",
        en:"A single outline supports two competing semantic labels."
      },
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="320">
          <g stroke="#eaf1ff" fill="none" stroke-width="3">
            <ellipse cx="150" cy="120" rx="70" ry="40"/>
            <circle cx="130" cy="110" r="4" fill="#eaf1ff"/>
            <path d="M200 110 Q250 90 300 100" />
            <path d="M200 130 Q250 150 300 140" />
            <path d="M90 120 Q60 140 40 130" />
          </g>
        </svg>
        <div class="helper">${lang==="it"?"Becco a destra, orecchie a sinistra.":"Beak to the right, ears to the left."}</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = lang==="it"?"Cambia l'etichetta mentale.":"Change the mental label."; }
    },
    {
      id:"kanizsa",
      title:{it:"Quadrato di Kanizsa", en:"Kanizsa Square"},
      question:{it:"C'è un quadrato al centro?", en:"Is there a square in the center?"},
      options:{it:["Sì","No, è illusorio","Sì, semitrasparente"], en:["Yes","No, it's illusory","Yes, semi-transparent"]},
      correct:1,
      explanation:{
        it:"Il sistema visivo completa contorni assenti (contorni illusori).",
        en:"Visual system completes missing edges (illusory contours)."
      },
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="320">
          <g fill="#eaf1ff">
            <circle cx="110" cy="80" r="36"/>
            <circle cx="250" cy="80" r="36"/>
            <circle cx="110" cy="160" r="36"/>
            <circle cx="250" cy="160" r="36"/>
          </g>
          <g fill="#0b1022">
            <path d="M110,80 m-36,0 a36,36 0 0,0 36,-36 L110,80 Z"/>
            <path d="M250,80 m36,0 a36,36 0 0,1 -36,-36 L250,80 Z"/>
            <path d="M110,160 m-36,0 a36,36 0 0,1 36,36 L110,160 Z"/>
            <path d="M250,160 m36,0 a36,36 0 0,0 -36,36 L250,160 Z"/>
          </g>
        </svg>
        <div class="helper">${lang==="it"?"Il cervello 'chiude' i bordi.":"The brain 'closes' the edges."}</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = lang==="it"?"Coprendo i pac-man, il quadrato sparisce.":"Cover the pac-men: the square vanishes."; }
    },
    {
      id:"mullerLyer",
      title:{it:"Müller-Lyer", en:"Müller-Lyer"},
      question:{it:"Le due linee sono lunghe uguali?", en:"Are the two lines equal in length?"},
      options:{it:["Sì, identiche","No, con frecce in fuori è più lunga","No, con frecce in dentro è più lunga"],
               en:["Yes, identical","No, outward arrows longer","No, inward arrows longer"]},
      correct:0,
      explanation:{
        it:"Le frecce alterano il contesto prospettico, ma le linee centrali coincidono.",
        en:"Arrows bias perspective context, but central line segments match."
      },
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="340">
          <g stroke="#eaf1ff" stroke-width="3" fill="none">
            <line x1="60" y1="80" x2="300" y2="80"/>
            <line x1="60" y1="140" x2="300" y2="140"/>
            <path d="M60 80 l20 -12 M60 80 l20 12"/>
            <path d="M300 80 l-20 -12 M300 80 l-20 12"/>
            <path d="M60 140 l20 12 M60 140 l20 -12"/>
            <path d="M300 140 l-20 12 M300 140 l-20 -12"/>
          </g>
        </svg>
        <div class="helper">${lang==="it"?"Aggiungi una riga di confronto.":"Add a comparison line."}</div>`;
      },
      hint:(node)=>{
        node.innerHTML += `<svg viewBox="0 0 360 40" width="340"><g stroke="#22c55e" stroke-width="2"><line x1="60" y1="20" x2="300" y2="20"/></g></svg>`;
      }
    },
    {
      id:"bars34",
      title:{it:"Tre o Quattro?", en:"Three or Four?"},
      question:{it:"Quante barre ci sono?", en:"How many bars are there?"},
      options:{it:["Tre","Quattro","Dipende da dove inizi a contare"],
               en:["Three","Four","Depends where you start counting"]},
      correct:2,
      explanation:{
        it:"Ambiguità di segmentazione prospettica: la parte frontale non si mappa univocamente con quella posteriore.",
        en:"Ambiguous perspective segmentation: front segment doesn't map uniquely to the back."
      },
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="340">
          <g stroke="#eaf1ff" stroke-width="6" fill="none">
            <path d="M60 70 L170 90 L300 60"/>
            <path d="M60 110 L170 110 L300 100"/>
            <path d="M60 150 L170 130 L300 140"/>
            <path d="M60 190 L170 170 L300 180"/>
          </g>
        </svg>
        <div class="helper">${lang==="it"?"Il conteggio cambia con il punto di vista.":"Counting changes with viewpoint."}</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = lang==="it"?"Separa mentalmente fronte/retro.":"Separate front/back mentally."; }
    }
  ];

  function setHUD(){
    levelEl.textContent = (idx+1)+"/"+illusions.length;
    scoreEl.textContent = (lang==="it"?"Punti: ":"Pts: ")+score;
  }

  function startTimer(){
    clearInterval(timer);
    tLeft = TIME_LIMIT;
    timerEl.textContent = "⏱ "+tLeft+"s";
    timer = setInterval(()=>{
      tLeft--; totalTime++;
      timerEl.textContent = "⏱ "+tLeft+"s";
      if(tLeft<=0){
        clearInterval(timer);
        lockAnswers();
        btnNext.disabled = false;
      }
    },1000);
  }

  function lockAnswers(){ [...aEl.children].forEach(x=>x.disabled=true); }

  function renderLevel(){
    current = illusions[idx];
    setHUD();
    qEl.textContent = current.title[lang] + " — " + current.question[lang];
    current.render(host);
    aEl.innerHTML = "";
    btnNext.disabled = true;
    [...aEl.children].forEach(x=>x.remove());
    current.options[lang].forEach((opt,i)=>{
      const b = document.createElement("button");
      b.textContent = opt;
      b.addEventListener("click", ()=>{
        lockAnswers();
        b.classList.add(i===current.correct? "correct":"wrong");
        if(i===current.correct){ score++; setHUD(); }
        clearInterval(timer);
        btnNext.disabled = false;
      });
      aEl.appendChild(b);
    });
    btnHint.onclick = ()=>{ current.hint && current.hint(host); };
    btnExplain.onclick = ()=>{
      modalBody.innerHTML = "<p>"+current.explanation[lang]+"</p>";
      modal.hidden = false;
    };
    startTimer();
  }

  $("#start").addEventListener("click", ()=>{
    $("#intro").hidden = true; $("#stage").hidden = false; $("#board").hidden = true;
    idx=0; score=0; totalTime=0;
    renderLevel();
  });

  btnNext.addEventListener("click", ()=>{
    idx++;
    if(idx>=illusions.length){
      $("#stage").hidden=true; $("#final").hidden=false;
      const msg = (lang==="it")
        ? `Punteggio: <strong>${score}/${illusions.length}</strong>.<br>Tempo totale: <strong>${totalTime}s</strong>.`
        : `Score: <strong>${score}/${illusions.length}</strong>.<br>Total time: <strong>${totalTime}s</strong>.`;
      $("#finalMsg").innerHTML = msg;
    }else{
      renderLevel();
    }
  });

  $("#restart").addEventListener("click", ()=>{
    $("#final").hidden=true; $("#intro").hidden=false;
  });

  // Leaderboard
  function getBoard(){
    try{ return JSON.parse(localStorage.getItem("illusionlab_scores")||"[]"); }catch(e){ return []; }
  }
  function setBoard(arr){ localStorage.setItem("illusionlab_scores", JSON.stringify(arr)); }
  function renderBoard(){
    const tbody = $("#boardTable tbody");
    tbody.innerHTML = "";
    const data = getBoard();
    data.slice(0,10).forEach(row=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${row.name}</td><td>${row.score}</td><td>${row.time}s</td><td>${row.date}</td>`;
      tbody.appendChild(tr);
    });
  }

  $("#saveScore").addEventListener("click", ()=>{
    const name = prompt(T("askName")) || "Player";
    const arr = getBoard();
    arr.push({name, score, time: totalTime, date: new Date().toLocaleString()});
    arr.sort((a,b)=> b.score - a.score || a.time - b.time);
    setBoard(arr);
    alert(T("saved"));
  });

  function openBoard(){
    renderBoard();
    $("#board").hidden = false;
    $("#intro").hidden = true;
    $("#final").hidden = true;
    $("#stage").hidden = true;
  }

  $("#openBoard").addEventListener("click", openBoard);
  $("#showBoard").addEventListener("click", openBoard);
  $("#closeBoard").addEventListener("click", ()=>{
    $("#board").hidden = true;
    $("#intro").hidden = false;
  });

  modalClose.addEventListener("click", ()=>{ modal.hidden = true; });

})();