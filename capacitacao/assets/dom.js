// Monta elementos sem innerHTML: títulos e nomes vêm de dados (trilhas/*.md, conta Google) e são
// texto, não HTML.
export function el(tag, attrs = {}, ...filhos) {
  const no = document.createElement(tag);
  for (const [nome, valor] of Object.entries(attrs)) {
    if (valor === null || valor === undefined || valor === false) continue;
    if (nome === 'class') no.className = valor;
    else if (nome.startsWith('on')) no.addEventListener(nome.slice(2), valor);
    else no.setAttribute(nome, valor === true ? '' : String(valor));
  }
  no.append(...filhos.filter((f) => f !== null && f !== undefined && f !== false));
  return no;
}

// Ícone a partir de uma marcação SVG fixa do próprio site (nunca de dados): createElement não cria SVG.
export function svg(marcacao) {
  const t = document.createElement('template');
  t.innerHTML = marcacao.trim();
  const no = t.content.firstElementChild;
  no.setAttribute('aria-hidden', 'true');
  no.setAttribute('focusable', 'false');
  return no;
}

export const ICONES = {
  busca: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16v12H4V6Z"/><path d="m4 7 8 6 8-6"/></svg>',
  voltar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg>',
  avancar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 6l6 6-6 6"/></svg>',
  seta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m6 9 6 6 6-6"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5 6.2 12 13 4"/></svg>',
  baixar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>',
  estrela: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8 14.9 9l6.8.6-5.2 4.5 1.6 6.6L12 17.2 5.9 20.7l1.6-6.6L2.3 9.6 9.1 9Z"/></svg>',
  google: '<svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>',
};

// Botão "Entrar com Google" (topo, página inicial, avaliação da aula, modal de conclusão).
export function botaoGoogle(aoClicar, { contornado = false } = {}) {
  return el('button', { class: 'btn-google' + (contornado ? ' contornado' : ''), type: 'button', onclick: aoClicar },
    el('span', { class: 'google-g' }, svg(ICONES.google)), 'Entrar com Google');
}
