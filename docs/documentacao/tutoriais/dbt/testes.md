# Testes no dbt

O dbt executa validações junto dos modelos e transforma falhas de qualidade em
resultados rastreáveis no pipeline.

## Testes genéricos

Testes genéricos são parametrizados e reutilizados em arquivos YAML. O dbt
oferece quatro testes nativos:

| Teste | Validação |
| --- | --- |
| `unique` | valores únicos em uma coluna ou chave |
| `not_null` | ausência de valores nulos |
| `accepted_values` | valores limitados a um conjunto conhecido |
| `relationships` | integridade referencial entre modelos |

O GovHub também possui testes genéricos próprios em
`airflow_lappis/dags/dbt/ipea/macros/data_quality/`, como validação de tipos e
comparação de contagem entre camadas.

Exemplo em `schema.yml`:

```yaml
version: 2

models:
  - name: contratos
    description: Contratos tratados para consumo analítico.
    columns:
      - name: id
        description: Identificador único do contrato.
        data_tests:
          - not_null
          - unique
    data_tests:
      - row_count_match:
          source_table: compras_gov.contratos
          target_table: contratos.contratos
```

## Testes singulares

Testes singulares são consultas SQL armazenadas em `tests/`. A consulta deve
retornar os registros que violam a regra; resultado vazio significa sucesso.

```sql
-- tests/assert_contratos_valor_nao_negativo.sql
select *
from {{ ref('contratos') }}
where valor_global < 0
```

Use testes singulares para regras de negócio que não cabem em um teste
genérico reutilizável.

## Execução

Execute os comandos dentro do projeto dbt alterado:

```bash
cd airflow_lappis/dags/dbt/ipea

dbt test
dbt test --select contratos
dbt test --select test_type:singular
```

Quando o projeto é orquestrado pelo Cosmos, os testes aparecem como tarefas no
grafo da DAG e podem bloquear modelos dependentes.

## Referências

- [Testes de dados no dbt](https://docs.getdbt.com/docs/build/data-tests)
- [Qualidade de Dados](../../pipeline/qualidade.md)
