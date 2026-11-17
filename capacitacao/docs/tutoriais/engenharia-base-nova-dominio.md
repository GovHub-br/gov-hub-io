# Prática: o domínio no dbt

> Tipo: **Tutorial**

## O que você vai construir

Os dois arquivos que preparam o dbt para a base nova, antes de qualquer modelo: a **fonte** que aponta para a raw `pncp.contratos` e o **domínio** `pncp_dbt` no `dbt_project.yml`. Ao final, o dbt enxerga a fonte, lê por ela as 30 linhas que a DAG gravou e está pronto para receber os modelos da próxima aula.

![Os dois arquivos desta aula. O sources.yml declara a fonte pncp, tabela contratos, e aponta para a raw no schema pncp: as 30 linhas gravadas pela DAG, tudo em texto. O bloco pncp_dbt do dbt_project.yml decide que os modelos são tabelas, no schema pncp_dw, com permissões por camada: ninguém lê a bronze, e a role de leitura, usada pelo Superset, lê a silver e a gold. Um aviso explica por que o domínio não usa o schema pncp: a bronze nasceria nele e substituiria a raw da DAG, e num teste a tabela passou de 52 para 26 colunas.](../../assets/diagramas/engenharia-base-nova-dominio.png)

A [prática do nível 4](engenharia-dbt-camadas.md) fez algo parecido com arquivos de estudo, que não entravam em commit. Aqui os arquivos são os de verdade: seguem os nomes e as pastas que o repositório espera, e cada escolha tem um motivo que aparece na revisão.

## O que você vai aprender

- Declarar uma fonte no `sources.yml` compartilhado do projeto.
- Criar o bloco de um domínio novo, com schema, materialização e permissões por camada.
- Escolher um schema que não colida com a raw.
- O que o projeto faz sozinho e o que depende de você.

## Antes de começar

- A raw `pncp.contratos` gravada, com 30 linhas, da [prática da DAG](engenharia-base-nova-dag.md).
- O terminal do dbt preparado como no [passo 0 da prática do nível 4](engenharia-dbt-camadas.md): dentro do container do Airflow, em `/opt/airflow/dags/dbt/ipea`, com as variáveis `DB_DW_*` exportadas, ou no terminal do computador, se você seguiu o [nível 2](../guias/engenharia-dbt-configuracao.md).
- A role de leitura criada (`make setup-roles`).

Os ajustes locais do nível 2 (`+database: postgres` e o `profiles.yml`) continuam valendo e **não entram no pull request**. Ao commitar, use `git add -p` no `dbt_project.yml` e leve só o bloco do domínio.

## Passo 1: declarar a fonte

A fonte é o nome que o dbt dá a uma tabela que ele não cria. Abra `models/sources.yml` e acrescente, antes de `dados_abertos`:

```yaml
  - name: pncp
    schema: pncp
    tables:
      - name: contratos
```

O `name` é como o modelo vai chamar a fonte, em `{{ source("pncp", "contratos") }}`. O `schema` é onde a tabela está no banco, o mesmo que a DAG usou em `insert_data`. Os dois coincidem aqui, mas são coisas distintas: veja `dados_abertos`, logo abaixo, que usa `schema: camara_deputados`.

## Passo 2: criar o bloco do domínio

Cada domínio de dados tem um bloco em `dbt_project.yml`, dentro de `models → ipea`. Copie a estrutura de `contratos_dbt` e ajuste, antes de `sistema_sisbolsas`:

```yaml
    pncp_dbt:
      +materialized: table
      +schema: pncp_dw
      bronze:
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

Cada linha decide algo:

| Linha | O que decide |
|---|---|
| `pncp_dbt` | O nome da pasta em `models/`. Tudo dentro dela herda este bloco |
| `+materialized: table` | Os modelos viram tabelas, recriadas a cada execução |
| `+schema: pncp_dw` | O schema onde os modelos serão criados |
| `bronze → select: []` | Ninguém recebe leitura da bronze. É o que a [aula de camadas](../explicacao/engenharia-camadas.md) descreveu: a bronze é para os modelos, não para o painel |
| `silver` e `gold → select: [role]` | A role de leitura (`DB_DW_READONLY_ROLE`, padrão `de_postgres`) pode ler. O Superset usa essa role |
| `views → +materialized: view` | Uma subpasta `views/` opcional, com modelos que viram visões |

### Por que o schema não é `pncp`

A raw está no schema `pncp`, e o nome mais natural para o domínio seria o mesmo. Não use. No projeto, com o destino `prod` (o do `profiles.yml`), o schema de um modelo é **só** o valor de `+schema`, sem prefixo. Se a bronze se chamasse `contratos` e o schema fosse `pncp`, o dbt criaria `pncp.contratos`, exatamente onde a DAG gravou os dados, e **substituiria a tabela da DAG pela bronze**. Testei num banco descartável: a tabela passou de 52 para 26 colunas, e as 26 que a bronze não escolhe sumiram até a próxima carga. Os domínios existentes evitam o problema porque a raw e o dbt têm schemas diferentes (`compras_gov` e `contratos`; `siafi` e `orcamento`). Por isso `pncp_dw`, como o `formacao_dw` do nível 4.

### Cuidado ao copiar um bloco

Copie de `contratos_dbt`, e não de `orcamento_dbt`: o bloco do orçamento não tem a entrada `gold`, porque o domínio só tem bronze e silver. Se você o copiasse e criasse uma gold, a role de leitura não receberia `select` nela, e o Superset não a listaria.

### O que você não precisa fazer

Duas coisas acontecem sozinhas:

- **O Cosmos** lê o projeto e cria as tarefas da DAG diária `ipea_cosmos_dag` para cada modelo novo.
- **O `USAGE` no schema novo** é concedido pelo `on-run-start`, que você verá no `dbt build` da próxima aula.

Se a role de leitura não existir, os modelos de silver e gold falham, porque o `grants` tenta concedê-la:

```text
Database Error in model pncp_contratos_tratados (models/pncp_dbt/silver/pncp_contratos_tratados.sql)
  role "de_postgres" does not exist
```

A bronze não falha, porque não concede nada. A solução é `make setup-roles`, na raiz da aplicação.

## Passo 3: conferir o que o dbt enxerga

Ainda não há modelo para rodar, mas já dá para conferir os dois arquivos. Primeiro, se o dbt reconhece a fonte e o bloco:

<!-- explica: Pede ao dbt para listar a fonte `pncp`, sem executar nada no banco, e filtra da saída só as linhas que citam `pncp`: a fonte encontrada e o aviso sobre as pastas do domínio que ainda não têm modelos. -->

```bash
dbt ls --select source:pncp --no-populate-cache 2>&1 | grep pncp
```

```text
- models.ipea.pncp_dbt.silver
- models.ipea.pncp_dbt
- models.ipea.pncp_dbt.bronze
- models.ipea.pncp_dbt.views
- models.ipea.pncp_dbt.gold
source:ipea.pncp.contratos
```

Leia assim: a última linha é a fonte, encontrada. As outras fazem parte do aviso "unused configuration paths": o bloco `pncp_dbt` existe, e as pastas dele ainda não têm modelos. É esperado, e o aviso some quando os modelos existirem. A ordem dessas linhas muda de uma execução para outra. O projeto já tem outros avisos parecidos, de outros domínios; o `grep` os deixa de fora.

Depois, se a fonte aponta para a tabela certa:

<!-- explica: `dbt show` roda uma consulta e mostra o resultado na tela, sem criar tabela. Esta conta as linhas da tabela para a qual a fonte `pncp.contratos` aponta. -->

```bash
dbt show --no-populate-cache --inline "select count(*) as linhas from {{ source('pncp', 'contratos') }}"
```

```text
Previewing inline node:
| linhas |
| ------ |
|     30 |
```

As 30 linhas da DAG. A fonte está ligada à raw, e o domínio, pronto para a bronze.

## Erros comuns

- **Schema igual ao da raw.** O primeiro `dbt build` substitui a tabela da DAG pela bronze. Dê ao domínio um schema próprio.
- **Copiar o bloco de um domínio sem gold.** A gold nasce, mas a role de leitura não a lê, e o Superset não a encontra.
- **Esquecer `make setup-roles`.** A bronze roda e a silver falha com `role "de_postgres" does not exist`.
- **Levar o `+database: postgres` para o PR.** É um ajuste local do nível 2. Use `git add -p`.

## O que você aprendeu

- Uma fonte nova entra no `sources.yml`; um domínio novo, num bloco do `dbt_project.yml`.
- O bloco decide materialização, schema e quem lê cada camada.
- O schema do domínio não pode ser o da raw, porque no projeto o dbt usa o `+schema` sem prefixo.
- O Cosmos e o `on-run-start` cuidam das tarefas diárias e do acesso ao schema; a role de leitura precisa existir.

## Confira o que entendeu

1. Alguém configurou o domínio com `+schema: pncp` e criou a bronze `contratos`. O que acontece no primeiro `dbt build`?
2. O bloco do domínio foi copiado de `orcamento_dbt`, e depois alguém criou uma gold. A gold roda sem erro. O que o Superset vê?

## Respostas comentadas

1. O dbt cria a bronze em `pncp.contratos`, a mesma tabela em que a DAG grava, e a substitui: a tabela fica só com as colunas da bronze, e as outras somem até a próxima carga. Um schema próprio, como `pncp_dw`, evita a colisão.
2. Nada. O bloco do orçamento não tem a entrada `gold` com `+grants`, então a role de leitura, que o Superset usa, não recebe `select` na tabela. Ela existe, mas não aparece para o painel. A correção é acrescentar a entrada `gold` com o `+grants`, como no bloco de `contratos_dbt`.

## Próximos passos

- [Prática: a bronze](engenharia-base-nova-bronze.md)
- [Definir as responsabilidades de cada camada](../explicacao/engenharia-camadas.md)
