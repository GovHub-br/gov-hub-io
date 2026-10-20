# Tabelas: Table e Pivot Table / Matrix

> Tipo: **Referência**

## Resumo

O visual **Table** apresenta os dados em formato tabular tradicional — a representação mais próxima de
uma planilha e, por isso, a mais familiar para quem está começando.

Em um dashboard, o papel da tabela muda: em vez de ser o principal meio de análise, ela passa a ser
usada **para consulta e detalhamento**. Indicadores e gráficos comunicam rapidamente o que está
acontecendo; as tabelas permanecem disponíveis para quem precisa investigar em profundidade.

> A melhor experiência não acontece quando a pessoa visualiza mais linhas de dados. Acontece quando ela
> encontra a resposta antes de precisar percorrer essas linhas.

## Table

### Quando utilizar

| Situação | Exemplo |
|---|---|
| Consultar valores exatos | relação de atendimentos realizados |
| Visualizar registros específicos | lista de processos |
| Realizar conferências | validação de lançamentos |
| Exibir listas detalhadas | ranking detalhado de unidades |
| Apoiar auditorias | relação de itens fiscalizados |

### Limitações

| Limitação | Efeito |
|---|---|
| **Exigem maior esforço visual** | para identificar tendências é preciso ler, comparar e interpretar manualmente; em um gráfico isso é quase instantâneo |
| **Dificultam comparações rápidas** | comparar dezenas de linhas e colunas exige atenção constante |
| **Ocupam muito espaço** | grandes volumes exigem rolagem, múltiplas páginas, filtros adicionais e procura manual |
| **Escondem padrões** | oscilações, concentrações, picos e tendências ficam ocultos em grandes conjuntos de números |

### Exemplo de uso adequado

Em um dashboard de atendimento, a pessoa visualiza o total de atendimentos, a evolução mensal e a
distribuição por região. Caso precise investigar um resultado específico, uma tabela ao final da
página apresenta os registros detalhados.

Nesse cenário, a tabela **complementa** a análise em vez de ser a própria análise.

## Pivot Table (Superset) / Matrix (Power BI)

A **Pivot Table** permite resumir grandes volumes de dados e organizá-los em linhas e colunas de forma
agregada. Funciona como uma evolução da tabela tradicional, permitindo comparar diferentes dimensões
simultaneamente.

A **Matrix** do Power BI tem a mesma função, com mais recursos de hierarquia e expansão.

### Quando utilizar

- comparações entre categorias;
- cruzamento de informações;
- análises multidimensionais;
- resumos gerenciais.

*Exemplos:* atendimentos por região e mês; demandas por unidade e tipo de serviço.

### Exemplo canônico

Em vez de apresentar milhares de registros individuais, a Pivot Table resume:

| Região | Janeiro | Fevereiro | Março |
|---|---|---|---|
| Norte | 1.250 | 1.340 | 1.410 |
| Sul | 980 | 1.020 | 1.080 |
| Centro | 1.100 | 1.180 | 1.250 |

Esse formato permite perceber padrões com muito mais facilidade do que uma tabela detalhada com todas
as transações.

## Observações

- Uma tabela ao final da página, abaixo dos visuais, costuma ser a posição certa: disponível sem
  competir pela atenção.
- Se a tabela é o primeiro elemento do painel, provavelmente o painel deveria ser um
  [relatório analítico](../explicacao/dashboard-relatorio-painel-operacional.md).

## Veja também

- [Guia rápido: pergunta → gráfico](guia-rapido-pergunta-para-grafico.md)
- [Comparação entre categorias](graficos-comparacao-entre-categorias.md)
