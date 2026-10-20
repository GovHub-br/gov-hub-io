// Loja do progresso da trilha: o que está feito, quem está logado e qual foi a última aula.
// Sem sessão, tudo fica no navegador. Com sessão Google, o Firestore é a fonte da verdade e o
// navegador guarda só um cache da conta, apagado no logout (ADR 0004).
// Não conhece o DOM nem o Firebase: recebe o armazenamento e a nuvem prontos — por isso é
// testada em Node (tests/progresso-loja.test.js).
import { mesclar, alternar as alternarIds } from './progresso-nucleo.js';

export const CHAVE_ANONIMO = 'govhub-dashboards-roadmap-v1';
export const CHAVE_ULTIMA_ANONIMO = 'govhub-dashboards-ultima-aula';
export const CHAVE_CONTA = 'govhub-dashboards-progresso-conta';
// Notas que este navegador deu às trilhas ({slug: nota}). Fica no navegador, não na conta.
export const CHAVE_NOTAS_TRILHA = 'govhub-trilhas-notas';

// Fechar a janela do Google não é erro de quem lê: não merece aviso.
const ERROS_SILENCIOSOS = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

function lerJSON(armazenamento, chave, padrao) {
  try {
    const bruto = armazenamento.get(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch {
    return padrao;
  }
}

// Antes de haver várias trilhas, a última aula era { path, item } e só existia a de Dashboards.
export function normalizarUltima(valor) {
  if (!valor || !valor.path) return null;
  return { trilha: valor.trilha || 'dashboards', path: valor.path };
}

export const CLAREZA = ['confuso', 'claro', 'muito-claro'];
export const USO = ['sim', 'talvez', 'nao'];
export const LIMITE_COMENTARIO = 1000;
export const SENHA_MINIMA = 6;   // mínimo do Firebase Auth
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function criarLoja({ armazenamento, criarNuvem = async () => null, agora = () => new Date() }) {
  let nuvem = null;
  let usuario = null;
  let feitos = {};
  let ultimaAula = null;
  let avaliadas = {};
  let pararDeOuvir = null;
  let sessao = 0;   // muda a cada troca de login/logout: respostas de sessões antigas são descartadas
  // Sessão restaurada do cache, nuvem ainda não conectada: o que a pessoa fizer fica anotado aqui
  // (por aula, a última intenção; e a última aula aberta) e vai para a conta quando ela conectar.
  // null fora dessa janela.
  let pendentes = null;
  // Conta criada agora: o Firebase avisa a troca de usuário antes de gravar o nome (updateProfile).
  const nomesNovos = {};
  const ouvintes = new Set();
  const ouvintesAviso = new Set();

  const emitir = () => ouvintes.forEach((cb) => cb());
  const avisar = (texto) => ouvintesAviso.forEach((cb) => cb(texto));

  function carregarAnonimo() {
    feitos = lerJSON(armazenamento, CHAVE_ANONIMO, {});
    ultimaAula = lerJSON(armazenamento, CHAVE_ULTIMA_ANONIMO, null);
  }

  function salvarLocal() {
    if (usuario) {
      armazenamento.set(CHAVE_CONTA, JSON.stringify({ uid: usuario.uid, usuario, feitos, ultimaAula, avaliadas }));
      return;
    }
    armazenamento.set(CHAVE_ANONIMO, JSON.stringify(feitos));
    if (ultimaAula) armazenamento.set(CHAVE_ULTIMA_ANONIMO, JSON.stringify(ultimaAula));
  }

  function pararSincronizacao() {
    if (pararDeOuvir) {
      pararDeOuvir();
      pararDeOuvir = null;
    }
  }

  function desconectar() {
    pararSincronizacao();
    pendentes = null;
    armazenamento.remove(CHAVE_CONTA);
    usuario = null;
    avaliadas = {};
    carregarAnonimo();
    emitir();
  }

  // A nuvem recusou a gravação que levava o progresso anônimo: ele pertence a este navegador e
  // volta para a chave anônima (união com o que houver ali), mesmo que a sessão já tenha acabado.
  function devolverAnonimo(anonimo, ultimaAnonima, minha) {
    if (Object.keys(anonimo).length > 0) {
      armazenamento.set(CHAVE_ANONIMO, JSON.stringify(mesclar(lerJSON(armazenamento, CHAVE_ANONIMO, {}), anonimo)));
    }
    if (ultimaAnonima && !lerJSON(armazenamento, CHAVE_ULTIMA_ANONIMO, null)) {
      armazenamento.set(CHAVE_ULTIMA_ANONIMO, JSON.stringify(ultimaAnonima));
    }
    if (minha === sessao) {
      // Ainda logado: mantém as aulas visíveis; a próxima entrada absorve de novo (união é idempotente).
      feitos = mesclar(feitos, anonimo);
      salvarLocal();
      emitir();
      avisar('Não foi possível salvar; entre de novo.');
    } else if (!usuario) {
      carregarAnonimo();
      emitir();
    }
  }

  // Uma única espera (a leitura da conta). Depois dela tudo é síncrono: nada pode ser marcado,
  // desmarcado ou zerado no anônimo entre ler a chave e apagá-la.
  async function conectar(u) {
    const minha = sessao;
    const remoto = await nuvem.ler(u.uid);
    if (minha !== sessao) return;
    const anonimo = lerJSON(armazenamento, CHAVE_ANONIMO, {});
    const ultimaAnonima = lerJSON(armazenamento, CHAVE_ULTIMA_ANONIMO, null);
    // O que foi feito sobre o cache desta mesma conta antes de a nuvem conectar vale por cima do remoto.
    const meus = pendentes && usuario && usuario.uid === u.uid ? pendentes : null;
    pendentes = null;
    const novosFeitos = mesclar(anonimo, remoto && remoto.feitos);
    const marcados = [];
    const desmarcados = [];
    if (meus) {
      for (const [id, valor] of Object.entries(meus.feitos)) {
        if (valor) { novosFeitos[id] = true; marcados.push(id); }
        else { delete novosFeitos[id]; desmarcados.push(id); }
      }
    }
    const novaUltima = (meus && meus.ultimaAula) || (remoto && remoto.ultimaAula) || ultimaAnonima;
    const trazAlgo = Object.keys(anonimo).length > 0 || (!!ultimaAnonima && !(remoto && remoto.ultimaAula));
    // O anônimo foi absorvido pela conta: não volta a ser somado numa próxima entrada.
    armazenamento.remove(CHAVE_ANONIMO);
    armazenamento.remove(CHAVE_ULTIMA_ANONIMO);
    usuario = nomesNovos[u.uid] ? { ...u, nome: nomesNovos[u.uid] } : u;
    feitos = novosFeitos;
    ultimaAula = novaUltima;
    avaliadas = (remoto && remoto.avaliadas) || {};
    salvarLocal();
    emitir();
    if (!remoto || trazAlgo) {
      // Sem await: o Firestore aplica a escrita local na hora e só confirma com o servidor.
      nuvem.gravarTudo(u.uid, { feitos: novosFeitos, ultimaAula: novaUltima }).catch(() => {
        devolverAnonimo(anonimo, ultimaAnonima, minha);
      });
    }
    if (meus) {
      const falhou = () => { if (minha === sessao) avisar('Não foi possível salvar; entre de novo.'); };
      if (marcados.length) nuvem.marcar(u.uid, marcados, true).catch(falhou);
      if (desmarcados.length) nuvem.marcar(u.uid, desmarcados, false).catch(falhou);
      if (meus.ultimaAula) nuvem.gravarUltimaAula(u.uid, meus.ultimaAula).catch(falhou);
    }
    pararDeOuvir = nuvem.ouvir(u.uid, (dados) => {
      if (minha !== sessao) return;
      feitos = dados.feitos || {};
      ultimaAula = dados.ultimaAula || null;
      avaliadas = dados.avaliadas || {};
      salvarLocal();
      emitir();
    }, () => {
      if (minha !== sessao) return;
      avisar('Não foi possível sincronizar o progresso; entre de novo.');
    });
  }

  function aoMudarUsuario(u) {
    sessao += 1;
    pararSincronizacao();
    if (!u) {
      desconectar();
      return;
    }
    if (usuario && usuario.uid !== u.uid) {
      // cache de outra conta: nunca é somado a esta, nem o que foi feito sobre ele
      pendentes = null;
      armazenamento.remove(CHAVE_CONTA);
      usuario = null;
      avaliadas = {};
      carregarAnonimo();
      emitir();
    }
    const minha = sessao;
    conectar(u).catch(() => {
      if (minha !== sessao) return;
      // A leitura falhou: a janela de "nuvem ainda não conectada" acabou. O que foi anotado vai
      // para a conta (merge só dos ids tocados, sem apagar o resto) e as próximas ações seguem
      // direto para a nuvem, em vez de ficarem anotadas para sempre sem destino.
      const meus = pendentes;
      pendentes = null;
      if (meus && usuario && usuario.uid === u.uid && nuvem) {
        const ids = (valor) => Object.keys(meus.feitos).filter((id) => !!meus.feitos[id] === valor);
        if (ids(true).length) nuvem.marcar(u.uid, ids(true), true).catch(() => {});
        if (ids(false).length) nuvem.marcar(u.uid, ids(false), false).catch(() => {});
        if (meus.ultimaAula) nuvem.gravarUltimaAula(u.uid, meus.ultimaAula).catch(() => {});
      }
      avisar('Não foi possível carregar o progresso da sua conta.');
    });
  }

  async function iniciar() {
    // Sessão restaurada: mostra o cache da conta na hora; a nuvem confirma em seguida.
    const cache = lerJSON(armazenamento, CHAVE_CONTA, null);
    if (cache && cache.uid && cache.usuario) {
      usuario = cache.usuario;
      feitos = cache.feitos || {};
      ultimaAula = cache.ultimaAula || null;
      avaliadas = cache.avaliadas || {};
      pendentes = { feitos: {}, ultimaAula: null };
    } else {
      carregarAnonimo();
    }
    emitir();
    try {
      nuvem = await criarNuvem();
    } catch {
      nuvem = null;
    }
    if (!nuvem) {
      if (usuario) desconectar();
      return;
    }
    emitir();   // o botão "Entrar com Google" pode aparecer
    nuvem.aoMudarUsuario(aoMudarUsuario);
  }

  function alternar(ids) {
    // Nada a alternar: sem mudar estado, salvar, emitir nem falar com a nuvem.
    if (!ids || ids.length === 0) return false;
    const antes = feitos;
    const { feitos: depois, marcou } = alternarIds(feitos, ids);
    feitos = depois;
    salvarLocal();
    emitir();
    if (pendentes) {
      for (const id of ids) pendentes.feitos[id] = marcou;
    } else if (usuario && nuvem) {
      const minha = sessao;
      nuvem.marcar(usuario.uid, ids, marcou).catch(() => {
        if (minha !== sessao || !usuario) return;
        const restaurado = { ...feitos };
        for (const id of ids) {
          if (antes[id]) restaurado[id] = true;
          else delete restaurado[id];
        }
        feitos = restaurado;
        salvarLocal();
        emitir();
        avisar('Não foi possível salvar; entre de novo.');
      });
    }
    return marcou;
  }

  function zerar() {
    if (pendentes) for (const id of Object.keys(feitos)) pendentes.feitos[id] = false;
    feitos = {};
    salvarLocal();
    emitir();
    if (!pendentes && usuario && nuvem) {
      const minha = sessao;
      nuvem.gravarTudo(usuario.uid, { feitos: {}, ultimaAula })
        .catch(() => { if (minha === sessao) avisar('Não foi possível salvar; entre de novo.'); });
    }
  }

  function registrarUltimaAula(trilha, path) {
    ultimaAula = { trilha, path };
    salvarLocal();
    if (pendentes) pendentes.ultimaAula = ultimaAula;
    else if (usuario && nuvem) nuvem.gravarUltimaAula(usuario.uid, ultimaAula).catch(() => {});
  }

  async function avaliar(id, trilha, { clareza, uso, comentario } = {}) {
    if (!usuario || !nuvem) throw new Error('sem-sessao');
    const texto = typeof comentario === 'string' ? comentario.trim() : '';
    if (!CLAREZA.includes(clareza) || !USO.includes(uso) || texto.length > LIMITE_COMENTARIO) {
      throw new Error('resposta-invalida');
    }
    const periodo = periodoAtual();
    // Nada que identifique a pessoa: nem uid, nem nome, nem e-mail, nem horário.
    const dados = { trilha, aula: id, clareza, uso, periodo };
    if (texto) dados.comentario = texto;
    const minha = sessao;
    const uid = usuario.uid;
    const n = nuvem;
    await n.enviarFeedback(dados);
    if (minha !== sessao) return;
    avaliadas = { ...avaliadas, [id]: true };
    salvarLocal();
    emitir();
    // O feedback já está salvo; se a marcação falhar, no pior caso a pessoa avalia de novo noutro dispositivo.
    n.marcarAvaliada(uid, id).catch(() => {});
  }

  function periodoAtual() {
    const d = agora();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  // Nota de 1 a 5 para a trilha inteira, dada ao concluir. Como o feedback da aula: sem nada que
  // identifique a pessoa.
  async function avaliarTrilha(trilha, nota) {
    if (!usuario || !nuvem) throw new Error('sem-sessao');
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) throw new Error('nota-invalida');
    await nuvem.enviarAvaliacaoTrilha({ trilha, nota, periodo: periodoAtual() });
    const notas = lerJSON(armazenamento, CHAVE_NOTAS_TRILHA, {});
    armazenamento.set(CHAVE_NOTAS_TRILHA, JSON.stringify({ ...notas, [trilha]: nota }));
    emitir();
  }

  function entrar() {
    if (!nuvem) return Promise.resolve();
    return nuvem.entrar().catch((e) => {
      if (!ERROS_SILENCIOSOS.includes(e && e.code)) avisar('Não foi possível entrar com o Google.');
    });
  }

  // E-mail e senha (além do Google). Os erros do Firebase sobem com o `code` para a tela traduzir.
  function emailLimpo(email) {
    const e = String(email || '').trim();
    if (!EMAIL_RE.test(e)) throw new Error('email-invalido');
    return e;
  }
  async function entrarComEmail(email, senha) {
    if (!nuvem) throw new Error('sem-nuvem');
    await nuvem.entrarComEmail(emailLimpo(email), String(senha || ''));
  }
  async function criarConta({ nome, email, senha }) {
    if (!nuvem) throw new Error('sem-nuvem');
    const n = String(nome || '').trim();
    if (!n) throw new Error('nome-vazio');
    const e = emailLimpo(email);
    if (String(senha || '').length < SENHA_MINIMA) throw new Error('senha-curta');
    const uid = await nuvem.criarConta(n, e, senha);
    nomesNovos[uid] = n;
    if (usuario && usuario.uid === uid && usuario.nome !== n) {
      usuario = { ...usuario, nome: n };
      salvarLocal();
      emitir();
    }
  }
  async function redefinirSenha(email) {
    if (!nuvem) throw new Error('sem-nuvem');
    await nuvem.redefinirSenha(emailLimpo(email));
  }

  function sair() {
    return nuvem ? nuvem.sair() : Promise.resolve();
  }

  // Outra aba mexeu no progresso anônimo. Com sessão, quem sincroniza as abas é o Firestore.
  function recarregar(chave) {
    if (usuario) return;
    if (chave !== null && chave !== CHAVE_ANONIMO && chave !== CHAVE_ULTIMA_ANONIMO) return;
    carregarAnonimo();
    emitir();
  }

  return {
    iniciar, alternar, zerar, registrarUltimaAula, entrar, sair, recarregar,
    entrarComEmail, criarConta, redefinirSenha,
    avaliar, avaliarTrilha,
    trilhaAvaliada: (trilha) => lerJSON(armazenamento, CHAVE_NOTAS_TRILHA, {})[trilha] || null,
    feitos: () => feitos,
    foiAvaliada: (id) => !!avaliadas[id],
    usuario: () => usuario,
    ultimaAula: () => normalizarUltima(ultimaAula),
    nuvemDisponivel: () => !!nuvem,
    aoMudar(cb) { ouvintes.add(cb); return () => ouvintes.delete(cb); },
    aoAviso(cb) { ouvintesAviso.add(cb); return () => ouvintesAviso.delete(cb); },
  };
}
