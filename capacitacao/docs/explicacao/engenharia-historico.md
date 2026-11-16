# Posição atual e histórico: reconstrução, incremental e snapshot

> Tipo: **Explicação**

## Quanto valia o contrato na semana passada?

Em 03/10, um aditivo elevou o valor global do contrato 101 de 120.000,00 para 132.000,00. A carga do dia seguinte trouxe o valor novo, e a gold passou a mostrar 132.000,00, como deveria. Uma semana depois, a auditoria pergunta: **qual era o valor do contrato no dia 02/10, quando o relatório mensal foi fechado?**

A gold não sabe responder. A bronze de contratos é reconstruída a cada execução a partir da raw, e a raw guarda o que a fonte manda hoje. O 120.000,00 não está mais em lugar nenhum.

Mostrar a posição atual e guardar o histórico são trabalhos diferentes, e um não traz o outro de graça. Esta aula mostra as três estratégias de atualização (reconstrução, incremental e snapshot), o que cada uma guarda e como uma chave mal escolhida transforma uma correção em duplicata.

![A linha do tempo do contrato 101. Em 01/10 às 8h, ele é observado com valor de 120.000,00. Em 03/10 às 8h, com 132.000,00. O snapshot guarda duas versões: a primeira válida de 01/10 a 03/10 e a segunda a partir de 03/10, ainda atual. Uma consulta pela posição em 02/10 encontra 120.000,00; uma consulta pela posição atual encontra 132.000,00. Uma tabela reconstruída guarda só os 132.000,00.](../../assets/diagramas/engenharia-atualizacao-historico.png)

## O que você vai aprender

- Distinguir posição atual de histórico.
- Escolher a versão mais recente de um registro com uma função de janela.
- Ler e consultar um snapshot do dbt.
- Comparar reconstrução, incremental e snapshot.
- Ver por que uma chave incremental com medidas transforma correções em duplicatas.

## Exemplo 1: a versão mais recente de cada registro

Quando uma tabela recebe várias observações do mesmo registro, a posição atual é a observação mais recente de cada um. A função de janela `row_number` resolve isso:

```sql
with observacoes(id, valor_global, observado_em) as (
    values ('101', 120000.00, timestamp '2026-10-01 08:00'),
           ('101', 132000.00, timestamp '2026-10-03 08:00'),
           ('102',  45500.50, timestamp '2026-10-01 08:00')
), ordenadas as (
    select *,
           row_number() over (partition by id order by observado_em desc) as posicao
    from observacoes
)
select id, valor_global, observado_em
from ordenadas
where posicao = 1
order by id;
```

```text
 id  | valor_global |    observado_em
-----+--------------+---------------------
 101 |    132000.00 | 2026-10-03 08:00:00
 102 |     45500.50 | 2026-10-01 08:00:00
```

Leia de dentro para fora: `partition by id` separa as observações de cada contrato; `order by observado_em desc` põe a mais recente primeiro; `row_number()` numera 1, 2, 3… dentro de cada contrato; o `where posicao = 1` fica com a primeira.

Dois cuidados. Se duas observações tiverem o mesmo horário, a escolha entre elas fica arbitrária: acrescente um desempate ao `order by`, como a ordem de carga. E só descarte observações depois de confirmar que são **versões do mesmo registro**, e não eventos diferentes que por acaso têm o mesmo identificador (dois pagamentos do mesmo empenho, por exemplo).

## Exemplo 2: consultar um snapshot

Um **snapshot** do dbt compara, a cada execução de `dbt snapshot`, o estado atual de uma tabela com o que já guardou. Quando um registro muda, ele fecha a versão anterior e abre uma nova. Cada versão ganha duas colunas: `dbt_valid_from`, quando ela passou a valer, e `dbt_valid_to`, quando deixou de valer (nula para a versão atual).

Crie um snapshot de estudo com o caso do contrato 101:

```sql
create table estudo_modelagem.contratos_snapshot as
select * from (values
    ('101', 120000.00, timestamp '2026-10-01 08:00', timestamp '2026-10-03 08:00'),
    ('101', 132000.00, timestamp '2026-10-03 08:00', null::timestamp),
    ('102',  45500.50, timestamp '2026-10-01 08:00', null::timestamp)
) as s(id, valor_global, dbt_valid_from, dbt_valid_to);
```

A posição em 02/10, ao meio-dia, é a versão que já tinha começado e ainda não tinha terminado:

```sql
select id, valor_global
from estudo_modelagem.contratos_snapshot
where dbt_valid_from <= timestamp '2026-10-02 12:00'
  and (dbt_valid_to > timestamp '2026-10-02 12:00' or dbt_valid_to is null)
order by id;
```

```text
 id  | valor_global
-----+--------------
 101 |    120000.00
 102 |     45500.50
```

E a posição atual é a versão ainda aberta:

```sql
select id, valor_global
from estudo_modelagem.contratos_snapshot
where dbt_valid_to is null
order by id;
```

```text
 id  | valor_global
-----+--------------
 101 |    132000.00
 102 |     45500.50
```

Repare no intervalo: o início entra (`<=`) e o fim não entra (`>`). Assim, no instante exato da troca, só uma versão vale.

Duas limitações que precisam constar na documentação de quem consome. Primeira: as datas são do **pipeline**, não do negócio. `dbt_valid_from` é quando o snapshot percebeu a mudança, não a data de assinatura do aditivo. Segunda: o snapshot só vê o que existe quando ele roda. Se o valor mudou duas vezes entre duas execuções, o estado intermediário nunca foi guardado.

## Três estratégias de atualização

| Estratégia | O que guarda | Quando considerar | O que precisa estar decidido |
|---|---|---|---|
| Reconstrução completa (`table`) | Só a posição atual, recalculada do zero | O volume permite recalcular tudo a cada execução | Que a entrada ainda tem tudo de que a saída precisa |
| Incremental | Só a posição atual, atualizada por partes | O volume não permite recalcular tudo | A chave, o critério para achar mudanças e o tratamento de exclusões |
| Snapshot | Todas as versões observadas | A pergunta exige saber como o dado estava antes | A chave, as colunas monitoradas e a frequência de execução |

A reconstrução é a mais simples e a mais segura, desde que a entrada continue completa. Se a fonte deixou de mandar um estado antigo, reconstruir não o recupera. A incremental é uma otimização da reconstrução, não uma forma de guardar histórico. Só o snapshot guarda versões.

## Incremental: a chave decide se uma correção atualiza ou duplica

Numa tabela incremental, cada execução traz registros e os **mescla** com os que já estão gravados: se a chave já existe, atualiza; se não existe, insere. O dbt faz isso com `incremental_strategy="merge"` e `unique_key`. O SQL abaixo faz o equivalente com `insert ... on conflict`, para você ver o efeito.

Primeiro, uma tabela cuja chave inclui o valor pago:

```sql
create table estudo_modelagem.empenhos_chave_com_valor (
    ne text,
    despesas_pagas numeric(15, 2),
    primary key (ne, despesas_pagas)
);

insert into estudo_modelagem.empenhos_chave_com_valor values
    ('2026NE000101', 30000.00), ('2026NE000102', 20000.00);

-- carga do dia seguinte: o pagamento do 2026NE000102 foi corrigido para 22.000,00
insert into estudo_modelagem.empenhos_chave_com_valor values
    ('2026NE000101', 30000.00), ('2026NE000102', 22000.00)
on conflict (ne, despesas_pagas) do update set despesas_pagas = excluded.despesas_pagas;

select ne, despesas_pagas from estudo_modelagem.empenhos_chave_com_valor order by ne, despesas_pagas;
```

```text
      ne      | despesas_pagas
--------------+----------------
 2026NE000101 |       30000.00
 2026NE000102 |       20000.00
 2026NE000102 |       22000.00
```

O empenho 2026NE000102 agora tem duas linhas, e o total pago virou 72.000,00. A chave `(ne, despesas_pagas)` com o valor novo **não existia**, então a correção foi inserida como um registro novo, e a linha antiga ficou.

Agora com a chave só no identificador do empenho:

```sql
create table estudo_modelagem.empenhos_chave_ne (
    ne text primary key,
    despesas_pagas numeric(15, 2)
);

insert into estudo_modelagem.empenhos_chave_ne values
    ('2026NE000101', 30000.00), ('2026NE000102', 20000.00);

insert into estudo_modelagem.empenhos_chave_ne values
    ('2026NE000101', 30000.00), ('2026NE000102', 22000.00)
on conflict (ne) do update set despesas_pagas = excluded.despesas_pagas;

select ne, despesas_pagas from estudo_modelagem.empenhos_chave_ne order by ne;
```

```text
      ne      | despesas_pagas
--------------+----------------
 2026NE000101 |       30000.00
 2026NE000102 |       22000.00
```

Uma linha por empenho, total de 52.000,00. A chave identifica **o registro**, e o valor é um atributo que pode mudar. Leia a regra assim: **a chave responde "qual registro é este?", nunca "qual é o valor dele?"** A aula [Cargas completas, incrementais e idempotência](engenharia-idempotencia.md), no nível 4, mostra o erro oposto: uma chave com colunas de menos, que faz registros diferentes se sobrescreverem.

Ao terminar, apague as tabelas de estudo desta seção:

```sql
drop table estudo_modelagem.contratos_snapshot,
           estudo_modelagem.empenhos_chave_com_valor,
           estudo_modelagem.empenhos_chave_ne;
```

Dois cuidados que valem para toda incremental. Se o modelo só lê o que chegou **depois da última carga**, correções em registros antigos nunca são lidas; prefira uma janela de reprocessamento (por exemplo, os últimos 30 dias). E o merge não apaga nada: um registro que a fonte excluiu continua na tabela até alguém tratar a exclusão explicitamente.

## No código do Gov Hub: a chave do `empenhos_tesouro`

O modelo bronze `contratos_dbt/bronze/empenhos_tesouro.sql` é incremental (herda da pasta) e declara:

```sql
{{
    config(
        unique_key=[
            "ne_ccor",
            "natureza_despesa",
            "natureza_despesa_detalhada",
            "doc_observacao",
            "ne_ccor_ano_emissao",
            "emissao_dia",
            "emissao_mes",
            "despesas_empenhadas",
            "despesas_liquidadas",
            "despesas_pagas",
        ],
        incremental_strategy="merge",
    )
}}
```

As três últimas colunas da chave são medidas. Pelo que você acabou de ver, se a fonte corrigir o valor pago de uma linha já carregada, o merge não encontra a linha antiga e insere uma nova ao lado dela. Se isso acontece de fato depende de como o Tesouro Gerencial entrega os dados: se cada linha for um retrato que não muda, a chave funciona; se valores de linhas antigas puderem ser corrigidos, ela duplica. É uma pergunta para a fonte, e uma consulta no banco ajuda a respondê-la. Ela procura linhas com a mesma identificação e medidas diferentes:

```sql
select ne_ccor, natureza_despesa, natureza_despesa_detalhada, doc_observacao,
       ne_ccor_ano_emissao, emissao_dia, emissao_mes, count(*) as versoes
from contratos.empenhos_tesouro
group by 1, 2, 3, 4, 5, 6, 7
having count(*) > 1;
```

Cada linha do resultado é um empenho que aparece com mais de um conjunto de valores. Se a consulta falhar com `column "natureza_despesa_detalhada" does not exist`, a sua tabela é anterior a uma mudança do modelo; a seção seguinte explica por quê. O modelo também não tem filtro `is_incremental()`: cada execução lê a raw inteira e mescla tudo. Isso evita perder correções retroativas, à custa de processar tudo a cada vez.

### Quando o modelo muda, a tabela incremental não muda sozinha

Em **12/06/2026**, o [commit c89883c](https://github.com/GovHub-br/data-application-gov-hub/commit/c89883cc2e39bcff9286116a3ba49119957b392b) acrescentou `natureza_despesa_detalhada` ao modelo e à chave do `empenhos_tesouro`. Duas linhas com o mesmo empenho e naturezas detalhadas diferentes são registros legítimos, e a chave antiga as tratava como um só.

O que nem sempre se percebe: uma tabela incremental **já criada** não é recriada quando o modelo muda. O padrão do dbt para colunas novas num incremental é `on_schema_change: ignore`, e, no projeto, só o modelo `metadata/models_metadata.sql` muda esse padrão. Num banco local verificado durante a escrita desta aula, `contratos.empenhos_tesouro` ainda não tinha a coluna `natureza_despesa_detalhada`, meses depois do commit. Confira no seu:

```sql
select column_name
from information_schema.columns
where table_schema = 'contratos'
  and table_name = 'empenhos_tesouro'
  and column_name = 'natureza_despesa_detalhada';
```

Nenhuma linha quer dizer que a tabela é anterior à mudança. Para alinhar tabela e modelo, reconstrua o incremental com `dbt run --select empenhos_tesouro --full-refresh`, que apaga e recria a tabela a partir da raw. Antes, confirme duas coisas: que a raw ainda tem todo o período de que a tabela precisa e que os modelos seguintes serão executados de novo. O [guia de reprocessamento](../guias/engenharia-reprocessamento.md), no nível 4, detalha esse cuidado.

## Os snapshots do projeto

Em `snapshots/tables_snapshot.yml`, o projeto define quatro snapshots. O de contratos:

```yaml
- name: contratos_snapshot
  relation: ref('contratos')
  config:
    schema: snapshots
    database: analytics
    unique_key: id
    strategy: check
    check_cols: [situacao, num_parcelas, valor_parcela, valor_global, valor_acumulado]
```

Leia assim: a cada `dbt snapshot`, para cada `id` de contrato, compare as cinco colunas listadas com a versão guardada; se alguma mudou, feche a versão antiga e abra uma nova. Uma mudança no nome do fornecedor **não** gera versão, porque essa coluna não está em `check_cols`. O aditivo do nosso exemplo geraria, porque muda `valor_global`.

| Estratégia de snapshot | Como percebe a mudança | Quando usar |
|---|---|---|
| `check` | Compara as colunas listadas | A fonte não tem uma data confiável de atualização |
| `timestamp` | Compara uma coluna de data de atualização da fonte | A fonte informa, de forma confiável, quando cada registro mudou |

O [commit bee3bad, de 22/04/2025](https://github.com/GovHub-br/data-application-gov-hub/commit/bee3bad4722648b6a5042336f63e86f997316ed2), trocou `timestamp` por `check` nos quatro snapshots e definiu as colunas monitoradas. A mensagem ("Consertando config") não explica o motivo. O diff mostra a troca do mecanismo e, no snapshot de empenhos, a ampliação da chave para `[id, contrato_id]`.

Antes de executar `dbt snapshot`, confira a versão do dbt com `dbt --version`. Esse formato de arquivo, com `relation:` no YAML, exige dbt 1.9 ou posterior, e o `requirements.txt` do repositório fixa `dbt-postgres==1.7.13`. No nível 2, você ajustou o `database` desses snapshots para o banco local.

## Erros comuns

| Sintoma | Causa provável | Como evitar |
|---|---|---|
| Ninguém consegue dizer o valor de um mês fechado | Só existe a posição atual | Snapshot das colunas que a auditoria precisa |
| Uma correção virou duas linhas e o total cresceu | Medida dentro da chave incremental | Chave só com o que identifica o registro |
| Correções antigas nunca chegam à tabela | Incremental lê só o que é novo | Janela de reprocessamento |
| Coluna nova do modelo não aparece no banco | Tabela incremental criada antes da mudança | `--full-refresh` planejado depois de mudar colunas ou chave |
| O snapshot não registrou uma mudança | A coluna não está em `check_cols`, ou mudou duas vezes entre execuções | Revise `check_cols` e a frequência do `dbt snapshot` |

## Confira o que entendeu

1. Uma tabela incremental está atualizada até hoje. Ela permite responder qual era o valor de um contrato no mês passado?
2. Por que `despesas_pagas` não deveria fazer parte da chave de uma tabela de empenhos?
3. O contrato 101 mudou de valor às 10h e de novo às 15h do mesmo dia. O `dbt snapshot` roda uma vez por dia, às 8h. Quantas versões novas aparecem no dia seguinte?
4. Você acrescentou uma coluna a um modelo incremental e rodou `dbt run`. A coluna não aparece na tabela. Por quê, e o que fazer?

## Respostas comentadas

1. Não. Ela guarda só a posição atual de cada registro; o valor anterior foi substituído pelo merge. Para responder sobre o passado, é preciso um snapshot, ou uma tabela de eventos com data.
2. Porque a chave identifica o registro, e o valor pago é um atributo que pode ser corrigido. Com o valor na chave, uma correção é tratada como registro novo, e a linha antiga continua somando.
3. Uma. O snapshot vê só o estado das 8h do dia seguinte (o valor das 15h); o estado das 10h nunca foi observado.
4. Porque a tabela incremental já existia e o padrão do dbt para colunas novas é ignorá-las (`on_schema_change: ignore`). Planeje um `dbt run --select modelo --full-refresh`, depois de confirmar que a entrada ainda tem todo o período, ou configure `on_schema_change` no modelo.

## Veja também

- [Onde mora cada regra: modelos, macros e reutilização no dbt](engenharia-modelos-reutilizaveis.md)
- [Validar e entregar uma camada confiável](../guias/engenharia-entrega-camada.md)
