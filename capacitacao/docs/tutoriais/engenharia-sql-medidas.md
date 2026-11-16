# Prática: SQL para contar e somar sem enganos

> Tipo: **Tutorial**

## Depois de decidir quem entra, decidir o que contar

Na [primeira parte da prática](engenharia-sql.md), você criou a base de estudo e viu como um JOIN e um filtro decidem quais contratos entram no resultado. Agora a pergunta da gestão chega aos números: quantos empenhos cada contrato teve, quanto foi pago, qual percentual do contrato já foi pago e quanto foi contratado no total.

São contas simples, e é por isso que os erros passam. Um `count` que conta uma linha que não existe, um nulo transformado em zero, uma divisão que descarta os decimais e uma junção que soma o mesmo valor duas vezes produzem números plausíveis, que ninguém questiona no painel.

![Três versões da mesma pergunta, quantos empenhos de 2026 cada contrato ativo teve. Com o filtro de data no where, o contrato 103 some do resultado. Com o filtro no on e count(*), o 103 volta, mas aparece com 1 empenho, embora não tenha nenhum. Com o filtro no on e count(e.ne), o 103 aparece com 0, a resposta certa. Os contratos 101 e 102 têm 2 e 1 empenhos nas três versões.](../../assets/diagramas/engenharia-sql-contagem.png)

## O que você vai aprender

- Escolher entre `on` e `where` para uma condição sobre a tabela da direita.
- Distinguir `count(*)` de `count(coluna)`.
- Tratar nulo como nulo, e não como zero.
- Calcular uma taxa sem divisão inteira e sem divisão por zero.
- Detectar uma junção que multiplica linhas antes de somar uma medida.

## Antes de começar

- O schema `estudo_modelagem`, criado na primeira parte. Se você alterou alguma tabela, execute de novo [base-de-estudo.sql](../../exemplos/engenharia-modelagem/base-de-estudo.sql).

## Passo 1: escolher entre `on` e `where`

Pergunta: quantos empenhos de 2026 cada contrato ativo teve? Primeiro, com o filtro de data no `where`:

```sql
select c.id, count(*) as empenhos_2026
from estudo_modelagem.raw_contratos as c
left join estudo_modelagem.raw_empenhos as e on e.contrato_id = c.id
where c.situacao = 'Ativo'
  and e.emissao >= '2026-01-01'
group by c.id
order by c.id;
```

```text
 id  | empenhos_2026
-----+---------------
 101 |             2
 102 |             1
```

O 103 sumiu pelo mesmo motivo do último passo da primeira parte: sem empenho, `e.emissao` é nulo e a comparação de data não é verdadeira. A resposta certa para ele seria **zero**, não a ausência da linha.

A condição sobre a tabela da direita deve ir para o `on`. Lá, ela decide **quais empenhos se ligam** a cada contrato, sem decidir quais contratos aparecem:

```sql
select c.id, count(*) as empenhos_2026
from estudo_modelagem.raw_contratos as c
left join estudo_modelagem.raw_empenhos as e
       on e.contrato_id = c.id
      and e.emissao >= '2026-01-01'
where c.situacao = 'Ativo'
group by c.id
order by c.id;
```

```text
 id  | empenhos_2026
-----+---------------
 101 |             2
 102 |             1
 103 |             1
```

O 103 voltou, mas com **1** empenho, quando não tem nenhum.

## Passo 2: saber o que o `count` conta

`count(*)` conta **linhas**, e o `left join` produziu uma linha para o 103, com o lado do empenho todo nulo. Para contar empenhos, conte uma coluna do empenho: `count(coluna)` ignora os nulos.

```sql
select c.id, count(e.ne) as empenhos_2026
from estudo_modelagem.raw_contratos as c
left join estudo_modelagem.raw_empenhos as e
       on e.contrato_id = c.id
      and e.emissao >= '2026-01-01'
where c.situacao = 'Ativo'
group by c.id
order by c.id;
```

```text
 id  | empenhos_2026
-----+---------------
 101 |             2
 102 |             1
 103 |             0
```

Agora sim. Resumo dos dois passos:

| Onde fica a condição | O que ela decide |
|---|---|
| `where`, sobre a tabela da esquerda | Quais registros entram no resultado (a população) |
| `on`, sobre a tabela da direita | Quais registros da direita se ligam a cada registro da esquerda |
| `where`, sobre a tabela da direita | Na prática, transforma o `left join` em `inner join` |

| Função | O que conta |
|---|---|
| `count(*)` | Linhas do resultado, inclusive as que o `left join` completou com nulo |
| `count(coluna)` | Linhas em que a coluna não é nula |
| `count(distinct coluna)` | Valores diferentes e não nulos da coluna |

## Passo 3: tratar nulo como nulo, e não como zero

Some o valor pago de cada contrato ativo:

```sql
with empenhos as (
    select contrato_id,
           cast(replace(replace(despesas_pagas, '.', ''), ',', '.') as numeric(15, 2)) as despesas_pagas
    from estudo_modelagem.raw_empenhos
)
select c.id,
       sum(e.despesas_pagas) as pago,
       coalesce(sum(e.despesas_pagas), 0) as pago_com_coalesce
from estudo_modelagem.raw_contratos as c
left join empenhos as e on e.contrato_id = c.id
where c.situacao = 'Ativo'
group by c.id
order by c.id;
```

```text
 id  |   pago   | pago_com_coalesce
-----+----------+-------------------
 101 | 50000.00 |          50000.00
 102 | 45500.50 |          45500.50
 103 |          |                 0
```

A soma de nenhuma linha é nula. Para o 103, o nulo diz uma coisa verdadeira: **não há empenho associado**. O `coalesce(..., 0)` troca isso por "foi pago zero", o que é outra afirmação. Pode ser que o contrato tenha pagamentos que a associação com empenhos não encontrou.

Use `coalesce` quando a troca for uma decisão escrita (por exemplo, "contrato sem empenho conta como zero pago neste painel") ou para exibir um texto como "sem empenho associado". Não use para fazer o nulo desaparecer.

## Passo 4: calcular uma taxa sem armadilhas

Qual percentual do valor global já foi pago? Duas armadilhas estão escondidas numa divisão:

```sql
select 1 / 3 as divisao_inteira, 1::numeric / 3 as divisao_numerica;
```

```text
 divisao_inteira |    divisao_numerica
-----------------+------------------------
               0 | 0.33333333333333333333
```

Entre inteiros, o PostgreSQL faz divisão inteira e descarta a parte decimal. E `select 10 / 0;` interrompe a consulta com `ERROR:  division by zero`. A forma segura combina um `numeric` com `nullif`, que transforma o zero do denominador em nulo:

```sql
with contratos as (
    select id, cast(replace(replace(valor_global, '.', ''), ',', '.') as numeric(15, 2)) as valor_global
    from estudo_modelagem.raw_contratos
    where situacao = 'Ativo'
), empenhos as (
    select contrato_id,
           cast(replace(replace(despesas_pagas, '.', ''), ',', '.') as numeric(15, 2)) as despesas_pagas
    from estudo_modelagem.raw_empenhos
), pagos as (
    select contrato_id, sum(despesas_pagas) as pago
    from empenhos
    group by contrato_id
)
select c.id, c.valor_global, p.pago,
       round(100 * p.pago / nullif(c.valor_global, 0), 2) as percentual_pago
from contratos as c
left join pagos as p on p.contrato_id = c.id
order by c.id;
```

```text
 id  | valor_global |   pago   | percentual_pago
-----+--------------+----------+-----------------
 101 |    120000.00 | 50000.00 |           41.67
 102 |     45500.50 | 45500.50 |          100.00
 103 |     80000.00 |          |
```

Um contrato com valor global zero teria percentual nulo, e não um erro nem um falso zero. Repare também na organização da consulta: cada CTE (`contratos`, `empenhos`, `pagos`) faz **uma** coisa, e o `select` final só junta. Fica mais fácil revisar a regra, que é o principal ganho das CTEs. Elas não deixam a consulta mais rápida por si só.

## Passo 5: perceber quando a junção multiplica linhas

Agora a pergunta da gestão no total: quanto foi contratado nos contratos ativos? Uma tentativa natural é juntar contratos e empenhos e somar:

```sql
with contratos as (
    select id, cast(replace(replace(valor_global, '.', ''), ',', '.') as numeric(15, 2)) as valor_global
    from estudo_modelagem.raw_contratos
    where situacao = 'Ativo'
)
select count(*) as linhas,
       count(distinct c.id) as contratos,
       sum(c.valor_global) as soma_valor_global
from contratos as c
left join estudo_modelagem.raw_empenhos as e on e.contrato_id = c.id;
```

```text
 linhas | contratos | soma_valor_global
--------+-----------+-------------------
      4 |         3 |         365500.50
```

São **3 contratos, mas 4 linhas**. Essa diferença é o sinal de alarme. O valor certo é 245.500,50 (120.000,00 + 45.500,50 + 80.000,00). Liste as linhas para ver de onde vem a diferença:

```sql
select c.id, e.ne, c.valor_global
from estudo_modelagem.raw_contratos as c
left join estudo_modelagem.raw_empenhos as e on e.contrato_id = c.id
where c.situacao = 'Ativo'
order by c.id, e.ne;
```

```text
 id  |      ne      | valor_global
-----+--------------+--------------
 101 | 2026NE000101 | 120.000,00
 101 | 2026NE000102 | 120.000,00
 102 | 2026NE000201 | 45.500,50
 103 |              | 80.000,00
```

O contrato 101 tem dois empenhos, então aparece em duas linhas, e o valor global dele foi copiado para as duas. A soma contou 120.000,00 duas vezes. O JOIN não está errado para listar empenhos; errado é somar, depois dele, uma medida que pertence ao contrato.

Não tente consertar com `distinct`. `sum(distinct c.valor_global)` daria o número certo aqui por coincidência, mas, se dois contratos tivessem o mesmo valor, um deles sumiria da soma. A correção de verdade (agregar cada medida no nível ao qual ela pertence) é o assunto da aula de [granularidade](../explicacao/engenharia-granularidade.md). Por enquanto, guarde o teste: **compare `count(*)` com `count(distinct chave)` sempre que juntar tabelas antes de somar.**

## O que você viu

- Uma condição no `where` que tirou um contrato do resultado e, no `on`, o manteve.
- Um `count(*)` que contou um empenho que não existe.
- Um nulo que significa "não há empenho associado", e não "pago zero".
- Uma divisão que perde os decimais e outra que interrompe a consulta.
- Uma junção que multiplica o valor do contrato e infla a soma em 120.000,00.

## No código do Gov Hub: uma comparação com nulo que vira "Não"

O modelo gold `contratos_resumo` calcula se o contrato está pendente de baixa:

```sql
case
    when vp.despesas_pagas = c.valor_global then 'Sim' else 'Não'
end as pendente_baixa
```

Leia com o que você viu no passo 3. Quando um contrato não tem valor pago associado, `vp.despesas_pagas` é nulo; `nulo = c.valor_global` dá desconhecido, o `when` não é verdadeiro, e o `case` cai no `else`: **'Não'**. O resultado é plausível ("não está pendente de baixa"), mas ninguém o decidiu. Ele é efeito do nulo.

Se as fontes de contratos estiverem carregadas no seu banco local, veja quantos "Não" vêm desse caminho:

```sql
select pendente_baixa,
       count(*) as contratos,
       count(*) filter (where despesas_pagas is null) as sem_valor_pago
from contratos.contratos_resumo
group by pendente_baixa
order by pendente_baixa;
```

Num banco local verificado em novembro de 2026, dos 422 contratos com "Não", 285 não tinham valor pago nenhum. Pode ser exatamente o que a área quer, mas a regra precisa dizer isso: por exemplo, um `when vp.despesas_pagas is null then 'Sem pagamento associado'`, ou uma linha na descrição da coluna. As aulas de [planejamento](../explicacao/engenharia-planejamento-modelos.md) e de [entrega](../guias/engenharia-entrega-camada.md) voltam a essa regra.

## Erros comuns

| Sintoma | Causa provável | Como evitar |
|---|---|---|
| Contrato sem registros some de uma contagem | Condição sobre a tabela da direita no `where` | Leve a condição para o `on` |
| Contagem 1 para quem não tem nenhum registro | `count(*)` depois de `left join` | Use `count(coluna_da_direita)` |
| Zero onde deveria haver "sem informação" | `coalesce` usado para esconder o nulo | Use `coalesce` só com uma decisão escrita |
| Percentual 0 em quase tudo | Divisão entre inteiros | Converta para `numeric` antes de dividir |
| Total maior que a soma das partes | Junção que repete uma medida da tabela da esquerda | Compare `count(*)` com `count(distinct chave)` antes de somar |
| Um `case` dá uma resposta para registros sem dado | Comparação com nulo caindo no `else` | Trate o nulo com um `when ... is null` próprio |

## Confira o que entendeu

1. Um painel mostra "1 empenho" para um contrato que não tem nenhum. Qual é a causa mais provável?
2. Um colega propõe `coalesce(sum(despesas_pagas), 0)` "para o gráfico não ficar com buraco". O que precisa ser decidido antes de aceitar?
3. Depois de uma junção, `count(*)` dá 1.250 e `count(distinct contrato_id)` dá 1.000. O que isso diz sobre somar `valor_global` nesse resultado?
4. No `case` do `pendente_baixa`, como fazer um contrato sem valor pago deixar de cair no `else` sem que ninguém perceba?

## Respostas comentadas

1. `count(*)` depois de um `left join`: a linha do contrato existe, com o lado do empenho nulo, e `count(*)` conta essa linha. Use `count(e.ne)`.
2. Se "sem empenho associado" pode ser tratado como "nada pago". Se a associação entre empenho e contrato pode falhar, o zero afirma algo que o dado não sustenta. A decisão vai para a especificação da entrega, que é o assunto da próxima aula.
3. Que 250 contratos aparecem em mais de uma linha. Somar `valor_global` nesse resultado conta esses contratos mais de uma vez. Agregue as medidas da tabela da direita antes de juntar, ou some `valor_global` direto na tabela de contratos.
4. Com um `when vp.despesas_pagas is null then ...` antes da comparação, devolvendo um valor próprio (como "Sem pagamento associado") ou o resultado que a especificação definir. O caso passa a ser uma decisão visível, e não um efeito do nulo.

## Veja também

- [Prática: SQL para decidir quem entra no resultado](engenharia-sql.md)
- [Planejar a entrega antes dos modelos](../explicacao/engenharia-planejamento-modelos.md)
