# Engenharia de Dados no Gov Hub

Dos conceitos e da preparação do ambiente à contribuição de uma base nova ao projeto, com PostgreSQL, Python, Airflow e dbt.

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

### Nível 3 · Modelagem e construção das camadas de dados
*Construa, com uma base de estudo que imita os contratos do Gov Hub, uma tabela que responde quanto foi contratado e pago: população, especificação, camadas, granularidade, formas de entrega, regras reutilizáveis, histórico e validação.*
- [Prática: SQL para decidir quem entra no resultado](../tutoriais/engenharia-sql.md) — *Tutorial* · **Essencial**
- [Prática: SQL para contar e somar sem enganos](../tutoriais/engenharia-sql-medidas.md) — *Tutorial* · **Essencial**
- [Planejar a entrega antes dos modelos](../explicacao/engenharia-planejamento-modelos.md) — *Explicação* · **Essencial**
- [Definir as responsabilidades de cada camada](../explicacao/engenharia-camadas.md) — *Explicação* · **Essencial**
- [Granularidade: o que cada linha representa e o que pode ser somado](../explicacao/engenharia-granularidade.md) — *Explicação* · **Essencial**
- [Tabela larga, estrela ou snowflake: escolher a forma da entrega](../explicacao/engenharia-arquiteturas-dados.md) — *Explicação* · **Essencial**
- [Onde mora cada regra: modelos, macros e reutilização no dbt](../explicacao/engenharia-modelos-reutilizaveis.md) — *Explicação* · **Essencial**
- [Posição atual e histórico: reconstrução, incremental e snapshot](../explicacao/engenharia-historico.md) — *Explicação* · **Essencial**
- [Validar e entregar uma camada confiável](../guias/engenharia-entrega-camada.md) — *Guia* · **Essencial**

### Nível 4 · Ingestão, orquestração e transformação
*Entenda os três trabalhos de um pipeline e faça cada um com dados reais do PNCP: coleta em Python, gravação no banco sem duplicar, DAG no Airflow, reprocessamento e modelos dbt até a gold.*
- [Ingestão: trazer o dado da fonte para o banco](../explicacao/engenharia-ingestao.md) — *Explicação* · **Essencial**
- [Orquestração: quem roda o quê, quando e em que ordem](../explicacao/engenharia-orquestracao.md) — *Explicação* · **Essencial**
- [Transformação: da raw à gold com SQL versionado](../explicacao/engenharia-transformacao.md) — *Explicação* · **Essencial**
- [Cargas completas, incrementais e idempotência](../explicacao/engenharia-idempotencia.md) — *Explicação* · **Essencial**
- [Prática: coletar dados de uma API com Python](../tutoriais/engenharia-coleta-python.md) — *Tutorial* · **Essencial**
- [Prática: gravar a coleta em bancos de dados](../tutoriais/engenharia-ingestao-bancos.md) — *Tutorial* · **Essencial**
- [Prática: orquestrar a coleta com o Airflow](../tutoriais/engenharia-airflow-dag.md) — *Tutorial* · **Essencial**
- [Reprocessamento e mudanças na fonte](../guias/engenharia-reprocessamento.md) — *Guia* · **Essencial**
- [Prática: transformar com dbt, da raw à gold](../tutoriais/engenharia-dbt-camadas.md) — *Tutorial* · **Essencial**
- [Fontes e clientes do repositório](../referencia/engenharia-fontes.md) — *Referência* · Apoio
- [Comandos do dia a dia: Airflow, dbt e banco](../referencia/engenharia-comandos.md) — *Referência* · Apoio

### Nível 5 · Adicionar uma base nova ao Gov Hub
*Leve uma fonte nova da issue ao pull request, do cliente em Python à gold no dbt: avalie a fonte, escreva os testes antes do código, proteja o dado pessoal, confira o resultado e prepare a revisão. O exemplo são os contratos publicados no PNCP.*
- [O caminho de uma base nova, da issue ao painel](../explicacao/engenharia-base-nova.md) — *Explicação* · **Essencial**
- [Avaliar a fonte e escrever a issue](../guias/engenharia-avaliar-fonte.md) — *Guia* · **Essencial**
- [Prática: o cliente da fonte](../tutoriais/engenharia-base-nova-cliente.md) — *Tutorial* · **Essencial**
- [Prática: a DAG de ingestão no padrão do repositório](../tutoriais/engenharia-base-nova-dag.md) — *Tutorial* · **Essencial**
- [Prática: o domínio no dbt](../tutoriais/engenharia-base-nova-dominio.md) — *Tutorial* · **Essencial**
- [Prática: a bronze](../tutoriais/engenharia-base-nova-bronze.md) — *Tutorial* · **Essencial**
- [Prática: a silver, com privacidade e junção](../tutoriais/engenharia-base-nova-silver.md) — *Tutorial* · **Essencial**
- [Prática: a gold e a conferência](../tutoriais/engenharia-base-nova-gold.md) — *Tutorial* · **Essencial**
- [Documentar a tabela e conferir o que o consumo enxerga](../guias/engenharia-metadados.md) — *Guia* · **Essencial**
- [Abrir o PR e passar pela revisão](../guias/engenharia-contribuicao.md) — *Guia* · **Essencial**
- [Checklist: adicionar uma base nova](../referencia/engenharia-checklist-base-nova.md) — *Referência* · Apoio
- [Desafio: uma base nova de ponta a ponta](../desafios/engenharia-desafio.md) — *Desafio* · **Capstone**

