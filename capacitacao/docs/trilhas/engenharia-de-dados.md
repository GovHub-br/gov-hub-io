# Engenharia de Dados no Gov Hub

Da preparação do ambiente à entrega de um indicador confiável, com PostgreSQL, Python, Airflow e dbt.

> Versão visual, com progresso: **[mapa da trilha](../../mapa.html?trilha=engenharia-de-dados)**
> Gerado a partir de **[trilhas/engenharia-de-dados.md](../../trilhas/engenharia-de-dados.md)** por `tools/gen_roadmap.py` — não edite à mão.

---

### Nível 1 · Base e conceitos
*Entenda o caminho do dado, prepare o ambiente e aprenda a repetir uma carga sem duplicar resultados.*
- [Engenharia de dados: da fonte à decisão](../explicacao/engenharia-papel.md) — *Explicação* · **Essencial**
- [Onde encontrar cada parte do projeto](../referencia/engenharia-mapa-repositorio.md) — *Referência* · Apoio
- [Preparar e conferir o ambiente local](../tutoriais/engenharia-ambiente.md) — *Tutorial* · **Essencial**
- [Vocabulário e fontes do governo](../referencia/engenharia-glossario.md) — *Referência* · Apoio
- [ELT e processamento em lote](../explicacao/engenharia-elt-lote.md) — *Explicação* · **Essencial**
- [Cargas completas, incrementais e idempotência](../explicacao/engenharia-idempotencia.md) — *Explicação* · **Essencial**
- [Reprocessamento e mudanças na fonte](../guias/engenharia-reprocessamento.md) — *Guia* · **Essencial**

### Nível 2 · SQL e modelagem
*Consulte e organize os dados: tipos, chaves, granularidade e responsabilidades de raw, bronze, silver e gold.*
- [Consultar e conferir dados com SQL](../tutoriais/engenharia-sql.md) — *Tutorial* · **Essencial**
- [JOINs e funções de janela sem duplicar totais](../explicacao/engenharia-joins.md) — *Explicação* · **Essencial**
- [Tipos, chaves e gravação consistente](../referencia/engenharia-tipos-chaves.md) — *Referência* · **Essencial**
- [Investigar consultas lentas no PostgreSQL](../guias/engenharia-desempenho.md) — *Guia* · Apoio
- [Raw, bronze, silver e gold](../explicacao/engenharia-camadas.md) — *Explicação* · **Essencial**
- [Granularidade, fatos e dimensões](../explicacao/engenharia-granularidade.md) — *Explicação* · **Essencial**
- [Quando sobrescrever e quando guardar histórico](../explicacao/engenharia-historico.md) — *Explicação* · Apoio

### Nível 3 · Ingestão, orquestração e transformação
*Acompanhe uma fonte do cliente Python à transformação dbt, com Airflow, Cosmos e práticas locais guiadas.*
- [Clientes Python: uma responsabilidade por fonte](../explicacao/engenharia-clientes.md) — *Explicação* · **Essencial**
- [REST, SOAP, e-mail, bancos e arquivos](../referencia/engenharia-fontes.md) — *Referência* · Apoio
- [Paginação, tempo limite e falha visível](../guias/engenharia-resiliencia.md) — *Guia* · **Essencial**
- [Prática: do cliente mínimo à camada raw](../tutoriais/engenharia-cliente-pratica.md) — *Tutorial* · **Essencial**
- [DAGs, tarefas e configuração no Airflow](../referencia/engenharia-airflow.md) — *Referência* · **Essencial**
- [Prática: executar e investigar uma DAG](../tutoriais/engenharia-airflow-pratica.md) — *Tutorial* · **Essencial**
- [Modelos dbt: source, ref e materializações](../referencia/engenharia-dbt.md) — *Referência* · **Essencial**
- [Prática: schema e testes antes do SQL](../tutoriais/engenharia-dbt-pratica.md) — *Tutorial* · **Essencial**
- [Como o Cosmos leva o dbt ao Airflow](../explicacao/engenharia-cosmos.md) — *Explicação* · **Essencial**
- [Prática: rastrear uma transformação até a gold](../guias/engenharia-cadeia-pratica.md) — *Guia* · **Essencial**

### Nível 4 · Qualidade, governança e entrega
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

