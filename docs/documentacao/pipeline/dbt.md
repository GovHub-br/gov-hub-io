# dbt

O dbt transforma e documenta os dados analíticos do GovHub BR. No repositório principal, os projetos dbt ficam dentro do Airflow, em `airflow_lappis/dags/dbt/`, para serem orquestrados pelo Astronomer Cosmos.

## Projetos atuais

| Projeto | Caminho | Domínios principais |
| --- | --- | --- |
| `ipea` | `airflow_lappis/dags/dbt/ipea` | contratos, pessoas, TED, orçamento, SisBolsas, metadados |
| `mir` | `airflow_lappis/dags/dbt/mir` | emendas, dados abertos, SICONV, empenhos TED, metadados |

Cada projeto tem seu próprio `dbt_project.yml`, `profiles.yml`, `models/`, `macros/`, `seeds/` e, quando aplicável, `snapshots/`.

```text
airflow_lappis/dags/dbt/
  ipea/
    models/
      contratos_dbt/
      pessoas_dbt/
      ted_dbt/
      orcamento_dbt/
      sistema_sisbolsas/
      metadata/
    macros/
    seeds/
    snapshots/
    cosmos_dag.py
  mir/
    models/
      dados_abertos_dbt/
      emendas_dbt/
      empenhos_ted_dbt/
      siconv_dbt/
      metadata/
    macros/
    seeds/
    tests/
    cosmos_dag.py
```

## Orquestração com Cosmos

Os projetos `ipea` e `mir` são executados por DAGs Cosmos:

| Projeto | DAG |
| --- | --- |
| `ipea` | `ipea_cosmos_dag` |
| `mir` | `mir_cosmos_dag` |

As DAGs resolvem os caminhos via `AIRFLOW_REPO_BASE`, apontando para os arquivos do projeto dentro do ambiente Airflow.

```python
profile_config = ProfileConfig(
    profiles_yml_filepath=f"{os.environ['AIRFLOW_REPO_BASE']}/dags/dbt/ipea/profiles.yml",
    profile_name="ipea",
    target_name="prod",
)
```

Cada DAG também configura `DBT_LOG_PATH_ENVVAR` com um diretório próprio em
`/tmp`. Mantenha essa configuração ao alterar a orquestração, pois execuções
paralelas podem disputar o mesmo arquivo de log.

## Conexão PostgreSQL

Os `profiles.yml` atuais usam variáveis de ambiente com defaults locais:

```yaml
ipea:
  target: prod
  outputs:
    prod:
      type: postgres
      host: "{{ env_var('DB_DW_HOST', 'postgres') }}"
      user: "{{ env_var('DB_DW_USER', 'postgres_dw') }}"
      password: "{{ env_var('DB_DW_PASSWORD', 'postgres_dw') }}"
      port: "{{ env_var('DB_DW_PORT', '5432') | int }}"
      dbname: "{{ env_var('DB_DW_DBNAME', 'data_warehouse') }}"
      schema: "{{ env_var('DB_DW_SCHEMA', 'ipea') }}"
```

O projeto `mir` segue o mesmo padrão, com variáveis `DB_DW_*_MIR`.

## Camadas e organização

Cada domínio organiza seus modelos por camadas quando aplicável:

```text
models/<dominio>_dbt/
  bronze/
  silver/
  gold/
  views/
  schema.yml
```

Nem todo domínio possui todas as camadas. Ao criar modelos novos, siga a estrutura existente do domínio mais próximo.

## Macros importantes

| Macro | Uso |
| --- | --- |
| `safe_casts.sql` | conversões seguras de tipos |
| `parse_financial_value.sql` | normalização de valores financeiros |
| `data_quality/row_count_match.sql` | verificação de contagem entre camadas |
| `data_quality/verificacao_tipagem.sql` | validação de tipos |
| `metadata/generate_metadata.sql` | geração de metadados de modelos |
| `udfs/f_parse_dates.sql` | parse de datas |
| `udfs/f_format_nc.sql` | formatacao de notas de credito |

## Comandos úteis

Execute os comandos dentro do projeto alterado:

```bash
cd airflow_lappis/dags/dbt/ipea

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
