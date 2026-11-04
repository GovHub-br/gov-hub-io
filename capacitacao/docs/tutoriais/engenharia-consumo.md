# Prática: da gold ao gráfico no Superset

> Tipo: **Tutorial**

## Da tabela para uma pergunta visual

O **Superset** é a ferramenta que permite escolher dados e apresentar gráficos. Um **dataset** registra qual tabela ou visão está disponível para análise; um **gráfico** escolhe como mostrar uma medida; um **dashboard** reúne gráficos e filtros em uma tela.

Uma **medida** é o número calculado, como soma do valor. Uma **dimensão** separa o resultado, como órgão ou mês. Um **filtro** limita quais registros participam da consulta, por exemplo apenas o exercício escolhido.

O programa que coleta dados e a conexão usada pelo Superset não precisam ter as mesmas permissões. Quem apresenta o indicador precisa ler a saída autorizada, sem receber acesso de gravação sobre a coleta.

## O que você vai construir

Um gráfico com filtro, baseado em um indicador já validado no PostgreSQL.

## Antes de começar

Escolha uma gold com granularidade, unidade e período documentados. Use dados sintéticos ou públicos e uma conexão de consumo com acesso somente de leitura aos dados autorizados.

## Passos

1. Abra `http://localhost:8088` e confira a conexão PostgreSQL configurada para o ambiente local. O banco deve ser acessado pelo endereço reconhecido pelo contêiner, não necessariamente por `localhost`.
2. Crie um **dataset**, a referência do Superset à tabela ou visão escolhida.
3. Confira tipos, dimensão temporal e medida. Se a gold já está agregada, entenda o que pode ser somado novamente.
4. Monte um gráfico para uma pergunta concreta, como valor por TED ou por exercício, conforme as colunas reais do modelo.
5. Acrescente um filtro e compare o resultado com uma consulta SQL equivalente, usando o mesmo período e critério.
6. Verifique se a atualização e o significado do indicador ficam claros para quem o usa.

## Exemplo: configure e confira a medida

Para um dataset com duas linhas, órgão A de valor 150 e órgão B de valor 200:

| Configuração | Escolha | O que deve aparecer |
|---|---|---|
| Dimensão | `orgao` | Uma categoria para A e outra para B |
| Medida | Soma de `valor` | Barras de 150 e 200 |
| Filtro | `orgao = A` | Apenas A, com 150 |
| Medida alternativa | Contagem de linhas | 1 para cada órgão, não seu valor financeiro |

O gráfico pode estar tecnicamente funcionando e ainda responder à pergunta errada se você escolher contagem no lugar de soma.

Para conferir o filtro, a consulta equivalente no conjunto de estudo é `select sum(valor) from ... where orgao = 'A'`: substitua `...` pelo nome real da tabela autorizada. Ela deve retornar 150. Os pontos são uma indicação de substituição, não SQL para executar literalmente.

## Resultado esperado

O valor do gráfico corresponde ao banco antes e depois do filtro. A conexão não depende de acesso à raw ou à bronze.

Para reduzir consultas pesadas, escolha colunas necessárias, agregações adequadas e filtros coerentes. Depois, aprofunde a apresentação na trilha de [Dashboards no Gov Hub](../../mapa.html?trilha=dashboards).

## Comece pelo gráfico mais simples

Na área de datasets, selecione a conexão, o schema e a tabela gold já validados. Confira algumas linhas na prévia. Depois crie um gráfico de barras, escolha uma dimensão existente e uma medida compatível com a granularidade.

Para um conjunto de estudo com órgão A totalizando 150 e órgão B totalizando 200, duas barras devem representar esses valores. Um filtro para A deve manter somente 150. Se o resultado divergir, volte à configuração da medida e à consulta SQL antes de mudar a aparência.

Uma conexão define como chegar ao banco. Dentro de um contêiner, `localhost` aponta para o próprio contêiner; por isso o endereço usado pelo Superset pode ser o nome do serviço PostgreSQL no Compose. Use a configuração da aplicação, em vez de copiar cegamente o endereço do cliente de banco do seu computador.

Os nomes exatos das ações variam por versão, mas a sequência é a mesma: dataset, prévia, gráfico, medida, dimensão e conferência.

## Veja também

- [PostgreSQL, formatos e o papel do MinIO](../referencia/engenharia-formatos.md)
- [Contribuir com uma mudança revisável](../guias/engenharia-contribuicao.md)
