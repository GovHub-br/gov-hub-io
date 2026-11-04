# Vocabulário e fontes do governo

> Tipo: **Referência**

## Como usar esta página

Esta é uma página de consulta. Não é necessário decorar as siglas: volte aqui quando uma palavra impedir a compreensão de uma aula. Primeiro entenda o papel do elemento e depois associe o nome técnico a ele.

## Palavras que aparecem antes do primeiro código

| Palavra | Significado e exemplo |
|---|---|
| Código | Instruções escritas para um programa executar |
| Terminal | Aplicativo em que você digita comandos |
| Arquivo / pasta | Um conteúdo salvo / um agrupamento de arquivos |
| Tabela | Registros organizados em linhas e colunas |
| Registro / campo | Uma linha / uma característica dessa linha |
| Banco de dados | Sistema que guarda e permite consultar dados |
| Consulta | Pedido ao banco para selecionar ou calcular informações |
| Configuração | Valores que definem como o programa deve funcionar |
| Biblioteca | Código reutilizável instalado para o projeto |
| Ambiente | Programas e configurações usados para executar a aplicação |

Uma **fonte** é de onde o registro vem. Um **destino** é onde ele será guardado. **Consumir** dados significa utilizá-los em consultas, análises ou painéis, sem necessariamente alterá-los.

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
| PR | Pedido de incorporação de uma alteração, sujeito a revisão |

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

## Exemplo: traduzindo uma frase da equipe

“A DAG carregou a fonte no schema, o modelo gold foi atualizado e o PR aguarda revisão.” Vamos separar essa frase:

| Expressão | O que aconteceu |
|---|---|
| A DAG carregou a fonte | A rotina coordenou a coleta e a gravação dos registros |
| No schema | As tabelas foram organizadas em uma divisão do banco |
| O modelo gold foi atualizado | A transformação refez ou atualizou a saída para análise |
| O PR aguarda revisão | A alteração de código foi apresentada para outra pessoa avaliar |

São acontecimentos relacionados, mas distintos. Atualizar os registros no banco não cria um PR; abrir um PR não executa automaticamente uma carga no seu computador. Aprender a separar esses verbos ajuda a entender o que alguém está pedindo para você fazer.

## Atenção ao contexto

Uma sigla sozinha não define a chave de uma tabela. Identificadores podem depender também do órgão, exercício e sistema. Consulte o contrato da fonte antes de cruzar dados.

## A mesma palavra pode ter dois sentidos

No PostgreSQL, **schema** é uma divisão do banco que reúne tabelas. Já o arquivo `schema.yml` do dbt descreve modelos, colunas e testes. O arquivo não é a própria divisão do banco.

“Cliente” também muda de sentido: nesta trilha, é um programa que conversa com uma fonte, não uma pessoa atendida. E “modelo” significa uma transformação de dados no dbt, não um modelo de inteligência artificial.

## Veja também

- [Preparar e conferir o ambiente local](../tutoriais/engenharia-ambiente.md)
- [ELT e processamento em lote](../explicacao/engenharia-elt-lote.md)
