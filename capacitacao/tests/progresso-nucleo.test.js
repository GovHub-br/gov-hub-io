import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  itensEmOrdem, mesclar, todosFeitos, alternar, idDoDoc, contar, localizar, vizinhos, hrefDoItem, pendentes,
} from '../assets/progresso-nucleo.js';

// Sem doc repetido: o id é o caminho do doc, único dentro da trilha.
const NIVEIS = [
  { numero: 0, titulo: 'Fundamentos', itens: [
    { id: 'explicacao/a', titulo: 'A', doc: 'docs/explicacao/a.md', tipo: 'explicacao', papel: 'core' },
    { id: 'referencia/g', titulo: 'Glossário', doc: 'docs/referencia/g.md', tipo: 'referencia', papel: 'support' },
  ] },
  { numero: 1, titulo: 'Arquitetura', itens: [
    { id: 'explicacao/b', titulo: 'B', doc: 'docs/explicacao/b.md', tipo: 'explicacao', papel: 'core' },
  ] },
];

test('itensEmOrdem achata os níveis na ordem do ROADMAP e anota o nível', () => {
  const ids = itensEmOrdem(NIVEIS).map((i) => `${i.nivel}:${i.id}`);
  assert.deepEqual(ids, ['0:explicacao/a', '0:referencia/g', '1:explicacao/b']);
  assert.equal(itensEmOrdem(NIVEIS)[2].nivel_titulo, 'Arquitetura');
});

test('mesclar faz a união e tolera lados vazios', () => {
  assert.deepEqual(mesclar({ a: true }, { b: true }), { a: true, b: true });
  assert.deepEqual(mesclar(null, { b: true }), { b: true });
  assert.deepEqual(mesclar({ a: true, x: false }, undefined), { a: true });
});

test('todosFeitos é falso para lista vazia', () => {
  assert.equal(todosFeitos({ a: true }, []), false);
  assert.equal(todosFeitos({ a: true, b: true }, ['a', 'b']), true);
  assert.equal(todosFeitos({ a: true }, ['a', 'b']), false);
});

test('alternar marca todos se algum falta e desmarca se todos estão marcados', () => {
  const entrada = { 'referencia/g': true };
  const r1 = alternar(entrada, ['referencia/g', 'explicacao/b']);
  assert.equal(r1.marcou, true);
  assert.deepEqual(r1.feitos, { 'referencia/g': true, 'explicacao/b': true });
  assert.deepEqual(entrada, { 'referencia/g': true }, 'não muta a entrada');
  const r2 = alternar(r1.feitos, ['referencia/g', 'explicacao/b']);
  assert.equal(r2.marcou, false);
  assert.deepEqual(r2.feitos, {});
});

test('contar soma por nível e no total, com percentual arredondado', () => {
  const c = contar({ 'explicacao/a': true, 'explicacao/b': true, 'lixo/antigo': true }, NIVEIS);
  assert.deepEqual(c.porNivel, { 0: { feitas: 1, total: 2 }, 1: { feitas: 1, total: 1 } });
  assert.equal(c.feitas, 2);
  assert.equal(c.total, 3);
  assert.equal(c.percentual, 67);
  assert.equal(contar({}, []).percentual, 0);
});

test('idDoDoc tira docs/ e .md', () => {
  assert.equal(idDoDoc('docs/explicacao/a.md'), 'explicacao/a');
  assert.equal(idDoDoc('README.md'), 'README');
});

test('localizar acha a aula pelo doc, ou null fora da trilha', () => {
  assert.equal(localizar(NIVEIS, 'docs/explicacao/b.md').id, 'explicacao/b');
  assert.equal(localizar(NIVEIS, 'docs/index.md'), null);
});

test('vizinhos segue a ordem e para nas pontas', () => {
  assert.equal(vizinhos(NIVEIS, 'explicacao/a').anterior, null);
  assert.equal(vizinhos(NIVEIS, 'referencia/g').proxima.id, 'explicacao/b');
  assert.equal(vizinhos(NIVEIS, 'explicacao/b').proxima, null);
  assert.deepEqual(vizinhos(NIVEIS, 'nao-existe'), { anterior: null, proxima: null });
});

test('hrefDoItem leva a trilha e o doc', () => {
  assert.equal(hrefDoItem('dashboards', NIVEIS[1].itens[0]), 'doc.html?trilha=dashboards&path=docs/explicacao/b.md');
});

test('pendentes lista as aulas não feitas, na ordem', () => {
  assert.deepEqual(pendentes({ 'explicacao/a': true }, NIVEIS).map((i) => i.id), ['referencia/g', 'explicacao/b']);
  assert.deepEqual(pendentes({ 'explicacao/a': true, 'referencia/g': true, 'explicacao/b': true }, NIVEIS), []);
});
