# Apache Airflow

O Airflow orquestra as rotinas de ingestão, transformação e atualização de artefatos auxiliares do GovHub BR. No repositório principal, o código fica em `airflow_lappis/`.

## Estrutura real do repositório

```text
airflow_lappis/
  dags/
    data_ingest/        # DAGs de ingestão por fonte ou domínio
    dbt/                # DAGs Cosmos que executam projetos dbt
    dashboards/         # DAGs auxiliares para dashboards
  helpers/              # funções reutilizáveis
  plugins/              # clientes de APIs, Postgres e utilitários Airflow
  templates/            # templates usados por integrações específicas
```

As DAGs de ingestão ficam agrupadas por origem em `airflow_lappis/dags/data_ingest/`. Exemplos atuais:

| Pasta | Conteúdo |
| --- | --- |
| `compras_gov/` | contratos, faturas, empenhos, cronogramas e terceirizados |
| `siafi/` | notas de crédito, notas de empenho e programação financeira |
| `siape/` | dados funcionais, pessoais, escolares, afastamentos e dependentes |
| `siorg/` | unidades organizacionais, cargos e funções |
| `transfere_gov/` | programas, planos de ação, notas de crédito e programação financeira |
| `tesouro_gerencial/` | ingestão via arquivos recebidos por e-mail e domínios MIR/MCID |
| `pncp/`, `ibge/`, `dados_abertos/`, `sisbolsas/`, `sgac/` | integrações específicas |

## Padrão de DAG

O padrão predominante usa a TaskFlow API (`@dag` e `@task`), clientes em `plugins/` e helpers compartilhados. A DAG deve ficar pequena: ela orquestra; a lógica de acesso a API e banco fica em clientes e helpers.

```python
from airflow.decorators import dag, task
from airflow.models import Variable
from datetime import datetime, timedelta
from schedule_loader import get_dynamic_schedule
from postgres_helpers import get_postgres_conn
from cliente_postgres import ClientPostgresDB

@dag(
    schedule_interval=get_dynamic_schedule("contratos_ingest_dag"),
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
        orgao_alvo = Variable.get("airflow_orgao", default_var=None)
        if not orgao_alvo:
            raise ValueError("airflow_orgao não definida")

        db = ClientPostgresDB(get_postgres_conn())
        ...

    fetch_and_store()

dag_instance = contratos_ingest_dag()
```

## Agendamento

As DAGs de ingestão devem usar `get_dynamic_schedule()`, definido em `airflow_lappis/plugins/schedule_loader.py`. Esse helper lê a Airflow Variable `dynamic_schedules` e permite alterar cronogramas sem editar código.

```json
{
  "empenhos_tesouro_ingest_dag": {
    "type": "cron",
    "value": "0 13 * * 1-6"
  }
}
```

Tipos aceitos: `preset`, `cron` e `timedelta`. Quando uma DAG não aparece na variável, o padrão é `@daily`.

!!! note "Exceções"
    DAGs dbt com Astronomer Cosmos usam `schedule_interval` diretamente dentro da configuração `DbtDag`. Algumas DAGs legadas também podem ter schedule direto; ao tocar nelas, prefira migrar para o padrão dinâmico quando fizer sentido.

## Variáveis e conexões locais

O `make dev` configura as variáveis e conexões básicas para desenvolvimento local:

| Item | Uso |
| --- | --- |
| `airflow_orgao` | órgão alvo da execução local |
| `airflow_variables` | configurações por órgão, como `codigos_ug` |
| `dynamic_schedules` | schedules por `dag_id` |
| `postgres_default` | conexão padrão do Airflow para PostgreSQL |

Algumas DAGs usam conexões nomeadas adicionais, como `postgres_mir`. Antes de criar ou alterar uma DAG, confira o domínio e a conexão usada pelas DAGs semelhantes.

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
