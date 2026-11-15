---
slug: engenharia-de-dados
titulo: Engenharia de Dados no Gov Hub
descricao: Dos conceitos e da preparação do ambiente à entrega de um indicador confiável, com PostgreSQL, Python, Airflow e dbt.
categoria: tecnica
chamada: Um indicador confiável começa antes do gráfico. Entenda o Gov Hub, prepare o ambiente e aprenda a coletar, organizar, testar e entregar dados na aplicação.
etapas: Base=Conceitos e projeto | Ambiente=Preparação local | Dado=SQL e modelagem | Pipeline=Ingestão, orquestração e transformação | Entrega=Confiança e consumo
etapas_subtitulo: Cinco etapas: do contexto do projeto ao indicador conferido
etapas_nota: **Preparação antes da prática.** Conclua o nível de ambiente local antes de executar consultas e coletas. Use data-application-gov-hub; este site apresenta o material de estudo.
---
# Trilha de aprendizagem: Engenharia de Dados no Gov Hub

> **Fonte única da trilha.** Edite este arquivo e rode `python3 tools/gen_roadmap.py` em `capacitacao/` para atualizar o catálogo e os arquivos gerados.
>
> O público é de profissionais de TI com familiaridade com programação, terminal e Git. O nível 1 apresenta os conceitos e a aplicação; o nível 2 prepara o ambiente; os níveis seguintes desenvolvem SQL, pipeline e entrega. Consulte os itens de apoio quando precisar. As práticas usam ambiente local e dados públicos ou sintéticos.

## Nível 1 · Base e conceitos
Etapa: Base · Ícone: light-bulb
Entenda o papel da engenharia de dados, o contexto do Gov Hub, ETL/ELT e a arquitetura macro da aplicação.

- [explanation] **Engenharia de dados: da fonte à decisão** — core — `docs/explicacao/engenharia-papel.md`
- [explanation] **O Gov Hub e sua aplicação de dados** — core — `docs/explicacao/engenharia-projeto-gov-hub.md`
- [explanation] **ELT e processamento em lote** — core — `docs/explicacao/engenharia-elt-lote.md`
- [reference] **Onde encontrar cada parte do projeto** — core — `docs/referencia/engenharia-mapa-repositorio.md`
- [reference] **Vocabulário e fontes do governo** — support — `docs/referencia/engenharia-glossario.md`

## Nível 2 · Preparação do ambiente local
Etapa: Ambiente · Ícone: server
Prepare e valide o ambiente da aplicação: requisitos, configuração, serviços, Airflow, acessos, prática dbt e rotina local.

- [reference] **Requisitos e versões do ambiente** — core — `docs/referencia/engenharia-requisitos-ambiente.md`
- [how-to] **Configuração local e credenciais** — core — `docs/guias/engenharia-configuracao-local.md`
- [tutorial] **Inicializar os serviços com make setup** — core — `docs/tutoriais/engenharia-ambiente.md`
- [how-to] **Validar o Airflow e suas integrações** — core — `docs/guias/engenharia-airflow-configuracao.md`
- [how-to] **Validar PostgreSQL e Superset** — core — `docs/guias/engenharia-acessos-locais.md`
- [how-to] **Executar o dbt e conferir os dados no banco** — core — `docs/guias/engenharia-dbt-configuracao.md`
- [how-to] **Rotina local e verificação final** — core — `docs/guias/engenharia-rotina-ambiente.md`

## Nível 3 · SQL e modelagem
Etapa: Dado · Ícone: database
Consulte e organize os dados: tipos, chaves, granularidade e responsabilidades de raw, bronze, silver e gold.

- [tutorial] **Consultar e conferir dados com SQL** — core — `docs/tutoriais/engenharia-sql.md`
- [explanation] **JOINs e funções de janela sem duplicar totais** — core — `docs/explicacao/engenharia-joins.md`
- [reference] **Tipos, chaves e gravação consistente** — core — `docs/referencia/engenharia-tipos-chaves.md`
- [how-to] **Investigar consultas lentas no PostgreSQL** — support — `docs/guias/engenharia-desempenho.md`
- [explanation] **Raw, bronze, silver e gold** — core — `docs/explicacao/engenharia-camadas.md`
- [explanation] **Granularidade, fatos e dimensões** — core — `docs/explicacao/engenharia-granularidade.md`
- [explanation] **Quando sobrescrever e quando guardar histórico** — support — `docs/explicacao/engenharia-historico.md`

## Nível 4 · Ingestão, orquestração e transformação
Etapa: Pipeline · Ícone: deploy
Entenda os três trabalhos de um pipeline e faça cada um com dados reais do PNCP: coleta em Python, gravação no banco sem duplicar, DAG no Airflow, reprocessamento e modelos dbt até a gold.

- [explanation] **Ingestão: trazer o dado da fonte para o banco** — core — `docs/explicacao/engenharia-ingestao.md`
- [explanation] **Orquestração: quem roda o quê, quando e em que ordem** — core — `docs/explicacao/engenharia-orquestracao.md`
- [explanation] **Transformação: da raw à gold com SQL versionado** — core — `docs/explicacao/engenharia-transformacao.md`
- [explanation] **Cargas completas, incrementais e idempotência** — core — `docs/explicacao/engenharia-idempotencia.md`
- [tutorial] **Prática: coletar dados de uma API com Python** — core — `docs/tutoriais/engenharia-coleta-python.md`
- [tutorial] **Prática: gravar a coleta em bancos de dados** — core — `docs/tutoriais/engenharia-ingestao-bancos.md`
- [tutorial] **Prática: orquestrar a coleta com o Airflow** — core — `docs/tutoriais/engenharia-airflow-dag.md`
- [how-to] **Reprocessamento e mudanças na fonte** — core — `docs/guias/engenharia-reprocessamento.md`
- [tutorial] **Prática: transformar com dbt, da raw à gold** — core — `docs/tutoriais/engenharia-dbt-camadas.md`
- [how-to] **Guia: adicionar uma fonte nova ao repositório** — core — `docs/guias/engenharia-fonte-nova.md`
- [reference] **Fontes e clientes do repositório** — support — `docs/referencia/engenharia-fontes.md`
- [reference] **Comandos do dia a dia: Airflow, dbt e banco** — support — `docs/referencia/engenharia-comandos.md`

## Nível 5 · Qualidade, governança e entrega
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
