---
slug: adocao
titulo: Implante o Gov Hub na sua infraestrutura
descricao: Do que é a plataforma ao fork temático, para a equipe de TI que vai implantar o Gov Hub em outro órgão.
categoria: tecnica
status: em-breve
etapas: Entender=Entender a plataforma | Planejar=Planejar a adoção | Preparar=Preparar a infraestrutura | Implantar=Primeiro deploy | Conectar=Conectar a primeira fonte | Governar=Governança e acesso | Expandir=Fork temático
etapas_subtitulo: Sete etapas em sequência: do que é a plataforma ao fork temático
---
# Trilha de aprendizagem: Implante o Gov Hub na sua infraestrutura

> **Fonte única da trilha.** Edite **apenas este arquivo** e rode `python3 tools/gen_roadmap.py`. Ele regenera `docs/trilhas/adocao.json`, `docs/trilhas/adocao.md` e `docs/trilhas/adocao.xmind`. O formato dos itens é o mesmo de `trilhas/dashboards.md`.
>
> As aulas são cópias adaptadas da documentação técnica oficial; a origem está em `docs/plataforma/LEIA-ME.md`.

## Nível 1 · Entender a plataforma
Etapa: Entender · Ícone: light-bulb
O que o Gov Hub resolve e como as peças se encaixam: das fontes governamentais ao consumo analítico,
passando pelas camadas bronze, silver e gold.

- [explanation] **O que é o Gov Hub** — core — `docs/plataforma/index.md`
- [explanation] **Visão geral da arquitetura** — core — `docs/plataforma/arquitetura/visao-geral.md`
- [explanation] **Fluxo de dados** — core — `docs/plataforma/arquitetura/fluxo-de-dados.md`
- [explanation] **Arquitetura medallion** — core — `docs/plataforma/arquitetura/medallion.md`
- [reference] **Componentes** — support — `docs/plataforma/arquitetura/componentes.md`

## Nível 2 · Planejar a adoção
Etapa: Planejar · Ícone: clipboard-document-list
Antes de tocar no cluster: maturidade de dados do órgão, equipe, infraestrutura mínima e quais fontes
entram primeiro.

- [how-to] **Requisitos para adoção** — core — `docs/plataforma/adocao/requisitos.md`
- [reference] **Fontes de dados** — core — `docs/plataforma/arquitetura/fontes-de-dados.md`
- [reference] **Dicionário de dados** — support — `docs/plataforma/dados/dicionario.md`

## Nível 3 · Preparar a infraestrutura
Etapa: Preparar · Ícone: server
Os serviços que sustentam a plataforma e como as credenciais são guardadas. Consulte as referências
conforme a sua equipe for precisando delas.

- [reference] **Kubernetes** — support — `docs/plataforma/infraestrutura/kubernetes.md`
- [reference] **Argo CD GitOps** — support — `docs/plataforma/infraestrutura/argocd.md`
- [reference] **PostgreSQL** — support — `docs/plataforma/infraestrutura/postgres.md`
- [reference] **MinIO** — support — `docs/plataforma/infraestrutura/minio.md`
- [how-to] **Gerenciamento de secrets** — core — `docs/plataforma/infraestrutura/secrets.md`

## Nível 4 · Primeiro deploy
Etapa: Implantar · Ícone: deploy
O passo a passo do primeiro deploy no cluster do órgão, do Argo CD ao acesso pelos serviços.

- [tutorial] **Deploy inicial** — core — `docs/plataforma/adocao/deploy-inicial.md`

## Nível 5 · Conectar a primeira fonte
Etapa: Conectar · Ícone: database
Da fonte documentada ao dataset no Superset: DAG de ingestão, modelos dbt, testes e qualidade.

- [how-to] **Conectar fontes de dados** — core — `docs/plataforma/adocao/conectar-fontes.md`
- [reference] **Apache Airflow** — support — `docs/plataforma/pipeline/airflow.md`
- [reference] **dbt** — support — `docs/plataforma/pipeline/dbt.md`
- [explanation] **Qualidade de dados** — support — `docs/plataforma/pipeline/qualidade.md`

## Nível 6 · Governança e acesso
Etapa: Governar · Ícone: governance
Quem vê quais dados, como tratar dados sensíveis e credenciais, e onde fica o catálogo.

- [explanation] **Controle de acesso** — core — `docs/plataforma/governanca/acesso.md`
- [reference] **Segurança** — core — `docs/plataforma/governanca/seguranca.md`
- [reference] **OpenMetadata** — support — `docs/plataforma/governanca/openmetadata.md`
- [reference] **Trino + Ranger** — support — `docs/plataforma/governanca/trino-ranger.md`

## Nível 7 · Fork temático
Etapa: Expandir · Ícone: square-2-stack
Como isolar o contexto do seu órgão num fork do pipeline, com dois forks reais como exemplo.

- [explanation] **Forks temáticos** — core — `docs/plataforma/forks/index.md`
- [how-to] **Guia de criação de fork** — core — `docs/plataforma/forks/guia-criar-fork.md`
- [reference] **Fork Cidades** — support — `docs/plataforma/forks/cidades.md`
- [reference] **Fork MinC** — support — `docs/plataforma/forks/minc.md`
