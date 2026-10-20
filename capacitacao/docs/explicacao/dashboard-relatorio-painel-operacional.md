# Dashboard, relatório analítico e painel operacional

> Tipo: **Explicação**

## Contexto

Um dos erros mais comuns em projetos de dados é esperar que uma única ferramenta atenda todas as
necessidades de informação. Na prática, decisões diferentes exigem formas diferentes de visualizar os
dados.

Embora usem os mesmos dados, dashboard estratégico, relatório analítico e painel operacional têm
objetivos específicos e atendem públicos diferentes.

## Diferenças de propósito

### Dashboard estratégico

Criado para responder rapidamente às principais perguntas do negócio. O foco é dar uma visão geral da
situação atual e apoiar a tomada de decisão.

Normalmente apresenta indicadores-chave (KPIs), metas, tendências, comparações e resultados
consolidados. O objetivo não é mostrar todos os detalhes, mas destacar o que realmente importa.

**Pergunta principal:** *"Estamos indo na direção certa?"*

### Relatório analítico

Usado quando é preciso investigar um resultado com maior profundidade. Permite explorar os dados
detalhadamente para encontrar causas, padrões e explicações.

Normalmente contém tabelas detalhadas, grandes volumes de dados, filtros específicos, segmentações
avançadas e possibilidade de exportação.

**Pergunta principal:** *"Por que isso aconteceu?"*

### Painel operacional

Acompanha atividades do dia a dia. O foco está no monitoramento constante e no acompanhamento de
processos em execução.

Normalmente apresenta status de atividades, filas, demandas abertas, alertas e informação em tempo
real ou quase real.

**Pergunta principal:** *"O que precisa ser feito agora?"*

## Quando usar cada abordagem

Não existe uma opção melhor que a outra. Existe a opção mais adequada para cada necessidade.

![Árvore de decisão que parte da pergunta "Que pergunta a pessoa traz?": "Estamos indo na direção certa?" leva ao dashboard estratégico (gestão, coordenação, direção; KPIs, metas, tendências); "Por que isso aconteceu?" leva ao relatório analítico (analistas, auditoria; tabelas, segmentações, exportação); "O que precisa ser feito agora?" leva ao painel operacional (equipes, supervisão; filas, alertas, tempo real).](../../assets/diagramas/dashboard-relatorio-painel-operacional.png)

| Use… | Quando | Exemplo |
|---|---|---|
| **Dashboard estratégico** | acompanhar resultados, avaliar desempenho, comparar períodos, monitorar metas, apoiar decisões gerenciais | uma gestora quer saber se o número de atendimentos aumentou e se as metas estão sendo alcançadas |
| **Relatório analítico** | investigar uma causa, auditar, validar informações, consultar registros detalhados | depois de identificar queda nos atendimentos, a equipe precisa descobrir quais unidades e períodos contribuíram |
| **Painel operacional** | há acompanhamento contínuo de processos e atividades que exigem ação rápida | acompanhar chamados abertos, filas de atendimento ou solicitações pendentes |

## Público-alvo e tomada de decisão

| | Público | Necessidade |
|---|---|---|
| **Dashboard estratégico** | gestão, coordenação, direção, quem decide | entender rapidamente o cenário geral, identificar oportunidades e riscos, definir prioridades |
| **Relatório analítico** | analistas, especialistas, equipes técnicas, auditoria | explorar detalhes, validar hipóteses, investigar causas |
| **Painel operacional** | equipes operacionais, supervisão, centros de monitoramento | acompanhar atividades em andamento, identificar problemas imediatos, agir rapidamente |

## Trade-offs e alternativas

Dashboard, relatório e painel operacional não são soluções concorrentes. Eles representam **níveis
diferentes de análise**:

- o painel operacional acompanha **o que está acontecendo agora**;
- o relatório analítico explica **por que algo aconteceu**;
- o dashboard estratégico mostra **o que realmente importa** para a tomada de decisão.

Por isso, ao migrar de uma análise baseada exclusivamente em planilhas para dashboards, o objetivo não
é eliminar os detalhes. É garantir que a informação mais importante seja encontrada rapidamente,
deixando a investigação detalhada para os momentos em que ela realmente for necessária.

## Veja também

- [Perguntas que um dashboard deve responder](../referencia/perguntas-que-um-dashboard-deve-responder.md)
- [Por que fazer um dashboard?](por-que-fazer-um-dashboard.md)
- [Organização de páginas e abas](organizacao-de-paginas-e-abas.md)
