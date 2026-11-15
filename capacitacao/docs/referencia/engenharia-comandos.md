# Comandos do dia a dia: Airflow, dbt e banco

> Tipo: **Referência**

Comandos usados nas práticas deste nível, para a aplicação `data-application-gov-hub` rodando localmente. Salvo indicação, rode-os na raiz do repositório.

## Ambiente

| Comando | Para quê |
|---|---|
| `docker compose up -d` | Subir todos os serviços (Airflow, PostgreSQL, Superset, Jupyter) |
| `docker compose up -d postgres airflow` | Subir só o necessário para coletas e dbt |
| `docker compose ps` | Ver o que está no ar |
| `docker compose logs -f airflow` | Acompanhar o log de um serviço |
| `make dev` | Criar as Variables e a Connection `postgres_default` no Airflow local |
| `make dev-check` | Conferir se essa configuração existe |
| `make setup-roles` | Criar o papel somente leitura usado nos `grants` do dbt |
| `docker compose down` | Parar sem apagar dados. **Evite `down -v`**: apaga o banco local |

## Airflow

Interface em `http://localhost:8080`. Para os comandos, use `docker compose exec airflow airflow ...`:

| Comando | Para quê |
|---|---|
| `airflow dags list` | Listar as DAGs carregadas |
| `airflow dags list-import-errors` | Ver por que uma DAG não aparece |
| `airflow dags test <dag_id> <AAAA-MM-DD>` | Rodar a DAG inteira no terminal, sem o agendador |
| `airflow tasks list <dag_id>` | Listar as tarefas, por exemplo as criadas pelo Cosmos |
| `airflow tasks test <dag_id> <task_id> <AAAA-MM-DD>` | Rodar uma tarefa isolada, sem gravar o estado |
| `airflow variables get <nome>` | Ler uma Variable, como `dynamic_schedules` |
| `airflow connections get postgres_default` | Conferir a Connection do banco |

Na interface:

| Tela | Para quê |
|---|---|
| DAGs → botão à esquerda | Ligar ou pausar a DAG |
| ▶ Trigger DAG | Disparar uma execução manual |
| Grid / Graph | Estado de cada tarefa em cada execução |
| Tarefa → Logs → (by attempts) | Log de cada tentativa |
| Tarefa → XCom | Valor devolvido pela tarefa |
| Tarefa → Clear task (com Downstream) | Rodar de novo a tarefa e as que dependem dela |
| Admin → Variables / Connections | Configuração fora do código |

## dbt

Dentro do container, na pasta do projeto:

```bash
docker compose exec airflow bash
cd /opt/airflow/dags/dbt/ipea
export DB_DW_USER=$POSTGRES_USER DB_DW_PASSWORD=$POSTGRES_PASSWORD DB_DW_DBNAME=$POSTGRES_DB
```

| Comando | Para quê |
|---|---|
| `dbt debug` | Testar o perfil e a conexão |
| `dbt build --select <modelo> --no-populate-cache` | Rodar o modelo e os testes dele |
| `dbt build --select +<modelo>` | O modelo e **tudo de que ele depende** |
| `dbt build --select <modelo>+` | O modelo e **tudo que depende dele** |
| `dbt run --select <modelo>` | Só criar ou atualizar, sem testes |
| `dbt test --select <modelo>` | Só os testes |
| `dbt seed --select <seed>` | Carregar um CSV de `seeds/` |
| `dbt ls --select <modelo>+` | Ver o que uma seleção inclui, sem executar |
| `dbt compile --select <modelo>` | Ver o SQL final, com `ref()` e `source()` resolvidos, em `target/compiled/` |

No ambiente local, `--no-populate-cache` evita o erro `Cross-db references not allowed`, causado por modelos do projeto configurados para os bancos de produção.

## Banco

| Comando | Para quê |
|---|---|
| `docker compose exec postgres psql -U postgres` | Abrir o `psql` no banco local |
| `\dn` | Listar schemas |
| `\dt formacao.*` | Listar as tabelas de um schema |
| `\d formacao.pncp_contratacoes` | Ver colunas e tipos de uma tabela |
| `select count(*), count(distinct <chave>) from <tabela>;` | Conferir quantidade e duplicatas |

## Qualidade de código

| Comando | Para quê |
|---|---|
| `make format` | Formatar Python (`black`, `ruff`) e SQL (`sqlfmt`) |
| `make lint` | Verificar estilo e tipos (`black`, `ruff`, `mypy`, `sqlfmt`, `sqlfluff`) |
| `make test` | Rodar os testes Python com cobertura |

## Veja também

- [Fontes e clientes do repositório](engenharia-fontes.md)
- [Guia: adicionar uma fonte nova ao repositório](../guias/engenharia-fonte-nova.md)
