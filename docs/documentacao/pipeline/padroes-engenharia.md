# Padrões de engenharia de dados

Este documento define as convenções para desenvolvimento no projeto, cobrindo DAGs do Airflow e modelos SQL/dbt. O objetivo é garantir consistência, rastreabilidade e facilidade de manutenção em um repositório com múltiplas origens de dados e times contribuindo simultaneamente.

---

## Padrões para DAGs do Airflow

### Convenção de nomenclatura

O nome da DAG segue o formato:

```
<origem>_<dominio>_<acao>
```

| Segmento | Descrição | Exemplos |
|---|---|---|
| `origem` | Sistema de origem dos dados | `siafi`, `siape`, `compras_gov`, `transfere_gov`, `pncp` |
| `dominio` | Entidade ou tema principal | `execucao_orcamentaria`, `contratos`, `servidores` |
| `acao` | O que a DAG faz | `ingestao`, `transformacao`, `snapshot` |

**Exemplos válidos:**

```
siafi_execucao_orcamentaria_ingestao
compras_gov_contratos_transformacao
siape_servidores_snapshot
transfere_gov_programas_ingestao
pncp_licitacoes_ingestao
```

O `dag_id` (nome da função decorada com `@dag`) deve ser idêntico ao nome do arquivo sem a extensão `.py`.

---

### Estrutura de diretórios

```
dags/
  data_ingest/
    <origem>/          # uma pasta por sistema de origem
      <dag>.py
  dbt/
    <projeto>/         # ipea, mir
      cosmos_dag.py
  dashboards/
    <dag>.py
```

Novas origens ganham uma pasta própria dentro de `data_ingest/`. Não criar DAGs soltas na raiz de `dags/`.

---

### Estilo de código — TaskFlow API

O projeto usa a **TaskFlow API** do Airflow (`@dag` e `@task`). Não usar o estilo clássico com `with DAG(...)`.

```python
from airflow.decorators import dag, task
from datetime import datetime, timedelta
from schedule_loader import get_dynamic_schedule

@dag(
    schedule_interval=get_dynamic_schedule("origem_dominio_acao"),
    start_date=datetime(2023, 1, 1),
    catchup=False,
    default_args={
        "owner": "nome-do-responsavel",
        "retries": 1,
        "retry_delay": timedelta(minutes=5),
    },
    tags=["origem", "dominio"],
)
def origem_dominio_acao() -> None:

    @task
    def executar(**context) -> None:
        ...

    executar()

dag_instance = origem_dominio_acao()
```

---

### Schedule dinâmico

O schedule de todas as DAGs de ingestão é definido via `get_dynamic_schedule()`, importado de `schedule_loader.py`. Não usar strings de cron ou aliases do Airflow diretamente no código da DAG.

```python
from schedule_loader import get_dynamic_schedule

@dag(
    schedule_interval=get_dynamic_schedule("nome_da_dag"),
    ...
)
```

O `get_dynamic_schedule()` lê a Airflow Variable `dynamic_schedules` (JSON) e retorna o schedule configurado para aquela DAG. Se não houver configuração, retorna `@daily` por padrão.

**Formato da Variable `dynamic_schedules`:**

```json
{
  "siafi_execucao_orcamentaria_ingestao": {
    "type": "cron",
    "value": "0 6 * * *"
  },
  "compras_gov_contratos_ingestao": {
    "type": "preset",
    "value": "@daily"
  },
  "siape_servidores_snapshot": {
    "type": "timedelta",
    "value": { "hours": 12 }
  }
}
```

Tipos suportados: `preset` (aliases do Airflow como `@daily`), `cron` (expressão cron), `timedelta` (objeto com campos aceitos pelo `timedelta` do Python).

---

### Configurações padrão

```python
default_args = {
    "owner": "nome-do-responsavel",  # nome da pessoa ou time responsável
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}
```

> **Nota sobre owner:** use o nome de quem é responsável pela manutenção daquela DAG. Não deixar em branco.

---

### Tags

Toda DAG deve declarar ao menos as tags de **origem** e **domínio**. Tags de camada (`bronze`, `silver`, `gold`) são recomendadas quando aplicável.

```python
tags=["siafi", "nota_empenho"]           # mínimo
tags=["siafi", "nota_empenho", "bronze"] # recomendado para DAGs de ingestão
```

---

### Params para backfill

DAGs que suportam reprocessamento histórico devem declarar `params` com `Param`, documentando tipo e descrição:

```python
from airflow.models.param import Param

params={
    "ano_inicio": Param(
        default=None,
        type=["integer", "null"],
        title="Ano de Início",
        description="Backfill: ano inicial para reprocessamento. (type=int)",
    ),
    "ano_fim": Param(
        default=None,
        type=["integer", "null"],
        title="Ano de Fim",
        description="Backfill: ano final para reprocessamento. (type=int)",
    ),
},
```

Dentro da task, acessar via `context["params"]` e sempre definir fallback para o ano corrente:

```python
params = context["params"]
ano_inicio = params.get("ano_inicio") or datetime.now().year
ano_fim = params.get("ano_fim") or datetime.now().year
```

---

### Airflow Variables

O projeto usa três Airflow Variables principais:

| Variable | Tipo | Descrição |
|---|---|---|
| `dynamic_schedules` | JSON | Schedules por `dag_id`. Lida por `get_dynamic_schedule()`. |
| `airflow_orgao` | string | Código do órgão alvo para ingestão. |
| `airflow_variables` | YAML | Configurações por órgão (ex: `codigos_ug`). |

Sempre validar se as variáveis críticas foram encontradas antes de prosseguir:

```python
from airflow.models import Variable
import yaml

orgao_alvo = Variable.get("airflow_orgao", default_var=None)
if not orgao_alvo:
    logging.error("Variável airflow_orgao não definida!")
    raise ValueError("airflow_orgao não definida")

orgaos_config = yaml.safe_load(Variable.get("airflow_variables", default_var="{}"))
ugs_emitentes = orgaos_config.get(orgao_alvo, {}).get("codigos_ug", [])
```

---

### Conexão com PostgreSQL

Usar sempre `get_postgres_conn()` de `helpers/postgres_helpers.py`, que resolve a conexão via `PostgresHook` do Airflow. Não construir strings de conexão manualmente.

```python
from postgres_helpers import get_postgres_conn
from cliente_postgres import ClientPostgresDB

postgres_conn_str = get_postgres_conn()               # usa "postgres_default"
postgres_conn_str = get_postgres_conn("outro_conn_id") # conn_id customizado
db = ClientPostgresDB(postgres_conn_str)
```

As credenciais são gerenciadas pelas **Airflow Connections**, não por variáveis de ambiente diretamente no código.

---

### Uso de plugins e helpers

Os clientes em `plugins/` e os helpers em `helpers/` devem ser sempre reaproveitados. Não reimplementar lógica de conexão ou requisição dentro da DAG.

| Necessidade | O que usar |
|---|---|
| Conexão com PostgreSQL | `get_postgres_conn()` + `ClientPostgresDB` |
| Requisições com retry | `retry_helpers.py` |
| APIs externas | `cliente_<origem>.py` correspondente |

---

### Ordem recomendada no arquivo

```python
# 1. imports da stdlib
# 2. imports do Airflow
# 3. imports do projeto (schedule_loader, clientes, helpers)
# 4. definição da DAG com @dag
#    4a. default_args
#    4b. params (se houver)
#    4c. tasks com @task
#    4d. orquestração das tasks
# 5. instanciação: dag_instance = nome_da_dag()
```

---

### Checklist de PR — DAGs de ingestão

- [ ] Nome segue o formato `<origem>_<dominio>_<acao>`
- [ ] `dag_id` (nome da função) é idêntico ao nome do arquivo
- [ ] Usa TaskFlow API (`@dag`, `@task`)
- [ ] Schedule via `get_dynamic_schedule()`
- [ ] `default_args` inclui `owner`, `retries` e `retry_delay`
- [ ] Tags declaram ao menos origem e domínio
- [ ] `catchup=False` declarado
- [ ] `start_date` é uma data fixa
- [ ] Airflow Variables validadas antes do uso
- [ ] Conexão PostgreSQL via `get_postgres_conn()`
- [ ] Plugins e helpers existentes reaproveitados
- [ ] DAG está no diretório correto dentro de `data_ingest/<origem>/`

---

## DAGs dbt com Cosmos

Os projetos dbt (`ipea`, `mir`) são orquestrados pelo Airflow via **Astronomer Cosmos**, que converte os modelos dbt em tasks do Airflow automaticamente. O padrão é idêntico entre os dois projetos.

### Estrutura padrão

```python
import os
from datetime import datetime
from cosmos import DbtDag, ProjectConfig, ProfileConfig, ExecutionConfig
from cosmos.constants import DBT_LOG_PATH_ENVVAR

# Configurar diretório de logs do dbt
dbt_log_path = "/tmp/dbt_logs"  # NOSONAR
os.makedirs(dbt_log_path, exist_ok=True)
os.environ[DBT_LOG_PATH_ENVVAR] = dbt_log_path

profile_config = ProfileConfig(
    profiles_yml_filepath=f"{os.environ['AIRFLOW_REPO_BASE']}/dags/dbt/<projeto>/profiles.yml",
    profile_name="<projeto>",
    target_name="prod",
)

my_cosmos_dag = DbtDag(
    project_config=ProjectConfig(f"{os.environ['AIRFLOW_REPO_BASE']}/dags/dbt/<projeto>"),
    profile_config=profile_config,
    execution_config=ExecutionConfig(
        dbt_executable_path=f"{os.environ['AIRFLOW_REPO_BASE']}/.local/bin/dbt",
    ),
    schedule_interval="0 1 * * *",  # diariamente à 01:00
    start_date=datetime(2025, 1, 1),
    catchup=False,
    dag_id="<projeto>_cosmos_dag",
    default_args={"retries": 2},
)
```

### Pontos de atenção

- Caminhos resolvidos via `AIRFLOW_REPO_BASE` — não usar caminhos absolutos hardcodados.
- `target_name="prod"` aponta para o perfil de produção no `profiles.yml`. Para rodar localmente, alterar para o target local antes de testar.
- DAGs Cosmos **não usam** `get_dynamic_schedule()` — o schedule é cron direto, pois o Cosmos gerencia o ciclo de vida da DAG de forma diferente.
- `retries=2` é o padrão para DAGs dbt (diferente do `retries=1` das DAGs de ingestão).
- O comentário `# NOSONAR` no `dbt_log_path` é intencional — suprime alerta de análise estática para aquela linha. Manter ao copiar o template.

---

## Padrões SQL e dbt

### Estrutura de camadas

O projeto adota a arquitetura medallion. Cada domínio tem sua própria pasta com as camadas que forem necessárias:

```
models/
  <dominio>_dbt/
    bronze/     # dados brutos, sem transformação de negócio
    silver/     # dados tratados, tipados e enriquecidos
    gold/       # agregações e modelos analíticos finais
    views/      # views auxiliares, quando necessário
```

Não criar modelos fora dessa estrutura.

---

### Convenção de nomenclatura

**Prefixos por camada:**

| Camada | Prefixo | Exemplo |
|---|---|---|
| Bronze | `brz_` | `brz_contratos` |
| Silver | `slv_` | `slv_contratos_empenhos` |
| Gold | `gld_` | `gld_contratos_resumo` |

O nome do arquivo `.sql` deve ser idêntico ao nome do modelo (sem extensão).

**Regras gerais:**

- Sempre usar `snake_case` para nomes de modelos, colunas e aliases.
- Nomes de modelos devem ser descritivos e únicos dentro do projeto.
- Evitar abreviações que não sejam amplamente conhecidas no domínio (`nc` para nota de crédito é aceitável; abreviações inventadas não são).

---

### Padrões SQL

**Keywords em lowercase:**

O projeto usa keywords em **lowercase**. Manter consistência com os modelos existentes.

```sql
-- correto (padrão do projeto)
select
    id_contrato,
    valor_total
from {{ ref('brz_contratos') }}
where situacao = 'ATIVO'
```

**Sem SELECT \* em modelos finais:**

`select *` é aceitável dentro de CTEs intermediárias, mas o `select` final deve listar as colunas explicitamente.

**CTEs nomeadas semanticamente:**

Usar CTEs para organizar a lógica em etapas legíveis. Nomear cada CTE de acordo com o que ela representa.

```sql
with
    servidores_ativos as (
        select *
        from {{ ref('brz_lista_servidores') }}
        where situacao_vinculo = 'ATIVO_PERMANENTE'
    ),

    dados_enriquecidos as (
        select
            s.matricula,
            s.nome,
            f.cargo_efetivo
        from servidores_ativos s
        left join {{ ref('brz_dados_funcionais') }} f
            on s.matricula = f.matricula
    )

select
    matricula,
    nome,
    cargo_efetivo
from dados_enriquecidos
```

**Joins explícitos:**

Sempre declarar o tipo do join. Nunca usar joins implícitos via vírgula no `from`.

```sql
-- correto
from tabela_a a
left join tabela_b b on a.id = b.id_ref

-- incorreto
from tabela_a a, tabela_b b where a.id = b.id_ref
```

**Indentação:**

- 4 espaços por nível (não usar tabs).
- Cada coluna em sua própria linha.
- Vírgulas no início da linha nos `select` finais.

---

### Campo `dt_ingest`

Todo modelo deve propagar o campo `dt_ingest`, representando a data/hora mais recente de ingestão das tabelas fonte utilizadas. Em modelos que combinam múltiplas fontes, usar `greatest()`:

```sql
greatest(se.dt_ingest_ph, se.dt_ingest_df, se.dt_ingest_du, sd.dt_ingest) as dt_ingest
```

A descrição padrão do campo no `schema.yml`:

```yaml
- name: dt_ingest
  description: >
    Data e hora (UTC-3 Brasília) mais recente de ingestão dos dados
    das tabelas fonte utilizadas neste modelo.
```

---

### Uso de macros

O projeto possui macros reutilizáveis em `macros/`. Consultar antes de implementar lógica customizada:

| Macro | Uso |
|---|---|
| `safe_casts.sql` | Casts seguros com tratamento de nulos |
| `parse_financial_value.sql` | Normalização de valores financeiros |
| `data_quality/row_count_match.sql` | Validação de contagem entre camadas |
| `data_quality/verificacao_tipagem.sql` | Verificação de tipos de colunas |
| `metadata/generate_metadata.sql` | Geração de metadados de modelos |
| `udfs/f_parse_dates.sql` | Parse de datas em diferentes formatos |
| `udfs/f_format_nc.sql` | Formatação de notas de crédito |

---

### Schema.yml — documentação e testes

Todo modelo deve ter entrada no `schema.yml` da sua camada com `description` preenchida. Para silver e gold, documentar também as colunas principais.

**Estrutura padrão:**

```yaml
version: 2

models:
  - name: slv_servidores_completos
    description: >
      Descrição clara do que o modelo representa, de onde vêm os dados
      e qual o propósito analítico.
    meta:
      tags:
        - silver
    columns:
      - name: cpf
        description: CPF do servidor, utilizado como chave de junção entre as bases.
      - name: dt_ingest
        description: >
          Data e hora (UTC-3 Brasília) mais recente de ingestão dos dados
          das tabelas fonte utilizadas neste modelo.
```

> **Nota sobre tags:** as tags de camada (`bronze`, `silver`, `gold`) são declaradas no `schema.yml` dentro do bloco `meta.tags`, não na DAG. Manter consistência com os modelos existentes.

**Testes mínimos por camada:**

| Teste | Bronze | Silver | Gold |
|---|---|---|---|
| `not_null` em PKs | obrigatório | obrigatório | obrigatório |
| `unique` em PKs | recomendado | obrigatório | obrigatório |
| `relationships` em FKs | — | obrigatório | recomendado |
| `accepted_values` em enums | — | recomendado | obrigatório |

---

### Seeds e snapshots

- **Seeds** (`seeds/`) são arquivos CSV de referência estática (ex: `estados_brasil.csv`, `partidos_map.csv`). Não usar seeds para dados que mudam com frequência.
- **Snapshots** (`snapshots/`) capturam o histórico de mudanças de tabelas mutáveis. Documentar a estratégia de snapshot (timestamp ou check) no próprio arquivo `yml`.

---

### Checklist de PR — modelos dbt

- [ ] Nome segue o prefixo da camada (`brz_`, `slv_`, `gld_`)
- [ ] Modelo está no diretório correto dentro de `<dominio>_dbt/<camada>/`
- [ ] `schema.yml` existe com `description` e `meta.tags` preenchidos
- [ ] Colunas principais documentadas no `schema.yml`
- [ ] `dt_ingest` propagado e com descrição padrão
- [ ] `select` final lista colunas explicitamente
- [ ] Keywords em lowercase e indentação com 4 espaços
- [ ] CTEs nomeadas semanticamente
- [ ] Joins explícitos
- [ ] Macros existentes aproveitadas onde aplicável
- [ ] `dbt run` e `dbt test` passam localmente antes do PR
