# dbt

O dbt transforma e documenta os dados analíticos do GovHub BR. No repositório principal, os projetos dbt ficam dentro do Airflow, em `airflow/dags/dbt/`, para serem orquestrados pelo Astronomer Cosmos.

## Projetos atuais

| Projeto | Caminho | Domínios principais |
| --- | --- | --- |
| `gov_bricks` | `airflow/dags/dbt/gov_bricks` | macros e modelos compartilhados entre projetos |
| `compras_gov` | `airflow/dags/dbt/compras_gov` | modelos Silver de contratações, fornecedores e estrutura organizacional |
| `mgi` | `airflow/dags/dbt/mgi` | modelos Gold e recortes analíticos do MGI |

Cada projeto tem seu próprio `dbt_project.yml`, `profiles.yml`, `models/`, `macros/`, `seeds/` e, quando aplicável, `snapshots/`.

```text
airflow/dags/dbt/
  gov_bricks/
    macros/
  compras_gov/
    models/
      bronze/
      silver/
    macros/
    packages.yml
  mgi/
    models/
      gold/
    macros/
    packages.yml
  profiles.yml
```

## Orquestração com Cosmos

Os projetos dbt de órgão são executados por DAGs Cosmos em `airflow/dags/data_transform/`:

| Projeto | DAG |
| --- | --- |
| `mgi` | `mgi_transform_dag` |

As DAGs resolvem os caminhos a partir da própria estrutura de `airflow/dags/`, apontando para os projetos dbt versionados no repositório.

```python
profile_config = ProfileConfig(
    profiles_yml_filepath=DIR_DBT / "profiles.yml",
    profile_name="gov_bricks",
    target_name=os.environ.get("DBT_TARGET", "dev"),
)
```

Cada DAG também configura `DBT_LOG_PATH_ENVVAR` com um diretório próprio em
`/tmp`. Mantenha essa configuração ao alterar a orquestração, pois execuções
paralelas podem disputar o mesmo arquivo de log.

## Conexão PostgreSQL

Os `profiles.yml` atuais usam variáveis de ambiente com defaults locais:

```yaml
mgi:
  target: dev
  outputs:
    dev:
      type: postgres
      host: "{{ env_var('DB_DW_HOST', 'postgres') }}"
      user: "{{ env_var('DB_DW_USER', 'postgres_dw') }}"
      password: "{{ env_var('DB_DW_PASSWORD', 'postgres_dw') }}"
      port: "{{ env_var('DB_DW_PORT', '5432') | int }}"
      dbname: "{{ env_var('DB_DW_DBNAME', 'data_warehouse') }}"
      schema: "{{ env_var('DB_DW_SCHEMA', 'mgi') }}"
```

O `profiles.yml` é compartilhado pelos projetos dbt do monorepo e usa variáveis de ambiente para servir ao compose local, homologação e produção sem credencial versionada.

## Camadas e organização

Cada domínio organiza seus modelos por camadas quando aplicável:

```text
models/<camada_ou_dominio>/
  bronze/
  silver/
  gold/
  schema.yml
```

Nem todo domínio possui todas as camadas. Ao criar modelos novos, siga a estrutura existente do domínio mais próximo.

## Macros importantes

| Macro | Uso |
| --- | --- |
| `schema_medallion.sql` | padronização de schemas por camada |
| `chave_conformada.sql` | geração de chaves conformadas |
| `chaves_geradas.sql` | suporte a chaves derivadas |
| `testes.sql` | testes genéricos compartilhados |
| `generate_schema_name.sql` | definição de schema por projeto/camada |

## Comandos úteis

Execute os comandos dentro do projeto alterado:

```bash
cd airflow/dags/dbt/mgi

dbt debug
dbt run --select <modelo_ou_dominio>
dbt test --select <modelo_ou_dominio>
dbt docs generate
dbt docs serve --port 8081
```

Para validar o repositório inteiro pelo Makefile:

```bash
make lint
make test
```

## Critérios para PRs dbt

- Modelo no domínio e camada corretos.
- `schema.yml` atualizado com descrição de modelo e colunas principais.
- Testes `not_null`, `unique`, `relationships` ou `accepted_values` quando fizerem sentido.
- Campo `dt_ingest` propagado quando o modelo depender de tabelas ingeridas.
- `select` final sem `select *` em modelos finais.
- Macros existentes reaproveitadas antes de criar lógica nova.

Veja também [Padrões de engenharia](padroes-engenharia.md) e [Qualidade de dados](qualidade.md).
