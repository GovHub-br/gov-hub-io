-- Falha se a silver expuser NI ou nome de fornecedor que não é pessoa jurídica.
select numero_controle_pncp, tipo_pessoa
from {{ ref("pncp_contratos_tratados") }}
where tipo_pessoa <> 'PJ' and (fornecedor_ni is not null or fornecedor_nome is not null)
