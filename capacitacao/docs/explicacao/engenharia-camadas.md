# Definir as responsabilidades de cada camada

> Tipo: **Explicação**

## Uma regra, um lugar

Na prática de SQL, a conversão `cast(replace(replace(valor, '.', ''), ',', '.') as numeric(15, 2))` apareceu em quase todas as consultas, e o filtro `situacao = 'Ativo'` também. Se a fonte passar a mandar o valor em outro formato, quantos lugares você terá de corrigir? E como saberá que encontrou todos?

As camadas existem para responder a isso. Cada transformação ganha **um lugar** no percurso do dado: a conversão do valor fica na bronze, a associação entre empenhos e contratos fica na silver, e a resposta para o painel fica na gold. Quando algo der errado, você sabe em qual camada procurar.

![A cadeia real de contratos no projeto dbt. Na raw, as tabelas compras_gov.contratos, compras_gov.empenhos e compras_gov.faturas, vindas do ComprasGov, e siafi.empenhos_tesouro, vinda do Tesouro Gerencial. Na bronze, os modelos contratos, empenhos, faturas e empenhos_tesouro convertem tipos e formatos. A visão identificadores reúne números de empenho, processos e CNPJs. Na silver, contratos_empenhos lê a visão identificadores, a bronze empenhos_tesouro e a bronze contratos, e associa empenhos do SIAFI a contratos em quatro tentativas, mantendo só os contratos ativos. Na gold, contratos_resumo entrega uma linha por contrato e lê tanto a silver quanto a bronze contratos. Uma nota marca o CNPJ/CPF de fornecedor pessoa física como dado pessoal, e outra lembra que todas as camadas são gravadas no mesmo schema, contratos.](../../assets/diagramas/engenharia-camadas-contratos.png)

## O que você vai aprender

- Dizer qual pergunta cada camada responde e o que não deve acontecer nela.
- Construir uma cadeia bronze, silver e gold sobre os dados de estudo.
- Localizar em qual camada investigar cada tipo de problema.
- Ler a configuração real do projeto sem confundir pasta, camada e schema.

## Uma pergunta por camada

| Camada | Pergunta que responde | O que acontece nela | O que não deve acontecer nela |
|---|---|---|---|
| **Raw** | O que a fonte mandou? | A ingestão grava o dado como chegou, tudo em texto | Corrigir, filtrar ou interpretar |
| **Bronze** | Este registro está com o tipo e o formato certos? | Converter tipos, padronizar formatos, limpar caracteres | Juntar fontes ou decidir quem entra no indicador |
| **Silver** | Como os registros se relacionam, e quais valem? | Associar fontes, remover duplicatas, aplicar regras compartilhadas | Agregar para um painel específico |
| **Gold** | Qual é a resposta para quem consome? | Agregar, calcular medidas, dar nomes de negócio | Corrigir formato de fonte, que deveria ter sido feito antes |

Um bom teste da separação: **a bronze tem o mesmo número de linhas que a raw**. Se tiver menos, está filtrando, e filtrar é decisão de população. Se tiver mais, está expandindo algo, e a granularidade mudou.

## Construa a cadeia na base de estudo

Use o schema `estudo_modelagem`, criado na [primeira parte da prática de SQL](../tutoriais/engenharia-sql.md). Cada visão abaixo faz o papel de um modelo dbt. O script completo também está em [cadeia-de-camadas.sql](../../exemplos/engenharia-modelagem/cadeia-de-camadas.sql).

### Bronze: converter uma vez

```sql
create or replace view estudo_modelagem.bronze_contratos as
select
    id,
    numero,
    fornecedor_nome,
    situacao,
    codigo_ug,
    cast(replace(replace(valor_global, '.', ''), ',', '.') as numeric(15, 2)) as valor_global,
    case
        when data_assinatura ~ '^\d{4}-\d{2}-\d{2}$' then to_date(data_assinatura, 'YYYY-MM-DD')
    end as data_assinatura,
    (dt_ingest || '-03:00')::timestamptz as dt_ingest
from estudo_modelagem.raw_contratos;

create or replace view estudo_modelagem.bronze_empenhos as
select
    ne,
    contrato_id,
    to_date(emissao, 'YYYY-MM-DD') as emissao,
    cast(replace(replace(despesas_pagas, '.', ''), ',', '.') as numeric(15, 2)) as despesas_pagas,
    (dt_ingest || '-03:00')::timestamptz as dt_ingest
from estudo_modelagem.raw_empenhos;

create or replace view estudo_modelagem.bronze_unidades_gestoras as
select trim(codigo) as codigo, trim(nome) as nome
from estudo_modelagem.raw_unidades_gestoras;
```

```sql
select id, valor_global, data_assinatura, dt_ingest
from estudo_modelagem.bronze_contratos
order by id;
```

```text
 id  | valor_global | data_assinatura |       dt_ingest
-----+--------------+-----------------+------------------------
 101 |    120000.00 | 2026-01-15      | 2026-10-01 11:00:00+00
 102 |     45500.50 | 2026-02-03      | 2026-10-01 11:00:00+00
 103 |     80000.00 |                 | 2026-10-01 11:00:00+00
 104 |     15000.00 | 2025-04-10      | 2026-10-01 11:00:00+00
```

Leia assim: quatro linhas na raw, quatro na bronze. O valor virou número e a data virou data. O `dt_ingest` ganhou fuso: a bronze declara que `08:00:00` era horário de Brasília (`|| '-03:00'`), e o PostgreSQL da aplicação, que usa UTC, mostra o mesmo instante como `11:00:00+00`.

Repare no contrato 103: a raw tinha `15/03/2026` e a bronze tem nulo. O `case` só aceita `aaaa-mm-dd` e, sem `else`, devolve nulo **sem avisar**. O modelo real `bronze/contratos.sql` faz o mesmo, para não interromper a carga por uma data mal formatada. É uma escolha razoável desde que alguém fique sabendo, por exemplo com um teste que compare as datas nulas da bronze com as da raw.

### Silver: relacionar e decidir o que vale

```sql
create or replace view estudo_modelagem.silver_contratos_empenhos as
select
    c.id as contrato_id,
    e.ne,
    e.emissao,
    e.despesas_pagas,
    c.numero,
    c.fornecedor_nome,
    greatest(c.dt_ingest, e.dt_ingest) as dt_ingest
from estudo_modelagem.bronze_contratos as c
left join estudo_modelagem.bronze_empenhos as e on e.contrato_id = c.id
where c.situacao = 'Ativo';
```

```sql
select contrato_id, ne, emissao, despesas_pagas
from estudo_modelagem.silver_contratos_empenhos
order by contrato_id, ne;
```

```text
 contrato_id |      ne      |  emissao   | despesas_pagas
-------------+--------------+------------+----------------
 101         | 2026NE000101 | 2026-02-10 |       30000.00
 101         | 2026NE000102 | 2026-05-12 |       20000.00
 102         | 2026NE000201 | 2026-03-05 |       45500.50
 103         |              |            |
```

Leia assim: a silver tem **uma linha por contrato e empenho associado**; o 103, sem empenho, aparece uma vez com o lado do empenho nulo. Ficaram de fora o empenho 2026NE000900, que não tem contrato, e o contrato 104, que é inativo: a silver de estudo repete o filtro `situacao = 'Ativo'` do modelo real `contratos_empenhos`. Guarde esse detalhe para a aula de entrega.

### Gold: entregar a resposta

```sql
create or replace view estudo_modelagem.gold_contratos_resumo as
with valores_pagos_contratos as (
    select contrato_id as id, sum(despesas_pagas) as despesas_pagas
    from estudo_modelagem.silver_contratos_empenhos
    group by contrato_id
)
select
    c.id as contrato_id,
    c.numero,
    c.situacao,
    concat(c.codigo_ug, ' - ', coalesce(u.nome, 'unidade não cadastrada')) as unidade,
    c.valor_global,
    vp.despesas_pagas,
    case when vp.despesas_pagas = c.valor_global then 'Sim' else 'Não' end as pendente_baixa
from estudo_modelagem.bronze_contratos as c
left join valores_pagos_contratos as vp using (id)
left join estudo_modelagem.bronze_unidades_gestoras as u on u.codigo = c.codigo_ug;
```

```sql
select contrato_id, situacao, unidade, valor_global, despesas_pagas, pendente_baixa
from estudo_modelagem.gold_contratos_resumo
order by contrato_id;
```

```text
 contrato_id | situacao |                unidade                | valor_global | despesas_pagas | pendente_baixa
-------------+----------+---------------------------------------+--------------+----------------+----------------
 101         | Ativo    | 990001 - Coordenação de Administração |    120000.00 |       50000.00 | Não
 102         | Ativo    | 990001 - Coordenação de Administração |     45500.50 |       45500.50 | Sim
 103         | Ativo    | 990009 - unidade não cadastrada       |     80000.00 |                | Não
 104         | Inativo  | 990002 - Coordenação de Pesquisa      |     15000.00 |                | Não
```

Leia assim: uma linha por contrato, como a especificação pede. A CTE soma os pagamentos **antes** de juntar ao contrato, o mesmo desenho do `contratos_resumo` real; a aula de [granularidade](engenharia-granularidade.md) explica por quê. O `coalesce` aparece do jeito certo: para **exibir** a unidade que falta, sem esconder que ela falta. A regra de `pendente_baixa` copia a do modelo real.

Compare essa saída com os exemplos da [especificação](engenharia-planejamento-modelos.md): há uma diferença no contrato 104. Ela é proposital, e a aula de entrega mostra um teste encontrando-a.

Repare também que a gold leu `bronze_contratos` diretamente. O modelo real faz o mesmo (`ref("contratos")`). As camadas organizam **responsabilidades**, não uma fila em que cada modelo só lê o anterior; o que importa é que o dado lido já esteja pronto, sem formato a corrigir nem fonte a associar.

## Onde investigar cada problema

| O que você observa | Camada onde começar | Exemplo na base de estudo |
|---|---|---|
| O valor não converte, ou converte errado | Bronze | `'15/03/2026'` virou nulo na bronze |
| Um registro que deveria entrar sumiu depois de uma junção | Silver | O 104 sumiu no filtro da silver |
| Um pagamento não aparece em nenhum contrato | Silver, na associação | O 2026NE000900 não tem contrato |
| O total não bate com a soma das partes | Gold, na agregação | Somar o valor global depois de juntar com empenhos |

E uma regra vale para todas: **não altere a raw para fazer o painel bater.** A raw é a prova do que a fonte mandou; a correção vai para a camada que interpretou mal o dado.

## No código do Gov Hub: a cadeia de contratos

Partindo de `airflow_lappis/dags/dbt/ipea/models/contratos_dbt/`:

| Arquivo | Camada | O que faz |
|---|---|---|
| `bronze/contratos.sql` | Bronze | Converte valores e datas dos contratos do ComprasGov |
| `bronze/empenhos_tesouro.sql` | Bronze | Converte os empenhos do SIAFI, vindos do Tesouro Gerencial |
| `views/identificadores.sql` | Visão auxiliar | Reúne números de empenho, processos e CNPJs para facilitar as junções |
| `silver/contratos_empenhos.sql` | Silver | Associa empenhos a contratos em quatro tentativas e mantém só os contratos ativos |
| `gold/contratos_resumo.sql` | Gold | Uma linha por contrato, com valor global, valor pago e indicadores |

A pasta `views/` mostra que nem toda pasta é uma camada da arquitetura medalhão: leia o que o modelo faz, não só onde ele está.

### Pasta, camada e schema são coisas diferentes

No `dbt_project.yml`, a configuração de contratos é esta:

```yaml
contratos_dbt:
  +materialized: table
  +schema: contratos
  bronze:
    +materialized: incremental
    +grants:
      select: []
  silver:
    +grants:
      select: ["{{ env_var('DB_DW_READONLY_ROLE', 'de_postgres') }}"]
  gold:
    +grants:
      select: ["{{ env_var('DB_DW_READONLY_ROLE', 'de_postgres') }}"]
  views:
    +materialized: view
```

Leia assim: **todas** as camadas de contratos vão para o mesmo schema, `contratos`. No banco, a bronze é `contratos.contratos`, a silver é `contratos.contratos_empenhos` e a gold é `contratos.contratos_resumo`. O que muda por pasta é a materialização e quem pode ler: a bronze não concede leitura à role de consumo. Por isso, no nível 2, você consultou `contratos.contratos`, e não algo como `bronze.contratos`. Esse `+schema` só vale porque o destino do perfil se chama `prod`, como o nível 2 manteve.

Antes de executar a cadeia real, veja as dependências:

```bash
dbt ls --select +contratos_resumo --resource-type model
```

O `+` antes do nome pede o modelo e tudo de que ele depende: sete modelos, de `contratos` até `contratos_resumo`. O comando só lê o projeto. Para materializar, use `dbt run --select +contratos_resumo`, e só quando as tabelas de origem (`compras_gov.*` e `siafi.empenhos_tesouro`) existirem no banco local.

## Caso real: a mesma regra em três lugares

Em **08/10/2026**, o [commit cea6962](https://github.com/GovHub-br/data-application-gov-hub/commit/cea6962baf7a7ab146ae10cae06f5c3220bd592c) passou a excluir os servidores desligados das contagens do modelo gold `kpis_servidores`. No dia seguinte, o [commit a1153bc](https://github.com/GovHub-br/data-application-gov-hub/commit/a1153bc91313b5e6dc30e7de4f88466d8a4fa617) acrescentou a mesma condição à silver `dados_funcionais_enriquecidos`, com o comentário "mesma regra usada em kpis_servidores e hierarquia".

Na revisão atual, a regra "desligados ficam de fora" está em três modelos: uma silver e duas golds que leem a bronze diretamente. Se ela mudar, as três cópias precisam mudar juntas. O lugar de uma regra de população compartilhada é antes das golds, numa silver que todas leiam ou numa macro, como mostra a aula [Onde mora cada regra](engenharia-modelos-reutilizaveis.md).

## Erros comuns

| Sintoma | Causa provável | Como evitar |
|---|---|---|
| A bronze tem menos linhas que a raw | Filtro de população na bronze | Filtre na silver, onde a regra é visível e compartilhada |
| A gold corrige vírgula decimal | Preparação feita no lugar errado | Leve a correção para a bronze |
| Mudar uma regra exige editar várias golds | Regra compartilhada repetida em cada saída | Centralize antes das golds |
| Alguém procura o schema `bronze` no banco | Pasta confundida com schema | Leia o `+schema` no `dbt_project.yml` |

## Confira o que entendeu

1. A bronze de faturas tem 1.200 linhas e a raw tem 1.000. Isso é necessariamente um erro? O que você verifica?
2. Um colega quer acrescentar `where situacao = 'Ativo'` na bronze de contratos, "para todo mundo já receber só os ativos". Qual é o problema?
3. Em que schema do banco fica o modelo `silver/contratos_empenhos.sql`?

## Respostas comentadas

1. Não necessariamente. A bronze real de faturas gera uma linha por empenho associado a cada fatura. Verifique qual passou a ser a granularidade e se isso está declarado; se a expansão não foi intencional, é uma junção duplicando registros.
2. A bronze passaria a decidir a população, e todos os modelos que a leem perderiam os inativos, inclusive os que precisam deles, como a entrega por contrato da nossa especificação. Regra de população fica na silver, com nome e descrição.
3. No schema `contratos`, como os modelos bronze e gold do mesmo domínio: o `+schema` é configurado no nível `contratos_dbt` e vale para todas as subpastas.

## Veja também

- [Planejar a entrega antes dos modelos](engenharia-planejamento-modelos.md)
- [Granularidade: o que cada linha representa e o que pode ser somado](engenharia-granularidade.md)
