// IllusionLab — Game logic
(function(){
  const $ = sel => document.querySelector(sel);
  const host = $("#illusionHost");
  const qEl = $("#question");
  const aEl = $("#answers");
  const levelEl = $("#level");
  const scoreEl = $("#score");
  const btnNext = $("#next");
  const btnHint = $("#showHint");

  let idx = 0, score = 0;

  const illusions = [
    // 1 Tridente Impossibile (Blivet)
    {
      id:"blivet", title:"Tridente Impossibile",
      question:"Quante punte ha davvero questo tridente?",
      options:["Tre","Due","Non è definibile"],
      correct:2,
      render: (node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 400 220" width="360" role="img" aria-label="Tridente impossibile">
          <g stroke="#eaf1ff" fill="none" stroke-width="6" stroke-linecap="square">
            <!-- prongs left as cylinders -->
            <path d="M40 40 L180 80" />
            <path d="M40 100 L180 100" />
            <path d="M40 160 L180 120" />
            <!-- fork connection impossible -->
            <path d="M180 80 L340 40" />
            <path d="M180 100 L340 100" />
            <path d="M180 120 L340 160" />
            <!-- front tip bars creating ambiguity -->
            <path d="M40 40 L40 160" />
            <path d="M340 40 L340 160" />
          </g>
        </svg>
        <div class="helper">Le barre anteriori non si collegano coerentemente alle punte: la connessione è ambigua.</div>`;
      },
      hint: (node)=>{
        node.querySelector(".helper").textContent = "Ruota mentalmente: le tre 'punte' si trasformano in due barre piatte. La figura è impossibile.";
      }
    },

    // 2 Cubo di Necker
    {
      id:"necker", title:"Cubo di Necker",
      question:"Quale faccia del cubo è davanti?",
      options:["In alto a sinistra","In basso a destra","Dipende: la percezione può ribaltarsi"],
      correct:2,
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
        <div class="helper">Fissa un vertice: dopo qualche secondo potrebbe “capovolgersi”.</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = "È una figura bistabile: non esiste un 'davanti' univoco."; }
    },

    // 3 Triangolo di Penrose
    {
      id:"penroseTri", title:"Triangolo di Penrose",
      question:"Questo triangolo può esistere in 3D reale?",
      options:["Sì, con la stampa 3D","No, è impossibile nello spazio euclideo","Solo se visto da una prospettiva esatta"],
      correct:1,
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="340">
          <g fill="#cfe3ff">
            <polygon points="180,30 300,190 60,190" opacity="0.1"/>
          </g>
          <g stroke="#eaf1ff" stroke-width="16" fill="none">
            <path d="M180 40 L290 190 L70 190 Z"/>
            <path d="M180 40 L205 80 L115 190 L90 150 Z"/>
            <path d="M290 190 L245 190 L155 50 L180 40 Z"/>
            <path d="M70 190 L95 150 L275 150 L290 190 Z"/>
          </g>
        </svg>
        <div class="helper">Le “giunzioni” non sono coerenti: vicino e lontano si scambiano.</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = "È costruibile solo come trucco prospettico da un punto specifico."; }
    },

    // 4 Scala di Penrose
    {
      id:"penroseStair", title:"Scala di Penrose",
      question:"La scala sale o scende?",
      options:["Sale per sempre","Scende per sempre","Nessuna delle due: è un ciclo impossibile"],
      correct:2,
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="340">
          <g stroke="#eaf1ff" fill="none" stroke-width="4">
            <rect x="60" y="60" width="240" height="100"/>
            <!-- steps -->
            <path d="M60 160 L100 160 L100 140 L140 140 L140 120 L180 120 L180 100 L220 100 L220 80 L260 80 L260 60" />
            <path d="M300 60 L300 100 L260 100 L260 120 L220 120 L220 140 L180 140 L180 160 L140 160 L140 180 L100 180 L100 200" opacity="0.6"/>
          </g>
        </svg>
        <div class="helper">Gli spigoli si collegano in un anello: l'altezza non cambia mai davvero.</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = "Unisce piani incongruenti in un ciclo chiuso: impossibile in 3D coerente."; }
    },

    // 5 Camera di Ames
    {
      id:"ames", title:"Camera di Ames",
      question:"Le due figure hanno altezze diverse?",
      options:["Sì, la persona a destra è più alta","No, sono uguali: è la stanza distorta a ingannare","Sono diverse ma solo di poco"],
      correct:1,
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
        <div class="helper">La stanza è un trapezio: la persona destra è più lontana ma sembra più alta.</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = "Se rettifichi la prospettiva, le due figure risultano uguali."; }
    },

    // 6 Vaso di Rubin
    {
      id:"rubin", title:"Vaso di Rubin",
      question:"Cosa vedi per prima cosa?",
      options:["Un vaso","Due profili","Dipende: alterno tra le due cose"],
      correct:2,
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="300">
          <rect x="0" y="0" width="360" height="220" fill="#eaf1ff"/>
          <path d="M0,0 H360 V220 H0 Z M130,40 
                   c30,10 30,25 30,40 0,20-20,30-20,40 0,10 20,20 20,40 0,15 0,30-30,40 
                   H230 c-30-10-30-25-30-40 0-20 20-30 20-40 0-10-20-20-20-40 0-15 0-30 30-40 Z"
                fill="#0b1022" fill-rule="evenodd"/>
        </svg>
        <div class="helper">Figura/fondo: non puoi vedere entrambi simultaneamente come oggetti.</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = "Inverti la figura/fondo coprendo i bordi con le dita."; }
    },

    // 7 Figura Anatra-Coniglio
    {
      id:"duckRabbit", title:"Anatra o Coniglio",
      question:"È un'anatra o un coniglio?",
      options:["Anatra","Coniglio","Entrambi, a seconda dell'interpretazione"],
      correct:2,
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
        <div class="helper">Ruota mentalmente: a destra è becco d'anatra, a sinistra orecchie da coniglio.</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = "Basta cambiare 'etichetta' mentale alle stesse linee."; }
    },

    // 8 Quadrato di Kanizsa
    {
      id:"kanizsa", title:"Quadrato di Kanizsa",
      question:"C'è un quadrato bianco al centro?",
      options:["Sì, chiaramente","No, è completamento illusorio","Sì, ma è semitrasparente"],
      correct:1,
      render:(node)=>{
        node.innerHTML = `
        <svg viewBox="0 0 360 220" width="320">
          <rect x="0" y="0" width="360" height="220" fill="none"/>
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
        <div class="helper">Il cervello “chiude” i contorni creando un quadrato che non esiste.</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = "Copri i 'pac-man': il quadrato scompare."; }
    },

    // 9 Müller-Lyer
    {
      id:"mullerLyer", title:"Müller-Lyer",
      question:"Le due linee sono lunghe uguali?",
      options:["Sì, identiche","No, quella con le frecce in fuori è più lunga","No, quella con le frecce in dentro è più lunga"],
      correct:0,
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
        <div class="helper">Aggiungi una riga verticale: scoprirai che sono identiche.</div>`;
      },
      hint:(node)=>{
        node.innerHTML += `<svg viewBox="0 0 360 40" width="340"><g stroke="#22c55e" stroke-width="2"><line x1="60" y1="20" x2="300" y2="20"/></g></svg>`;
      }
    },

    // 10 Ambiguità 3 o 4 barre (figura iniziale)
    {
      id:"bars34", title:"Tre o Quattro?",
      question:"Quante barre ci sono?",
      options:["Tre","Quattro","Dipende da dove inizi a contare"],
      correct:2,
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
        <div class="helper">Ambiguità prospettica: la segmentazione cambia con il punto di vista.</div>`;
      },
      hint:(node)=>{ node.querySelector(".helper").textContent = "Se separi la parte frontale da quella posteriore, il conteggio si spezza."; }
    }
  ];

  function renderLevel(){
    const L = illusions[idx];
    levelEl.textContent = (idx+1)+"/"+illusions.length;
    qEl.textContent = L.title + " — " + L.question;
    L.render(host);
    aEl.innerHTML = "";
    btnNext.disabled = true;
    L.options.forEach((opt,i)=>{
      const b = document.createElement("button");
      b.textContent = opt;
      b.addEventListener("click", ()=>{
        [...aEl.children].forEach(x=>x.disabled=true);
        b.classList.add(i===L.correct? "correct":"wrong");
        if(i===L.correct){ score++; scoreEl.textContent = "Punti: "+score; }
        btnNext.disabled = false;
      });
      aEl.appendChild(b);
    });
    btnHint.onclick = ()=>{ L.hint && L.hint(host); };
  }

  $("#start").addEventListener("click", ()=>{
    $("#intro").hidden = true; $("#stage").hidden = false;
    idx=0; score=0; scoreEl.textContent="Punti: 0";
    renderLevel();
  });

  btnNext.addEventListener("click", ()=>{
    idx++;
    if(idx>=illusions.length){
      $("#stage").hidden=true; $("#final").hidden=false;
      $("#finalMsg").innerHTML = `Punteggio: <strong>${score}/${illusions.length}</strong>.<br>
      Le illusioni non mostrano il mondo com'è, ma come la mente lo interpreta.`;
    }else{
      renderLevel();
    }
  });

  $("#restart").addEventListener("click", ()=>{
    $("#final").hidden=true; $("#intro").hidden=false;
  });
})();