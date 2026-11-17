# Onde mora cada regra: modelos, macros e reutilização no dbt

> Tipo: **Explicação**

## Duas conversões para o mesmo formato

O Gov Hub recebe valores em reais como texto no formato brasileiro, `'1.234,56'`, de várias fontes. Na revisão atual, o projeto converte esse texto em número de duas formas:

- Em `contratos_dbt/bronze/contratos.sql` e `faturas.sql`, com a expressão escrita à mão que você usou na base de estudo: `replace(replace(valor, '.', ''), ',', '.')`.
- Em cinco outros modelos, de contratos, TED e orçamento, com a macro `parse_financial_value`.

Para `'1.234,56'`, as duas dão o mesmo resultado. Para um texto vazio, uma interrompe a carga com erro e a outra devolve **zero**. Duas regras para a mesma coisa, que discordam justamente nos casos difíceis.

Esta aula trata de onde cada regra deve morar para ser escrita uma vez, revisada uma vez e mudada num só lugar, e do que é preciso saber antes de reutilizar uma regra que outra pessoa escreveu.

![A macro parse_financial_value é usada por cinco modelos bronze: empenhos_tesouro, de contratos; pagamentos_ob_bolsa, bolsas_pagas e nc_tesouro, de TED; e visao_orcamentaria_total, de orçamento. Os modelos contratos e faturas convertem o mesmo formato com uma expressão escrita no próprio arquivo. Uma tabela compara as duas regras: para 1.234,56, as duas dão 1234.56; para um texto vazio, a macro dá 0.00 e a expressão manual dá erro; para nulo, 0.00 e nulo; para (1.234,56), -1234.56 e erro; e, para 1234.56 com ponto decimal, as duas dão 123456.00.](../../assets/diagramas/engenharia-dbt-reutilizacao.png)

## O que você vai aprender

- Escolher entre CTE, modelo, macro e seed para guardar uma regra.
- Ler uma macro e descobrir as decisões que ela carrega.
- Ver o SQL que o dbt gera a partir de uma macro.
- Medir quem é afetado antes de mudar um modelo ou uma macro.

## Quatro lugares para uma regra

| Onde a regra mora | Use quando | Exemplo no Gov Hub |
|---|---|---|
| CTE dentro do modelo | A etapa só faz sentido naquele modelo | `valores_pagos_contratos`, dentro de `contratos_resumo` |
| Modelo próprio | O resultado tem significado próprio e outros modelos vão lê-lo | `contratos_empenhos`, lido pela gold e por outros modelos |
| Macro | A mesma expressão SQL se repete em vários modelos | `parse_financial_value`, `sisbolsas_bolsista_ativo` |
| Seed | Uma tabela pequena de referência, mantida à mão e versionada | `seeds/estados_brasil.csv`, com as 27 UFs |

Dois recursos completam a ligação entre esses lugares. `source('compras_gov', 'contratos')` aponta para uma tabela que a ingestão gravou fora do dbt. `ref('contratos')` aponta para outro modelo e **registra a dependência**, e é por ela que o dbt sabe a ordem de execução e quem será afetado por uma mudança. Escrever o nome da tabela direto no SQL (`from contratos.contratos`) funciona, mas esconde a dependência. A mecânica dos dois está na aula [Transformação](engenharia-transformacao.md), no nível 4; aqui, a pergunta é onde cada regra deve ficar.

Um critério prático para a macro: **repetir uma vez é aceitável; na terceira, extraia.** E extraia só o que tem um nome. "Converter valor em reais do formato brasileiro" tem nome; um pedaço qualquer de SQL que por acaso se repete, não.

## Exemplo resolvido: ler as decisões de uma macro

A macro real, em `macros/parse_financial_value.sql`:

```sql
{% macro parse_financial_value(column_name) %}

    case
        when {{ column_name }} is null or trim({{ column_name }}) = ''
        then 0.00::numeric(15, 2)
        when {{ column_name }} like '%NaN%'
        then 0.00::numeric(15, 2)
        when {{ column_name }} like '(%'
        then
            regexp_replace(
                replace(coalesce({{ column_name }}, '0'), '.', ''),
                '(\()?(\d+),(\d+)(\))?',
                '-\2.\3'
            )::numeric(15, 2)
        else
            replace(
                replace(coalesce({{ column_name }}, '0'), '.', ''), ',', '.'
            )::numeric(15, 2)
    end

{% endmacro %}
```

Uma macro é um **gerador de SQL**. O dbt substitui `{{ column_name }}` pelo nome da coluna e envia o `case` resultante ao PostgreSQL. Por isso dá para testá-la sem dbt: basta escrever o SQL que ela gera. Rode no seu cliente SQL, com a macro já expandida para uma coluna chamada `valor`:

```sql
with entradas(valor) as (
    values ('1.234,56'), ('(1.234,56)'), ('NaN'), (''), (null), ('1234.56')
)
select
    coalesce(valor, '(nulo)') as entrada,
    case
        when valor is null or trim(valor) = ''
        then 0.00::numeric(15, 2)
        when valor like '%NaN%'
        then 0.00::numeric(15, 2)
        when valor like '(%'
        then
            regexp_replace(
                replace(coalesce(valor, '0'), '.', ''),
                '(\()?(\d+),(\d+)(\))?',
                '-\2.\3'
            )::numeric(15, 2)
        else
            replace(
                replace(coalesce(valor, '0'), '.', ''), ',', '.'
            )::numeric(15, 2)
    end as com_a_macro
from entradas;
```

```text
  entrada   | com_a_macro
------------+-------------
 1.234,56   |     1234.56
 (1.234,56) |    -1234.56
 NaN        |        0.00
            |        0.00
 (nulo)     |        0.00
 1234.56    |   123456.00
```

Executando a expressão manual com as mesmas entradas, uma de cada vez (porque um erro interrompe a consulta inteira), o quadro completo fica assim:

| Entrada | Macro `parse_financial_value` | Expressão manual de `contratos.sql` |
|---|---|---|
| `'1.234,56'` | 1234.56 | 1234.56 |
| `'(1.234,56)'` | -1234.56 | erro: `invalid input syntax for type numeric: "(1234.56)"` |
| `'NaN'` | 0.00 | NaN |
| `''` (vazio) | 0.00 | erro: `invalid input syntax for type numeric: ""` |
| nulo | 0.00 | nulo |
| `'1234.56'` | 123456.00 | 123456.00 |

Leia a macro como uma lista de decisões, uma por linha do `case`:

1. **Vazio e nulo viram zero.** Para um relatório financeiro em que a célula vazia significa "sem movimento", pode ser exatamente o certo. Mas é o oposto da regra da nossa especificação ("nulo quer dizer nenhum empenho associado, não zero"). Quem reutiliza a macro herda a decisão, saiba ou não.
2. **`NaN` vira zero.** Um valor inválido some sem aviso. A expressão manual o deixa passar como `NaN`, que contamina somas: qualquer soma com um `NaN` dá `NaN`.
3. **Parênteses viram sinal negativo**, a convenção contábil para valores negativos. A expressão manual não conhece essa convenção e interrompe a carga.
4. **As duas supõem o formato brasileiro.** Se a fonte passar a mandar `'1234.56'`, as duas devolvem 123456.00, cem vezes o valor, sem erro nenhum. O projeto tem outra macro, `safe_numeric`, em `macros/safe_casts.sql`, para o formato com ponto decimal. Escolha a macro **pelo formato da fonte**, não pelo nome.

Nada disso está errado em si. O problema é ter duas regras para o mesmo formato, com decisões diferentes, sem que ninguém tenha escolhido as diferenças. Se `contratos.sql` passasse a usar a macro, os contratos ganhariam o tratamento de parênteses e de vazio, e as ausências virariam zero. Essa troca é uma decisão de especificação, não uma limpeza de código.

## Uma regra de negócio também pode ser macro

`sisbolsas_bolsista_ativo`, que você conheceu na aula de [planejamento](engenharia-planejamento-modelos.md), guarda uma regra de negócio, e não de formato. Ela é usada em dois modelos silver:

```sql
-- sistema_sisbolsas/silver/bolsistas.sql
{{ sisbolsas_bolsista_ativo("b.co_situacao_bolsista") }} as is_ativo,

-- sistema_sisbolsas/silver/bolsistas_diversidade.sql
where {{ sisbolsas_bolsista_ativo("b.co_situacao_bolsista") }}
```

Quando o Ipea confirmar (ou não) a inclusão da situação 3, a mudança acontece num arquivo e vale para os dois modelos. Antes do commit que criou a macro, `bolsistas` decidia o que era ativo pela data de término e `bolsistas_diversidade` não filtrava ativos, e os painéis divergiam dos números do Ipea.

Lembre que essas chaves duplas só existem dentro de um projeto dbt. Colado no SQL Lab do Superset ou num cliente SQL, `{{ sisbolsas_bolsista_ativo(...) }}` é um erro de sintaxe.

## Ver o SQL que o dbt gera

Para conferir o que uma macro produziu num modelo real, compile o modelo no diretório dbt:

<!-- explica: Gera o SQL final do modelo `empenhos_tesouro`, com as macros e o Jinja já substituídos, e o salva na pasta `target/`, sem rodar nada no banco. -->

```bash
dbt compile --select empenhos_tesouro
```

O SQL expandido fica em `target/compiled/ipea/models/contratos_dbt/bronze/empenhos_tesouro.sql`, com um `case` completo no lugar de cada chamada da macro. É assim que se revisa uma mudança de macro: comparando o SQL compilado antes e depois.

## Antes de mudar, meça o impacto

Uma mudança num modelo afeta todos os que o leem, direta ou indiretamente. O dbt lista esses modelos:

<!-- explica: Lista, sem executar nada, o modelo `contratos` e todos os modelos que leem dele, direta ou indiretamente: é a lista do que uma mudança em `contratos` pode afetar. -->

```bash
dbt ls --select contratos+ --resource-type model
```

O `+` **depois** do nome pede o modelo e tudo que depende dele. Na revisão atual, a lista tem 11 modelos: o próprio `contratos`, quatro silvers e três golds de contratos, as duas visões auxiliares e um modelo de **outro domínio**, `pessoas_dbt.silver.terceirizados_ativos`, que cruza os terceirizados com os contratos ativos. Uma mudança em `contratos.sql` pode alterar um painel de pessoas.

Para uma macro, o grafo do dbt não ajuda da mesma forma, porque a macro não é um nó com dependentes. Procure os usos no código:

<!-- explica: Procura o nome da macro em todos os arquivos da pasta `models`, inclusive subpastas (`-r`), e lista só o nome de cada arquivo que a usa (`-l`). -->

```bash
grep -rln "parse_financial_value" models
```

Na revisão atual, são cinco arquivos, em três domínios. Depois de mudar a macro, compile e execute os modelos afetados e confira os totais deles, antes e depois.

## Onde a configuração do modelo vem de

A materialização define como o resultado é gravado:

| Materialização | O que o dbt faz a cada execução | Custo de manutenção |
|---|---|---|
| `view` | Recria a visão; o SQL roda a cada leitura | Nenhum dado guardado; leitura mais lenta em modelos pesados |
| `table` | Reconstrói a tabela inteira | Simples de entender; custo proporcional ao volume |
| `incremental` | Processa só parte dos registros e mescla com o que já existe | Exige chave e critério de mudança; assunto da aula de [histórico](engenharia-historico.md) |

A configuração pode vir de dois lugares, e o arquivo vence a pasta. No `dbt_project.yml`, a pasta `contratos_dbt/bronze` é `incremental`; mas `contratos.sql` começa com:

```sql
{{ config(materialized="table") }}
```

Leia assim: `contratos` é reconstruído por inteiro a cada execução, embora esteja numa pasta incremental. `empenhos_tesouro`, na mesma pasta, não declara materialização e herda o `incremental`. Para saber como um modelo é gravado, leia o arquivo e a pasta, nessa ordem.

O destino físico segue a mesma lógica de camadas: o `+database` do projeto, o `schema` do perfil e a macro `generate_schema_name` decidem onde a tabela vai parar. O nível 2 alinhou esses valores ao banco local; mantenha esse alinhamento ao reutilizar modelos.

## Erros comuns

| Sintoma | Causa provável | Como evitar |
|---|---|---|
| Duas golds discordam sobre a mesma definição | A regra foi copiada, não compartilhada | Uma macro ou uma silver que as duas usem |
| Ausências viraram zero depois de uma "limpeza" | A macro reutilizada trata nulo como zero | Leia cada `when` da macro antes de usá-la |
| Valores cem vezes maiores depois de uma mudança na fonte | A conversão supõe o formato brasileiro | Teste de faixa de valores na bronze; macro escolhida pelo formato |
| `{{ ... }}` dá erro no SQL Lab | Macro usada fora do dbt | Use `dbt compile` e copie o SQL compilado |
| Um painel de outro domínio mudou sem ninguém mexer nele | Dependência que atravessa domínios | `dbt ls --select modelo+` antes de mudar |

## Confira o que entendeu

1. Uma colega quer trocar a expressão manual de `contratos.sql` pela macro `parse_financial_value`, "para padronizar". O que muda no resultado, além do código?
2. Por que não dá para testar `{{ sisbolsas_bolsista_ativo("b.co_situacao_bolsista") }}` direto no SQL Lab, e o que fazer no lugar?
3. Antes de mudar `contratos.sql`, que comando mostra quem será afetado, e por que o resultado inclui um modelo de pessoas?
4. Um modelo está na pasta `bronze/` de contratos, configurada como `incremental`, mas é reconstruído inteiro a cada execução. Como isso é possível?

## Respostas comentadas

1. Valores vazios e `NaN` passam a virar 0,00, valores entre parênteses passam a ser negativos, e nulos passam a ser zero. Na gold, um contrato sem valor informado passaria a mostrar zero. É uma mudança de regra, que precisa de decisão e de conferência dos totais, não só de revisão de código.
2. Porque as chaves duplas são resolvidas pelo dbt antes de o SQL chegar ao banco. Rode `dbt compile` no modelo e use o SQL de `target/compiled/...`, ou escreva à mão a expressão que a macro gera.
3. `dbt ls --select contratos+ --resource-type model`. O resultado inclui `terceirizados_ativos` porque esse modelo de pessoas usa `ref("contratos")` para manter só os terceirizados vinculados a contratos ativos.
4. O próprio arquivo declara `{{ config(materialized="table") }}`, e a configuração do arquivo vence a da pasta.

## Veja também

- [Tabela larga, estrela ou snowflake: escolher a forma da entrega](engenharia-arquiteturas-dados.md)
- [Posição atual e histórico: reconstrução, incremental e snapshot](engenharia-historico.md)
