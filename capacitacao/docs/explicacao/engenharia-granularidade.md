# Granularidade: o que cada linha representa e o que pode ser somado

> Tipo: **Explicação**

## Os 120 mil que apareceram duas vezes

No último passo da [segunda parte da prática de SQL](../tutoriais/engenharia-sql-medidas.md), a soma do valor global dos contratos ativos deu 365.500,50, quando o certo era 245.500,50. Nenhum dado estava errado e o SQL executou sem erro. O contrato 101 tem dois empenhos; ao juntar contratos e empenhos, ele virou duas linhas, e o seu valor global foi somado duas vezes.

Esse é o erro de modelagem mais comum em indicadores, e ele tem nome: **misturar granularidades**. Esta aula explica o conceito e mostra a correção, que é a mesma usada no modelo real `contratos_resumo`.

![À esquerda, o contrato 101, com valor global de 120.000,00, e seus dois empenhos, de 30.000,00 e 20.000,00. No caminho errado, o JOIN gera duas linhas, cada uma com os 120.000,00 do contrato, e a soma dá 240.000,00. No caminho certo, os empenhos são somados antes, numa linha por contrato com 50.000,00 pagos, e só depois se juntam ao contrato: uma linha com 120.000,00 contratados e 50.000,00 pagos.](../../assets/diagramas/engenharia-granularidade-medidas.png)

## O que você vai aprender

- Escrever a granularidade de uma tabela numa frase.
- Saber a qual granularidade cada medida pertence.
- Corrigir uma soma inflada agregando antes de juntar.
- Reconhecer relações um para muitos e muitos para muitos, e conferi-las com SQL.
- Distinguir medidas que podem ser somadas das que não podem.

## Granularidade é a frase "cada linha representa…"

A **granularidade** (ou grão) de uma tabela é o que uma linha representa. Na base de estudo:

| Tabela | Cada linha representa |
|---|---|
| `raw_contratos`, `bronze_contratos` | Um contrato |
| `raw_empenhos`, `bronze_empenhos` | Um empenho |
| `silver_contratos_empenhos` | Um par contrato e empenho associado (ou um contrato sem empenho) |
| `gold_contratos_resumo` | Um contrato |

Escreva essa frase antes de escrever o SQL, e escreva-a na descrição do modelo. Ela decide o que pode ser somado, qual é a chave e como a tabela pode ser juntada a outras.

## Cada medida pertence a uma granularidade

`valor_global` é um fato **sobre o contrato**: existe um por contrato. `despesas_pagas` é um fato **sobre o empenho**: existe um por empenho. Quando você junta as duas tabelas, o resultado fica na granularidade mais fina (um par contrato e empenho), e o valor global, que tem um só por contrato, é **copiado** para cada empenho.

A cópia não é um erro: para listar os empenhos com o contrato ao lado, ela é exatamente o que se quer. O erro aparece quando se **soma** a medida copiada.

## Exemplo resolvido: do total errado à correção

O total da pergunta da gestão, juntando antes de somar:

```sql
select sum(c.valor_global) as total_contratado,
       sum(e.despesas_pagas) as total_pago
from estudo_modelagem.bronze_contratos as c
left join estudo_modelagem.bronze_empenhos as e on e.contrato_id = c.id
where c.situacao = 'Ativo';
```

```text
 total_contratado | total_pago
------------------+------------
        365500.50 |   95500.50
```

O total pago está certo; o contratado, não. A diferença de comportamento entre as duas colunas é a pista: o total pago está somando uma medida **da granularidade do resultado** (um empenho por linha), e o contratado está somando uma medida que foi copiada.

Para confirmar o diagnóstico, conte as linhas por contrato:

```sql
select c.id, count(*) as linhas
from estudo_modelagem.bronze_contratos as c
left join estudo_modelagem.bronze_empenhos as e on e.contrato_id = c.id
where c.situacao = 'Ativo'
group by c.id
order by c.id;
```

```text
 id  | linhas
-----+--------
 101 |      2
 102 |      1
 103 |      1
```

O 101 vale duas linhas. A correção é **levar os empenhos à granularidade do contrato antes de juntar**: some os pagamentos por contrato e só depois junte esse resumo, que tem no máximo uma linha por contrato.

```sql
with pagos as (
    select contrato_id, sum(despesas_pagas) as pago
    from estudo_modelagem.bronze_empenhos
    group by contrato_id
)
select sum(c.valor_global) as total_contratado,
       sum(p.pago) as total_pago
from estudo_modelagem.bronze_contratos as c
left join pagos as p on p.contrato_id = c.id
where c.situacao = 'Ativo';
```

```text
 total_contratado | total_pago
------------------+------------
        245500.50 |   95500.50
```

Os dois totais agora estão certos. Leia a regra assim: **some cada medida na granularidade a que ela pertence e junte só tabelas que já estão na granularidade do resultado.**

É exatamente o que faz o modelo real `gold/contratos_resumo.sql`. A primeira CTE leva os pagamentos à granularidade do contrato, e só a segunda junta:

```sql
valores_pagos_contratos as (
    select contrato_id as id, sum(despesas_pagas) as despesas_pagas, max(dt_ingest) as dt_ingest_vpc
    from {{ ref("contratos_empenhos") }}
    where contrato_id is not null
    group by contrato_id
),

contratos_gold as (
    select
        *,
        case
            when vp.despesas_pagas = c.valor_global then 'Sim' else 'Não'
        end as pendente_baixa
    from {{ ref("contratos") }} as c
    left join valores_pagos_contratos as vp using (id)
)
```

Quem lê esse modelo sem conhecer granularidade pode achar a CTE `valores_pagos_contratos` um rodeio. Ela é a parte que garante o resultado.

## Relações: um para um, um para muitos, muitos para muitos

Antes de juntar duas tabelas, saiba quantas linhas de cada lado podem se corresponder:

| Relação | Exemplo | O que acontece no JOIN |
|---|---|---|
| Muitos para um | Contratos e unidade gestora: vários contratos, uma unidade | Cada contrato encontra no máximo uma unidade; a quantidade de linhas não muda |
| Um para muitos | Contrato e empenhos: um contrato, vários empenhos | Cada contrato vira tantas linhas quantos forem os empenhos |
| Muitos para muitos | Faturas e empenhos, no projeto real: uma fatura pode usar vários empenhos e um empenho pode pagar várias faturas | O resultado tem uma linha por associação, e as medidas dos dois lados se repetem |

Não confie no nome da tabela para saber a relação. Confira com SQL, contando quantas vezes cada chave aparece do outro lado:

```sql
select contrato_id, count(*) as empenhos
from estudo_modelagem.bronze_empenhos
where contrato_id is not null
group by contrato_id
having count(*) > 1;
```

```text
 contrato_id | empenhos
-------------+----------
 101         |        2
```

Qualquer linha nesse resultado avisa que juntar empenhos a contratos vai multiplicar contratos.

## Nem toda medida pode ser somada

Mesmo na granularidade certa, algumas medidas não podem ser somadas:

| Tipo de medida | Exemplo | Pode somar? |
|---|---|---|
| Aditiva | Valor pago, valor global | Sim, entre contratos, unidades e períodos |
| Semiaditiva | Saldo a pagar no fim de cada mês | Entre contratos, sim; entre meses, não: o saldo de março mais o de abril não é o saldo de nada |
| Não aditiva | Percentual pago, preço médio | Não; recalcule a partir das medidas aditivas |

O percentual pago é o caso mais traiçoeiro, porque a média parece razoável:

```sql
select contrato_id, valor_global, despesas_pagas,
       round(100 * despesas_pagas / nullif(valor_global, 0), 2) as percentual_pago
from estudo_modelagem.gold_contratos_resumo
where despesas_pagas is not null
order by contrato_id;
```

```text
 contrato_id | valor_global | despesas_pagas | percentual_pago
-------------+--------------+----------------+-----------------
 101         |    120000.00 |       50000.00 |           41.67
 102         |     45500.50 |       45500.50 |          100.00
```

Qual é o percentual pago desses dois contratos juntos?

```sql
select round(avg(100 * despesas_pagas / valor_global), 2) as media_dos_percentuais,
       round(100 * sum(despesas_pagas) / sum(valor_global), 2) as percentual_do_total
from estudo_modelagem.gold_contratos_resumo
where despesas_pagas is not null;
```

```text
 media_dos_percentuais | percentual_do_total
-----------------------+---------------------
                 70.83 |               57.70
```

A média dos percentuais dá o mesmo peso a um contrato de 45 mil e a um de 120 mil. O percentual certo é a razão entre os totais: 95.500,50 pagos de 165.500,50 contratados, ou 57,70%. Por isso, numa entrega para o Superset, entregue as medidas aditivas (`valor_global`, `despesas_pagas`) e calcule o percentual **na métrica do gráfico**, como `sum(despesas_pagas) / sum(valor_global)`. Não entregue uma coluna de percentual para alguém somar ou tirar a média depois.

## A chave confirma a granularidade

Se cada linha representa um contrato, `contrato_id` não pode se repetir. Uma consulta de conferência devolve as violações; nenhuma linha quer dizer que a regra vale:

```sql
select contrato_id, count(*) as ocorrencias
from estudo_modelagem.gold_contratos_resumo
group by contrato_id
having count(*) > 1;
```

```text
 contrato_id | ocorrencias
-------------+-------------
(0 rows)
```

Zero linhas hoje não prova a regra para sempre: novos dados podem quebrá-la. Por isso essa consulta vira um teste que roda a cada execução, como na aula de entrega.

Quando o teste falhar, não acrescente colunas à chave só para ele passar. Uma chave com mais colunas descreve **outra granularidade**. Pergunte que diferença do negócio a nova coluna representa: se duas linhas com o mesmo contrato e naturezas de despesa diferentes são registros legítimos, a granularidade é "contrato e natureza", e a frase da especificação precisa mudar junto.

## No código do Gov Hub: faturas, uma linha por fatura e empenho

O modelo bronze `faturas.sql` recebe uma fatura com a lista de empenhos que a pagam e expande essa lista:

```sql
jsonb_array_elements(
    replace(dados_empenho, '''', '"')::jsonb
) as dados_empenho,
```

`jsonb_array_elements` gera uma linha para cada elemento da lista. Uma fatura paga por dois empenhos vira duas linhas. Depois, o modelo extrai os campos de cada empenho:

```sql
f.dados_empenho ->> 'id_empenho' as id_empenho,
upper(f.dados_empenho ->> 'numero_empenho') as numero_empenho,
f.dados_empenho ->> 'valor_empenho' as valor_empenho,
```

Leia assim: a granularidade da bronze `faturas` é **uma linha por fatura e empenho**. A coluna `valor` é o valor da fatura inteira, repetido em cada linha da mesma fatura; a medida que pertence a essa granularidade é `valor_empenho`, a parte paga por cada empenho, que ainda chega como texto (o operador `->>` devolve texto) e precisa de conversão antes de ser somada. Somar `valor` nessa tabela conta a fatura uma vez por empenho.

O projeto registra essa granularidade em outro lugar: o snapshot `faturas_snapshot` usa `unique_key: [id, id_empenho]`, a chave de uma linha por fatura e empenho.

Se as fontes de contratos estiverem carregadas no seu banco local, compare as linhas com as faturas e a soma com repetição com a soma que conta cada fatura uma vez:

```sql
select count(*) as linhas,
       count(distinct id) as faturas,
       sum(valor) as soma_com_repeticao,
       (select sum(valor) from (select distinct id, valor from contratos.faturas) as f) as soma_uma_vez_por_fatura
from contratos.faturas;
```

Num banco local verificado em novembro de 2026, a bronze tinha 3.090 linhas para 2.922 faturas, e a soma com repetição passava da outra em cerca de 15 milhões de reais. Os números do seu banco serão outros, mas a diferença terá a mesma causa.

## Caso real: juntar pela unidade multiplicava servidores

Em **01/06/2026**, o [commit 348ff8a](https://github.com/GovHub-br/data-application-gov-hub/commit/348ff8af8437cb716ed0a26fe9e4d50376306a5b) trocou a condição de junção com `dados_uorg` em seis modelos de pessoas, de:

```sql
inner join {{ ref("dados_uorg") }} du on df.sigla_uorg_exercicio = du.sigla_uorg
```

para:

```sql
inner join {{ ref("dados_uorg") }} du on df.cpf = du.cpf
```

O nome `dados_uorg` e a descrição do modelo ("dados das Unidades Organizacionais") sugerem uma linha por unidade. As colunas dizem outra coisa: o modelo bronze tem `cpf` e `codigo_matricula`, ou seja, **uma linha por servidor**, com os dados da unidade em que ele está. Com essa granularidade, juntar pela sigla da unidade liga cada servidor a **todas** as linhas dos colegas da mesma unidade: uma relação muitos para muitos onde se esperava muitos para um. Juntar pelo CPF liga cada servidor à sua própria linha.

A contagem confirma a granularidade sem expor nenhum dado pessoal:

```sql
select count(*) as linhas, count(distinct cpf) as servidores, count(distinct sigla_uorg) as siglas
from pessoas.dados_uorg;
```

Num banco local carregado, o número de linhas é igual ao de CPFs distintos, e há bem menos siglas do que linhas: cada sigla se repete para todos os servidores da unidade. A mensagem do commit não registra quantas linhas o erro afetava; o efeito decorre dessa estrutura. A lição vale para qualquer junção: **confirme a granularidade das duas tabelas pelas colunas e pela contagem, não pelo nome.** E repare que a chave da junção é o CPF, um dado pessoal: a aula [Dados pessoais, segredos e menor privilégio](engenharia-acesso.md), no nível 5, trata de onde esse dado pode circular.

## Erros comuns

| Sintoma | Causa provável | Como evitar |
|---|---|---|
| Total maior que a soma das partes | Medida de uma tabela somada depois de juntar com outra mais detalhada | Agregue antes de juntar |
| `distinct` "resolve" a soma | Coincidência de valores | Corrija a granularidade, não esconda a repetição |
| Percentual do total diferente do painel | Média de percentuais | Entregue as medidas aditivas e calcule a razão no gráfico |
| Teste de chave única só passa com cinco colunas | Granularidade não definida | Escreva a frase "cada linha representa…" e escolha a chave a partir dela |
| JOIN que multiplica linhas sem motivo aparente | Tabela com granularidade diferente da que o nome sugere | Conte as linhas por chave dos dois lados antes de juntar |

## Confira o que entendeu

1. Escreva a granularidade da silver `silver_contratos_empenhos` numa frase.
2. Na bronze real de faturas, uma fatura de 1.000,00 foi paga por dois empenhos, de 600,00 e 400,00. Qual é o resultado de `sum(valor)` e de `sum(valor_empenho)` para ela, depois da conversão?
3. Um painel mostra a média do percentual pago por unidade gestora. Por que ela pode enganar, e o que você entregaria no lugar?
4. Por que trocar a chave da junção de `sigla_uorg` para `cpf` mudou o resultado, se todos os servidores continuaram nas duas tabelas?

## Respostas comentadas

1. "Cada linha representa um contrato ativo e um empenho associado a ele; um contrato ativo sem empenho aparece uma vez, com os campos do empenho nulos."
2. `sum(valor)` dá 2.000,00, porque o valor da fatura se repete nas duas linhas. `sum(valor_empenho)` dá 1.000,00, porque cada linha traz a parte paga pelo seu empenho.
3. Porque a média dá o mesmo peso a contratos de tamanhos diferentes. Entregue `valor_global` e `despesas_pagas` por linha e calcule o percentual da unidade no gráfico, como `sum(despesas_pagas) / sum(valor_global)`.
4. Porque `dados_uorg` tem uma linha por servidor. Pela sigla, cada servidor encontrava as linhas de todos os colegas da unidade (muitos para muitos); pelo CPF, encontra só a sua (um para um). A quantidade de pessoas nas tabelas não mudou; mudou quantas vezes cada uma era contada.

## Veja também

- [Definir as responsabilidades de cada camada](engenharia-camadas.md)
- [Tabela larga, estrela ou snowflake: escolher a forma da entrega](engenharia-arquiteturas-dados.md)
