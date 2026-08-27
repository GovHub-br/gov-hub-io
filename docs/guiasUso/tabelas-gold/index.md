# Criar Novas Tabelas Gold

As tabelas Gold representam a camada final de dados no GovHub, otimizadas para análise e consumo por dashboards e relatórios. Este guia explica como criar e configurar novas tabelas Gold.

## O que são Tabelas Gold?

Na arquitetura Medallion do GovHub:

- **Bronze**: Dados brutos dos sistemas estruturantes
- **Silver**: Dados limpos e padronizados
- **Gold**: Dados agregados e otimizados para análise

As tabelas Gold são:
- **Desnormalizadas** para performance de consulta
- **Agregadas** por dimensões de negócio relevantes
- **Documentadas** com metadados claros
- **Testadas** para garantir qualidade

## Processo de Criação

### 1. Planejamento

Antes de criar uma tabela Gold, defina:

#### Requisitos de Negócio
- Qual pergunta de negócio a tabela vai responder?
- Quem são os usuários finais?
- Qual a frequência de atualização necessária?

#### Fontes de Dados
- Quais tabelas Silver serão utilizadas?
- Há necessidade de dados externos?
- Existem dependências entre sistemas?

#### Estrutura da Tabela
- Quais são as dimensões principais?
- Quais métricas serão calculadas?
- Qual o nível de granularidade?

### 2. Desenvolvimento DBT

#### Estrutura de Arquivos

```
models/
└── gold/
    └── [dominio]/
        ├── [nome_tabela].sql
        ├── [nome_tabela].yml
        └── schema.yml
```

#### Exemplo: Tabela de Execução Orçamentária

**Arquivo**: `models/gold/orcamento/fct_execucao_orcamentaria_mensal.sql`

```sql
{{ config(
    materialized='table',
    indexes=[
        {'columns': ['ano_exercicio', 'mes_referencia'], 'type': 'btree'},
        {'columns': ['codigo_orgao'], 'type': 'btree'},
        {'columns': ['codigo_programa'], 'type': 'btree'}
    ]
) }}

WITH base_execucao AS (
    SELECT 
        -- Dimensões temporais
        ano_exercicio,
        mes_referencia,
        
        -- Dimensões organizacionais
        codigo_orgao,
        nome_orgao,
        codigo_unidade_orcamentaria,
        nome_unidade_orcamentaria,
        
        -- Dimensões programáticas
        codigo_funcao,
        nome_funcao,
        codigo_subfuncao,
        nome_subfuncao,
        codigo_programa,
        nome_programa,
        codigo_acao,
        nome_acao,
        
        -- Métricas financeiras
        SUM(valor_dotacao_inicial) AS dotacao_inicial,
        SUM(valor_dotacao_atual) AS dotacao_atual,
        SUM(valor_empenhado) AS valor_empenhado,
        SUM(valor_liquidado) AS valor_liquidado,
        SUM(valor_pago) AS valor_pago,
        
        -- Métricas calculadas
        SUM(valor_dotacao_atual - valor_empenhado) AS saldo_disponivel,
        CASE 
            WHEN SUM(valor_dotacao_atual) > 0 
            THEN SUM(valor_empenhado) / SUM(valor_dotacao_atual) * 100
            ELSE 0 
        END AS percentual_execucao
        
    FROM {{ ref('silver_siafi_execucao_orcamentaria') }}
    WHERE ano_exercicio >= 2020  -- Filtro para dados relevantes
    
    GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14
),

final AS (
    SELECT 
        *,
        -- Flags de análise
        CASE 
            WHEN percentual_execucao > 90 THEN 'Alta'
            WHEN percentual_execucao > 50 THEN 'Média'
            ELSE 'Baixa'
        END AS categoria_execucao,
        
        -- Metadados de processamento
        CURRENT_TIMESTAMP AS data_processamento,
        '{{ var("dbt_version") }}' AS versao_dbt
        
    FROM base_execucao
)

SELECT * FROM final
```

#### Documentação da Tabela

**Arquivo**: `models/gold/orcamento/fct_execucao_orcamentaria_mensal.yml`

```yaml
version: 2

models:
  - name: fct_execucao_orcamentaria_mensal
    description: |
      Tabela Gold com dados agregados de execução orçamentária mensal.
      Consolida informações do SIAFI para análise de performance orçamentária.
    
    columns:
      - name: ano_exercicio
        description: "Ano do exercício orçamentário"
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 2020
              max_value: 2030
      
      - name: mes_referencia
        description: "Mês de referência (1-12)"
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 1
              max_value: 12
      
      - name: codigo_orgao
        description: "Código do órgão executor"
        tests:
          - not_null
          - relationships:
              to: ref('dim_orgaos')
              field: codigo_orgao
      
      - name: dotacao_inicial
        description: "Valor da dotação orçamentária inicial (R$)"
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
      
      - name: percentual_execucao
        description: "Percentual de execução orçamentária (%)"
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
              max_value: 200  # Permite sobre-execução
```

### 3. Testes de Qualidade

#### Testes Básicos
- **not_null**: Campos obrigatórios
- **unique**: Chaves primárias
- **accepted_range**: Valores dentro de faixas esperadas
- **relationships**: Integridade referencial

#### Testes Customizados

**Arquivo**: `tests/gold/test_execucao_orcamentaria_consistencia.sql`

```sql
-- Testa se valor pago não excede valor liquidado
SELECT 
    ano_exercicio,
    mes_referencia,
    codigo_orgao,
    valor_liquidado,
    valor_pago
FROM {{ ref('fct_execucao_orcamentaria_mensal') }}
WHERE valor_pago > valor_liquidado
```

### 4. Configuração de Atualização

#### Agendamento no Airflow

```python
from datetime import datetime, timedelta
from airflow.sdk import DAG
from airflow.providers.standard.operators.bash import BashOperator

default_args = {
    'owner': 'govhub',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'gold_execucao_orcamentaria',
    default_args=default_args,
    description='Atualização da tabela Gold de execução orçamentária',
    schedule='0 6 * * *',  # Diário às 6h
    catchup=False
)

# Task para executar modelo DBT
run_dbt = BashOperator(
    task_id='run_gold_execucao_orcamentaria',
    bash_command='cd /opt/dbt && dbt run --models fct_execucao_orcamentaria_mensal',
    dag=dag
)

# Task para executar testes
test_dbt = BashOperator(
    task_id='test_gold_execucao_orcamentaria',
    bash_command='cd /opt/dbt && dbt test --models fct_execucao_orcamentaria_mensal',
    dag=dag
)

run_dbt >> test_dbt
```

## Boas Práticas

### Nomenclatura

- **Prefixos**:
  - `fct_`: Tabelas de fatos (métricas)
  - `dim_`: Tabelas de dimensões (atributos)
  - `agg_`: Agregações específicas

- **Sufixos**:
  - `_diario`: Granularidade diária
  - `_mensal`: Granularidade mensal
  - `_anual`: Granularidade anual

### Performance

- Use **índices** em colunas de filtro frequente
- Implemente **particionamento** por data quando apropriado
- Configure **materialização** adequada (table vs view vs incremental)

### Documentação

- Documente **todas as colunas**
- Inclua **exemplos de uso**
- Mantenha **changelog** de alterações
- Adicione **contatos** dos responsáveis

### Monitoramento

- Configure **alertas** para falhas de execução
- Monitore **tempo de execução**
- Acompanhe **volume de dados**
- Valide **qualidade** regularmente

## Exemplo Completo: Tabela de Contratos

### Requisito de Negócio
Criar visão consolidada dos contratos governamentais para análise de:
- Volume de contratações por órgão
- Distribuição por modalidade de licitação
- Evolução temporal dos valores
- Performance de fornecedores

### Implementação

```sql
-- models/gold/contratos/fct_contratos_consolidado.sql
{{ config(
    materialized='incremental',
    unique_key=['numero_contrato', 'data_snapshot'],
    on_schema_change='fail'
) }}

SELECT 
    -- Identificadores
    numero_contrato,
    codigo_orgao_contratante,
    cnpj_contratado,
    
    -- Dimensões temporais
    data_assinatura,
    data_inicio_vigencia,
    data_fim_vigencia,
    EXTRACT(YEAR FROM data_assinatura) AS ano_contrato,
    EXTRACT(MONTH FROM data_assinatura) AS mes_contrato,
    
    -- Dimensões categóricas
    modalidade_licitacao,
    objeto_contrato,
    situacao_contrato,
    
    -- Métricas financeiras
    valor_inicial,
    valor_atual,
    valor_pago,
    
    -- Métricas calculadas
    CASE 
        WHEN data_fim_vigencia < CURRENT_DATE THEN 'Encerrado'
        WHEN data_inicio_vigencia > CURRENT_DATE THEN 'Futuro'
        ELSE 'Vigente'
    END AS status_vigencia,
    
    -- Metadados
    CURRENT_DATE AS data_snapshot
    
FROM {{ ref('silver_contratos_comprasnet') }}

{% if is_incremental() %}
    WHERE data_ultima_atualizacao > (
        SELECT MAX(data_snapshot) FROM {{ this }}
    )
{% endif %}
```

## Próximos Passos

1. **Identifique** a necessidade de negócio
2. **Mapeie** as fontes de dados Silver
3. **Desenvolva** o modelo DBT
4. **Implemente** testes de qualidade
5. **Configure** o agendamento
6. **Documente** o processo
7. **Monitore** a execução

Para dúvidas ou suporte, consulte a equipe de dados do GovHub.
