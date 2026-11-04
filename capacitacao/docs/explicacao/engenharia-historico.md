# Quando sobrescrever e quando guardar histórico

> Tipo: **Explicação**

## Atualização e histórico respondem a perguntas diferentes

Considere uma unidade chamada “Atendimento” até junho e “Serviços ao Cidadão” a partir de julho. Se você sobrescrever o nome, todos os registros relacionados podem passar a mostrar o nome atual. Isso é útil para uma lista atualizada, mas não responde qual nome estava vigente em maio.

Guardar versões permite responder à segunda pergunta. Cada versão precisa estar ligada à mesma unidade e ao período em que é válida. Versão não é duplicação indevida quando o período faz parte da granularidade.

Na prática, os campos de início e fim devem permitir escolher uma única versão para uma determinada data. Duas versões válidas ao mesmo tempo podem multiplicar os resultados de uma junção.

Uma unidade muda de nome. Um relatório antigo deve mostrar o nome atual ou o nome que valia na época? Essa decisão define como guardar a mudança.

## Duas estratégias de histórico

| Estratégia | O que acontece | Quando faz sentido |
|---|---|---|
| SCD tipo 1 | Sobrescreve o valor anterior | Corrigir uma descrição sem precisar consultar versões |
| SCD tipo 2 | Mantém versões com períodos de validade | Reconstituir como a informação era em cada período |

SCD significa dimensão que muda ao longo do tempo. Guardar histórico exige definir chave, início e fim de validade e qual versão está vigente.

## Exemplo: uma mudança de nome em julho

Para a mesma unidade de código 7, uma tabela com SCD tipo 2 pode conter estes períodos ilustrativos:

| Unidade | Nome | Início incluído | Fim excluído |
|---|---|---|---|
| 7 | Atendimento | 2026-01-01 | 2026-07-01 |
| 7 | Serviços ao Cidadão | 2026-07-01 | Sem término conhecido |

Uma consulta para 15 de maio encontra “Atendimento”; para 15 de julho, “Serviços ao Cidadão”. Aqui, o fim é excluído para que 1º de julho não encontre as duas versões ao mesmo tempo.

Com SCD tipo 1, haveria apenas o nome atualizado. Você conseguiria consultar o nome atual, mas essa tabela não preservaria o anterior. As datas mostram a convenção deste exemplo; na implementação, siga a convenção de validade do modelo.

## Snapshots no dbt

Um **snapshot** registra mudanças observadas entre execuções. No projeto, procure `snapshots/tables_snapshot.yml` no diretório dbt.

Ele não recupera alterações que nunca foram observadas. Se a fonte mudou duas vezes entre coletas, um snapshot pode registrar somente o estado visto na coleta seguinte.

## Decisão prática

Use o significado do relatório: corrigir um erro de digitação é diferente de preservar a lotação histórica de uma pessoa. Também considere a necessidade de guardar cada atributo e o controle de acesso.

Antes de implementar, descreva uma alteração de exemplo e qual resultado a consulta histórica deve devolver. Essa descrição vira um critério de teste.

## Histórico não é cópia de segurança

Uma cópia de segurança serve para recuperar dados após perda ou falha. Uma tabela com histórico serve para consultar mudanças como parte da análise. São necessidades diferentes.

Um snapshot compara o estado observado agora com o estado observado antes e registra diferenças conforme sua configuração. Se você coletar apenas no fim do dia, não verá necessariamente todas as alterações feitas durante o dia.

Antes de escolher a estratégia, formule uma pergunta temporal: “Preciso saber como a unidade se chamava quando o contrato foi assinado?”. Se essa informação for necessária, defina como ela será capturada, ligada ao evento e consultada.

## Veja também

- [Granularidade, fatos e dimensões](engenharia-granularidade.md)
- [Clientes Python: uma responsabilidade por fonte](engenharia-clientes.md)
