# Consultar e conferir dados com SQL

> Tipo: **Tutorial**

## Onde escrever e executar SQL

**SQL** é uma linguagem para conversar com bancos de dados. Você escreve um pedido chamado **consulta**, e o PostgreSQL devolve uma tabela de resultado. Um `select` lê dados; ele não altera a tabela de origem.

Com o banco local iniciado, abra um cliente de banco, como o DBeaver. Crie uma conexão PostgreSQL com endereço `localhost`, porta `5432`, banco, usuário e senha definidos no `.env` da aplicação. No arquivo, procure as variáveis `POSTGRES_*`; use seus valores na conexão, sem publicá-los.

Teste a conexão e abra um editor SQL nela. É nessa área que você cola a consulta abaixo e usa a ação de executar. Não cole SQL diretamente no terminal comum: ele espera comandos do sistema, não consultas de banco.

## Como ler o exemplo

O exemplo cria dados temporários dentro da própria consulta: nada será salvo. A coluna `orgao` tem textos entre aspas; `valor` tem números. O ponto representa a parte decimal no SQL, mesmo que a interface exiba vírgula.

| Trecho | O que pede ao banco |
|---|---|
| `select` | Escolha as informações a mostrar |
| `from` | Use este conjunto de dados |
| `count(*)` | Conte as linhas |
| `sum(valor)` | Some os valores |
| `group by orgao` | Faça uma conta separada para cada órgão |
| `order by orgao` | Ordene o resultado pelo órgão |

`as` dá um nome ao resultado de uma conta. O ponto e vírgula encerra a instrução. Execute o exemplo inteiro, do `with` ao ponto e vírgula.

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

Ao experimentar um filtro, faça essa previsão antes de executar. Depois compare a saída com sua previsão para entender qual parte da consulta mudou a resposta.

## Como verificar

Compare `count(*)` com a contagem conhecida da entrada e confira a soma manualmente em uma amostra. `count(coluna)` ignora nulos; `count(*)` conta as linhas.

Em um conjunto sem registros, `sum()` retorna nulo. Só converta esse resultado em zero quando esse for o significado esperado pelo indicador.

## Leia a saída antes de mudar a consulta

O resultado tem duas linhas, uma por órgão, e três colunas: `orgao`, `registros` e `total`. Isso não quer dizer que uma linha desapareceu: o agrupamento reuniu as duas entradas do órgão A.

`where` filtra as linhas antes de somar. `null` significa ausência de valor conhecido; não é sinônimo de zero. Uma despesa registrada como zero e uma despesa sem valor informado exigem interpretações diferentes.

## Veja também

- [Reprocessamento e mudanças na fonte](../guias/engenharia-reprocessamento.md)
- [JOINs e funções de janela sem duplicar totais](../explicacao/engenharia-joins.md)
