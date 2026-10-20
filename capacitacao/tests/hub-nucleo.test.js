import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nivelPadrao, papelVisual, buscarAulas, corrigirQuiz, perguntasDaTrilha, normalizarBusca, niveisConcluidos, pdfDaAula, pdfDaTrilha } from '../assets/hub-nucleo.js';

const NIVEIS = [
  { numero: 0, titulo: 'Base', itens: [{ id: 'a', titulo: 'Por que fazer um dashboard?', doc: 'docs/a.md' }, { id: 'b', titulo: 'Glossário', doc: 'docs/b.md' }] },
  { numero: 1, titulo: 'Gráficos', itens: [{ id: 'c', titulo: 'Gráfico de pizza', doc: 'docs/c.md' }] },
];

test('nivelPadrao: o primeiro nível com aula pendente; tudo feito volta ao primeiro', () => {
  assert.equal(nivelPadrao({}, NIVEIS), 0);
  assert.equal(nivelPadrao({ a: true, b: true }, NIVEIS), 1);
  assert.equal(nivelPadrao({ a: true, b: true, c: true }, NIVEIS), 0);
  assert.equal(nivelPadrao({}, []), 0);
});

test('papelVisual: cinco papéis da trilha em três marcações do mapa', () => {
  assert.equal(papelVisual('core'), 'essencial');
  for (const p of ['support', 'optional', 'advanced']) assert.equal(papelVisual(p), 'apoio');
  assert.equal(papelVisual('capstone'), 'marco');
});

test('normalizarBusca ignora acento e caixa', () => {
  assert.equal(normalizarBusca('GRÁFICO'), 'grafico');
});

test('buscarAulas: por título, sem acento, com a trilha e o nível; vazio não busca', () => {
  const trilhas = [{ slug: 'dashboards', titulo: 'Dashboards', niveis: NIVEIS }];
  assert.deepEqual(buscarAulas(trilhas, '  '), []);
  const r = buscarAulas(trilhas, 'grafico');
  assert.equal(r.length, 1);
  assert.deepEqual({ trilha: r[0].trilha, id: r[0].item.id, nivel: r[0].nivel, nivelTitulo: r[0].nivelTitulo },
    { trilha: 'dashboards', id: 'c', nivel: 1, nivelTitulo: 'Gráficos' });
  assert.equal(buscarAulas(trilhas, 'a', 2).length, 2);
});

test('perguntasDaTrilha: na ordem da trilha, só aulas com pergunta', () => {
  const banco = { c: { pergunta: 'C?', opcoes: ['x', 'y'], correta: 1 }, a: { pergunta: 'A?', opcoes: ['x', 'y'], correta: 0 }, z: { pergunta: 'Z?', opcoes: ['x'], correta: 0 } };
  const lista = perguntasDaTrilha(NIVEIS, banco);
  assert.deepEqual(lista.map((p) => [p.id, p.nivel]), [['a', 0], ['c', 1]]);
});

test('corrigirQuiz: acertos sobre o total de perguntas', () => {
  const perguntas = [{ id: 'a', correta: 0 }, { id: 'c', correta: 1 }];
  assert.deepEqual(corrigirQuiz(perguntas, { a: 0, c: 0 }), { acertos: 1, total: 2, completo: true });
  assert.deepEqual(corrigirQuiz(perguntas, { a: 0 }), { acertos: 1, total: 2, completo: false });
});

test('niveisConcluidos: conta só níveis com todas as aulas feitas', () => {
  assert.deepEqual(niveisConcluidos({}, NIVEIS), { feitos: 0, total: 2, percentual: 0 });
  assert.deepEqual(niveisConcluidos({ a: true }, NIVEIS), { feitos: 0, total: 2, percentual: 0 });
  assert.deepEqual(niveisConcluidos({ a: true, b: true }, NIVEIS), { feitos: 1, total: 2, percentual: 50 });
  assert.deepEqual(niveisConcluidos({ a: true, b: true, c: true }, NIVEIS), { feitos: 2, total: 2, percentual: 100 });
  assert.deepEqual(niveisConcluidos({}, []), { feitos: 0, total: 0, percentual: 0 });
});

test('caminhos dos PDFs: os mesmos que tools/gen_pdf.py escreve em pdf/', () => {
  assert.equal(pdfDaAula('explicacao/hierarquia-visual'), 'pdf/aulas/explicacao/hierarquia-visual.pdf');
  assert.equal(pdfDaTrilha('dashboards'), 'pdf/trilhas/dashboards.pdf');
});

const COM_EM_BREVE = [...NIVEIS, { numero: 2, titulo: 'Vídeos', status: 'em-breve', itens: [] }];

test('nível em breve: não conta no andamento nem é aberto por padrão', () => {
  assert.deepEqual(niveisConcluidos({ a: true, b: true, c: true }, COM_EM_BREVE), { feitos: 2, total: 2, percentual: 100 });
  assert.equal(nivelPadrao({ a: true, b: true, c: true }, COM_EM_BREVE), 0);
  assert.equal(nivelPadrao({ a: true, b: true }, COM_EM_BREVE), 1);
});
