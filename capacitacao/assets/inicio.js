// Página inicial (index.html): apresentação, cartão de login e a lista de trilhas.
import { progresso } from './progresso.js';
import { montarTopo } from './topo.js';
import { el, svg, ICONES } from './dom.js';
import { botaoEntrar } from './login.js';
import { montarCatalogo } from './catalogo.js';

montarTopo(progresso);
const cartao = document.getElementById('login-card');

function pintar() {
  if (!progresso.nuvemDisponivel()) { cartao.hidden = true; return; }
  cartao.hidden = false;
  const u = progresso.usuario();
  if (!u) {
    cartao.replaceChildren(botaoEntrar(progresso, { contornado: true, texto: 'Entrar ou criar conta' }),
      el('p', { class: 'landing-login-hint' }, 'Entre com o Google ou com e-mail e senha. Assim o seu progresso fica salvo e você continua de qualquer computador.'));
    return;
  }
  cartao.replaceChildren(el('div', { class: 'landing-logado' },
    el('span', { class: 'check-verde' }, svg(ICONES.check)),
    el('p', {}, 'Conectado como ', el('strong', {}, u.nome), '. Seu progresso está sendo salvo.')));
}
progresso.aoMudar(pintar);
pintar();
montarCatalogo(progresso);
