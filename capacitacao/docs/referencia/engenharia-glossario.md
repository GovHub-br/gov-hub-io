# Vocabulário e fontes do governo

> Tipo: **Referência**

## Escopo da referência

Vocabulário de engenharia de dados e siglas dos sistemas governamentais utilizados pela aplicação. Consulte as definições junto dos contratos das fontes e da documentação dos modelos.

## Termos usados na trilha

| Termo | Significado no projeto |
|---|---|
| Pipeline | Caminho automatizado da origem ao consumo |
| DAG | Conjunto de tarefas e dependências no Airflow |
| ELT | Extrair, carregar e depois transformar no banco |
| Schema | Agrupamento de tabelas dentro do PostgreSQL |
| Modelo dbt | Arquivo SQL que produz tabela ou visão |
| Upsert | Inserir uma linha nova ou atualizar a existente |
| Idempotência | Repetir a mesma entrada sem duplicar o resultado |
| Linhagem | Relação entre fontes, transformações e resultados |
| Granularidade | O que uma linha de uma tabela representa |
| Raw, bronze, silver e gold | Etapas de preservação, preparação, integração e consumo dos dados |
| Cosmos | Integração dos recursos dbt à execução coordenada pelo Airflow |

## Fontes e siglas

| Nome | O que representa |
|---|---|
| SIAFI | Sistema Integrado de Administração Financeira do Governo Federal |
| SIAPE | Sistema Integrado de Administração de Pessoal |
| SIORG | Sistema de Organização e Inovação Institucional do Governo Federal |
| PNCP | Portal Nacional de Contratações Públicas |
| TransfereGov | Plataforma de transferências da União |
| ComprasGov | Plataforma de compras e contratos |
| UG | Unidade Gestora |
| NE | Nota de Empenho |
| NC | Nota de Crédito |
| PF | Programação Financeira |
| TED | Termo de Execução Descentralizada |

## Exemplo: interpretar a identificação de um registro

Uma nota de empenho pode exigir a combinação de unidade gestora, exercício e número para ser identificada. O número da NE, isoladamente, pode se repetir em órgãos ou anos diferentes.

| Elemento | Papel na interpretação |
|---|---|
| SIAFI | Sistema de origem da informação financeira |
| UG | Unidade gestora à qual o registro pertence |
| NE | Nota de empenho, cujo identificador precisa ser interpretado no contexto da fonte |
| Exercício | Recorte temporal que pode participar da chave e das agregações |

A composição exata da chave deve seguir o contrato da fonte. Preservar esse contexto evita sobrescritas na ingestão e junções indevidas entre registros de universos diferentes.

## Atenção ao contexto

Uma sigla sozinha não define a chave de uma tabela. Identificadores podem depender também do órgão, exercício e sistema. Consulte o contrato da fonte antes de cruzar dados.

## Convenções do projeto

No PostgreSQL, `schema` agrupa tabelas. No dbt, `schema.yml` descreve modelos, colunas e testes. A distinção importa ao configurar e documentar as transformações.

No código de ingestão, os clientes implementam o contrato de acesso às fontes; no dbt, os modelos implementam transformações analíticas. Os caminhos macro desses componentes estão na aula de arquitetura.

## Veja também

- [Onde encontrar cada parte do projeto](engenharia-mapa-repositorio.md)
- [Requisitos e versões do ambiente](engenharia-requisitos-ambiente.md)
