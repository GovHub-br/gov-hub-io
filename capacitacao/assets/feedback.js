// Bloco "Conte como foi esta aula" no fim de cada aula (doc.html). Exige login; a resposta não leva
// uid, nome, e-mail nem horário (ver ADR 0006, que explica o limite dessa garantia). Estados: convite para entrar, formulário, enviando, obrigado, erro.
import { el } from './dom.js';
import { botaoEntrar } from './login.js';
import { CLAREZA, USO, LIMITE_COMENTARIO } from './progresso-loja.js';

const ROTULOS_CLAREZA = { confuso: 'Confuso', claro: 'Claro', 'muito-claro': 'Muito claro' };
const ROTULOS_USO = { sim: 'Sim', talvez: 'Talvez', nao: 'Não' };

function grupo(nome, legenda, valores, rotulos, aoMudar) {
  return el('fieldset', { class: 'fb-grupo' },
    el('legend', {}, legenda),
    el('div', { class: 'fb-opcoes' }, ...valores.map((v) => el('label', { class: 'fb-opcao' },
      el('input', { type: 'radio', name: nome, value: v, onchange: aoMudar }),
      el('span', {}, rotulos[v])))));
}

export function montarFeedback(secao, progresso) {
  let aula = null;
  let trilha = null;
  let enviando = false;
  let enviada = false;   // nesta visita, para não piscar o formulário antes do snapshot
  let refazer = false;   // "Avaliar novamente": mostra o formulário mesmo com a aula já avaliada

  function titulo(texto) { return el('h2', { class: 'fb-titulo', id: 'feedback-titulo' }, texto); }

  function formulario() {
    const contador = el('span', { class: 'fb-contador' }, `0/${LIMITE_COMENTARIO}`);
    const erro = el('p', { class: 'fb-erro', role: 'alert', hidden: true }, 'Não foi possível enviar; tente de novo.');
    const enviar = el('button', { class: 'btn-primario', type: 'submit', disabled: true }, 'Enviar');
    const comentario = el('textarea', { id: 'fb-comentario', rows: 3, maxlength: LIMITE_COMENTARIO,
      oninput: () => { contador.textContent = `${comentario.value.length}/${LIMITE_COMENTARIO}`; } });
    const form = el('form', { class: 'fb-form', novalidate: true },
      grupo('fb-clareza', 'O conteúdo ficou claro?', CLAREZA, ROTULOS_CLAREZA, () => atualizar()),
      grupo('fb-uso', 'Vai usar isso no seu trabalho?', USO, ROTULOS_USO, () => atualizar()),
      el('label', { class: 'fb-rotulo', for: 'fb-comentario' }, 'Comentário (opcional)'),
      comentario, contador,
      el('p', { class: 'fb-nota' }, 'Sua resposta não leva seu nome nem seu e-mail.'),
      erro, enviar);
    const valor = (nome) => { const m = form.querySelector(`input[name="${nome}"]:checked`); return m ? m.value : null; };
    function atualizar() { enviar.disabled = enviando || !valor('fb-clareza') || !valor('fb-uso'); }
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (enviar.disabled) return;
      enviando = true; erro.hidden = true; enviar.textContent = 'Enviando…'; atualizar();
      const minhaAula = aula;
      try {
        await progresso.avaliar(minhaAula, trilha, { clareza: valor('fb-clareza'), uso: valor('fb-uso'), comentario: comentario.value });
        if (minhaAula === aula) { enviada = true; refazer = false; secao.replaceChildren(); pintar(); secao.querySelector('.fb-titulo').focus(); }
      } catch {
        erro.hidden = false;
      } finally {
        if (minhaAula === aula) { enviando = false; enviar.textContent = 'Enviar'; atualizar(); }
      }
    });
    return form;
  }

  function pintar() {
    if (!aula) { secao.hidden = true; secao.replaceChildren(); return; }
    secao.hidden = false;
    if ((enviada || progresso.foiAvaliada(aula)) && !refazer && progresso.usuario()) {
      const t = titulo('Obrigado por avaliar esta aula.');
      t.setAttribute('tabindex', '-1');
      secao.replaceChildren(el('div', { class: 'fb-obrigado' },
        el('img', { src: 'assets/icones/heart-sober.svg', alt: '', width: '48', height: '48' }),
        el('div', {}, t, el('button', { class: 'btn-secundario', type: 'button',
          onclick: () => { refazer = true; secao.replaceChildren(); pintar(); const r = secao.querySelector('input'); if (r) r.focus(); } },
        'Avaliar novamente'))));
      return;
    }
    if (!progresso.usuario()) {
      secao.replaceChildren(titulo('Conte como foi esta aula'),
        ...(progresso.nuvemDisponivel()
          ? [el('p', { class: 'fb-texto' }, 'Entre na sua conta para avaliar este conteúdo.'), botaoEntrar(progresso, { contornado: true })]
          : [el('p', { class: 'fb-texto' }, 'A avaliação fica disponível quando o login estiver funcionando.')]));
      return;
    }
    if (!secao.querySelector('form')) secao.replaceChildren(titulo('Conte como foi esta aula'), formulario());
  }

  // Redesenha só quando muda o que importa (login, avaliada) — marcar aulas não apaga o que a pessoa digitou.
  const chave = () => [aula, !!progresso.usuario(), progresso.nuvemDisponivel(), aula && progresso.foiAvaliada(aula)].join('|');
  let estado = null;
  progresso.aoMudar(() => {
    const novo = chave();
    if (novo === estado) return;
    estado = novo;
    const tinhaFoco = secao.contains(document.activeElement) && document.activeElement.classList.contains('fb-titulo');
    secao.replaceChildren();
    pintar();
    if (tinhaFoco) { const t = secao.querySelector('.fb-titulo[tabindex]'); if (t) t.focus(); }
  });

  return {
    mostrar(novaAula, novaTrilha) {
      aula = novaAula; trilha = novaTrilha; enviada = false; enviando = false; refazer = false;
      secao.replaceChildren(); pintar();
      estado = chave();
    },
  };
}
