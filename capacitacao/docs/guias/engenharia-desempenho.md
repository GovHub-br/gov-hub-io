# Investigar consultas lentas no PostgreSQL

> Tipo: **Guia**

## O que significa uma consulta “cara”?

Para responder a uma consulta, o banco precisa localizar linhas, comparar valores e fazer cálculos. Quanto mais trabalho e leitura de dados, maior pode ser o tempo de resposta. Uma consulta rápida com dez linhas pode ficar lenta com milhões.

O plano de execução permite identificar estratégias de acesso, cardinalidades e operações que concentram o custo da consulta.

Otimizar é diminuir o trabalho necessário sem mudar o resultado. Antes de medir, confirme se o problema está mesmo na consulta: uma tela lenta também pode envolver conexão ou processamento do gráfico.

## Objetivo

Entender o custo de uma consulta antes de criar índices por tentativa.

## Antes de começar

Use uma base local com dados de estudo. Escolha uma consulta de leitura e identifique as colunas de filtro e junção.

## Passos

1. Execute `explain` antes da consulta para ler o plano estimado.
2. Use `explain (analyze, buffers)` para medir a execução real. Esse comando executa a consulta; nesta prática, aplique apenas a um `select`.
3. Observe linhas estimadas e reais, tempo e forma de leitura. Uma varredura sequencial pode ser adequada para tabelas pequenas ou consultas que leem grande parte da tabela.
4. Se houver justificativa, crie um índice local na coluna de filtro ou na combinação usada pela consulta. Repita a medição nas mesmas condições.
5. Compare o resultado completo, não apenas o tempo. A consulta deve continuar retornando os mesmos dados.

## Exemplo: comparar resultado e plano

Considere uma tabela fictícia `formacao.contratos` com uma coluna `orgao`. Este é um modelo de consulta para leitura, não um comando pronto se essa tabela não existir:

```sql
explain (analyze, buffers)
select id, valor
from formacao.contratos
where orgao = 'A';
```

| Observação ilustrativa | Antes do índice | Depois do índice |
|---|---|---|
| Linhas retornadas | 20 | 20 |
| Forma de acesso | Leitura sequencial | Busca por índice, se escolhida pelo banco |
| Tempo medido | Registrar na execução | Registrar nas mesmas condições |

Não há um tempo universal nem garantia de uso do índice. O banco pode preferir a leitura sequencial. Se uma medição ficar mais rápida, mas as linhas retornadas forem diferentes, você mudou a resposta e ainda não demonstrou uma otimização correta.

## Como decidir

Índices aceleram certas leituras, mas ocupam espaço e aumentam o trabalho de gravação. Não crie um índice para cada coluna.

`VACUUM` e estatísticas fazem parte da manutenção do PostgreSQL. Particionamento divide tabelas grandes em partes; esse recurso ainda não é utilizado no projeto.

## Pronto

Registre consulta, volume, planos e tempos antes/depois. Se não houver ganho consistente, não mantenha o índice apenas porque ele foi criado.

## Como começar a leitura do plano

Aplique `explain` à consulta de estudo e compare o plano estimado com as medidas da execução real.

`Seq Scan` indica leitura sequencial; `Index Scan`, uso de índice. “Linhas estimadas” são a previsão do banco; “linhas reais” são a quantidade observada durante a execução. `buffers` mostra informações sobre páginas de dados acessadas.

Identifique as tabelas acessadas, a quantidade de linhas e o tempo total. Registre também se a segunda execução pode ter se beneficiado de dados já em memória: uma única medição mais rápida não prova ganho causado pelo índice.

## Veja também

- [Tipos, chaves e gravação consistente](../referencia/engenharia-tipos-chaves.md)
- [Raw, bronze, silver e gold](../explicacao/engenharia-camadas.md)
