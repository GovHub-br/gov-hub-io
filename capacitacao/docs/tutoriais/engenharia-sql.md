# Consultar e conferir dados com SQL

> Tipo: **Tutorial**

## Preparação da consulta

Use uma conexão ao PostgreSQL local da aplicação, com banco e credenciais definidos nas variáveis `POSTGRES_*` do `.env`. A prática usa dados sintéticos em uma CTE, sem persistir tabelas.

## O que você vai aprender

Consultar uma tabela e conferir um total antes de criar indicadores. Use uma conexão local ao PostgreSQL e comece com dados sintéticos:

```sql
with empenhos (orgao, valor) as (
    values ('A', 100.00::numeric),
           ('A', 50.00::numeric),
           ('B', 80.00::numeric)
)
select orgao, count(*) as registros, sum(valor) as total
from empenhos
group by orgao
order by orgao;
```

## Passos

1. Execute a consulta: o órgão A deve ter 2 registros e total 150; B deve ter 1 registro e total 80.
2. Observe a **CTE**: o bloco `with` dá um nome a um resultado intermediário, facilitando a leitura.
3. Acrescente `where valor >= 80` antes do `group by`. Agora A terá total 100 e B continuará com 80.
4. Encontre uma tabela real de estudo em um schema como `siafi` ou `compras_gov`. Confira os nomes das colunas antes de adaptar a consulta.

## Exemplo: enxergue o resultado da consulta

A consulta com as três linhas de estudo deve produzir:

| orgao | registros | total |
|---|---|---|
| A | 2 | 150.00 |
| B | 1 | 80.00 |

Com `where valor >= 80`, o registro de valor 50 é retirado **antes** da soma:

| orgao | registros | total |
|---|---|---|
| A | 1 | 100.00 |
| B | 1 | 80.00 |

Agora compare `count(*)` e `count(valor)`: em duas linhas com valores 100 e `null`, o primeiro retorna 2 e o segundo, 1. A soma considera o valor informado e retorna 100; isso não permite concluir que a linha sem informação valia zero.

Confira a redução de linhas e o total após o filtro antes de adaptar a consulta ao domínio real.

## Como verificar

Compare `count(*)` com a contagem conhecida da entrada e confira a soma manualmente em uma amostra. `count(coluna)` ignora nulos; `count(*)` conta as linhas.

Em um conjunto sem registros, `sum()` retorna nulo. Só converta esse resultado em zero quando esse for o significado esperado pelo indicador.

## Leia a saída antes de mudar a consulta

O resultado tem duas linhas, uma por órgão, e três colunas: `orgao`, `registros` e `total`. Isso não quer dizer que uma linha desapareceu: o agrupamento reuniu as duas entradas do órgão A.

`where` filtra as linhas antes de somar. `null` significa ausência de valor conhecido; não é sinônimo de zero. Uma despesa registrada como zero e uma despesa sem valor informado exigem interpretações diferentes.

## Veja também

- [Reprocessamento e mudanças na fonte](../guias/engenharia-reprocessamento.md)
- [JOINs e funções de janela sem duplicar totais](../explicacao/engenharia-joins.md)
