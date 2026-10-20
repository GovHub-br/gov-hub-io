import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarLoja, normalizarUltima, CHAVE_ANONIMO, CHAVE_ULTIMA_ANONIMO, CHAVE_CONTA } from '../assets/progresso-loja.js';

const esperar = () => new Promise((r) => setTimeout(r, 0));
const ANA = { uid: 'ana', nome: 'Ana Souza', email: 'ana@exemplo.gov.br', foto: null };
const BETO = { uid: 'beto', nome: 'Beto', email: null, foto: null };

function armazenamentoFalso(inicial = {}) {
  const m = new Map(Object.entries(inicial).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    get: (k) => (m.has(k) ? m.get(k) : null),
    set: (k, v) => { m.set(k, v); },
    remove: (k) => { m.delete(k); },
    json: (k) => (m.has(k) ? JSON.parse(m.get(k)) : null),
  };
}

// Firestore de mentira: guarda os documentos em memória e entrega cada mudança aos ouvintes,
// como o onSnapshot faz.
function nuvemFalsa(docs = {}) {
  let aoUsuario = () => {};
  const ouvintes = new Map();
  const copia = (uid) => (docs[uid] ? structuredClone(docs[uid]) : { feitos: {}, ultimaAula: null });
  const notificar = (uid) => { const cb = ouvintes.get(uid); if (cb) cb(copia(uid)); };
  const nuvem = {
    docs, chamadas: [], recusar: false,
    feedbacks: [], recusarFeedback: false, notasTrilha: [],
    async enviarFeedback(d) { if (nuvem.recusarFeedback) throw new Error('x'); nuvem.feedbacks.push(structuredClone(d)); },
    async enviarAvaliacaoTrilha(d) { if (nuvem.recusarFeedback) throw new Error('x'); nuvem.notasTrilha.push(structuredClone(d)); },
    async marcarAvaliada(uid, id) {
      (docs[uid] ||= { feitos: {}, ultimaAula: null }).avaliadas = { ...(docs[uid].avaliadas || {}), [id]: true };
      notificar(uid);
    },
    aoMudarUsuario(cb) { aoUsuario = cb; },
    async entrar() {},
    async sair() { aoUsuario(null); },
    segurarLeituras: false, pendentes: [],
    segurarMarcar: false, pendentesMarcar: [], ouvintes,
    async ler(uid) {
      const agora = () => (docs[uid] ? structuredClone(docs[uid]) : null);
      if (!nuvem.segurarLeituras) return agora();
      return new Promise((r) => { nuvem.pendentes.push(() => r(agora())); });
    },
    segurarGravarTudo: false, pendentesGravar: [], recusarGravarTudo: false, reversoes: [],
    // Como o Firestore: a escrita local vale na hora (e os ouvintes a veem); a confirmação demora
    // ou falha, e na falha a visão otimista é revertida e os ouvintes são avisados de novo.
    async gravarTudo(uid, dados) {
      nuvem.chamadas.push('gravarTudo');
      const antes = docs[uid] ? structuredClone(docs[uid]) : null;
      // setDoc com merge: os campos enviados substituem os do documento; os demais (avaliadas) ficam.
      docs[uid] = { ...(antes || {}), ...structuredClone(dados) };
      notificar(uid);
      if (nuvem.segurarGravarTudo) await new Promise((r) => { nuvem.pendentesGravar.push(r); });
      await Promise.resolve();
      if (nuvem.recusarGravarTudo) {
        if (antes) docs[uid] = antes; else delete docs[uid];
        notificar(uid);
        throw Object.assign(new Error('recusado'), { code: 'permission-denied' });
      }
    },
    // Outro dispositivo mexeu: também vale como base para reverter escritas pendentes.
    externo(uid, id) {
      (docs[uid] || (docs[uid] = { feitos: {}, ultimaAula: null })).feitos[id] = true;
      nuvem.reversoes.forEach((rv) => { if (rv.uid === uid) rv.anteriores[id] = true; });
      notificar(uid);
    },
    async marcar(uid, ids, valor) {
      nuvem.chamadas.push('marcar');
      // Como setDoc com merge: cria o documento se ele não existir.
      const d = docs[uid] || (docs[uid] = { feitos: {}, ultimaAula: null });
      const rv = { uid, anteriores: {} };
      for (const id of ids) rv.anteriores[id] = !!d.feitos[id];
      nuvem.reversoes.push(rv);
      for (const id of ids) { if (valor) d.feitos[id] = true; else delete d.feitos[id]; }
      notificar(uid);
      if (nuvem.segurarMarcar) await new Promise((r) => { nuvem.pendentesMarcar.push(r); });
      await Promise.resolve();   // a recusa chega do servidor, nunca no mesmo instante
      if (nuvem.recusar) {
        for (const id of ids) { if (rv.anteriores[id]) d.feitos[id] = true; else delete d.feitos[id]; }
        notificar(uid);
        throw Object.assign(new Error('recusado'), { code: 'permission-denied' });
      }
    },
    async gravarUltimaAula(uid, ultima) {
      nuvem.chamadas.push('gravarUltimaAula');
      // Como setDoc com merge: cria o documento se ele não existir.
      (docs[uid] || (docs[uid] = { feitos: {}, ultimaAula: null })).ultimaAula = ultima;
    },
    ouvir(uid, cb) { ouvintes.set(uid, cb); cb(copia(uid)); return () => ouvintes.delete(uid); },
    logar(usuario) { aoUsuario(usuario); },
    // Como o Firebase: a conta nova dispara a troca de usuário ainda sem o nome (updateProfile vem depois).
    contas: {}, chamadasEmail: [],
    async criarConta(nome, email, senha) {
      if (nuvem.contas[email]) throw Object.assign(new Error('x'), { code: 'auth/email-already-in-use' });
      const uid = 'u-' + email;
      nuvem.contas[email] = senha;
      aoUsuario({ uid, nome: email, email, foto: null });
      return uid;
    },
    async entrarComEmail(email, senha) {
      nuvem.chamadasEmail.push(['entrar', email]);
      if (nuvem.contas[email] !== senha) throw Object.assign(new Error('x'), { code: 'auth/invalid-credential' });
      aoUsuario({ uid: 'u-' + email, nome: email, email, foto: null });
    },
    async redefinirSenha(email) { nuvem.chamadasEmail.push(['redefinir', email]); },
  };
  return nuvem;
}

async function lojaLogada({ anonimo = {}, docs = {} } = {}) {
  const arm = armazenamentoFalso(anonimo);
  const nuvem = nuvemFalsa(docs);
  const loja = criarLoja({ armazenamento: arm, criarNuvem: async () => nuvem });
  await loja.iniciar();
  nuvem.logar(ANA);
  await esperar();
  return { arm, nuvem, loja };
}

test('sem nuvem, o progresso fica na chave anônima de sempre', async () => {
  const arm = armazenamentoFalso({ [CHAVE_ANONIMO]: { 'explicacao/a': true } });
  const loja = criarLoja({ armazenamento: arm });
  await loja.iniciar();
  assert.deepEqual(loja.feitos(), { 'explicacao/a': true });
  assert.equal(loja.alternar(['explicacao/b']), true);
  assert.deepEqual(arm.json(CHAVE_ANONIMO), { 'explicacao/a': true, 'explicacao/b': true });
  assert.equal(loja.nuvemDisponivel(), false);
  assert.equal(loja.usuario(), null);
});

test('sem nuvem, um cache de conta antigo é descartado', async () => {
  const arm = armazenamentoFalso({ [CHAVE_CONTA]: { uid: 'ana', usuario: ANA, feitos: { x: true }, ultimaAula: null } });
  const loja = criarLoja({ armazenamento: arm, criarNuvem: async () => null });
  await loja.iniciar();
  assert.equal(loja.usuario(), null);
  assert.deepEqual(loja.feitos(), {});
  assert.equal(arm.get(CHAVE_CONTA), null);
});

test('ao entrar, o progresso anônimo é somado à conta e sai do navegador', async () => {
  const { arm, nuvem, loja } = await lojaLogada({
    anonimo: { [CHAVE_ANONIMO]: { a: true }, [CHAVE_ULTIMA_ANONIMO]: { path: 'docs/a.md', item: 'a' } },
    docs: { ana: { feitos: { b: true }, ultimaAula: null } },
  });
  assert.deepEqual(loja.feitos(), { a: true, b: true });
  assert.deepEqual(nuvem.docs.ana.feitos, { a: true, b: true });
  assert.deepEqual(loja.ultimaAula(), { trilha: 'dashboards', path: 'docs/a.md' });
  assert.equal(arm.get(CHAVE_ANONIMO), null);
  assert.equal(arm.get(CHAVE_ULTIMA_ANONIMO), null);
  assert.equal(arm.json(CHAVE_CONTA).uid, 'ana');
  assert.equal(loja.usuario().uid, 'ana');
});

test('entrar sem progresso anônimo não regrava a conta', async () => {
  const { nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: { b: true }, ultimaAula: { path: 'docs/b.md', item: 'b' } } } });
  assert.deepEqual(nuvem.chamadas, []);
  assert.deepEqual(loja.feitos(), { b: true });
  assert.deepEqual(loja.ultimaAula(), { trilha: 'dashboards', path: 'docs/b.md' });
});

test('a primeira entrada de uma conta nova cria o documento', async () => {
  const { nuvem } = await lojaLogada();
  assert.deepEqual(nuvem.chamadas, ['gravarTudo']);
  assert.deepEqual(nuvem.docs.ana, { feitos: {}, ultimaAula: null });
});

test('ao sair, o cache da conta é apagado e o navegador fica vazio', async () => {
  const { arm, loja } = await lojaLogada({ docs: { ana: { feitos: { b: true }, ultimaAula: null } } });
  await loja.sair();
  assert.equal(loja.usuario(), null);
  assert.deepEqual(loja.feitos(), {});
  assert.equal(loja.ultimaAula(), null);
  assert.equal(arm.get(CHAVE_CONTA), null);
  assert.equal(arm.get(CHAVE_ANONIMO), null);
});

test('marcar com sessão grava na nuvem e no cache, não na chave anônima', async () => {
  const { arm, nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: {}, ultimaAula: null } } });
  loja.alternar(['g', 'g--2']);
  await esperar();
  assert.deepEqual(nuvem.docs.ana.feitos, { g: true, 'g--2': true });
  assert.deepEqual(arm.json(CHAVE_CONTA).feitos, { g: true, 'g--2': true });
  assert.equal(arm.get(CHAVE_ANONIMO), null);
});

test('gravação recusada desfaz a marcação otimista e avisa', async () => {
  const { nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: {}, ultimaAula: null } } });
  const avisos = [];
  loja.aoAviso((t) => avisos.push(t));
  nuvem.recusar = true;
  loja.alternar(['a']);
  assert.deepEqual(loja.feitos(), { a: true }, 'otimista: marca na hora');
  await esperar();
  assert.deepEqual(loja.feitos(), {});
  assert.equal(avisos.length, 1);
  assert.match(avisos[0], /entre de novo/);
});

test('mudança vinda de outro dispositivo atualiza a loja e avisa os ouvintes', async () => {
  const { nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: {}, ultimaAula: null } } });
  let chamadas = 0;
  loja.aoMudar(() => { chamadas += 1; });
  await nuvem.marcar('ana', ['z'], true);
  assert.equal(loja.feitos().z, true);
  assert.ok(chamadas > 0);
});

test('sessão restaurada mostra o cache antes de a nuvem responder', async () => {
  const arm = armazenamentoFalso({ [CHAVE_CONTA]: { uid: 'ana', usuario: ANA, feitos: { a: true }, ultimaAula: null } });
  let liberar;
  const loja = criarLoja({ armazenamento: arm, criarNuvem: () => new Promise((r) => { liberar = r; }) });
  const iniciando = loja.iniciar();
  await esperar();
  assert.equal(loja.usuario().uid, 'ana');
  assert.deepEqual(loja.feitos(), { a: true });
  liberar(null);
  await iniciando;
});

test('cache de outra conta nunca é somado à conta que entrou', async () => {
  const arm = armazenamentoFalso({ [CHAVE_CONTA]: { uid: 'beto', usuario: BETO, feitos: { x: true }, ultimaAula: null } });
  const nuvem = nuvemFalsa({ ana: { feitos: { b: true }, ultimaAula: null } });
  const loja = criarLoja({ armazenamento: arm, criarNuvem: async () => nuvem });
  await loja.iniciar();
  nuvem.logar(ANA);
  await esperar();
  assert.deepEqual(loja.feitos(), { b: true });
  assert.deepEqual(nuvem.docs.ana.feitos, { b: true });
  assert.equal(arm.json(CHAVE_CONTA).uid, 'ana');
});

test('última aula: anônima fica no navegador; com sessão vai para a nuvem', async () => {
  const arm = armazenamentoFalso();
  const anon = criarLoja({ armazenamento: arm });
  await anon.iniciar();
  anon.registrarUltimaAula('dashboards', 'docs/a.md');
  assert.deepEqual(arm.json(CHAVE_ULTIMA_ANONIMO), { trilha: 'dashboards', path: 'docs/a.md' });

  const { nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: {}, ultimaAula: null } } });
  loja.registrarUltimaAula('dashboards', 'docs/b.md');
  await esperar();
  assert.deepEqual(nuvem.docs.ana.ultimaAula, { trilha: 'dashboards', path: 'docs/b.md' });
});

test('zerar com sessão apaga também na nuvem', async () => {
  const { nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: { a: true }, ultimaAula: null } } });
  loja.zerar();
  await esperar();
  assert.deepEqual(loja.feitos(), {});
  assert.deepEqual(nuvem.docs.ana.feitos, {});
});

test('outra aba mexeu no progresso anônimo: recarregar relê o navegador', async () => {
  const arm = armazenamentoFalso();
  const loja = criarLoja({ armazenamento: arm });
  await loja.iniciar();
  arm.set(CHAVE_ANONIMO, JSON.stringify({ c: true }));
  loja.recarregar(CHAVE_ANONIMO);
  assert.deepEqual(loja.feitos(), { c: true });
});

async function lojaComLeituraSegura(docs, anonimo = {}) {
  const arm = armazenamentoFalso(anonimo);
  const nuvem = nuvemFalsa(docs);
  const loja = criarLoja({ armazenamento: arm, criarNuvem: async () => nuvem });
  await loja.iniciar();
  nuvem.segurarLeituras = true;
  return { arm, nuvem, loja };
}

test('sair enquanto a conta carrega: a sessão antiga não revive', async () => {
  const { arm, nuvem, loja } = await lojaComLeituraSegura({ ana: { feitos: { b: true }, ultimaAula: null } });
  nuvem.logar(ANA);
  await esperar();
  await loja.sair();
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  assert.equal(loja.usuario(), null);
  assert.equal(arm.get(CHAVE_CONTA), null);
  assert.deepEqual(arm.json(CHAVE_ANONIMO) || {}, {});
  await nuvem.marcar('ana', ['z'], true);
  assert.deepEqual(loja.feitos(), {});
  assert.deepEqual(arm.json(CHAVE_ANONIMO) || {}, {});
});

test('trocar de conta enquanto a anterior carrega: vale a última', async () => {
  const { arm, nuvem, loja } = await lojaComLeituraSegura({
    ana: { feitos: { a: true }, ultimaAula: null },
    beto: { feitos: { b: true }, ultimaAula: null },
  });
  nuvem.logar(ANA);
  await esperar();
  nuvem.logar(BETO);
  await esperar();
  nuvem.pendentes.reverse().forEach((f) => f());   // a leitura de Beto chega antes da de Ana
  await esperar();
  assert.equal(loja.usuario().uid, 'beto');
  assert.deepEqual(loja.feitos(), { b: true });
  assert.equal(arm.json(CHAVE_CONTA).uid, 'beto');
  await nuvem.marcar('ana', ['z'], true);
  assert.deepEqual(loja.feitos(), { b: true });
});

test('aula marcada durante o login não se perde', async () => {
  const { nuvem, loja } = await lojaComLeituraSegura({ ana: { feitos: { b: true }, ultimaAula: null } });
  nuvem.logar(ANA);
  await esperar();
  loja.alternar(['nova']);
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  assert.equal(nuvem.docs.ana.feitos.nova, true);
  assert.equal(loja.feitos().nova, true);
  assert.equal(loja.feitos().b, true);
});

test('aula marcada enquanto a gravação da entrada está pendente também chega à conta', async () => {
  const { nuvem, loja } = await lojaComLeituraSegura({ ana: { feitos: {}, ultimaAula: null } });
  nuvem.logar(ANA);
  await esperar();
  loja.alternar(['x']);
  nuvem.segurarGravarTudo = true;
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  assert.equal(loja.usuario().uid, 'ana', 'conectar não espera a gravação');
  loja.alternar(['y']);
  nuvem.pendentesGravar.forEach((f) => f());
  await esperar();
  assert.equal(loja.feitos().x, true);
  assert.equal(loja.feitos().y, true);
  assert.equal(nuvem.docs.ana.feitos.x, true);
  assert.equal(nuvem.docs.ana.feitos.y, true);
});

test('conectar termina mesmo que a gravação da entrada nunca responda', async () => {
  const { arm, nuvem, loja } = await lojaComLeituraSegura({ ana: { feitos: {}, ultimaAula: null } }, { [CHAVE_ANONIMO]: { x: true } });
  nuvem.segurarGravarTudo = true;
  nuvem.logar(ANA);
  await esperar();
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  assert.equal(loja.usuario().uid, 'ana');
  assert.ok(nuvem.ouvintes.has('ana'), 'ouvinte da conta inscrito');
  assert.equal(arm.get(CHAVE_ANONIMO), null);
  assert.equal(loja.feitos().x, true);
});

test('gravação da entrada recusada avisa uma vez', async () => {
  const { nuvem, loja } = await lojaComLeituraSegura({ ana: { feitos: {}, ultimaAula: null } }, { [CHAVE_ANONIMO]: { x: true } });
  const avisos = [];
  loja.aoAviso((t) => avisos.push(t));
  nuvem.segurarGravarTudo = true;
  nuvem.logar(ANA);
  await esperar();
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  nuvem.recusarGravarTudo = true;
  nuvem.pendentesGravar.forEach((f) => f());
  await esperar();
  assert.equal(avisos.length, 1);
  assert.match(avisos[0], /entre de novo/);
});

test('gravação da entrada recusada depois de a sessão mudar não avisa', async () => {
  const { nuvem, loja } = await lojaComLeituraSegura({ ana: { feitos: {}, ultimaAula: null } }, { [CHAVE_ANONIMO]: { x: true } });
  const avisos = [];
  loja.aoAviso((t) => avisos.push(t));
  nuvem.segurarGravarTudo = true;
  nuvem.logar(ANA);
  await esperar();
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  await loja.sair();
  nuvem.recusarGravarTudo = true;
  nuvem.pendentesGravar.forEach((f) => f());
  await esperar();
  assert.equal(avisos.length, 0);
});

test('desmarcar no anônimo durante o login não ressuscita a aula', async () => {
  const { nuvem, loja } = await lojaComLeituraSegura({}, { [CHAVE_ANONIMO]: { a: true } });
  nuvem.logar(ANA);
  await esperar();
  loja.alternar(['a']);
  assert.deepEqual(loja.feitos(), {});
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  assert.deepEqual(loja.feitos(), {});
  assert.deepEqual(nuvem.docs.ana.feitos, {});
});

test('zerar no anônimo durante o login não ressuscita as aulas', async () => {
  const { nuvem, loja } = await lojaComLeituraSegura({}, { [CHAVE_ANONIMO]: { a: true, b: true } });
  nuvem.logar(ANA);
  await esperar();
  loja.zerar();
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  assert.deepEqual(loja.feitos(), {});
  assert.deepEqual(nuvem.docs.ana.feitos, {});
});

test('recusa de uma sessão antiga não desfaz o estado da sessão atual', async () => {
  const { nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: {}, ultimaAula: null } } });
  const avisos = [];
  loja.aoAviso((t) => avisos.push(t));
  nuvem.segurarMarcar = true;
  loja.alternar(['a']);                       // sessão 1: marcar pendente
  await loja.sair();
  nuvem.externo('ana', 'a');                  // outro dispositivo marcou a mesma aula
  nuvem.logar(ANA);
  await esperar();
  assert.deepEqual(loja.feitos(), { a: true });
  nuvem.recusar = true;
  nuvem.pendentesMarcar.forEach((f) => f());
  await esperar();
  assert.deepEqual(loja.feitos(), { a: true });
  assert.equal(avisos.length, 0);
});

const AULA = { trilha: 'dashboards', path: 'docs/a.md' };

test('gravação da entrada recusada devolve o progresso anônimo ao navegador', async () => {
  const { arm, nuvem, loja } = await lojaComLeituraSegura({ ana: { feitos: {}, ultimaAula: null } }, { [CHAVE_ANONIMO]: { a: true, b: true } });
  nuvem.segurarGravarTudo = true;
  nuvem.logar(ANA);
  await esperar();
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  nuvem.recusarGravarTudo = true;
  nuvem.pendentesGravar.forEach((f) => f());
  await esperar();
  assert.equal(loja.usuario().uid, 'ana');
  assert.equal(loja.feitos().a, true);
  assert.equal(loja.feitos().b, true);
  await loja.sair();
  assert.deepEqual(arm.json(CHAVE_ANONIMO), { a: true, b: true });
  assert.deepEqual(loja.feitos(), { a: true, b: true });
});

test('gravação da entrada recusada devolve a última aula anônima', async () => {
  const { arm, nuvem, loja } = await lojaComLeituraSegura({ ana: { feitos: {}, ultimaAula: null } }, { [CHAVE_ULTIMA_ANONIMO]: AULA });
  nuvem.segurarGravarTudo = true;
  nuvem.logar(ANA);
  await esperar();
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  nuvem.recusarGravarTudo = true;
  nuvem.pendentesGravar.forEach((f) => f());
  await esperar();
  await loja.sair();
  assert.deepEqual(arm.json(CHAVE_ULTIMA_ANONIMO), AULA);
});

test('recusa depois do logout: sem aviso, mas o progresso anônimo volta ao navegador', async () => {
  const { arm, nuvem, loja } = await lojaComLeituraSegura({ ana: { feitos: {}, ultimaAula: null } }, { [CHAVE_ANONIMO]: { a: true }, [CHAVE_ULTIMA_ANONIMO]: AULA });
  const avisos = [];
  loja.aoAviso((t) => avisos.push(t));
  nuvem.segurarGravarTudo = true;
  nuvem.logar(ANA);
  await esperar();
  nuvem.pendentes.forEach((f) => f());
  await esperar();
  await loja.sair();
  nuvem.recusarGravarTudo = true;
  nuvem.pendentesGravar.forEach((f) => f());
  await esperar();
  assert.equal(avisos.length, 0);
  assert.deepEqual(arm.json(CHAVE_ANONIMO), { a: true });
  assert.deepEqual(arm.json(CHAVE_ULTIMA_ANONIMO), AULA);
  assert.deepEqual(loja.feitos(), { a: true });
});

test('zerar recusado depois do logout não avisa', async () => {
  const { nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: { a: true }, ultimaAula: null } } });
  const avisos = [];
  loja.aoAviso((t) => avisos.push(t));
  nuvem.segurarGravarTudo = true;
  loja.zerar();
  await loja.sair();
  nuvem.recusarGravarTudo = true;
  nuvem.pendentesGravar.forEach((f) => f());
  await esperar();
  assert.equal(avisos.length, 0);
});

test('trocar de conta mostra o estado anônimo na hora, antes de a leitura responder', async () => {
  const { nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: { a: true }, ultimaAula: null } } });
  assert.deepEqual(loja.feitos(), { a: true });
  let chamadas = 0;
  loja.aoMudar(() => { chamadas += 1; });
  nuvem.segurarLeituras = true;
  nuvem.logar(BETO);
  assert.ok(chamadas > 0);
  assert.deepEqual(loja.feitos(), {});
});

// Sessão restaurada: o cache da conta aparece na hora, mas a nuvem só conecta depois de baixar o
// Firebase e de o login responder. O que a pessoa fizer nessa janela não pode se perder.
const VELHA = { trilha: 'dashboards', path: 'docs/velha.md' };

function lojaRestaurada(docs) {
  const arm = armazenamentoFalso({ [CHAVE_CONTA]: { uid: 'ana', usuario: ANA, feitos: { a: true }, ultimaAula: VELHA } });
  const nuvem = nuvemFalsa(docs);
  let liberar;
  const loja = criarLoja({ armazenamento: arm, criarNuvem: () => new Promise((r) => { liberar = () => r(nuvem); }) });
  const iniciando = loja.iniciar();
  return { arm, nuvem, loja, conectarNuvem: async () => { liberar(); await iniciando; } };
}

test('sessão restaurada: aula marcada e última aula antes de a nuvem conectar não se perdem', async () => {
  const { nuvem, loja, conectarNuvem } = lojaRestaurada({ ana: { feitos: { a: true }, ultimaAula: VELHA } });
  await esperar();
  loja.alternar(['b']);
  loja.registrarUltimaAula('dashboards', 'docs/nova.md');
  await conectarNuvem();
  nuvem.logar(ANA);
  await esperar();
  assert.deepEqual(loja.feitos(), { a: true, b: true });
  assert.deepEqual(loja.ultimaAula(), { trilha: 'dashboards', path: 'docs/nova.md' });
  assert.deepEqual(nuvem.docs.ana.feitos, { a: true, b: true });
  assert.deepEqual(nuvem.docs.ana.ultimaAula, { trilha: 'dashboards', path: 'docs/nova.md' });
});

test('sessão restaurada: aula desmarcada antes de a nuvem conectar continua desmarcada', async () => {
  const { nuvem, loja, conectarNuvem } = lojaRestaurada({ ana: { feitos: { a: true }, ultimaAula: VELHA } });
  await esperar();
  loja.alternar(['a']);
  await conectarNuvem();
  loja.alternar(['c']);   // nuvem baixada, login ainda sem resposta
  nuvem.logar(ANA);
  await esperar();
  assert.deepEqual(loja.feitos(), { c: true });
  assert.deepEqual(nuvem.docs.ana.feitos, { c: true });
  assert.deepEqual(loja.ultimaAula(), VELHA);
});

test('sessão restaurada: o pendente da conta em cache é descartado se outra conta entra', async () => {
  const { arm, nuvem, loja, conectarNuvem } = lojaRestaurada({ beto: { feitos: { x: true }, ultimaAula: null } });
  await esperar();
  loja.alternar(['b']);
  loja.registrarUltimaAula('dashboards', 'docs/nova.md');
  await conectarNuvem();
  nuvem.logar(BETO);
  await esperar();
  assert.deepEqual(loja.feitos(), { x: true });
  assert.equal(loja.ultimaAula(), null);
  assert.deepEqual(nuvem.docs.beto.feitos, { x: true });
  assert.equal(nuvem.docs.ana, undefined);
  assert.deepEqual(nuvem.chamadas, []);
  assert.equal(arm.json(CHAVE_CONTA).uid, 'beto');
});

test('sessão restaurada: zerar antes de a nuvem conectar não ressuscita as aulas', async () => {
  const { nuvem, loja, conectarNuvem } = lojaRestaurada({ ana: { feitos: { a: true }, ultimaAula: VELHA } });
  await esperar();
  loja.zerar();
  await conectarNuvem();
  nuvem.logar(ANA);
  await esperar();
  assert.deepEqual(loja.feitos(), {});
  assert.deepEqual(nuvem.docs.ana.feitos, {});
});

test('alternar com lista vazia não muda nada nem chama a nuvem', async () => {
  const { arm, nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: { a: true }, ultimaAula: null } } });
  const antes = structuredClone(nuvem.docs.ana);
  const chamadas = nuvem.chamadas.length;
  let emissoes = 0;
  loja.aoMudar(() => { emissoes += 1; });
  const armAntes = JSON.stringify(arm.json(CHAVE_CONTA));
  assert.equal(loja.alternar([]), false);
  assert.equal(loja.alternar(undefined), false);
  await esperar();
  assert.deepEqual(loja.feitos(), { a: true });
  assert.deepEqual(nuvem.docs.ana, antes);
  assert.equal(nuvem.chamadas.length, chamadas);
  assert.equal(emissoes, 0);
  assert.equal(JSON.stringify(arm.json(CHAVE_CONTA)), armAntes);
});

test('leitura da conta falha: o que foi feito antes vai para a nuvem e o resto segue direto', async () => {
  const arm = armazenamentoFalso({ [CHAVE_CONTA]: { uid: 'ana', usuario: ANA, feitos: { a: true }, ultimaAula: null } });
  const nuvem = nuvemFalsa({ ana: { feitos: { a: true }, ultimaAula: null } });
  nuvem.ler = async () => { throw new Error('offline'); };
  const loja = criarLoja({ armazenamento: arm, criarNuvem: async () => nuvem });
  const avisos = [];
  loja.aoAviso((t) => avisos.push(t));
  await loja.iniciar();
  loja.alternar(['b']);   // antes de a leitura falhar: fica anotado
  nuvem.logar(ANA);
  await esperar();
  assert.deepEqual(avisos, ['Não foi possível carregar o progresso da sua conta.']);
  assert.deepEqual(nuvem.docs.ana.feitos, { a: true, b: true });
  loja.alternar(['c']);   // depois da falha: não é mais "pendente", vai direto
  await esperar();
  assert.deepEqual(nuvem.docs.ana.feitos, { a: true, b: true, c: true });
  assert.deepEqual(loja.feitos(), { a: true, b: true, c: true });
});

test('normalizarUltima lê o formato antigo como trilha dashboards', () => {
  assert.deepEqual(normalizarUltima({ path: 'docs/a.md', item: 'a' }), { trilha: 'dashboards', path: 'docs/a.md' });
  assert.deepEqual(normalizarUltima({ trilha: 'outra', path: 'docs/b.md' }), { trilha: 'outra', path: 'docs/b.md' });
  assert.equal(normalizarUltima(null), null);
  assert.equal(normalizarUltima({}), null);
});

test('registrarUltimaAula guarda a trilha', async () => {
  const arm = armazenamentoFalso();
  const loja = criarLoja({ armazenamento: arm });
  await loja.iniciar();
  loja.registrarUltimaAula('dashboards', 'docs/a.md');
  assert.deepEqual(loja.ultimaAula(), { trilha: 'dashboards', path: 'docs/a.md' });
  assert.deepEqual(arm.json(CHAVE_ULTIMA_ANONIMO), { trilha: 'dashboards', path: 'docs/a.md' });
});

test('ultimaAula antiga salva no navegador é lida com a trilha dashboards', async () => {
  const arm = armazenamentoFalso({ [CHAVE_ULTIMA_ANONIMO]: { path: 'docs/a.md', item: 'a' } });
  const loja = criarLoja({ armazenamento: arm });
  await loja.iniciar();
  assert.deepEqual(loja.ultimaAula(), { trilha: 'dashboards', path: 'docs/a.md' });
});

test('avaliar exige sessão', async () => {
  const loja = criarLoja({ armazenamento: armazenamentoFalso() });
  await loja.iniciar();
  await assert.rejects(loja.avaliar('a', 'dashboards', { clareza: 'claro', uso: 'sim' }), /sem-sessao/);
});

test('avaliar grava sem identificar a pessoa e marca a aula como avaliada', async () => {
  const arm = armazenamentoFalso();
  const nuvem = nuvemFalsa({ ana: { feitos: {}, ultimaAula: null } });
  const loja = criarLoja({ armazenamento: arm, criarNuvem: async () => nuvem, agora: () => new Date(2026, 9, 15, 13, 45) });
  await loja.iniciar(); nuvem.logar(ANA); await esperar();
  await loja.avaliar('explicacao/a', 'dashboards', { clareza: 'muito-claro', uso: 'talvez', comentario: '  ótima  ' });
  assert.deepEqual(nuvem.feedbacks, [{ trilha: 'dashboards', aula: 'explicacao/a', clareza: 'muito-claro', uso: 'talvez', comentario: 'ótima', periodo: '2026-10' }]);
  assert.equal(loja.foiAvaliada('explicacao/a'), true);
  await esperar();
  assert.deepEqual(nuvem.docs.ana.avaliadas, { 'explicacao/a': true });
});

test('comentário vazio não é enviado; respostas inválidas são recusadas', async () => {
  const nuvem = nuvemFalsa({ ana: { feitos: {}, ultimaAula: null } });
  const loja = criarLoja({ armazenamento: armazenamentoFalso(), criarNuvem: async () => nuvem, agora: () => new Date(2026, 0, 2) });
  await loja.iniciar(); nuvem.logar(ANA); await esperar();
  await loja.avaliar('a', 'dashboards', { clareza: 'claro', uso: 'nao', comentario: '   ' });
  assert.equal('comentario' in nuvem.feedbacks[0], false);
  assert.equal(nuvem.feedbacks[0].periodo, '2026-01');
  await assert.rejects(loja.avaliar('b', 'dashboards', { clareza: 'otimo', uso: 'sim' }), /resposta-invalida/);
  await assert.rejects(loja.avaliar('b', 'dashboards', { clareza: 'claro', uso: 'sim', comentario: 'x'.repeat(1001) }), /resposta-invalida/);
});

test('falha ao enviar não marca a aula', async () => {
  const nuvem = nuvemFalsa({ ana: { feitos: {}, ultimaAula: null } });
  const loja = criarLoja({ armazenamento: armazenamentoFalso(), criarNuvem: async () => nuvem });
  await loja.iniciar(); nuvem.logar(ANA); await esperar();
  nuvem.recusarFeedback = true;
  await assert.rejects(loja.avaliar('a', 'dashboards', { clareza: 'claro', uso: 'sim' }));
  assert.equal(loja.foiAvaliada('a'), false);
});

test('avaliadas vêm da conta e somem no logout', async () => {
  const { loja } = await lojaLogada({ docs: { ana: { feitos: {}, ultimaAula: null, avaliadas: { x: true } } } });
  assert.equal(loja.foiAvaliada('x'), true);
  await loja.sair();
  assert.equal(loja.foiAvaliada('x'), false);
});

test('trocar de conta com a leitura nova pendente: avaliações da anterior não aparecem', async () => {
  const { nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: {}, ultimaAula: null, avaliadas: { x: true } }, beto: { feitos: {}, ultimaAula: null } } });
  assert.equal(loja.foiAvaliada('x'), true);
  nuvem.segurarLeituras = true;
  nuvem.logar(BETO);
  await esperar();
  assert.equal(loja.foiAvaliada('x'), false);
});

test('trocar de conta com a leitura nova recusada: avaliações da anterior não aparecem', async () => {
  const { nuvem, loja } = await lojaLogada({ docs: { ana: { feitos: {}, ultimaAula: null, avaliadas: { x: true } } } });
  nuvem.ler = async () => { throw new Error('offline'); };
  nuvem.logar(BETO);
  await esperar();
  assert.equal(loja.foiAvaliada('x'), false);
});

test('avaliadas ficam no cache da conta e voltam numa sessão restaurada', async () => {
  const { arm } = await lojaLogada({ docs: { ana: { feitos: {}, ultimaAula: null, avaliadas: { x: true } } } });
  assert.deepEqual(arm.json(CHAVE_CONTA).avaliadas, { x: true });
  const nuvem = nuvemFalsa({ ana: { feitos: {}, ultimaAula: null, avaliadas: { x: true } } });
  nuvem.segurarLeituras = true;
  const loja = criarLoja({ armazenamento: arm, criarNuvem: async () => nuvem });
  await loja.iniciar();
  assert.equal(loja.foiAvaliada('x'), true);
});

test('avaliar com uso inválido é recusado', async () => {
  const nuvem = nuvemFalsa({ ana: { feitos: {}, ultimaAula: null } });
  const loja = criarLoja({ armazenamento: armazenamentoFalso(), criarNuvem: async () => nuvem });
  await loja.iniciar(); nuvem.logar(ANA); await esperar();
  await assert.rejects(loja.avaliar('a', 'dashboards', { clareza: 'claro', uso: 'talvezsim' }), /resposta-invalida/);
});

test('avaliarTrilha exige sessão e nota inteira de 1 a 5', async () => {
  const loja = criarLoja({ armazenamento: armazenamentoFalso() });
  await loja.iniciar();
  await assert.rejects(loja.avaliarTrilha('dashboards', 4), /sem-sessao/);
  const nuvem = nuvemFalsa({ ana: { feitos: {}, ultimaAula: null } });
  const outra = criarLoja({ armazenamento: armazenamentoFalso(), criarNuvem: async () => nuvem });
  await outra.iniciar(); nuvem.logar(ANA); await esperar();
  for (const ruim of [0, 6, 2.5, '4', null]) await assert.rejects(outra.avaliarTrilha('dashboards', ruim), /nota-invalida/);
  assert.deepEqual(nuvem.notasTrilha, []);
});

test('avaliarTrilha grava só trilha, nota e período, e lembra neste navegador', async () => {
  const arm = armazenamentoFalso();
  const nuvem = nuvemFalsa({ ana: { feitos: {}, ultimaAula: null } });
  const loja = criarLoja({ armazenamento: arm, criarNuvem: async () => nuvem, agora: () => new Date(2026, 9, 4) });
  await loja.iniciar(); nuvem.logar(ANA); await esperar();
  assert.equal(loja.trilhaAvaliada('dashboards'), null);
  await loja.avaliarTrilha('dashboards', 5);
  assert.deepEqual(nuvem.notasTrilha, [{ trilha: 'dashboards', nota: 5, periodo: '2026-10' }]);
  assert.equal(loja.trilhaAvaliada('dashboards'), 5);
  // sobrevive ao logout e a uma nova página (é deste navegador, não da conta)
  await nuvem.sair(); await esperar();
  const nova = criarLoja({ armazenamento: arm });
  await nova.iniciar();
  assert.equal(nova.trilhaAvaliada('dashboards'), 5);
  assert.equal(nova.trilhaAvaliada('adocao'), null);
});

test('falha ao enviar a nota da trilha não a marca como avaliada', async () => {
  const nuvem = nuvemFalsa({ ana: { feitos: {}, ultimaAula: null } });
  nuvem.recusarFeedback = true;
  const loja = criarLoja({ armazenamento: armazenamentoFalso(), criarNuvem: async () => nuvem });
  await loja.iniciar(); nuvem.logar(ANA); await esperar();
  await assert.rejects(loja.avaliarTrilha('dashboards', 3));
  assert.equal(loja.trilhaAvaliada('dashboards'), null);
});

test('criarConta: valida, cria e mostra o nome mesmo com o Firebase avisando antes do nome', async () => {
  const nuvem = nuvemFalsa();
  const loja = criarLoja({ armazenamento: armazenamentoFalso(), criarNuvem: async () => nuvem });
  await loja.iniciar();
  await assert.rejects(loja.criarConta({ nome: ' ', email: 'a@b.br', senha: '123456' }), /nome-vazio/);
  await assert.rejects(loja.criarConta({ nome: 'Ana', email: 'sem-arroba', senha: '123456' }), /email-invalido/);
  await assert.rejects(loja.criarConta({ nome: 'Ana', email: 'a@b.br', senha: '123' }), /senha-curta/);
  await loja.criarConta({ nome: '  Ana Souza ', email: ' ana@exemplo.gov.br ', senha: '123456' });
  await esperar();
  assert.equal(loja.usuario().uid, 'u-ana@exemplo.gov.br');
  assert.equal(loja.usuario().nome, 'Ana Souza');
  await assert.rejects(loja.criarConta({ nome: 'Ana', email: 'ana@exemplo.gov.br', senha: '123456' }), (e) => e.code === 'auth/email-already-in-use');
});

test('entrarComEmail e redefinirSenha passam o e-mail limpo para a nuvem; sem nuvem, recusam', async () => {
  const sem = criarLoja({ armazenamento: armazenamentoFalso() });
  await sem.iniciar();
  await assert.rejects(sem.entrarComEmail('a@b.br', 'x'), /sem-nuvem/);
  await assert.rejects(sem.redefinirSenha('a@b.br'), /sem-nuvem/);
  const nuvem = nuvemFalsa();
  nuvem.contas['ana@b.br'] = 'segredo1';
  const loja = criarLoja({ armazenamento: armazenamentoFalso(), criarNuvem: async () => nuvem });
  await loja.iniciar();
  await assert.rejects(loja.entrarComEmail('ana@b.br', 'errada'), (e) => e.code === 'auth/invalid-credential');
  await loja.entrarComEmail(' ana@b.br ', 'segredo1');
  await esperar();
  assert.equal(loja.usuario().uid, 'u-ana@b.br');
  await loja.redefinirSenha(' ana@b.br ');
  assert.deepEqual(nuvem.chamadasEmail.at(-1), ['redefinir', 'ana@b.br']);
  await assert.rejects(loja.redefinirSenha('sem-arroba'), /email-invalido/);
});
