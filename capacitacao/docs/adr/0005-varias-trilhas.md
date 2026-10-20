# ADR 0005 — Várias trilhas, com progresso por aula

**Status:** aceito
**Data:** 2026-10-01

## Contexto

O site era uma trilha só (Dashboards): o arquivo único da raiz era a fonte, `roadmap.html` o mapa e a home
explicava a trilha inteira. A equipe quer abrir outras trilhas que reaproveitem aulas já escritas, sem
duplicar texto e sem que a pessoa tenha de marcar a mesma aula duas vezes.

## Decisão

- **Uma trilha por arquivo** `trilhas/<slug>.md`, com cabeçalho (título, descrição, categoria `negocial` ou
  `tecnica`) e os níveis e itens
  abaixo dele. É a única fonte editada à mão.
- **JSON por trilha e um catálogo** (`docs/trilhas/<slug>.json`, `docs/trilhas/index.json`), gerados por
  `tools/gen_roadmap.py`, junto com `<slug>.md` e `<slug>.xmind`.
- **Páginas montadas no navegador:** `mapa.html?trilha=<slug>`, `doc.html?trilha=<slug>&path=<doc>` e
  `concluida.html?trilha=<slug>` leem o JSON da trilha; não há mais HTML de mapa gerado. (Atualização,
  ADR 0007: a conclusão virou um modal no mapa e na aula, e o catálogo foi para `trilhas.html`.)
- **Progresso por aula.** O id da aula é o caminho do doc sem `docs/` e sem `.md` (por exemplo,
  `explicacao/hierarquia-visual`) e vale em todas as trilhas. Um doc não se repete dentro de uma trilha.
- **`ultimaAula = { trilha, path }`.** O formato antigo `{ path, item }` é lido como
  `{ trilha: 'dashboards', path }`.
- **Home = catálogo enxuto:** um card por trilha, com o progresso de quem lê. `roadmap.html` só
  redireciona para `mapa.html?trilha=dashboards`.

## Consequências

- O texto institucional sobre Dashboards saiu da home; ele continua na documentação.
- Criar uma trilha é criar um arquivo em `trilhas/` e rodar o gerador.
- O mapa deixa de ter HTML gerado: o gerador não toca mais em `roadmap.html` nem em `index.html`.
- Marcar uma aula vale em todas as trilhas que a usam.
- Mudar a regra de ids apaga progresso já salvo: ela só deve mudar com migração.

## Alternativas consideradas

- **Progresso por trilha:** simples, mas a pessoa marcaria a mesma aula uma vez por trilha.
- **Trilhas independentes (cada uma com seus próprios docs):** duplica conteúdo e o custo de manter.
- **Manter a home atual e acrescentar um seletor de trilha:** a home continuaria falando de uma trilha
  só e cresceria a cada trilha nova.
