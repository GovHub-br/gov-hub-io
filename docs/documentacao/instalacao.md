# Instalação local

Este guia prepara o ambiente de desenvolvimento do
[`data-application-gov-hub`](https://github.com/GovHub-br/data-application-gov-hub),
que reúne Airflow, dbt, PostgreSQL, Superset e Jupyter.

## Pré-requisitos

Instale antes de começar:

- Git;
- Docker 24 ou superior com Docker Compose 2;
- Make;
- Python 3.11;
- [pipx](https://pipx.pypa.io/);
- Poetry 1.8.5.

Verifique as ferramentas principais:

```bash
git --version
docker --version
docker compose version
make --version
python --version
poetry --version
```

Se o Poetry ainda não estiver instalado:

```bash
pipx install poetry==1.8.5
```

## 1. Clonar o repositório

```bash
git clone git@github.com:GovHub-br/data-application-gov-hub.git
cd data-application-gov-hub
```

Para contribuir, configure também a assinatura de commits descrita no
[Git Workflow](onboarding/git-workflow.md).

## 2. Preparar o ambiente

```bash
make setup
```

O comando executa o fluxo local completo:

1. cria `.env` a partir de `local.env`, quando necessário;
2. instala as dependências com Poetry;
3. configura os hooks do Git;
4. constrói e inicia os serviços com Docker Compose;
5. configura as variáveis e a conexão local do Airflow;
6. valida a configuração básica do ambiente.

!!! warning "Credenciais locais"
    Os valores de `local.env` são exclusivos para desenvolvimento. Nunca use
    essas credenciais em ambientes compartilhados nem adicione segredos reais
    ao repositório.

## 3. Verificar os serviços

```bash
docker compose ps
make dev-check
```

Os serviços devem estar disponíveis em:

| Serviço | Endereço local |
| --- | --- |
| Airflow | <http://localhost:8080> |
| Superset | <http://localhost:8088> |
| Jupyter | <http://localhost:8888> |
| PostgreSQL | `localhost:5432` |

As credenciais padrão de Airflow e Superset estão no arquivo `.env` criado
para o ambiente local.

## Comandos do dia a dia

| Comando | Finalidade |
| --- | --- |
| `docker compose up -d` | iniciar os serviços |
| `docker compose logs -f` | acompanhar os logs |
| `docker compose down` | encerrar os serviços |
| `make dev` | reconfigurar Airflow para desenvolvimento |
| `make dev-check` | validar variáveis e conexão do Airflow |
| `make format` | formatar Python e SQL |
| `make lint` | executar verificações estáticas |
| `make test` | executar os testes automatizados |

## Próximos passos

- Entenda o fluxo completo em [Visão Geral da Arquitetura](arquitetura/visao-geral.md).
- Conheça a estrutura de DAGs em [Apache Airflow](pipeline/airflow.md).
- Configure e execute modelos seguindo a documentação de [dbt](pipeline/dbt.md).
- Consulte [Troubleshooting](onboarding/troubleshooting.md) caso algum serviço não inicie.
