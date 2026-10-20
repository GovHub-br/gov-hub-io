# Guia rápido: pergunta → gráfico

> Tipo: **Referência**

## Resumo

Tabela de consulta para escolher o visual durante a construção do painel. Comece pela pergunta que a
pessoa precisa responder, não pelo gráfico disponível.

## Por tipo de pergunta

| Pergunta | Família | Superset | Power BI |
|---|---|---|---|
| Como evoluiu ao longo do tempo? | Série temporal | Line Chart, Area Chart | Line, Area, Combo |
| Quem tem o melhor/pior resultado? | Comparação | Bar Chart, Horizontal Bar | Column, Bar, Combo |
| Como os valores se distribuem? | Distribuição | Histogram, Box Plot | Histogram, Box Plot (visual customizado) |
| Quem representa a maior parte do total? | Composição | Pie, Donut, Treemap | Pie, Donut, Treemap |
| Existe relação entre duas métricas? | Correlação | Scatter Plot | Scatter Plot |
| Onde isso está acontecendo? | Geoespacial | Maps, Bubble Maps | Map, Filled Map, Azure Maps |
| Qual é o valor exato deste registro? | Detalhamento | Table, Pivot Table | Table, Matrix |
| Como estamos agora? | Indicador | Big Number | Card, KPI, Gauge |
| Onde o processo perde volume? | Fluxo por etapas | — | Funnel |
| O que explica este resultado? | Decomposição | — | Decomposition Tree |
| O que somou e o que subtraiu? | Variação | — | Waterfall |

## Regra dos cinco segundos

Antes de escolher, responda: **"O que eu quero que a pessoa entenda em menos de cinco segundos?"**

- Evolução → Linha
- Comparação → Barra
- Participação → Pizza / Donut / Treemap
- Distribuição → Histograma / Box Plot
- Relação → Scatter Plot
- Localização → Mapa
- Detalhamento → Cards ou Tabelas

## Observações

- Visuais marcados com — não existem nativamente na outra plataforma; ver
  [Visuais avançados do Power BI](graficos-avancados-power-bi.md).
- A disponibilidade de visuais customizados no Power BI depende da política do ambiente; confirme
  antes de desenhar o wireframe em cima de um visual que talvez não esteja liberado.

## Veja também

- [Qual é o gráfico certo para o meu dado?](../explicacao/qual-e-o-grafico-certo.md)
- [Erros mais comuns na escolha do gráfico](../explicacao/erros-comuns-na-escolha-do-grafico.md)
