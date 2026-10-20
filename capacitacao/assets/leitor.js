// Página da aula (doc.html): aulas do nível à esquerda, aula em Markdown, avaliação e a sequência
// anterior/próxima, sem recarregar a página. Links antigos doc.html?path=... continuam valendo.
import { progresso } from './progresso.js';
import { carregarCatalogo, carregarTrilha, escolherTrilha, trilhaParaDoc } from './trilha.js';
import { montarTopo } from './topo.js';
import { el, svg, ICONES } from './dom.js';
import { montarFeedback } from './feedback.js';
import { montarCelebracao } from './celebracao.js';
import { caminhoSeguro } from './caminho.js';
import { hrefDoItem, idDoDoc, localizar, todosFeitos, vizinhos } from './progresso-nucleo.js';
import { nivelPadrao, papelVisual, pdfDaAula } from './hub-nucleo.js';

const $ = (id) => document.getElementById(id);
const feedback = montarFeedback($('feedback'), progresso);
let niveis = [];
let trilha = null;   // objeto da trilha aberta
let slug = null;     // slug da trilha aberta
let atual = { path: null, item: null };   // item: nó da trilha, ou null para página fora dela
let celebracao = null;
const ROTULO_PAPEL = { essencial: 'Essencial', apoio: 'Apoio', marco: 'Marco' };

// ---- URL e Markdown -----------------------------------------------------------
function lerUrl() {
  const p = new URLSearchParams(location.search);
  const bruto = p.get('path') || 'README.md';
  // Só normaliza o que é seguro; o resto chega intacto a abrir(), que o recusa sem buscar.
  return { trilha: p.get('trilha'), path: caminhoSeguro(bruto) ? bruto.replace(/^\.?\/+/, '') : bruto };
}
function resolver(base, rel) {
  const dir = base.includes('/') ? base.slice(0, base.lastIndexOf('/') + 1) : '';
  const u = new URL(dir + rel, 'http://_/');
  return decodeURIComponent(u.pathname.slice(1));
}
function slugDe(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function idsNosTitulos(raiz) {
  raiz.querySelectorAll('h1,h2,h3,h4').forEach((h) => { if (!h.id) h.id = slugDe(h.textContent); });
}
// Links relativos do .md apontam para outros .md: viram doc.html?trilha=...&path=... (e o leitor
// intercepta o clique). Imagens relativas são resolvidas a partir da pasta do documento.
function corrigirLinks(raiz, path) {
  raiz.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href)) return;
    const i = href.indexOf('#');
    const frag = i >= 0 ? href.slice(i) : '';
    const semFrag = i >= 0 ? href.slice(0, i) : href;
    const q = semFrag.indexOf('?');
    const busca = q >= 0 ? semFrag.slice(q) : '';   // ?query de links para outras páginas (ex.: ../mapa.html?trilha=...)
    const alvo = q >= 0 ? semFrag.slice(0, q) : semFrag;
    if (alvo === '') { a.setAttribute('href', frag); return; }
    let r = resolver(path, alvo);
    if (r.endsWith('/')) r += 'index.md';
    a.setAttribute('href', r.endsWith('.md') ? 'doc.html?trilha=' + encodeURIComponent(slug) + '&path=' + r + frag : r + busca + frag);
  });
  raiz.querySelectorAll('img[src]').forEach((img) => {
    const s = img.getAttribute('src');
    if (!s || /^[a-z]+:/i.test(s) || s.startsWith('/')) return;
    img.setAttribute('src', resolver(path, s));
  });
}

// Blocos ```mermaid viram diagramas. A biblioteca só é baixada quando a aula tem diagrama; sem ela
// (CDN bloqueado), o bloco continua visível como código — o conteúdo nunca desaparece.
let mermaidPronto = null;
let diagramas = 0;
function carregarMermaid() {
  if (!mermaidPronto) {
    mermaidPronto = new Promise((ok, falha) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
      s.onload = () => {
        // Cores literais da paleta de assets/govhub.css: o Mermaid não lê variáveis CSS.
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          fontSize: 15,
          fontFamily: "'Reddit Sans',-apple-system,BlinkMacSystemFont,sans-serif",
          // useMaxWidth:false — com true, o Mermaid estica diagramas pequenos até a largura
          // da página e o texto muda de escala entre um diagrama e outro.
          flowchart: { padding: 12, nodeSpacing: 45, rankSpacing: 55, useMaxWidth: false },
          themeVariables: {
            primaryColor: '#F2F1F6', primaryTextColor: '#0A005A', primaryBorderColor: '#613EFF',
            secondaryColor: '#FFFFFF', secondaryTextColor: '#0A005A', secondaryBorderColor: '#BE006E',
            tertiaryColor: '#FFFFFF', tertiaryBorderColor: '#E9DFFF',
            lineColor: '#0A005A', textColor: '#2D3748', fontSize: '15px',
          },
        });
        ok(window.mermaid);
      };
      s.onerror = () => { mermaidPronto = null; s.remove(); falha(new Error('mermaid')); };
      document.head.append(s);
    });
  }
  return mermaidPronto;
}
function desenharDiagramas(raiz) {
  const blocos = [...raiz.querySelectorAll('pre > code.language-mermaid')];
  if (!blocos.length) return;
  // Sem esperar a fonte, o Mermaid mede as caixas com a métrica errada e corta os rótulos.
  // E cada diagrama é desenhado por mermaid.render: mermaid.run() desenha todos dentro do
  // primeiro bloco quando a página tem mais de um.
  const fontes = document.fonts && document.fonts.load
    ? document.fonts.load("15px 'Reddit Sans'").then(() => document.fonts.ready)
    : Promise.resolve();
  Promise.all([carregarMermaid(), fontes]).then(([mermaid]) => {
    blocos.forEach((code) => {
      if (!code.isConnected) return;   // a pessoa já abriu outra aula
      const fonte = code.textContent;
      const div = el('div', { class: 'mermaid' });
      code.parentNode.replaceWith(div);
      diagramas += 1;
      mermaid.render('diagrama-' + diagramas, fonte)
        .then((r) => { div.innerHTML = r.svg; })
        .catch(() => { div.replaceChildren(el('pre', {}, el('code', {}, fonte))); });
    });
  }).catch(() => {});
}

// ---- Aulas do nível (à esquerda) ------------------------------------------------------
let nivelMontado = null;
function montarNivel() {
  const item = atual.item;
  $('lateral').hidden = !item;
  document.body.classList.toggle('sem-nivel', !item);
  if (!item || item.nivel === nivelMontado) return;
  nivelMontado = item.nivel;
  const nivel = niveis.find((n) => n.numero === item.nivel);
  $('nivel-card-titulo').textContent = `Nível ${nivel.numero} · ${nivel.titulo}`;
  $('nivel-lista').replaceChildren(...nivel.itens.map((it) => el('li', {},
    el('a', { class: 'content-nav-item', href: hrefDoItem(slug, it), 'data-id': it.id },
      el('span', { class: 'content-nav-dot', 'aria-hidden': 'true' }),
      el('span', {}, it.titulo, el('span', { class: 'sr-only estado' }))))));
}

function pintarProgresso() {
  const feitos = progresso.feitos();
  document.querySelectorAll('.content-nav-item').forEach((a) => {
    const feito = !!feitos[a.dataset.id];
    a.classList.toggle('complete', feito);
    a.querySelector('.content-nav-dot').replaceChildren(...(feito ? [svg(ICONES.check)] : []));
    a.querySelector('.estado').textContent = feito ? ' (concluída)' : '';
    if (atual.item && a.dataset.id === atual.item.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  pintarRodape();
  if (celebracao) celebracao.verificar();
}

// ---- Contexto e sequência da aula -------------------------------------------------
function pintarContexto() {
  const meta = $('aula-meta');
  const item = atual.item;
  meta.hidden = !item;
  if (!item) { meta.replaceChildren(); return; }
  const papel = papelVisual(item.papel);
  meta.replaceChildren(
    el('span', { class: 'tipo-aula' }, el('img', { src: item.icone, alt: '' }), el('span', {}, item.tipo_nome)),
    el('span', { class: 'tag ' + papel }, ROTULO_PAPEL[papel]),
    el('a', { class: 'btn-pdf', href: pdfDaAula(item.id), download: '', 'aria-label': 'Baixar esta aula em PDF' },
      svg(ICONES.baixar), 'Baixar PDF'));
  const mapa = 'mapa.html?trilha=' + encodeURIComponent(slug) + '#nivel-' + item.nivel;
  $('voltar-trilha').href = mapa;
}

function pintarRodape() {
  const rodape = $('rodape-aula');
  rodape.hidden = !atual.item;
  if (!atual.item) return;
  const { anterior, proxima } = vizinhos(niveis, atual.item.id);
  const link = $('aula-anterior');
  link.hidden = !anterior;
  if (anterior) {
    link.href = hrefDoItem(slug, anterior);
    link.querySelector('.nav-btn-label').textContent = anterior.titulo;
  }
  const feita = todosFeitos(progresso.feitos(), [atual.item.id]);
  let rotulo = feita ? 'Avançar' : 'Concluir e avançar';
  if (!proxima) rotulo = feita ? 'Voltar para a trilha' : 'Concluir a trilha';
  $('aula-cta').querySelector('.nav-btn-label').textContent = rotulo;
}

function aoClicarCta() {
  if (!atual.item) return;
  const ids = [atual.item.id];
  const feita = todosFeitos(progresso.feitos(), ids);
  const { proxima } = vizinhos(niveis, atual.item.id);
  if (!feita) progresso.alternar(ids);
  if (proxima) { navegar(hrefDoItem(slug, proxima)); return; }
  // Última aula: com a trilha completa, o modal de conclusão abre aqui mesmo (celebracao.verificar);
  // senão, volta ao mapa no primeiro nível com aula pendente.
  if (celebracao && celebracao.completa() && !feita) return;
  location.href = 'mapa.html?trilha=' + encodeURIComponent(slug) + '#nivel-' + nivelPadrao(progresso.feitos(), niveis);
}

// ---- Abrir aula ---------------------------------------------------------------------
function mostrarMensagem(...partes) {
  $('conteudo').replaceChildren(el('p', { class: 'msg' }, ...partes));
}

async function abrir({ path }, { foco = false } = {}) {
  atual = { path, item: localizar(niveis, path) };
  pintarContexto();
  montarNivel();
  pintarProgresso();
  feedback.mostrar(null, slug);   // some enquanto a aula carrega
  const conteudo = $('conteudo');
  conteudo.setAttribute('aria-busy', 'true');
  try {
    // Ponto único por onde passa todo ?path= (URL inicial, links interceptados, voltar/avançar).
    if (!caminhoSeguro(path)) throw new Error('caminho não permitido');
    const r = await fetch(path);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const md = await r.text();
    if (path !== atual.path) return;   // outra aula foi aberta enquanto esta carregava
    if (typeof marked === 'undefined') {
      mostrarMensagem('Não foi possível carregar o leitor de Markdown (CDN bloqueado ou sem internet). ',
        el('a', { href: path }, 'Abrir o arquivo ' + path));
      return;
    }
    conteudo.innerHTML = marked.parse(md);
    tirarLinhaDeTipo(conteudo);
    idsNosTitulos(conteudo);
    corrigirLinks(conteudo, path);
    desenharDiagramas(conteudo);
    const h1 = conteudo.querySelector('h1');
    document.title = (h1 ? h1.textContent : path) + ' · ' + (trilha ? trilha.titulo : 'Trilhas') + ' · Gov Hub';
    if (atual.item) progresso.registrarUltimaAula(slug, path);
    feedback.mostrar(atual.item ? atual.item.id : null, slug);
    const alvo = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (alvo) alvo.scrollIntoView();
    else window.scrollTo(0, 0);
    if (foco && h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  } catch (e) {
    if (path !== atual.path) return;
    mostrarMensagem('Não foi possível abrir ', el('code', {}, path), ` (${e.message}). `,
      el('a', { href: 'index.html#trilhas' }, 'Ver as trilhas'));
  } finally {
    if (path === atual.path) conteudo.removeAttribute('aria-busy');
  }
}

// ---- Navegação sem recarregar ----------------------------------------------------
function navegar(href) {
  history.pushState(null, '', new URL(href, location.href));
  abrir(lerUrl(), { foco: true });
}

function interceptarLinks(ev) {
  const a = ev.target.closest('a[href]');
  if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || a.target) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || !url.pathname.endsWith('/doc.html') || !url.searchParams.get('path')) return;
  const outra = url.searchParams.get('trilha');
  if (outra && outra !== slug) return;   // outra trilha: o navegador carrega a página inteira
  const mesmaAula = url.searchParams.get('path') === new URLSearchParams(location.search).get('path');   // a ordem dos parâmetros não importa
  if (mesmaAula && url.hash) return;   // âncora na mesma aula: o navegador rola
  ev.preventDefault();
  if (mesmaAula) return;   // aula já aberta: sem entrada duplicada no histórico
  navegar(url.href);
}

function aoVoltar() {
  const destino = lerUrl();
  if (destino.path !== atual.path) abrir(destino);   // se só o #fragmento mudou, o navegador já rolou
}

// O tipo da aula aparece acima do título (ícone + nome); a linha "> Tipo: **X**" do Markdown sobra.
function tirarLinhaDeTipo(raiz) {
  const h1 = raiz.querySelector('h1');
  const q = h1 && h1.nextElementSibling;
  if (q && q.tagName === 'BLOCKQUOTE' && /^\s*Tipo:/.test(q.textContent)) q.remove();
}

// ---- Início ----------------------------------------------------------------------------
montarTopo(progresso);
$('voltar-icone').replaceChildren(svg(ICONES.voltar));
document.querySelector('.seta-voltar').replaceChildren(svg(ICONES.voltar));
document.querySelector('.seta-avancar').replaceChildren(svg(ICONES.avancar));
$('nivel-card-botao').replaceChildren(svg(ICONES.seta));
$('nivel-card-botao').addEventListener('click', () => {
  const recolhida = $('nivel-card').classList.toggle('collapsed');
  $('nivel-card-botao').setAttribute('aria-expanded', String(!recolhida));
  $('nivel-card-botao').setAttribute('aria-label', (recolhida ? 'Mostrar' : 'Recolher') + ' a lista de aulas do nível');
});
let catalogo = null;
try { catalogo = await carregarCatalogo(); } catch { catalogo = null; }
{
  // Sem ?trilha= válido (links antigos, links dentro das aulas): a trilha da última aula, se tiver
  // este doc; senão dashboards; senão a primeira que tiver o doc.
  const pedido = lerUrl();
  const valida = escolherTrilha(catalogo, pedido.trilha) === pedido.trilha ? pedido.trilha : null;
  const ultima = progresso.ultimaAula();
  slug = valida || trilhaParaDoc(catalogo, idDoDoc(pedido.path), ultima && ultima.trilha) || 'dashboards';
}
try { trilha = await carregarTrilha(slug); niveis = trilha.niveis || []; } catch { trilha = null; niveis = []; }   // sem a trilha o leitor ainda abre o Markdown, só sem a lista do nível
if (lerUrl().trilha !== slug) {
  const u = new URL(location.href);
  const resto = new URLSearchParams(u.search);
  resto.delete('trilha');
  u.search = new URLSearchParams({ trilha: slug, ...Object.fromEntries(resto) }).toString();   // trilha antes de path, como nos links gerados
  history.replaceState(null, '', u);
}
$('voltar-trilha').href = trilha ? 'mapa.html?trilha=' + encodeURIComponent(slug) : 'index.html#trilhas';
if (trilha) celebracao = montarCelebracao(progresso, slug, trilha, { temQuiz: !!trilha.quiz });
$('aula-cta').addEventListener('click', aoClicarCta);
document.addEventListener('click', interceptarLinks);
window.addEventListener('popstate', aoVoltar);
progresso.aoMudar(pintarProgresso);
await abrir(lerUrl());
pintarProgresso();
