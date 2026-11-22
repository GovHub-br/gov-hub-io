# Prática: a DAG de ingestão no padrão do repositório

> Tipo: **Tutorial**

## O que você vai construir

A DAG `pncp_contratos_ingest_dag`: coleta os contratos do órgão no PNCP, grava na tabela raw `pncp.contratos` sem duplicar e confere o que gravou. Você vai escrever o teste que diz que a DAG carrega, escrever a DAG e rodá-la até a tabela ficar certa.

![A DAG de contratos em três tarefas: coletar, gravar e conferir. A coleta lê o CNPJ do órgão na Variable airflow_variables e o período dos parâmetros da execução, chama o cliente do PNCP, e marca cada registro com dt_ingest em hora de Brasília. A gravação faz upsert pela chave numeroControlePNCP em pncp.contratos. A conferência compara quantos registros foram enviados com quantos a tabela guarda daquela carga e falha se forem diferentes. Se a configuração do órgão estiver ausente, a coleta falha na hora, sem novas tentativas.](../../assets/diagramas/engenharia-base-nova-dag.png)

Na [prática do Airflow](engenharia-airflow-dag.md), do nível 4, você escreveu uma DAG de estudo. Esta é a versão para entrar no repositório: lê a configuração das mesmas Variables das outras DAGs, aceita um período explícito para recargas e deixa o horário para a configuração.

## O que você vai aprender

- Quais convenções do repositório uma DAG de ingestão segue, e por quê.
- Distinguir uma falha que merece nova tentativa de uma que não merece.
- Aceitar um período como parâmetro, para recargas.
- Testar que a DAG carrega, sem rodá-la.
- Abrir o banco num cliente SQL, ver a raw nascer e provar que repetir a execução não duplica.

## Antes de começar

- A [prática do cliente](engenharia-base-nova-cliente.md) concluída: `ClientePNCP.get_contratos` existe, foi conferido contra a API e passa no teste.
- O ambiente no ar, com `make dev` já executado ([nível 2](../guias/engenharia-airflow-configuracao.md)).
- Um cliente SQL no computador, como o DBeaver, para o passo 6. Se ainda não tem, instale antes: [dbeaver.io/download](https://dbeaver.io/download/).

## Passo 1: ler a DAG vizinha

A DAG `pncp_publicacoes_dag` (`dags/data_ingest/pncp/licitacoes_ingest.py`) coleta as contratações do mesmo órgão. Leia-a procurando o que é **convenção do projeto** e deve ser copiado, e o que é **particular** dela:

| Na DAG vizinha | Na DAG nova |
|---|---|
| `@dag`/`@task` (TaskFlow) | Igual |
| `schedule_interval=` | Igual. O parâmetro mais novo é `schedule=`, mas os 49 arquivos de DAG do repositório que definem horário usam `schedule_interval`; o Airflow 2.8 avisa que ele será removido, e uma troca em massa é assunto de outro PR |
| `Variable.get("airflow_orgao")` e `airflow_variables` | Igual: o órgão e o CNPJ vêm da configuração, não do código |
| Chave `orgao_pncp` dentro de `airflow_variables` | Igual: a mesma chave, para não criar uma segunda configuração do mesmo dado |
| `int(cnpj_orgao)` | **Diferente.** Converter o CNPJ para inteiro apaga zeros à esquerda (`int("00394494000136")` é `394494000136`). A DAG nova mantém o texto |
| Janela fixa de 260 semanas | **Diferente.** A DAG nova usa os últimos 30 dias por padrão e aceita um período como parâmetro |
| Coleta e gravação numa tarefa só | **Diferente.** Três tarefas, para ver na tela onde falhou |

## Passo 2: a configuração que a DAG exige

Uma DAG que lê configuração só funciona onde a configuração existe. Esta lê a chave `orgao_pncp` do órgão em `airflow_variables`. Veja o que o seu ambiente tem:

<!-- explica: Mostra o valor atual da Variable `airflow_variables`, o JSON com a configuração de cada órgão, para ver se o Ipea já tem a chave `orgao_pncp`. -->

```bash
docker compose exec airflow airflow variables get airflow_variables
```

```text
{"ipea": {"codigos_ug": [113601, 113602]}, "unb": {"codigos_ug": [154040]}, ...}
```

O `make dev` grava essa Variable com os códigos de UG, e sem `orgao_pncp`. Acrescente a chave ao órgão `ipea`, pela interface do Airflow (**Admin → Variables → `airflow_variables` → editar**) ou pela linha de comando, repetindo o JSON inteiro:

<!-- explica: Grava a Variable `airflow_variables` inteira, agora com a chave `orgao_pncp` no órgão `ipea`. O comando substitui o valor todo, e por isso o JSON repete a configuração dos outros órgãos. -->

```bash
docker compose exec airflow airflow variables set airflow_variables '{"ipea":{"codigos_ug":[113601,113602],"orgao_pncp":"33892175000100"},"unb":{"codigos_ug":[154040]},"ibama":{"codigos_ug":[440001,440048,440050]},"mgi":{"codigos_ug":[201082]},"mir":{"codigos_ug":[230002,810008]}}'
```

Leia assim: `33892175000100` é o CNPJ do Ipea. **Cuidado:** `make dev` grava a Variable de novo, sem a chave. Depois de rodá-lo, repita este passo.

## Passo 3: escrever o teste da DAG

Crie `tests/dags/test_pncp_contratos_ingest_dag.py`. O repositório ainda não tem testes de DAG, e a pasta `tests/dags/` é nova. Um teste simples já protege contra o erro mais comum: uma DAG que nem carrega.

```python
from pathlib import Path
from unittest.mock import patch

from airflow.models import DagBag

ARQUIVO_DAG = (
    Path(__file__).parents[2]
    / "airflow_lappis/dags/data_ingest/pncp/contratos_ingest_dag.py"
)


def test_dag_de_contratos_carrega_com_tres_tarefas_em_ordem() -> None:
    # get_dynamic_schedule lê a Variable dynamic_schedules ao carregar a DAG;
    # aqui não há banco do Airflow, então a leitura devolve "nenhum horário".
    with patch("airflow.models.Variable.get", return_value={}):
        dagbag = DagBag(dag_folder=str(ARQUIVO_DAG), include_examples=False)

    assert dagbag.import_errors == {}
    dag = dagbag.dags["pncp_contratos_ingest_dag"]
    assert [t.task_id for t in dag.topological_sort()] == [
        "coletar",
        "gravar",
        "conferir",
    ]
```

Duas decisões que valem entender:

- **O `patch` em `Variable.get`.** O `get_dynamic_schedule` consulta o banco do Airflow no momento em que o arquivo é importado, e o `pytest` não tem esse banco. O `patch` responde "sem horários configurados" no lugar dele.
- **`dagbag.dags[...]` em vez de `dagbag.get_dag(...)`.** O `get_dag` também consulta o banco, para saber se a DAG está pausada, e falha com `no such table: dag`. Ler o dicionário `dags` evita isso.

Rode e veja o teste falhar, pois o arquivo da DAG ainda não existe:

<!-- explica: Roda os testes da pasta `tests/dags`, que carregam os arquivos de DAG como o Airflow faria e conferem as tarefas. `--no-cov` desliga o relatório de cobertura, para a saída ficar curta. -->

```bash
poetry run pytest tests/dags --no-cov
```

```text
tests/dags/test_pncp_contratos_ingest_dag.py::test_dag_de_contratos_carrega_com_tres_tarefas_em_ordem FAILED [100%]
E       KeyError: 'pncp_contratos_ingest_dag'
============================== 1 failed in 1.82s ===============================
```

## Passo 4: escrever a DAG

Crie `airflow_lappis/dags/data_ingest/pncp/contratos_ingest_dag.py`:

```python
import logging
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import yaml
from airflow.decorators import dag, task
from airflow.exceptions import AirflowFailException
from airflow.models import Variable
from airflow.models.param import Param

from cliente_pncp import ClientePNCP
from cliente_postgres import ClientPostgresDB
from postgres_helpers import get_postgres_conn
from schedule_loader import get_dynamic_schedule


@dag(
    schedule_interval=get_dynamic_schedule("pncp_contratos_ingest_dag"),
    start_date=datetime(2026, 1, 1),
    catchup=False,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=2)},
    params={
        "data_inicial": Param(None, type=["null", "string"], description="AAAAMMDD"),
        "data_final": Param(None, type=["null", "string"], description="AAAAMMDD"),
    },
    tags=["pncp", "contratos"],
)
def pncp_contratos_ingest_dag() -> None:
    """Contratos publicados no PNCP pelo órgão configurado em airflow_variables."""

    @task
    def coletar(**context: Any) -> list[dict]:
        orgao = Variable.get("airflow_orgao")
        config = yaml.safe_load(Variable.get("airflow_variables"))
        cnpj = config.get(orgao, {}).get("orgao_pncp")
        if not cnpj:
            # Erro de configuração: tentar de novo não resolve.
            raise AirflowFailException(
                f"airflow_variables não tem orgao_pncp para o órgão '{orgao}'"
            )

        hoje = datetime.now()
        data_inicial = context["params"]["data_inicial"] or (
            hoje - timedelta(days=30)
        ).strftime("%Y%m%d")
        data_final = context["params"]["data_final"] or hoje.strftime("%Y%m%d")

        api = ClientePNCP()
        api.DEFAULT_TIMEOUT = 60
        registros: list[dict] = []
        pagina, total_paginas = 1, 1
        while pagina <= total_paginas:
            itens, total_paginas = api.get_contratos(
                data_inicial, data_final, cnpj, pagina
            )
            registros.extend(itens)
            pagina += 1

        # Convenção do repositório: hora de Brasília, sem fuso. O bronze acrescenta
        # '-03:00'. datetime.now() sozinho usaria o relógio do container, em UTC.
        dt_ingest = (
            datetime.now(ZoneInfo("America/Sao_Paulo")).replace(tzinfo=None).isoformat()
        )
        for registro in registros:
            registro["dt_ingest"] = dt_ingest
        logging.info(
            "%s contratos do CNPJ %s publicados entre %s e %s",
            len(registros),
            cnpj,
            data_inicial,
            data_final,
        )
        return registros

    @task
    def gravar(registros: list[dict]) -> dict:
        if registros:
            ClientPostgresDB(get_postgres_conn()).insert_data(
                registros,
                table_name="contratos",
                conflict_fields=["numeroControlePNCP"],
                primary_key=["numeroControlePNCP"],
                schema="pncp",
            )
        dt_ingest = registros[0]["dt_ingest"] if registros else None
        return {"enviados": len(registros), "dt_ingest": dt_ingest}

    @task
    def conferir(carga: dict) -> None:
        if carga["enviados"] == 0:
            logging.info("Nenhum contrato publicado no período")
            return
        # dt_ingest foi gerado pela própria DAG: não vem de fora.
        consulta = "select count(*) from pncp.contratos where dt_ingest = '{}'"
        [(gravados,)] = ClientPostgresDB(get_postgres_conn()).execute_query(
            consulta.format(carga["dt_ingest"])
        )
        logging.info(
            "Enviados: %s | Gravados nesta carga: %s", carga["enviados"], gravados
        )
        if gravados != carga["enviados"]:
            raise ValueError(f"Enviados {carga['enviados']}, gravados {gravados}")

    conferir(gravar(coletar()))


pncp_contratos_ingest_dag()
```

A DAG é longa, mas cada trecho responde a uma pergunta:

| Trecho | Pergunta que responde |
|---|---|
| `schedule_interval=get_dynamic_schedule(...)` | Quando roda? Quem decide é a Variable `dynamic_schedules`; sem entrada, o padrão é `@daily`. O horário é de quem opera, não do código |
| `catchup=False` | O que fazer com os dias em que a DAG não existia? Nada: sem isso, o Airflow tentaria rodar cada dia desde `start_date` |
| `params` com `data_inicial` e `data_final` | Como refazer um período antigo, como o da retificação da [avaliação da fonte](../guias/engenharia-avaliar-fonte.md)? Passando o período ao disparar |
| `AirflowFailException` | Config ausente é erro que **não se resolve esperando**. Essa exceção falha a tarefa na hora, sem gastar as duas novas tentativas |
| laço `while pagina <= total_paginas` | Como pedir tudo? Percorrendo as páginas. Se uma falhar, `get_contratos` levanta e a tarefa falha: uma carga incompleta nunca termina verde |
| `dt_ingest` em hora de Brasília | Quando o registro chegou? O bronze acrescenta `-03:00`, e o container grava em UTC. Sem o fuso explícito, o bronze leria 3 horas à frente |
| `conflict_fields` e `primary_key` | Como não duplicar? A chave natural `numeroControlePNCP` faz o `insert_data` atualizar a linha existente |
| Tarefa `conferir` | O que foi gravado é o que foi enviado? Compara com a contagem da própria carga e falha se forem diferentes |

Um limite honesto: a tarefa `coletar` devolve a lista inteira de registros, e o Airflow a guarda no banco de metadados (XCom). Para 30 contratos, tudo bem. Para milhares, a prática comum é coletar e gravar na mesma tarefa, como a DAG vizinha faz, e deixar no XCom só o resumo. A divisão em três tarefas, aqui, favorece o aprendizado e a leitura dos logs.

Rode o teste:

<!-- explica: Roda de novo o teste da DAG, agora com o arquivo escrito, para conferir que ela carrega sem erro e tem as três tarefas na ordem. -->

```bash
poetry run pytest tests/dags --no-cov
```

```text
tests/dags/test_pncp_contratos_ingest_dag.py::test_dag_de_contratos_carrega_com_tres_tarefas_em_ordem PASSED [100%]
========================= 1 passed, 1 warning in 4.22s =========================
```

O aviso é o `schedule_interval` obsoleto, que o Passo 1 explicou.

## Passo 5: rodar a DAG de verdade

`airflow dags test` executa uma DAG inteira no terminal, sem esperar o agendador. Se você rodar a DAG antes de configurar a chave do passo 2, vai ver isto:

```text
airflow.exceptions.AirflowFailException: airflow_variables não tem orgao_pncp para o órgão 'ipea'
... Immediate failure requested. Marking task as FAILED. dag_id=pncp_contratos_ingest_dag, task_id=coletar
```

A tarefa falhou na hora, com a mensagem que diz o que fazer, e as duas novas tentativas foram poupadas. Com a Variable configurada, rode um período fixo, o primeiro semestre de 2026:

<!-- explica: Executa a DAG inteira uma vez, no terminal, sem esperar o agendador, com 16/11/2026 como data lógica. `--conf` passa o período a coletar, o 1º semestre de 2026, no lugar dos últimos 30 dias. A barra no fim da primeira linha só continua o comando na linha de baixo. -->

```bash
docker compose exec airflow airflow dags test pncp_contratos_ingest_dag 2026-11-16 \
  --conf '{"data_inicial": "20260101", "data_final": "20260630"}'
```

Procure estas linhas na saída (os horários foram omitidos):

```text
INFO - 30 contratos do CNPJ 33892175000100 publicados entre 20260101 e 20260630
INFO - Marking task as SUCCESS. dag_id=pncp_contratos_ingest_dag, task_id=coletar
INFO - Marking task as SUCCESS. dag_id=pncp_contratos_ingest_dag, task_id=gravar
INFO - Enviados: 30 | Gravados nesta carga: 30
INFO - Marking task as SUCCESS. dag_id=pncp_contratos_ingest_dag, task_id=conferir
INFO - Marking run <DagRun pncp_contratos_ingest_dag ...> successful
```

Leia assim: a coleta trouxe 30 contratos, a gravação os enviou e a conferência encontrou os mesmos 30 com o `dt_ingest` da carga. Sem `--conf`, a DAG pede os últimos 30 dias, e o número varia com a data de hoje. Um período sem contratos termina verde com `Nenhum contrato publicado no período`, e a gravação nem é chamada.

Para disparar pela interface, abra `http://localhost:8080`, localize `pncp_contratos_ingest_dag`, use **Trigger DAG w/ config** e informe o mesmo JSON.

## Passo 6: conferir a raw, direto no banco

Até aqui, você só viu o log dizer que 30 contratos foram gravados. Agora vá ao banco e veja a tabela com os próprios olhos: é onde o teste, o cliente, a DAG, a Variable e a conexão deixam de ser arquivos e viram dado.

### Abrir o banco no DBeaver

O [DBeaver](https://dbeaver.io/download/), gratuito na edição Community, é um cliente SQL com interface gráfica. Qualquer outro cliente serve, com os mesmos dados de conexão. No DBeaver:

1. Clique em **Database → New Database Connection**, escolha **PostgreSQL** e **Next**.
2. Na aba **Main**, preencha:

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `postgres` |
| Authentication | Database Native |
| Username | `postgres` |
| Password | o valor de `POSTGRES_PASSWORD` no seu `.env` |

3. Clique em **Test Connection**. Na primeira vez, o DBeaver oferece baixar o driver do PostgreSQL: aceite com **Download**. A janela deve responder **Connected**.
4. Clique em **Finish**. A conexão aparece no painel **Database Navigator**, à esquerda.

São os mesmos dados de `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` que o `docker compose` lê do `.env`. O host é `localhost` porque você conecta de **fora** da rede do Docker; `postgres` só vale de dentro, como o Airflow faz (veja a [tabela dos hosts](../guias/engenharia-acessos-locais.md)). Se a conexão for recusada, os containers não estão no ar: confira com `docker compose ps`. Se a senha for rejeitada, copie de novo do `.env`.

### Ver a raw nascer

Abra a árvore da conexão até a tabela: **postgres → Databases → postgres → Schemas → pncp → Tables → contratos**. Se `pncp` não aparecer, o DBeaver ainda guarda a lista antiga do banco: clique em **Schemas** e aperte **F5**.

Nenhum arquivo `.sql` do repositório cria essa tabela. Quem a criou foi o `insert_data`, na primeira gravação da DAG: `CREATE SCHEMA IF NOT EXISTS pncp` e `CREATE TABLE IF NOT EXISTS pncp.contratos`, com uma coluna para cada campo do primeiro registro e a chave primária que a DAG pediu. Se outra DAG do PNCP já tinha rodado no seu ambiente, o schema `pncp` já existia, com outras tabelas, e `contratos` é a nova.

Dê um duplo clique em `contratos`:

- Na aba **Properties**, a lista de colunas: 52, todas `text`, com `numerocontrolepncp` como chave primária e os campos aninhados da API achatados com `__`, como `tipocontrato__nome`.
- Na aba **Data**, as 30 linhas. Procure `valorglobal` (um texto, como `1040.64`) e `dt_ingest` (a hora da carga, também texto, no formato `2026-11-16T10:57:30.966974`).

Agora faça a tabela nascer de novo. Abra um editor SQL com a conexão selecionada (**SQL Editor → New SQL script**, ou `Ctrl+]`, `Cmd+]` no Mac), e execute com `Ctrl+Enter` (`Cmd+Enter` no Mac):

```sql
drop table pncp.contratos;
```

Aperte **F5** em **Tables**: `contratos` sumiu. É só o seu ambiente local, e a fonte tem os dados de volta. Repita o `airflow dags test` do passo 5 no terminal, volte ao DBeaver e aperte **F5** de novo: a tabela reapareceu, criada pela DAG, com as 30 linhas. Isso é o que acontece na primeira carga de qualquer base nova em produção.

### Conferir as contagens

Com a tabela de volta, rode no editor SQL:

```sql
select count(*) as linhas, count(distinct numerocontrolepncp) as chaves, count(distinct dt_ingest) as cargas from pncp.contratos;
```

```text
 linhas | chaves | cargas 
--------+--------+--------
     30 |     30 |      1
```

Trinta linhas, trinta chaves, uma carga: nenhum contrato foi gravado duas vezes. É a mesma conferência da [prática do Airflow](engenharia-airflow-dag.md), do nível 4, agora sobre a raw de verdade. Falta o teste que importa: repita **de novo** o `airflow dags test` do passo 5, volte ao DBeaver e rode a mesma consulta. O resultado não muda, `30 | 30 | 1`. O que muda está na aba **Data** (aperte **F5**): o `dt_ingest` das linhas passou a ser o da última carga.

Por isso `cargas` segue em 1: a segunda carga encontrou as mesmas chaves e atualizou as linhas, em vez de acrescentar outras. É a [idempotência do nível 4](../explicacao/engenharia-idempotencia.md) na prática. Para um retrato do que a carga trouxe, conte os contratos por tipo de instrumento, categoria do processo e tipo de pessoa do fornecedor:

```sql
select tipocontrato__nome, categoriaprocesso__nome, tipopessoa, count(*) from pncp.contratos group by 1,2,3 order by 1,2;
```

```text
    tipocontrato__nome    | categoriaprocesso__nome | tipopessoa | count 
--------------------------+-------------------------+------------+-------
 Contrato (termo inicial) | Compras                 | PJ         |     3
 Contrato (termo inicial) | Serviços                | PE         |     1
 Contrato (termo inicial) | Serviços                | PJ         |     8
 Contrato (termo inicial) | Serviços de Engenharia  | PJ         |     1
 Empenho                  | Serviços                | PJ         |    17
```

Dois detalhes da tabela vão pesar nas próximas aulas. Ela tem 52 colunas, **todas `text`**, porque o `insert_data` cria assim: `valorglobal` é o texto `2475.0` e `dataassinatura` é o texto `2026-01-16`. E os campos aninhados da API viraram colunas com `__`: `tipocontrato__nome`, `unidadeorgao__ufsigla`. Corrigir tipos é trabalho da bronze.

## Erros comuns

- **`make dev` sem refazer a Variable.** Ele sobrescreve `airflow_variables`. A DAG volta a falhar com a mensagem do passo 5, que, ao menos, diz o que fazer.
- **Gravar sem `conflict_fields`.** Cada execução acrescentaria 30 linhas repetidas, e a bronze falharia no teste `unique`.
- **Deixar a coleta devolver lista vazia em caso de falha.** A carga parece normal, e o dado desaparece sem alarme. O teste do cliente existe para impedir isso.
- **Esquecer de pedir o horário.** Sem entrada em `dynamic_schedules`, a DAG roda `@daily`. Se isso importa, escreva no PR qual horário você quer.

## O que você aprendeu

- Uma DAG de ingestão segue as convenções do repositório: TaskFlow, horário e filtros na configuração, `dt_ingest` e `insert_data` com chave.
- Falha de configuração deve parar na hora (`AirflowFailException`); falha de rede merece novas tentativas.
- Um período como parâmetro torna a DAG capaz de refazer o passado.
- O teste da DAG garante que ela carrega; a execução e a conferência da raw garantem que ela funciona.
- Nenhum SQL do repositório cria a raw: o `insert_data` a cria na primeira gravação, e você pode vê-la nascer no banco, com um cliente SQL conectado em `localhost:5432`.

## Confira o que entendeu

1. A DAG foi para produção sem o `orgao_pncp` na Variable. O que o operador vê, e quantas tentativas a tarefa gasta?
2. A fonte retificou um contrato publicado em março, e a DAG roda todo dia com a janela de 30 dias. Como corrigir a raw?

## Respostas comentadas

1. A tarefa `coletar` falha na primeira tentativa, com `airflow_variables não tem orgao_pncp para o órgão '...'` no log, e nenhuma nova tentativa é gasta, por causa do `AirflowFailException`. Com um `ValueError` comum, a mensagem seria a mesma, mas a tarefa esperaria 2 minutos duas vezes antes de falhar de vez.
2. Disparando a DAG com um período que cubra a publicação: `--conf '{"data_inicial": "20260301", "data_final": "20260331"}'`. A janela padrão só olha os últimos 30 dias de **publicação**, e a retificação não muda essa data. O `insert_data` atualiza a linha existente pela chave.

## Próximos passos

- [Prática: o domínio no dbt](engenharia-base-nova-dominio.md)
- [Reprocessamento e mudanças na fonte](../guias/engenharia-reprocessamento.md)
