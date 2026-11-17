select
    c.numero_controle_pncp,
    c.numero_controle_pncp_compra,
    c.orgao_cnpj,
    c.unidade_codigo,
    c.unidade_nome,
    c.uf_sigla,
    e.nome_uf,
    c.tipo_contrato,
    c.categoria_processo,
    c.tipo_pessoa,
    c.numero_contrato_empenho,
    c.valor_global,
    c.data_assinatura,
    c.data_vigencia_inicio,
    c.data_vigencia_fim,
    c.dt_ingest,
    cast(date_trunc('month', c.data_assinatura) as date) as mes_assinatura,
    case when c.tipo_pessoa = 'PJ' then c.fornecedor_ni end as fornecedor_ni,
    case when c.tipo_pessoa = 'PJ' then c.fornecedor_nome end as fornecedor_nome
from {{ ref("pncp_contratos") }} as c
left join {{ ref("estados_brasil") }} as e on c.uf_sigla = e.sigla_uf
