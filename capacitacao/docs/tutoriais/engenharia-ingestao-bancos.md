# Prática: gravar a coleta em bancos de dados

> Tipo: **Tutorial**

> Notebook: [engenharia-ingestao-bancos.ipynb](../../notebooks/engenharia-ingestao-bancos.ipynb)

## O que você vai construir

Você vai gravar os 61 registros coletados na prática anterior de quatro jeitos e comparar o resultado:

| Parte | Ferramenta | Destino | O que observar |
|---|---|---|---|
| A | `psycopg2`, SQL escrito por você | PostgreSQL | Controle total e upsert pela chave |
| B | `pandas.to_sql` | PostgreSQL | Rápido, mas duplica e não grava listas |
| C | `ClientPostgresDB.insert_data`, do repositório | PostgreSQL | O jeito que as DAGs do Gov Hub gravam |
| D | `sqlite3` | Arquivo SQLite | O mesmo padrão em outro banco |

No fim, você saberá por que o repositório tem um cliente próprio para gravar e o que ele faz por você.

## Antes de começar

- Termine a [prática de coleta](engenharia-coleta-python.md): ela deixa o arquivo `notebooks/pncp_dispensas_2026_06.json`.
- Use o mesmo notebook, no Jupyter da aplicação. Instale os pacotes desta prática:

  ```python
  %pip install psycopg2-binary pandas "sqlalchemy>=2.0.36"
  ```

  O pandas 3 só reconhece a conexão do SQLAlchemy a partir da versão 2.0.36. Com uma versão anterior, o `to_sql` falha com `'Engine' object has no attribute 'cursor'`.

- Tenha à mão a senha `POSTGRES_PASSWORD` do seu `.env`. O banco local se chama `postgres`, o usuário é `postgres`, e de dentro do Docker o endereço é `postgres`, o nome do serviço no `docker-compose.yml`. Se você roda o Jupyter direto na sua máquina, fora do Docker, troque o endereço por `localhost`. O notebook desta prática descobre isso sozinho.

Carregue a coleta e abra a conexão:

```python
import json
import getpass
import psycopg2

with open("pncp_dispensas_2026_06.json", encoding="utf-8") as arquivo:
    registros = json.load(arquivo)
print(len(registros))

SENHA = getpass.getpass("POSTGRES_PASSWORD do .env: ")
conexao = psycopg2.connect(host="postgres", port=5432, dbname="postgres", user="postgres", password=SENHA)
```

```text
61
```

`getpass` pede a senha sem mostrá-la e sem salvá-la no notebook. Nunca escreva uma senha no código.

## Parte A: psycopg2, com upsert pela chave

Você escolhe as colunas, cria a tabela e escreve o `insert`. Seguindo a regra da raw, os valores ficam como texto:

```python
from psycopg2.extras import execute_values

linhas = [
    (
        r["numeroControlePNCP"],
        r["orgaoEntidade"]["razaoSocial"],
        r["unidadeOrgao"]["ufSigla"],
        str(r["valorTotalEstimado"]),
        r["dataPublicacaoPncp"],
    )
    for r in registros
]

with conexao, conexao.cursor() as cursor:
    cursor.execute("create schema if not exists formacao")
    cursor.execute("""
        create table if not exists formacao.pncp_psycopg (
            numero_controle_pncp text primary key,
            orgao text,
            uf text,
            valor_estimado text,
            data_publicacao text
        )
    """)
    execute_values(cursor, """
        insert into formacao.pncp_psycopg values %s
        on conflict (numero_controle_pncp) do update set
            orgao = excluded.orgao,
            uf = excluded.uf,
            valor_estimado = excluded.valor_estimado,
            data_publicacao = excluded.data_publicacao
    """, linhas)
    cursor.execute("select count(*) from formacao.pncp_psycopg")
    print(cursor.fetchone()[0])
```

```text
61
```

**Rode a célula de novo.** O resultado continua 61. A `primary key` define a identidade, e o `on conflict ... do update` troca a linha existente em vez de criar outra. É a [idempotência](../explicacao/engenharia-idempotencia.md) da aula de cargas, agora no seu código.

`with conexao` confirma a transação no fim do bloco (ou desfaz tudo, se der erro no meio). `execute_values` manda as 61 linhas em um comando só, em vez de 61 idas ao banco.

## Parte B: pandas, rápido e com armadilhas

O pandas transforma a lista de dicionários em tabela com uma linha:

```python
import pandas as pd
from sqlalchemy import create_engine

motor = create_engine(f"postgresql+psycopg2://postgres:{SENHA}@postgres:5432/postgres")
tabela = pd.json_normalize(registros, sep="__")
print(tabela.shape)
print(tabela["valorTotalHomologado"].isna().sum())
```

```text
(61, 55)
8
```

`json_normalize` abriu os objetos internos em colunas (`orgaoEntidade__razaoSocial`, `unidadeOrgao__ufSigla`): 55 colunas. E mostrou que **8 registros não têm valor homologado**.

Grave algumas colunas, **duas vezes**:

```python
colunas = ["numeroControlePNCP", "orgaoEntidade__razaoSocial", "unidadeOrgao__ufSigla",
           "valorTotalEstimado", "valorTotalHomologado", "dataPublicacaoPncp"]

tabela[colunas].to_sql("pncp_pandas", motor, schema="formacao", if_exists="append", index=False)
tabela[colunas].to_sql("pncp_pandas", motor, schema="formacao", if_exists="append", index=False)
print(pd.read_sql("select count(*) from formacao.pncp_pandas", motor))
```

```text
   count
0    122
```

**122 linhas**: o `to_sql` não tem upsert. `if_exists="append"` acrescenta sempre; `if_exists="replace"` apaga a tabela e cria outra, perdendo chaves, índices e permissões. Repare também que ele cria os nomes com aspas (`"valorTotalEstimado"`), e você terá de usar aspas para consultá-los.

Agora tente gravar **todas** as colunas:

```python
tabela.to_sql("pncp_pandas_tudo", motor, schema="formacao", if_exists="replace", index=False)
```

```text
ProgrammingError: (psycopg2.ProgrammingError) can't adapt type 'dict'
```

A coluna `fontesOrcamentarias` é uma **lista de objetos**, e o PostgreSQL não sabe guardar um dicionário Python numa coluna comum. Toda API real tem algum campo assim.

## Parte C: o cliente do repositório

O `ClientPostgresDB`, em `airflow_lappis/plugins/cliente_postgres.py`, resolve as armadilhas da parte B. Ele é usado pelas DAGs, e por isso roda dentro do container do Airflow, onde `plugins/` e `helpers/` já estão no caminho do Python.

No terminal, na raiz de `data-application-gov-hub`, copie o arquivo para o container e abra o Python de lá:

<!-- explica: Copia o arquivo com as dispensas de junho de 2026, que a prática de coleta salvou no seu computador, para a pasta `/tmp` do container do Airflow, onde o Python do próximo passo consegue lê-lo. -->

```bash
docker compose cp notebooks/pncp_dispensas_2026_06.json airflow:/tmp/
```

<!-- explica: Abre o Python interativo dentro do container do Airflow. Ali os módulos de `plugins/` e `helpers/`, como o `ClientPostgresDB`, já podem ser importados, e o banco é alcançado pelo nome `postgres`. -->

```bash
docker compose exec airflow python
```

```python
import json
from cliente_postgres import ClientPostgresDB
from postgres_helpers import get_postgres_conn

with open("/tmp/pncp_dispensas_2026_06.json", encoding="utf-8") as arquivo:
    registros = json.load(arquivo)

db = ClientPostgresDB(get_postgres_conn())
db.insert_data(
    registros,
    table_name="pncp_cliente",
    conflict_fields=["numeroControlePNCP"],
    primary_key=["numeroControlePNCP"],
    schema="formacao",
)
print(db.execute_query(
    "select count(*), count(*) filter (where valortotalhomologado = 'NaN') "
    "from formacao.pncp_cliente"
))
```

```text
[(61, 8)]
```

Rode o `insert_data` uma segunda vez: continua 61. Sem você escrever SQL, ele:

| Fez | Como |
|---|---|
| Pegou o banco certo | `get_postgres_conn()` lê a Connection `postgres_default` do Airflow; nada de senha no código |
| Criou schema e tabela | 55 colunas, todas `TEXT`, com chave primária em `numerocontrolepncp` |
| Achatou os objetos e as listas | `orgaoEntidade.cnpj` vira `orgaoentidade__cnpj`; listas viram texto |
| Fez upsert | `on conflict (numeroControlePNCP) do update` |

E deixou uma marca: os 8 valores homologados ausentes ficaram gravados como o **texto `'NaN'`**, não como nulo. O `json_normalize` transforma `None` em `NaN`, e o `NaN` vira texto na coluna `TEXT`. Quem trata isso é a bronze, na prática de dbt. Por enquanto, guarde o número: **8**.

Saia do Python com `exit()`.

## Parte D: outro banco, o mesmo padrão

Bancos relacionais falam a mesma língua em Python (a especificação DB-API): conectar, abrir um cursor, executar com parâmetros, confirmar. Veja no SQLite, que grava num arquivo e já vem com o Python. De volta ao notebook:

```python
import sqlite3

with sqlite3.connect("estudo.db") as banco:
    banco.execute("""
        create table if not exists pncp (
            numero_controle_pncp text primary key,
            orgao text,
            valor_estimado real
        )
    """)
    banco.executemany("""
        insert into pncp values (?, ?, ?)
        on conflict (numero_controle_pncp) do update set valor_estimado = excluded.valor_estimado
    """, [(r["numeroControlePNCP"], r["orgaoEntidade"]["razaoSocial"], r["valorTotalEstimado"]) for r in registros])
    print(banco.execute("select count(*), round(sum(valor_estimado), 2) from pncp").fetchone())
```

```text
(61, 4599247.08)
```

Mudam o `connect`, o marcador de parâmetro (`?` em vez de `%s`) e alguns tipos. A chave, o upsert e a conferência são os mesmos.

No Gov Hub, o caminho inverso também existe: ler de outro banco e gravar no PostgreSQL. A DAG `dags/data_ingest/sisbolsas/sisbolsas_to_postgres_ingest_dag.py` lê tabelas de um **SQL Server** com `ClientSQLServerDB.fetch_table_all` (de `plugins/cliente_sqlserver.py`, que usa a Connection `mssql_default`) e grava com o mesmo `insert_data`. Para a ingestão, outro banco é só mais uma fonte.

## Conferir o que ficou no banco

No editor SQL de sua preferência, ou com `docker compose exec postgres psql -U postgres`:

```sql
select 'psycopg' as forma, count(*) from formacao.pncp_psycopg
union all select 'pandas', count(*) from formacao.pncp_pandas
union all select 'cliente', count(*) from formacao.pncp_cliente;
```

| forma | count |
|---|---|
| psycopg | 61 |
| pandas | 122 |
| cliente | 61 |

## O que você aprendeu

- Gravar sem duplicar exige uma chave e um upsert; o `to_sql` do pandas não faz isso.
- APIs reais trazem objetos e listas; a raw precisa de uma regra para guardá-los.
- O `insert_data` do repositório encapsula essas regras, e por isso as DAGs o usam.
- Trocar de banco muda a conexão, não o raciocínio.

As tabelas `pncp_psycopg`, `pncp_pandas` e `pncp_cliente` foram só para comparar. Na próxima prática, a DAG vai gravar a tabela que segue para o dbt: `formacao.pncp_contratacoes`.

## Próximos passos

- [Prática: orquestrar a coleta com o Airflow](engenharia-airflow-dag.md)
- [Ingestão: trazer o dado da fonte para o banco](../explicacao/engenharia-ingestao.md)
