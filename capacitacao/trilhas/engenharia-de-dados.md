---
slug: engenharia-de-dados
titulo: Engenharia de Dados no Gov Hub
descricao: Dos fundamentos, num cenário fictício, à contribuição de uma base nova ao projeto, com PostgreSQL, Python, Airflow e dbt.
categoria: tecnica
chamada: Um indicador confiável começa antes do gráfico. Se a área é nova para você, comece pelos fundamentos, num cenário fictício. Depois, entenda o Gov Hub, prepare o ambiente, aprenda a coletar, organizar e testar dados e, no fim, adicione uma base nova à aplicação.
etapas: Fundamentos=Pipeline num cenário fictício | Base=Conceitos e projeto | Ambiente=Preparação local | Dado=Modelagem e camadas | Pipeline=Ingestão, orquestração e transformação | Evolução=Contribuir com uma base nova
etapas_subtitulo: Seis etapas: dos fundamentos, fora do Gov Hub, à contribuição de uma base nova
etapas_nota: **Comece pelo nível 0 se a engenharia de dados é nova para você.** Ele é opcional e roda no navegador, sem o Gov Hub. A partir do nível 1, conclua o ambiente local antes de executar consultas e coletas. Use data-application-gov-hub; este site apresenta o material de estudo.
---
# Trilha de aprendizagem: Engenharia de Dados no Gov Hub

> **Fonte única da trilha.** Edite este arquivo e rode `python3 tools/gen_roadmap.py` em `capacitacao/` para atualizar o catálogo e os arquivos gerados.
>
> O público é de profissionais de TI com familiaridade com programação, terminal e Git. O nível 0, opcional, ensina o pipeline de ponta a ponta num cenário fictício, em notebooks, sem o Gov Hub. O nível 1 apresenta os conceitos e a aplicação; o nível 2 prepara o ambiente; os níveis seguintes desenvolvem SQL, pipeline e a contribuição de uma base nova. Consulte os itens de apoio quando precisar. As práticas usam ambiente local e dados públicos ou sintéticos.

## Nível 0 · Fundamentos: um pipeline de ponta a ponta
Etapa: Fundamentos · Ícone: beaker
Selo: iniciante
Construa, em notebooks e com dados fictícios de um sistema de bicicletas compartilhadas, um pipeline completo: coleta de uma API, gravação sem duplicar, camadas em SQL, testes e orquestração. Nada para instalar além do Python, e nada do Gov Hub ainda.

- [explanation] **O cenário: um sistema de bicicletas compartilhadas** — core — `docs/explicacao/engenharia-fundamentos-cenario.md`
- [how-to] **Preparar o Jupyter e olhar os dados** — core — `docs/guias/engenharia-fundamentos-jupyter.md`
- [tutorial] **Prática: coletar de uma API** — core — `docs/tutoriais/engenharia-fundamentos-coleta.md`
- [tutorial] **Prática: gravar sem duplicar** — core — `docs/tutoriais/engenharia-fundamentos-gravar.md`
- [tutorial] **Prática: transformar em camadas** — core — `docs/tutoriais/engenharia-fundamentos-camadas.md`
- [tutorial] **Prática: testar o dado** — core — `docs/tutoriais/engenharia-fundamentos-testes.md`
- [tutorial] **Prática: orquestrar o pipeline** — core — `docs/tutoriais/engenharia-fundamentos-orquestrar.md`
- [explanation] **Do notebook às ferramentas do Gov Hub** — core — `docs/explicacao/engenharia-fundamentos-ferramentas.md`

## Nível 1 · Base e conceitos
Etapa: Base · Ícone: light-bulb
Selo: essencial
Entenda o papel da engenharia de dados, o contexto do Gov Hub, ETL/ELT e a arquitetura macro da aplicação.

- [explanation] **Engenharia de dados: da fonte à decisão** — core — `docs/explicacao/engenharia-papel.md`
- [explanation] **O Gov Hub e sua aplicação de dados** — core — `docs/explicacao/engenharia-projeto-gov-hub.md`
- [explanation] **ELT e processamento em lote** — core — `docs/explicacao/engenharia-elt-lote.md`
- [reference] **Onde encontrar cada parte do projeto** — core — `docs/referencia/engenharia-mapa-repositorio.md`
- [reference] **Vocabulário e fontes do governo** — support — `docs/referencia/engenharia-glossario.md`

## Nível 2 · Preparação do ambiente local
Etapa: Ambiente · Ícone: server
Selo: essencial
Prepare e valide o ambiente da aplicação: requisitos, configuração, serviços, Airflow, acessos, prática dbt e rotina local.

- [reference] **Requisitos e versões do ambiente** — core — `docs/referencia/engenharia-requisitos-ambiente.md`
- [how-to] **Configuração local e credenciais** — core — `docs/guias/engenharia-configuracao-local.md`
- [tutorial] **Inicializar os serviços com make setup** — core — `docs/tutoriais/engenharia-ambiente.md`
- [how-to] **Validar o Airflow e suas integrações** — core — `docs/guias/engenharia-airflow-configuracao.md`
- [how-to] **Validar PostgreSQL e Superset** — core — `docs/guias/engenharia-acessos-locais.md`
- [how-to] **Executar o dbt e conferir os dados no banco** — core — `docs/guias/engenharia-dbt-configuracao.md`
- [how-to] **Rotina local e verificação final** — core — `docs/guias/engenharia-rotina-ambiente.md`

## Nível 3 · Modelagem e construção das camadas de dados
Etapa: Dado · Ícone: database
Selo: essencial
Construa, com uma base de estudo que imita os contratos do Gov Hub, uma tabela que responde quanto foi contratado e pago: população, especificação, camadas, granularidade, formas de entrega, regras reutilizáveis, histórico e validação.

- [tutorial] **Prática: SQL para decidir quem entra no resultado** — core — `docs/tutoriais/engenharia-sql.md`
- [tutorial] **Prática: SQL para contar e somar sem enganos** — core — `docs/tutoriais/engenharia-sql-medidas.md`
- [explanation] **Planejar a entrega antes dos modelos** — core — `docs/explicacao/engenharia-planejamento-modelos.md`
- [explanation] **Definir as responsabilidades de cada camada** — core — `docs/explicacao/engenharia-camadas.md`
- [explanation] **Granularidade: o que cada linha representa e o que pode ser somado** — core — `docs/explicacao/engenharia-granularidade.md`
- [explanation] **Tabela larga, estrela ou snowflake: escolher a forma da entrega** — core — `docs/explicacao/engenharia-arquiteturas-dados.md`
- [explanation] **Onde mora cada regra: modelos, macros e reutilização no dbt** — core — `docs/explicacao/engenharia-modelos-reutilizaveis.md`
- [explanation] **Posição atual e histórico: reconstrução, incremental e snapshot** — core — `docs/explicacao/engenharia-historico.md`
- [how-to] **Validar e entregar uma camada confiável** — core — `docs/guias/engenharia-entrega-camada.md`

## Nível 4 · Ingestão, orquestração e transformação
Etapa: Pipeline · Ícone: deploy
Selo: essencial
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
- [reference] **Fontes e clientes do repositório** — support — `docs/referencia/engenharia-fontes.md`
- [reference] **Comandos do dia a dia: Airflow, dbt e banco** — support — `docs/referencia/engenharia-comandos.md`

## Nível 5 · Adicionar uma base nova ao Gov Hub
Etapa: Evolução · Ícone: rectangle-group
Selo: avancado
Leve uma fonte nova da issue ao pull request, do cliente em Python à gold no dbt: avalie a fonte, escreva os testes antes do código, proteja o dado pessoal, confira o resultado e prepare a revisão. O exemplo são os contratos publicados no PNCP.

- [explanation] **O caminho de uma base nova, da issue ao painel** — core — `docs/explicacao/engenharia-base-nova.md`
- [how-to] **Avaliar a fonte e escrever a issue** — core — `docs/guias/engenharia-avaliar-fonte.md`
- [tutorial] **Prática: o cliente da fonte** — core — `docs/tutoriais/engenharia-base-nova-cliente.md`
- [tutorial] **Prática: a DAG de ingestão no padrão do repositório** — core — `docs/tutoriais/engenharia-base-nova-dag.md`
- [tutorial] **Prática: o domínio no dbt** — core — `docs/tutoriais/engenharia-base-nova-dominio.md`
- [tutorial] **Prática: a bronze** — core — `docs/tutoriais/engenharia-base-nova-bronze.md`
- [tutorial] **Prática: a silver, com privacidade e junção** — core — `docs/tutoriais/engenharia-base-nova-silver.md`
- [tutorial] **Prática: a gold e a conferência** — core — `docs/tutoriais/engenharia-base-nova-gold.md`
- [how-to] **Documentar a tabela e conferir o que o consumo enxerga** — core — `docs/guias/engenharia-metadados.md`
- [how-to] **Abrir o PR e passar pela revisão** — core — `docs/guias/engenharia-contribuicao.md`
- [reference] **Checklist: adicionar uma base nova** — support — `docs/referencia/engenharia-checklist-base-nova.md`
- [challenge] **Desafio: uma base nova de ponta a ponta** — capstone — `docs/desafios/engenharia-desafio.md`
