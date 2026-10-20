// Lista de trilhas (seção #trilhas da página inicial): um card por trilha, com o progresso de quem lê.
// Aqui cada nível conta como uma aula. Trilha com `status: em-breve` aparece desabilitada; com
// `status: oculta`, não aparece (o link direto continua abrindo).
import { carregarCatalogo, carregarTrilha } from './trilha.js';
import { niveisConcluidos } from './hub-nucleo.js';
import { el } from './dom.js';

const CATEGORIAS = { negocial: 'Negocial', tecnica: 'Técnica' };

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

function card(t, trilha, progresso) {
  const emBreve = t.status === 'em-breve';
  const feitos = progresso.feitos();
  // Cada nível conta como uma aula; o nível em breve aparece à parte e não entra no progresso.
  const nv = trilha ? niveisConcluidos(feitos, trilha.niveis) : { feitos: 0, total: t.niveis, percentual: 0 };
  const futuros = trilha ? trilha.niveis.filter((n) => n.status === 'em-breve').length : 0;
  const comecou = t.aulas.some((id) => feitos[id]);
  const pct = nv.percentual;
  const ultima = progresso.ultimaAula();
  const mapa = 'mapa.html?trilha=' + encodeURIComponent(t.slug);
  const tituloId = 'trilha-' + t.slug;
  return el('article', { class: 'track-card' + (emBreve ? ' track-card-disabled' : ''), 'aria-labelledby': tituloId },
    CATEGORIAS[t.categoria] ? el('span', { class: 'track-badge' }, CATEGORIAS[t.categoria]) : null,
    emBreve ? el('span', { class: 'track-soon-badge' }, 'Em breve disponível') : null,
    el('h2', { id: tituloId }, t.titulo),
    el('p', {}, t.descricao),
    el('div', { class: 'track-meta' }, plural(nv.total, 'aula', 'aulas') + (futuros ? ` · ${plural(futuros, 'em breve', 'em breve')}` : '')),
    el('div', { class: 'track-progress-row' },
      el('span', { class: 'track-progress-pct', 'aria-hidden': 'true' }, pct + '%'),
      el('div', { class: 'progress-track', 'aria-hidden': 'true' }, el('div', { class: 'progress-fill', style: `width:${pct}%` })),
      el('span', { class: 'sr-only' }, `${nv.feitos} de ${plural(nv.total, 'aula concluída', 'aulas concluídas')}`)),
    emBreve
      ? el('button', { class: 'btn-primario', type: 'button', disabled: true }, 'Em breve disponível')
      : el('a', { class: 'btn-primario', href: mapa }, comecou ? 'Abrir a trilha' : 'Começar a trilha'),
    !emBreve && ultima && ultima.trilha === t.slug
      ? el('a', { class: 'track-continue-link', href: 'doc.html?trilha=' + encodeURIComponent(t.slug) + '&path=' + ultima.path }, 'Continuar de onde parei')
      : null);
}

export async function montarCatalogo(progresso) {
  let catalogo = null;
  try { catalogo = await carregarCatalogo(); } catch { catalogo = null; }
  const visiveis = catalogo ? catalogo.trilhas.filter((t) => t.status !== 'oculta') : [];
  const trilhas = {};
  await Promise.all(visiveis.map(async (t) => { try { trilhas[t.slug] = await carregarTrilha(t.slug); } catch { /* card sem progresso */ } }));
  function pintar() {
    if (!visiveis.length) {
      document.getElementById('catalogo').replaceChildren(el('p', { class: 'msg' }, 'Não foi possível carregar as trilhas. Tente recarregar a página.'));
      return;
    }
    document.getElementById('catalogo').replaceChildren(...visiveis.map((t) => card(t, trilhas[t.slug], progresso)));
  }
  progresso.aoMudar(pintar);
  pintar();
}
