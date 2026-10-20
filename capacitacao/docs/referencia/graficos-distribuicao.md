# Distribuição: Histogram e Box Plot

> Tipo: **Referência**

## Resumo

Nem toda análise busca identificar tendências ou comparar categorias. Em muitos cenários, a pergunta
mais importante é entender **como os dados estão distribuídos**:

- os atendimentos estão concentrados em poucos casos ou distribuídos de forma uniforme?
- a maioria dos processos tem duração semelhante?
- existem valores muito acima ou muito abaixo do padrão?

Essas perguntas são difíceis de responder usando apenas tabelas. Os gráficos de distribuição existem
justamente para revelar esse tipo de informação: não apenas o valor dos dados, mas como esses valores
se comportam em conjunto.

## Histogram

Visualiza a distribuição de valores numéricos. Em vez de mostrar cada registro individualmente,
agrupa os valores em intervalos e exibe quantas ocorrências existem em cada faixa.

### Quando utilizar

Para responder perguntas como: onde estão concentrados os dados? Qual é o comportamento mais comum?
Existe concentração em determinados intervalos? Os dados são equilibrados ou dispersos?

*Exemplos:* tempo de atendimento; idade das pessoas usuárias; duração dos processos; quantidade de
acessos por pessoa.

### Exemplo de análise

Em um conjunto com o tempo de atendimento de milhares de solicitações, uma tabela mostraria apenas uma
lista de valores. O histograma permite perceber rapidamente qual é o tempo mais frequente, onde está
concentrada a maior parte dos atendimentos, se existem valores muito acima da média e se o
comportamento é homogêneo ou irregular.

### Principais vantagens

- identifica concentrações;
- evidencia padrões de comportamento;
- facilita a análise de grandes volumes de dados;
- ajuda a detectar anomalias.

### Boas práticas

**Escolha uma quantidade adequada de intervalos.** Poucos intervalos escondem detalhes importantes;
muitos tornam a visualização confusa. A melhor configuração revela padrões sem fragmentar demais.

**Considere o contexto da análise.** Um histograma mostra frequência, não desempenho. Use-o quando o
objetivo for entender a distribuição dos valores, não comparar categorias ou acompanhar tendências.

## Box Plot

Visualização mais avançada, usada para resumir a distribuição dos dados e identificar valores fora do
padrão.

É composto por uma caixa com uma linha no meio e linhas que se estendem para os lados: a caixa
representa onde está a maior parte dos dados, a linha central indica o valor típico e os pontos
isolados representam valores fora do padrão.

Embora seja menos conhecido por quem vem de planilhas, fornece muita informação em pouco espaço.

### O que o Box Plot mostra

- valor mínimo;
- valor máximo;
- mediana;
- faixa onde se concentra a maior parte dos dados;
- valores atípicos (*outliers*).

### Quando utilizar

- identificar valores fora do padrão;
- comparar distribuições;
- avaliar dispersão;
- entender a variabilidade dos dados.

*Exemplos:* tempo de atendimento por unidade; duração dos processos por setor; produtividade por
equipe.

### Exemplo de análise

Suponha que duas unidades apresentem o mesmo tempo médio de atendimento. Observando apenas a média,
parecem ter desempenhos semelhantes. No Box Plot, pode ficar evidente que uma tem resultados
consistentes e a outra apresenta grande variação entre os atendimentos.

Essa informação dificilmente seria percebida em uma tabela ou em um indicador simples.

### Principais vantagens

- evidencia dispersões;
- destaca valores incomuns;
- facilita comparações entre grupos;
- resume grandes volumes de dados.

## Histogram ou Box Plot?

| Use **Histograma** para entender | Use **Box Plot** para entender |
|---|---|
| onde os dados se concentram | variabilidade e dispersão |
| qual comportamento é mais frequente | consistência |
| como os valores estão distribuídos | presença de valores atípicos |
| *Ex.:* faixa de consumo, volume de transações | *Ex.:* comparação entre equipes e unidades |

## Erros comuns

**Usar a média como única referência.** A média nem sempre representa adequadamente uma distribuição:
dois grupos podem ter a mesma média e comportamentos completamente diferentes.

**Ignorar valores atípicos.** *Outliers* podem indicar erros de preenchimento, problemas operacionais,
casos excepcionais ou boas práticas que merecem ser replicadas.

**Usar distribuição para dados categóricos.** Histogramas e Box Plots foram criados para dados
numéricos. Para comparar categorias, use gráficos de barras.

## Veja também

- [Correlação: Scatter Plot](graficos-correlacao.md)
- [Comparação entre categorias](graficos-comparacao-entre-categorias.md)
