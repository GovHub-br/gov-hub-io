// Adaptador do Firebase (login Google + Firestore) para a loja de progresso.
// O SDK só é baixado quando há configuração. Sem configuração, ou se o CDN falhar,
// criarNuvem devolve null e o site segue com o progresso só no navegador.
const VERSAO = '12.19.0';
const CDN = `https://www.gstatic.com/firebasejs/${VERSAO}/`;

const normalizar = (dados) => ({
  feitos: (dados && dados.feitos) || {},
  ultimaAula: (dados && dados.ultimaAula) || null,
  avaliadas: (dados && dados.avaliadas) || {},
});

export async function criarNuvem(config) {
  if (!config || !config.apiKey || !config.projectId) return null;
  try {
    const [app, auth, fs] = await Promise.all([
      import(CDN + 'firebase-app.js'),
      import(CDN + 'firebase-auth.js'),
      import(CDN + 'firebase-firestore.js'),
    ]);
    const firebase = app.initializeApp(config);
    const autenticacao = auth.getAuth(firebase);
    autenticacao.languageCode = 'pt-BR';   // e-mails de confirmação e de nova senha em português
    const banco = fs.getFirestore(firebase);
    const documento = (uid) => fs.doc(banco, 'progresso', uid);

    return {
      aoMudarUsuario(cb) {
        auth.onAuthStateChanged(autenticacao, (u) => cb(u ? {
          uid: u.uid,
          nome: u.displayName || u.email || 'Conta Google',
          email: u.email || null,
          foto: u.photoURL || null,
        } : null));
      },
      entrar: () => auth.signInWithPopup(autenticacao, new auth.GoogleAuthProvider()),
      sair: () => auth.signOut(autenticacao),
      entrarComEmail: (email, senha) => auth.signInWithEmailAndPassword(autenticacao, email, senha),
      async criarConta(nome, email, senha) {
        const { user } = await auth.createUserWithEmailAndPassword(autenticacao, email, senha);
        await auth.updateProfile(user, { displayName: nome }).catch(() => {});
        auth.sendEmailVerification(user).catch(() => {});   // confirma o e-mail, sem bloquear nada
        return user.uid;
      },
      redefinirSenha: (email) => auth.sendPasswordResetEmail(autenticacao, email),
      async ler(uid) {
        const snap = await fs.getDoc(documento(uid));
        return snap.exists() ? normalizar(snap.data()) : null;
      },
      gravarTudo: (uid, { feitos, ultimaAula }) => fs.setDoc(documento(uid), {
        feitos, ultimaAula: ultimaAula || null, atualizadoEm: fs.serverTimestamp(),
      }, { merge: true }),   // merge para não apagar `avaliadas`; `feitos: {}` substitui o mapa inteiro (zerar)
      enviarFeedback: (dados) => fs.addDoc(fs.collection(banco, 'feedback'), dados),
      enviarAvaliacaoTrilha: (dados) => fs.addDoc(fs.collection(banco, 'avaliacao_trilha'), dados),
      marcarAvaliada: (uid, id) => fs.setDoc(documento(uid),
        { avaliadas: { [id]: true }, atualizadoEm: fs.serverTimestamp() }, { merge: true }),
      // Um campo por aula (feitos.<id>), numa única escrita: duas aulas marcadas ao mesmo
      // tempo em dispositivos diferentes não se sobrescrevem. setDoc com merge (e não updateDoc)
      // funciona também quando o documento ainda não existe (sessão restaurada, entrada recusada,
      // documento apagado). Os ids (com '/' e '--') são chaves de objeto aninhado, sem parsing
      // de caminho de campo.
      marcar(uid, ids, valor) {
        // Mapa vazio num setDoc com merge SUBSTITUI todo o `feitos` (apagaria o progresso da conta).
        if (!ids.length) return Promise.resolve();
        const feitos = {};
        for (const id of ids) feitos[id] = valor ? true : fs.deleteField();
        return fs.setDoc(documento(uid), { feitos, atualizadoEm: fs.serverTimestamp() }, { merge: true });
      },
      gravarUltimaAula: (uid, ultimaAula) => fs.setDoc(documento(uid),
        { ultimaAula, atualizadoEm: fs.serverTimestamp() }, { merge: true }),
      ouvir: (uid, cb, erro) => fs.onSnapshot(documento(uid),
        (snap) => cb(normalizar(snap.exists() ? snap.data() : null)), erro),
    };
  } catch (e) {
    console.warn('Firebase indisponível; o progresso fica só neste navegador.', e);
    return null;
  }
}
