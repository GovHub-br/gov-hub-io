// Guia interativo do fluxo de compras públicas: lupas com rolagem, explorador e glossário.
// Copiado do guia de leitura interativo; as cores vêm de fluxo.css (IDV do Gov Hub).

(() => {
const W = 2420, H = 850;
const NS = 'http://www.w3.org/2000/svg';
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- NÓS ---------- */
const N = {
  io:   {t:'start', x:90,  y:440, r:24, label:'Início\nórgão', lupa:1, title:'Início do órgão'},
  nec:  {t:'orgao', x:215, y:440, w:150, h:72, label:'Necessidade de\ncomprar produto ou\ncontratar serviço', lupa:1},
  darp: {t:'dec',   x:375, y:440, hw:72, hh:56, label:'Existe ARP\ncompatível com\na demanda?', lupa:1},
  ades: {t:'orgao', x:375, y:300, w:150, h:60, label:'Adesão à\nata existente', lupa:1},
  fcA:  {t:'end',   x:520, y:300, r:22, label:'Contrato', exit:true, lupa:1, title:'Fim: contrato (via adesão)'},
  plan: {t:'orgao', x:560, y:440, w:150, h:72, label:'Planejamento\n(fase preparatória)', lupa:2},
  orc:  {t:'inst',  x:490, y:590, w:110, h:40, label:'Orçamento', lupa:2},
  pca:  {t:'inst',  x:615, y:590, w:110, h:40, label:'Plano de\ncontratações anual', lupa:2},
  daux: {t:'dec',   x:745, y:440, hw:72, hh:56, label:'Vai usar\nprocedimento\nauxiliar?', lupa:2},
  cred: {t:'dir',   x:745, y:670, w:160, h:64, label:'Credenciamento via\ncomércio eletrônico', tags:['Sicx'], alert:true, lupa:2},
  preq: {t:'orgao', x:915, y:670, w:140, h:64, label:'Pré-qualificação', lupa:2},
  cat:  {t:'inst',  x:915, y:770, w:170, h:40, label:'Catálogo de Bens\ne Serviços', lupa:2},
  etp:  {t:'orgao', x:920, y:440, w:125, h:64, label:'Estudo técnico\npreliminar (ETP)', lupa:3},
  itens:{t:'orgao', x:1065,y:440, w:125, h:64, label:'Definição\ndos itens', note:'art. 26', lupa:3, title:'Definição dos itens de compra ou contratação'},
  margem:{t:'inst', x:1065,y:360, w:150, h:34, label:'Margem de preferência', lupa:3},
  tr:   {t:'orgao', x:1210,y:440, w:125, h:64, label:'Termo de\nreferência (TR)', tags:['PNCP'], lupa:3},
  mod:  {t:'orgao', x:1355,y:440, w:125, h:64, label:'Definição da\nmodalidade', note:'art. 28', lupa:3, title:'Definição da modalidade de contratação'},
  risc: {t:'orgao', x:920, y:545, w:125, h:64, label:'Análise de\nriscos', lupa:3},
  est:  {t:'orgao', x:1065,y:545, w:125, h:64, label:'Estimativa\nde preço', tags:['PNCP'], lupa:3},
  edi:  {t:'orgao', x:1210,y:545, w:125, h:64, label:'Edital ou aviso\nde contratação', lupa:3, title:'Elaboração do edital ou aviso de contratação'},
  pub:  {t:'orgao', x:1530,y:545, w:140, h:64, label:'Publicação do\nedital ou aviso', tags:['PNCP'], lupa:4},
  ifor: {t:'startF',x:1370,y:105, r:22, label:'Início\nfornecedor', lupa:4, title:'Início do fornecedor'},
  reg:  {t:'forn',  x:1530,y:105, w:150, h:70, label:'Registro\ncadastral', tags:['Sicaf','PNCP'], lupa:4},
  prop: {t:'forn',  x:1720,y:105, w:160, h:70, label:'Apresentação de\npropostas e lances', lupa:4},
  anl:  {t:'lic',   x:1720,y:330, w:160, h:70, label:'Análise de propostas\ne seleção do\nfornecedor', lupa:4},
  dsrp: {t:'dec',   x:1920,y:330, hw:66, hh:50, label:'É SRP?', lupa:4, title:'É sistema de registro de preços (SRP)?'},
  ata:  {t:'lic',   x:2085,y:330, w:130, h:64, label:'Formalização\nda ARP', lupa:4, title:'Formalização da ata de registro de preço'},
  farp: {t:'end',   x:2215,y:330, r:22, label:'ARP', lupa:4, title:'Fim: ata de registro de preço'},
  hom:  {t:'lic',   x:1920,y:455, w:150, h:60, label:'Homologação', lupa:4},
  contL:{t:'lic',   x:2085,y:455, w:120, h:60, label:'Contrato', lupa:4, title:'Contrato (via licitação)'},
  gest: {t:'fora',  x:2245,y:455, w:150, h:64, label:'Gestão do\ncontrato', plus:true, lupa:4},
  disp: {t:'dir',   x:1720,y:680, w:170, h:64, label:'Dispensa ou\ninexigibilidade', note:'arts. 74 e 75', lupa:5},
  dval: {t:'dec',   x:1920,y:680, hw:76, hh:58, label:'Valor abaixo\nde R$ 65 mil?', lupa:5, title:'O valor está abaixo de R$ 65 mil?'},
  cart: {t:'dir',   x:2095,y:680, w:130, h:64, label:'Cartão de\npagamento', lupa:5},
  ext:  {t:'dir',   x:2245,y:680, w:130, h:64, label:'Extrato', tags:['PNCP'], lupa:5, title:'Extrato registrado no PNCP'},
  fimC: {t:'end',   x:2365,y:680, r:22, label:'Fim', lupa:5, title:'Fim do caminho do cartão'},
  contD:{t:'dir',   x:2095,y:785, w:120, h:56, label:'Contrato', lupa:5, title:'Contrato (via contratação direta)'},
  fcD:  {t:'end',   x:2225,y:785, r:22, label:'Contrato', exit:true, lupa:5, title:'Fim: contrato (via contratação direta)'},
};
const ALL = Object.keys(N);

function A(id, side, dx=0){
  const n = N[id];
  if (n.r) return {l:[n.x-n.r,n.y], r:[n.x+n.r,n.y], t:[n.x,n.y-n.r], b:[n.x,n.y+n.r]}[side];
  const hw = n.hw ?? n.w/2, hh = n.hh ?? n.h/2;
  return {l:[n.x-hw,n.y], r:[n.x+hw,n.y], t:[n.x+dx,n.y-hh], b:[n.x+dx,n.y+hh]}[side];
}

/* ---------- ARESTAS ---------- */
const E = [
  ['io','r','nec','l'],
  ['nec','r','darp','l'],
  ['darp','t','ades','b',{lab:['Sim',385,364,'start']}],
  ['ades','r','fcA','l'],
  ['darp','r','plan','l',{lab:['Não',466,430,'middle']}],
  ['orc','t','plan','b',{k:'inst',dx2:-30}],
  ['pca','t','plan','b',{k:'inst',dx2:30}],
  ['plan','r','daux','l'],
  ['daux','r','etp','l',{lab:['Não',836,430,'middle']}],
  ['daux','b','cred','t',{lab:['Sim',755,548,'start']}],
  ['daux','b','preq','t',{via:[[745,606],[915,606]]}],
  ['preq','b','cat','t',{k:'inst'}],
  ['margem','b','itens','t',{k:'inst'}],
  ['etp','r','itens','l'], ['itens','r','tr','l'], ['tr','r','mod','l'],
  ['mod','b','risc','t',{via:[[1355,492],[920,492]]}],
  ['risc','r','est','l'], ['est','r','edi','l'],
  ['edi','r','pub','l'],
  ['pub','t','anl','l',{via:[[1530,330]],lab:['Licitação',1540,420,'start']}],
  ['ifor','r','reg','l'], ['reg','r','prop','l'], ['prop','b','anl','t'],
  ['anl','r','dsrp','l'],
  ['dsrp','r','ata','l',{lab:['Sim',2003,320,'middle']}], ['ata','r','farp','l'],
  ['dsrp','b','hom','t',{lab:['Não',1930,408,'start']}], ['hom','r','contL','l'], ['contL','r','gest','l'],
  ['pub','b','disp','l',{via:[[1530,680]],lab:['Contratação direta',1540,630,'start']}],
  ['disp','r','dval','l'],
  ['dval','r','cart','l',{lab:['Sim',2013,670,'middle']}], ['cart','r','ext','l'], ['ext','r','fimC','l'],
  ['dval','b','contD','l',{via:[[1920,785]],lab:['Não',1930,765,'start']}],
  ['contD','r','fcD','l'],
  ['farp','t','ades','t',{k:'cycle',id:'cycle',via:[[2215,245],[375,245]]}],
].map((e,i)=>{
  const o = e[4]||{};
  const p0 = A(e[0],e[1]), p1 = A(e[2],e[3],o.dx2||0);
  return {id:o.id||('e'+i), f:e[0], t:e[2], k:o.k||'flow', pts:[p0,...(o.via||[]),p1], lab:o.lab};
});

/* ---------- RENDER ---------- */
function mk(tag, attrs, parent){
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}
function textLines(parent, x, cy, str, cls, lh){
  const ls = str.split('\n');
  const t = mk('text', {x, y: cy - (ls.length-1)*lh/2 + 4.6, class:cls, 'text-anchor':'middle'}, parent);
  ls.forEach((s,i)=>{ const sp = mk('tspan',{x, dy: i? lh : 0}, t); sp.textContent = s; });
  return t;
}

function render(svg, {pfx, mini=false, interactive=false}){
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', svg.dataset.par || 'xMidYMid meet');
  const R = {svg, pfx, mini, nodes:{}, edges:[], vb:[0,0,W,H]};
  const defs = mk('defs', {}, svg);
  if (!mini) for (const [nm, cls] of [['d','mk-def'],['o','mk-on'],['c','mk-cyc']]) {
    const m = mk('marker', {id:`${pfx}-${nm}`, viewBox:'0 0 10 10', refX:9.5, refY:5, markerWidth:9, markerHeight:9, markerUnits:'userSpaceOnUse', orient:'auto'}, defs);
    mk('path', {d:'M0,0 L10,5 L0,10 z', class:cls}, m);
  }
  // raias
  mk('rect', {x:0,y:0,width:W,height:207,class:'lane-f'}, svg);
  mk('rect', {x:0,y:213,width:W,height:H-213,class:'lane-o'}, svg);
  // fases
  const ph = mk('g', {class:'phase'}, svg);
  mk('rect', {x:44,y:0,width:1403,height:H,class:'ph-int'}, ph);
  mk('rect', {x:1447,y:0,width:W-1447,height:H,class:'ph-ext'}, ph);
  if (!mini) {
    mk('text', {x:1420,y:836,'text-anchor':'end',class:'ph-lbl'}, ph).textContent = '← FASE INTERNA';
    mk('text', {x:1474,y:836,class:'ph-lbl'}, ph).textContent = 'FASE EXTERNA →';
  }
  mk('line', {x1:1447,y1:213,x2:1447,y2:H,class:'phase-line'}, svg);
  mk('line', {x1:0,y1:210,x2:W,y2:210,class:'lane-sep'}, svg);
  if (!mini) {
    mk('text', {x:26,y:105,transform:'rotate(-90 26 105)','text-anchor':'middle',class:'lane-lbl'}, svg).textContent = 'FORNECEDOR';
    mk('text', {x:26,y:530,transform:'rotate(-90 26 530)','text-anchor':'middle',class:'lane-lbl'}, svg).textContent = 'ÓRGÃO PÚBLICO';
  }
  // bloco de instrumentos
  mk('rect', {x:840,y:330,width:595,height:262,rx:10,class:'block'}, svg);
  if (!mini) mk('text', {x:846,y:320,class:'block-lbl'}, svg).textContent = 'INSTRUMENTOS DE PLANEJAMENTO DA CONTRATAÇÃO';

  // arestas
  const eg = mk('g', {}, svg);
  for (const e of E) {
    const g = mk('g', {class:`edge ${e.k}`, 'data-id':e.id}, eg);
    const d = e.pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');
    const path = mk('path', {d}, g);
    if (!mini) path.setAttribute('marker-end', `url(#${pfx}-${e.k==='cycle'?'c':'d'})`);
    if (!mini && e.lab) {
      const [txt,x,y,anc] = e.lab;
      mk('text', {x,y,'text-anchor':anc,class:'elbl'}, g).textContent = txt;
    }
    R.edges.push({...e, g, path});
  }
  if (!mini) mk('text', {x:1300,y:238,'text-anchor':'middle',class:'cyc-lbl'}, svg).textContent = 'ciclo da ata: o fim de uma licitação por SRP pode virar atalho para outros órgãos';

  // nós
  const ng = mk('g', {}, svg);
  for (const id of ALL) {
    const n = N[id];
    const g = mk('g', {class:`node t-${n.t}`, 'data-id':id}, ng);
    if (interactive) {
      g.setAttribute('tabindex','0'); g.setAttribute('role','button');
      g.setAttribute('aria-label', (n.title || n.label.replace(/\n/g,' ')));
    }
    if (n.r) {
      mk('circle', {cx:n.x, cy:n.y, r:n.r, class:'shape'}, g);
      mk('circle', {cx:n.x, cy:n.y, r:n.r+6, class:'ring'}, g);
      if (!mini) {
        if (n.exit) mk('path', {d:`M${n.x-8} ${n.y}h15m-6-6 6 6-6 6`, class:'ico'}, g);
        const ls = n.label.split('\n').length;
        textLines(g, n.x, n.y + n.r + 12 + ls*14/2, n.label, 'clbl', 14);
      }
    } else if (n.t === 'dec') {
      const pts = `${n.x},${n.y-n.hh} ${n.x+n.hw},${n.y} ${n.x},${n.y+n.hh} ${n.x-n.hw},${n.y}`;
      mk('polygon', {points:pts, class:'shape'}, g);
      mk('polygon', {points:`${n.x},${n.y-n.hh-8} ${n.x+n.hw+11},${n.y} ${n.x},${n.y+n.hh+8} ${n.x-n.hw-11},${n.y}`, class:'ring'}, g);
      if (!mini) textLines(g, n.x, n.y, n.label, 'lbl', 14);
    } else {
      const x0 = n.x-n.w/2, y0 = n.y-n.h/2;
      mk('rect', {x:x0, y:y0, width:n.w, height:n.h, rx:n.t==='inst'?3:6, class:'shape'}, g);
      mk('rect', {x:x0-5, y:y0-5, width:n.w+10, height:n.h+10, rx:9, class:'ring'}, g);
      if (!mini) {
        let cy = n.y;
        if (n.note) {
          mk('rect', {x:x0+3, y:y0+n.h-17, width:n.w-6, height:14, rx:2, class:'band'}, g);
          mk('text', {x:n.x, y:y0+n.h-6.5, 'text-anchor':'middle', class:'band-t'}, g).textContent = n.note;
          cy -= 8;
        }
        textLines(g, n.x, cy, n.label, 'lbl', n.t==='inst'?14:15.5);
        if (n.tags) {
          let px = x0 + n.w - 2;
          for (const tg of [...n.tags].reverse()) {
            const tw = tg.length*6.6 + 14;
            const tgG = mk('g', {class:'tag'+(tg==='PNCP'?'':' p')}, g);
            mk('rect', {x:px-tw, y:y0-9, width:tw, height:17, rx:8.5}, tgG);
            mk('text', {x:px-tw/2, y:y0+3.3, 'text-anchor':'middle'}, tgG).textContent = tg;
            px -= tw + 4;
          }
        }
        if (n.alert) {
          const cx = x0 + 4, cy2 = y0 + 2;
          const wg = mk('g', {class:'warn'}, g);
          mk('polygon', {points:`${cx},${cy2-12} ${cx+12},${cy2+9} ${cx-12},${cy2+9}`}, wg);
          mk('text', {x:cx, y:cy2+6.5, 'text-anchor':'middle'}, wg).textContent = '!';
        }
        if (n.plus) {
          const pg = mk('g', {class:'plus'}, g);
          mk('rect', {x:n.x-8, y:y0+n.h-8, width:16, height:16, rx:2}, pg);
          mk('path', {d:`M${n.x} ${y0+n.h-4}v8M${n.x-4} ${y0+n.h}h8`}, pg);
        }
      }
    }
    R.nodes[id] = g;
  }
  return R;
}

/* ---------- FOCO ---------- */
function focus(R, nodes, opt={}){
  const set = nodes ? new Set(nodes==='all'?ALL:nodes) : null;
  const {soft=false, phase=false, lanes=false, cycle=false} = opt;
  const s = R.svg.classList;
  s.toggle('focusing', !!set); s.toggle('soft', !!soft);
  s.toggle('show-phase', !!phase); s.toggle('show-lanes', !!lanes); s.toggle('cyc-on', !!cycle);
  for (const id in R.nodes) R.nodes[id].classList.toggle('on', !!set && set.has(id));
  for (const e of R.edges) {
    const on = !!set && ((set.has(e.f) && set.has(e.t) && e.k!=='cycle') || (cycle && e.k==='cycle'));
    e.g.classList.toggle('on', on);
    if (!R.mini) e.path.setAttribute('marker-end', `url(#${R.pfx}-${e.k==='cycle'?'c':(on?'o':'d')})`);
  }
}
function setView(R, v){ R.vb = v; R.svg.setAttribute('viewBox', v.map(n=>n.toFixed(1)).join(' ')); if (R.onView) R.onView(v); }
function animateView(R, to){
  cancelAnimationFrame(R.raf);
  if (reduce) return setView(R, to);
  const from = R.vb.slice(), t0 = performance.now(), d = 800;
  const step = now => {
    let k = Math.min(1, (now-t0)/d);
    k = k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k+2, 3)/2;
    setView(R, from.map((a,i)=>a+(to[i]-a)*k));
    if (k < 1) R.raf = requestAnimationFrame(step);
  };
  R.raf = requestAnimationFrame(step);
}

/* ---------- ARRASTAR E ZOOM (viewBox) ----------
   Mouse: arrastar move; Ctrl + rodinha (ou pinça no trackpad) aproxima em torno do cursor.
   Toque: dois dedos movem e aproximam; um dedo continua rolando a página (as lupas dependem dela).
   A rodinha sozinha não é capturada, para não travar a rolagem da página. */
function panZoom(R, {onUser} = {}){
  const svg = R.svg, pts = new Map();
  let drag = null, pinch = null, moved = false;
  svg.classList.add('pz-on');
  const box = () => svg.getBoundingClientRect();
  function escala(){ const r = box(); return Math.min(r.width / R.vb[2], r.height / R.vb[3]); }
  function paraSvg(cx, cy){
    const r = box(), s = escala(), [x, y, w, h] = R.vb;
    return [x + (cx - r.left - (r.width - w*s)/2) / s, y + (cy - r.top - (r.height - h*s)/2) / s];
  }
  function limitar([x, y, w, h]){
    const ar = h / w;
    w = Math.max(220, Math.min(W * 1.25, w)); h = w * ar;
    x = Math.max(-w * .6, Math.min(W - w * .4, x));
    y = Math.max(-h * .6, Math.min(H - h * .4, y));
    return [x, y, w, h];
  }
  function usuario(){ if (onUser) onUser(); }
  function zoom(f, cx, cy){
    cancelAnimationFrame(R.raf);
    const [x, y, w, h] = R.vb;
    const [px, py] = cx == null ? [x + w/2, y + h/2] : paraSvg(cx, cy);
    setView(R, limitar([px - (px - x)/f, py - (py - y)/f, w/f, h/f]));
    usuario();
  }
  svg.addEventListener('wheel', e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    zoom(Math.exp(-e.deltaY * 0.0025), e.clientX, e.clientY);
  }, {passive: false});
  function centroDist(){
    const [a, b] = [...pts.values()];
    return {cx: (a.x + b.x)/2, cy: (a.y + b.y)/2, d: Math.hypot(a.x - b.x, a.y - b.y)};
  }
  svg.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pts.set(e.pointerId, {x: e.clientX, y: e.clientY});
    moved = false;
    if (e.pointerType === 'mouse') drag = {x: e.clientX, y: e.clientY, vb: R.vb.slice()};
    if (pts.size === 2) { pinch = centroDist(); drag = null; }
  });
  svg.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (pinch && pts.size >= 2) {
      const c = centroDist(), s = escala();
      cancelAnimationFrame(R.raf);
      const [x, y, w, h] = R.vb;
      setView(R, limitar([x - (c.cx - pinch.cx)/s, y - (c.cy - pinch.cy)/s, w, h]));
      if (pinch.d > 0) zoom(c.d / pinch.d, c.cx, c.cy);
      pinch = c; moved = true; usuario();
      return;
    }
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!moved && Math.hypot(dx, dy) < 5) return;
    if (!moved) { moved = true; svg.setPointerCapture(e.pointerId); svg.classList.add('arrastando'); cancelAnimationFrame(R.raf); }
    const s = escala();
    setView(R, limitar([drag.vb[0] - dx/s, drag.vb[1] - dy/s, drag.vb[2], drag.vb[3]]));
    usuario();
  });
  function soltar(e){
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (!pts.size) { drag = null; svg.classList.remove('arrastando'); }
  }
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);
  // um arrasto não vira clique na etapa onde o mouse foi solto
  svg.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  return {zoom};
}
function centrarEm(R, id){
  const [, , w, h] = R.vb;
  animateView(R, [N[id].x - w/2, N[id].y - h/2, w, h]);
}

const lupaNodes = n => ALL.filter(id => N[id].lupa === n);
const PNCP = ALL.filter(id => (N[id].tags||[]).includes('PNCP'));
const VIEWS = {
  all:[0,0,W,H],
  l1:[40,222,620,340], l2:[420,372,600,440], l3:[822,288,635,322],
  l4:[1335,18,1020,575], l5:[1440,500,975,350], forn:[1300,10,620,420],
};
const FOCI = {
  lupa1:[lupaNodes(1),{soft:true}], lupa2:[lupaNodes(2),{soft:true}], lupa3:[lupaNodes(3),{soft:true}],
  lupa4:[lupaNodes(4),{soft:true,phase:true}], lupa5:[lupaNodes(5),{soft:true}],
  'ach-arp':[['darp','ades','fcA','dsrp','ata','farp'],{cycle:true}],
  'ach-fim':[['fcA','farp','fimC','fcD','gest'],{}],
  'ach-forn':[['ifor','reg','prop','anl'],{lanes:true}],
  'ach-pncp':[PNCP,{}],
  'ach-plan':[['etp','itens','margem','tr','mod','risc','est','edi','pub','anl','disp'],{}],
  'ach-margem':[['itens','margem'],{}],
};

/* ---------- PALCO (SCROLLY) ---------- */
const stage = render(document.getElementById('stageSvg'), {pfx:'st', interactive:true});
const mini = render(document.getElementById('miniSvg'), {pfx:'mn', mini:true});
const vp = mk('rect', {class:'vp', x:0,y:0,width:W,height:H}, mini.svg);
stage.onView = v => { vp.setAttribute('x',v[0]); vp.setAttribute('y',v[1]); vp.setAttribute('width',v[2]); vp.setAttribute('height',v[3]); };
const cap = document.getElementById('stageCap');
const steps = [...document.querySelectorAll('.step')];
let active = -1;
const stCard = document.getElementById('stageCard'), stReset = document.getElementById('stReset');
let stSel = null;
function fecharCardPalco(){
  stCard.hidden = true; stCard.innerHTML = '';
  if (stSel) { stage.nodes[stSel].classList.remove('sel'); stSel = null; }
}
const stagePZ = panZoom(stage, {onUser: () => { stReset.hidden = false; }});
document.getElementById('stIn').onclick = () => stagePZ.zoom(1.4);
document.getElementById('stOut').onclick = () => stagePZ.zoom(1/1.4);
stReset.onclick = () => {
  const s = steps[active];
  animateView(stage, VIEWS[s.dataset.view] || VIEWS.all);
  stReset.hidden = true;
};
function abrirCardPalco(id){
  if (stSel) stage.nodes[stSel].classList.remove('sel');
  stSel = id; stage.nodes[id].classList.add('sel');
  stCard.innerHTML = `<button type="button" class="stage-card-fechar" aria-label="Fechar detalhes">×</button>` + detalheHTML(id);
  stCard.hidden = false;
  stCard.querySelector('.stage-card-fechar').onclick = fecharCardPalco;
}
stage.svg.addEventListener('click', e => { const g = e.target.closest('.node'); if (g) abrirCardPalco(g.dataset.id); });
stage.svg.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const g = e.target.closest('.node'); if (!g) return;
  e.preventDefault(); abrirCardPalco(g.dataset.id);
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !stCard.hidden) fecharCardPalco(); });
function activate(i){
  if (i === active) return; active = i;
  // nova lupa: volta ao enquadramento dela e fecha o card
  fecharCardPalco(); stReset.hidden = true;
  steps.forEach((s,j)=>s.classList.toggle('active', j===i));
  const s = steps[i], f = FOCI[s.dataset.focus];
  focus(stage, f ? f[0] : null, f ? f[1] : {});
  if (!f) { focus(mini, null); } else { focus(mini, f[0], f[1]); }
  animateView(stage, VIEWS[s.dataset.view] || VIEWS.all);
  cap.textContent = s.dataset.cap || '';
}
let ticking = false;
function onScroll(){
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const line = innerHeight * (innerWidth >= 960 ? .5 : .74);
    let idx = 0;
    steps.forEach((s,i)=>{ if (s.getBoundingClientRect().top <= line) idx = i; });
    activate(idx);
  });
}
addEventListener('scroll', onScroll, {passive:true});
addEventListener('resize', onScroll);
activate(0);

/* ---------- DETALHES POR ETAPA ---------- */
const TYPE = {start:['Início','--orgao'], startF:['Início do fornecedor','--rosa'], end:['Fim','--fora'], orgao:['Etapa do órgão','--orgao'], forn:['Etapa do fornecedor','--forn'], lic:['Etapa da licitação','--lic'], dir:['Etapa da contratação direta','--dir'], fora:['Subprocesso','--fora'], dec:['Ponto de decisão','--muted'], inst:['Instrumento','--muted']};
const LUPA = {1:'Necessidade e ata de registro de preço',2:'Planejamento e procedimentos auxiliares',3:'Instrumentos de planejamento da contratação',4:'Publicação e desdobramentos',5:'Contratação direta'};

const G = {
  arp:{term:'Ata de registro de preço (ARP)', def:'Documento vinculativo, com caráter de compromisso para contratação futura, em que ficam registrados o objeto, os preços, os fornecedores, os órgãos participantes e as condições da contratação, conforme o edital.', nodes:['darp','ata']},
  carona:{term:'Carona (adesão à ata)', def:'Uso, por um órgão que não participou da licitação, de uma ata gerenciada por outro órgão. Aproveita um processo já feito, desde que a demanda seja compatível e os limites legais sejam respeitados.', nodes:['ades']},
  procaux:{term:'Procedimentos auxiliares', def:'Ferramentas previstas na Lei nº 14.133/2021 para dar mais eficiência, agilidade e economia às contratações: credenciamento, pré-qualificação, PMI, sistema de registro de preços e registro cadastral. Não são modalidades de licitação.', nodes:['daux']},
  credenciamento:{term:'Credenciamento', def:'Chamamento público em que interessados que cumprem os requisitos se credenciam para executar o objeto quando convocados.', nodes:['cred']},
  prequal:{term:'Pré-qualificação', def:'Seleção prévia, por edital, que analisa as condições de habilitação dos interessados ou do objeto.', nodes:['preq']},
  pmi:{term:'Procedimento de manifestação de interesse (PMI)', def:'A administração pede à iniciativa privada estudos e projetos de soluções inovadoras.'},
  srp:{term:'Sistema de registro de preços (SRP)', def:'Procedimentos para registrar formalmente preços para contratações futuras.', nodes:['dsrp']},
  regcad:{term:'Registro cadastral', def:'Cadastro unificado de fornecedores, que agiliza contratações futuras.', nodes:['reg']},
  pca:{term:'Plano de contratações anual (PCA)', def:'Documento em que o órgão consolida as compras e contratações que pretende fazer no ano seguinte. Liga cada compra ao planejamento e ao orçamento.', nodes:['pca']},
  etp:{term:'Estudo técnico preliminar (ETP)', def:'Primeira etapa do planejamento da contratação: evidencia o problema a ser resolvido e a sua melhor solução, para permitir avaliar a viabilidade técnica e econômica. Pergunta “qual é o problema e qual a melhor solução?”.', nodes:['etp']},
  tr:{term:'Termo de referência (TR)', def:'Consolida o planejamento definitivo: objeto, fundamentação (com referência ao ETP), descrição da solução, requisitos e critérios. Responde “como essa solução será contratada?”.', nodes:['tr']},
  margem:{term:'Margem de preferência', def:'Vantagem concedida, no julgamento das propostas, a bens manufaturados e serviços nacionais que atendam a normas técnicas brasileiras e a bens reciclados, recicláveis ou biodegradáveis. Instrumento de incentivo ao desenvolvimento nacional sustentável.', nodes:['margem','itens']},
  pregao:{term:'Pregão', def:'Modalidade obrigatória para bens e serviços comuns, realizada preferencialmente na forma eletrônica, com disputa por lances.', nodes:['mod']},
  concorrencia:{term:'Concorrência', def:'Modalidade para bens e serviços especiais e obras e serviços comuns e especiais de engenharia, com critérios de julgamento específicos.', nodes:['mod']},
  concurso:{term:'Concurso', def:'Modalidade para escolha de trabalho técnico, científico ou artístico, mediante prêmios ou remuneração aos vencedores.', nodes:['mod']},
  leilao:{term:'Leilão', def:'Venda de bens inservíveis ou apreendidos, ou alienação de imóveis, a quem oferecer o maior lance.', nodes:['mod']},
  dialogo:{term:'Diálogo competitivo', def:'A administração dialoga com licitantes selecionados para desenvolver alternativas específicas quando o mercado não tem uma pronta.', nodes:['mod']},
  dispensa:{term:'Dispensa de licitação', def:'A licitação, embora juridicamente viável, é dispensada em situações previstas em lei (valores baixos, emergências).', nodes:['disp']},
  inexig:{term:'Inexigibilidade', def:'A competição é inviável, geralmente por haver fornecedor exclusivo ou pela natureza singular do objeto ou serviço.', nodes:['disp','cred']},
  habilitacao:{term:'Habilitação', def:'Verificação de que o fornecedor tem condições jurídicas, técnicas, fiscais, trabalhistas e financeiras de cumprir o contrato. Fica registrada no Sicaf.', nodes:['reg']},
  homologacao:{term:'Homologação', def:'Ato em que a autoridade competente confirma a regularidade dos atos praticados, ratifica o resultado e autoriza a assinatura do contrato.', nodes:['hom']},
  pncp:{term:'PNCP', def:'Portal Nacional de Contratações Públicas, criado pela Lei nº 14.133/2021 para divulgar os atos das contratações de todos os entes federativos: planos, editais, atas, contratos e notas fiscais.', nodes:PNCP},
  cartao:{term:'Cartão de pagamento', def:'Meio de pagamento usado pela administração para despesas de pequeno valor, que dispensa a formalização de um contrato e exige prestação de contas.', nodes:['cart']},
  sicx:{term:'Sicx (Sistema de Compras Expressas)', def:'Sistema em que será feito o credenciamento via comércio eletrônico. Regulamentado em agosto de 2026, ainda não opera: depende do Registro Cadastral Unificado, previsto para o último trimestre de 2026.', nodes:['cred']},
  sicaf:{term:'Sicaf', def:'Sistema de Cadastramento Unificado de Fornecedores, onde fica registrada a habilitação.', nodes:['reg']},
  catalogo:{term:'Catálogo de Bens e Serviços', def:'Reúne os itens e fornecedores aprovados na pré-qualificação.', nodes:['cat']},
};

const D = {
  io:{p:['Ponto de partida do órgão público. O processo nasce dentro da administração, antes de qualquer contato com o mercado.']},
  nec:{p:['Tudo começa quando o órgão identifica a necessidade de comprar um produto ou contratar um serviço.']},
  darp:{p:['A primeira pergunta do fluxo não é como licitar, e sim se já existe uma ata de registro de preço compatível com a demanda.','<span class="yes">Sim</span> adesão à ata existente. <span class="no">Não</span> planejamento de uma nova contratação.'],g:['arp']},
  ades:{p:['O órgão adere à ata e segue direto para o contrato, sem planejar uma licitação própria. A ata pode ser gerenciada pelo próprio órgão ou por outro, sempre dentro das regras da lei.'],g:['carona']},
  fcA:{p:['Círculo de fim com ícone de saída: dali o caminho continua no subprocesso de gestão do contrato, detalhado em outro desenho.']},
  plan:{p:['O órgão produz estudos e documentos e decide quais procedimentos e instrumentos vai usar.','Duas entradas condicionam essa fase: o orçamento e o plano de contratações anual. A compra deve conversar com o planejamento estratégico e com os recursos disponíveis.']},
  orc:{p:['Os recursos disponíveis do órgão condicionam o planejamento da compra.']},
  pca:{p:['Entrada da fase preparatória, ao lado do orçamento.'],g:['pca']},
  daux:{p:['<span class="yes">Sim</span> credenciamento via comércio eletrônico ou pré-qualificação.','<span class="no">Não</span> o órgão segue para os instrumentos de planejamento da contratação.'],g:['procaux']},
  cred:{p:['Forma de contratação direta por inexigibilidade de licitação, feita no Sistema de Compras Expressas (Sicx).'],alert:'<b>O Sicx foi regulamentado, mas ainda não está operando.</b> A lei foi sancionada em novembro de 2025 e o decreto publicado em agosto de 2026. O sistema depende do Registro Cadastral Unificado, previsto para o último trimestre de 2026.',g:['credenciamento']},
  preq:{p:['Os itens e fornecedores aprovados passam a integrar o <a href="https://catalogo.compras.gov.br/cnbs-web/busca" target="_blank" rel="noopener">Catálogo de Bens e Serviços</a>.'],g:['prequal']},
  cat:{p:['Instrumento que recebe os itens e fornecedores aprovados na pré-qualificação. <a href="https://catalogo.compras.gov.br/cnbs-web/busca" target="_blank" rel="noopener">Abrir o catálogo</a>.']},
  etp:{p:['Primeiro documento do bloco de instrumentos de planejamento.'],g:['etp']},
  itens:{p:['Aqui se decide se cabe aplicar a margem de preferência, quando o produto ou serviço se enquadra no art. 26 da Lei nº 14.133/2021.'],g:['margem']},
  margem:{p:['Usa o poder de compra do Estado para favorecer produtos nacionais e bens reciclados, recicláveis ou biodegradáveis. É o ponto em que o fluxo deixa de ser só administrativo.'],g:['margem']},
  tr:{p:['Registrado no PNCP.'],g:['tr']},
  mod:{p:['O órgão escolhe, entre as modalidades e hipóteses da Lei nº 14.133/2021, a mais adequada ao objeto, considerando valor estimado, natureza do objeto e complexidade técnica. Alternativamente, a contratação pode ser direta, sem disputa entre fornecedores.'],g:['pregao','concorrencia','concurso','leilao','dialogo','dispensa','inexig'],compact:true},
  risc:{p:['Identificação e avaliação dos riscos que podem impactar a contratação, com definição de medidas de mitigação.']},
  est:{p:['Pesquisa de mercado para definir o valor referencial da contratação, registrada no PNCP.']},
  edi:{p:['Reúne as regras do certame (ou da contratação direta), o objeto, as condições de participação, os critérios de julgamento e os anexos técnicos necessários.']},
  pub:{p:['Virada da fase interna para a fase externa: a intenção de contratar se torna pública.','Daqui o fluxo se divide em dois caminhos: licitação (concorrência ou pregão) e contratação direta.'],g:['pncp']},
  ifor:{p:['Ponto de partida do fornecedor. Sua raia corre em paralelo à do órgão, e o registro cadastral pode acontecer antes e independentemente de qualquer licitação.']},
  reg:{p:['Para participar, o interessado se cadastra no Sicaf/PNCP e se submete às habilitações: jurídica; técnica; fiscal, social e trabalhista; econômico-financeira.'],g:['habilitacao','regcad']},
  prop:{p:['Os fornecedores habilitados apresentam suas propostas e, quando aplicável, disputam lances entre si.']},
  anl:{p:['Único ponto em que as duas raias se encontram. O órgão analisa as propostas e seleciona o fornecedor de acordo com os critérios do edital.']},
  dsrp:{p:['<span class="yes">Sim</span> formaliza-se a ata de registro de preço.','<span class="no">Não</span> homologação, contrato e gestão do contrato.'],g:['srp']},
  ata:{p:['A licitação por SRP termina num compromisso para contratações futuras, não numa compra imediata.'],g:['arp']},
  farp:{p:['Fim do caminho licitatório por SRP. A partir daqui, a adesão à ARP indica que a ata gera contratos, inclusive de outros órgãos. Volte ao início do desenho: é a mesma ata da primeira pergunta.']},
  hom:{p:['Etapa da via licitatória quando não há SRP.'],g:['homologacao']},
  contL:{p:['Celebração do contrato com o fornecedor selecionado, que leva à gestão do contrato.']},
  gest:{p:['Subprocesso detalhado em outro desenho (ícone +). O fluxo desta etapa termina aqui.']},
  disp:{p:['Quando não há disputa entre fornecedores, após a publicação percorrem-se as opções de contratação direta. O rito é mais simples e tem uma única decisão.','Contratar sem licitação não é contratar sem planejamento: até a publicação, dispensa e inexigibilidade passaram pelos mesmos instrumentos.'],g:['dispensa','inexig']},
  dval:{p:['O limite de R$ 65 mil corresponde, arredondado, ao valor da dispensa para compras e serviços em geral (art. 75, II, da Lei nº 14.133/2021).','O valor é atualizado anualmente por decreto: em 2026, é de R$ 65.492,11 (Decreto nº 12.807/2025).']},
  cart:{p:['Abaixo do limite, a compra pode ser paga com cartão de pagamento.'],g:['cartao']},
  ext:{p:['Depois do pagamento com cartão, emite-se um extrato registrado no PNCP.']},
  fimC:{p:['Fim do caminho do cartão de pagamento.']},
  contD:{p:['Acima do limite, celebra-se o contrato, que segue para a gestão do contrato, como na via licitatória.']},
  fcD:{p:['Círculo de fim com ícone de saída: continua no subprocesso de gestão do contrato.']},
};

const detail = document.getElementById('detail');
function emptyDetail(){
  detail.innerHTML = `<p class="kicker">Etapa</p><p class="empty">Toque em qualquer forma do desenho para ver <b>o que acontece</b>, <b>quem faz</b> e os <b>termos</b> ligados a ela.</p><p class="empty">As etiquetas em rosa-escuro e rosa-claro indicam o sistema em que a etapa é registrada.</p>`;
}
function detalheHTML(id){
  const n = N[id], d = D[id] || {p:[]}, [tn, tc] = TYPE[n.t];
  const title = n.title || n.label.replace(/\n/g,' ');
  const tags = (n.tags||[]).map(t=>`<span class="sys${t==='PNCP'?'':' p'}">${t}</span>`).join(' ');
  let h = `<div class="chipline"><span class="tchip"><i style="background:var(${tc})"></i>${tn}</span>${tags}</div>`;
  h += `<h3>${title}</h3>`;
  h += d.p.map(x=>`<p>${x}</p>`).join('');
  if (n.note) h += `<p class="ui" style="font-size:14px;color:var(--muted)">Norma: ${n.note}, Lei nº 14.133/2021</p>`;
  if (d.alert) h += `<div class="alert">${d.alert}</div>`;
  if (d.g) {
    if (d.compact) h += `<dl class="mods">` + d.g.map(k=>`<dt>${G[k].term}</dt><dd>${G[k].def}</dd>`).join('') + `</dl>`;
    else h += d.g.map(k=>`<div class="gloss"><span class="lbl">Glossário</span><b>${G[k].term}.</b> ${G[k].def}</div>`).join('');
  }
  h += `<p class="ui" style="font-size:13px;color:var(--muted);margin-top:14px">Lupa ${n.lupa} · ${LUPA[n.lupa]}</p>`;
  return h;
}
function showDetail(id){ detail.innerHTML = detalheHTML(id); }

/* ---------- CONCEITOS ---------- */
const C = [
  {id:'ciclo', nome:'Ciclo de políticas públicas', def:'Modelo simples que organiza uma política em fases: agenda, formulação, tomada de decisão, implementação e avaliação.', onde:'O fluxo inteiro é um retrato da implementação: mostra como uma decisão (comprar) se transforma em entrega concreta (o bem ou serviço).', nodes:'all', strip:true},
  {id:'atores', nome:'Atores', def:'Pessoas, organizações e grupos que participam de uma política.', onde:'Os dois atores principais têm raias próprias: o órgão público (quem compra) e o fornecedor (quem vende). Elas se tocam num único ponto, a análise de propostas.', nodes:['ifor','reg','prop','anl'], lanes:true},
  {id:'fases', nome:'Fase interna e fase externa', def:'A fase interna (preparatória) acontece dentro do órgão: planejamento, estudos, documentos. A fase externa começa com a publicação do edital ou aviso, quando o mercado e a sociedade passam a participar e a acompanhar.', onde:'A publicação no PNCP é a linha que divide o desenho em dois.', nodes:['pub'], phase:true},
  {id:'governanca', nome:'Governança das contratações', def:'Conjunto de estruturas, processos e controles que garantem que as compras sigam a estratégia do órgão, gerem resultado e evitem riscos.', onde:'O plano de contratações anual e a análise de riscos são peças dessa governança.', nodes:['pca','orc','plan','risc']},
  {id:'transparencia', nome:'Transparência ativa', def:'Divulgação de informações por iniciativa do próprio poder público, sem que alguém precise pedir.', onde:'O registro sistemático no PNCP: termo de referência, estimativa de preço, publicação, cadastro do fornecedor e extrato do cartão.', nodes:PNCP},
  {id:'accountability', nome:'Accountability (prestação de contas)', def:'Dever de quem gere recursos públicos de explicar e justificar suas decisões e se submeter ao controle social.', onde:'Os registros, atestes e extratos do fluxo produzem a memória que permite esse controle. O cartão dispensa contrato, mas exige prestação de contas.', nodes:['pub','hom','cart','ext']},
  {id:'poder', nome:'Poder de compra do Estado', def:'O volume de compras do setor público é grande o bastante para influenciar mercados. Por isso, a compra pública pode ser usada como recurso de inovação, fortalecimento da produção nacional ou práticas sustentáveis.', onde:'A margem de preferência, decidida na definição dos itens.', nodes:['itens','margem']},
  {id:'dns', nome:'Desenvolvimento nacional sustentável', def:'Um dos objetivos das contratações na Lei nº 14.133/2021, ao lado da proposta mais vantajosa e da competição justa.', onde:'Aparece no fluxo na margem de preferência.', nodes:['margem']},
  {id:'economicidade', nome:'Economicidade e vantajosidade', def:'Economicidade é obter o melhor resultado com o menor custo possível; vantajosidade é o critério que justifica escolhas como a carona em uma ata ou a prorrogação de um contrato contínuo.', onde:'A pergunta inicial sobre a ata e a adesão por carona.', nodes:['darp','ades']},
  {id:'isonomia', nome:'Isonomia e competitividade', def:'Princípios que garantem tratamento igual aos fornecedores e disputa real entre eles. São a razão de a licitação ser a regra e a contratação direta, a exceção.', onde:'Na via licitatória, fornecedores habilitados disputam propostas e lances em condições iguais.', nodes:['pub','reg','prop','anl']},
];
const cOpt = c => ({phase:c.phase, lanes:c.lanes});
const STRIP = ['Agenda','Formulação','Tomada de decisão','Implementação','Avaliação'];
const stripHtml = () => `<div class="strip">${STRIP.map(s=>`<span class="${s==='Implementação'?'on':''}">${s}</span>`).join('')}</div>`;

const cWrap = document.getElementById('concepts');
C.forEach((c,i)=>{
  const art = document.createElement('article');
  art.className = 'cc';
  art.innerHTML = `<div class="mini-wrap"><svg class="dg mini" aria-hidden="true"></svg></div>
    <div class="body"><h3>${c.nome}</h3><p>${c.def}</p>${c.strip?stripHtml():''}<p class="onde"><b>No fluxo:</b> ${c.onde}</p>
    <button type="button" class="btn" data-c="${c.id}">Ver no explorador</button></div>`;
  cWrap.appendChild(art);
  const R = render(art.querySelector('svg'), {pfx:'c'+i, mini:true});
  focus(R, c.nodes, cOpt(c));
});
cWrap.addEventListener('click', e=>{
  const b = e.target.closest('button[data-c]'); if (!b) return;
  setMode('conc'); selectConcept(b.dataset.c);
  document.getElementById('explore').scrollIntoView({behavior: reduce?'auto':'smooth'});
});

/* ---------- EXPLORADOR ---------- */
const exSvg = document.getElementById('exSvg');
exSvg.dataset.par = 'xMidYMid meet';
const ex = render(exSvg, {pfx:'ex', interactive:true});
const canvas = document.getElementById('exCanvas');
const panel = document.getElementById('exPanel');
let mode = 'path', selected = null, concept = 'ciclo';
const st = {arp:'nao', aux:'nao', via:'lic', srp:'nao', val:'sim'};

function caminho(s){
  const n = ['io','nec','darp'];
  if (s.arp==='sim') return n.concat(['ades','fcA']);
  n.push('plan','orc','pca','daux');
  if (s.aux==='cred') return n.concat(['cred']);
  if (s.aux==='preq') return n.concat(['preq','cat']);
  n.push('etp','itens','margem','tr','mod','risc','est','edi','pub');
  if (s.via==='lic') { n.push('ifor','reg','prop','anl','dsrp'); return n.concat(s.srp==='sim' ? ['ata','farp'] : ['hom','contL','gest']); }
  n.push('disp','dval');
  return n.concat(s.val==='sim' ? ['cart','ext','fimC'] : ['contD','fcD']);
}
const FIM = {fcA:'contrato por adesão a uma ata existente', cred:'credenciamento no Sicx, que ainda não opera', cat:'Catálogo de Bens e Serviços', farp:'uma ata de registro de preço, que abastece futuras adesões', gest:'gestão do contrato', fimC:'pagamento com cartão e extrato no PNCP', fcD:'contrato, que segue para a gestão'};

const Q = [
  {k:'arp', l:'Existe ARP compatível?', o:[['sim','Sim'],['nao','Não']], show:()=>true},
  {k:'aux', l:'Procedimento auxiliar?', o:[['nao','Não'],['cred','Credenciamento'],['preq','Pré-qualificação']], show:s=>s.arp==='nao'},
  {k:'via', l:'Depois da publicação', o:[['lic','Licitação'],['dir','Contratação direta']], show:s=>s.arp==='nao'&&s.aux==='nao'},
  {k:'srp', l:'É SRP?', o:[['sim','Sim'],['nao','Não']], show:s=>s.arp==='nao'&&s.aux==='nao'&&s.via==='lic'},
  {k:'val', l:'Abaixo de R$ 65 mil?', o:[['sim','Sim'],['nao','Não']], show:s=>s.arp==='nao'&&s.aux==='nao'&&s.via==='dir'},
];

function drawPath(scroll){
  const nodes = caminho(st);
  focus(ex, nodes, {});
  const etapas = nodes.filter(id=>['orgao','forn','lic','dir','fora'].includes(N[id].t)).length;
  const dec = nodes.filter(id=>N[id].t==='dec').length;
  const pn = nodes.filter(id=>(N[id].tags||[]).includes('PNCP')).length;
  const last = nodes[nodes.length-1];
  const qs = Q.filter(q=>q.show(st)).map((q,i)=>
    `${i?'<span class="qarrow" aria-hidden="true">→</span>':''}<div class="qg"><span class="ql">${q.l}</span><div class="opts" role="group" aria-label="${q.l}">${q.o.map(([v,t])=>`<button type="button" data-k="${q.k}" data-v="${v}" aria-pressed="${st[q.k]===v}">${t}</button>`).join('')}</div></div>`).join('');
  panel.innerHTML = `<div class="qs">${qs}</div>
    <div class="summary"><span class="stat"><span class="n">${etapas}</span> etapas</span><span class="stat"><span class="n">${dec}</span> ${dec===1?'decisão':'decisões'}</span><span class="stat"><span class="n">${pn}</span> ${pn===1?'registro':'registros'} no PNCP</span>
    <p class="end">Este caminho termina em <b>${FIM[last]}</b>.</p></div>`;
  if (scroll) scrollToNode(last);
}
function selectConcept(id){
  concept = id;
  const c = C.find(x=>x.id===id);
  focus(ex, c.nodes, cOpt(c));
  panel.innerHTML = `<div class="chips" role="group" aria-label="Conceitos">${C.map(x=>`<button type="button" data-cid="${x.id}" aria-pressed="${x.id===id}">${x.nome}</button>`).join('')}</div>
    <div class="cdef"><b class="ui">${c.nome}.</b> ${c.def}${c.strip?'<div style="margin-top:8px">'+stripHtml()+'</div>':''}<p><b class="ui">No fluxo:</b> ${c.onde}</p></div>`;
}
function setMode(m){
  mode = m;
  document.getElementById('mPath').setAttribute('aria-pressed', m==='path');
  document.getElementById('mConc').setAttribute('aria-pressed', m==='conc');
  if (m==='path') drawPath(false); else selectConcept(concept);
}
document.getElementById('mPath').onclick = ()=>setMode('path');
document.getElementById('mConc').onclick = ()=>setMode('conc');
panel.addEventListener('click', e=>{
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.k) { st[b.dataset.k] = b.dataset.v; drawPath(true); }
  if (b.dataset.cid) selectConcept(b.dataset.cid);
});

function scrollToNode(id){
  // com o desenho inteiro à vista não há o que centralizar
  if (ex.vb[2] >= W * .98) return;
  centrarEm(ex, id);
}
function select(id){
  if (selected) ex.nodes[selected].classList.remove('sel');
  selected = id;
  ex.nodes[id].classList.add('sel');
  showDetail(id);
}
exSvg.addEventListener('click', e=>{ const g = e.target.closest('.node'); if (g) select(g.dataset.id); });
exSvg.addEventListener('keydown', e=>{
  if (e.key!=='Enter' && e.key!==' ') return;
  const g = e.target.closest('.node'); if (!g) return;
  e.preventDefault(); select(g.dataset.id);
});
const exPZ = panZoom(ex);
document.getElementById('zIn').onclick = () => exPZ.zoom(1.4);
document.getElementById('zOut').onclick = () => exPZ.zoom(1/1.4);
document.getElementById('zFit').onclick = () => animateView(ex, [0, 0, W, H]);
// começa aproximado no início do fluxo, como o antigo "Ampliado"
setView(ex, [0, 120, W/2, H/2 * 1.25]);

emptyDetail();
setMode('path');

/* ---------- GLOSSÁRIO ---------- */
const glist = document.getElementById('glist');
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const gEntries = Object.entries(G).sort((a,b)=>a[1].term.localeCompare(b[1].term,'pt'));
glist.innerHTML = gEntries.map(([k,g])=>`<div class="gi" data-s="${norm(g.term+' '+g.def)}"><h3>${g.term}</h3><p>${g.def}</p>${g.nodes?`<button type="button" data-g="${k}">Ver no fluxo</button>`:''}</div>`).join('');
document.getElementById('gq').addEventListener('input', e=>{
  const q = norm(e.target.value.trim()); let n = 0;
  glist.querySelectorAll('.gi').forEach(el=>{ const ok = !q || el.dataset.s.includes(q); el.hidden = !ok; if (ok) n++; });
  document.getElementById('gempty').hidden = n>0;
});
glist.addEventListener('click', e=>{
  const b = e.target.closest('button[data-g]'); if (!b) return;
  const g = G[b.dataset.g];
  focus(ex, g.nodes, {});
  select(g.nodes[0]);
  document.getElementById('explore').scrollIntoView({behavior: reduce?'auto':'smooth'});
  setTimeout(()=>scrollToNode(g.nodes[0]), reduce?0:450);
});
})();
