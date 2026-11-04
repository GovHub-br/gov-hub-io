# Tipos, chaves e gravação consistente

> Tipo: **Referência**

## Por que o banco precisa de tipos?

O **tipo de dado** define quais valores uma coluna aceita e quais operações fazem sentido. O texto `100` é uma sequência de caracteres; o número `100` pode participar de uma soma. Eles podem parecer iguais na tela, mas o banco os trata de maneiras diferentes.

Nem todo conjunto de algarismos deve virar número. Um código como `0012` pode precisar preservar os zeros iniciais. Datas também precisam ser reconhecidas como datas para permitir filtros por período.

Uma **restrição** é uma regra aplicada pelo banco, como impedir duas linhas com a mesma chave. Um **índice** é uma estrutura que ajuda o banco a localizar registros; um índice único também participa da proteção contra repetição.

## Escolhas que afetam o resultado

| Elemento | Para que serve | Cuidado |
|---|---|---|
| `numeric` | Valores decimais exatos, como montantes financeiros | Não guardar dinheiro como texto |
| `date` / timestamp | Datas e instantes | Distinguir data do fato e data da carga |
| Chave natural | Identificação recebida da fonte | Pode exigir várias colunas |
| Chave substituta | Identificação criada no modelo | Não substitui a regra de unicidade do negócio |
| Restrição única | Impede repetição da chave | Precisa corresponder à granularidade |
| Transação | Agrupa uma operação para confirmar ou desfazer | Evita gravar apenas parte de uma carga |

## Exemplo: o mesmo conteúdo, operações diferentes

| Entrada | Tratamento | Resultado e interpretação |
|---|---|---|
| Texto `1.234,56` | Interpretar separador de milhar e decimal | Número 1234.56 para cálculos |
| Código `0012` | Preservar como texto | Continua identificando `0012` |
| Data `2026-01-02` | Interpretar como data | Pode ser comparada com outros dias |
| Texto `não informado` no valor | Detectar ausência ou erro de formato | Não converter silenciosamente em zero |

Uma transação também pode ser mostrada pelo resultado: se duas gravações precisam ocorrer juntas e a segunda falha, desfazer a transação deve retirar a primeira gravação ainda não confirmada. Confirmar a primeira antes de executar a segunda já cria outra situação: a primeira não será desfeita por um rollback posterior.

Por isso, procure tanto os comandos quanto os limites da transação ao ler o cliente de banco.

## Upsert na coleta

No cliente PostgreSQL, `INSERT ... ON CONFLICT` trata conflitos de chave. O alvo do conflito precisa ter uma restrição ou índice único compatível. Confira `conflict_fields` e as colunas atualizadas antes de assumir que uma carga é repetível.

Os modelos incrementais usam a estratégia `merge` e `unique_key`. A configuração exata depende da versão do dbt e do adaptador utilizados pela aplicação.

## Conversões

O texto `1.234,56` precisa ser interpretado conforme seu formato de origem. As macros `parse_financial_value` e `safe_casts` concentram esse tratamento no projeto.

Confira o que a macro faz com um valor inválido. Convertê-lo em nulo só é aceitável quando a ocorrência fica visível em um teste ou registro de qualidade.

## Uma transação protege um conjunto de ações

Imagine uma carga que grava registros e depois registra que o período foi concluído. Se houver falha entre essas ações, pode surgir uma indicação enganosa de conclusão. Uma transação permite organizar ações que devem ser confirmadas juntas, ou desfeitas em caso de erro.

Ao ler código, `commit` indica confirmação e `rollback`, desfazer as alterações da transação. Isso não significa que toda carga já esteja protegida corretamente: é preciso identificar quais operações estão dentro da mesma transação.

Uma **macro** é uma instrução reutilizável. Centralizar a conversão de valores nela evita que cada modelo interprete `1.234,56` de um jeito diferente.

## Veja também

- [JOINs e funções de janela sem duplicar totais](../explicacao/engenharia-joins.md)
- [Investigar consultas lentas no PostgreSQL](../guias/engenharia-desempenho.md)
