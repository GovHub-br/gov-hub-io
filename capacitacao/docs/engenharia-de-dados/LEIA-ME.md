# Trilha de Engenharia de Dados no Gov Hub

## Público e percurso

Profissionais de TI com familiaridade com programação, terminal e Git. A trilha aborda engenharia de dados aplicada ao Gov Hub, com exemplos e práticas locais. O repositório `data-application-gov-hub` é o ambiente de execução; `gov-hub-io` apresenta as aulas.

| Nível | Foco | Aulas |
|---|---|---|
| 1 — Base e conceitos | Engenharia de dados, projeto, ETL/ELT, arquitetura macro e glossário | 5 |
| 2 — Preparação do ambiente local | Requisitos, configuração, inicialização, Airflow, acessos, prática dbt e rotina | 7 |
| 3 — Modelagem e construção das camadas de dados | Uma base de estudo de contratos, do SQL à entrega: população, especificação, camadas, granularidade, formas de entrega, regras no dbt, histórico e validação | 9 |
| 4 — Ingestão, orquestração e transformação | Coleta em Python, gravação em bancos, cargas repetíveis, Airflow, reprocessamento, dbt e contribuição | 12 |
| 5 — Qualidade, governança e entrega | Testes, observabilidade, acesso, metadados, consumo e desafio | 9 |

O nível 1 é conceitual; conclua a preparação do nível 2 antes de executar as práticas. Cargas e reprocessamento ficam junto da implementação e da operação no nível 4. Os exemplos usam dados sintéticos ou públicos e não exigem fontes protegidas nem publicação em produção.

## Referências de preparação

O novo nível articula os guias de [instalação](https://gov-hub.io/documentacao/instalacao/), [onboarding](https://gov-hub.io/documentacao/onboarding/roteiro/), [Airflow](https://gov-hub.io/documentacao/pipeline/airflow/), [dbt](https://gov-hub.io/documentacao/pipeline/dbt/) e [acessos](https://gov-hub.io/documentacao/visualizacao/superset/) com os arquivos executáveis da aplicação.

O fluxo de comandos usa o Makefile com Poetry. O README e outras revisões podem mencionar uv ou alvos diferentes; antes de adaptar, confira o Makefile, o Compose e os perfis do checkout. Componentes de infraestrutura compartilhada não são pré-requisitos implícitos da instalação local. O perfil dbt e a conexão Airflow são configurações distintas e precisam apontar para o destino autorizado de estudo.

## Edição e pré-visualização

Edite a sequência em `trilhas/engenharia-de-dados.md` e execute `python3 tools/gen_roadmap.py` em `capacitacao/`. Não edite os arquivos de `docs/trilhas/` manualmente. As chaves de progresso das aulas existentes são mantidas ao mudar de nível.

Com o servidor em `capacitacao/`, abra `http://localhost:8000/mapa.html?trilha=engenharia-de-dados`. A renumeração e o catálogo vêm dos arquivos gerados. A revisão tem uma pergunta por aula.
