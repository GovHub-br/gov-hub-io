# ADR 0001 — Mapeamento Diátaxis do levantamento de conteúdos

**Status:** aceito
**Data:** 2026-09-21

## Contexto

O levantamento de conteúdos da trilha foi escrito como uma ementa de curso, organizada por módulos
temáticos (fundamentos, design, acessibilidade, arquitetura da informação, storytelling, Power BI,
governança, prática guiada). Essa organização responde à pergunta *"o que ensinar?"*, mas não à
pergunta *"que tipo de página é esta?"*.

O próprio documento-fonte inclui uma seção de metodologia mapeando a ementa para os quatro tipos do
[Diátaxis](https://diataxis.fr/), usando a grade 2×2 (prático × teórico, cruzado com estudo ×
trabalho).

## Decisão

Adotamos o mapeamento proposto na fonte, com uma única extensão.

| Conteúdo original | Tipo Diátaxis |
|---|---|
| 1.1 e 1.2 — fundamentos conceituais | Explicação |
| 2.1 — arquitetura da informação | Explicação |
| 2.2 — hierarquia visual | Explicação |
| 2.3 — design de dashboards (geral) | Explicação |
| 2.3 — significado das cores / paletas | **Referência** |
| 2.3 — gráficos: conceitos e erros comuns | Explicação |
| 2.3 — escolha do gráfico (Superset / Power BI) | **Referência** |
| 3 — prática guiada (8.1 a 8.9) | Tutorial |
| tarefas técnicas pontuais fora do tutorial | Guia (how-to) |
| checklists de qualidade e acessibilidade | Referência |

A extensão: a trilha usa **seis** tipos de página, não quatro. Além dos quatro quadrantes, existem
**Desafio** (`docs/desafios/`) e **Pesquisa** (`docs/pesquisa/`), seguindo o mesmo arranjo do
repositório que serviu de referência estrutural.

## Consequências

**O bloco de fundamentos é inteiramente Explicação.** Isso inclui "quando usar cada abordagem" e
"público-alvo", porque ainda respondem *por quê/quando*, não *como fazer*.

**Os catálogos de gráficos são Referência, não Tutorial.** Eles são feitos para serem escaneados
durante o trabalho, não lidos do início ao fim. Por isso foram divididos por família de visual
(tabelas, séries temporais, comparação, distribuição, composição, correlação, geoespacial), cada uma em
sua própria página consultável.

**A prática guiada é o único Tutorial.** É o único ponto da ementa que se encaixa nesse quadrante.

**A lacuna de how-to foi criada explicitamente.** Na ementa original não havia guia autônomo — as
tarefas técnicas só existiam dentro do tutorial. Criamos `docs/guias/` com quatro páginas-esqueleto
para que essas tarefas possam ser extraídas quando alguém precisar resolvê-las fora do fluxo de
aprendizagem, reaproveitando o texto do tutorial.

**Os checklists ficam em Referência mesmo aparecendo dentro do tutorial.** O checklist final (8.8) e o
de acessibilidade são listas curtas de consulta; o tutorial os referencia em vez de duplicá-los.

## Alternativas consideradas

**Manter a estrutura de módulos.** Mais fiel à ementa, mas perde a garantia de propósito único por
página — foi exatamente o que a seção de metodologia da fonte recomendou evitar.

**Um catálogo único de gráficos.** Uma página só com todos os visuais seria mais fácil de gerar, mas
inconsultável na prática: quem está construindo quer abrir "distribuição", não rolar por quatorze
visuais.
