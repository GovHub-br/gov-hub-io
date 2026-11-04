# Onde encontrar cada parte do projeto

> Tipo: **Referência**

## O que é um repositório?

Um **repositório** é uma pasta de projeto acompanhada de um histórico de alterações. O **Git** registra esse histórico; o **GitHub** hospeda uma cópia e permite a colaboração. Baixar uma cópia de trabalho do GitHub é **clonar** o repositório.

Na sua máquina, você pode abrir essa pasta em um editor, como o Visual Studio Code. A coluna lateral do editor mostra as pastas e os arquivos. Clicar em um arquivo permite ler seu conteúdo; abrir e ler não executa uma coleta.

## Como reconhecer os arquivos

A parte final do nome, chamada **extensão**, ajuda a entender seu papel: `.py` contém instruções Python; `.sql`, consultas e transformações; `.yml`, configuração; `.md`, texto de documentação. `README.md` costuma explicar por onde começar.

Um caminho como `airflow_lappis/plugins/cliente_ibge.py` significa: abra `airflow_lappis`, depois `plugins` e então o arquivo `cliente_ibge.py`. A barra separa pastas. Em `cliente_*.py`, o asterisco significa “nomes que começam com cliente_ e terminam com .py”; não é o nome literal de um arquivo.

## Qual repositório usar

Esta trilha está no site `gov-hub-io`, mas as práticas são feitas na aplicação **`GovHub-br/data-application-gov-hub`**. Não execute os comandos de preparação do pipeline dentro do repositório do site.

## Mapa para consulta

| Caminho na aplicação | O que procurar |
|---|---|
| `airflow_lappis/dags/data_ingest/` | Coletas, separadas por sistema de origem |
| `airflow_lappis/plugins/cliente_*.py` | Comunicação com fontes e banco |
| `airflow_lappis/helpers/` | Funções de apoio reutilizáveis |
| `airflow_lappis/dags/dbt/ipea/` | Modelos SQL, testes e documentação dbt |
| `docker/postgres/` | Preparação de perfis de acesso |
| `superset/` | Configuração do consumo em painéis |
| `notebooks/` | Cadernos de exploração, quando disponíveis |
| `tests/` | Testes do código Python |
| `.github/` | Contribuição, revisão e verificações automáticas |
| `Makefile` | Atalhos como `make setup` e `make test` |
| `local.env` e `.env` | Modelo de configuração e cópia local |

## Como ler um caminho

Quando uma aula disser `models/` ou `macros/`, o ponto de partida será `airflow_lappis/dags/dbt/ipea/`, salvo indicação diferente. Para `plugins/`, o ponto de partida será `airflow_lappis/`.

Use este mapa para localizar a coleta, o cliente e os modelos do assunto que você está estudando. O README explica os comandos de execução; o histórico do Git permite acompanhar mudanças na estrutura.

## Exemplo: transformar um caminho em uma ação

Ao ler `airflow_lappis/plugins/cliente_ibge.py`, faça a correspondência:

| Trecho | O que você abre no editor |
|---|---|
| `airflow_lappis/` | A pasta principal do código de dados |
| `plugins/` | A pasta de clientes e integrações |
| `cliente_ibge.py` | O arquivo Python que você quer ler |

Já `airflow_lappis/dags/data_ingest/ibge/` termina em uma pasta: ela contém arquivos, não é uma instrução para executar todos eles.

No terminal, `pwd` pode mostrar `/caminho/da/sua/pasta/data-application-gov-hub`. Esse é um exemplo de saída: o início varia conforme onde você clonou o projeto. O importante é reconhecer a pasta da aplicação antes de procurar os caminhos relativos. “Relativo” significa que o caminho parte da pasta em que você está, e não do início do computador.

## Uma primeira visita, sem alterar nada

Na pasta da aplicação, abra `README.md`. Depois localize `airflow_lappis`, `plugins` e `dags`. Escolha uma coleta do IBGE e procure o nome de um cliente dentro dela. Neste primeiro contato, basta reconhecer que um arquivo organiza a execução e outro conversa com a fonte. Não é necessário entender todas as linhas de código.

## Veja também

- [Engenharia de dados: da fonte à decisão](../explicacao/engenharia-papel.md)
- [Preparar e conferir o ambiente local](../tutoriais/engenharia-ambiente.md)
