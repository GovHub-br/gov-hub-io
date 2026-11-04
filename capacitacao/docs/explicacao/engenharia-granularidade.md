# Granularidade, fatos e dimensões

> Tipo: **Explicação**

## Detalhe e resumo não são a mesma linha

Imagine dois contratos: o contrato 10 tem dois itens, de valores 40 e 60; o contrato 20 tem um item de valor 200. Uma tabela por item tem três linhas. Uma tabela por contrato tem duas: 10 com total 100 e 20 com total 200.

Uma tabela por órgão pode reunir os dois contratos e ter apenas uma linha, com total 300. Nenhuma dessas quantidades de linhas é errada por si só: cada tabela responde a uma pergunta diferente.

**Agregar** significa reunir registros para calcular um resumo, como somar os itens de cada contrato. **Medida** é o número analisado, como o valor. **Dimensão** oferece uma forma de separar essa análise, como órgão ou mês.

“Uma linha representa o quê?” é a primeira pergunta de modelagem. Sem essa resposta, até uma soma simples pode combinar medidas incompatíveis.

## Declare a granularidade

**Granularidade** é o significado de uma linha. Exemplos: uma nota de empenho, um item do empenho ou um total mensal por órgão. São três granularidades diferentes.

Escreva a frase antes do SQL e identifique a chave correspondente. “Uma linha por empenho” pode exigir exercício, unidade gestora e número, conforme a fonte. Não escolha uma chave apenas porque parece única em uma amostra pequena.

## Fatos e dimensões

| Elemento | Contém | Exemplo |
|---|---|---|
| Fato | Eventos e medidas | Valor de um empenho |
| Dimensão | Descrições usadas para analisar | Órgão, unidade e classificação |

Uma medida só pode ser somada nas dimensões em que essa operação faça sentido. Um saldo de fim de mês, por exemplo, não deve ser somado ao saldo do mês anterior para representar o saldo atual.

## Exemplo: da tabela de itens à tabela de contratos

| Contrato | Item | Valor |
|---|---|---|
| 10 | 1 | 40 |
| 10 | 2 | 60 |
| 20 | 1 | 200 |

Nesta entrada, contrato sozinho não é chave: o número 10 se repete corretamente. Para esses registros, contrato e item identificam a linha. Agrupando por contrato, a saída fica:

| Contrato | Valor total |
|---|---|
| 10 | 100 |
| 20 | 200 |

A chave e a descrição da linha mudaram; o total geral continua 300. Já um saldo de 100 em janeiro e 150 em fevereiro não representa 250 no fim de fevereiro: o saldo final é 150. Ser um número não torna toda medida somável em qualquer dimensão.

## Aplicação no projeto

Leia uma cadeia em `models/ted_dbt/`, da bronze até `gold/ted_resumo_orcamentario.sql`. Anote a granularidade e a chave em cada etapa antes de comparar totais.

Quando uma agregação reduz o número de linhas, a validação adequada é reconciliar medidas e grupos; exigir a mesma contagem da origem seria um teste incorreto.

## Como escrever o contrato da tabela

Antes de programar, complete: “Cada linha desta tabela representa ___, identificado por ___; o valor está em ___ e se refere ao período ___”. Por exemplo: “Cada linha representa um contrato por exercício, identificado por órgão, número e ano; o valor está em reais”.

Essa frase orienta a escolha da chave, os testes e os filtros do painel. Uma chave substituta pode facilitar relacionamentos entre tabelas, mas não muda o significado da linha.

Ao encontrar uma tabela desconhecida, leia sua descrição e examine poucas linhas. Se a frase ainda não estiver clara, resolva essa dúvida antes de juntar tabelas ou somar medidas.

## Veja também

- [Raw, bronze, silver e gold](engenharia-camadas.md)
- [Quando sobrescrever e quando guardar histórico](engenharia-historico.md)
