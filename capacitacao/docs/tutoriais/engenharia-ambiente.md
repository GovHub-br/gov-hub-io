# Inicializar os serviços com make setup

> Tipo: **Tutorial**

## O que você vai preparar

Os serviços locais da aplicação e sua configuração inicial. Esta aula pressupõe requisitos e `.env` revisados nas etapas anteriores.

## 1. Preparar as dependências e os serviços

Na raiz da aplicação, no percurso com Poetry, selecione o Python do projeto e execute o setup:

```bash
poetry env use python3.11
make setup
```

O `Makefile` organiza as seguintes ações:

| Etapa | Resultado esperado |
|---|---|
| Preparação do `.env` | Configuração local criada se ainda não existir |
| Instalação com Poetry | Dependências do projeto e de desenvolvimento disponíveis |
| Configuração dos hooks | Verificações do fluxo de contribuição preparadas |
| Construção e início com Compose | Imagens e serviços locais iniciados |
| `make dev` | Variáveis e conexão padrão do Airflow configuradas |
| `make dev-check` | Presença dessas configurações conferida |

A primeira execução pode demorar. Observe a etapa em que um erro ocorreu: falha de instalação de dependência e falha de inicialização de um serviço exigem diagnósticos diferentes.

## 2. Conferir os serviços

```bash
docker compose ps
make dev-check
```

| Serviço | Acesso no computador | Verificação inicial |
|---|---|---|
| Airflow | `http://localhost:8080` | Interface disponível e login local funcionando |
| Superset | `http://localhost:8088` | Interface e inicialização concluídas |
| PostgreSQL | `localhost:5432` | Serviço pronto e conexão validável |

`make dev-check` confere as Variables e a Connection esperadas. Ele não substitui a validação de uma conexão SQL real, nem garante que todas as fontes externas estejam acessíveis.

## Como verificar que esta etapa terminou

Os serviços necessários estão ativos, as interfaces locais respondem e `make dev-check` aprova. As próximas aulas validam DAGs, banco e perfil dbt separadamente.

No Compose usado neste percurso, MinIO não é um serviço da instalação. Não use a disponibilidade das portas 9000 e 9001 como critério de sucesso deste ambiente.

## Referências

- [Instalação e comandos locais](https://gov-hub.io/documentacao/instalacao/)
- [Configuração local do Airflow](https://gov-hub.io/documentacao/pipeline/airflow/)

## Veja também

- [Configuração local e credenciais](../guias/engenharia-configuracao-local.md)
- [Validar o Airflow e suas integrações](../guias/engenharia-airflow-configuracao.md)
