-- Base de estudo do nível 3 da trilha de Engenharia de Dados no Gov Hub.
--
-- Dados sintéticos que imitam a cadeia real de contratos da aplicação:
-- compras_gov.contratos -> contratos (bronze) -> contratos_empenhos (silver) -> contratos_resumo (gold).
-- Nenhum dado pessoal; códigos de unidade, números e fornecedores são fictícios.
--
-- Como na ingestão real (insert_data, em plugins/cliente_postgres.py), todas as colunas
-- das tabelas raw_ são texto, e os valores chegam no formato brasileiro ('1.234,56').
--
-- Executar de novo recria tudo do zero. Para remover:
--   drop schema estudo_modelagem cascade;

drop schema if exists estudo_modelagem cascade;
create schema estudo_modelagem;

-- Contratos, como chegariam do ComprasGov.
create table estudo_modelagem.raw_contratos (
    id               text,
    numero           text,
    fornecedor_nome  text,
    situacao         text,
    codigo_ug        text,
    valor_global     text,
    data_assinatura  text,
    dt_ingest        text
);

insert into estudo_modelagem.raw_contratos values
    ('101', '00012/2026', 'Alfa Manutenção Predial', 'Ativo',   '990001', '120.000,00', '2026-01-15', '2026-10-01 08:00:00'),
    ('102', '00031/2026', 'Beta Tecnologia',         'Ativo',   '990001', '45.500,50',  '2026-02-03', '2026-10-01 08:00:00'),
    ('103', '00047/2026', 'Gama Limpeza',            'Ativo',   '990009', '80.000,00',  '15/03/2026', '2026-10-01 08:00:00'),
    ('104', '00008/2025', 'Delta Consultoria',       'Inativo', '990002', '15.000,00',  '2025-04-10', '2026-10-01 08:00:00');

-- Unidades gestoras: a 990009, usada pelo contrato 103, não está cadastrada.
create table estudo_modelagem.raw_unidades_gestoras (
    codigo  text,
    nome    text
);

insert into estudo_modelagem.raw_unidades_gestoras values
    ('990001', 'Coordenação de Administração'),
    ('990002', 'Coordenação de Pesquisa');

-- Empenhos com o valor pago. O 2026NE000900 não foi associado a nenhum contrato.
create table estudo_modelagem.raw_empenhos (
    ne              text,
    contrato_id     text,
    emissao         text,
    despesas_pagas  text,
    dt_ingest       text
);

insert into estudo_modelagem.raw_empenhos values
    ('2026NE000101', '101', '2026-02-10', '30.000,00', '2026-10-01 08:05:00'),
    ('2026NE000102', '101', '2026-05-12', '20.000,00', '2026-10-01 08:05:00'),
    ('2026NE000201', '102', '2026-03-05', '45.500,50', '2026-10-01 08:05:00'),
    ('2025NE000401', '104', '2025-06-20', '15.000,00', '2026-10-01 08:05:00'),
    ('2026NE000900', null,  '2026-04-18', '7.250,00',  '2026-10-01 08:05:00');

select 'raw_contratos' as tabela, count(*) as linhas from estudo_modelagem.raw_contratos
union all
select 'raw_unidades_gestoras', count(*) from estudo_modelagem.raw_unidades_gestoras
union all
select 'raw_empenhos', count(*) from estudo_modelagem.raw_empenhos;
