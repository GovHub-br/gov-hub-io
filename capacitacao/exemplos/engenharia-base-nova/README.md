# Gabarito: a base de contratos do PNCP

Os arquivos que as aulas do nível 5 de Engenharia de Dados pedem que você escreva, exatamente como foram verificados. Use-os para **comparar** com o seu trabalho, e não para copiar antes de tentar: o aprendizado está em escrever cada etapa e conferir o resultado.

Os caminhos são os do repositório `data-application-gov-hub`, na revisão `046bae840132cd17e6ba55a7ff9c942105f59927`, e os testes foram executados com o dbt 1.7.13, a versão que o `requirements.txt` da aplicação fixa.

| Arquivo | Aula |
|---|---|
| `cliente_pncp.patch` (o método `get_contratos`, como diferença em `plugins/cliente_pncp.py`) | [O cliente da fonte](../../docs/tutoriais/engenharia-base-nova-cliente.md) |
| `tests/test_plugins/test_cliente_pncp.py` | [O cliente da fonte](../../docs/tutoriais/engenharia-base-nova-cliente.md) |
| `tests/dags/test_pncp_contratos_ingest_dag.py` | [A DAG de ingestão](../../docs/tutoriais/engenharia-base-nova-dag.md) |
| `airflow_lappis/dags/data_ingest/pncp/contratos_ingest_dag.py` | [A DAG de ingestão](../../docs/tutoriais/engenharia-base-nova-dag.md) |
| `dbt_project_e_sources.patch` (o bloco `pncp_dbt` e a fonte `pncp`, como diferença) | [O domínio no dbt](../../docs/tutoriais/engenharia-base-nova-dominio.md) |
| `airflow_lappis/dags/dbt/ipea/models/pncp_dbt/bronze/` | [A bronze](../../docs/tutoriais/engenharia-base-nova-bronze.md) |
| `airflow_lappis/dags/dbt/ipea/models/pncp_dbt/silver/` e o teste de privacidade em `tests/pncp/` | [A silver](../../docs/tutoriais/engenharia-base-nova-silver.md) |
| `airflow_lappis/dags/dbt/ipea/models/pncp_dbt/gold/` e os dois testes da gold em `tests/pncp/` | [A gold e a conferência](../../docs/tutoriais/engenharia-base-nova-gold.md) |

## Como usar

1. Faça a aula e escreva os arquivos você mesmo.
2. Se algo divergir dos números das aulas, compare o seu arquivo com o daqui (`diff` ou o editor).
3. Os dois arquivos `.patch` mostram só as linhas acrescentadas aos arquivos que já existiam; aplique-os à mão ou com `git apply`, na raiz do repositório da aplicação.

## O que não está aqui

Os ajustes locais do nível 2 (`+database: postgres` e o `profiles.yml`), que não entram em nenhum pull request, e o código da correção da regra de MEI, que é a [parte 2 do desafio](../../docs/desafios/engenharia-desafio.md).
