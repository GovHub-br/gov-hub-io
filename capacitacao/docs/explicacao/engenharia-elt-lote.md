# ELT e processamento em lote

> Tipo: **Explicação**

## Traduzindo as etapas

**Extrair** é buscar registros na fonte. **Carregar** é gravá-los no destino. **Transformar** é preparar esses registros para o uso, por exemplo convertendo um valor de texto em número ou somando despesas por órgão.

ETL e ELT são siglas em inglês para essas etapas: Extract, Transform e Load. A ordem das letras indica quando a transformação acontece. Não se trata de duas listas de ferramentas, mas de duas formas de organizar o trabalho.

Imagine que a fonte entregue três registros de contratos. Na carga, guardamos os registros no banco. Depois, uma transformação agrupa os valores por órgão. O resultado pode ter duas linhas, mesmo que a entrada tivesse três: cada linha passa a representar um resumo.

## Primeiro carregar, depois transformar

No **ETL**, o dado é transformado antes de chegar ao destino. No **ELT**, ele é carregado primeiro e transformado depois, dentro do banco.

O fluxo da aplicação é ELT: o cliente Python busca os dados, o PostgreSQL os recebe e os modelos dbt produzem as camadas para análise. O Airflow coordena quando cada parte roda.

## Lote ou fluxo contínuo

| Abordagem | Como funciona | Exemplo |
|---|---|---|
| Lote | Processa um conjunto em horários ou execuções definidos | Atualizar os contratos do dia |
| Streaming | Processa eventos continuamente | Reagir a cada evento recebido |

A aplicação estudada usa lote. Um painel consultável a qualquer hora não significa que a fonte está sendo atualizada em tempo real.

## Exemplo: a ordem das etapas muda

A fonte entrega `valor` como texto, escrito `100,00`. Queremos um número que possa participar de uma soma.

| Organização | O que acontece com esse registro |
|---|---|
| ETL | Buscar o texto, convertê-lo em número e só então carregar o resultado no destino |
| ELT | Buscar e guardar o recebido; depois executar a conversão no banco |

Na aplicação, a saída tratada pode ser 100, mas a entrada recebida permanece disponível para conferência conforme a organização da coleta.

Agora imagine duas atualizações: em lote, os registros de um período são processados em uma execução definida; em streaming, cada evento pode ser tratado à medida que chega. Um contrato registrado às 10h pode aparecer apenas depois do próximo lote. Recarregar o gráfico às 10h01 não cria uma nova coleta por conta própria.

## Qualidade desde a entrada

Mesmo antes das regras de negócio, confira formato, campos obrigatórios e período recebido. Uma resposta vazia por erro de autenticação não deve ser interpretada como ausência de contratos.

Separar as etapas ajuda a localizar a falha: o problema veio da fonte, da gravação ou do cálculo? Essa distinção reduz o risco de corrigir o lugar errado.

## Veja também

- [Vocabulário e fontes do governo](../referencia/engenharia-glossario.md)
- [Cargas completas, incrementais e idempotência](engenharia-idempotencia.md)
