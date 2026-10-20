---
slug: dashboards
titulo: Dashboards no Gov Hub
descricao: Do "por que um dashboard" à escolha do gráfico certo, com Apache Superset e Power BI.
categoria: negocial
chamada: Um dashboard ruim some na rotina de quem devia usá-lo. Um dashboard bom muda decisão. Aprenda a construir o seu: dos fundamentos e do design à escolha do gráfico certo, com Apache Superset e Power BI.
etapas: Por quê=Fundamentos conceituais | O quê=Princípios mínimos de design | Como=Gráficos | Prática=Mão na massa
etapas_subtitulo: Quatro etapas em sequência: do "por quê" à prática
etapas_nota: **Mão na massa** chega em breve: vídeos mostrando como aplicar tudo isso no Superset e no Power BI.
---
# Trilha de aprendizagem: Dashboards no Gov Hub

> **Fonte única da trilha.** Edite **apenas este arquivo** e rode `python3 tools/gen_roadmap.py`. Ele regenera `docs/trilhas/dashboards.json` (lido pelo mapa, pelo leitor e pelo catálogo), `docs/trilhas/dashboards.md` (versão em texto) e `docs/trilhas/dashboards.xmind` (mapa mental). Um mesmo documento não pode aparecer duas vezes nesta trilha.
>
> **Formato do item:** `` - [tipo] **Título** — papel — `caminho/para/doc.md` ``
> &nbsp;&nbsp;• **tipo**: `tutorial` · `how-to` · `reference` · `explanation` · `challenge` · `research`
> &nbsp;&nbsp;• **papel**: `core` · `support` · `capstone` · `optional` · `advanced`
>
> **Cadência:** faça os itens **core** de cada nível, de cima para baixo; **support/optional/advanced**
> ficam para quando forem necessários. Para reordenar, mova linhas; para incluir, copie uma linha.
>
> A trilha segue os módulos do documento de conteúdo da capacitação: **fundamentos conceituais**,
> **princípios mínimos de design** (arquitetura da informação e hierarquia visual) e **gráficos**. O
> nível de **mão na massa**, em vídeo, está anunciado com `Status: em-breve` e ganha aulas quando os
> vídeos existirem.


## Nível 1 · Fundamentos conceituais
Etapa: Por quê · Ícone: light-bulb
O vocabulário e o raciocínio crítico antes de tocar na ferramenta: o que um dashboard resolve, o que o
diferencia de um relatório ou de um painel operacional, e quais perguntas ele precisa responder.

- [explanation] **Por que fazer um dashboard?** — core — `docs/explicacao/por-que-fazer-um-dashboard.md`
- [explanation] **O que faz um dashboard ruim** — core — `docs/explicacao/o-que-faz-um-dashboard-ruim.md`
- [explanation] **Percepção visual e carga cognitiva** — core — `docs/explicacao/percepcao-visual-e-carga-cognitiva.md`
- [explanation] **Dashboard, relatório analítico e painel operacional** — core — `docs/explicacao/dashboard-relatorio-painel-operacional.md`
- [reference] **Perguntas que um dashboard deve responder** — support — `docs/referencia/perguntas-que-um-dashboard-deve-responder.md`
- [reference] **Glossário** — support — `docs/referencia/glossario.md`

## Nível 2 · Princípios mínimos de design
Etapa: O quê · Ícone: rectangle-group
Como organizar o conteúdo para que quem lê encontre a resposta sem esforço: fluxo de leitura, contexto,
navegação do geral para o detalhe, filtros e o que deve se destacar primeiro.

- [explanation] **Arquitetura da informação — visão geral** — core — `docs/explicacao/arquitetura-da-informacao.md`
- [explanation] **Fluxo de leitura: padrões F e Z** — core — `docs/explicacao/fluxo-de-leitura-f-e-z.md`
- [explanation] **Indicação de contexto** — core — `docs/explicacao/indicacao-de-contexto.md`
- [explanation] **Estrutura de navegação: overview, zoom e detalhe** — core — `docs/explicacao/estrutura-de-navegacao.md`
- [explanation] **Organização de páginas e abas** — support — `docs/explicacao/organizacao-de-paginas-e-abas.md`
- [explanation] **Filtros e segmentação** — core — `docs/explicacao/filtros-e-segmentacao.md`
- [explanation] **Hierarquia visual** — core — `docs/explicacao/hierarquia-visual.md`
- [explanation] **KPIs e Big Numbers** — core — `docs/explicacao/kpis-e-big-numbers.md`

## Nível 3 · Gráficos
Etapa: Como · Ícone: chart-pie
O catálogo de consulta: qual visual responde qual pergunta, no Superset e no Power BI. Comece pelo
raciocínio (as três primeiras aulas) e volte às referências sempre que estiver construindo.

- [explanation] **Qual é o gráfico certo para o meu dado?** — core — `docs/explicacao/qual-e-o-grafico-certo.md`
- [explanation] **Erros mais comuns na escolha do gráfico** — core — `docs/explicacao/erros-comuns-na-escolha-do-grafico.md`
- [reference] **Guia rápido: pergunta → gráfico** — core — `docs/referencia/guia-rapido-pergunta-para-grafico.md`
- [reference] **Tabelas: Table e Pivot Table / Matrix** — core — `docs/referencia/graficos-tabelas.md`
- [reference] **Séries temporais: Line e Area Chart** — core — `docs/referencia/graficos-series-temporais.md`
- [reference] **Comparação entre categorias: Bar e Horizontal Bar** — core — `docs/referencia/graficos-comparacao-entre-categorias.md`
- [reference] **Distribuição: Histogram e Box Plot** — core — `docs/referencia/graficos-distribuicao.md`
- [reference] **Partes de um todo: Pie, Donut e Treemap** — core — `docs/referencia/graficos-partes-de-um-todo.md`
- [reference] **Correlação: Scatter Plot** — core — `docs/referencia/graficos-correlacao.md`
- [reference] **Geoespacial: Maps e Bubble Maps** — core — `docs/referencia/graficos-geoespaciais.md`
- [reference] **Visuais avançados do Power BI: Funnel, Decomposition Tree e Waterfall** — support — `docs/referencia/graficos-avancados-power-bi.md`
- [reference] **Azure Maps (Power BI)** — support — `docs/referencia/azure-maps.md`
- [research] **Mapas: Superset vs. Power BI** — support — `docs/pesquisa/mapas-superset-vs-power-bi.md`

## Nível 4 · Mão na massa no Superset e no Power BI
Etapa: Prática · Ícone: play-circle
Status: em-breve
Vídeos mostrando, passo a passo, como aplicar os fundamentos, o design e a escolha do gráfico na
construção de um dashboard no Apache Superset e no Power BI.
