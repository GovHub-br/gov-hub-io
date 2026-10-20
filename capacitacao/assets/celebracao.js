// Modal "Você concluiu a trilha" (mapa e aula): abre uma vez quando a última aula da trilha é
// marcada, com a nota de 1 a 5 para a trilha e o link para o quiz de revisão.
import { el, svg, ICONES } from './dom.js';
import { botaoEntrar } from './login.js';
import { todosFeitos } from './progresso-nucleo.js';

const chave = (slug) => 'govhub-celebrada-' + slug;
const ler = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const gravar = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* sem armazenamento */ } };

export function montarCelebracao(progresso, slug, trilha, { temQuiz }) {
  const ids = trilha.niveis.flatMap((n) => n.itens.map((i) => i.id));
  const avaliacao = el('div', { class: 'celebration-rating' });
  const fechar = el('button', { class: 'modal-close', type: 'button', 'aria-label': 'Fechar', onclick: () => esconder() }, '×');
  const caixa = el('div', { class: 'modal-box celebration-box', role: 'dialog', 'aria-modal': 'true',
    'aria-labelledby': 'celebracao-titulo', 'aria-describedby': 'celebracao-texto' },
    fechar,
    el('span', { class: 'celebration-badge' }, svg(ICONES.check)),
    el('h2', { id: 'celebracao-titulo' }, 'Você concluiu a trilha ' + trilha.titulo),
    el('p', { id: 'celebracao-texto' }, `As ${ids.length} aulas foram marcadas como estudadas. Você pode voltar aqui como referência sempre que precisar.`),
    avaliacao,
    el('div', { class: 'modal-actions' },
      el('button', { class: 'btn-secundario', type: 'button', onclick: () => esconder() }, 'Fechar'),
      temQuiz ? el('a', { class: 'btn-primario', href: 'quiz.html?trilha=' + encodeURIComponent(slug) }, 'Fazer o quiz de revisão →') : null));
  const fundo = el('div', { class: 'modal-overlay', hidden: true, onclick: (ev) => { if (ev.target === fundo) esconder(); } }, caixa);
  document.body.append(fundo);
  let antes = null;

  function estrelas() {
    const nota = progresso.trilhaAvaliada(slug);
    const rotulo = el('p', { class: 'rating-label', id: 'nota-rotulo' }, 'Como você avalia esta trilha?');
    if (nota) {
      return [rotulo, el('div', { class: 'star-rating', role: 'img', 'aria-label': `Você deu ${nota} de 5 estrelas` },
        ...[1, 2, 3, 4, 5].map((i) => el('span', { class: 'star-btn' + (i <= nota ? ' filled' : '') }, svg(ICONES.estrela)))),
        el('p', { class: 'rating-thanks' }, 'Obrigado pelo feedback!')];
    }
    if (!progresso.usuario()) {
      return [rotulo, el('p', { class: 'rating-hint' }, 'Entre na sua conta para avaliar. A nota não leva seu nome nem seu e-mail.'),
        progresso.nuvemDisponivel() ? botaoEntrar(progresso, { contornado: true }) : null];
    }
    const erro = el('p', { class: 'rating-erro', role: 'alert', hidden: true }, 'Não foi possível enviar; tente de novo.');
    const grupo = el('div', { class: 'star-rating', role: 'radiogroup', 'aria-labelledby': 'nota-rotulo' });
    const botoes = [1, 2, 3, 4, 5].map((i) => el('button', {
      class: 'star-btn', type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: i === 1 ? '0' : '-1',
      'aria-label': `${i} estrela${i > 1 ? 's' : ''}`,
      onmouseenter: () => pre(i), onmouseleave: () => pre(0), onfocus: () => pre(i), onblur: () => pre(0),
      onclick: async () => {
        botoes.forEach((b) => { b.disabled = true; });
        erro.hidden = true;
        try { await progresso.avaliarTrilha(slug, i); pintarAvaliacao(); }
        catch { botoes.forEach((b) => { b.disabled = false; }); erro.hidden = false; }
      },
      onkeydown: (ev) => {
        const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[ev.key];
        if (!d) return;
        ev.preventDefault();
        const prox = botoes[Math.min(4, Math.max(0, i - 1 + d))];
        botoes.forEach((b) => b.setAttribute('tabindex', '-1'));
        prox.setAttribute('tabindex', '0');
        prox.focus();
      },
    }, svg(ICONES.estrela)));
    function pre(n) { botoes.forEach((b, k) => b.classList.toggle('filled', k < n)); }
    grupo.append(...botoes);
    return [rotulo, grupo, el('p', { class: 'rating-hint' }, 'A nota não leva seu nome nem seu e-mail.'), erro];
  }
  function pintarAvaliacao() { avaliacao.replaceChildren(...estrelas().filter(Boolean)); }

  function focaveis() { return [...caixa.querySelectorAll('button:not(:disabled),a[href]')].filter((n) => n.offsetParent !== null || n === fechar); }
  function mostrar() {
    antes = document.activeElement;
    pintarAvaliacao();
    fundo.hidden = false;
    fechar.focus();
  }
  function esconder() {
    if (fundo.hidden) return;
    fundo.hidden = true;
    if (antes && antes.isConnected) antes.focus();
  }
  document.addEventListener('keydown', (ev) => {
    if (fundo.hidden || !caixa.contains(document.activeElement)) return;   // o modal de login está por cima
    if (ev.key === 'Escape') { esconder(); return; }
    if (ev.key !== 'Tab') return;
    const lista = focaveis();
    const i = lista.indexOf(document.activeElement);
    if (ev.shiftKey && i <= 0) { ev.preventDefault(); lista[lista.length - 1].focus(); }
    else if (!ev.shiftKey && i === lista.length - 1) { ev.preventDefault(); lista[0].focus(); }
  });

  let conta = null;
  return {
    // Chamada a cada mudança do progresso: abre na primeira vez que a trilha fica completa.
    verificar() {
      const completa = todosFeitos(progresso.feitos(), ids);
      const ja = ler(chave(slug)) === '1';
      if (completa && !ja) { gravar(chave(slug), '1'); mostrar(); }
      else if (!completa && ja) gravar(chave(slug), null);
      const agora = (progresso.usuario() ? progresso.usuario().uid : '-') + '|' + progresso.trilhaAvaliada(slug);
      if (!fundo.hidden && agora !== conta) pintarAvaliacao();   // entrou com Google com o modal aberto
      conta = agora;
    },
    completa: () => todosFeitos(progresso.feitos(), ids),
  };
}
