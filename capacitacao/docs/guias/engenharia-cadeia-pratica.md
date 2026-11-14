# Prática: rastrear uma transformação até a gold

> Tipo: **Guia**

## Escopo do rastreamento

Use os modelos do domínio `ted_dbt`, em `airflow_lappis/dags/dbt/ipea/models/`. Parta da gold, percorra suas dependências `ref()` e localize as origens declaradas com `source()`.

Registre a granularidade e a transformação em cada etapa para identificar onde um valor da origem foi convertido, relacionado, filtrado ou agregado.

## Objetivo

Explicar de onde vem um indicador e qual etapa conferir quando ele diverge da origem.

## Passos

1. Abra `models/ted_dbt/gold/ted_resumo_orcamentario.sql`, no diretório dbt da aplicação.
2. Liste os `ref()` usados e abra os modelos correspondentes. Repita até chegar às origens declaradas com `source()`.
3. Em cada modelo, anote quatro itens: entrada, granularidade, chave e transformação principal.
4. Identifique onde há conversão de tipos, junção, filtro e agregação. Filtros de negócio não devem estar na bronze.
5. Compare uma amostra de TEDs com os dados de origem. Para cada diferença, encontre a primeira etapa em que ela aparece.
6. Consulte o mesmo percurso no grafo do Airflow/Cosmos, quando disponível, e relacione o modelo ao log da tarefa.

## Exemplo: uma ficha de rastreamento preenchida

Antes de investigar os modelos de TED, reconheça a lógica neste percurso de estudo:

| Etapa | Entrada | Uma linha representa | Mudança |
|---|---|---|---|
| Bronze | Raw com IDs 1 e 2 | Um registro recebido | Valores textuais viram 100 e 200 |
| Silver | Bronze e cadastro de órgãos | Um registro com órgão identificado | Associa código e nome, com uma correspondência |
| Gold | Silver | Um órgão no período | Soma valores por órgão |

Se ambos os registros forem de A, a gold deve mostrar 300 para A. Se mostrar 600, confira primeiro onde o total mudou: uma correspondência duplicada no cadastro pode ter produzido quatro linhas na silver.

Essa tabela é um exemplo didático, não a regra dos modelos de TED. Na prática, preencha a mesma ficha com as entradas, chaves e transformações que você encontrar nos arquivos reais.

## Como verificar

Sua anotação explica o caminho de `bronze/nc_tesouro.sql` até a gold, incluindo modelos intermediários encontrados no código. Não presuma que todos eles mantêm a mesma quantidade de linhas.

Se um arquivo mudou de nome na versão local, encontre o indicador equivalente e registre a substituição. O objetivo é demonstrar a origem do número, não decorar uma lista de caminhos.

## Pronto

Outra pessoa consegue escolher um valor da gold e seguir sua explicação até os registros e regras que o produziram.

## Registre o caminho em uma tabela simples

Use as colunas “modelo”, “vem de”, “uma linha representa” e “o que muda”. Para a bronze, a mudança pode ser converter o valor em número; para a gold, somar por TED e exercício. Preencha com o que encontrar no código, sem presumir a regra pelo nome.

Se aparecer `where`, procure o critério de filtro; se houver `join`, identifique as colunas de ligação; se houver `group by`, reconheça o agrupamento. Você já estudou esses elementos no nível de SQL.

Escolha um único TED para a primeira conferência. Uma amostra pequena ajuda a entender a lógica; depois, os testes repetíveis devem avaliar o conjunto completo.

## Veja também

- [Como o Cosmos leva o dbt ao Airflow](../explicacao/engenharia-cosmos.md)
- [Qualidade: o que precisa ser verdadeiro no dado](../referencia/engenharia-qualidade.md)
