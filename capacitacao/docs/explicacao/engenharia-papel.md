# Engenharia de dados: da fonte à decisão

> Tipo: **Explicação**

## O trabalho da engenharia de dados

Engenharia de dados constrói e mantém o percurso que leva registros das fontes até o uso analítico. A entrega inclui coleta, armazenamento, transformação, qualidade, rastreabilidade e atualização — atividades necessárias para que os resultados continuem utilizáveis ao longo do tempo.

Análise de dados interpreta os resultados; ciência de dados desenvolve modelos, como previsões. A engenharia prepara e mantém os dados e os processos que sustentam essas atividades.

## Por que há várias ferramentas?

Na aplicação Gov Hub, as ferramentas têm responsabilidades distintas ao longo do pipeline:

| Ferramenta | Responsabilidade no pipeline |
|---|---|
| Python | Linguagem para escrever instruções de coleta |
| Airflow | Organiza e acompanha a execução dessas instruções |
| PostgreSQL | Guarda os registros em tabelas consultáveis |
| dbt | Organiza instruções SQL para transformar e testar tabelas |
| Superset | Apresenta os resultados em gráficos e painéis |

Uma equipe quer acompanhar a execução de recursos por órgão. Antes do gráfico, alguém precisa buscar os registros, organizar as tabelas e garantir que a atualização de amanhã continue funcionando. Esse é o trabalho da engenharia de dados.

## O que ela entrega

Um **pipeline** é o caminho automatizado do dado, da origem até o uso. Na aplicação de dados do Gov Hub, Python coleta, Airflow coordena, PostgreSQL armazena, dbt transforma e Superset apresenta os resultados.

![O pipeline da aplicação de dados do Gov Hub. Das fontes do governo, o Python coleta os registros, o PostgreSQL os guarda em tabelas consultáveis, o dbt os transforma e testa com SQL, e o Superset apresenta os resultados em gráficos e painéis. Acima, o Airflow organiza e acompanha a execução, disparando a coleta e a transformação. Um exemplo: os contratos 10, do órgão A, com 100, e 20, do órgão B, com 200, viram duas barras; se o contrato 10 for corrigido para 150, a correção precisa chegar ao painel, e o total passa de 300 para 350.](../../assets/diagramas/engenharia-papel-pipeline.png)

Análise de dados interpreta os resultados; ciência de dados desenvolve modelos, como previsões. A engenharia prepara e mantém a base que essas atividades usam.

## Comece pela decisão

Antes de coletar, registre quatro respostas:

- Quem vai usar o resultado?
- Qual decisão precisa tomar?
- O que cada linha e cada indicador representam?
- Com que frequência o dado precisa ser atualizado?

“Quanto foi executado por órgão neste mês?” orienta fonte, período e regra de cálculo. “Vamos trazer todas as tabelas” ainda não define uma entrega.

## Exemplo: da linha recebida à resposta da gestão

Uma equipe pergunta: “Qual é o valor dos contratos de cada órgão?”. Considere estes dados inventados:

| Contrato | Órgão | Valor em reais |
|---|---|---|
| 10 | A | 100 |
| 20 | B | 200 |

O cliente Python busca essas linhas; o PostgreSQL as guarda; o dbt prepara a soma por órgão; o Superset mostra uma barra de 100 para A e outra de 200 para B. O Airflow coordena as execuções desse trabalho.

Se o contrato 10 for corrigido para 150, o percurso precisa levar a correção ao painel. A entrega não termina em “consegui fazer um gráfico”: ela inclui saber como atualizar e conferir o valor. Neste exemplo, o total geral passa de 300 para 350, sem surgir um terceiro contrato.

## O que torna a entrega confiável

| Critério | Pergunta de conferência |
|---|---|
| Finalidade | O resultado responde à necessidade definida? |
| Atualidade | O período dos dados atende à decisão? |
| Qualidade | Chaves, relacionamentos e medidas estão validados? |
| Rastreabilidade | A origem e as transformações podem ser identificadas? |
| Repetibilidade | O processamento pode ser reexecutado com controles conhecidos? |
| Acesso | Os dados são usados e disponibilizados com as permissões adequadas? |

O dado precisa ter origem identificável, atualização conhecida, testes e acesso adequado. Um gráfico correto hoje pode estar desatualizado amanhã; manter o caminho funcionando faz parte da entrega.

## Veja também

- [Onde encontrar cada parte do projeto](../referencia/engenharia-mapa-repositorio.md)
