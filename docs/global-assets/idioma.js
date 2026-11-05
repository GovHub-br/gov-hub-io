// Seletor de idioma das páginas institucionais. O português é o que está no HTML; o inglês vem de
// idioma-en.js, carregado antes deste arquivo. A escolha vale para o site todo, inclusive o /tais/.
(() => {
  const CHAVE = 'govhub-lang';
  const EN = window.GOVHUB_EN || {};
  const ATRIBUTOS = ['alt', 'title', 'aria-label', 'placeholder'];
  const textoOriginal = new WeakMap();
  const atributoOriginal = new WeakMap();

  const BANDEIRA_BR = '<svg viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" fill="#009C3B"/><path d="M14 2.6 25.4 10 14 17.4 2.6 10z" fill="#FFDF00"/><circle cx="14" cy="10" r="4.5" fill="#002776"/><path d="M9.7 9.1c3-.5 6 .3 8.5 2.1" fill="none" stroke="#fff" stroke-width=".9"/></svg>';
  const BANDEIRA_US = '<svg viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" fill="#fff"/><path d="M0 0h28v1.54H0zM0 3.08h28v1.54H0zM0 6.15h28v1.54H0zM0 9.23h28v1.54H0zM0 12.31h28v1.54H0zM0 15.38h28v1.54H0zM0 18.46h28V20H0z" fill="#B22234"/><rect width="12.4" height="10.77" fill="#3C3B6E"/><g fill="#fff"><circle cx="2.1" cy="1.8" r=".62"/><circle cx="6.2" cy="1.8" r=".62"/><circle cx="10.3" cy="1.8" r=".62"/><circle cx="4.15" cy="3.6" r=".62"/><circle cx="8.25" cy="3.6" r=".62"/><circle cx="2.1" cy="5.4" r=".62"/><circle cx="6.2" cy="5.4" r=".62"/><circle cx="10.3" cy="5.4" r=".62"/><circle cx="4.15" cy="7.2" r=".62"/><circle cx="8.25" cy="7.2" r=".62"/><circle cx="2.1" cy="9" r=".62"/><circle cx="6.2" cy="9" r=".62"/><circle cx="10.3" cy="9" r=".62"/></g></svg>';

  const normaliza = texto => texto.replace(/\s+/g, ' ').trim();

  function traduzTexto(no, ingles) {
    const original = textoOriginal.get(no) ?? no.nodeValue;
    const traducao = ingles ? EN[normaliza(original)] : null;
    if (!traducao) { if (textoOriginal.has(no)) no.nodeValue = original; return; }
    textoOriginal.set(no, original);
    no.nodeValue = original.match(/^\s*/)[0] + traducao + original.match(/\s*$/)[0];
  }

  function traduzAtributo(el, nome, ingles) {
    const guardados = atributoOriginal.get(el) || {};
    const original = guardados[nome] ?? el.getAttribute(nome);
    const traducao = ingles ? EN[normaliza(original)] : null;
    if (traducao) {
      guardados[nome] = original;
      atributoOriginal.set(el, guardados);
      el.setAttribute(nome, traducao);
    } else if (nome in guardados) {
      el.setAttribute(nome, original);
    }
  }

  function aplica(lingua) {
    const ingles = lingua === 'en';
    document.documentElement.lang = ingles ? 'en' : 'pt-BR';
    const textos = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    while (textos.nextNode()) {
      const pai = textos.currentNode.parentElement;
      if (pai && pai.tagName !== 'SCRIPT' && pai.tagName !== 'STYLE') traduzTexto(textos.currentNode, ingles);
    }
    for (const nome of ATRIBUTOS) {
      for (const el of document.querySelectorAll(`[${nome}]`)) traduzAtributo(el, nome, ingles);
    }
    const descricao = document.querySelector('meta[name="description"]');
    if (descricao) traduzAtributo(descricao, 'content', ingles);
    for (const botao of document.querySelectorAll('[data-lang]')) {
      botao.setAttribute('aria-pressed', String(botao.dataset.lang === lingua));
    }
  }

  function montaSeletor() {
    const estilo = document.createElement('style');
    estilo.textContent = `
      .gh-lang{display:inline-flex;align-items:center;gap:2px;height:36px;padding:3px;border:1.5px solid rgba(97,62,255,.3);border-radius:999px;background:#fff;flex:none}
      .gh-lang button{display:grid;place-items:center;height:28px;padding:0 7px;border:0;border-radius:999px;background:transparent;cursor:pointer}
      .gh-lang svg{display:block;width:24px;height:17px;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.14);opacity:.55}
      .gh-lang button[aria-pressed="true"]{background:rgba(97,62,255,.14);box-shadow:inset 0 0 0 1.5px #613EFF}
      .gh-lang button[aria-pressed="true"] svg,.gh-lang button:hover svg{opacity:1}
      .gh-lang button:focus-visible{outline:3px solid #613EFF;outline-offset:2px}
      .custom-navbar .social-icons{align-items:center}`;
    document.head.appendChild(estilo);
    // Um seletor junto dos ícones de redes sociais: no menu do desktop e no do celular
    for (const redes of document.querySelectorAll('.custom-navbar .social-icons')) {
      const seletor = document.createElement('div');
      seletor.className = 'gh-lang';
      seletor.setAttribute('role', 'group');
      seletor.setAttribute('aria-label', 'Idioma');
      seletor.innerHTML = `<button type="button" data-lang="pt" aria-pressed="true" aria-label="Português (Brasil)" title="Português (Brasil)">${BANDEIRA_BR}</button><button type="button" data-lang="en" aria-pressed="false" aria-label="English" title="English">${BANDEIRA_US}</button>`;
      seletor.addEventListener('click', evento => {
        const botao = evento.target.closest('[data-lang]');
        if (!botao) return;
        aplica(botao.dataset.lang);
        try { localStorage.setItem(CHAVE, botao.dataset.lang); } catch (_) {}
      });
      redes.prepend(seletor);
    }
  }

  montaSeletor();
  let inicial = new URLSearchParams(location.search).get('lang');
  if (inicial !== 'pt' && inicial !== 'en') {
    try { inicial = localStorage.getItem(CHAVE); } catch (_) {}
  }
  aplica(inicial === 'en' ? 'en' : 'pt');
})();
