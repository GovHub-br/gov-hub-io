# Tabela larga, estrela ou snowflake: escolher a forma da entrega

> Tipo: **Explicação**

## A pergunta da semana seguinte

A gold de estudo, `gold_contratos_resumo`, responde bem à pergunta que a motivou: uma linha por contrato, com o valor global e o valor pago. Uma semana depois da entrega, a equipe pede mais: **quanto foi pago por mês em 2026?**

A gold não tem como responder. Ela tem uma linha por contrato, e o valor pago já chega somado; as datas dos empenhos ficaram para trás na agregação. Para responder, seria preciso outra gold, e depois outra a cada pergunta nova.

Essa é a diferença entre as formas de entregar um dado. Esta aula compara três delas na base de estudo, a tabela larga, a estrela e a snowflake, e situa cada uma dentro da arquitetura medalhão que você já construiu.

![A estrela de estudo. No centro, a tabela fato_pagamento, com uma linha por empenho pago, a data de emissão e o valor pago. Em volta, as dimensões dim_contrato, com número, fornecedor e situação, e dim_unidade_gestora, com o nome da unidade. Na variante snowflake, indicada com tracejado, a unidade deixa de estar ligada ao fato e passa a ser alcançada pelo contrato, e uma dimensão de órgão pode ficar acima da unidade. Uma nota compara com a tabela larga gold_contratos_resumo, que tem uma linha por contrato e por isso não responde ao valor pago por mês.](../../assets/diagramas/engenharia-arquiteturas-modelagem.png)

## O que você vai aprender

- Distinguir a arquitetura medalhão (o percurso do dado) da modelagem dimensional (a forma da entrega).
- Montar uma estrela pequena e ver que perguntas ela responde que a tabela larga não responde.
- Saber o que a snowflake muda em relação à estrela.
- Escolher a forma da entrega a partir do uso, e não de uma regra fixa.

## Duas escolhas em escalas diferentes

A **arquitetura medalhão** (raw, bronze, silver, gold) organiza o **percurso**: em que etapa cada transformação acontece. A **modelagem dimensional** (estrela, snowflake) organiza a **forma** de uma entrega: como as tabelas que o consumidor vai consultar se relacionam.

As duas não concorrem. Uma estrela pode ser a gold de um projeto medalhão: a bronze e a silver preparam e integram, e a gold é entregue como fato e dimensões. Uma tabela larga também pode ser a gold. A escolha é sobre a gold, e depende de quem vai consumir e de que perguntas vai fazer.

Um cuidado com os nomes: em outras plataformas, "bronze" pode ser a própria entrada bruta. No Gov Hub, a entrada bruta se chama raw, e a bronze já converte tipos. Quando ler sobre medalhão em outro lugar, confira a convenção antes de comparar.

## A estrela: fatos no centro, dimensões em volta

Uma estrela tem dois tipos de tabela:

- **Fato:** uma linha por evento ou medição, com as medidas e as chaves das dimensões. Aqui, um pagamento de empenho.
- **Dimensão:** os atributos usados para filtrar e agrupar. Aqui, o contrato e a unidade gestora.

A primeira decisão de uma estrela é a granularidade do fato, como você viu na [aula anterior](engenharia-granularidade.md). Para a pergunta "pago por mês", o fato precisa estar na granularidade do pagamento, porque é nela que a data existe.

Monte a estrela de estudo:

```sql
create or replace view estudo_modelagem.dim_contrato as
select id as contrato_id, numero, fornecedor_nome, situacao, codigo_ug
from estudo_modelagem.bronze_contratos;

create or replace view estudo_modelagem.dim_unidade_gestora as
select codigo as codigo_ug, nome
from estudo_modelagem.bronze_unidades_gestoras;

create or replace view estudo_modelagem.fato_pagamento as
select e.ne, e.contrato_id, c.codigo_ug, e.emissao, e.despesas_pagas as valor_pago
from estudo_modelagem.bronze_empenhos as e
left join estudo_modelagem.bronze_contratos as c on c.id = e.contrato_id;
```

```sql
select * from estudo_modelagem.fato_pagamento order by ne;
```

```text
      ne      | contrato_id | codigo_ug |  emissao   | valor_pago
--------------+-------------+-----------+------------+------------
 2025NE000401 | 104         | 990002    | 2025-06-20 |   15000.00
 2026NE000101 | 101         | 990001    | 2026-02-10 |   30000.00
 2026NE000102 | 101         | 990001    | 2026-05-12 |   20000.00
 2026NE000201 | 102         | 990001    | 2026-03-05 |   45500.50
 2026NE000900 |             |           | 2026-04-18 |    7250.00
```

Leia assim: cinco pagamentos, cinco linhas. Nenhum foi perdido: o empenho sem contrato está no fato, com as chaves das dimensões vazias. Em estrelas de produção, é comum trocar esse vazio por uma linha especial na dimensão, como "contrato não associado", para que filtros e agrupamentos mostrem o caso com um nome.

Agora a pergunta da semana seguinte:

```sql
select date_trunc('month', f.emissao)::date as mes, sum(f.valor_pago) as pago
from estudo_modelagem.fato_pagamento as f
where f.emissao >= '2026-01-01'
group by 1
order by 1;
```

```text
    mes     |   pago
------------+----------
 2026-02-01 | 30000.00
 2026-03-01 | 45500.50
 2026-04-01 |  7250.00
 2026-05-01 | 20000.00
```

E qualquer combinação de dimensões, sem modelo novo. Pago por unidade e situação do contrato:

```sql
select coalesce(u.nome, 'sem unidade') as unidade,
       coalesce(c.situacao, 'sem contrato') as situacao,
       sum(f.valor_pago) as pago
from estudo_modelagem.fato_pagamento as f
left join estudo_modelagem.dim_contrato as c on c.contrato_id = f.contrato_id
left join estudo_modelagem.dim_unidade_gestora as u on u.codigo_ug = f.codigo_ug
group by 1, 2
order by 1, 2;
```

```text
           unidade            |   situacao   |   pago
------------------------------+--------------+----------
 Coordenação de Administração | Ativo        | 95500.50
 Coordenação de Pesquisa      | Inativo      | 15000.00
 sem unidade                  | sem contrato |  7250.00
```

Compare com a tabela larga:

```sql
select unidade, sum(despesas_pagas) as pago
from estudo_modelagem.gold_contratos_resumo
group by unidade
order by unidade;
```

```text
                unidade                |   pago
---------------------------------------+----------
 990001 - Coordenação de Administração | 95500.50
 990002 - Coordenação de Pesquisa      |
 990009 - unidade não cadastrada       |
```

A tabela larga respondeu "por unidade" porque a unidade é uma coluna dela, mas herdou as decisões que tomou para a sua pergunta. O pagamento do contrato inativo não está nela, e o empenho sem contrato nunca esteve. O fato, na granularidade do pagamento, guarda os 117.750,50 completos; cada pergunta escolhe o que filtrar.

## A snowflake: dimensões que apontam para dimensões

Na estrela, o fato tem a chave da unidade (`codigo_ug`) diretamente. Na variante **snowflake**, a unidade sai do fato e passa a ser alcançada pelo contrato: `fato_pagamento → dim_contrato → dim_unidade_gestora`. Se houvesse uma hierarquia acima, como o órgão de cada unidade, ela viraria mais um degrau: `dim_unidade_gestora → dim_orgao`.

| | Estrela | Snowflake |
|---|---|---|
| Caminho até um atributo | Uma junção a partir do fato | Uma junção por degrau da hierarquia |
| Repetição de atributos | O nome do órgão se repete em cada unidade | Cada atributo fica numa tabela só |
| Para quem consulta | Mais simples | Mais junções para escrever e revisar |
| Quando a hierarquia muda | Atualiza a dimensão | Atualiza só o degrau que mudou |

A snowflake troca simplicidade de consulta por menos repetição. Para um painel no Superset, em que cada dataset é uma tabela ou uma consulta, a estrela costuma ser a escolha mais confortável. A snowflake compensa quando a hierarquia é grande, muda com frequência e é administrada separadamente. Quando a hierarquia muda com o tempo (uma unidade passa a outro órgão), qualquer das duas precisa decidir se o fato antigo mostra a hierarquia de então ou a de hoje, assunto da aula de [histórico](engenharia-historico.md).

## A tabela larga: uma pergunta, uma tabela

A **tabela larga** junta, numa só tabela, as medidas e as descrições que um painel usa. É o que o Gov Hub entrega hoje na maior parte dos casos: `contratos_resumo`, por exemplo, tem uma linha por contrato com fornecedor, unidade, valores e indicadores prontos.

Ela é a forma mais simples de consumir: o dataset do Superset é a tabela, sem junções. O custo aparece com o tempo. Cada pergunta nova pede uma tabela nova, e regras que deveriam ser uma só ("o que é pago", "o que é ativo") passam a existir em várias golds. Uma tabela larga é uma boa entrega **quando a regra que ela aplica mora antes dela**, numa silver ou numa macro compartilhada.

## Escolher a partir do uso

| Situação | Forma a considerar |
|---|---|
| Um painel com uma pergunta estável e poucos filtros | Tabela larga, com as regras compartilhadas antes dela |
| Várias perguntas sobre os mesmos eventos, por recortes que mudam | Estrela, com o fato na granularidade do evento |
| Hierarquias grandes, administradas separadamente | Snowflake nas dimensões que têm hierarquia |
| Indicadores prontos, um por linha | Tabela de indicadores, como `kpis_servidores` |

O ponto de partida é sempre o mesmo: a granularidade do fato e as perguntas que precisam ser respondidas. A forma vem depois.

## No código do Gov Hub: formas diferentes de gold

O projeto tem golds de formas diferentes, e reconhecê-las ajuda a ler o que existe:

| Modelo | Forma | Cada linha representa |
|---|---|---|
| `contratos_dbt/gold/contratos_resumo.sql` | Tabela larga | Um contrato, com atributos e valores |
| `pessoas_dbt/gold/kpis_servidores.sql` | Tabela de indicadores | Um indicador (total de servidores, ativos, aposentados…) com seu valor |

O projeto não tem, na revisão atual, uma estrela formal com tabelas `fato_` e `dim_`. A estrela desta aula é uma **proposta de desenho** sobre a base de estudo, para você comparar as formas; não procure essas tabelas no banco da aplicação.

## Erros comuns

| Sintoma | Causa provável | Como evitar |
|---|---|---|
| Toda pergunta nova vira um modelo gold novo | Entrega só em tabelas largas, cada uma agregada para uma pergunta | Para recortes que mudam, entregue um fato na granularidade do evento |
| A mesma regra escrita em várias golds | Regra aplicada na entrega, não antes dela | Leve a regra para a silver ou para uma macro |
| Totais do fato e da tabela larga não batem | Cada uma aplicou uma população diferente | Documente a população de cada entrega e reconcilie |
| Um evento some do fato | Fato construído com `inner join` às dimensões | Use `left join` ou um membro "não associado" na dimensão |

## Confira o que entendeu

1. A arquitetura medalhão e a estrela são alternativas? Por quê?
2. Por que a `gold_contratos_resumo` não consegue responder "pago por mês"?
3. Na estrela de estudo, o fato usou `left join` com os contratos para pegar a unidade. O que aconteceria com o empenho 2026NE000900 se fosse um `inner join`?
4. Uma área pede um único painel, com uma pergunta estável, que lê uma tabela por contrato. Você montaria uma estrela?

## Respostas comentadas

1. Não. A medalhão organiza o percurso do dado em etapas; a estrela é uma forma de organizar a entrega. Uma estrela pode ser a gold de um projeto medalhão.
2. Porque a granularidade dela é o contrato. A data existe por empenho e se perdeu na soma dos pagamentos por contrato. Só uma tabela na granularidade do pagamento, como o fato, responde por mês.
3. Ele sairia do fato, e os 7.250,00 deixariam de aparecer em qualquer pergunta. O fato deve guardar todos os eventos e marcar os que não têm dimensão associada.
4. Provavelmente não. Uma tabela larga atende com menos esforço de consumo, desde que as regras que ela aplica (o que é pago, o que é ativo) morem antes dela, para poderem ser reutilizadas se outras perguntas surgirem.

## Veja também

- [Granularidade: o que cada linha representa e o que pode ser somado](engenharia-granularidade.md)
- [Onde mora cada regra: modelos, macros e reutilização no dbt](engenharia-modelos-reutilizaveis.md)
