-- Falha se houver mais de uma linha para o mesmo órgão, mês e tipo de instrumento.
select orgao_cnpj, mes_assinatura, tipo_contrato, count(*) as linhas
from {{ ref("pncp_contratos_resumo_mensal") }}
group by orgao_cnpj, mes_assinatura, tipo_contrato
having count(*) > 1
