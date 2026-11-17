select
    orgao_cnpj,
    mes_assinatura,
    tipo_contrato,
    count(*) as quantidade,
    sum(valor_global) as valor_global_total
from {{ ref("pncp_contratos_tratados") }}
group by orgao_cnpj, mes_assinatura, tipo_contrato
