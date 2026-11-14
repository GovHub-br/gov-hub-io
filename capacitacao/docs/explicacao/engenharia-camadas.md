# Raw, bronze, silver e gold

> Tipo: **Explicação**

## Uma tabela muda de propósito ao longo do caminho

A arquitetura Medallion separa responsabilidades entre raw, bronze, silver e gold, preservando o rastreamento das transformações.

Pense em uma prestação de contas: primeiro você guarda os registros recebidos, depois padroniza os valores, relaciona os registros e finalmente calcula os resumos. Preservar as etapas permite descobrir como o resumo foi produzido.

“Regra de negócio” é uma decisão sobre o significado dos dados: quais situações entram na análise, como classificar um registro e como calcular um indicador. Converter texto em número é uma preparação técnica; excluir contratos cancelados por decisão da análise é uma regra de negócio.

Um indicador está errado. Se coleta, limpeza e cálculo estiverem misturados, fica difícil saber onde corrigir. Separar as camadas permite conferir o dado em cada responsabilidade.

## O papel de cada camada

| Camada | Responsabilidade | Exemplo |
|---|---|---|
| Raw / fonte | Preservar os registros recebidos | Dados de notas de crédito no schema da fonte |
| Bronze | Ajustar tipos, preservando registros | Converter valor recebido como texto em número |
| Silver | Limpar e integrar segundo regras explícitas | Relacionar créditos e instrumentos |
| Gold | Entregar indicadores e agregações | Resumo orçamentário por TED |

No Gov Hub, **bronze não recebe filtros nem regras de negócio**. Ela lê a origem declarada com `source()`. As camadas seguintes usam `ref()` para depender de modelos anteriores.

## Exemplo: compare entrada, conversão e resumo

Use dois registros inventados do órgão A:

| Etapa | Representação | Quantidade de linhas |
|---|---|---|
| Raw | ID 1, valor textual `100,00`; ID 2, valor textual `200,00` | 2 |
| Bronze | ID 1, valor numérico 100; ID 2, valor numérico 200 | 2 |
| Silver | Os mesmos registros relacionados ao nome do órgão A | 2, se a relação tiver uma correspondência por registro |
| Gold | Órgão A, total em reais 300 | 1 |

Converter o tipo na bronze não exige excluir um dos registros. A redução para uma linha na gold é esperada porque a pergunta mudou de “quais são os registros?” para “qual é o total do órgão?”.

Se a bronze ficar com apenas uma linha, investigue a perda; se a gold ficar com uma linha, confira o total. A mesma contagem não é o objetivo de todas as camadas.

## Organização por assunto

Em `airflow_lappis/dags/dbt/ipea/models/`, domínios como `contratos_dbt`, `ted_dbt` e `pessoas_dbt` agrupam modelos do mesmo assunto. Dentro deles, procure `bronze/`, `silver/`, `gold/` e `views/`.

Uma view é uma consulta salva; seu nome não define a responsabilidade do dado. Ela também precisa ter propósito e acesso documentados.

## Limite importante

Separar camadas não garante qualidade automaticamente. Compare origem e bronze, documente regras da silver e valide os totais da gold. Uma linha perdida no começo pode virar um indicador convincente no final.

## Acompanhe um exemplo pequeno

Uma fonte entrega dois registros do órgão A, com valores escritos como `100,00` e `200,00`. Na raw, preservamos o recebido. Na bronze, os valores passam a ser números, e continuam existindo dois registros.

Na silver, podemos associar o código A ao nome do órgão e aplicar regras documentadas. Na gold, a soma por órgão produz uma linha com total 300, se ambos os registros fizerem parte do indicador.

Se o total virar 600, compare as etapas: uma junção na silver pode ter multiplicado as linhas. As camadas ajudam a localizar essa mudança sem refazer toda a investigação desde o gráfico.

## Veja também

- [Investigar consultas lentas no PostgreSQL](../guias/engenharia-desempenho.md)
- [Granularidade, fatos e dimensões](engenharia-granularidade.md)
