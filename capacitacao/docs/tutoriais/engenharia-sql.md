# Prática: SQL para decidir quem entra no resultado

> Tipo: **Tutorial**

## A pergunta que acompanha todo o nível

A equipe que acompanha a execução dos contratos pede um painel com uma pergunta simples: **quanto foi contratado e quanto já foi pago em cada contrato?**

A resposta parece um `select` com um `sum`. Na prática, antes do primeiro número aparecer, alguém precisa decidir qual contrato entra, como um pagamento se liga a um contrato, o que fazer quando falta uma informação e o que pode ser somado. Uma consulta pode executar sem erro e, mesmo assim, deixar contratos de fora ou contar o mesmo valor duas vezes.

Ao longo deste nível, você vai construir a tabela que responde essa pergunta, do dado bruto até a entrega no Superset. A tabela imita um modelo real da aplicação, o `contratos_resumo`.

<details class="saiba-mais">
<summary>Para quem não é da área: contrato, empenho e pagamento</summary>
<p>No governo, assinar um contrato não move dinheiro. O <strong>contrato</strong> é o acordo com o fornecedor: define o que será entregue, por quanto tempo e o <strong>valor global</strong>, o máximo que pode ser gasto, que aditivos podem alterar. Ele fica registrado no Compras.gov.br.</p>
<p>O dinheiro sai em três etapas, registradas no SIAFI, o sistema financeiro do governo federal:</p>
<ol>
<li><strong>Empenho:</strong> reserva parte do orçamento para aquela despesa e gera uma nota de empenho, com número como <code>2026NE000101</code>.</li>
<li><strong>Liquidação:</strong> confirma que o serviço foi prestado ou o bem foi entregue, em geral com a fatura atestada.</li>
<li><strong>Pagamento:</strong> transfere o valor ao fornecedor.</li>
</ol>
<p>Um contrato costuma ter <strong>vários empenhos</strong>, por exemplo um por ano de vigência, e cada empenho acumula quanto foi empenhado, liquidado e pago. Por isso, "quanto foi contratado" vem do contrato (<code>valor_global</code>), e "quanto foi pago" vem da soma dos empenhos (<code>despesas_pagas</code>). Como contrato e empenho ficam em sistemas diferentes, a ligação entre eles nem sempre vem pronta: há empenhos que o projeto não consegue associar a nenhum contrato.</p>
</details>

A prática de SQL tem duas partes. Nesta primeira, você cria os dados de estudo e vê como um JOIN e um filtro decidem **quem entra** no resultado. Na [segunda parte](engenharia-sql-medidas.md), você vê como **contar e somar** sem enganos.

![Os quatro contratos da base de estudo e duas formas de juntá-los às unidades gestoras. Os contratos 101 e 102 são da unidade 990001, que está cadastrada. O contrato 103 é da unidade 990009, que não está no cadastro, e o 104 está inativo. Com INNER JOIN, o resultado tem só 101 e 102: o 103 some, embora seja um contrato ativo. Com LEFT JOIN, o resultado tem 101, 102 e 103, este com a unidade nula.](../../assets/diagramas/engenharia-sql-populacao.png)

## O que você vai aprender

- Criar a base de estudo que acompanha todo o nível.
- Converter um valor que chega como texto no formato brasileiro.
- Ver como `inner join` e `left join` mudam quem entra no resultado.
- Perceber por que uma comparação com nulo pode tirar linhas sem aviso.

## Antes de começar

- Um cliente SQL conectado ao PostgreSQL local, como preparado em [Validar PostgreSQL e Superset](../guias/engenharia-acessos-locais.md). Serve o SQL Lab do Superset, o DBeaver ou o `psql`.
- A prática cria um schema próprio, `estudo_modelagem`, com dados sintéticos. Ela não lê nem altera as tabelas da aplicação e não precisa de nenhuma coleta. Para apagar tudo no final do nível: `drop schema estudo_modelagem cascade;`.

## Passo 1: criar a base de estudo

Execute o script abaixo. Ele também está em [base-de-estudo.sql](../../exemplos/engenharia-modelagem/base-de-estudo.sql), e você pode executá-lo de novo sempre que quiser voltar ao estado inicial.

```sql
drop schema if exists estudo_modelagem cascade;
create schema estudo_modelagem;

-- Contratos, como chegariam do ComprasGov: tudo texto, valores no formato brasileiro.
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
```

As colunas são todas `text` de propósito. É assim que a ingestão do Gov Hub grava a camada raw: o `insert_data` de `plugins/cliente_postgres.py` cria as colunas como texto, e a conversão de tipos fica para depois.

Cada linha foi escolhida para provocar uma decisão que você vai encontrar em dados reais:

| Registro | Situação | Que decisão ele provoca |
|---|---|---|
| Contrato 101 | Ativo, dois empenhos pagos | Uma junção com empenhos gera duas linhas para ele |
| Contrato 102 | Ativo, pago por inteiro | Caso simples, que serve de referência |
| Contrato 103 | Ativo, sem empenho, unidade não cadastrada, data em outro formato | O que fazer quando falta informação |
| Contrato 104 | Inativo, com pagamento | Contrato encerrado entra no indicador? |
| Empenho 2026NE000900 | Sem contrato associado | Para onde vai um pagamento que não se liga a nada? |

## Passo 2: ler a raw e converter o valor

```sql
select id, situacao, codigo_ug, valor_global, data_assinatura
from estudo_modelagem.raw_contratos
order by id;
```

```text
 id  | situacao | codigo_ug | valor_global | data_assinatura
-----+----------+-----------+--------------+-----------------
 101 | Ativo    | 990001    | 120.000,00   | 2026-01-15
 102 | Ativo    | 990001    | 45.500,50    | 2026-02-03
 103 | Ativo    | 990009    | 80.000,00    | 15/03/2026
 104 | Inativo  | 990002    | 15.000,00    | 2025-04-10
```

Tente somar o valor global:

```sql
select sum(valor_global) from estudo_modelagem.raw_contratos;
```

```text
ERROR:  function sum(text) does not exist
```

O banco não soma texto. Para virar número, `'120.000,00'` precisa perder o ponto de milhar e trocar a vírgula decimal por ponto:

```sql
select id, valor_global,
       cast(replace(replace(valor_global, '.', ''), ',', '.') as numeric(15, 2)) as valor_global_numero
from estudo_modelagem.raw_contratos
order by id;
```

```text
 id  | valor_global | valor_global_numero
-----+--------------+---------------------
 101 | 120.000,00   |           120000.00
 102 | 45.500,50    |            45500.50
 103 | 80.000,00    |            80000.00
 104 | 15.000,00    |            15000.00
```

Leia de dentro para fora: o primeiro `replace` apaga os pontos (`120000,00`), o segundo troca a vírgula por ponto (`120000.00`) e o `cast` transforma o texto em `numeric(15, 2)`, um número com duas casas decimais. A ordem importa: se a vírgula virasse ponto antes, o passo seguinte apagaria também o ponto decimal.

Você vai repetir essa expressão em várias consultas das duas partes da prática. Repare no incômodo: ele é o motivo da camada bronze, que você vai construir mais adiante para converter tudo uma única vez.

## Passo 3: ver o JOIN decidir quem entra

Queremos os contratos ativos com o nome da unidade gestora. Primeiro com `inner join`:

```sql
select c.id, c.codigo_ug, u.nome as unidade
from estudo_modelagem.raw_contratos as c
inner join estudo_modelagem.raw_unidades_gestoras as u on u.codigo = c.codigo_ug
where c.situacao = 'Ativo'
order by c.id;
```

```text
 id  | codigo_ug |           unidade
-----+-----------+------------------------------
 101 | 990001    | Coordenação de Administração
 102 | 990001    | Coordenação de Administração
```

O contrato 103 sumiu. Ele está ativo; o que falta é o cadastro da unidade 990009. O `inner join` só devolve linhas que encontram par nos **dois** lados, então ele também funciona como um filtro, que ninguém escreveu de forma explícita.

Troque apenas `inner join` por `left join`:

```sql
select c.id, c.codigo_ug, u.nome as unidade
from estudo_modelagem.raw_contratos as c
left join estudo_modelagem.raw_unidades_gestoras as u on u.codigo = c.codigo_ug
where c.situacao = 'Ativo'
order by c.id;
```

```text
 id  | codigo_ug |           unidade
-----+-----------+------------------------------
 101 | 990001    | Coordenação de Administração
 102 | 990001    | Coordenação de Administração
 103 | 990009    |
```

O `left join` preserva todas as linhas da tabela da esquerda (contratos) e preenche com nulo o que não encontrou do lado direito. A população passa a ser definida pelo `where c.situacao = 'Ativo'`, que é a regra que queríamos.

A pergunta que decide entre os dois: **a falta do par é motivo para tirar o registro do indicador?** Aqui não é: o problema está no cadastro de unidades, não no contrato. Quando a resposta for sim, escreva a regra no `where`, onde quem revisa consegue ver, em vez de confiar no efeito colateral de um `inner join`.

## Passo 4: ver uma comparação com nulo desfazer o `left join`

Agora queremos os contratos ativos, exceto os da Coordenação de Pesquisa:

```sql
select c.id, c.codigo_ug, u.nome as unidade
from estudo_modelagem.raw_contratos as c
left join estudo_modelagem.raw_unidades_gestoras as u on u.codigo = c.codigo_ug
where c.situacao = 'Ativo'
  and u.nome <> 'Coordenação de Pesquisa'
order by c.id;
```

```text
 id  | codigo_ug |           unidade
-----+-----------+------------------------------
 101 | 990001    | Coordenação de Administração
 102 | 990001    | Coordenação de Administração
```

O 103 sumiu de novo, embora sua unidade não seja a Coordenação de Pesquisa. No SQL, qualquer comparação com nulo dá **desconhecido**, nem verdadeiro nem falso, e o `where` só deixa passar o que é verdadeiro. `null <> 'Coordenação de Pesquisa'` é desconhecido, então a linha sai.

Para comparar aceitando nulos, use `is distinct from`, que trata nulo como um valor:

```sql
select c.id, c.codigo_ug, u.nome as unidade
from estudo_modelagem.raw_contratos as c
left join estudo_modelagem.raw_unidades_gestoras as u on u.codigo = c.codigo_ug
where c.situacao = 'Ativo'
  and u.nome is distinct from 'Coordenação de Pesquisa'
order by c.id;
```

```text
 id  | codigo_ug |           unidade
-----+-----------+------------------------------
 101 | 990001    | Coordenação de Administração
 102 | 990001    | Coordenação de Administração
 103 | 990009    |
```

O 103 voltou. Guarde a regra: **depois de um `left join`, toda condição sobre colunas da tabela da direita precisa decidir o que fazer com o nulo.** A segunda parte da prática mostra outra saída para isso: levar a condição para o `on`.

## O que você viu

- O schema `estudo_modelagem`, com contratos, unidades e empenhos que imitam a entrada real.
- Um valor em texto que precisa de conversão antes de qualquer conta.
- Um `inner join` que tira do indicador um contrato ativo, só porque falta um cadastro.
- Uma comparação com nulo que exclui linhas sem aviso, e o `is distinct from` que a corrige.

## No código do Gov Hub: um INNER JOIN que funcionava como filtro

Em **09/10/2026**, o [commit a1153bc](https://github.com/GovHub-br/data-application-gov-hub/commit/a1153bc91313b5e6dc30e7de4f88466d8a4fa617) mudou o modelo silver `dados_funcionais_enriquecidos`, que junta os dados funcionais dos servidores com os dados da unidade organizacional (uorg). Antes:

```sql
from {{ ref("dados_funcionais") }} as df
-- INNER JOIN: exclui servidores sem uorg ativa (ex: aposentados, cedidos a outros órgãos).
-- Esses servidores existem em dados_funcionais mas não possuem entrada em dados_uorg.
inner join {{ ref("dados_uorg") }} as du on df.cpf = du.cpf
```

Depois:

```sql
from {{ ref("dados_funcionais") }} as df

left join {{ ref("dados_uorg") }} as du on df.cpf = du.cpf
-- considera apenas servidores sem data de exclusão (desligados ficam de fora),
-- mesma regra usada em kpis_servidores e hierarquia
where df.dt_ocorr_exclusao is null
```

Leia assim: antes, a população era "servidores com uorg correspondente", e essa regra só existia como efeito da junção. O comentário explicava o efeito, mas qualquer mudança no cadastro de uorgs mudava quem entrava. Depois, o `left join` preserva os servidores sem uorg (aposentados e cedidos voltam a aparecer, com os campos da uorg nulos), e a regra de saída fica escrita no `where`: sai quem tem data de exclusão, ou seja, os desligados. A mudança fez duas coisas ao mesmo tempo: alterou a população e tornou a regra visível. É o mesmo movimento do passo 3, num modelo real.

## Erros comuns

| Sintoma | Causa provável | Como evitar |
|---|---|---|
| `function sum(text) does not exist` | Valor ainda em texto, como chegou da fonte | Converta antes de somar (e, no projeto, converta uma vez, na bronze) |
| Valor cem vezes maior depois da conversão | `replace` na ordem errada, ou fonte com ponto decimal | Apague o separador de milhar antes de trocar a vírgula; confira o formato da fonte |
| Registros válidos somem depois de um JOIN | `inner join` funcionando como filtro de população | Use `left join` e escreva a regra de população no `where` |
| O `left join` passou a se comportar como `inner` | Comparação com uma coluna da tabela da direita no `where` | Use `is distinct from` ou leve a condição para o `on` |

## Confira o que entendeu

1. Por que a conversão apaga os pontos **antes** de trocar a vírgula por ponto?
2. Você precisa listar todos os contratos ativos com o nome da unidade, mas sem os da unidade 990002. Onde escreve a condição, para não perder o contrato 103?
3. Um modelo usa `inner join` com a tabela de unidades "porque toda unidade deveria estar cadastrada". O que você pergunta antes de aceitar?

## Respostas comentadas

1. Porque, se a vírgula virasse ponto primeiro, `'120.000,00'` viraria `'120.000.00'`, e apagar os pontos depois daria `'12000000'`: o ponto decimal também sumiria.
2. No `where`, com `c.codigo_ug <> '990002'`: a condição sobre o **código do contrato** não depende da unidade cadastrada e mantém o 103. Se a condição precisar ser sobre o nome da unidade, use `u.nome is distinct from ...`.
3. O que acontece com um registro cuja unidade **não** está cadastrada: ele deve sair do indicador? Se a resposta for não, o `inner join` está decidindo a população por acidente. Use `left join` e trate a ausência de forma visível.

## Veja também

- [Prática: SQL para contar e somar sem enganos](engenharia-sql-medidas.md)
- [Rotina local e verificação final](../guias/engenharia-rotina-ambiente.md)
