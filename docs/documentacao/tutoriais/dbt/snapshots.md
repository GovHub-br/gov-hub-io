# Snapshots no dbt

Snapshots são uma funcionalidade do dbt que permite rastrear e registrar mudanças em dados ao longo do tempo, criando um histórico de alterações em tabelas específicas.

## Principais características

- Captura o estado dos dados em diferentes momentos
- Mantém um registro histórico de alterações
- Permite análise de mudanças ao longo do tempo
- Útil para auditoria e compliance

## Casos de uso comuns

- Rastreamento de alterações em dados dimensionais
- Auditoria de mudanças em dados sensíveis
- Análise histórica de alterações em tabelas
- Conformidade com requisitos regulatórios

## Como implementar

Os snapshots funcionam através de duas estratégias principais:

1. Timestamp Strategy
    - Utiliza colunas de timestamp para rastrear quando os registros foram atualizados pela última vez.
    - Exige uma coluna que informe o momento da alteração para comparação com a versão anterior.
2. Check Strategy
    - Compara valores específicos das colunas para identificar mudanças nos registros. Se for detectada uma mudança em quaisquer dessas colunas, essa alteração será registrada como uma nova linha da tabela de snapshots

### Adicionando snapshots ao projeto

O projeto Ipea usa `airflow_lappis/dags/dbt/ipea/snapshots/tables_snapshot.yml`
para declarar snapshots em YAML.

```yaml
snapshots:
  - name: contratos_snapshot
    relation: ref('contratos')
    config:
      schema: snapshots
      database: analytics
      unique_key: id
      strategy: check
      check_cols: [situacao, num_parcelas, valor_parcela, valor_global, valor_acumulado]
```

Isso define uma tabela `snapshots.contratos_snapshot`  que pode ser consultada para averiguar as alterações ao longo do tempo.

## Boas práticas

Para um uso efetivo dos snapshots, recomenda-se:

- Definir claramente quais tabelas precisam de snapshots
- Escolher a estratégia adequada para cada caso
- Manter uma política de retenção de dados
- Documentar a configuração dos snapshots

Snapshots ajudam a manter rastreabilidade histórica quando alterações de estado
precisam ser consultadas ao longo do tempo.

## Referência

- [Snapshots no dbt](https://docs.getdbt.com/docs/build/snapshots)
