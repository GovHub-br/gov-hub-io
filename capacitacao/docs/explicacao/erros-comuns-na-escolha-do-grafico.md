# Erros mais comuns na escolha do gráfico

> Tipo: **Explicação**

## Contexto

Os erros de escolha de gráfico se repetem com uma regularidade impressionante entre organizações
diferentes. Conhecê-los antecipadamente economiza vários ciclos de revisão.

## Pizza com muitas categorias

O erro mais frequente de todos. Quando há muitas fatias, quem lê passa mais tempo tentando identificar
as diferenças do que compreendendo a informação. Se a pizza parece um mosaico de cores, ela não é a
melhor escolha.

**Regra prática:** até 5 ou 6 categorias. Acima disso, use barra ou Treemap.

## Séries temporais em gráficos inadequados

Comparar meses com um gráfico de barras funciona, mas perde a leitura de trajetória. Pior ainda é
representar evolução temporal em pizza — a ordem cronológica simplesmente desaparece.

Quando o tempo é a dimensão principal, use linha ou área.

## Uso excessivo de mapas

Mapas chamam atenção, e é justamente por isso que aparecem onde não deveriam. Se a localização não
influencia a decisão, o mapa adiciona complexidade sem gerar valor.

*Atendimentos por município* → mapa pode ser útil.
*Atendimentos por setor interno* → o mapa não agrega nada.

## Excesso de cores

Atribuir uma cor diferente para cada categoria aumenta o ruído visual sem adicionar informação. Na
maioria das situações basta uma cor principal; destaques devem ser usados apenas quando houver uma
mensagem específica a comunicar.

## Não ordenar os valores

Apresentar barras em ordem aleatória dificulta a comparação. Na maioria dos casos, ordenar do maior
para o menor produz uma análise mais eficiente.

## Comparar valores muito próximos em área

Pizza e donut não são adequados para comparar diferenças pequenas — o olho compara ângulos com pouca
precisão. Quando a precisão importa, barras funcionam melhor.

## Eixos truncados e 3D

Cortar o eixo Y para começar acima de zero amplifica visualmente diferenças pequenas. Efeitos 3D
distorcem proporções. Ambos aparecem com frequência em apresentações e ambos induzem a leituras
erradas.

## Trade-offs e alternativas

Nem todo "erro" é errado em qualquer contexto. Um eixo truncado é legítimo quando a variação relevante
é pequena e o gráfico deixa isso explícito. Uma pizza com muitas fatias pode funcionar se o objetivo
for apenas mostrar que a distribuição é pulverizada.

O critério é sempre o mesmo: a escolha ajuda ou atrapalha a leitura correta?

## Veja também

- [Qual é o gráfico certo para o meu dado?](qual-e-o-grafico-certo.md)
- [Guia rápido: pergunta → gráfico](../referencia/guia-rapido-pergunta-para-grafico.md)
