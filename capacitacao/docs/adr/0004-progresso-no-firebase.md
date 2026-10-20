# ADR 0004 — Progresso da trilha no Firebase, com login Google opcional

**Status:** aceito
**Data:** 2026-10-01

## Contexto

O progresso ("feito") vivia só no `localStorage`: trocar de computador, de navegador ou limpar os
dados do site zerava a trilha. Quem faz a capacitação são servidoras e servidores, cada um na própria
máquina com login próprio, que querem retomar de onde pararam em outro lugar. O site é estático
(GitHub Pages, sem backend próprio).

## Decisão

- **Firebase Authentication com Google** para identificar a pessoa e **Cloud Firestore** para guardar o
  progresso, no documento `progresso/{uid}` (`feitos`, `ultimaAula`, `atualizadoEm`).
- **Login opcional.** Sem login, o progresso continua no navegador, com a mesma chave de antes.
- **Ao entrar,** o progresso anônimo daquele navegador é somado à conta uma única vez e apagado do
  navegador.
- **Com sessão,** o Firestore é a fonte da verdade. O navegador guarda só um cache da conta, apagado ao
  sair. O progresso de uma conta nunca fica no navegador depois do logout nem é somado a outra conta.
- **Escrita por campo** (`feitos.<id>`), para que marcações simultâneas em dispositivos diferentes não
  se sobrescrevam. As escritas são `setDoc` com `merge`, e não `updateDoc`: funcionam mesmo antes de o
  documento existir. A sincronização é em tempo real (`onSnapshot`).
- **SDK por CDN** (`gstatic.com`, versão fixada em `assets/progresso-nuvem.js`), carregado só quando
  `assets/firebase-config.js` está preenchido.
- **Regras em `firestore.rules`:** cada `uid` só lê e grava o próprio documento, e o documento só pode
  ter as chaves `feitos`, `ultimaAula` e `atualizadoEm`. O conteúdo dessas chaves não é validado.

## Consequências

- **O site não depende do Firebase para funcionar.** Sem configuração, com o CDN bloqueado ou com o
  serviço fora do ar, o botão de login some e o progresso fica no navegador.
- **A configuração do Firebase é pública.** Isso é esperado; a proteção está nas regras e nos domínios
  autorizados do Authentication. Publicar regras mais frouxas expõe o progresso de todo mundo.
- **Nova dependência externa** (Google), com custo zero no volume da capacitação (plano Spark).
- **Os ids das aulas viram chave de banco.** Mudar a regra de ids em `tools/gen_roadmap.py` apaga o
  progresso salvo — local e na nuvem.

## Alternativas consideradas

**Login obrigatório:** daria controle de quem acessa, mas fecharia um material público e faria o site
depender do Firebase para abrir.

**E-mail e senha:** atende quem não tem conta Google, mas traz cadastro, recuperação de senha e mais
superfície de suporte.

**Backend próprio:** fugiria do modelo estático no GitHub Pages, sem ganho para o caso de uso.

## Atualização (2026-10-05): e-mail e senha também

O login passou a aceitar **e-mail e senha** além do Google, para quem não usa conta Google. Qualquer
e-mail pode criar conta; o Firebase manda o link de confirmação, mas a conta funciona sem confirmar.
"Esqueci minha senha" usa o e-mail de redefinição do Firebase (que também cria uma senha para uma
conta que entrava só com o Google, já que o Firebase mantém uma conta por e-mail). O botão "Entrar"
abre um modal com as duas formas (`assets/login.js`). O custo de suporte citado em "Alternativas"
foi aceito.
