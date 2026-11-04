# Cargas completas, incrementais e idempotência

> Tipo: **Explicação**

## Primeiro: o que é uma carga?

Uma **carga** é uma operação que grava um conjunto de dados no destino. A **entrada** é o conjunto recebido; o **estado final** é o conteúdo que ficou guardado depois da operação.

Uma **chave** identifica qual registro estamos tratando. Pense no número de um contrato, combinado com o órgão e o ano quando necessário. Já o valor do contrato pode mudar sem que ele deixe de ser o mesmo contrato.

## Um exemplo com duas cargas

| Momento | Entrada | O que deve ficar no destino |
|---|---|---|
| Primeira carga | Contrato 10, valor 100 | Uma linha: contrato 10, valor 100 |
| Repetição da mesma entrada | Contrato 10, valor 100 | A mesma linha, sem cópia extra |
| Correção na fonte | Contrato 10, valor 150 | Uma linha: contrato 10, valor 150 |

O upsert combina duas ações: **insert**, inserir uma linha que ainda não existe; e **update**, atualizar uma linha existente. Ele depende da chave para distinguir essas situações.

Ao encontrar o termo `conflict_fields`, leia-o como “campos usados para reconhecer que o registro já existe”. A granularidade, estudada adiante, define exatamente o que cada linha representa e ajuda a escolher esses campos.

Uma coleta falhou e foi disparada novamente. Se a segunda execução duplicar os empenhos, o total do painel ficará errado mesmo com todas as tarefas verdes.

## Como a carga procura mudanças

| Carga | O que lê | Cuidado principal |
|---|---|---|
| Completa | Todo o conjunto definido | Custo e substituição segura do destino |
| Incremental | Registros novos ou alterados | Critério para detectar mudanças e atrasos |

Incremental não significa apenas “data de hoje”: uma fonte pode corrigir um registro antigo. O período de busca precisa considerar essa possibilidade.

## O papel da chave

**Idempotência** é repetir a mesma entrada e obter o mesmo estado final. Um **upsert** insere quando a chave não existe e atualiza quando ela já existe.

Na aplicação, procure `insert_data` em `airflow_lappis/plugins/cliente_postgres.py` e os campos de conflito usados pela coleta. A chave deve identificar um registro na granularidade correta; uma chave incompleta pode sobrescrever linhas diferentes.

## Exemplo: uma chave incompleta altera o contrato errado

Considere estes dois registros legítimos:

| Órgão | Número do contrato | Ano | Valor |
|---|---|---|---|
| A | 10 | 2026 | 100 |
| B | 10 | 2026 | 200 |

Usar apenas o número 10 como chave faz os registros parecerem iguais. Um upsert pode substituir o valor do órgão A pelo do órgão B, mesmo sem aumentar a quantidade de linhas.

Para estes dados de estudo, a combinação órgão, número e ano distingue os contratos. Repetir os dois registros deve manter duas linhas e total 300. Essa é a razão para conferir **identidade e valores**, além da contagem. Na fonte real, a composição da chave deve seguir seu contrato de dados.

## Como reconhecer o problema

Compare contagem, quantidade de chaves distintas e totais antes e depois de repetir a carga com a mesma entrada. Contagem estável, sozinha, não prova que os valores estão corretos.

**Pense no caso:** se um empenho recebe um valor corrigido, a carga deve atualizar o registro correspondente e preservar os demais. Inserir outra cópia não resolve a correção.

## Veja também

- [ELT e processamento em lote](engenharia-elt-lote.md)
- [Reprocessamento e mudanças na fonte](../guias/engenharia-reprocessamento.md)
