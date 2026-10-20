# Séries temporais: Line e Area Chart

> Tipo: **Referência**

## Resumo

Grande parte das perguntas feitas a um dashboard envolve tempo: estamos melhorando ou piorando? Houve
crescimento ou queda? Existe sazonalidade? Quando aconteceu uma mudança relevante?

Quando a análise tem dimensão temporal, os gráficos de série temporal costumam ser a melhor escolha.
Eles transformam uma sequência de números em uma história fácil de interpretar.

## Quando utilizar séries temporais

Sempre que o tempo for uma variável importante para a análise.

*Exemplos:* atendimentos por mês; receitas ao longo do ano; acessos por semana; processos concluídos
por trimestre.

Esse tipo de visualização revela rapidamente crescimentos, quedas, oscilações, picos, sazonalidades e
mudanças de comportamento. Uma tabela mostra todos esses números; um gráfico temporal permite
**enxergar** os padrões quase instantaneamente.

## Line Chart

O principal visual para análise temporal. Conecta os pontos ao longo do tempo e facilita a percepção
da trajetória dos dados.

### Quando utilizar

- analisar tendências;
- acompanhar desempenho;
- monitorar indicadores ao longo do tempo;
- comparar diferentes séries temporais.

*Exemplos:* evolução do faturamento; quantidade de atendimentos por mês; solicitações registradas por
período.

### Exemplo de análise

Uma gestora quer acompanhar o número de atendimentos realizados durante o ano. Em uma tabela,
precisaria comparar várias linhas manualmente. No gráfico de linha, identifica rapidamente se houve
crescimento, em quais meses ocorreram quedas, quando surgiram picos de demanda e qual é a tendência
geral.

O foco deixa de ser a leitura dos números e passa a ser a interpretação do comportamento.

### Principais vantagens

- excelente para mostrar tendências;
- facilita comparações ao longo do tempo;
- ocupa pouco espaço;
- permite visualizar múltiplas séries simultaneamente;
- é facilmente compreendido pela maioria das pessoas.

## Area Chart

Funciona de maneira semelhante ao gráfico de linha, mas adiciona preenchimento abaixo da curva. Isso
aumenta a percepção visual de **volume e intensidade** dos valores ao longo do tempo.

### Quando utilizar

- evolução temporal;
- volume acumulado;
- participação relativa entre séries;
- crescimento ao longo do tempo.

*Exemplos:* volume de atendimentos; consumo de recursos; demandas por categoria.

### Exemplo de análise

Em um painel que acompanha solicitações registradas por diferentes áreas, um gráfico de área empilhada
mostra simultaneamente o total de solicitações, a participação de cada área e como essa distribuição
mudou ao longo do tempo.

### Principais vantagens

- evidencia volumes;
- facilita a percepção de proporções;
- mostra tendências temporais;
- funciona bem para categorias empilhadas.

## Line Chart ou Area Chart?

| Use **Line Chart** quando | Use **Area Chart** quando |
|---|---|
| o foco é a tendência | o volume é importante |
| as comparações precisam ser precisas | há interesse na participação das categorias |
| existem muitas séries simultâneas | o comportamento acumulado é relevante |
| é preciso identificar mudanças de direção | há poucas séries simultâneas |
| *Ex.:* receita mensal, tempo médio de atendimento | *Ex.:* consumo por setor, atendimentos acumulados |

## Boas práticas

**Use intervalos de tempo adequados.** Nem sempre mais detalhe significa melhor análise. Dependendo do
contexto, diário pode ser excessivo, semanal mais útil e mensal suficiente.

**Evite excesso de linhas.** Muitas séries em um único gráfico dificultam a leitura. Considere aplicar
filtros, exibir apenas os principais grupos ou criar páginas específicas de detalhamento.

**Destaque eventos importantes.** Alteração de processo, mudança de legislação, campanhas e períodos de
alta demanda ajudam a explicar comportamentos observados no gráfico.

**Forneça contexto.** Combine o gráfico com KPIs, metas, comparação com períodos anteriores e médias
históricas. Ver [Indicação de contexto](../explicacao/indicacao-de-contexto.md).

## Observações

Enquanto tabelas mostram valores individuais, gráficos temporais mostram **comportamento**. Em muitos
casos, uma única visualização temporal comunica em segundos aquilo que exigiria vários minutos de
análise em uma tabela.

## Veja também

- [Comparação entre categorias](graficos-comparacao-entre-categorias.md)
- [Guia rápido: pergunta → gráfico](guia-rapido-pergunta-para-grafico.md)
