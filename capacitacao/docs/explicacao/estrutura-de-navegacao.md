# Estrutura de navegação: overview, zoom e detalhe

> Tipo: **Explicação**

## Contexto

Uma das abordagens mais usadas em dashboards modernos segue a lógica **overview first → zoom and
filter → details on demand**. Ela resolve a tensão entre dois desejos legítimos e opostos: ver tudo e
ver pouco.

![Fluxo da navegação de um painel: quem abre o painel começa no 1. Overview (indicadores principais, tendências e consolidado), segue para o 2. Zoom e filtro (região, período, unidade, equipe) e depois para o 3. Detalhe sob demanda (drill-down, tabela, exportação). Uma seta tracejada sai do Overview para o caso do telão de monitoramento, onde ninguém clica e o painel vive só neste nível.](../../assets/diagramas/estrutura-de-navegacao.png)

## 1. Overview first

Primeiro, apresentar uma visão geral. A pessoa precisa entender rapidamente o cenário atual:
indicadores principais, tendências gerais, resultados consolidados.

## 2. Zoom and filter

Depois, permitir refinar a análise. Aqui entram filtros, segmentações e recortes por região, período,
unidade ou equipe.

O objetivo é responder perguntas mais específicas **sem perder a visão geral**.

## 3. Details on demand

Somente quando necessário a pessoa deve acessar os detalhes, por meio de drill-down, tabelas
detalhadas, relatórios complementares ou exportação de dados.

O detalhe deve estar disponível, mas **não deve competir visualmente com a informação principal**.

## Trade-offs e alternativas

Essa progressão pressupõe que a pessoa esteja disposta a interagir. Em painéis exibidos em telões de
monitoramento, onde ninguém clica, a etapa de zoom não existe — o painel precisa ser legível em um
único nível.

Também há um custo de descoberta: recursos escondidos atrás de drill-down podem simplesmente nunca ser
encontrados. Sinalize a existência do detalhe (um ícone, um texto "clique para detalhar") em vez de
confiar que alguém vai tentar.

## Veja também

- [Organização de páginas e abas](organizacao-de-paginas-e-abas.md)
- [Arquitetura da informação](arquitetura-da-informacao.md)
