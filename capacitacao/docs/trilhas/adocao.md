# Implante o Gov Hub na sua infraestrutura

Do que é a plataforma ao fork temático, para a equipe de TI que vai implantar o Gov Hub em outro órgão.

> Versão visual, com progresso: **[mapa da trilha](../../mapa.html?trilha=adocao)**
> Gerado a partir de **[trilhas/adocao.md](../../trilhas/adocao.md)** por `tools/gen_roadmap.py` — não edite à mão.

---

### Nível 1 · Entender a plataforma
*O que o Gov Hub resolve e como as peças se encaixam: das fontes governamentais ao consumo analítico, passando pelas camadas bronze, silver e gold.*
- [O que é o Gov Hub](../plataforma/index.md) — *Explicação* · **Essencial**
- [Visão geral da arquitetura](../plataforma/arquitetura/visao-geral.md) — *Explicação* · **Essencial**
- [Fluxo de dados](../plataforma/arquitetura/fluxo-de-dados.md) — *Explicação* · **Essencial**
- [Arquitetura medallion](../plataforma/arquitetura/medallion.md) — *Explicação* · **Essencial**
- [Componentes](../plataforma/arquitetura/componentes.md) — *Referência* · Apoio

### Nível 2 · Planejar a adoção
*Antes de tocar no cluster: maturidade de dados do órgão, equipe, infraestrutura mínima e quais fontes entram primeiro.*
- [Requisitos para adoção](../plataforma/adocao/requisitos.md) — *Guia* · **Essencial**
- [Fontes de dados](../plataforma/arquitetura/fontes-de-dados.md) — *Referência* · **Essencial**
- [Dicionário de dados](../plataforma/dados/dicionario.md) — *Referência* · Apoio

### Nível 3 · Preparar a infraestrutura
*Os serviços que sustentam a plataforma e como as credenciais são guardadas. Consulte as referências conforme a sua equipe for precisando delas.*
- [Kubernetes](../plataforma/infraestrutura/kubernetes.md) — *Referência* · Apoio
- [Argo CD GitOps](../plataforma/infraestrutura/argocd.md) — *Referência* · Apoio
- [PostgreSQL](../plataforma/infraestrutura/postgres.md) — *Referência* · Apoio
- [MinIO](../plataforma/infraestrutura/minio.md) — *Referência* · Apoio
- [Gerenciamento de secrets](../plataforma/infraestrutura/secrets.md) — *Guia* · **Essencial**

### Nível 4 · Primeiro deploy
*O passo a passo do primeiro deploy no cluster do órgão, do Argo CD ao acesso pelos serviços.*
- [Deploy inicial](../plataforma/adocao/deploy-inicial.md) — *Tutorial* · **Essencial**

### Nível 5 · Conectar a primeira fonte
*Da fonte documentada ao dataset no Superset: DAG de ingestão, modelos dbt, testes e qualidade.*
- [Conectar fontes de dados](../plataforma/adocao/conectar-fontes.md) — *Guia* · **Essencial**
- [Apache Airflow](../plataforma/pipeline/airflow.md) — *Referência* · Apoio
- [dbt](../plataforma/pipeline/dbt.md) — *Referência* · Apoio
- [Qualidade de dados](../plataforma/pipeline/qualidade.md) — *Explicação* · Apoio

### Nível 6 · Governança e acesso
*Quem vê quais dados, como tratar dados sensíveis e credenciais, e onde fica o catálogo.*
- [Controle de acesso](../plataforma/governanca/acesso.md) — *Explicação* · **Essencial**
- [Segurança](../plataforma/governanca/seguranca.md) — *Referência* · **Essencial**
- [OpenMetadata](../plataforma/governanca/openmetadata.md) — *Referência* · Apoio
- [Trino + Ranger](../plataforma/governanca/trino-ranger.md) — *Referência* · Apoio

### Nível 7 · Fork temático
*Como isolar o contexto do seu órgão num fork do pipeline, com dois forks reais como exemplo.*
- [Forks temáticos](../plataforma/forks/index.md) — *Explicação* · **Essencial**
- [Guia de criação de fork](../plataforma/forks/guia-criar-fork.md) — *Guia* · **Essencial**
- [Fork Cidades](../plataforma/forks/cidades.md) — *Referência* · Apoio
- [Fork MinC](../plataforma/forks/minc.md) — *Referência* · Apoio

