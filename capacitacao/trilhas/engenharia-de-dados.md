---
slug: engenharia-de-dados
titulo: Engenharia de Dados no Gov Hub
descricao: Da preparação do ambiente à entrega de um indicador confiável, com PostgreSQL, Python, Airflow e dbt.
categoria: tecnica
chamada: Um indicador confiável começa antes do gráfico. Aprenda a coletar, organizar, testar e entregar dados do Gov Hub, com explicações passo a passo na aplicação de dados.
etapas: Base=Ambiente e conceitos | Dado=SQL e modelagem | Pipeline=Ingestão e transformação | Entrega=Confiança e consumo
etapas_subtitulo: Quatro etapas: da primeira coleta ao indicador conferido
etapas_nota: **Práticas locais** ao longo da trilha. Use a aplicação data-application-gov-hub; o repositório deste site serve apenas o material de estudo.
---
# Trilha de aprendizagem: Engenharia de Dados no Gov Hub

> **Fonte única da trilha.** Edite este arquivo e rode `python3 tools/gen_roadmap.py` em `capacitacao/` para atualizar o catálogo e os arquivos gerados.
>
> A trilha reúne conceitos e práticas de engenharia de dados na aplicação Gov Hub. A organização dos níveis está em `docs/engenharia-de-dados/LEIA-ME.md`.
>
> Faça os itens essenciais em sequência; consulte os itens de apoio quando precisar. Cada cartão é uma aula. Não é necessário conhecer programação ou as ferramentas do projeto: os conceitos são apresentados antes das práticas. Leia em sequência e confira os resultados dos exemplos antes de avançar. As práticas usam ambiente local e dados públicos ou sintéticos.

## Nível 1 · Base e conceitos
Etapa: Base · Ícone: light-bulb
Entenda o caminho do dado, prepare o ambiente e aprenda a repetir uma carga sem duplicar resultados.

- [explanation] **Engenharia de dados: da fonte à decisão** — core — `docs/explicacao/engenharia-papel.md`
- [reference] **Onde encontrar cada parte do projeto** — support — `docs/referencia/engenharia-mapa-repositorio.md`
- [tutorial] **Preparar e conferir o ambiente local** — core — `docs/tutoriais/engenharia-ambiente.md`
- [reference] **Vocabulário e fontes do governo** — support — `docs/referencia/engenharia-glossario.md`
- [explanation] **ELT e processamento em lote** — core — `docs/explicacao/engenharia-elt-lote.md`
- [explanation] **Cargas completas, incrementais e idempotência** — core — `docs/explicacao/engenharia-idempotencia.md`
- [how-to] **Reprocessamento e mudanças na fonte** — core — `docs/guias/engenharia-reprocessamento.md`
