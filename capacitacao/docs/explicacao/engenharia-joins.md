# JOINs e funções de janela sem duplicar totais

> Tipo: **Explicação**

## Por que juntar tabelas?

Uma tabela pode guardar o código do órgão e o valor de cada contrato; outra, o código e o nome completo do órgão. Um **JOIN** relaciona as linhas para apresentar o nome junto do valor. A condição da junção informa quais colunas devem corresponder.

Por exemplo, o contrato indica órgão `A`, e a tabela de órgãos explica que `A` significa “Órgão de estudo A”. Se houver uma única descrição para `A`, cada contrato encontra uma correspondência. Se houver duas, a linha do contrato aparecerá duas vezes no resultado.

Uma relação **um para muitos** acontece quando uma linha corresponde a várias: um contrato pode ter vários documentos. Isso pode ser correto para listar documentos, mas precisa de cuidado para somar o valor do contrato.

Um empenho de R$ 100 tem dois documentos relacionados. Ao juntar as tabelas, ele aparece duas vezes. Somar seu valor depois do JOIN produz R$ 200: a consulta executa, mas a resposta está errada.

## Confira a relação antes de somar

Pergunte se cada chave encontra uma ou várias linhas do outro lado. Em relações de um para muitos, agregue os detalhes antes da junção quando o resultado esperado continuar sendo uma linha por empenho.

`inner join` mantém correspondências; `left join` preserva as linhas da esquerda mesmo sem correspondência. Um filtro no `where` sobre a tabela da direita pode eliminar essas linhas sem correspondência.

## Exemplo: veja a multiplicação de linhas

Uma tabela tem o empenho 10, com valor 100. Outra tem dois documentos ligados a ele, D1 e D2. Ao juntar as tabelas pelo empenho, a saída é:

| Empenho | Valor do empenho | Documento |
|---|---|---|
| 10 | 100 | D1 |
| 10 | 100 | D2 |

Há dois documentos, mas apenas um empenho de 100. Somar a segunda coluna produz 200 porque o valor do empenho acompanha cada correspondência.

Se a pergunta for “quantos documentos cada empenho tem?”, conte os documentos primeiro: o resumo fica empenho 10, quantidade 2. Depois junte esse resumo ao empenho, obtendo **uma linha com valor 100 e quantidade 2**.

Se não existir documento, um `inner join` elimina o empenho; um `left join` o mantém com documento nulo. A escolha depende de você querer listar só correspondências ou preservar todos os empenhos.

## Janela mantém as linhas

Uma função de janela calcula sobre um grupo sem reduzi-lo a uma única linha:

```sql
with dados (id, atualizado_em) as (
    values (1, date '2026-01-01'),
           (1, date '2026-01-02')
)
select id, atualizado_em,
       row_number() over (
           partition by id order by atualizado_em desc
       ) as ordem
from dados;
```

A numeração esperada é:

| id | atualizado_em | ordem |
|---|---|---|
| 1 | 2026-01-02 | 1 |
| 1 | 2026-01-01 | 2 |

A função calcula a numeração nessa ordem; para garantir a ordem de apresentação da consulta completa, acrescente `order by id, ordem` ao final.

O registro mais recente recebe `ordem = 1`. Havendo empate, é necessário um critério adicional estável antes de escolher uma linha. `lag()` compara com uma linha anterior; `sum() over (...)` permite totais acumulados.

## Sinal de alerta

Compare linhas e totais antes e depois do JOIN. Usar `distinct` sem entender a causa pode esconder a multiplicação e também eliminar registros legítimos.

## Lendo a função de janela por partes

Na consulta acima, `id` identifica o registro e `atualizado_em` é a data de atualização. `partition by id` separa os registros em grupos com o mesmo identificador; `order by atualizado_em desc` coloca a data mais recente primeiro em cada grupo.

`row_number()` numera essas linhas, começando em 1. O resultado mantém duas linhas: 2 de janeiro recebe ordem 1, e 1º de janeiro, ordem 2. Diferentemente de um `group by`, a função de janela não reúne tudo em uma única linha.

Escolher apenas a ordem 1 é uma decisão posterior. Antes de fazê-la, confirme se as linhas são versões do mesmo registro ou acontecimentos diferentes que precisam ser preservados.

## Exemplo: comparar com a linha anterior e acumular

Para dois valores ordenados por dia, veja como funções de janela respondem a perguntas diferentes:

| Dia | Valor | Anterior, com `lag(valor)` | Acumulado, com `sum(valor)` |
|---|---|---|---|
| 1 | 100 | Nulo, pois não existe linha anterior | 100 |
| 2 | 200 | 100 | 300 |

As expressões são `lag(valor) over (order by dia)` e `sum(valor) over (order by dia rows between unbounded preceding and current row)`. A primeira busca a linha anterior; a segunda soma da primeira linha até a atual. O exemplo usa um único valor por dia. Se houver vários registros no mesmo dia, defina também a ordem entre eles para obter um percurso determinístico.

## Veja também

- [Consultar e conferir dados com SQL](../tutoriais/engenharia-sql.md)
- [Tipos, chaves e gravação consistente](../referencia/engenharia-tipos-chaves.md)
