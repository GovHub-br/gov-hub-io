# Qualidade: o que precisa ser verdadeiro no dado

> Tipo: **Referência**

## O que um teste de dados verifica?

Um teste transforma uma expectativa em uma pergunta que pode ser repetida automaticamente. “Todo contrato precisa ter identificador” é uma expectativa. Procurar linhas sem identificador é uma forma de testá-la.

**Aprovar** significa não encontrar violações daquela regra. Não significa provar que todo o conjunto está correto em qualquer sentido. Por isso, combinamos controles diferentes.

No dbt, `not_null` procura valores ausentes; `unique` procura repetições; `relationships` confere se uma referência aparece na tabela esperada; `accepted_values` restringe valores a uma lista permitida. Esses nomes são usados na configuração, mas sua finalidade pode ser descrita em português antes do código.

## Dimensões e controles

| Dimensão | Pergunta | Controle possível |
|---|---|---|
| Completude | Faltou algum campo necessário? | `not_null` em campos obrigatórios |
| Unicidade | A chave se repete? | `unique` na chave do registro |
| Validade | O valor pertence ao conjunto esperado? | `accepted_values` e testes de tipo |
| Consistência | As relações e os totais concordam? | `relationships` e reconciliação |
| Atualidade | O dado atende ao período prometido? | Data de referência e última carga |

Um campo preenchido pode estar errado; um teste aprovado não prova todas as dimensões de qualidade.

## Exemplo: associe a linha inválida ao teste

Considere que IDs devem ser únicos e preenchidos, órgãos precisam existir no cadastro e a situação só pode ser `ativo` ou `cancelado`:

| Conteúdo recebido | Regra que detecta o problema |
|---|---|
| ID vazio | `not_null` |
| ID 10 em duas linhas | `unique` |
| Órgão Z sem cadastro correspondente | `relationships` |
| Situação `desconhecida` | `accepted_values` |

Para o exemplo de `relationships`, o órgão está preenchido: valores ausentes exigem um controle de completude separado. Cada regra responde a uma pergunta específica.

Já a atualidade compara datas: uma execução de hoje que só trouxe dados de janeiro não atende necessariamente à promessa de atualização diária. Primeiro defina qual data representa a atualização da fonte e qual atraso é aceitável; depois interprete o resultado do controle.

## Recursos do projeto

As macros em `macros/data_quality/` incluem `row_count_match` e `verificacao_tipagem`. Leia a assinatura e exemplos no código antes de aplicá-las.

`row_count_match` é apropriado quando a transformação deve preservar as linhas, como na passagem de fonte para bronze. Uma gold agregada precisa de controles compatíveis com sua granularidade.

Um teste singular dbt é uma consulta que devolve as linhas inválidas: para aprovar, deve retornar zero linhas. Essa convenção permite transformar uma regra de qualidade específica em uma verificação repetível.

## Exemplo: um teste singular devolve o erro

Se a regra de um conjunto de estudo exigir valores não negativos, esta consulta procura as violações:

```sql
with registros (id, valor) as (
    values (10, 100), (20, -10)
)
select id, valor
from registros
where valor < 0;
```

A saída é uma linha: ID 20, valor -10. Em um teste singular, encontrar essa linha significa reprovar. Ao corrigir o valor para 10 e repetir, a saída fica vazia e o teste aprova essa regra.

Não aplique a regra a qualquer dado financeiro sem avaliar seu significado: estornos podem ser negativos e legítimos. O exemplo ensina como tornar uma expectativa verificável; a expectativa precisa corresponder ao modelo real.

## Atualidade tem significado

Data da execução e data do fato são diferentes. Um pipeline pode rodar hoje e trazer dados antigos. O comando `dbt source freshness` permite verificar a atualidade de fontes. Seu uso exige configurar as fontes e os limites de atraso; esse monitoramento ainda não está configurado na aplicação.

## Um conjunto pode falhar de várias maneiras

Imagine contratos com ID, órgão e valor. Um ID vazio viola a completude da identificação. Dois registros com o mesmo ID podem violar a unicidade. Um código de órgão sem correspondência na tabela de órgãos pode violar a consistência do relacionamento.

Nenhum desses testes confirma sozinho se o valor financeiro é o mesmo da fonte. Para isso, compare totais e amostras do mesmo universo. “Mesmo universo” significa o mesmo período e os mesmos critérios de inclusão.

Atualidade depende da necessidade: uma fonte mensal pode estar adequada mesmo sem atualização diária. Primeiro defina o atraso aceitável; depois configure como observá-lo.

## Veja também

- [Prática: rastrear uma transformação até a gold](../guias/engenharia-cadeia-pratica.md)
- [Prática: provocar e diagnosticar uma falha de qualidade](../tutoriais/engenharia-falha-qualidade.md)
