# Desafio: uma fonte até um indicador confiável

> Tipo: **Desafio**

## Um ponto de partida pequeno

O desafio integra o que você já estudou; não exige escolher uma fonte complexa. Comece com dois registros inventados: contrato 10 do órgão A, valor 100; contrato 20 do órgão B, valor 200. Defina a pergunta: “Qual é o valor total de contratos por órgão neste período?”.

Use as práticas anteriores como apoio: cliente mínimo para receber registros, SQL para conferir valores, modelo bronze para tipos, testes para chaves e Superset para o gráfico. Se alguma etapa ainda estiver confusa, retome essa aula antes de acrescentar uma ferramenta nova.

Separe a entrega em três momentos: primeiro obter e repetir a carga; depois organizar e validar as tabelas; por fim apresentar e explicar o resultado. Concluir um momento com evidências é melhor que executar tudo sem saber o que aconteceu.

## O desafio

Uma equipe de gestão precisa acompanhar um valor por órgão e período. Construa o caminho de uma fonte pública ou sintética até um gráfico, demonstrando que o resultado pode ser conferido e reprocessado.

## O que entregar

- Pergunta de negócio, público e período de atualização.
- Cliente Python e coleta com parâmetros limitados, coordenada por uma DAG.
- Tabela raw e modelos bronze, silver e gold com responsabilidades distintas.
- Granularidade, chave, descrições e testes dos modelos.
- Um gráfico com filtro no Superset e consulta SQL usada na conferência.
- Registro de uma falha controlada, sua causa e a correção.
- Descrição de contribuição pronta para revisão, sem envio obrigatório.

## Exemplo: uma entrega com resultados verificáveis

| Conferência | Resultado esperado para os dois registros de estudo |
|---|---|
| Primeira carga | Contratos 10 e 20; total 300 |
| Mesma carga repetida | Mesmos contratos; total 300 |
| Valor do contrato 10 corrigido para 150 | Mesmos contratos; total 350 |
| Gráfico por órgão | A = 150; B = 200 |
| Filtro somente para A | Total 150 |

Escolha uma falha separada para demonstrar qualidade, como duplicar um ID na transformação de estudo. Guarde o teste reprovado e sua aprovação após a correção.

A entrega pode ser explicada por outra pessoa assim: “Consigo localizar os registros, repetir a carga, encontrar a regra do total e comparar o gráfico com o banco”. Essa explicação é o resultado desejado, além dos arquivos e da tela final.

## Critérios de aceitação

1. A mesma entrada pode ser carregada duas vezes sem duplicar chaves nem alterar totais indevidamente.
2. Uma correção de valor atualiza o registro certo.
3. A bronze preserva registros e só ajusta tipos; regras e agregações ficam nas camadas adequadas.
4. Um teste identifica a falha provocada e aprova depois da correção.
5. O total da gold e do gráfico é reconciliado com a fonte, com os mesmos critérios.
6. Outra pessoa consegue seguir a linhagem e reproduzir a conferência.
7. O consumo respeita as permissões definidas e nenhum segredo ou dado pessoal é exposto.

## Limite da entrega

Use ambiente local, dados de estudo e um único indicador. MinIO, produção e publicação não são necessários. A proposta é completar um percurso pequeno com evidências, antes de ampliar fontes e volume.

## Como montar as evidências

Guarde uma anotação com entrada, saída esperada e saída observada em cada etapa. Ao repetir os dois registros, espere duas chaves e total 300. Ao corrigir o contrato 10 para 150, espere as mesmas chaves e total 350.

Escolha uma falha compreensível, como uma chave repetida ou uma linha retirada da bronze de estudo. Registre qual teste a detectou, a correção e a nova aprovação. Explique também onde outra pessoa encontra os arquivos e como executa a conferência.

Os critérios de aceitação abaixo são as condições para considerar a entrega concluída. Uma captura de tela do gráfico ajuda a mostrar a apresentação, mas as consultas, testes e descrições demonstram por que o número merece confiança.

## Veja também

- [Contribuir com uma mudança revisável](../guias/engenharia-contribuicao.md)
