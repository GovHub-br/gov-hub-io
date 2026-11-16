-- Cadeia de camadas da base de estudo do nível 3 (aula "Definir as responsabilidades de cada camada").
-- Pré-requisito: base-de-estudo.sql já executado.
--
-- Cada visão imita um modelo dbt real da aplicação, em airflow_lappis/dags/dbt/ipea/models/contratos_dbt/:
--   bronze_contratos           -> bronze/contratos.sql
--   bronze_empenhos            -> bronze/empenhos_tesouro.sql (simplificado)
--   bronze_unidades_gestoras   -> tabela de referência das unidades
--   silver_contratos_empenhos  -> silver/contratos_empenhos.sql (simplificado)
--   gold_contratos_resumo      -> gold/contratos_resumo.sql
-- No dbt, cada select seria um arquivo .sql e as dependências viriam de source() e ref().

-- BRONZE: um registro por linha da fonte, com tipos e formatos corrigidos.
create or replace view estudo_modelagem.bronze_contratos as
select
    id,
    numero,
    fornecedor_nome,
    situacao,
    codigo_ug,
    cast(replace(replace(valor_global, '.', ''), ',', '.') as numeric(15, 2)) as valor_global,
    case
        when data_assinatura ~ '^\d{4}-\d{2}-\d{2}$' then to_date(data_assinatura, 'YYYY-MM-DD')
    end as data_assinatura,
    (dt_ingest || '-03:00')::timestamptz as dt_ingest
from estudo_modelagem.raw_contratos;

create or replace view estudo_modelagem.bronze_empenhos as
select
    ne,
    contrato_id,
    to_date(emissao, 'YYYY-MM-DD') as emissao,
    cast(replace(replace(despesas_pagas, '.', ''), ',', '.') as numeric(15, 2)) as despesas_pagas,
    (dt_ingest || '-03:00')::timestamptz as dt_ingest
from estudo_modelagem.raw_empenhos;

create or replace view estudo_modelagem.bronze_unidades_gestoras as
select trim(codigo) as codigo, trim(nome) as nome
from estudo_modelagem.raw_unidades_gestoras;

-- SILVER: relaciona contratos e empenhos. Uma linha por contrato e empenho associado;
-- contrato sem empenho aparece uma vez, com o empenho nulo.
-- O filtro de situação repete o do modelo real contratos_empenhos.
create or replace view estudo_modelagem.silver_contratos_empenhos as
select
    c.id as contrato_id,
    e.ne,
    e.emissao,
    e.despesas_pagas,
    c.numero,
    c.fornecedor_nome,
    greatest(c.dt_ingest, e.dt_ingest) as dt_ingest
from estudo_modelagem.bronze_contratos as c
left join estudo_modelagem.bronze_empenhos as e on e.contrato_id = c.id
where c.situacao = 'Ativo';

-- GOLD: uma linha por contrato. Soma os pagamentos ANTES de juntar ao contrato,
-- como faz a CTE valores_pagos_contratos do modelo real.
create or replace view estudo_modelagem.gold_contratos_resumo as
with valores_pagos_contratos as (
    select contrato_id as id, sum(despesas_pagas) as despesas_pagas
    from estudo_modelagem.silver_contratos_empenhos
    group by contrato_id
)
select
    c.id as contrato_id,
    c.numero,
    c.situacao,
    concat(c.codigo_ug, ' - ', coalesce(u.nome, 'unidade não cadastrada')) as unidade,
    c.valor_global,
    vp.despesas_pagas,
    case when vp.despesas_pagas = c.valor_global then 'Sim' else 'Não' end as pendente_baixa
from estudo_modelagem.bronze_contratos as c
left join valores_pagos_contratos as vp using (id)
left join estudo_modelagem.bronze_unidades_gestoras as u on u.codigo = c.codigo_ug;

select contrato_id, situacao, valor_global, despesas_pagas, pendente_baixa
from estudo_modelagem.gold_contratos_resumo
order by contrato_id;
