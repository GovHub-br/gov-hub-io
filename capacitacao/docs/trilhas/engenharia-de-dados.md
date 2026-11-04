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

