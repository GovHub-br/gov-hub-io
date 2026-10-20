// Quiz de revisão (quiz.html?trilha=<slug>): uma pergunta por aula que tem pergunta em quiz/<slug>.json.
// Abre quando a trilha inteira está concluída; as respostas ficam só neste navegador.
import { progresso } from './progresso.js';
import { montarTopo } from './topo.js';
import { carregarCatalogo, carregarTrilha, carregarQuiz, escolherTrilha } from './trilha.js';
import { todosFeitos } from './progresso-nucleo.js';
import { perguntasDaTrilha, corrigirQuiz } from './hub-nucleo.js';
import { el, svg, ICONES } from './dom.js';

const $ = (id) => document.getElementById(id);
montarTopo(progresso);
$('voltar-icone').replaceChildren(svg(ICONES.voltar));

const pedido = new URLSearchParams(location.search).get('trilha');
let catalogo = null;
try { catalogo = await carregarCatalogo(); } catch { catalogo = null; }
const slug = escolherTrilha(catalogo, pedido) === pedido ? pedido : null;
let trilha = null;
let banco = null;
if (slug) {
  try { trilha = await carregarTrilha(slug); } catch { trilha = null; }
  if (trilha && trilha.quiz) banco = await carregarQuiz(slug);
}

const chave = 'govhub-quiz-' + slug;
function lerEstado() {
  try { return JSON.parse(localStorage.getItem(chave)) || { respostas: {}, enviado: false }; } catch { return { respostas: {}, enviado: false }; }
}
function gravarEstado(e) { try { localStorage.setItem(chave, JSON.stringify(e)); } catch { /* sem armazenamento */ } }

if (!trilha || !banco) {
  $('quiz-intro').textContent = 'Esta trilha não tem quiz de revisão.';
} else {
  const mapa = 'mapa.html?trilha=' + encodeURIComponent(slug);
  $('voltar-trilha').href = mapa;
  document.title = 'Quiz de revisão · ' + trilha.titulo + ' · Gov Hub';
  $('quiz-titulo').textContent = 'Quiz de revisão: ' + trilha.titulo;
  const perguntas = perguntasDaTrilha(trilha.niveis, banco.perguntas);
  const ids = trilha.niveis.flatMap((n) => n.itens.map((i) => i.id));
  let montado = false;

  function montar() {
    const estado = lerEstado();
    const blocos = [];
    let nivelAtual = null;
    for (const p of perguntas) {
      if (p.nivel !== nivelAtual) {
        nivelAtual = p.nivel;
        blocos.push(el('h2', { class: 'quiz-final-level-head' }, `Nível ${p.nivel} · ${p.nivelTitulo}`));
      }
      const nome = 'q-' + p.id;
      const escolhida = estado.respostas[p.id];
      blocos.push(el('fieldset', { class: 'quiz-question' },
        el('legend', { class: 'quiz-q-text' }, p.pergunta),
        el('div', { class: 'quiz-options' }, ...p.opcoes.map((texto, k) => {
          let classe = 'quiz-pill';
          let marca = null;
          if (estado.enviado && k === p.correta) { classe += ' correta'; marca = ' ✓ resposta certa'; }
          else if (estado.enviado && k === escolhida) { classe += ' errada'; marca = ' ✗ sua resposta'; }
          return el('label', { class: classe },
            el('input', { type: 'radio', name: nome, value: k, checked: escolhida === k, disabled: estado.enviado,
              onchange: () => { const e = lerEstado(); e.respostas[p.id] = k; gravarEstado(e); atualizar(); } }),
            el('span', {}, texto, marca ? el('span', { class: 'marca-resultado' }, marca) : null));
        }))));
    }
    $('quiz-perguntas').replaceChildren(...blocos);
    atualizar();
  }

  function atualizar() {
    const estado = lerEstado();
    const r = corrigirQuiz(perguntas, estado.respostas);
    $('quiz-enviar').hidden = estado.enviado;
    $('quiz-enviar').disabled = !r.completo;
    const res = $('quiz-resultado');
    res.hidden = !estado.enviado;
    if (estado.enviado) {
      res.replaceChildren(
        el('p', { class: 'quiz-score' }, `Você acertou ${r.acertos} de ${r.total} perguntas.`),
        el('div', { class: 'quiz-acoes' },
          el('button', { class: 'btn-secundario', type: 'button', onclick: () => { gravarEstado({ respostas: {}, enviado: false }); montar(); $('quiz-titulo').focus(); } }, 'Refazer o quiz'),
          el('a', { class: 'btn-primario', href: mapa }, 'Voltar para a trilha')));
    }
  }

  $('quiz').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const e = lerEstado();
    if (!corrigirQuiz(perguntas, e.respostas).completo) return;
    e.enviado = true;
    gravarEstado(e);
    montar();
    $('quiz-resultado').scrollIntoView({ block: 'center' });
  });

  function pintar() {
    const liberado = todosFeitos(progresso.feitos(), ids);
    $('quiz').hidden = !liberado;
    if (!liberado) {
      $('quiz-intro').replaceChildren('O quiz abre quando você concluir todas as aulas da trilha. ',
        el('a', { class: 'btn-link', href: mapa }, 'Ir para a trilha'));
      return;
    }
    $('quiz-intro').textContent = `Revise os conceitos que você aprendeu ao longo dos ${trilha.niveis.filter((n) => n.status !== 'em-breve').length} níveis. São ${perguntas.length} perguntas, uma por aula; responda todas para ver o resultado.`;
    if (!montado) { montado = true; montar(); }
  }
  progresso.aoMudar(pintar);
  pintar();
}
