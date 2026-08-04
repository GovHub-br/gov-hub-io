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

## Variáveis, connections e secrets

O `make dev` configura as variáveis e a connection básica do Airflow para desenvolvimento local. A referência prática fica no `Makefile` do [`data-application-gov-hub`](https://github.com/GovHub-br/data-application-gov-hub), nos alvos `dev` e `dev-check`.

| Item | Tipo | Onde encontrar | Uso |
| --- | --- | --- | --- |
| `airflow_orgao` | Airflow Variable | `Makefile` (`make dev`) e UI do Airflow em Admin > Variables | Define o órgão alvo da execução local. |
| `airflow_variables` | Airflow Variable | `Makefile` (`make dev`) e UI do Airflow em Admin > Variables | Guarda configurações por órgão em YAML/JSON, como `codigos_ug`. |
| `dynamic_schedules` | Airflow Variable | `Makefile`, `airflow_lappis/plugins/schedule_loader.py` e UI do Airflow | Define schedules por `dag_id` sem alterar código da DAG. |
| `postgres_default` | Airflow Connection | Importada pelo `Makefile` via `airflow connections import` | Connection padrão usada por `helpers/postgres_helpers.py`. |
| Secrets de APIs, banco e certificados | Secret do ambiente | Kubernetes, GitHub Actions ou mecanismo definido pela infraestrutura | Armazena credenciais reais fora do Git. |

No ambiente local, o `Makefile` escreve temporariamente um arquivo `/tmp/airflow-connections.json` dentro do container apenas para importar a connection `postgres_default`; esse arquivo não deve ser versionado.

Para conferir as configurações locais:

```bash
make dev-check

docker compose exec airflow airflow variables get airflow_orgao
docker compose exec airflow airflow variables get airflow_variables
docker compose exec airflow airflow variables get dynamic_schedules
docker compose exec airflow airflow connections get postgres_default
```

Também é possível conferir pela UI do Airflow:

| Configuração | Caminho na UI |
| --- | --- |
| Variables | Admin > Variables |
| Connections | Admin > Connections |

!!! warning "Sem segredos no Git"
    Valores reais de senha, token, certificado, chave privada ou credencial de API não devem aparecer em documentação, código, exemplos versionados ou histórico Git. Use placeholders nos exemplos e mantenha os valores reais no mecanismo de secrets do ambiente.

Algumas DAGs usam variables ou connections adicionais, como `airflow_orgao_ted`, `airflow_orgao_1`, `email_credentials`, `GITHUB_TOKEN`, `postgres_mir` ou conexões de SQL Server. Antes de criar ou alterar uma DAG, procure por DAGs semelhantes no domínio e confira quais configurações elas já esperam. Quando a configuração contiver credencial sensível, prefira Airflow Connections ou o mecanismo de secrets do ambiente em vez de criar uma nova Variable com segredo.

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
