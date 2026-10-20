# Correlação: Scatter Plot

> Tipo: **Referência**

## Resumo

Nem toda análise busca responder *quanto aconteceu*, *quando aconteceu* ou *quem teve o melhor
resultado*. Em muitos casos a pergunta é: existe relação entre duas variáveis?

Enquanto barras comparam categorias e linhas mostram tendências temporais, os gráficos de correlação
ajudam a descobrir comportamentos que não são facilmente percebidos em tabelas. No Superset e no Power
BI, o visual usado é o **Scatter Plot** (gráfico de dispersão).

## O que é correlação

Correlação é uma medida que indica o quanto duas variáveis parecem se movimentar juntas. Isso **não**
significa que uma cause a outra — significa apenas que existe um padrão observável.

Exemplos de relações plausíveis:

- quanto maior o número de atendentes, maior o número de atendimentos realizados;
- quanto maior o tempo de espera, menor o índice de satisfação.

## Quando utilizar

Quando o objetivo é descobrir padrões, tendências de comportamento ou possíveis relações entre
variáveis.

*Exemplos:* quantidade de chamados versus tempo médio de atendimento; número de servidores versus
produtividade; tempo de treinamento versus desempenho.

Nesses cenários, o valor individual de cada registro é menos importante do que o comportamento do
conjunto.

## Como funciona

Cada registro é um ponto no plano cartesiano, com uma variável no eixo X e outra no eixo Y. A posição
dos pontos revela padrões e possíveis relacionamentos.

### Exemplo de análise

- **Eixo X:** quantidade de servidores por unidade
- **Eixo Y:** quantidade de atendimentos realizados

Ao observar o gráfico, pode-se perceber que unidades com mais servidores tendem a realizar mais
atendimentos — uma tendência visual positiva que dificilmente seria percebida em uma tabela.

## Como interpretar

| Padrão | Aparência | Significado |
|---|---|---|
| **Correlação positiva** | pontos sobem da esquerda para a direita | quando uma variável aumenta, a outra também aumenta |
| **Correlação negativa** | pontos descem da esquerda para a direita | quando uma variável aumenta, a outra diminui |
| **Ausência de correlação** | pontos espalhados sem padrão evidente | não há relação visual clara — o que também é um resultado importante, pois evita conclusões incorretas |

## Identificação de outliers

Uma das maiores vantagens do Scatter Plot é a facilidade para encontrar comportamentos fora do padrão:
uma unidade com produtividade muito acima das demais, uma região com volume extremamente baixo, um
processo com duração muito superior ao padrão.

Esses casos merecem atenção especial, pois podem indicar problemas operacionais, erros de cadastro,
casos excepcionais ou boas práticas que podem ser replicadas.

## Uso de tamanho e cor

O Scatter Plot pode incluir dimensões adicionais através do tamanho e da cor dos pontos. Por exemplo:

- **Eixo X:** quantidade de usuários
- **Eixo Y:** receita
- **Cor:** região
- **Tamanho:** número de atendimentos

Uma única visualização apresenta várias perspectivas do mesmo conjunto de dados. Não exagere: o
excesso de informação dificulta a interpretação.

## Boas práticas

**Escolha variáveis que façam sentido juntas.** Antes de criar o gráfico, pergunte: *"existe uma
hipótese ou pergunta que desejo investigar?"*

**Use escalas adequadas.** Diferenças muito grandes entre valores dificultam a leitura; ajustes de
escala tornam os padrões mais visíveis.

**Destaque agrupamentos importantes.** Use cores para identificar regiões, departamentos ou categorias
de serviço.

**Não confunda correlação com causalidade.** Este é um dos erros mais comuns em análise de dados. O
gráfico indica uma relação interessante, mas normalmente será necessária investigação adicional para
compreender o motivo.

## Erros comuns

| Erro | O que fazer |
|---|---|
| Usar Scatter Plot para comparar categorias | para rankings, use gráficos de barras |
| Excesso de pontos sem filtragem | aplique filtros, agregue informações ou divida a análise em grupos |
| Procurar relações onde elas não existem | nem todo conjunto tem correlação; evite conclusões precipitadas |

## Veja também

- [Distribuição: Histogram e Box Plot](graficos-distribuicao.md)
