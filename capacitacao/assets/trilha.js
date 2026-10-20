// Catálogo e trilhas (docs/trilhas/*.json, gerados de trilhas/*.md por tools/gen_roadmap.py).
// Cada arquivo é baixado uma vez por página; uma falha não fica em cache (dá para tentar de novo).
const cache = new Map();

function buscar(url) {
  if (!cache.has(url)) {
    const promessa = fetch(url).then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
    promessa.catch(() => cache.delete(url));
    cache.set(url, promessa);
  }
  return cache.get(url);
}

export const carregarCatalogo = () => buscar('docs/trilhas/index.json');
export const carregarTrilha = (slug) => buscar('docs/trilhas/' + encodeURIComponent(slug) + '.json');
// Quiz de revisão (quiz/<slug>.json, editado à mão; o JSON da trilha diz se existe em `quiz`). Falha: null.
export const carregarQuiz = (slug) => buscar('quiz/' + encodeURIComponent(slug) + '.json').catch(() => null);

// O slug pedido, se existir no catálogo; senão a primeira trilha; senão null.
export function escolherTrilha(catalogo, slug) {
  const slugs = (catalogo && catalogo.trilhas || []).map((t) => t.slug);
  if (slug && slugs.includes(slug)) return slug;
  return slugs[0] || null;
}

// Trilha para abrir um doc quando o link não diz qual (doc.html?path=..., links antigos e links
// dentro das aulas): a preferida (ex.: a da última aula), se tiver a aula; senão 'dashboards', se
// tiver; senão a primeira do catálogo que tiver. Doc fora de todas as trilhas (ex.: docs/index.md,
// do menu "Documentação"): a preferida, se existir; senão 'dashboards'; senão a primeira.
export function trilhaParaDoc(catalogo, id, preferida) {
  const trilhas = (catalogo && catalogo.trilhas) || [];
  const tem = (slug) => trilhas.some((t) => t.slug === slug && (t.aulas || []).includes(id));
  if (preferida && tem(preferida)) return preferida;
  if (tem('dashboards')) return 'dashboards';
  const primeira = trilhas.find((t) => (t.aulas || []).includes(id));
  if (primeira) return primeira.slug;
  if (escolherTrilha(catalogo, preferida) === preferida) return preferida;
  return escolherTrilha(catalogo, 'dashboards');
}
