# Prática: a gold e a conferência

> Tipo: **Tutorial**

## O que você vai construir

A gold `pncp_contratos_resumo_mensal`, a tabela que responde à pergunta da [issue](../guias/engenharia-avaliar-fonte.md): **quanto o Ipea contratou em cada mês, separando contratos de empenhos?** Junto com ela, dois testes que a conferem: um para o grão e outro para a reconciliação com a bronze. No fim, você vai ver a conferência pegar um erro que nenhum outro teste pegaria.

![A gold agrega a silver por órgão, mês de assinatura e tipo de instrumento, e tem quatorze linhas para os trinta instrumentos. Dois testes singulares a conferem: um garante uma linha por grão, e outro compara a quantidade e o valor total da gold com os da bronze. Se a silver perder linhas, como com um inner join, o teste de unicidade continua verde e a reconciliação reprova, com trinta instrumentos e dois milhões na bronze contra cinco e doze mil na gold. A role de leitura lê a gold e a silver, mas não a bronze.](../../assets/diagramas/engenharia-base-nova-gold.png)

A gold é a camada que o painel lê. Por isso é nela que as decisões de [granularidade](../explicacao/engenharia-granularidade.md) e de [entrega](../guias/engenharia-entrega-camada.md) do nível 3 mostram o que valem: um grão mal escolhido ou uma medida que não soma entram direto no gráfico.

## O que você vai aprender

- Escolher o grão e as medidas da gold a partir da especificação.
- Escrever um teste de reconciliação que compara a gold com a bronze.
- Ver por que a reconciliação pega o que `unique` e `not_null` não pegam.
- Conferir o acesso da role de leitura nas três camadas.
- Encontrar os modelos novos na DAG diária do dbt.

## Antes de começar

- A bronze e a silver criadas, das duas práticas anteriores, com os testes passando.

## Passo 1: o grão e as medidas

A especificação da issue já decidiu:

| Item | Decisão |
|---|---|
| Grão | Uma linha por órgão, mês de assinatura e tipo de instrumento |
| Medidas | `quantidade` (contagem) e `valor_global_total` (soma do valor global, em reais) |
| Por que essas medidas | Ambas são **aditivas**: dá para somar meses, tipos e órgãos e continuar com um número verdadeiro |
| O que fica fora | Média, percentual e participação. O gráfico calcula a partir das duas medidas |

O órgão está no grão mesmo que hoje só haja um: se a raw um dia receber dois órgãos, a gold continua correta, em vez de misturá-los. Um grão deve nomear **tudo o que distingue as linhas**, e não só o que varia hoje.

## Passo 2: o `schema.yml` primeiro

Crie `models/pncp_dbt/gold/schema.yml`:

```yaml
version: 2

models:
  - name: pncp_contratos_resumo_mensal
    description: >
      Uma linha por órgão, mês de assinatura e tipo de instrumento, com a quantidade e o
      valor global. Considera todos os instrumentos publicados no PNCP pelo órgão e coletados
      pela ingestão, ativos ou não. O mês é o da assinatura, não o da publicação: um
      instrumento assinado em fevereiro e publicado em janeiro do ano seguinte entra em
      fevereiro. Os valores são aditivos; calcule médias e percentuais no gráfico.
    meta:
      tags:
        - gold
    columns:
      - name: orgao_cnpj
        description: CNPJ do órgão que publicou os instrumentos.
        tests:
          - not_null
      - name: mes_assinatura
        description: Primeiro dia do mês de assinatura.
        tests:
          - not_null
      - name: tipo_contrato
        description: Tipo do instrumento segundo o PNCP.
        tests:
          - not_null
      - name: quantidade
        description: Quantidade de instrumentos no mês e tipo.
      - name: valor_global_total
        description: Soma do valor global dos instrumentos, em reais.
```

A descrição de uma gold é a especificação para quem vai **usar** a tabela. A [aula de entrega](../guias/engenharia-entrega-camada.md) do nível 3 pediu que ela dissesse o que a linha é, a população e o que a ausência significa. Esta diz tudo isso, e acrescenta um aviso que o gráfico vai precisar: o mês é o da assinatura.

Repare no que **não** tem aqui: um teste `unique` na chave. A chave da gold é composta por três colunas, e o `unique` nativo do dbt trabalha com uma. O teste do grão vem no passo 4, como singular.

## Passo 3: o SQL

Crie `models/pncp_dbt/gold/pncp_contratos_resumo_mensal.sql`:

```sql
select
    orgao_cnpj,
    mes_assinatura,
    tipo_contrato,
    count(*) as quantidade,
    sum(valor_global) as valor_global_total
from {{ ref("pncp_contratos_tratados") }}
group by orgao_cnpj, mes_assinatura, tipo_contrato
```

Poucas linhas, e é o esperado: **a gold agrega, não decide**. A população foi decidida na silver; o formato, na bronze. Se a gold precisasse de um `where` ou de um `case`, seria sinal de que uma regra está na camada errada.

## Passo 4: os dois testes da gold

Crie `tests/pncp/assert_pncp_resumo_mensal_um_por_grao.sql`:

```sql
-- Falha se houver mais de uma linha para o mesmo órgão, mês e tipo de instrumento.
select orgao_cnpj, mes_assinatura, tipo_contrato, count(*) as linhas
from {{ ref("pncp_contratos_resumo_mensal") }}
group by orgao_cnpj, mes_assinatura, tipo_contrato
having count(*) > 1
```

E `tests/pncp/assert_pncp_resumo_mensal_fecha_com_bronze.sql`:

```sql
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
```

O primeiro garante o grão: nenhuma combinação aparece duas vezes. O segundo é a **reconciliação** do nível 3: a gold não pode ter mais nem menos do que entrou. Como a população não tem filtro, a quantidade e o valor da gold precisam ser **exatamente** os da bronze. Se um dia a especificação pedir um filtro, a conferência passa a descontar o que foi excluído, e cada diferença ganha uma explicação escrita.

## Passo 5: rodar a cadeia inteira

<!-- explica: Constrói a gold `pncp_contratos_resumo_mensal` e tudo de que ela depende (bronze, seed e silver), rodando os testes de cada modelo logo depois dele. -->

```bash
dbt build --select +pncp_contratos_resumo_mensal --no-populate-cache
```

O `+` antes do nome seleciona o modelo e **tudo de que ele depende**: bronze, seed e silver. Os trechos mais importantes da saída:

```text
 1 of 24 OK created sql table model pncp_dw.pncp_contratos ...................... [SELECT 30 in 0.08s]
 2 of 24 OK loaded seed file ipea.estados_brasil ................................ [INSERT 27 in 0.05s]
12 of 24 OK created sql table model pncp_dw.pncp_contratos_tratados ............ [SELECT 30 in 0.03s]
13 of 24 PASS assert_pncp_silver_sem_fornecedor_pessoal ........................ [PASS in 0.01s]
19 of 24 OK created sql table model pncp_dw.pncp_contratos_resumo_mensal ....... [SELECT 14 in 0.03s]
20 of 24 PASS assert_pncp_resumo_mensal_fecha_com_bronze ....................... [PASS in 0.01s]
21 of 24 PASS assert_pncp_resumo_mensal_um_por_grao ............................ [PASS in 0.01s]
Done. PASS=24 WARN=0 ERROR=0 SKIP=0 TOTAL=24
```

Três modelos, uma seed e 20 testes, todos verdes. O dbt ordenou tudo sozinho pelos `ref()`, e cada modelo foi seguido pelos seus testes.

## Passo 6: olhar o resultado

Os testes dizem que nada violou as regras. Só você diz se o resultado **responde à pergunta**:

<!-- explica: Mostra a gold inteira, ordenada por mês de assinatura e tipo de instrumento: é a tabela que responde à pergunta do nível. -->

```bash
docker compose exec postgres psql -U postgres -c "select orgao_cnpj, mes_assinatura, tipo_contrato, quantidade, valor_global_total from pncp_dw.pncp_contratos_resumo_mensal order by 2,3"
```

```text
   orgao_cnpj   | mes_assinatura |      tipo_contrato       | quantidade | valor_global_total 
----------------+----------------+--------------------------+------------+--------------------
 33892175000100 | 2025-02-01     | Contrato (termo inicial) |          1 |            1180.93
 33892175000100 | 2025-12-01     | Contrato (termo inicial) |          1 |         1160896.08
 33892175000100 | 2026-01-01     | Contrato (termo inicial) |          1 |            1040.64
 33892175000100 | 2026-01-01     | Empenho                  |          2 |           17135.00
 33892175000100 | 2026-02-01     | Contrato (termo inicial) |          2 |          249132.10
 33892175000100 | 2026-02-01     | Empenho                  |          5 |           32155.70
 33892175000100 | 2026-03-01     | Contrato (termo inicial) |          2 |           21469.60
 33892175000100 | 2026-03-01     | Empenho                  |          2 |           26650.00
 33892175000100 | 2026-04-01     | Contrato (termo inicial) |          1 |           64000.00
 33892175000100 | 2026-04-01     | Empenho                  |          3 |           34490.00
 33892175000100 | 2026-05-01     | Contrato (termo inicial) |          4 |          185990.60
 33892175000100 | 2026-05-01     | Empenho                  |          4 |           19379.05
 33892175000100 | 2026-06-01     | Contrato (termo inicial) |          1 |          206400.00
 33892175000100 | 2026-06-01     | Empenho                  |          1 |             330.00
```

Quatorze linhas para trinta instrumentos, e o total fecha: 30 instrumentos e R$ 2.020.249,70, os mesmos números da raw. Leia o resultado perguntando se faz sentido:

- **Duas linhas em 2025.** São os contratos assinados em fevereiro e dezembro de 2025 e publicados em janeiro de 2026, as esquisitices da ficha da fonte. Entram no mês da assinatura, como a descrição avisa, e **não** em janeiro de 2026.
- **Dezembro de 2025 domina o valor**, com um único contrato de R$ 1,16 milhão. Um gráfico de valor por mês teria uma barra enorme e muitas pequenas. É a realidade dos dados, e quem apresenta precisa saber.
- **Valor global não é valor pago.** Um contrato de R$ 1 milhão assinado em dezembro pode ter pago nada até junho. A pergunta é sobre o **contratado**, como a [aula de planejamento](../explicacao/engenharia-planejamento-modelos.md) distinguiu de empenhado e pago.
- **"Empenho" aqui é um tipo de instrumento do PNCP**: o órgão usa a própria nota de empenho como contrato. Não é a tabela de empenhos que o nível 3 estudou.

### As medidas somam, e a média não

Como a gold tem `quantidade` e `valor_global_total`, o valor médio por instrumento de janeiro de 2026 se calcula a partir das duas. Compare as duas formas:

```sql
select mes_assinatura,
       round(avg(valor_global_total / quantidade), 2) as media_das_medias,
       round(sum(valor_global_total) / sum(quantidade), 2) as media_certa
from pncp_dw.pncp_contratos_resumo_mensal
where mes_assinatura = '2026-01-01'
group by 1;
```

```text
 mes_assinatura | media_das_medias | media_certa 
----------------+------------------+-------------
 2026-01-01     |          4804.07 |     6058.55
```

A média das duas linhas dá R$ 4.804,07, porque trata o contrato isolado e os dois empenhos com o mesmo peso. A conta certa, soma dividida pela soma, dá R$ 6.058,55. É o que a [aula de granularidade](../explicacao/engenharia-granularidade.md) chamou de medida não aditiva: o gráfico do Superset deve usar a **razão das somas**, e é por isso que a tabela guarda a soma e a contagem, e não a média.

## Passo 7: a reconciliação em ação

O teste `unique` do grão e os `not_null` não percebem quando uma camada **perde** linhas. A reconciliação percebe. Para ver, reproduza o problema da [prática anterior](engenharia-base-nova-silver.md): troque o `left join` da silver por `join` e apague a linha do `DF` da seed. Rode com `--store-failures`, que guarda as linhas reprovadas numa tabela:

<!-- explica: Roda a cadeia inteira de novo, agora com a silver quebrada. `--store-failures` grava, no schema de auditoria `dbt_test__audit`, as linhas que cada teste reprovou, para você consultá-las depois. -->

```bash
dbt build --select +pncp_contratos_resumo_mensal --store-failures --no-populate-cache
```

```text
12 of 24 OK created sql table model pncp_dw.pncp_contratos_tratados ............ [SELECT 5 in 0.03s]
19 of 24 OK created sql table model pncp_dw.pncp_contratos_resumo_mensal ....... [SELECT 4 in 0.03s]
20 of 24 FAIL 1 assert_pncp_resumo_mensal_fecha_com_bronze ..................... [FAIL 1 in 0.02s]
Done. PASS=23 WARN=0 ERROR=1 SKIP=0 TOTAL=24
```

Os outros 23 passaram: a silver, com 5 linhas, tem chaves únicas e campos preenchidos; a gold, com 4 linhas, não tem grãos repetidos. Só a reconciliação reprovou. A linha reprovada diz o que faltou:

<!-- explica: Lê a tabela que o `--store-failures` criou para o teste de reconciliação. A linha guardada mostra os totais da bronze e da gold que não bateram. -->

```bash
docker compose exec postgres psql -U postgres -c "select * from dbt_test__audit.assert_pncp_resumo_mensal_fecha_com_bronze"
```

```text
 quantidade_bronze | quantidade_gold | valor_bronze | valor_gold 
-------------------+-----------------+--------------+------------
                30 |               5 |   2020249.70 |   12760.69
```

Trinta instrumentos e R$ 2,02 milhões na bronze, contra cinco e R$ 12.760,69 na gold. Um painel feito sobre essa gold mostraria números plausíveis e muito errados: faltariam 25 dos 30 instrumentos e mais de 99% do valor. Era para isso que a conferência existia. Desfaça as duas alterações e rode de novo, para voltar ao `PASS=24`.

## Passo 8: o acesso da role de leitura

O Superset lê com a role `de_postgres`. Confira o que ela enxerga:

<!-- explica: Passa a agir como a role de leitura `de_postgres`, a mesma do Superset, e tenta contar as linhas da gold, da silver e da bronze, uma consulta de cada vez. As duas primeiras devem responder; a bronze deve recusar o acesso. -->

```bash
docker compose exec postgres psql -U postgres -c "set role de_postgres" -c "select count(*) as linhas_gold from pncp_dw.pncp_contratos_resumo_mensal" -c "select count(*) as linhas_silver from pncp_dw.pncp_contratos_tratados" -c "select count(*) from pncp_dw.pncp_contratos"
```

```text
 linhas_gold 
-------------
          14

 linhas_silver 
---------------
            30

ERROR:  permission denied for table pncp_contratos
```

A gold e a silver respondem. A bronze nega, como o bloco do domínio configurou. O acesso não precisou de nenhuma ação a mais nesta prática: o `+grants` do `dbt_project.yml` e o `on-run-start` fizeram o trabalho.

## Passo 9: os modelos na DAG diária

Seus três modelos e a seed já fazem parte da `ipea_cosmos_dag`, a DAG que roda o dbt todos os dias: o Cosmos lê o projeto e cria um par `.run` e `.test` para cada um, sem nada a registrar. Foi o que você viu no [passo 12 da prática do nível 4](engenharia-dbt-camadas.md), e o mesmo `airflow tasks list ipea_cosmos_dag` confirma, com `grep pncp`, que os modelos de contratos estão lá. O que muda desta vez é que os testes singulares de `tests/pncp/` rodam junto, com os modelos que citam. E o aviso continua valendo: não dispare a `ipea_cosmos_dag` localmente, porque ela roda todos os modelos do projeto.

## Decisões que a gold deixou de lado

- **Tabela, e não incremental.** A gold é pequena (14 linhas) e recriada a cada execução; reconstruir é mais simples e não depende de chave nem de filtro, como a [aula de histórico](../explicacao/engenharia-historico.md) discutiu.
- **Sem histórico.** A raw guarda a **versão mais recente** de cada instrumento: uma retificação sobrescreve a linha. Se alguém perguntar "como estava o valor deste contrato em março?", o caminho é um snapshot, como no nível 3, e é outra entrega.
- **Sem percentuais nem médias na tabela.** O gráfico as calcula a partir das duas medidas, como o passo 6 mostrou.

## Erros comuns

- **Confiar só em `unique` e `not_null`.** Eles não notam linhas que sumiram. A reconciliação com a camada de entrada é o teste que pega.
- **Colocar uma regra na gold.** Um `where` na gold seria uma regra de população fora do lugar, e a conferência com a bronze o apontaria sem explicação.
- **Guardar a média.** Ela não soma. Guarde soma e contagem.
- **Ler "contratado" como "gasto".** O valor global de um instrumento é o que foi acordado, e não o que foi pago.
- **Esquecer o mês da assinatura.** O gráfico "por mês" mostra a data em que o contrato foi **assinado**; os publicados em 2026 com assinatura em 2025 estão no ano anterior.

## O que você aprendeu

- A gold agrega e não decide: população e formato foram resolvidos nas camadas anteriores.
- O grão nomeia tudo o que distingue as linhas, e as medidas devem ser aditivas.
- A reconciliação com a camada de entrada pega a perda de linhas que `unique` e `not_null` deixam passar.
- `--store-failures` guarda as linhas reprovadas para você consultar.
- Os modelos novos entram na DAG diária sem configuração, e o acesso vem do bloco do domínio.

## Confira o que entendeu

1. A gold tem 15 linhas em vez de 14, e o teste de grão passa. A reconciliação com a bronze reprova ou passa?
2. O gráfico de "valor médio por instrumento" usou a coluna `valor_global_total` com a agregação "média". Que número ele mostra, e o que seria o correto?

## Respostas comentadas

1. Depende do que causou a linha a mais. Se for um grão novo (um mês ou tipo que não existia), a quantidade e o valor totais continuam iguais, e a reconciliação passa; o problema seria outro (como um tipo de instrumento novo na fonte). Se a linha a mais veio de uma duplicação, a quantidade total sobe e a reconciliação reprova. Por isso os dois testes existem: um olha a forma, o outro olha os totais.
2. A média das somas por linha, que trata um contrato de R$ 1 milhão e um empenho de R$ 300 como se pesassem o mesmo. O correto é a soma de `valor_global_total` dividida pela soma de `quantidade`, uma métrica calculada no Superset.

## Próximos passos

- [Documentar e conferir o consumo](../guias/engenharia-metadados.md)
- [Planejar a entrega antes dos modelos](../explicacao/engenharia-planejamento-modelos.md)
