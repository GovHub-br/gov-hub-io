// Modal "Entrar": Google, e-mail e senha, criar conta e recuperar a senha. Um por página, aberto
// pelo botão "Entrar" (topo, página inicial, avaliação da aula, nota da trilha).
import { el, botaoGoogle } from './dom.js';
import { SENHA_MINIMA } from './progresso-loja.js';

const MENSAGENS = {
  'auth/invalid-credential': 'E-mail ou senha incorretos. Se você entrou antes com o Google, use o botão do Google ou "Esqueci minha senha" para criar uma senha.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'Esse e-mail não parece válido.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail. Entre com a senha ou com o Google.',
  'auth/weak-password': `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`,
  'auth/too-many-requests': 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet. Tente de novo.',
  'auth/operation-not-allowed': 'O login por e-mail ainda não está ativado neste site.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'email-invalido': 'Esse e-mail não parece válido.',
  'nome-vazio': 'Informe o seu nome.',
  'senha-curta': `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`,
};
const mensagem = (e) => MENSAGENS[e && (e.code || e.message)] || 'Não foi possível concluir. Tente de novo.';

let modal = null;

function criarModal(progresso) {
  let modo = 'entrar';
  let antes = null;
  const titulo = el('h2', { id: 'login-titulo' });
  const intro = el('p', { class: 'login-intro' });
  const google = el('div', { class: 'login-google' },
    botaoGoogle(() => progresso.entrar(), { contornado: true }),
    el('p', { class: 'login-ou', 'aria-hidden': 'true' }, el('span', {}, 'ou com e-mail')));
  const campo = (id, rotulo, attrs) => {
    const input = el('input', { id, name: id, ...attrs });
    return { input, bloco: el('div', { class: 'login-campo' }, el('label', { for: id }, rotulo), input) };
  };
  const nome = campo('login-nome', 'Nome', { type: 'text', autocomplete: 'name', maxlength: 80 });
  const email = campo('login-email', 'E-mail', { type: 'email', autocomplete: 'email', inputmode: 'email', required: true });
  const senha = campo('login-senha', 'Senha', { type: 'password', required: true, minlength: SENHA_MINIMA });
  const dica = el('p', { class: 'login-dica', id: 'login-dica' }, `Pelo menos ${SENHA_MINIMA} caracteres.`);
  senha.bloco.append(dica);
  const erro = el('p', { class: 'login-erro', role: 'alert' });
  const ok = el('p', { class: 'login-ok', role: 'status' });
  const enviar = el('button', { class: 'btn-primario login-enviar', type: 'submit' });
  const form = el('form', { class: 'login-form', novalidate: true }, nome.bloco, email.bloco, senha.bloco, erro, ok, enviar);
  const links = el('p', { class: 'login-links' });
  const fechar = el('button', { class: 'modal-close', type: 'button', 'aria-label': 'Fechar', onclick: () => esconder() }, '×');
  const caixa = el('div', { class: 'modal-box login-box', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'login-titulo' },
    fechar, titulo, intro, google, form, links);
  const fundo = el('div', { class: 'modal-overlay', hidden: true, onclick: (ev) => { if (ev.target === fundo) esconder(); } }, caixa);
  document.body.append(fundo);

  const link = (texto, alvo) => el('button', { type: 'button', class: 'login-link', onclick: () => trocar(alvo) }, texto);
  function trocar(novo, { foco = true } = {}) {
    modo = novo;
    erro.textContent = ''; ok.textContent = '';
    titulo.textContent = { entrar: 'Entrar', criar: 'Criar conta', recuperar: 'Recuperar a senha' }[modo];
    intro.textContent = modo === 'recuperar'
      ? 'Informe o e-mail da sua conta. Enviaremos um link para você criar uma senha nova.'
      : 'Entre para salvar o seu progresso e continuar de qualquer computador.';
    google.hidden = modo === 'recuperar';
    nome.bloco.hidden = modo !== 'criar';
    senha.bloco.hidden = modo === 'recuperar';
    dica.hidden = modo !== 'criar';
    senha.input.setAttribute('autocomplete', modo === 'criar' ? 'new-password' : 'current-password');
    if (modo === 'criar') senha.input.setAttribute('aria-describedby', 'login-dica'); else senha.input.removeAttribute('aria-describedby');
    enviar.textContent = { entrar: 'Entrar', criar: 'Criar conta', recuperar: 'Enviar link' }[modo];
    links.replaceChildren(...{
      entrar: [link('Esqueci minha senha', 'recuperar'), el('span', { 'aria-hidden': 'true' }, ' · '), 'Não tem conta? ', link('Criar conta', 'criar')],
      criar: ['Já tem conta? ', link('Entrar', 'entrar')],
      recuperar: [link('Voltar para o login', 'entrar')],
    }[modo]);
    if (foco) (modo === 'criar' ? nome.input : email.input).focus();
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (enviar.disabled) return;
    erro.textContent = ''; ok.textContent = '';
    enviar.disabled = true;
    try {
      if (modo === 'entrar') await progresso.entrarComEmail(email.input.value, senha.input.value);
      else if (modo === 'criar') await progresso.criarConta({ nome: nome.input.value, email: email.input.value, senha: senha.input.value });
      else {
        await progresso.redefinirSenha(email.input.value);
        ok.textContent = 'Se houver uma conta com este e-mail, enviamos um link para criar uma senha nova. Confira também a caixa de spam.';
      }
    } catch (e) {
      // Recuperar a senha não diz se o e-mail tem conta (evita descobrir quem usa o site).
      if (modo === 'recuperar' && e && e.code === 'auth/user-not-found') ok.textContent = 'Se houver uma conta com este e-mail, enviamos um link para criar uma senha nova.';
      else erro.textContent = mensagem(e);
    } finally {
      enviar.disabled = false;
    }
  });

  function focaveis() { return [...caixa.querySelectorAll('button:not(:disabled),input,a[href]')].filter((n) => n.offsetParent !== null); }
  document.addEventListener('keydown', (ev) => {
    if (fundo.hidden) return;
    if (ev.key === 'Escape') { esconder(); return; }
    if (ev.key !== 'Tab') return;
    const lista = focaveis();
    const i = lista.indexOf(document.activeElement);
    if (ev.shiftKey && i <= 0) { ev.preventDefault(); lista[lista.length - 1].focus(); }
    else if (!ev.shiftKey && i === lista.length - 1) { ev.preventDefault(); lista[0].focus(); }
  });
  // Entrou (por qualquer caminho): o modal fecha sozinho.
  progresso.aoMudar(() => { if (!fundo.hidden && progresso.usuario()) esconder(); });

  function mostrar(inicial = 'entrar') {
    antes = document.activeElement;
    senha.input.value = '';
    fundo.hidden = false;
    trocar(inicial);
  }
  function esconder() {
    if (fundo.hidden) return;
    fundo.hidden = true;
    if (antes && antes.isConnected) antes.focus();
  }
  return { mostrar };
}

export function abrirLogin(progresso, modo) {
  if (!modal) modal = criarModal(progresso);
  modal.mostrar(modo);
}

// Botão "Entrar" que abre o modal. `contornado`: versão com contorno, para fundo claro.
export function botaoEntrar(progresso, { contornado = false, texto = 'Entrar' } = {}) {
  return el('button', { class: 'btn-entrar' + (contornado ? ' contornado' : ''), type: 'button', onclick: () => abrirLogin(progresso) }, texto);
}
