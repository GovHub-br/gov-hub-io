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
> Faça os itens essenciais em sequência; consulte os itens de apoio quando precisar. Cada cartão é uma aula. O público é de profissionais de TI, com familiaridade com programação, terminal e Git. Os conceitos de engenharia de dados e as especificidades das ferramentas e da aplicação são apresentados ao longo da trilha. Confira os resultados dos exemplos antes de avançar. As práticas usam ambiente local e dados públicos ou sintéticos.

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

## Nível 2 · SQL e modelagem
Etapa: Dado · Ícone: database
Consulte e organize os dados: tipos, chaves, granularidade e responsabilidades de raw, bronze, silver e gold.

- [tutorial] **Consultar e conferir dados com SQL** — core — `docs/tutoriais/engenharia-sql.md`
- [explanation] **JOINs e funções de janela sem duplicar totais** — core — `docs/explicacao/engenharia-joins.md`
- [reference] **Tipos, chaves e gravação consistente** — core — `docs/referencia/engenharia-tipos-chaves.md`
- [how-to] **Investigar consultas lentas no PostgreSQL** — support — `docs/guias/engenharia-desempenho.md`
- [explanation] **Raw, bronze, silver e gold** — core — `docs/explicacao/engenharia-camadas.md`
- [explanation] **Granularidade, fatos e dimensões** — core — `docs/explicacao/engenharia-granularidade.md`
- [explanation] **Quando sobrescrever e quando guardar histórico** — support — `docs/explicacao/engenharia-historico.md`

## Nível 3 · Ingestão, orquestração e transformação
Etapa: Pipeline · Ícone: deploy
Acompanhe uma fonte do cliente Python à transformação dbt, com Airflow, Cosmos e práticas locais guiadas.

- [explanation] **Clientes Python: uma responsabilidade por fonte** — core — `docs/explicacao/engenharia-clientes.md`
- [reference] **REST, SOAP, e-mail, bancos e arquivos** — support — `docs/referencia/engenharia-fontes.md`
- [how-to] **Paginação, tempo limite e falha visível** — core — `docs/guias/engenharia-resiliencia.md`
- [tutorial] **Prática: do cliente mínimo à camada raw** — core — `docs/tutoriais/engenharia-cliente-pratica.md`
- [reference] **DAGs, tarefas e configuração no Airflow** — core — `docs/referencia/engenharia-airflow.md`
- [tutorial] **Prática: executar e investigar uma DAG** — core — `docs/tutoriais/engenharia-airflow-pratica.md`
- [reference] **Modelos dbt: source, ref e materializações** — core — `docs/referencia/engenharia-dbt.md`
- [tutorial] **Prática: schema e testes antes do SQL** — core — `docs/tutoriais/engenharia-dbt-pratica.md`
- [explanation] **Como o Cosmos leva o dbt ao Airflow** — core — `docs/explicacao/engenharia-cosmos.md`
- [how-to] **Prática: rastrear uma transformação até a gold** — core — `docs/guias/engenharia-cadeia-pratica.md`

## Nível 4 · Qualidade, governança e entrega
Etapa: Entrega · Ícone: shield-check
Valide o resultado, documente sua origem, controle o acesso e entregue um indicador conferido no Superset.

- [reference] **Qualidade: o que precisa ser verdadeiro no dado** — core — `docs/referencia/engenharia-qualidade.md`
- [tutorial] **Prática: provocar e diagnosticar uma falha de qualidade** — core — `docs/tutoriais/engenharia-falha-qualidade.md`
- [how-to] **Logs, reconciliação e atualização** — core — `docs/guias/engenharia-observabilidade.md`
- [explanation] **Dados pessoais, segredos e menor privilégio** — core — `docs/explicacao/engenharia-acesso.md`
- [how-to] **Documentar colunas e seguir a linhagem** — core — `docs/guias/engenharia-metadados.md`
- [reference] **PostgreSQL, formatos e o papel do MinIO** — support — `docs/referencia/engenharia-formatos.md`
- [tutorial] **Prática: da gold ao gráfico no Superset** — core — `docs/tutoriais/engenharia-consumo.md`
- [how-to] **Contribuir com uma mudança revisável** — core — `docs/guias/engenharia-contribuicao.md`
- [challenge] **Desafio: uma fonte até um indicador confiável** — capstone — `docs/desafios/engenharia-desafio.md`
