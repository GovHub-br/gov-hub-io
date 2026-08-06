# Guia: Criar um Novo Fork Temático

Passo a passo para criar uma nova instância do pipeline GovHub para um contexto específico.

## Quando criar um fork?

Crie um fork quando:

- Há um **novo domínio de dados** (outro ministério, estado, autarquia)
- As **fontes de dados** são diferentes do pipeline federal
- Os **dashboards** precisam ser específicos para o contexto
- A **equipe** é dedicada a este contexto

Nem todo novo domínio exige uma implantação isolada:

| Cenário | Recomendação |
| --- | --- |
| Novo órgão com fontes e dashboards próprios | Fork temático |
| Prova de conceito com poucas fontes | Fork temático |
| Requisito de isolamento por compliance | Cluster separado |
| Volume ou SLA incompatível com a plataforma compartilhada | Avaliar cluster separado |

## Passo a Passo

### 1. Fork no GitHub

1. Acesse [`data-application-gov-hub`](https://github.com/GovHub-br/data-application-gov-hub)
2. Clique em **Fork**
3. Nomeie: `data-application-<contexto>` (ex: `data-application-saude`, `data-application-educacao`)
4. Mantenha na organização `GovHub-br` (ou sua própria)

### 2. Clonar e configurar

```bash
git clone git@github.com:GovHub-br/data-application-<contexto>.git
cd data-application-<contexto>

# Adicionar upstream para sincronização futura
git remote add upstream git@github.com:GovHub-br/data-application-gov-hub.git
```

### 3. Definir o isolamento dos dados

Quando o fork compartilhar a infraestrutura, use schemas próprios e uma área
de dados brutos separada:

```sql
CREATE SCHEMA IF NOT EXISTS <contexto>_silver;
CREATE SCHEMA IF NOT EXISTS <contexto>_gold;

GRANT ALL ON SCHEMA <contexto>_silver TO <usuario_pipeline>;
GRANT ALL ON SCHEMA <contexto>_gold TO <usuario_pipeline>;
```

Se a ingestão usar object storage, adote um bucket ou prefixo exclusivo, como
`bronze-<contexto>`. Não crie essa área quando a fonte for persistida apenas
no PostgreSQL.

### 4. Criar DAGs de ingestão

Crie novas DAGs em `airflow_lappis/dags/data_ingest/<origem>/` para suas fontes:

```python
# airflow_lappis/dags/data_ingest/<origem>/<sua_fonte>_ingest_dag.py

from datetime import datetime, timedelta
from airflow.decorators import dag, task
from schedule_loader import get_dynamic_schedule

@dag(
    schedule_interval=get_dynamic_schedule("<sua_fonte>_ingest_dag"),
    start_date=datetime(2025, 1, 1),
    catchup=False,
    tags=["<contexto>", "<sua_fonte>"],
    default_args={
        "owner": "nome-ou-time",
        "retries": 1,
        "retry_delay": timedelta(minutes=5),
    },
)
def sua_fonte_ingest_dag() -> None:
    @task
    def fetch_and_store() -> None:
        ...

    fetch_and_store()

dag_instance = sua_fonte_ingest_dag()
```

### 5. Criar models dbt

Siga a arquitetura Medallion:

```
airflow_lappis/dags/dbt/<projeto>/models/<dominio>_dbt/
├── bronze/
├── silver/
└── gold/
```

**Exemplo staging**:

```sql
-- airflow_lappis/dags/dbt/<projeto>/models/<dominio>_dbt/bronze/brz_minha_fonte.sql
{{ config(materialized='view') }}

SELECT *
FROM {{ source('bronze', 'minha_fonte_raw') }}
```

**Exemplo silver**:

```sql
-- airflow_lappis/dags/dbt/<projeto>/models/<dominio>_dbt/silver/slv_minha_entidade.sql
{{ config(materialized='table', schema='silver') }}

SELECT
    id,
    TRIM(nome) AS nome,
    CAST(valor AS NUMERIC(15,2)) AS valor,
    NOW() AS loaded_at
FROM {{ ref('brz_minha_fonte') }}
WHERE id IS NOT NULL
```

**Exemplo gold**:

```sql
-- airflow_lappis/dags/dbt/<projeto>/models/<dominio>_dbt/gold/gld_minha_metrica.sql
{{ config(materialized='table', schema='gold') }}

SELECT
    dimensao,
    DATE_TRUNC('month', data) AS mes,
    COUNT(*) AS total,
    SUM(valor) AS valor_total
FROM {{ ref('slv_minha_entidade') }}
GROUP BY 1, 2
```

### 6. Adicionar testes dbt

```yaml
# airflow_lappis/dags/dbt/<projeto>/models/<dominio>_dbt/schema.yml
models:
  - name: slv_minha_entidade
    columns:
      - name: id
        tests:
          - not_null
          - unique
```

### 7. Criar dashboards

1. Subir ambiente local: `docker compose up -d`
2. Acessar Superset: http://localhost:8088
3. Criar datasets apontando para Gold layer
4. Criar charts e dashboards
5. Exportar os dashboards e armazená-los no local versionado definido pelo fork

### 8. Documentar

Adicione um README no repositório com:

- Descrição do contexto
- Fontes de dados integradas
- Como rodar localmente
- Dashboards disponíveis

## Manter Sincronizado

Periodicamente, incorporar melhorias do pipeline base:

```bash
git fetch upstream
git merge upstream/main

# Resolver conflitos se houver
# Testar: make test
# Comitar
```

## Boas Práticas

- **Mantenha a estrutura Medallion** (Bronze/Silver/Gold)
- **Reutilize macros** do repo base quando possível
- **Contribua de volta** melhorias genéricas via PR upstream
- **Documente fontes** de dados com schema.yml do dbt
- **Testes obrigatórios** para toda tabela Silver/Gold
- **Nomeie consistentemente**: `<fonte>_ingest_dag`, `brz_*`, `slv_*`, `gld_*`
- **Isole recursos compartilhados**: `<contexto>_silver`, `<contexto>_gold` e `bronze-<contexto>`
