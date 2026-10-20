# KPIs e Big Numbers

> Tipo: **Explicação**

## Contexto

Dois termos aparecem o tempo todo em projetos de dashboard e são frequentemente confundidos: **KPI** e
**Big Number**. Eles respondem a perguntas diferentes — um é sobre *o que acompanhar*, o outro sobre
*como apresentar*.

## O que são KPIs

KPI (*Key Performance Indicator*) significa Indicador-Chave de Desempenho. São métricas usadas para
acompanhar objetivos, metas ou resultados relevantes para a organização.

Exemplos: taxa de atendimento, produtividade, tempo médio de resposta, percentual de conclusão.

Um KPI não é apenas um número. Ele representa uma medida que ajuda a avaliar **se um objetivo está
sendo alcançado**.

## O que são Big Numbers

Big Numbers (*Big Number* no Superset, *Card* no Power BI) são indicadores apresentados com grande
destaque visual. Normalmente aparecem na parte superior dos dashboards e representam os números que
precisam ser vistos imediatamente.

Exemplos: total de atendimentos, quantidade de usuários ativos, número de processos concluídos.

Em muitos casos, um KPI é apresentado como um Big Number. O objetivo é facilitar a leitura e dar uma
visão rápida do cenário atual.

## Resumindo

- **Indicador** = qualquer métrica.
- **KPI** = indicador estratégico para tomada de decisão.
- **Big Number** = forma visual de destacar uma informação importante.

> O KPI define **o que acompanhar**. O Big Number define **como apresentar** essa informação.

## Para que servem

KPIs e Big Numbers ajudam a responder rapidamente perguntas fundamentais:

- Como estamos hoje?
- Estamos atingindo a meta?
- Melhoramos em relação ao período anterior?
- Existe algum sinal de alerta?

Sem esse destaque inicial, a pessoa é obrigada a navegar pelo dashboard para descobrir informações que
deveriam estar visíveis logo ao abrir a página.

Para cumprir esse papel, cada indicador destacado precisa de quatro coisas:

1. **definição clara** — o que exatamente está sendo contado, e em que recorte;
2. **meta ou referência** — contra o que esse número deve ser lido;
3. **tendência temporal** — está subindo ou descendo;
4. **comparação** — com o período anterior, com a meta, com outras unidades.

Um Big Number sem esses quatro elementos é apenas um número grande. Ver
[Indicação de contexto](indicacao-de-contexto.md).

## Trade-offs e alternativas

Escolher poucos KPIs é uma decisão política tanto quanto técnica: cada área quer o seu indicador no
topo. Um painel com doze Big Numbers alinhados não tem hierarquia — tem uma fileira.

A saída prática é limitar a faixa superior a três ou quatro indicadores que sustentem a pergunta
principal do painel, e levar os demais para o corpo da página, em visuais normais.

Cuidado também com a **vaidade métrica**: indicadores que parecem importantes mas não mudam nenhuma
decisão. Se ninguém consegue dizer que ação tomaria caso o número piorasse, ele provavelmente não é um
KPI.

## Veja também

- [Hierarquia visual](hierarquia-visual.md)
- [Perguntas que um dashboard deve responder](../referencia/perguntas-que-um-dashboard-deve-responder.md)
- [Guia rápido: pergunta → gráfico](../referencia/guia-rapido-pergunta-para-grafico.md)
