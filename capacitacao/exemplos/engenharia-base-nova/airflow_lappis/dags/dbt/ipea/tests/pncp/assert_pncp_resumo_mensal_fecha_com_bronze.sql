-- Falha se a gold não tiver a mesma quantidade e o mesmo valor total da bronze.
with
    bronze as (
        select count(*) as quantidade, sum(valor_global) as valor
        from {{ ref("pncp_contratos") }}
    ),

    gold as (
        select sum(quantidade) as quantidade, sum(valor_global_total) as valor
        from {{ ref("pncp_contratos_resumo_mensal") }}
    )

select
    bronze.quantidade as quantidade_bronze,
    gold.quantidade as quantidade_gold,
    bronze.valor as valor_bronze,
    gold.valor as valor_gold
from bronze, gold
where bronze.quantidade <> gold.quantidade or bronze.valor <> gold.valor
