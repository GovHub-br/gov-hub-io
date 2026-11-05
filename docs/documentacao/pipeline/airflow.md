# Apache Airflow

O Airflow orquestra as rotinas de ingestão, transformação e atualização de artefatos auxiliares do GovHub BR. No repositório principal, o código fica em `airflow/`.

A versão de referência atual é **Apache Airflow 3.2.2**, refletida no repositório `gov-hub` em `requirements.txt` e `docker/Dockerfile`.

## Estrutura real do repositório

```text
airflow/
  dags/
    data_ingest/        # DAGs de ingestão por sistema
    data_transform/     # DAGs Cosmos que materializam projetos dbt por órgão
    data_publish/       # DAGs de publicação de artefatos de consumo
    data_report/        # DAGs de relatórios automatizados
    dbt/                # projetos dbt e pacotes compartilhados
    superset/           # artefatos versionados do Superset
    homologation/       # fluxos auxiliares de homologação
  helpers/              # funções reutilizáveis
  plugins/              # clientes de APIs, Postgres e utilitários Airflow
```

As DAGs de ingestão ficam agrupadas por origem em `airflow/dags/data_ingest/`. Exemplos atuais:

| Pasta | Conteúdo |
| --- | --- |
| `data_ingest/compras_gov/` | ingestão de contratações, contratos, fornecedores, órgãos, UASGs, catálogo e pesquisa de preços |
| `data_transform/mgi/` | execução Cosmos do projeto dbt do MGI |
| `data_publish/mgi/` | publicação de artefatos de consumo do MGI |
| `data_report/mgi/` | geração de relatórios do domínio de contratações |
| `superset/mgi/` | dashboards, datasets e charts versionados do Superset |

## Padrão de DAG

O padrão predominante usa a TaskFlow API (`@dag` e `@task`), clientes em `plugins/` e helpers compartilhados. A DAG deve ficar pequena: ela orquestra; a lógica de acesso a API e banco fica em clientes e helpers.

```python
from airflow.sdk import dag, task
from datetime import datetime, timedelta
from schedule_loader import get_dynamic_schedule
from cliente_compras_gov import ClienteComprasGov
from landing_zone import write_raw

@dag(
    schedule=get_dynamic_schedule("contratos_ingest_dag"),
    start_date=datetime(2023, 1, 1),
    catchup=False,
    default_args={
        "owner": "nome-ou-time",
        "retries": 1,
        "retry_delay": timedelta(minutes=5),
    },
    tags=["compras_gov", "contratos"],
)
def contratos_ingest_dag():
    @task
    def fetch_and_store():
        api = ClienteComprasGov()
        dados = api.get("/modulo-contratos/1_consultarContratos")
        write_raw("compras_gov", "contratos", dados, primary_key=["id"])
        ...

    fetch_and_store()

dag_instance = contratos_ingest_dag()
```

## Agendamento

As DAGs de ingestão devem usar `get_dynamic_schedule()`, definido em `airflow/plugins/schedule_loader.py`. Esse helper lê a Airflow Variable `dynamic_schedules` e permite alterar cronogramas sem editar código.

```json
{
  "contratos_ingest_dag": {
    "type": "cron",
    "value": "0 5 * * *"
  }
}
```

Tipos aceitos: `preset`, `cron` e `timedelta`. Quando uma DAG não aparece na variável, o padrão é `@daily`.

!!! note "Exceções"
    DAGs dbt com Astronomer Cosmos usam `schedule` diretamente dentro da configuração `DbtDag`. Algumas DAGs legadas também podem ter schedule direto; ao tocar nelas, prefira migrar para o padrão dinâmico quando fizer sentido.

## Variáveis e conexões locais

O `make dev` configura as variáveis e conexões básicas para desenvolvimento local:

| Item | Uso |
| --- | --- |
| `airflow_orgao` | órgão alvo da execução local |
| `airflow_variables` | configurações por órgão, como `codigos_ug` |
| `dynamic_schedules` | schedules por `dag_id` |
| `postgres_default` | conexão padrão do Airflow para PostgreSQL |

Algumas DAGs podem usar conexões nomeadas adicionais. Antes de criar ou alterar uma DAG, confira o domínio e a conexão usada pelas DAGs semelhantes.

## Acesso local

```bash
make setup
docker compose up -d
make dev-check
```

Serviços principais:

| Serviço | URL | Credenciais locais |
| --- | --- | --- |
| Airflow | http://localhost:8080 | `airflow` / `airflow` |
| Superset | http://localhost:8088 | `admin` / `admin` |
| Jupyter | http://localhost:8888 | sem autenticação local |

!!! warning "Apenas local"
    Essas credenciais são padrões de desenvolvimento. Ambientes compartilhados, staging e produção devem usar credenciais próprias e mecanismos de secret do ambiente.

!!! info "Airflow 3 local"
    No ambiente local com Airflow 3.2.2, a autenticação é resolvida pelo `SimpleAuthManager`. O setup local mantém o usuário `airflow` estável para desenvolvimento e o healthcheck usa `/api/v2/monitor/health`.

## Validação

Antes de abrir PR com mudança em DAG:

```bash
make lint
make test
docker compose exec airflow airflow dags list
docker compose exec airflow airflow dags test <dag_id> <data_execucao>
```

## Referências relacionadas

- [Ingestão de dados](ingestao.md)
- [Padrões de engenharia](padroes-engenharia.md)
- [Observabilidade](observabilidade.md)
