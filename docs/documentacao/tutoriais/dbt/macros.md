# Macros no dbt

Macros no dbt são blocos de código reutilizáveis escritos em SQL e Jinja que podem ser chamados em diferentes modelos do projeto. Eles funcionam como funções que encapsulam lógicas complexas ou repetitivas, tornando o código mais limpo e manutenível.

## Principais características das Macros

- **Reutilização de código:** Permite escrever uma lógica uma vez e reutilizá-la em vários modelos
- **Parametrização:** Aceita argumentos, tornando-as flexíveis e adaptáveis a diferentes contextos
- **Modularidade:** Facilita a manutenção do código ao centralizar lógicas comuns em um único lugar

## Tipos comuns de Macros

Existem diferentes tipos de macros que podem ser utilizadas no dbt:

- **Macros nativas:** fornecidas pelo próprio dbt, como `generate_schema_name()`
- **Macros personalizadas:** Criadas pelo usuário para atender necessidades específicas do projeto
- **Macros de pacotes:** Disponibilizadas através de pacotes dbt, como dbt_utils

## Exemplo de Macro

```sql
{% macro first_letter_uppercase_explicit(column) %}
    UPPER(LEFT({{ column }}, 1)) || LOWER(SUBSTRING({{ column }}, 2))
{% endmacro %}
```

Esta macro pode ser usada como no seguinte exemplo

```sql
SELECT 
    {{ first_letter_uppercase_explicit('first_name') }} as formatted_first_name,
    {{ first_letter_uppercase_explicit('last_name') }} as formatted_last_name
FROM users
```

Veja que a coluna é passada como string, pois o compilador do dbt faz a substituição textual do modelo e o SQL compilado será:

```sql
SELECT 
    UPPER(LEFT(first_name, 1)) || LOWER(SUBSTRING(first_name, 2)) as formatted_first_name,
    UPPER(LEFT(last_name, 1)) || LOWER(SUBSTRING(last_name, 2)) as formatted_last_name
FROM users
```

## Macros presentes no projeto

As macros compartilhadas ficam em `airflow/dags/dbt/gov_bricks/macros/`. Projetos específicos, como `compras_gov` e `mgi`, também podem ter macros locais quando a regra for exclusiva daquele domínio.

```
macros/
├── chave_conformada.sql
├── chaves_geradas.sql
├── schema_medallion.sql
└── testes.sql
```

## Como usar uma macro compartilhada

```sql
select
    {{ chave_conformada(["codigo_orgao", "numero_contrato"]) }} as id_contrato,
    codigo_orgao,
    numero_contrato
from {{ ref("contratos") }}
```

Quando uma macro for útil para mais de um projeto, prefira adicioná-la em
`gov_bricks`. Quando a regra for exclusiva de um domínio, mantenha a macro no
projeto específico.

Para consumir macros compartilhadas, o projeto dbt deve declarar o pacote local
em `packages.yml`:

```yaml
packages:
  - local: ../gov_bricks
```

## Referência

- [Macros e Jinja no dbt](https://docs.getdbt.com/docs/build/jinja-macros)
