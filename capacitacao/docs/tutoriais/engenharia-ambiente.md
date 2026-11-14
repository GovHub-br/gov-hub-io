# Preparar e conferir o ambiente local

> Tipo: **Tutorial**

## O que você vai construir

Um ambiente local para estudar as coletas e as transformações, sem depender do ambiente de produção.

## Antes de começar

Pré-requisitos: Git, Docker com Compose, Make, Python 3.11 e Poetry 1.8.5. O exemplo de clone usa `gh` instalado e autenticado. Credenciais das fontes são necessárias apenas para as DAGs que acessam sistemas protegidos. Execute os comandos na raiz de `data-application-gov-hub`, que contém o `Makefile`.

## Passos

1. Baixe a aplicação, em uma pasta diferente da pasta do site:

   ```bash
   gh repo clone GovHub-br/data-application-gov-hub
   cd data-application-gov-hub
   ```

2. Leia `local.env` e o alvo `setup` no `Makefile`. Com o Docker aberto, execute:

   ```bash
   make setup
   make dev-check
   docker compose ps
   ```

   O comando `make setup` prepara o `.env`, instala dependências, constrói os serviços e configura o Airflow. A primeira execução pode demorar.

3. Abra os serviços:

   | Serviço | Endereço | Acesso |
   |---|---|---|
   | Airflow | `http://localhost:8080` | Variáveis `_AIRFLOW_WWW_USER_*` do `.env` |
   | Superset | `http://localhost:8088` | Configuração local no Compose |
   | Jupyter | `http://localhost:8888` | Configuração local no Compose |
   | PostgreSQL | Porta `5432` | Variáveis `POSTGRES_*` do `.env` |

4. Confira uma DAG de IBGE na tela e encontre seu arquivo em `airflow_lappis/dags/data_ingest/ibge/`.

## Exemplo: conferir a preparação da aplicação

| Verificação | Evidência esperada |
|---|---|
| `make dev-check` | Configuração e conexão do Airflow aprovadas |
| `docker compose ps` | Serviços necessários à prática ativos |
| DAG de IBGE na interface | Identificador correspondente ao arquivo em `dags/data_ingest/ibge/` |
| Logs da coleta e tabela de destino | Execução concluída e registros do período conferidos |

Serviços ativos comprovam a disponibilidade do ambiente, não a execução ou a qualidade de uma carga. Confira separadamente a DAG, o período processado e o conteúdo gravado.

## Como verificar

Os serviços aparecem ativos e o nome da DAG na interface corresponde ao código. Se houver erro, leia `docker compose logs` do serviço que falhou.

Para parar, use `docker compose down`; para retomar, `docker compose up -d`. Evite `down -v`: ele remove os volumes e pode apagar o banco local. O MinIO não integra o Compose da aplicação.

## Configuração local da aplicação

`make setup` prepara o `.env` a partir de `local.env` quando a cópia local ainda não existe. Confira as variáveis `POSTGRES_*`, `_AIRFLOW_WWW_USER_*` e as configurações das fontes que serão usadas na prática.

Mantenha o `.env` fora do controle de versão. `local.env` deve conter apenas o modelo de configuração, sem credenciais reais. O MinIO permanece preparatório e não é necessário para as práticas PostgreSQL desta trilha.

## Veja também

- [Onde encontrar cada parte do projeto](../referencia/engenharia-mapa-repositorio.md)
- [Vocabulário e fontes do governo](../referencia/engenharia-glossario.md)
