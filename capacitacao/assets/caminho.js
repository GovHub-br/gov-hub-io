// Qual ?path= o leitor (doc.html) aceita abrir. O Markdown vira HTML sem sanitização, e a mesma
// origem guarda a sessão do Firebase: só arquivos .md do próprio site, por caminho relativo.
// Pura (sem DOM) — testada em Node (tests/caminho.test.js).
const BASE = 'https://site.invalido/raiz/';

export function caminhoSeguro(path) {
  if (typeof path !== 'string' || path === '') return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return false;          // esquema: https:, javascript:, data:…
  if (/^\/\/|\\/.test(path)) return false;                        // //outro-host, barras invertidas
  if (/[\u0000-\u001f\u007f]/.test(path)) return false;           // o parser de URL ignora tab e quebra de linha
  if (!path.endsWith('.md')) return false;
  if (path.split('/').some((s) => s === '..')) return false;
  // Rede de segurança: resolvido como o fetch resolveria, continua dentro da raiz do site.
  let url;
  try {
    url = new URL(path.replace(/^\.?\/+/, ''), BASE);
  } catch {
    return false;
  }
  return url.origin === new URL(BASE).origin && url.pathname.startsWith('/raiz/') && url.pathname.endsWith('.md');
}
