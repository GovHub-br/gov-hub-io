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

## A mesma palavra pode ter dois sentidos

No PostgreSQL, **schema** é uma divisão do banco que reúne tabelas. Já o arquivo `schema.yml` do dbt descreve modelos, colunas e testes. O arquivo não é a própria divisão do banco.

“Cliente” também muda de sentido: nesta trilha, é um programa que conversa com uma fonte, não uma pessoa atendida. E “modelo” significa uma transformação de dados no dbt, não um modelo de inteligência artificial.

## Veja também

- [Preparar e conferir o ambiente local](../tutoriais/engenharia-ambiente.md)
- [ELT e processamento em lote](../explicacao/engenharia-elt-lote.md)
