# ADR 0007 — Páginas no desenho do protótipo da designer (hub da trilha)

Data: 2026-10-04 · Estado: aceito

## Contexto

A designer do projeto entregou um protótipo navegável (`protótipo-hub-trilha-dashboards_2_6.html`) com
página inicial, lista de trilhas, mapa da trilha ("hub"), página de conteúdo, modal de conclusão com
nota e quiz de revisão. O site seguia o desenho anterior (mapa em linha do tempo, leitor com barra
lateral de todos os níveis, página `concluida.html`).

## Decisão

- **Páginas:** `index.html` vira a página inicial (apresentação e login); o catálogo vai para
  `trilhas.html`; `mapa.html` mostra "A lógica da trilha", o progresso, os níveis à esquerda e **um
  nível por vez** (`#nivel-N`); `doc.html` mostra só as aulas do nível, a aula e a avaliação;
  `quiz.html?trilha=<slug>` é o quiz de revisão. Um topo comum (`assets/topo.js`) traz busca pelos
  títulos das aulas, Início/Trilhas, "Dúvidas?" (e-mail) e a conta Google.
- **Conclusão = modal**, no mapa e na aula, aberto uma vez por navegador quando a trilha fica completa
  (`concluida.html` só redireciona). O modal pede uma **nota de 1 a 5** (coleção `avaliacao_trilha`,
  só `trilha`, `nota` e `periodo`, como o feedback da ADR 0006) e leva ao quiz.
- **Quiz** em `quiz/<slug>.json` (uma pergunta por aula), liberado com a trilha completa; as respostas
  ficam só no navegador. As 24 perguntas de Dashboards vêm do protótipo.
- **Dados da trilha para o mapa** no cabeçalho de `trilhas/<slug>.md` (`chamada`, `status`, `etapas`…)
  e na linha `Etapa: … · Ícone: …` de cada nível, validados pelo gerador. Trilha `em-breve` aparece
  desabilitada no catálogo.
- **Três marcações de papel** no mapa (essencial, apoio, marco), mapeando os cinco papéis da trilha.
- **Diferenças conscientes do protótipo:** ícones dos níveis da biblioteca do Gov Hub (variante
  `-sober`), e não ícones de linha; contornos de controle em `--text-muted` (contraste 3:1, WCAG 1.4.11);
  o diagrama PNG "A lógica da trilha" saiu, substituído pelo quadro em HTML do protótipo.

## Consequências

- Links antigos (`concluida.html`, `roadmap.html`, `doc.html?path=`) continuam funcionando.
- "Limpar progresso" no mapa desmarca só as aulas daquela trilha (uma aula compartilhada fica desmarcada
  nas duas).
- A regra `avaliacao_trilha` precisa estar publicada no Firestore antes do deploy.
