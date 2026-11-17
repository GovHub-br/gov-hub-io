# Prática: a silver, com privacidade e junção

> Tipo: **Tutorial**

## O que você vai construir

A silver `pncp_contratos_tratados`: uma linha por instrumento publicado no PNCP, com o nome da UF trazido de uma seed, o mês de assinatura calculado e o fornecedor protegido quando não é pessoa jurídica. Você vai escrever o `schema.yml`, o SQL e um teste de privacidade, e vai provocar três falhas para ver cada teste fazer o seu trabalho.

![A silver recebe a bronze, que não é legível pela role de leitura, e a seed estados_brasil. Uma junção à esquerda traz o nome da UF sem perder linhas. O mês de assinatura é calculado. O NI e o nome do fornecedor só passam quando o tipo de pessoa é PJ. O texto livre do objeto e do processo não sobe. A saída tem 30 linhas, as mesmas da bronze, e é legível pela role de leitura. Três testes guardam a camada: unique na chave, relationships entre a UF e a seed, e um teste singular de privacidade.](../../assets/diagramas/engenharia-base-nova-silver.png)

A [aula de camadas](../explicacao/engenharia-camadas.md) do nível 3 disse que a silver é onde as regras de negócio moram, e a [aula de planejamento](../explicacao/engenharia-planejamento-modelos.md) mostrou como uma regra de população esconde linhas. Aqui você aplica as duas coisas numa base nova, e acrescenta uma terceira decisão, que só aparece quando o dado vem de fora: o que **não** deve subir.

## O que você vai aprender

- Decidir, antes do SQL, quais linhas entram e quais colunas sobem.
- Fazer uma junção que não perde nem multiplica linhas, e provar isso com testes.
- Aplicar uma regra de privacidade na camada certa e testá-la.
- Usar o teste `relationships`, que o projeto ainda não usa em nenhum modelo.
- Ler a falha de cada teste para saber onde procurar.

## Antes de começar

- A bronze `pncp_dw.pncp_contratos` criada, da [prática anterior](engenharia-base-nova-bronze.md).
- A seed carregada: `dbt seed --select estados_brasil --no-populate-cache`. Se você fez a [prática do nível 4](engenharia-dbt-camadas.md), ela já existe.

## Passo 1: decidir antes de escrever

A especificação da [issue](../guias/engenharia-avaliar-fonte.md) já respondeu algumas perguntas. A silver as aplica:

| Decisão | Escolha | Por quê |
|---|---|---|
| Quais linhas entram | **Todas** as da bronze, sem filtro | A gold soma tudo que foi publicado, ativo ou não. Um filtro aqui seria uma regra que a especificação não pediu, como o `situacao = 'Ativo'` que o nível 3 mostrou tirando pagamentos da gold |
| Como juntar a UF | `left join` com a seed | Uma UF fora da seed deixa o nome vazio, mas a linha continua. Com `inner join`, ela sumiria |
| Quem aparece como fornecedor | NI e nome só se `tipo_pessoa = 'PJ'` | Para pessoa física, o NI é um CPF. Para pessoa estrangeira, é outro tipo de identificador |
| O que não sobe | `objeto`, `processo`, `orgao_nome` e mais seis colunas da bronze | A pergunta não usa. Texto livre, como o objeto, pode citar nomes de pessoas |
| O que sobe a mais | `mes_assinatura` | A gold agrupa por mês, e calcular uma vez, na silver, evita repetir a regra |

A bronze tem 26 colunas, e a silver, 19. **Cada coluna que fica de fora é uma coluna a menos para proteger, documentar e explicar.** É o princípio da minimização: só sobe o que a pergunta usa. Como a raw e a bronze guardam tudo, nada se perde, e uma pergunta nova volta à bronze.

## Passo 2: o `schema.yml` primeiro

Crie `models/pncp_dbt/silver/schema.yml`:

```yaml
version: 2

models:
  - name: pncp_contratos_tratados
    description: >
      Uma linha por instrumento publicado no PNCP (contrato, empenho ou outro), com o
      nome da UF e o mês de assinatura. Inclui todos os instrumentos da bronze, sem
      filtro por situação ou vigência. O fornecedor (NI e nome) só aparece quando é
      pessoa jurídica; para pessoa física ou estrangeira as colunas ficam nulas, para
      não expor dado pessoal. O texto livre do objeto não é trazido para esta camada.
    meta:
      tags:
        - silver
    columns:
      - name: numero_controle_pncp
        description: Identificador do instrumento no PNCP.
        tests:
          - not_null
          - unique
      - name: numero_controle_pncp_compra
        description: >
          Identificador da contratação que originou o instrumento. Liga o contrato à
          contratação coletada pela DAG de contratações do PNCP.
      - name: orgao_cnpj
        description: CNPJ do órgão que publicou o instrumento.
      - name: uf_sigla
        description: Sigla da UF da unidade que publicou o instrumento.
        tests:
          - relationships:
              to: ref('estados_brasil')
              field: sigla_uf
      - name: fornecedor_ni
        description: CNPJ do fornecedor. Nulo quando o fornecedor não é pessoa jurídica.
      - name: mes_assinatura
        description: Primeiro dia do mês da data de assinatura.
        tests:
          - not_null
      - name: valor_global
        description: Valor global do instrumento, em reais.
        tests:
          - not_null
```

Repare que a **descrição já diz as regras**: população sem filtro, privacidade do fornecedor, texto livre fora. Quem ler o modelo no catálogo entende o que a tabela é e o que **ela não é**, sem abrir o SQL. A descrição é a especificação que fica junto do código, como a [aula de entrega](../guias/engenharia-entrega-camada.md) do nível 3 mostrou.

Os testes novos em relação à bronze:

| Teste | Pergunta |
|---|---|
| `unique` na chave | A junção multiplicou linhas? |
| `relationships` de `uf_sigla` para a seed | Toda UF da silver existe na tabela de nomes? |

O `relationships` é um teste nativo do dbt que confere se cada valor de uma coluna existe em outra tabela: o equivalente de uma chave estrangeira, que o dbt não cria no banco. O projeto não usa esse teste em nenhum modelo hoje. Aqui ele protege exatamente o ponto frágil da silver: a junção com a seed.

## Passo 3: o SQL

Crie `models/pncp_dbt/silver/pncp_contratos_tratados.sql`:

```sql
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
```

Leia assim:

- **`ref()`** liga a silver à bronze e à seed, e define a ordem de execução. A silver nunca lê a raw.
- **`left join`**: toda linha da bronze fica. A condição está no `on`, não num `where`, como na [prática de SQL](engenharia-sql.md) do nível 3.
- **`case when ... then ... end` sem `else`** devolve nulo quando a condição falha. É assim que a regra de privacidade vira "o NI só existe para PJ".
- **Colunas simples primeiro, cálculos depois.** É uma exigência do `sqlfluff` do projeto (regra ST06), e deixa o que é cálculo agrupado no fim.
- **Nada de `where`.** Combina com a decisão do passo 1.

## Passo 4: o teste de privacidade

Uma regra que não tem teste é uma intenção. Crie `tests/pncp/assert_pncp_silver_sem_fornecedor_pessoal.sql`, na pasta `tests/` do projeto dbt:

```sql
-- Falha se a silver expuser NI ou nome de fornecedor que não é pessoa jurídica.
select numero_controle_pncp, tipo_pessoa
from {{ ref("pncp_contratos_tratados") }}
where tipo_pessoa <> 'PJ' and (fornecedor_ni is not null or fornecedor_nome is not null)
```

É um **teste singular**, como o da [prática do nível 4](engenharia-dbt-camadas.md): uma consulta que devolve as linhas que violam a regra. Vazia, o teste passa. Escrevê-lo assim traz uma vantagem: o teste procura o problema por **outro caminho** que o do SQL da silver. Se alguém reescrever o modelo e esquecer o `case`, o teste pega.

## Passo 5: rodar

<!-- explica: Constrói a silver `pncp_contratos_tratados` e roda os testes dela: os do `schema.yml` e o teste singular que procura NI ou nome de fornecedor que não seja pessoa jurídica. -->

```bash
dbt build --select pncp_contratos_tratados --no-populate-cache
```

```text
1 of 7 OK created sql table model pncp_dw.pncp_contratos_tratados .............. [SELECT 30 in 0.11s]
2 of 7 PASS assert_pncp_silver_sem_fornecedor_pessoal .......................... [PASS in 0.02s]
3 of 7 PASS not_null_pncp_contratos_tratados_mes_assinatura .................... [PASS in 0.02s]
4 of 7 PASS not_null_pncp_contratos_tratados_numero_controle_pncp .............. [PASS in 0.01s]
5 of 7 PASS not_null_pncp_contratos_tratados_valor_global ...................... [PASS in 0.01s]
6 of 7 PASS relationships_pncp_contratos_tratados_uf_sigla__sigla_uf__ref_estados_brasil_  [PASS in 0.02s]
7 of 7 PASS unique_pncp_contratos_tratados_numero_controle_pncp ................ [PASS in 0.01s]
Done. PASS=7 WARN=0 ERROR=0 SKIP=0 TOTAL=7
```

Trinta linhas, como na bronze, e seis testes. Mas passar não basta. Olhe o resultado:

<!-- explica: Conta as linhas da silver por tipo de pessoa do fornecedor e, em cada grupo, quantas têm NI e nome preenchidos. `count(coluna)` só conta valores que não são nulos. -->

```bash
docker compose exec postgres psql -U postgres -c "select tipo_pessoa, count(*) as linhas, count(fornecedor_ni) as com_ni, count(fornecedor_nome) as com_nome from pncp_dw.pncp_contratos_tratados group by 1 order by 1"
```

```text
 tipo_pessoa | linhas | com_ni | com_nome 
-------------+--------+--------+----------
 PE          |      1 |      0 |        0
 PJ          |     29 |     29 |       29
```

Leia assim: das 30 linhas, 29 são de fornecedores pessoa jurídica, com NI e nome; uma é de fornecedor estrangeiro (`PE`), e as duas colunas ficam nulas. Se houvesse pessoa física no período, ela teria o mesmo tratamento.

## Passo 6: provocar três falhas

Um teste só é útil se reprova quando deve. Os três a seguir mexem em arquivos de estudo, e você desfaz cada um antes do próximo.

### Falha 1: uma UF repetida na seed

Acrescente uma linha repetida a `seeds/estados_brasil.csv`:

```text
DF,DISTRITO FEDERAL (repetido)
```

<!-- explica: Recarrega a seed `estados_brasil`, agora com a linha do DF repetida, e reconstrói a silver que faz a junção com ela, rodando os testes das duas. -->

```bash
dbt build --select estados_brasil pncp_contratos_tratados --no-populate-cache
```

```text
8 of 8 FAIL 25 unique_pncp_contratos_tratados_numero_controle_pncp ............. [FAIL 25 in 0.02s]
  Got 25 results, configured to fail if != 0
```

A junção encontrou **duas** linhas para `DF` e duplicou os 25 contratos do Distrito Federal. O teste `unique` mostra: 25 chaves repetidas. Sem o teste, a gold somaria duas vezes o valor do Distrito Federal, e o painel mostraria um total maior, sem erro algum.

### Falha 2: uma UF que falta na seed

Desfaça o passo anterior e apague a linha do `DF` da seed.

```text
2 of 8 OK created sql table model pncp_dw.pncp_contratos_tratados .............. [SELECT 30 in 0.07s]
7 of 8 FAIL 25 relationships_pncp_contratos_tratados_uf_sigla__sigla_uf__ref_estados_brasil_  [FAIL 25 in 0.01s]
```

O modelo continua com 30 linhas (o `left join` as manteve), e o `relationships` aponta as 25 sem correspondência. Compare com o que um `inner join` teria feito:

```sql
select count(*) as left_join, count(nome_uf) as com_nome_uf from pncp_dw.pncp_contratos_tratados;
select count(*) as inner_join from pncp_dw.pncp_contratos c join ipea.estados_brasil e on c.uf_sigla = e.sigla_uf;
```

```text
 left_join | com_nome_uf 
-----------+-------------
        30 |           5

 inner_join 
------------
          5
```

Com `inner join`, a silver teria **5 linhas** em vez de 30, e nenhum teste de `unique` ou `not_null` reclamaria: as 25 linhas simplesmente não existiriam. A diferença entre o `left join` com `relationships` e o `inner join` é a diferença entre um problema visível e um problema invisível. É o princípio que a [prática de SQL](engenharia-sql.md) mostrou com contratos sem empenho.

### Falha 3: a regra de privacidade removida

Desfaça a seed. No SQL da silver, troque `case when c.tipo_pessoa = 'PJ' then c.fornecedor_ni end as fornecedor_ni` por `c.fornecedor_ni`, e rode:

```text
2 of 7 FAIL 1 assert_pncp_silver_sem_fornecedor_pessoal ........................ [FAIL 1 in 0.02s]
  Got 1 result, configured to fail if != 0
  compiled Code at target/compiled/ipea/tests/pncp/assert_pncp_silver_sem_fornecedor_pessoal.sql
```

O teste encontrou a linha do fornecedor estrangeiro com o NI exposto. A última linha da saída é o caminho do SQL compilado: abra-o e rode no banco para ver as linhas que violam a regra. Desfaça a alteração e rode o `dbt build` de novo, para voltar aos sete verdes.

## Um limite honesto da regra

A regra olha só `tipo_pessoa`. Um microempreendedor individual (MEI) é pessoa jurídica, mas a razão social segue o padrão "nome do titular seguido do CPF". Nos 29 fornecedores PJ do Ipea, nenhuma razão social termina em 11 dígitos, então a regra basta para esses dados. Mas rodei o mesmo pipeline para o Ministério da Justiça, em junho de 2026 (o [desafio](../desafios/engenharia-desafio.md) faz isso): 5 pessoas físicas e 4 estrangeiros ficam protegidos, e **2 dos 395 fornecedores PJ têm razão social terminada em 11 dígitos**. A regra os deixa passar, porque são PJ. Para esses casos, a regra mereceria uma segunda condição e um segundo teste. Decisões assim pertencem à equipe responsável pelo dado, e o lugar de registrá-las é a descrição do modelo e a issue.

## Erros comuns

- **Filtrar na silver para "limpar".** Cada filtro é uma regra de população que precisa estar na especificação, e a gold precisa explicá-la na conferência.
- **Confiar no `inner join` porque os testes passam.** Linhas que sumiram não reprovam `unique` nem `not_null`. Compare a contagem da silver com a da bronze.
- **Trazer texto livre "por precaução".** Objeto e processo podem citar pessoas. Se a pergunta não usa, não sobe.
- **Proteger só no painel.** Quem tiver acesso à silver vê o que ela guarda. A camada em que o dado deixa de existir é a que garante.
- **Rodar o teste e não olhar as linhas.** Sete verdes mostram que nada violou as regras que você escreveu, e não que as regras bastam.

## O que você aprendeu

- Antes do SQL, decida população, junções e colunas; a descrição do modelo registra as decisões.
- Um `left join` com `relationships` torna visível o que um `inner join` esconderia, e `unique` pega a junção que multiplica.
- Uma regra de privacidade vive na camada e tem teste próprio: um singular que procura a violação.
- Cada falha provocada mostra para onde olhar: a chave, a relação, o SQL compilado.

## Confira o que entendeu

1. A seed ganhou uma segunda linha para `RJ` e a silver passou de 30 para 35 linhas. Qual teste reprova, e quantos resultados ele mostra?
2. O modelo usa `where tipo_pessoa = 'PJ'` em vez do `case`, e todos os testes passam, inclusive o de privacidade. Por que isso ainda é um problema?

## Respostas comentadas

1. O `unique` da chave. Os 5 contratos do Rio de Janeiro passam a ter duas linhas cada, e o teste mostra 5 resultados: cinco chaves repetidas. A silver tem 30 mais 5 linhas.
2. O `where` remove da silver o contrato com fornecedor estrangeiro, e o teste de privacidade passa por falta de linhas. A silver perde o contrato (30 viram 29), a gold deixa de somar o valor, e a conferência com a bronze passa a mostrar uma diferença sem explicação. A regra era esconder o fornecedor, e não o contrato.

## Próximos passos

- [Prática: a gold e a conferência](engenharia-base-nova-gold.md)
- [Definir as responsabilidades de cada camada](../explicacao/engenharia-camadas.md)
