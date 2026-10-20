// A loja de progresso que as páginas usam: uma por página, ligada ao localStorage e ao Firebase.
import { criarLoja } from './progresso-loja.js';
import { criarNuvem } from './progresso-nuvem.js';
import { firebaseConfig } from './firebase-config.js';

// localStorage pode lançar exceção (navegação privada, cota cheia): o site segue sem salvar.
const armazenamento = {
  get(chave) { try { return localStorage.getItem(chave); } catch { return null; } },
  set(chave, valor) { try { localStorage.setItem(chave, valor); } catch { /* sem armazenamento */ } },
  remove(chave) { try { localStorage.removeItem(chave); } catch { /* sem armazenamento */ } },
};

export const progresso = criarLoja({ armazenamento, criarNuvem: () => criarNuvem(firebaseConfig) });

// outra aba mudou o progresso anônimo
window.addEventListener('storage', (ev) => progresso.recarregar(ev.key));
// voltar de outra página pode restaurar esta do cache do navegador, sem rodar os scripts
window.addEventListener('pageshow', (ev) => { if (ev.persisted) progresso.recarregar(null); });

progresso.iniciar();
