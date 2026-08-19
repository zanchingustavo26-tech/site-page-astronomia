
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

document.addEventListener("DOMContentLoaded",()=>{
  // estrelas de fundo
  const stars=$("#stars");
  for(let i=0;i<180;i++){const s=document.createElement("span");s.className="star";const size=Math.random()*2+1;s.style.width=s.style.height=size+"px";s.style.left=Math.random()*100+"%";s.style.top=Math.random()*100+"%";s.style.animationDelay=(Math.random()*4)+"s";stars.appendChild(s)}

  // reveal
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.08});
  $$(".reveal").forEach(el=>observer.observe(el));

  // menu
  $("#menuToggle")?.addEventListener("click",()=>{$("#mainNav").classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",$("#mainNav").classList.contains("open"))});
  $$(".main-nav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));

  // progresso
  addEventListener("scroll",()=>{const h=document.documentElement.scrollHeight-innerHeight;$("#readingProgress").style.width=(scrollY/h*100)+"%"},{passive:true});

  // tema
  const saved=localStorage.getItem("astronomia-theme"); if(saved==="light")document.body.classList.add("light");
  $("#themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("astronomia-theme",document.body.classList.contains("light")?"light":"dark")});

  // mapa celeste
  const sky=$("#celestialStage"), svg=$(".constellation-svg"), info=$("#celestialInfo");
  const constellationData={
    guaxu:{title:"Guaxu — Veado",text:"No material educativo do MAST, Guaxu representa o outono para os Guarani Mbya. A região do céu associada ao asterismo inclui áreas de constelações ocidentais como Cruzeiro do Sul, Vela, Mosca e Carina."},
    onca:{title:"Onça e Tamanduá — Tikuna",text:"O MAST registra uma interpretação Tikuna em que a narrativa da briga da Onça e do Tamanduá está associada a uma região do céu e a mudanças sazonais, em conjunto com outros asterismos."}
  };
  function selectConstellation(k){$$(".constellation").forEach(c=>c.classList.toggle("active",c.dataset.constellation===k));const d=constellationData[k];if(d)info.innerHTML=`<span class="info-kicker">INTERPRETAÇÃO DOCUMENTADA</span><h3>${d.title}</h3><p>${d.text}</p>`}
  $$(".sky-hotspot,.constellation").forEach(el=>el.addEventListener("click",()=>selectConstellation(el.dataset.constellation)));

  // zoom visual
  let zoom=1;function applyZoom(){svg.style.transform=`scale(${zoom})`;svg.style.transformOrigin="50% 50%"}$("#skyZoomIn").onclick=()=>{zoom=Math.min(1.8,zoom+.15);applyZoom()};$("#skyZoomOut").onclick=()=>{zoom=Math.max(.7,zoom-.15);applyZoom()};$("#skyReset").onclick=()=>{zoom=1;applyZoom()};

  // estrelas no céu
  const skyStars=$("#skyStars");for(let i=0;i<95;i++){const s=document.createElement("i");s.className="tiny-star";s.style.left=Math.random()*100+"%";s.style.top=Math.random()*100+"%";s.style.opacity=(.3+Math.random()*.7);skyStars.appendChild(s)}

  // lua
  const moon=$("#moonVisual"), phaseLabel=$("#moonPhaseLabel");
  const phases={full:["Lua cheia","radial-gradient(circle at 35% 30%,#f2f3ef,#b9bdc4 42%,#646b76 85%)"],new:["Lua nova","radial-gradient(circle at 35% 30%,#26303d,#0a0f17 70%)"],waxing:["Lua crescente","linear-gradient(90deg,#101721 0 43%,#e9ece8 44% 100%)"],waning:["Lua minguante","linear-gradient(90deg,#e9ece8 0 55%,#111923 56% 100%)"]};
  $$(".phase-btn").forEach(b=>b.onclick=()=>{$$(".phase-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");const p=phases[b.dataset.phase];moon.style.background=p[1];phaseLabel.textContent=p[0]});

  // sol
  const slider=$("#sunSlider"), sun=$("#sunObject"), sunTime=$("#sunTime");
  function updateSun(){const v=+slider.value;sun.style.setProperty("--sun-x",(v*.8)+"%");const y=Math.sin(v/100*Math.PI)*115;sun.style.setProperty("--sun-y",y+"px");const minutes=360+Math.round(v*7.2);const h=Math.floor(minutes/60)%24,m=minutes%60;sunTime.textContent=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`}
  slider.addEventListener("input",updateSun);updateSun();

  // mapa real: apenas Brasil, sem tiles do mundo
  const map=L.map("brazilMap",{zoomControl:true,scrollWheelZoom:true,attributionControl:true,zoomSnap:.25,minZoom:3,maxZoom:8});
  const infoBox=$("#mapInfo");
  let geoLayer;
  fetch("https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=intermediaria&intrarregiao=UF")
    .then(r=>r.json()).then(data=>{
      geoLayer=L.geoJSON(data,{style:()=>({color:"#d8b36a",weight:1,fillColor:"#304b5b",fillOpacity:.62}),onEachFeature:(feature,layer)=>{
        const p=feature.properties||{};const name=p.nome||p.NM_UF||p.name||"Unidade da Federação";
        layer.on({mouseover:e=>e.target.setStyle({fillColor:"#8a6d3d",fillOpacity:.9,weight:2}),mouseout:e=>geoLayer.resetStyle(e.target),click:e=>{const b=e.target.getBounds();map.fitBounds(b,{padding:[30,30]});infoBox.innerHTML=`<strong>${name}</strong><span>Unidade da Federação • fonte: IBGE</span>`}})}}).addTo(map);
      map.fitBounds(geoLayer.getBounds(),{padding:[30,30]});
    }).catch(()=>{infoBox.innerHTML="<strong>Mapa indisponível</strong><span>Verifique a conexão com a API do IBGE.</span>"});
  $("#mapReset").onclick=()=>{if(geoLayer){map.fitBounds(geoLayer.getBounds(),{padding:[30,30]});infoBox.innerHTML="<strong>Brasil</strong><span>26 estados + Distrito Federal</span>"}};

  // busca e filtros
  const items=[
    {type:"povos",title:"Guarani Mbya",text:"Astronomia, tempo, fenômenos celestes e cosmopercepção."},
    {type:"povos",title:"Tikuna",text:"Constelações, estações, narrativas e cultura estelar."},
    {type:"povos",title:"Tembé",text:"Ações de Astronomia Cultural em perspectiva intercultural."},
    {type:"ceu",title:"Guaxu — Veado",text:"Asterismo Guarani Mbya associado ao outono."},
    {type:"ceu",title:"Onça e Tamanduá",text:"Narrativa Tikuna relacionada ao céu e à sazonalidade."},
    {type:"territorio",title:"Brasil",text:"Mapa baseado na malha geográfica do IBGE."},
    {type:"ceu",title:"Lua",text:"Observação dos ciclos lunares e sua diversidade cultural."}
  ];
  let activeFilter="all";const input=$("#siteSearch"), results=$("#searchResults");
  function renderSearch(){const q=input.value.toLowerCase().trim();const filtered=items.filter(i=>(activeFilter==="all"||i.type===activeFilter)&&(!q||(i.title+" "+i.text).toLowerCase().includes(q)));results.innerHTML=filtered.map(i=>`<article class="result-card"><small>${i.type}</small><h3>${i.title}</h3><p>${i.text}</p></article>`).join("")||"<p style='color:var(--muted)'>Nenhum resultado encontrado.</p>"}
  input.addEventListener("input",renderSearch);$$(".filter-btn").forEach(b=>b.onclick=()=>{$$(".filter-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");activeFilter=b.dataset.filter;renderSearch()});renderSearch();
  addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();input.focus()}});

  // modal dos povos
  const modal=$("#contentModal"),modalTitle=$("#modalTitle"),modalBody=$("#modalBody");
  const personData={
    guarani:{kicker:"POVO • GUARANI MBYA",title:"Guarani Mbya",body:"O MAST desenvolve pesquisa sobre fenômenos celestes e meteorológicos, tempo e suas relações com aspectos sociais, econômicos, ritualísticos e linguísticos tradicionais Guarani Mbya."},
    tikuna:{kicker:"POVO • TIKUNA",title:"Tikuna",body:"Pesquisas do MAST mostram que o céu Tikuna integra festas, estações e narrativas. A interpretação foi incorporada ao Stellarium com colaboração de pesquisadores e indígenas."},
    tembe:{kicker:"POVO • TEMBÉ",title:"Tembé",body:"O MAST inclui os Tembé entre os povos abordados em ações de Astronomia Cultural, sempre dentro de uma perspectiva de educação intercultural e coexistência de cosmopercepções."}
  };
  $$(".person-more").forEach(b=>b.onclick=()=>{const d=personData[b.dataset.person];$("#modalKicker").textContent=d.kicker;modalTitle.textContent=d.title;modalBody.innerHTML=`<p>${d.body}</p>`;modal.classList.add("open");modal.setAttribute("aria-hidden","false")});
  $$("[data-close-modal]").forEach(x=>x.onclick=()=>{modal.classList.remove("open");modal.setAttribute("aria-hidden","true")});

  // modo explorar
  const steps=[
    ["O céu","Povos indígenas possuem diferentes formas de interpretar o céu; não existe uma única astronomia indígena."],
    ["Constelações","Guaxu é um exemplo documentado entre os Guarani Mbya; no universo Tikuna também existem asterismos e narrativas próprias."],
    ["Lua e Sol","A observação dos ciclos celestes pode se relacionar a tempo, orientação e sazonalidade, de maneiras específicas para cada povo."],
    ["Território","O mapa mostra o Brasil e sua malha territorial a partir de dados do IBGE."],
    ["Conhecimento","A melhor forma de estudar o tema é consultar fontes, pesquisas e materiais produzidos em diálogo com os próprios povos."]
  ];let step=0;
  function updateExplore(){const s=steps[step];$("#exploreCount").textContent=`${step+1} / ${steps.length}`;$("#exploreTitle").textContent=s[0];$("#exploreText").textContent=s[1]}
  $("#exploreToggle").onclick=()=>{$("#exploreOverlay").classList.add("open");document.body.classList.add("explore-mode");updateExplore()};$("#closeExplore").onclick=()=>{$("#exploreOverlay").classList.remove("open");document.body.classList.remove("explore-mode")};$("#exploreNext").onclick=()=>{step=(step+1)%steps.length;updateExplore()};$("#explorePrev").onclick=()=>{step=(step-1+steps.length)%steps.length;updateExplore()};

  // som ambiente opcional com Web Audio; não baixa arquivos
  let audioCtx=null,gain=null,osc=null;$("#soundToggle").onclick=()=>{if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();gain=audioCtx.createGain();gain.gain.value=.025;gain.connect(audioCtx.destination);osc=audioCtx.createOscillator();osc.type="sine";osc.frequency.value=110;osc.connect(gain);osc.start();$("#soundToggle").innerHTML='<i class="fa-solid fa-volume-high"></i> Som ligado'}else if(audioCtx.state==="running"){audioCtx.suspend();$("#soundToggle").innerHTML='<i class="fa-solid fa-volume-xmark"></i> Som ambiente'}else{audioCtx.resume();$("#soundToggle").innerHTML='<i class="fa-solid fa-volume-high"></i> Som ligado'}};
});
