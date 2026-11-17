# Prática: a bronze

> Tipo: **Tutorial**

## O que você vai construir

A **bronze** `pncp_contratos`, o primeiro modelo do domínio `pncp_dbt`, com o `schema.yml` escrito antes do SQL. Ao final, `dbt build` cria a tabela `pncp_dw.pncp_contratos` e roda nove testes.

![Os dois arquivos da bronze, em models/pncp_dbt/bronze/, e o que cada um decide. O schema.yml descreve o modelo e declara nove testes, escritos antes do SQL. O arquivo pncp_contratos.sql lê a fonte, renomeia colunas e converte tipos, sem regras. O dbt build cria pncp_dw.pncp_contratos, com 30 linhas e 26 colunas, que a role de leitura não lê, e roda os nove testes: chave única e preenchida, contagem igual à da raw e tipos esperados.](../../assets/diagramas/engenharia-base-nova-bronze.png)

## O que você vai aprender

- Por que o nome de um modelo precisa ser único no projeto inteiro.
- Qual chave de teste usar no `schema.yml`, e o que acontece com a outra.
- Converter tipos na bronze sem aplicar regras, e quando **não** usar a macro `parse_financial_value`.
- Conferir o resultado e o acesso depois que os testes passam.

## Antes de começar

- O [domínio no dbt](engenharia-base-nova-dominio.md) criado: a fonte `pncp` no `sources.yml` e o bloco `pncp_dbt` no `dbt_project.yml`.
- O mesmo terminal do dbt da prática anterior.

## Passo 1: escrever o `schema.yml` primeiro

Crie `models/pncp_dbt/bronze/schema.yml`. Ele diz **o que precisa ser verdade** antes de existir o SQL:

```yaml
version: 2

models:
  - name: pncp_contratos
    description: >
      Contratos, empenhos e outros instrumentos publicados no PNCP, como chegaram da
      API (tabela pncp.contratos), com nomes e tipos corrigidos. Uma linha por
      instrumento, identificado por numero_controle_pncp. Não aplica filtros nem regras:
      só renomeia colunas e converte tipos.
    meta:
      tags:
        - bronze
    tests:
      - row_count_match:
          source_table: pncp.contratos
          target_table: pncp_dw.pncp_contratos
      - verificacao_tipagem:
          nome_tabela: 'pncp_dw.pncp_contratos'
          nome_coluna: 'valor_global'
          tipo_esperado: 'numeric'
      - verificacao_tipagem:
          nome_tabela: 'pncp_dw.pncp_contratos'
          nome_coluna: 'data_assinatura'
          tipo_esperado: 'date'
    columns:
      - name: numero_controle_pncp
        description: Identificador do instrumento no PNCP (CNPJ-tipo-sequencial/ano).
        tests:
          - not_null
          - unique
      - name: tipo_contrato
        description: >
          Tipo do instrumento segundo o PNCP, por exemplo "Contrato (termo inicial)"
          ou "Empenho".
        tests:
          - not_null
      - name: tipo_pessoa
        description: >
          Tipo do fornecedor: PJ (pessoa jurídica), PF (pessoa física) ou PE (pessoa
          estrangeira).
        tests:
          - accepted_values:
              values: ['PJ', 'PF', 'PE']
      - name: valor_global
        description: Valor global do instrumento, em reais.
        tests:
          - not_null
      - name: data_assinatura
        description: Data de assinatura do instrumento.
        tests:
          - not_null
      - name: dt_ingest
        description: >
          Data e hora (UTC-3 Brasília) em que o registro foi gravado na camada raw.
```

Os testes vêm das aulas anteriores, cada um para uma pergunta:

| Teste | Pergunta | Origem |
|---|---|---|
| `unique` e `not_null` na chave | Cada instrumento aparece uma vez? | [Granularidade](../explicacao/engenharia-granularidade.md) |
| `row_count_match` | A bronze tem as mesmas linhas que a raw? A bronze só converte, então tem de ter | Macro do projeto, `macros/data_quality/`; usada na bronze de contratos |
| `verificacao_tipagem` | O tipo final é o esperado? Consulta o `information_schema` | Mesma pasta de macros |
| `accepted_values` | O tipo de pessoa é um dos três códigos do PNCP? | Teste nativo do dbt |
| `not_null` em valor e data | Os campos que a gold vai usar vieram preenchidos? | Especificação da [issue](../guias/engenharia-avaliar-fonte.md) |

### Dois detalhes que mudam o resultado

**O nome do modelo é único no projeto inteiro.** O nome natural, `contratos`, já existe no domínio `contratos_dbt`. Com um `schema.yml` chamando outro modelo `contratos`, o dbt para antes de rodar qualquer coisa:

```text
Compilation Error
  dbt found two schema.yml entries for the same resource named contratos. Resources and their associated columns may only be described a single time. To fix this, remove the resource entry for contratos in one of these files:
   - models/pncp_dbt/bronze/schema.yml
  models/contratos_dbt/bronze/schema.yml
```

A pasta não separa nomes: só o prefixo `pncp_` resolve, como na `pncp_contratacoes` do nível 4.

**A chave dos testes é `tests:`, não `data_tests:`.** O dbt renomeou a chave na versão 1.8, e o repositório tem as duas: `data_tests:` em 2 arquivos (as bronzes de contratos e de TED, onde ficam o `row_count_match` e o `verificacao_tipagem`) e `tests:` em 3. Mas o `requirements.txt` fixa `dbt-postgres==1.7.13`, e essa versão **ignora `data_tests:` sem avisar**. Conte os testes que o dbt enxerga num modelo:

<!-- explica: A primeira linha mostra a versão do dbt instalada, filtrando só a linha `installed`. A segunda lista os testes que o dbt encontrou ligados ao modelo `pncp_contratos` e conta quantos são: `grep -c` conta as linhas que começam com `ipea`, o nome do projeto. -->

```bash
dbt --version | grep installed
dbt ls --select pncp_contratos --resource-type test --no-populate-cache | grep -c "^ipea"
```

Com `data_tests:` no `schema.yml`, o resultado foi:

| Versão do dbt | Testes que o dbt encontra no `schema.yml` da bronze | Testes na bronze real de contratos |
|---|---|---|
| 1.7.13 | **0** | **0** |
| 1.12.0 | 9 | 47 |

Com `tests:`, as duas versões encontram os 9. Os números da bronze de contratos mostram que, numa imagem com o dbt 1.7.13, os testes declarados com `data_tests:` simplesmente não rodam. Não sei qual versão roda em produção; vale perguntar à equipe. A chave `tests:` funciona em qualquer uma.

## Passo 2: ver o dbt reclamar do arquivo sem modelo

Com o `schema.yml` pronto e nenhum SQL, rode:

<!-- explica: Pede ao dbt para listar o modelo `pncp_contratos`. Como o `schema.yml` já existe e o SQL ainda não, o dbt avisa que encontrou a descrição de um modelo que não existe. -->

```bash
dbt ls --select pncp_contratos --no-populate-cache
```

```text
[WARNING]: Did not find matching node for patch with name 'pncp_contratos' in the 'models' section of file 'models/pncp_dbt/bronze/schema.yml'
```

O dbt **não reprova**: só avisa que há uma descrição sem modelo, e nenhum teste existe ainda. Em outras ferramentas, escrever o teste antes do código dá uma falha automática. No dbt, o "vermelho" é uma disciplina sua: o `schema.yml` registra a intenção, e é você quem confere, depois, que cada linha dele virou um teste que rodou. O `dbt build` do passo 4 mostra quantos.

## Passo 3: escrever a bronze

Crie `models/pncp_dbt/bronze/pncp_contratos.sql`:

```sql
{{ config(materialized="table") }}

select
    numerocontrolepncp as numero_controle_pncp,
    numerocontrolepncpcompra as numero_controle_pncp_compra,
    cast(anocontrato as integer) as ano_contrato,
    cast(sequencialcontrato as integer) as sequencial_contrato,
    orgaoentidade__cnpj as orgao_cnpj,
    orgaoentidade__razaosocial as orgao_nome,
    unidadeorgao__codigounidade as unidade_codigo,
    unidadeorgao__nomeunidade as unidade_nome,
    unidadeorgao__ufsigla as uf_sigla,
    tipocontrato__nome as tipo_contrato,
    categoriaprocesso__nome as categoria_processo,
    tipopessoa as tipo_pessoa,
    nifornecedor as fornecedor_ni,
    nomerazaosocialfornecedor as fornecedor_nome,
    numerocontratoempenho as numero_contrato_empenho,
    objetocontrato as objeto,
    processo,
    cast(numeroparcelas as integer) as num_parcelas,
    cast(valorinicial as numeric(15, 2)) as valor_inicial,
    cast(valorglobal as numeric(15, 2)) as valor_global,
    cast(dataassinatura as date) as data_assinatura,
    cast(datavigenciainicio as date) as data_vigencia_inicio,
    cast(datavigenciafim as date) as data_vigencia_fim,
    cast(datapublicacaopncp as timestamp) as data_publicacao,
    cast(numeroretificacao as integer) as num_retificacao,
    cast(dt_ingest || '-03:00' as timestamptz) as dt_ingest
from {{ source("pncp", "contratos") }}
```

Leia assim:

- **Só renomear e converter.** Nada de `where`, `join` ou regra de negócio: é a [regra da bronze](../explicacao/engenharia-camadas.md). Os nomes da esquerda são os que o `insert_data` criou (minúsculas, `__` no lugar de objetos internos), e os da direita são nomes legíveis.
- **26 colunas das 52 da raw.** A bronze escolhe o que a base vai usar. Campos sempre nulos, como `valoracumulado`, e os que não entram em nenhuma pergunta, como `numerocontrolepncpata`, ficam na raw, e voltam se a pergunta mudar.
- **`cast(dt_ingest || '-03:00' as timestamptz)`.** A DAG gravou a hora de Brasília em texto, sem fuso; a bronze acrescenta o fuso, como todas as outras do projeto.
- **`numeric(15, 2)` para dinheiro**, como as bronzes de contratos.

### Por que não a macro `parse_financial_value`

O projeto tem a macro `parse_financial_value`, usada em cinco bronzes. Ela serve a valores no formato brasileiro (`1.234,56`): remove os pontos e troca a vírgula por ponto. O PNCP manda o ponto como separador **decimal** (`1040.64`). Veja a diferença na mesma coluna:

<!-- explica: `dbt show` roda uma consulta e mostra o resultado na tela, sem criar tabela. Esta lê três valores de `valorglobal` da raw e os mostra lado a lado: o texto original, o resultado da macro `parse_financial_value` e o de um `cast` simples para número. -->

```bash
dbt show --no-populate-cache --inline "select valorglobal as texto, {{ parse_financial_value('valorglobal') }} as pela_macro, cast(valorglobal as numeric(15,2)) as pelo_cast from {{ source('pncp','contratos') }} order by valorglobal limit 3"
```

```text
| texto   | pela_macro | pelo_cast |
| ------- | ---------- | --------- |
| 1040.64 |    104,064 |  1,040.64 |
| 11150.0 |    111,500 | 11,150.00 |
| 11500.0 |    115,000 | 11,500.00 |
```

A macro multiplicaria cada valor por 100 ou por 10, sem erro e sem aviso. Conhecer o formato da fonte vem antes de reaproveitar uma macro. Os testes da bronze não pegariam isso, e a [conferência](engenharia-base-nova-gold.md) da gold, que compara com a bronze, também não, porque os dois lados estariam errados do mesmo jeito. Só o olhar sobre o dado pega. É o que o [passo 4](#passo-4-rodar-tudo-e-olhar-o-resultado) faz.

## Passo 4: rodar tudo e olhar o resultado

<!-- explica: Constrói a bronze `pncp_contratos` e roda os testes declarados no `schema.yml` dela. Antes, o dbt executa os ganchos `on-run-start` do projeto, que criam funções no banco e concedem acesso aos schemas. -->

```bash
dbt build --select pncp_contratos --no-populate-cache
```

```text
Found 132 models, 1 seed, 2 operations, 19 tests, 132 sources, ...
1 of 2 OK hook: ipea.on-run-start.0 ............................................ [CREATE FUNCTION in 0.00s]
USAGE concedido em pncp_dw para de_postgres
2 of 2 OK hook: ipea.on-run-start.1 ............................................ [OK in 0.00s]
1 of 10 OK created sql table model pncp_dw.pncp_contratos ...................... [SELECT 30 in 0.07s]
2 of 10 PASS accepted_values_pncp_contratos_tipo_pessoa__PJ__PF__PE ............ [PASS in 0.02s]
3 of 10 PASS not_null_pncp_contratos_data_assinatura ........................... [PASS in 0.01s]
4 of 10 PASS not_null_pncp_contratos_numero_controle_pncp ...................... [PASS in 0.01s]
5 of 10 PASS not_null_pncp_contratos_tipo_contrato ............................. [PASS in 0.01s]
6 of 10 PASS not_null_pncp_contratos_valor_global .............................. [PASS in 0.01s]
7 of 10 PASS row_count_match_pncp_contratos_pncp_contratos__pncp_dw_pncp_contratos  [PASS in 0.01s]
8 of 10 PASS unique_pncp_contratos_numero_controle_pncp ........................ [PASS in 0.01s]
9 of 10 PASS verificacao_tipagem_pncp_contratos_data_assinatura__pncp_dw_pncp_contratos__date  [PASS in 0.02s]
10 of 10 PASS verificacao_tipagem_pncp_contratos_valor_global__pncp_dw_pncp_contratos__numeric  [PASS in 0.02s]
Done. PASS=10 WARN=0 ERROR=0 SKIP=0 TOTAL=10
```

Leia assim: um modelo (30 linhas) e **nove testes**, os que o `schema.yml` declarou. É a conferência do passo 2: nove linhas declaradas, nove testes executados. A linha `USAGE concedido em pncp_dw` é o `on-run-start` que a [aula do domínio](engenharia-base-nova-dominio.md) anunciou. Antes dos modelos, o aviso de "unused configuration paths" continua listando as pastas `silver` e `gold`, que ainda não têm modelos.

Agora olhe o resultado, que os testes não substituem:

<!-- explica: Mostra as duas primeiras linhas da bronze, com a chave, o valor, a data de assinatura e a hora da carga, para conferir que cada coluna chegou com o tipo e o nome novos. -->

```bash
docker compose exec postgres psql -U postgres -c "select numero_controle_pncp, valor_global, data_assinatura, dt_ingest from pncp_dw.pncp_contratos order by numero_controle_pncp limit 2"
```

```text
     numero_controle_pncp     | valor_global | data_assinatura |           dt_ingest           
------------------------------+--------------+-----------------+-------------------------------
 33892175000100-2-000001/2026 |      1040.64 | 2026-01-19      | 2026-11-16 16:40:23.609142+00
 33892175000100-2-000002/2026 |      2475.00 | 2026-01-16      | 2026-11-16 16:40:23.609142+00
```

O valor `1040.64` da raw continua `1040.64`. A data virou `date`. O `dt_ingest` aparece em UTC porque o PostgreSQL mostra `timestamptz` no fuso da sessão, como na [aula de camadas](../explicacao/engenharia-camadas.md): a DAG gravou `13:40:23` em Brasília, e `16:40:23+00` é o mesmo instante. Os tipos confirmam o que o `verificacao_tipagem` testou:

```text
   column_name   |          data_type          
-----------------+-----------------------------
 valor_global    | numeric
 data_assinatura | date
 dt_ingest       | timestamp with time zone
```

E o acesso: a role de leitura entra no schema, mas não lê a bronze, como o bloco do domínio decidiu.

<!-- explica: Pergunta ao PostgreSQL se a role de leitura `de_postgres` pode entrar no schema `pncp_dw` (`USAGE`) e se pode ler a tabela da bronze (`SELECT`). Cada resposta vem como `t`, sim, ou `f`, não. -->

```bash
docker compose exec postgres psql -U postgres -c "select has_schema_privilege('de_postgres','pncp_dw','USAGE') as usa_schema, has_table_privilege('de_postgres','pncp_dw.pncp_contratos','SELECT') as le_bronze"
```

```text
 usa_schema | le_bronze 
------------+-----------
 t          | f
```

## Erros comuns

- **Nome de modelo repetido.** O erro aparece em segundos, mas a pasta não ajuda a achar o outro. Procure com `grep -rn "name: contratos" models`.
- **`data_tests:` com dbt 1.7.** Nenhum erro e nenhum teste. Sempre confira a contagem com `dbt ls --resource-type test`.
- **Regra na bronze.** Um `where tipo_pessoa = 'PJ'` aqui esconderia da raw o que a fonte mandou, e o `row_count_match` reprovaria.

## O que você aprendeu

- O nome de um modelo é único no projeto inteiro; prefixe com a fonte quando o nome natural já existir.
- Com o dbt 1.7.13, a chave de testes é `tests:`; confira sempre quantos testes o dbt enxerga.
- A bronze só renomeia e converte, e a conversão segue o formato da **fonte**, e não o da macro mais próxima.
- Testes verdes não dispensam olhar o resultado.

## Confira o que entendeu

1. Você declarou nove testes no `schema.yml`, rodou `dbt build` e viu `PASS=1`. O que provavelmente aconteceu, e como confirmar?
2. A bronze usou a macro `parse_financial_value` e todos os testes passaram. Por que ainda assim há um problema, e qual teste da bronze o pegaria?

## Respostas comentadas

1. O modelo rodou, mas os testes não foram reconhecidos. O motivo provável é a chave: `data_tests:` com dbt 1.7.13. Para confirmar, rode `dbt --version` e `dbt ls --select pncp_contratos --resource-type test`: zero testes encontrados confirma. A correção é trocar para `tests:`.
2. A macro remove os pontos, e o PNCP usa ponto como decimal: `1040.64` vira `104064`. O resultado ainda é um `numeric`, preenchido e único, e todos os testes passam. Nenhum teste da bronze o pega, porque nenhum compara o valor com a fonte. Só olhar os números, ou conferir um total contra a fonte original, mostra o problema. A [conferência da gold](engenharia-base-nova-gold.md) compara com a bronze, e por isso também não pegaria; é mais um motivo para olhar o resultado.

## Próximos passos

- [Prática: a silver, com privacidade e junção](engenharia-base-nova-silver.md)
- [Definir as responsabilidades de cada camada](../explicacao/engenharia-camadas.md)
