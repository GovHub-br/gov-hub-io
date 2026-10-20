// Mapa da trilha (mapa.html?trilha=<slug>#nivel-N): a lógica da trilha, o progresso e um nível por vez,
// montados a partir de docs/trilhas/<slug>.json. Desenho do protótipo da designer (hub, 2_6).
import { progresso } from './progresso.js';
import { montarTopo } from './topo.js';
import { carregarCatalogo, carregarTrilha, escolherTrilha } from './trilha.js';
import { contar, hrefDoItem } from './progresso-nucleo.js';
import { nivelPadrao, papelVisual, niveisConcluidos, pdfDaTrilha, emBreve } from './hub-nucleo.js';
import { montarCelebracao } from './celebracao.js';
import { el, svg, ICONES } from './dom.js';

const $ = (id) => document.getElementById(id);
const ROTULO_PAPEL = { essencial: 'Essencial', apoio: 'Apoio', marco: 'Marco' };
const CHAVE_LOGICA = 'govhub-logica-recolhida';

montarTopo(progresso);

const pedido = new URLSearchParams(location.search).get('trilha');
let catalogo = null;
try { catalogo = await carregarCatalogo(); } catch { catalogo = null; }
// mapa.html sem ?trilha= (ou com uma que não existe): a trilha da última aula, senão dashboards, senão a primeira.
const ultima = progresso.ultimaAula();
const slug = [pedido, ultima && ultima.trilha, 'dashboards']
  .find((s) => s && escolherTrilha(catalogo, s) === s) || escolherTrilha(catalogo, null);
let trilha = null;
if (slug) { try { trilha = await carregarTrilha(slug); } catch { trilha = null; } }

// `**trecho**` vira <b>; o resto é texto (vem de trilhas/<slug>.md, mas nunca como HTML).
function comNegrito(texto) {
  return texto.split(/\*\*(.+?)\*\*/).map((parte, i) => (i % 2 ? el('b', {}, parte) : parte));
}

function montarLogica() {
  if (!trilha.etapas) return;
  $('logica').hidden = false;
  $('logica-seta').replaceChildren(svg(ICONES.seta));
  $('logica-sub').textContent = trilha.etapas_subtitulo || '';
  $('logica-sub').hidden = !trilha.etapas_subtitulo;
  $('etapas').replaceChildren(...trilha.etapas.map((e, i) => el('li', {},
    i ? el('span', { class: 'stage-arrow', 'aria-hidden': 'true' }, '→') : null,
    el('span', { class: 'stage-pill-group' },
      el('span', { class: 'stage-pill' }, e.rotulo),
      el('span', { class: 'stage-box' }, e.caixa)))));
  if (trilha.etapas_nota) { $('logica-nota').replaceChildren(...comNegrito(trilha.etapas_nota)); $('logica-nota').hidden = false; }
  const recolher = (sim) => {
    $('logica').classList.toggle('collapsed', sim);
    $('logica-botao').setAttribute('aria-expanded', String(!sim));
    $('logica-rotulo').textContent = sim ? 'Ver mais' : 'Ocultar';
    try { localStorage.setItem(CHAVE_LOGICA, sim ? '1' : '0'); } catch { /* sem armazenamento */ }
  };
  $('logica-botao').addEventListener('click', () => recolher(!$('logica').classList.contains('collapsed')));
  let recolhida = false;
  try { recolhida = localStorage.getItem(CHAVE_LOGICA) === '1'; } catch { /* sem armazenamento */ }
  recolher(recolhida);
}

function nivelDaUrl() {
  const m = location.hash.match(/^#nivel-(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return trilha.niveis.some((x) => x.numero === n) ? n : null;
}

function cartaoAula(item) {
  const papel = papelVisual(item.papel);
  return el('li', {}, el('div', { class: 'item-card ' + papel, 'data-id': item.id },
    el('button', {
      class: 'item-check', type: 'button', 'aria-pressed': 'false', 'aria-label': 'Marcar como concluída: ' + item.titulo,
      onclick: () => progresso.alternar([item.id]),
    }, el('span', { class: 'ring' }, svg(ICONES.check))),
    el('div', { class: 'item-body' },
      el('div', { class: 'tipo-aula' }, el('img', { src: item.icone, alt: '' }), el('span', {}, item.tipo_nome)),
      el('a', { class: 'item-title-link', href: hrefDoItem(slug, item) }, item.titulo),
      el('div', { class: 'item-tags' }, el('span', { class: 'tag ' + papel }, ROTULO_PAPEL[papel])))));
}

let nivelAtual = null;
function montarNivel(numero, { foco = false } = {}) {
  nivelAtual = numero;
  const i = trilha.niveis.findIndex((n) => n.numero === numero);
  const nivel = trilha.niveis[i];
  const anterior = trilha.niveis[i - 1];
  const proximo = trilha.niveis[i + 1];
  const titulo = el('h2', { id: 'nivel-titulo', tabindex: '-1' }, `Nível ${nivel.numero} · ${nivel.titulo}`);
  $('painel').replaceChildren(
    el('section', { class: 'panel-head', 'aria-labelledby': 'nivel-titulo' },
      el('div', { class: 'panel-head-top' },
        nivel.icone ? el('span', { class: 'panel-icon' }, el('img', { src: nivel.icone, alt: '' })) : null,
        el('div', {}, nivel.etapa ? el('span', { class: 'panel-stage-pill' }, nivel.etapa) : null, titulo)),
      nivel.descricao ? el('p', { class: 'desc' }, nivel.descricao) : null,
      emBreve(nivel) ? null : el('div', { class: 'panel-progress-row' },
        el('div', { class: 'panel-progress-track', 'aria-hidden': 'true' }, el('div', { class: 'panel-progress-fill', id: 'nivel-barra' })),
        el('span', { class: 'panel-progress-label', id: 'nivel-contador' }))),
    emBreve(nivel)
      ? el('div', { class: 'nivel-em-breve' },
        el('span', { class: 'track-soon-badge' }, 'Em breve'),
        el('p', {}, 'Este nível ainda está em produção. As aulas aparecem aqui assim que forem publicadas.'))
      : el('ul', { class: 'item-grid', 'aria-label': 'Aulas do nível ' + nivel.numero }, ...nivel.itens.map(cartaoAula)),
    el('nav', { class: 'panel-nav', 'aria-label': 'Outros níveis' },
      el('span', {}, anterior ? el('a', { href: '#nivel-' + anterior.numero }, `← Nível ${anterior.numero} · ${anterior.titulo}`) : null),
      el('span', {}, proximo ? el('a', { href: '#nivel-' + proximo.numero }, `Nível ${proximo.numero} · ${proximo.titulo} →`) : null)));
  pintar();
  if (foco) titulo.focus({ preventScroll: true });
}

function montarNiveis() {
  $('niveis').replaceChildren(...trilha.niveis.map((n) => el('li', {},
    el('a', { class: 'trail-nav-item' + (emBreve(n) ? ' em-breve' : ''), href: '#nivel-' + n.numero, 'data-nivel': n.numero },
      el('span', { class: 'trail-nav-num', 'aria-hidden': 'true' }, String(n.numero)),
      el('span', { class: 'trail-nav-text' },
        el('span', { class: 't' }, el('span', { class: 'sr-only' }, `Nível ${n.numero}: `), n.titulo),
        el('span', { class: 'meta' }))))));
}

function pintar() {
  const feitos = progresso.feitos();
  const c = contar(feitos, trilha.niveis);
  // No topo, o andamento é por nível; na lista de níveis e no painel, por aula.
  const nv = niveisConcluidos(feitos, trilha.niveis);
  $('progresso-texto').textContent = `${nv.feitos} de ${nv.total} níveis concluídos`;
  $('progresso-barra').style.width = nv.percentual + '%';
  $('limpar').disabled = c.feitas === 0;
  document.querySelectorAll('.trail-nav-item').forEach((a) => {
    const n = c.porNivel[a.dataset.nivel];
    const futuro = a.classList.contains('em-breve');
    const completo = !futuro && n.total > 0 && n.feitas === n.total;
    a.classList.toggle('complete', completo);
    if (Number(a.dataset.nivel) === nivelAtual) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    a.querySelector('.trail-nav-num').replaceChildren(completo ? svg(ICONES.check) : a.dataset.nivel);
    a.querySelector('.meta').textContent = futuro ? 'Em breve' : `${n.feitas}/${n.total} concluídos`;
  });
  document.querySelectorAll('.item-card').forEach((card) => {
    const feito = !!feitos[card.dataset.id];
    card.classList.toggle('done', feito);
    const b = card.querySelector('.item-check');
    b.setAttribute('aria-pressed', String(feito));
  });
  const n = c.porNivel[nivelAtual];
  if (n && n.total && $('nivel-barra')) {
    $('nivel-barra').style.width = Math.round((n.feitas / n.total) * 100) + '%';
    $('nivel-contador').textContent = `${n.feitas}/${n.total} concluídos`;
  }
  $('banner-quiz').hidden = !(temQuiz && c.feitas === c.total);
  if (celebracao) celebracao.verificar();
}

// ---- Limpar o progresso desta trilha ---------------------------------------------------
function montarLimpar() {
  const fundo = $('confirmar');
  let antes = null;
  const fechar = () => { fundo.hidden = true; if (antes) antes.focus(); };
  $('limpar').addEventListener('click', () => {
    const ids = trilha.niveis.flatMap((n) => n.itens.map((i) => i.id)).filter((id) => progresso.feitos()[id]);
    $('confirmar-texto').textContent = (ids.length === 1 ? 'Isso desmarca a aula concluída desta trilha. ' : `Isso desmarca as ${ids.length} aulas concluídas desta trilha. `) +
      'Uma aula que também está em outra trilha fica desmarcada lá também. Não dá para desfazer.';
    antes = document.activeElement;
    fundo.hidden = false;
    $('confirmar-nao').focus();
  });
  $('confirmar-nao').addEventListener('click', fechar);
  $('confirmar-sim').addEventListener('click', () => {
    const ids = trilha.niveis.flatMap((n) => n.itens.map((i) => i.id)).filter((id) => progresso.feitos()[id]);
    if (ids.length) progresso.alternar(ids);   // todas feitas: alternar desmarca
    fechar();
  });
  fundo.addEventListener('click', (ev) => { if (ev.target === fundo) fechar(); });
  document.addEventListener('keydown', (ev) => {
    if (fundo.hidden) return;
    if (ev.key === 'Escape') fechar();
    if (ev.key === 'Tab') {
      const lista = [$('confirmar-nao'), $('confirmar-sim')];
      const i = lista.indexOf(document.activeElement);
      if (ev.shiftKey && i <= 0) { ev.preventDefault(); lista[1].focus(); }
      else if (!ev.shiftKey && i === lista.length - 1) { ev.preventDefault(); lista[0].focus(); }
    }
  });
}

let temQuiz = false;
let celebracao = null;
if (!trilha) {
  $('trilha-titulo').textContent = 'Trilha não encontrada';
  $('painel').replaceChildren(el('p', { class: 'msg' }, 'Não foi possível carregar esta trilha. ',
    el('a', { href: 'index.html#trilhas', class: 'btn-link' }, 'Ver todas as trilhas')));
  $('progresso-texto').textContent = '';
  $('limpar').hidden = true;
} else {
  if (pedido !== slug) history.replaceState(null, '', 'mapa.html?trilha=' + encodeURIComponent(slug) + location.hash);
  document.title = trilha.titulo + ' · Gov Hub';
  $('trilha-titulo').textContent = trilha.titulo;
  $('trilha-chamada').textContent = trilha.chamada || trilha.descricao;
  $('trilha-pdf').href = pdfDaTrilha(slug);
  $('trilha-pdf').replaceChildren(svg(ICONES.baixar), 'Baixar a trilha em PDF');
  $('trilha-pdf').hidden = false;
  temQuiz = !!trilha.quiz;
  $('banner-quiz').href = 'quiz.html?trilha=' + encodeURIComponent(slug);
  celebracao = montarCelebracao(progresso, slug, trilha, { temQuiz });
  montarLogica();
  montarNiveis();
  montarLimpar();
  montarNivel(nivelDaUrl() ?? nivelPadrao(progresso.feitos(), trilha.niveis));
  window.addEventListener('hashchange', () => {
    const n = nivelDaUrl();
    if (n !== null && n !== nivelAtual) montarNivel(n, { foco: true });
  });
  progresso.aoMudar(pintar);
}
