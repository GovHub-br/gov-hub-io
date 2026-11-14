# Onde encontrar cada parte do projeto

> Tipo: **Referência**

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

## Referências de diretório nas aulas

Quando uma aula disser `models/` ou `macros/`, o ponto de partida será `airflow_lappis/dags/dbt/ipea/`, salvo indicação diferente. Para `plugins/`, o ponto de partida será `airflow_lappis/`.

Use este mapa para localizar a coleta, o cliente e os modelos do assunto que você está estudando. O README explica os comandos de execução; o histórico do Git permite acompanhar mudanças na estrutura.

## Exemplo: localizar uma mudança no pipeline

| Mudança pretendida | Ponto de investigação |
|---|---|
| Corrigir paginação ou autenticação na coleta de IBGE | `airflow_lappis/plugins/cliente_ibge.py` |
| Ajustar dependências e parâmetros dessa coleta | DAG correspondente em `airflow_lappis/dags/data_ingest/ibge/` |
| Corrigir a transformação dos registros recebidos | Modelos do domínio em `airflow_lappis/dags/dbt/ipea/models/` |
| Validar uma alteração no cliente | Testes correspondentes em `tests/` |

A investigação deve seguir a responsabilidade do componente. Uma regra de indicador incorreta pertence à transformação; duplicá-la no cliente cria duas implementações para manter.

## Veja também

- [Engenharia de dados: da fonte à decisão](../explicacao/engenharia-papel.md)
- [Preparar e conferir o ambiente local](../tutoriais/engenharia-ambiente.md)
