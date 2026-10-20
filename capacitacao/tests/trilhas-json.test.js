import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const ler = (rel) => readFileSync(new URL('../' + rel, import.meta.url), 'utf8');
const catalogo = JSON.parse(ler('docs/trilhas/index.json'));
const TIPOS = ['tutorial', 'guia', 'referencia', 'explicacao', 'desafio', 'pesquisa'];
const PAPEIS = ['core', 'support', 'capstone', 'optional', 'advanced'];

const CATEGORIAS = ['negocial', 'tecnica'];

test('o catálogo lista as negociais antes das técnicas e, dentro delas, em ordem de slug', () => {
  const chave = (t) => CATEGORIAS.indexOf(t.categoria) + ':' + t.slug;
  const slugs = catalogo.trilhas.map((t) => t.slug);
  assert.ok(slugs.length > 0);
  assert.ok(catalogo.trilhas.every((t) => CATEGORIAS.includes(t.categoria)));
  assert.deepEqual(catalogo.trilhas.map(chave), catalogo.trilhas.map(chave).sort());
  assert.ok(slugs.includes('dashboards'));
});

for (const resumo of catalogo.trilhas) {
  const trilha = JSON.parse(ler(`docs/trilhas/${resumo.slug}.json`));

  test(`${resumo.slug}: cabeçalho e níveis completos`, () => {
    assert.equal(trilha.slug, resumo.slug);
    assert.equal(trilha.categoria, resumo.categoria);
    assert.equal(trilha.quiz, existsSync(new URL(`../quiz/${resumo.slug}.json`, import.meta.url)) ? `quiz/${resumo.slug}.json` : undefined);
    assert.ok(trilha.titulo && trilha.descricao);
    assert.equal(!!trilha.diagrama, !!trilha.diagrama_alt);
    if (trilha.diagrama) assert.ok(existsSync(new URL('../' + trilha.diagrama, import.meta.url)), trilha.diagrama);
    trilha.niveis.forEach((nivel, i) => {
      assert.equal(nivel.numero, i + 1);   // os níveis começam no 1
      for (const item of nivel.itens) {
        assert.equal(item.id, item.doc.replace(/^docs\//, '').replace(/\.md$/, ''));
        assert.ok(TIPOS.includes(item.tipo) && PAPEIS.includes(item.papel));
        assert.ok(item.tipo_nome && item.papel_nome && item.titulo);
        assert.match(item.icone, /^assets\/icones\/[a-z-]+-sober\.svg$/);
        assert.ok(existsSync(new URL('../' + item.doc, import.meta.url)), item.doc);
      }
    });
  });

  test(`${resumo.slug}: ids únicos e iguais aos do catálogo`, () => {
    const ids = trilha.niveis.flatMap((n) => n.itens.map((i) => i.id));
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(resumo.aulas, ids);
    assert.equal(resumo.niveis, trilha.niveis.filter((n) => n.status !== 'em-breve').length);   // o catálogo conta os níveis abertos
    for (const n of trilha.niveis) assert.equal(n.status === 'em-breve', n.itens.length === 0, `nível ${n.numero}`);
  });
}
