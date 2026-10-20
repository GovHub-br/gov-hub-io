# Comparação entre categorias: Bar e Horizontal Bar

> Tipo: **Referência**

## Resumo

Uma das análises mais comuns em qualquer dashboard consiste em comparar grupos diferentes: qual
unidade tem o melhor desempenho? Qual região realizou mais atendimentos? Qual equipe está abaixo da
média?

Uma tabela permite essas comparações, mas exige ler e comparar diversos valores manualmente. Gráficos
de barras transformam números em comparações visuais, permitindo identificar diferenças quase
instantaneamente. Por isso são dos visuais mais eficientes e mais usados em dashboards.

## Bar Chart

Apresenta categorias ao longo do eixo horizontal e seus valores no eixo vertical. O comprimento das
barras permite comparar os resultados rapidamente.

### Quando utilizar

- comparar categorias;
- exibir rankings;
- mostrar diferenças de desempenho;
- destacar maiores e menores resultados.

*Exemplos:* atendimentos por unidade; solicitações por tipo; processos concluídos por setor.

### Exemplo de análise

Em um dashboard com atendimentos por unidade, uma tabela exigiria percorrer todos os valores para
identificar quais unidades se destacam. No gráfico de barras, basta um olhar para perceber quem tem o
melhor e o pior resultado, a diferença entre as unidades e possíveis padrões de distribuição.

O cérebro humano compara comprimentos com muito mais facilidade do que números em uma tabela.

### Principais vantagens

- fácil interpretação;
- comparação rápida entre categorias;
- boa visualização de rankings;
- excelente para apresentações executivas;
- familiar para praticamente todo mundo.

## Horizontal Bar

Segue a mesma lógica, mudando a orientação dos eixos: as categorias são exibidas verticalmente e os
valores horizontalmente.

### Quando utilizar

- existem muitos nomes de categorias;
- os rótulos são longos;
- é preciso apresentar rankings extensos;
- as comparações envolvem muitas linhas.

*Exemplos:* nomes de municípios; unidades administrativas; departamentos; serviços.

### Exemplo de análise

Em um dashboard com o desempenho de 20 unidades, um gráfico vertical deixaria os nomes inclinados ou
sobrepostos. No horizontal, os rótulos permanecem totalmente legíveis — o que melhora
significativamente a leitura.

### Principais vantagens

- melhor uso do espaço para categorias extensas;
- maior legibilidade;
- excelente para rankings;
- facilita comparações entre muitos grupos.

## Bar Chart ou Horizontal Bar?

Ambos têm a mesma finalidade: comparar categorias. A escolha depende da quantidade e do tamanho dos
rótulos.

| Use **Bar Chart** quando | Use **Horizontal Bar** quando |
|---|---|
| existem poucas categorias | existem muitas categorias |
| os nomes são curtos | os nomes são longos |
| há espaço horizontal disponível | o foco é ranking |
| *Ex.:* meses do ano, regiões | *Ex.:* municípios, unidades administrativas |

## Boas práticas

**Ordene as categorias.** Sempre que possível, organize as barras do maior para o menor valor. Isso
facilita a identificação dos destaques e torna a comparação imediata.

**Evite muitas categorias.** Com dezenas de categorias simultâneas o gráfico perde legibilidade.
Considere exibir apenas os Top 10, usar filtros ou agrupar categorias menos relevantes.

**Destaque o que é relevante.** Nem todas as barras precisam ter a mesma importância visual. Destaque
o maior valor, o menor valor, a categoria selecionada ou o resultado fora da meta.

## Erros comuns

| Erro | Por quê |
|---|---|
| Muitas categorias no mesmo gráfico | se é preciso rolar a tela para entender o gráfico, há informação demais |
| Não ordenar os valores | barras em ordem aleatória dificultam a comparação |
| Uso excessivo de cores | uma cor por categoria aumenta o ruído sem adicionar informação; basta uma cor principal |

## Observações

No Superset, **Bar Chart** e **Horizontal Bar** são frequentemente a melhor alternativa para
substituir análises feitas direto em planilhas: transformam listas extensas de números em comparações
visuais simples.

## Veja também

- [Partes de um todo](graficos-partes-de-um-todo.md)
- [Erros mais comuns na escolha do gráfico](../explicacao/erros-comuns-na-escolha-do-grafico.md)
