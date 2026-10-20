# Partes de um todo: Pie, Donut e Treemap

> Tipo: **Referência**

## Resumo

Em muitas análises o objetivo não é acompanhar o tempo nem comparar categorias isoladamente, mas
entender **como um total está distribuído entre suas partes**:

- qual serviço representa a maior parcela dos atendimentos?
- qual região concentra mais demanda?
- como o orçamento está distribuído entre os departamentos?

Nesses casos o mais importante não é o valor absoluto, mas a **participação relativa** de cada
categoria no conjunto. Os gráficos de composição respondem a uma pergunta simples: *"quem representa a
maior parte do total?"*

## Pie Chart

Representa cada categoria como uma fatia proporcional ao total. Quanto maior a participação, maior a
fatia.

### Quando utilizar

- mostrar participação percentual;
- apresentar poucas categorias;
- destacar a composição de um total.

*Exemplos:* participação das regiões nos atendimentos; distribuição de despesas.

### Principais vantagens

- fácil compreensão;
- familiar para a maioria das pessoas;
- boa visualização de percentuais;
- comunicação rápida para públicos executivos.

### Limitações

Quando existem muitas categorias, a comparação se torna difícil e pequenas diferenças entre fatias nem
sempre são percebidas.

> **Boa prática:** use até 5 ou 6 categorias. Não use 15 ou 20 fatias na mesma pizza — quando há muitas
> categorias, outros gráficos comunicam melhor.

## Donut Chart

Funciona de forma muito semelhante ao Pie Chart. A diferença é a abertura central, que deixa espaço
para exibir informação complementar: total geral, percentual principal ou indicador agregado.

### Quando utilizar

- mostrar participação percentual;
- destacar o valor total da análise;
- melhorar a organização visual do dashboard.

*Exemplos:* participação por canal de atendimento; composição das receitas.

### Exemplo de análise

Em um dashboard de atendimento, o centro do donut exibe **5.280 atendimentos** e, ao redor, a
distribuição por região. A pessoa visualiza simultaneamente o total e a participação de cada grupo.

### Principais vantagens

- mantém os benefícios do Pie Chart;
- usa melhor o espaço visual;
- permite exibir métricas centrais;
- integra-se melhor a dashboards modernos.

## Treemap

Representa categorias por meio de retângulos proporcionais ao tamanho de seus valores. Quanto maior a
participação, maior o espaço ocupado.

Diferente da pizza, o Treemap usa melhor a área disponível e permite exibir mais categorias sem
comprometer tanto a legibilidade.

### Quando utilizar

- existem muitas categorias;
- o objetivo é visualizar proporções;
- é necessário aproveitar melhor o espaço da tela.

*Exemplos:* volume de atendimentos por unidade; distribuição de despesas; receitas por categoria.

### Exemplo de análise

Em uma organização com dezenas de unidades, a quantidade de fatias tornaria a pizza ilegível. No
Treemap, cada unidade recebe um retângulo proporcional ao seu resultado, permitindo identificar
rapidamente quem tem maior e menor participação.

### Principais vantagens

- excelente aproveitamento de espaço;
- suporta mais categorias;
- facilita a identificação dos maiores grupos;
- funciona bem em dashboards com muitos dados.

## Pie, Donut ou Treemap?

| Use **Pie Chart** quando | Use **Donut Chart** quando | Use **Treemap** quando |
|---|---|---|
| existem poucas categorias | deseja apresentar o total no centro | existem muitas categorias |
| o público está acostumado com o formato | a análise tem poucas categorias | o espaço da tela é limitado |
| a mensagem é simples | o dashboard tem foco executivo | a prioridade é identificar os maiores participantes |
| *Ex.:* participação por região | *Ex.:* distribuição de demandas | *Ex.:* municípios, unidades, departamentos |

## Erros comuns

**Pizza com muitas categorias.** Se a pizza parece um mosaico de cores, ela não é a melhor escolha.

**Comparar valores muito próximos.** Pizza e donut não são ideais para diferenças pequenas; quando a
precisão importa, barras funcionam melhor.

**Excesso de cores.** As cores devem ajudar a compreensão, não competir pela atenção.

## Observações

O objetivo não é exibir todas as partes possíveis, mas permitir compreender rapidamente quais grupos
têm maior impacto no resultado final.

## Veja também

- [Comparação entre categorias](graficos-comparacao-entre-categorias.md)
