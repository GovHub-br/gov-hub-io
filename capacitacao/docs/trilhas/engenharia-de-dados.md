# Engenharia de Dados no Gov Hub

Dos conceitos e da preparação do ambiente à entrega de um indicador confiável, com PostgreSQL, Python, Airflow e dbt.

> Versão visual, com progresso: **[mapa da trilha](../../mapa.html?trilha=engenharia-de-dados)**
> Gerado a partir de **[trilhas/engenharia-de-dados.md](../../trilhas/engenharia-de-dados.md)** por `tools/gen_roadmap.py` — não edite à mão.

---

### Nível 1 · Base e conceitos
*Entenda o papel da engenharia de dados, o contexto do Gov Hub, ETL/ELT e a arquitetura macro da aplicação.*
- [Engenharia de dados: da fonte à decisão](../explicacao/engenharia-papel.md) — *Explicação* · **Essencial**
- [O Gov Hub e sua aplicação de dados](../explicacao/engenharia-projeto-gov-hub.md) — *Explicação* · **Essencial**
- [ELT e processamento em lote](../explicacao/engenharia-elt-lote.md) — *Explicação* · **Essencial**
- [Onde encontrar cada parte do projeto](../referencia/engenharia-mapa-repositorio.md) — *Referência* · **Essencial**
- [Vocabulário e fontes do governo](../referencia/engenharia-glossario.md) — *Referência* · Apoio

### Nível 2 · Preparação do ambiente local
*Prepare e valide o ambiente da aplicação: requisitos, configuração, serviços, Airflow, acessos, prática dbt e rotina local.*
- [Requisitos e versões do ambiente](../referencia/engenharia-requisitos-ambiente.md) — *Referência* · **Essencial**
- [Configuração local e credenciais](../guias/engenharia-configuracao-local.md) — *Guia* · **Essencial**
- [Inicializar os serviços com make setup](../tutoriais/engenharia-ambiente.md) — *Tutorial* · **Essencial**
- [Validar o Airflow e suas integrações](../guias/engenharia-airflow-configuracao.md) — *Guia* · **Essencial**
- [Validar PostgreSQL e Superset](../guias/engenharia-acessos-locais.md) — *Guia* · **Essencial**
- [Executar o dbt e conferir os dados no banco](../guias/engenharia-dbt-configuracao.md) — *Guia* · **Essencial**
- [Rotina local e verificação final](../guias/engenharia-rotina-ambiente.md) — *Guia* · **Essencial**

### Nível 3 · SQL e modelagem
*Consulte e organize os dados: tipos, chaves, granularidade e responsabilidades de raw, bronze, silver e gold.*
- [Consultar e conferir dados com SQL](../tutoriais/engenharia-sql.md) — *Tutorial* · **Essencial**
- [JOINs e funções de janela sem duplicar totais](../explicacao/engenharia-joins.md) — *Explicação* · **Essencial**
- [Tipos, chaves e gravação consistente](../referencia/engenharia-tipos-chaves.md) — *Referência* · **Essencial**
- [Investigar consultas lentas no PostgreSQL](../guias/engenharia-desempenho.md) — *Guia* · Apoio
- [Raw, bronze, silver e gold](../explicacao/engenharia-camadas.md) — *Explicação* · **Essencial**
- [Granularidade, fatos e dimensões](../explicacao/engenharia-granularidade.md) — *Explicação* · **Essencial**
- [Quando sobrescrever e quando guardar histórico](../explicacao/engenharia-historico.md) — *Explicação* · Apoio

### Nível 4 · Ingestão, orquestração e transformação
*Implemente e opere o percurso da fonte à gold: cargas repetíveis, clientes Python, Airflow, reprocessamento, dbt e Cosmos.*
- [Clientes Python: uma responsabilidade por fonte](../explicacao/engenharia-clientes.md) — *Explicação* · **Essencial**
- [REST, SOAP, e-mail, bancos e arquivos](../referencia/engenharia-fontes.md) — *Referência* · Apoio
- [Paginação, tempo limite e falha visível](../guias/engenharia-resiliencia.md) — *Guia* · **Essencial**
- [Cargas completas, incrementais e idempotência](../explicacao/engenharia-idempotencia.md) — *Explicação* · **Essencial**
- [Prática: do cliente mínimo à camada raw](../tutoriais/engenharia-cliente-pratica.md) — *Tutorial* · **Essencial**
- [DAGs, tarefas e configuração no Airflow](../referencia/engenharia-airflow.md) — *Referência* · **Essencial**
- [Prática: executar e investigar uma DAG](../tutoriais/engenharia-airflow-pratica.md) — *Tutorial* · **Essencial**
- [Reprocessamento e mudanças na fonte](../guias/engenharia-reprocessamento.md) — *Guia* · **Essencial**
- [Modelos dbt: source, ref e materializações](../referencia/engenharia-dbt.md) — *Referência* · **Essencial**
- [Prática: schema e testes antes do SQL](../tutoriais/engenharia-dbt-pratica.md) — *Tutorial* · **Essencial**
- [Como o Cosmos leva o dbt ao Airflow](../explicacao/engenharia-cosmos.md) — *Explicação* · **Essencial**
- [Prática: rastrear uma transformação até a gold](../guias/engenharia-cadeia-pratica.md) — *Guia* · **Essencial**

### Nível 5 · Qualidade, governança e entrega
*Valide o resultado, documente sua origem, controle o acesso e entregue um indicador conferido no Superset.*
- [Qualidade: o que precisa ser verdadeiro no dado](../referencia/engenharia-qualidade.md) — *Referência* · **Essencial**
- [Prática: provocar e diagnosticar uma falha de qualidade](../tutoriais/engenharia-falha-qualidade.md) — *Tutorial* · **Essencial**
- [Logs, reconciliação e atualização](../guias/engenharia-observabilidade.md) — *Guia* · **Essencial**
- [Dados pessoais, segredos e menor privilégio](../explicacao/engenharia-acesso.md) — *Explicação* · **Essencial**
- [Documentar colunas e seguir a linhagem](../guias/engenharia-metadados.md) — *Guia* · **Essencial**
- [PostgreSQL, formatos e o papel do MinIO](../referencia/engenharia-formatos.md) — *Referência* · Apoio
- [Prática: da gold ao gráfico no Superset](../tutoriais/engenharia-consumo.md) — *Tutorial* · **Essencial**
- [Contribuir com uma mudança revisável](../guias/engenharia-contribuicao.md) — *Guia* · **Essencial**
- [Desafio: uma fonte até um indicador confiável](../desafios/engenharia-desafio.md) — *Desafio* · **Capstone**

