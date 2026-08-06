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

As macros estão em `airflow_lappis/dags/dbt/ipea/macros/`.

```
macros/
├── udfs/
│   ├── f_format_nc.sql
│   └── f_parse_dates.sql
├── create_udfs.sql
├── get_custom_schema.sql
└── parse_financial_value.sql
```

## User-Defined-Functions (UDF)

Macros geram trechos de SQL durante a compilação. UDFs são funções criadas no
banco e executadas durante a consulta. No projeto, as macros que definem UDFs
ficam em `macros/udfs/` e seguem o formato `f_<nome_da_funcao>.sql`.

```sql
{% macro create_f_format_nc() %}
    create or replace function {{ target.schema }}.format_nc(in_text text)
    returns text
    as $$ 
    
    with 

    pre_process as (
        select left(in_text, 7) as prefix,
            right(in_text, 4)::numeric as posfix
    )
    
    select concat(prefix, to_char(posfix, 'FM00000')) as result
    from pre_process 
    
    $$
    language sql
    ;
{% endmacro %}
```

Somente isso não é o suficiente para que os modelos possam utilizá-la, para isso criamos a macro `create_udfs.sql` , que inicializa as funções e as deixam prontas para uso

```sql
{% macro create_udfs() %}

create schema if not exists {{ target.schema }};

    {{ create_f_parse_dates() }}
    ;
    {{ create_f_format_nc() }}
    ;

{% endmacro %}
```

 No arquivo `dbt_project.yml` foi adicionado a seguinte configuração:

```yaml
# outras configs

on-run-start:
  - '{{create_udfs()}}'
```

Isso cria as funções no início de cada execução do projeto.

## Referência

- [Macros e Jinja no dbt](https://docs.getdbt.com/docs/build/jinja-macros)
