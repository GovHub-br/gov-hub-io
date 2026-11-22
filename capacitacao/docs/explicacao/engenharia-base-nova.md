# O caminho de uma base nova, da issue ao painel

> Tipo: **Explicação**

## De usar o projeto a fazê-lo crescer

Nos níveis anteriores, você aprendeu a ler, rodar e conferir o que já existe na aplicação. Este nível pede outra coisa: acrescentar uma base que ainda não existe, de um jeito que outra pessoa consiga revisar, aceitar e manter.

Uma base nova não é um arquivo. São cerca de quinze arquivos em cinco lugares do repositório, escritos numa ordem que permite testar cada parte antes da seguinte. Esta aula mostra o mapa inteiro. As aulas seguintes percorrem cada trecho com um exemplo real, do começo ao fim.

## O que você vai aprender

- Quais peças uma base nova acrescenta e onde cada uma mora.
- Em que ordem escrevê-las e por quê.
- O que acontece depois que o pull request é aceito.
- Como o exemplo deste nível se encaixa no que já existe.

## O exemplo do nível: contratos do Ipea publicados no PNCP

Desde a Lei 14.133/2021, os órgãos publicam suas contratações e seus contratos no Portal Nacional de Contratações Públicas (PNCP). A aplicação já coleta as **contratações** (as compras) do PNCP, com a DAG `pncp_publicacoes_dag`, mas não coleta os **contratos** que resultam delas, e nenhum modelo dbt usa as tabelas do schema `pncp`.

A pergunta que guia o nível é:

> Quanto o Ipea contratou em cada mês, separando contratos de empenhos?

No primeiro semestre de 2026, o Ipea publicou 30 instrumentos no PNCP: 13 contratos e 17 empenhos usados no lugar de contrato. Ao fim do nível, essa pergunta terá uma tabela gold testada, documentada e pronta para o Superset, e você terá a descrição de um pull request pronto para revisão.

## O mapa

![O caminho de uma base nova no repositório, em oito etapas e cinco lugares. A issue registra a pergunta e a avaliação da fonte. O cliente em plugins/cliente_pncp.py ganha um teste para as falhas em tests/test_plugins/. A DAG em dags/data_ingest/pncp/ grava a raw pncp.contratos e também tem teste. No dbt, a fonte é declarada no sources.yml, o domínio no dbt_project.yml, e a bronze, a silver e a gold ficam em models/pncp_dbt/, com schema.yml e testes singulares em tests/pncp/. A documentação e a conferência de acesso fecham a entrega, e o pull request reúne tudo para revisão.](../../assets/diagramas/engenharia-base-nova-mapa.png)

| Etapa | O que produz | Onde mora | Aula |
|---|---|---|---|
| 1. Avaliar a fonte | A issue, com a especificação | GitHub | [Avaliar a fonte e escrever a issue](../guias/engenharia-avaliar-fonte.md) |
| 2. Cliente | Um método que fala com a API, e um teste para as falhas | `plugins/`, `tests/test_plugins/` | [O cliente da fonte](../tutoriais/engenharia-base-nova-cliente.md) |
| 3. Ingestão | A DAG que grava a raw, e o teste dela | `dags/data_ingest/pncp/`, `tests/dags/` | [A DAG de ingestão](../tutoriais/engenharia-base-nova-dag.md) |
| 4. Domínio e bronze | Fonte declarada, bloco do domínio, bronze | `models/sources.yml`, `dbt_project.yml`, `models/pncp_dbt/bronze/` | [O domínio no dbt](../tutoriais/engenharia-base-nova-dominio.md) e [a bronze](../tutoriais/engenharia-base-nova-bronze.md) |
| 5. Silver | Uma linha por contrato, sem dado pessoal | `models/pncp_dbt/silver/` | [A silver, com privacidade e junção](../tutoriais/engenharia-base-nova-silver.md) |
| 6. Gold | A tabela que responde à pergunta, conferida | `models/pncp_dbt/gold/`, `tests/pncp/` | [A gold e a conferência](../tutoriais/engenharia-base-nova-gold.md) |
| 7. Documentação | Descrições, linhagem e acesso conferidos | `schema.yml` de cada camada | [Documentar e conferir o consumo](../guias/engenharia-metadados.md) |
| 8. Pull request | A mudança pronta para revisão | GitHub | [Abrir o PR e passar pela revisão](../guias/engenharia-contribuicao.md) |

`plugins/` e `dags/` ficam em `airflow_lappis/`. `models/`, `tests/pncp/` e o `dbt_project.yml` ficam no projeto dbt, `airflow_lappis/dags/dbt/ipea/`. `tests/test_plugins/` e `tests/dags/` ficam na raiz do repositório.

## Por que nesta ordem

Cada etapa só pode ser conferida se a anterior estiver pronta: a DAG precisa do cliente, a bronze precisa da raw que a DAG grava, a gold precisa da silver. Por isso o trabalho segue o caminho do dado.

Dentro de cada etapa, decida o comportamento antes de escrever: o que o cliente devolve quando não há contratos? Quantas linhas a silver deve ter? A avaliação da fonte responde a primeira: a API devolve `204`, sem corpo, quando não há registros, e o cliente trata isso como período vazio. No dbt, as respostas viram o `schema.yml`, escrito antes do SQL; no cliente, viram um teste para as falhas, a decisão que ninguém notaria se fosse desfeita.

## O que acontece depois do merge

O pull request aceito não é o fim do caminho. Vale saber o que roda sozinho e o que alguém precisa fazer:

| O que acontece | Quem faz | O que você precisa garantir |
|---|---|---|
| Lint e testes rodam no GitHub Actions | `.github/workflows/main.yaml` | Rodá-los antes: o lint do CI usa `\|\| true` e nunca reprova o PR |
| A documentação do dbt é publicada no GitHub Pages | Mesmo workflow, na `main`, quando os segredos da VPN estão configurados | Descrições no `schema.yml` |
| Os modelos novos entram na execução diária do dbt, à 01:00 | `ipea_cosmos_dag`, pelo Cosmos | Nada: o Cosmos lê o projeto e cria as tarefas |
| A DAG nova passa a rodar no horário configurado | `get_dynamic_schedule` | Pedir o horário na Variable `dynamic_schedules`, ou aceitar o padrão diário |
| A DAG lê o CNPJ do órgão na configuração | Variable `airflow_variables` | Avisar no PR qual chave a DAG usa (`orgao_pncp`) |

A última linha é a que mais se esquece. Uma DAG que depende de configuração funciona na sua máquina e falha em produção se ninguém souber que precisa dela.

## Erros comuns

- **Começar pelo dbt.** Sem a raw gravada pela DAG, a bronze não tem o que ler, e as decisões de tipo são feitas no escuro.
- **Juntar mudanças sem relação.** Atualizar dependências, corrigir uma macro e criar uma base no mesmo PR mistura riscos diferentes numa única aprovação.
- **Esquecer a configuração.** Variables, horários e roles que a base exige precisam estar escritos no PR, não só no seu ambiente.

## Confira o que entendeu

1. A bronze do novo domínio está pronta, mas a DAG ainda não rodou no seu ambiente. Dá para testar a bronze?
2. Sua DAG nova lê o CNPJ do órgão da Variable `airflow_variables` e funciona na sua máquina. Por que isso precisa estar escrito na descrição do PR?

## Respostas comentadas

1. Não de verdade. A bronze lê a raw `pncp.contratos`; sem ela, o `dbt build` falha com relação inexistente. Mesmo que alguém criasse a tabela à mão, os tipos e as esquisitices seriam inventados, e não os da fonte. A ordem do caminho existe por isso.
2. Porque a configuração mora no Airflow, fora do repositório, e o revisor não a vê no diff. Se a chave `orgao_pncp` não existir em produção, a DAG falha na primeira execução, e só quem escreveu a DAG sabia que ela era necessária. Dizer no PR qual chave a DAG lê, e com que formato, transforma uma falha em produção numa tarefa de configuração feita antes do merge.

## Veja também

- [Avaliar a fonte e escrever a issue](../guias/engenharia-avaliar-fonte.md)
- [Onde encontrar cada parte do projeto](../referencia/engenharia-mapa-repositorio.md)
- [Fontes e clientes do repositório](../referencia/engenharia-fontes.md)
