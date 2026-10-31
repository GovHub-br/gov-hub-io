---
title: ''
date: 2024-01-10
description: O DBT é uma ferramenta essencial para transformação de dados no Gov Hub. Aprenda como configurar e usar
tipo: produto
categories:
  - Tutorial
  - DBT
  - Infraestrutura
card_label: Tutorial
card_image: /land/dist/images/publicacoes/dbt.svg
pdf: ''
pagina_especial: false
fotos: []
draft: false
cover_image: ./images/dbt-tutorial.png
---

# Como Usar DBT no Gov Hub: Guia Completo

O DBT (Data Build Tool) é uma ferramenta essencial para transformação de dados no GovHub. Neste tutorial, você aprenderá como configurar e usar o DBT em sua implementação.

<!-- more -->

## O que é DBT?

O DBT permite que analistas e engenheiros de dados transformem dados em seu warehouse através de comandos SELECT simples, organizando o código de transformação em modelos reutilizáveis.

## Configuração Inicial

### 1. Instalação

```bash
pip install dbt-core dbt-postgres
```

### 2. Configuração do Projeto

Crie seu arquivo `dbt_project.yml`:

```yaml
name: 'govhub_analytics'
version: '1.0.0'
config-version: 2

model-paths: ["models"]
analysis-paths: ["analysis"]
test-paths: ["tests"]
seed-paths: ["data"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]
```

## Modelos e Transformações

### Arquitetura Medallion

O GovHub utiliza a arquitetura medallion com três camadas:

- **Bronze**: Dados brutos
- **Silver**: Dados limpos e estruturados  
- **Gold**: Dados agregados para análise

### Exemplo de Modelo

```sql
-- models/silver/dim_orgaos.sql
{{ config(materialized='table') }}

SELECT 
    codigo_orgao,
    nome_orgao,
    sigla_orgao,
    esfera_governo,
    created_at,
    updated_at
FROM {{ ref('bronze_orgaos') }}
WHERE status = 'ativo'
```

## Testes e Validação

```sql
-- tests/assert_orgaos_unicos.sql
SELECT codigo_orgao, count(*)
FROM {{ ref('dim_orgaos') }}
GROUP BY codigo_orgao
HAVING count(*) > 1
```

## Próximos Passos

- Explore nossa [documentação completa sobre DBT](../../documentacao/tutoriais/dbt/modelos.md)
- Veja exemplos práticos em nossos [templates de dashboard](../../documentacao/visualizacao/superset.md#dashboards)

***

_Para mais tutoriais como este, visite nossa_ [_página de publicações_](/publicacoes/)*.*
