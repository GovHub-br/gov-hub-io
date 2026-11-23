# Prática: transformar em camadas

> Tipo: **Tutorial**

> Notebook: [engenharia-fundamentos-camadas.ipynb](../../notebooks/engenharia-fundamentos-camadas.ipynb) · Colab

A tabela bruta tem tudo, mas não responde a nada: datas são texto, há uma viagem repetida e o nome das estações está em outra tabela. Transformar é levar esse dado, em passos pequenos e com nome, até a tabela que responde à pergunta. Cada passo é uma **camada**, com uma responsabilidade só.

## O que você vai aprender

- **Bronze**: converter os tipos, sem nenhuma regra.
- **Silver**: aplicar as regras e juntar com o cadastro.
- **Gold**: agregar no formato que quem consome precisa.
- Ver uma junção errada esconder viagens sem nenhum aviso.

## Antes de começar

A Preparação do notebook refaz a coleta e a gravação das aulas anteriores, num banco na memória. A raw começa com 624 linhas: as 623 viagens da semana e a repetição de 03/06.

![Da tabela bruta à resposta, em três camadas. A raw_viagens tem 624 linhas, tudo texto, como veio. A bronze tem 624 e só converte datas e números. A silver tem 621: a regra 1 tira 1 viagem repetida, a regra 2 tira 2 com fim antes do início, e o left join marca 3 de estação desconhecida. A gold tem 59 linhas, uma por estação e dia, somando 621 saídas. Um aviso: com inner join, a silver teria 618 viagens, e as 3 da estação E99 sumiriam sem nenhum erro.](../../assets/diagramas/engenharia-fundamentos-camadas.png)

## Passo 1: bronze, só converter

A bronze transforma o texto em datas e números. Ela é uma **view**: uma consulta com nome, recalculada toda vez que alguém a lê.

<!-- explica: Cria a view `bronze_viagens` sobre a raw: converte cada coluna de texto em data, número ou data com hora (`cast`) e não descarta nada, por isso devolve as mesmas 624 linhas. Como é uma view, nenhum dado é copiado: a consulta roda toda vez que alguém a lê. -->

```sql
create or replace view bronze_viagens as
select
    cast(data_ref as date)        as data_ref,
    id_viagem,
    id_usuario,
    estacao_saida,
    estacao_chegada,
    cast(inicio as timestamptz)   as inicio,
    cast(fim as timestamptz)      as fim,
    cast(coletado_em as timestamp) as coletado_em
from raw_viagens;
```

```text
  id_viagem estacao_saida                    inicio                       fim
0     V5030           E08 2026-06-01 06:30:00-03:00 2026-06-01 06:53:00-03:00
1     V5022           E04 2026-06-01 06:37:00-03:00 2026-06-01 07:14:00-03:00
2     V5035           E04 2026-06-01 06:41:00-03:00 2026-06-01 07:17:00-03:00
```

Por que nenhuma regra aqui? Se a bronze só converte, qualquer diferença entre ela e a fonte é defeito de conversão, e não decisão de negócio. Quando algo der errado, você sabe em que camada procurar.

## Passo 2: silver, as regras

Antes de escrever a silver, veja o que ela precisa resolver:

```text
                   problema  linhas
0         viagens repetidas       1
1       fim antes do início       2
2  estação fora do cadastro       3
```

Cada problema recebe uma decisão, escrita no código com o motivo:

<!-- explica: Cria a view `silver_viagens`. O `row_number()` numera as cópias de cada `id_viagem`, da mais recente para a mais antiga, e o `where` fica só com a primeira (`ordem = 1`) e descarta as viagens com fim antes do início. O `left join` traz o nome e o bairro da estação sem perder as viagens da E99, que não está no cadastro. -->

```sql
create or replace view silver_viagens as
with sem_repetidas as (
    select *,
           row_number() over (partition by id_viagem order by coletado_em desc) as ordem
    from bronze_viagens
)
select
    v.id_viagem,
    v.id_usuario,
    v.estacao_saida,
    e.nome                                  as estacao_saida_nome,
    e.bairro                                as estacao_saida_bairro,
    v.estacao_chegada,
    v.inicio,
    v.fim,
    datediff('minute', v.inicio, v.fim)     as duracao_min,
    e.id_estacao is null                    as estacao_desconhecida
from sem_repetidas v
left join bronze_estacoes e on e.id_estacao = v.estacao_saida
where v.ordem = 1              -- regra 1: uma linha por viagem
  and v.fim >= v.inicio;       -- regra 2: fim antes do início é erro da fonte
```

```text
bronze: 624 · silver: 621
```

**Leia assim:**
- `row_number()` numera as cópias de cada viagem, e `ordem = 1` fica com uma só: sai a repetida.
- `fim >= inicio` tira as duas viagens impossíveis.
- As três viagens da estação E99 **ficaram**, marcadas com `estacao_desconhecida = true`: a viagem aconteceu, o que falta é o cadastro.

Tirar uma linha é uma decisão sobre o dado; marcar é deixar a decisão para quem sabe mais.

## Passo 3: a junção que esconde linhas

A silver usa `left join`: toda viagem fica, mesmo sem par no cadastro. Veja o que um `inner join` faria:

```text
   com_left_join  com_inner_join
0            621             618
```

O `inner join` só mantém as linhas que têm par dos dois lados. As três viagens da E99 desapareceriam, nenhum erro apareceria e o total de viagens da cidade ficaria menor. Na dúvida, use `left join` e marque o que não encontrou par.

## Passo 4: gold, a resposta

A gold agrega a silver no formato de quem consome: **uma linha por estação e por dia**. Ela é uma **tabela**, e não uma view: é calculada uma vez e lida muitas vezes.

<!-- explica: Cria a tabela `gold_saidas_por_estacao_dia`: agrupa a silver por dia e estação de saída, conta as saídas (`count`) e calcula a duração mediana (`median`). O `group by all` agrupa por todas as colunas que não são cálculo, e o `coalesce` troca o nome vazio por "Estação desconhecida". Por ser tabela, é calculada uma vez e guardada. -->

```sql
create or replace table gold_saidas_por_estacao_dia as
select
    cast(inicio as date)                              as dia,
    estacao_saida,
    coalesce(estacao_saida_nome, 'Estação desconhecida') as estacao,
    count(*)                                          as saidas,
    median(duracao_min)                               as duracao_mediana_min
from silver_viagens
group by all
order by dia, saidas desc, estacao_saida;
```

```text
         dia estacao_saida           estacao  saidas  duracao_mediana_min
0 2026-06-01           E05      Universidade      18                 30.5
1 2026-06-01           E08  Estação do Metrô      17                 28.0
2 2026-06-01           E01     Praça Central      12                 25.0
```

Essa é a resposta à pergunta do nível: em 01/06, a Universidade teve mais saídas, e uma viagem típica de lá durou cerca de meia hora. A **mediana** é o valor do meio: metade das viagens durou menos, metade durou mais. Ela representa a viagem típica melhor que a média, que uma única viagem muito longa puxaria para cima.

## Sua vez: o bairro com mais saídas

No notebook, você escreve na silver a consulta que responde qual bairro teve mais saídas na semana. A conferência compara a sua resposta com a conta feita direto nos dados.

## Erros comuns

| Erro | Consequência | Como evitar |
|---|---|---|
| Regra de negócio na bronze | Não se sabe mais se uma diferença é conversão ou decisão | Bronze só converte |
| `inner join` com o cadastro | Linhas somem sem nenhum erro | `left join` e uma coluna que marca o que ficou sem par |
| Apagar o que não tem par | A viagem real some do total | Marcar e avisar; decidir com quem conhece o dado |
| Somar a mediana de vários dias | Um número sem significado | Recalcular a partir da silver para outro período |

## Confira o que entendeu

1. Por que a regra "uma linha por viagem" fica na silver, e não na coleta ou na raw?
2. A gestora pede a duração mediana **da semana** da Praça Central. Dá para calcular a partir da gold?

## Respostas comentadas

1. Porque coleta e raw guardam o que a fonte entregou, inclusive os erros dela. Se a limpeza acontecesse lá, a evidência sumiria e uma limpeza errada não teria como ser refeita. Na silver, a regra tem nome, motivo e pode ser corrigida e rodada de novo a partir da raw.
2. Não. A gold guarda uma mediana por dia, e a mediana da semana não é a média nem a soma das medianas diárias. É preciso voltar à silver e calcular a mediana sobre todas as viagens da semana. A gold responde à pergunta para a qual foi desenhada; perguntas novas podem pedir outra gold.

## Próximos passos

- [Prática: testar o dado](engenharia-fundamentos-testes.md)
