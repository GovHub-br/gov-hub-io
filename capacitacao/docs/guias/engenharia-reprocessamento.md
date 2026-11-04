# Reprocessamento e mudanças na fonte

> Tipo: **Guia**

## Quando você precisa refazer uma carga?

Imagine que os dados de março não chegaram por uma falha de conexão. Executar apenas a coleta de abril não preenche necessariamente esse intervalo. É preciso pedir os dados de março e executar novamente as etapas que dependem deles.

Outra situação é uma correção de regra: se o cálculo mudou, os meses anteriores podem precisar ser recalculados. **Reprocessar** é repetir o tratamento de um conjunto conhecido; **backfill** enfatiza o preenchimento de períodos passados.

## Prepare uma ficha de conferência

Antes de seguir os passos, escreva: fonte escolhida, tabela de destino, datas inicial e final, chave e total esperado. Dados **sintéticos** são exemplos inventados para estudo; permitem alterar registros sem afetar informações reais.

Use duas linhas de estudo, com valores 100 e 200. Antes da carga, o total esperado é 300. Depois de repeti-la sem mudanças, continuam existindo duas linhas e total 300. Ao corrigir somente o primeiro valor para 150, espere duas linhas e total 350. Essa ficha transforma “parece que funcionou” em uma conferência objetiva.

## Objetivo

Planejar uma repetição de carga sem misturar períodos ou esconder alterações na fonte.

## Antes de começar

Use o ambiente local e uma fonte pública ou dados sintéticos. Identifique a chave, o intervalo de coleta e a tabela de destino.

## Passos

1. Registre a contagem, as chaves distintas e um total de controle do período.
2. Execute a coleta duas vezes com a mesma entrada. Compare as três medidas e investigue diferenças inesperadas.
3. Simule uma correção em um registro e confirme que ele é atualizado, sem alterar outro registro.
4. Defina o intervalo histórico a refazer. **Backfill** é preencher períodos passados; reprocessamento também pode ser necessário após mudar uma regra.
5. Confira se as transformações dependentes precisam ser executadas novamente.
6. Se a fonte mudou colunas, compare nome, tipo e significado com o esperado. Leia o tratamento de `alter_table` no cliente PostgreSQL antes de aceitar a mudança.

Uma coluna adicionada não garante adaptação automática de todo o pipeline. Mudança de tipo, remoção de campo ou novo significado exige revisar os modelos, testes e consumidores.

## Exemplo: preencher um mês que faltou

| Período | Antes da correção | Ação planejada |
|---|---|---|
| Janeiro | Carregado e conferido | Preservar |
| Fevereiro | Ausente por falha | Buscar e carregar fevereiro |
| Março | Carregado e conferido | Preservar |

Depois da carga de fevereiro, as transformações que dependem desse mês precisam incorporar os registros. Um resumo anual passa a incluir fevereiro; um resumo mensal passa a ter a linha que faltava.

O critério de conclusão é verificar os três meses e reconciliar fevereiro com sua origem. Apenas disparar novamente a rotina de março pode continuar deixando o intervalo vazio. O período solicitado na nova execução precisa corresponder ao período que você pretende corrigir.

## Pronto

A mesma entrada mantém o estado final, as correções têm destino conhecido e o intervalo reprocessado fica registrado. Não use retentativas para encobrir uma incompatibilidade de esquema.

## Como uma mudança de coluna aparece

Se a fonte substituir `valor` por `valor_total`, o programa que procura `valor` pode parar de funcionar. Se mantiver o nome, mas passar de reais para centavos, o código pode continuar executando e produzir um número errado. Por isso, conferir o significado é tão importante quanto conferir o nome e o tipo.

## Veja também

- [Cargas completas, incrementais e idempotência](../explicacao/engenharia-idempotencia.md)
- [Consultar e conferir dados com SQL](../tutoriais/engenharia-sql.md)
