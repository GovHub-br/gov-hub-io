# Engenharia de dados: da fonte à decisão

> Tipo: **Explicação**

## Antes das ferramentas: o que é um dado?

Um dado é um registro sobre alguma coisa: o valor de um contrato, a data de um atendimento ou o nome de um órgão. Isolado, ele conta pouco. Organizado com outros registros e com um significado claro, pode ajudar a responder uma pergunta.

Pense em uma planilha: cada **linha** pode representar um contrato e cada **coluna**, uma característica, como órgão, data e valor. Chamamos uma linha de **registro** e uma coluna também pode ser chamada de **campo**. Uma tabela de banco de dados segue essa ideia, com regras mais explícitas sobre o que pode ser guardado.

## Por que há várias ferramentas?

O conjunto de ferramentas usado por um projeto é chamado de **stack**. Você não precisa conhecer todos os nomes de uma vez. Associe cada um a uma tarefa:

| Ferramenta | Papel em linguagem simples |
|---|---|
| Python | Linguagem para escrever instruções de coleta |
| Airflow | Organiza e acompanha a execução dessas instruções |
| PostgreSQL | Guarda os registros em tabelas consultáveis |
| dbt | Organiza instruções SQL para transformar e testar tabelas |
| Superset | Apresenta os resultados em gráficos e painéis |

O repositório reúne os arquivos que dizem como essas ferramentas trabalham juntas. Ao longo da trilha, vamos abrir uma parte de cada vez.

Uma equipe quer acompanhar a execução de recursos por órgão. Antes do gráfico, alguém precisa buscar os registros, organizar as tabelas e garantir que a atualização de amanhã continue funcionando. Esse é o trabalho da engenharia de dados.

## O que ela entrega

Um **pipeline** é o caminho automatizado do dado, da origem até o uso. Na aplicação de dados do Gov Hub, Python coleta, Airflow coordena, PostgreSQL armazena, dbt transforma e Superset apresenta os resultados.

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

O dado precisa ter origem identificável, atualização conhecida, testes e acesso adequado. Um gráfico correto hoje pode estar desatualizado amanhã; manter o caminho funcionando faz parte da entrega.

## Veja também

- [Onde encontrar cada parte do projeto](../referencia/engenharia-mapa-repositorio.md)
