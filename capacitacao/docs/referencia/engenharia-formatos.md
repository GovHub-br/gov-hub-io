# PostgreSQL, formatos e o papel do MinIO

> Tipo: **Referência**

## Banco de dados e arquivo têm papéis diferentes

Um arquivo guarda um conteúdo em um formato, como uma planilha ou CSV. Um banco de dados organiza conjuntos de registros e oferece mecanismos para consultar, atualizar e controlar o acesso. Os dois podem participar de um mesmo processo.

**Armazenamento de objetos** guarda arquivos como objetos identificados por nomes. Um **bucket** é um agrupamento desses objetos. S3 é uma interface de acesso a esse tipo de armazenamento; ser compatível com S3 significa aceitar operações nesse padrão, não estar necessariamente hospedado na Amazon.

O MinIO oferece esse tipo de armazenamento. Ele pode receber um arquivo antes que os registros sejam carregados no PostgreSQL. O papel de cada componente deve estar definido para que uma cópia recebida não seja confundida com a tabela já preparada para análise.

## Onde o dado fica

O **PostgreSQL é o armazenamento principal**: recebe a coleta, executa as transformações e atende às consultas.

Uma **landing zone** é uma área para receber arquivos antes de carregá-los no banco. O MinIO é apresentado como opção de armazenamento de objetos compatível com S3, organizada em buckets.

## O que está implantado e o que é preparatório

A configuração inclui variáveis `MINIO_*`, mas o Compose não possui um serviço MinIO e a ingestão ainda não usa esse armazenamento. O componente é **preparatório**: sua adoção exige definir como os arquivos chegam, são preservados e seguem para o banco.

| Formato | Característica | Uso comum |
|---|---|---|
| CSV | Texto tabular simples; tipos não ficam definidos no arquivo | Troca e inspeção de tabelas pequenas |
| JSON | Representa objetos, listas e estruturas aninhadas | Respostas de APIs e registros estruturados |
| Parquet | Colunar, com tipos e compressão | Leitura analítica de arquivos maiores |

## Exemplo: guardar e ler são decisões diferentes

Um objeto de estudo pode ter bucket `formacao` e nome `contratos/2026-01.csv`. O nome ajuda a encontrá-lo; o conteúdo ainda precisa ser lido e validado antes de virar uma tabela de consumo.

| Representação | Como reconhecer o mesmo registro |
|---|---|
| CSV | Linha `10,A,100` sob o cabeçalho `id,orgao,valor` |
| JSON | Objeto com `id` 10, `orgao` A e `valor` 100 |
| Parquet | Uma linha com essas colunas, interpretada por ferramenta compatível |
| Tabela PostgreSQL | Registro que pode ser selecionado por uma consulta SQL |

Converter o CSV para Parquet muda a representação; não demonstra que o contrato 10 deveria valer 100. Conferir o conteúdo continua sendo necessário. Esse bucket é apenas um exemplo conceitual: não pressupõe MinIO já integrado à aplicação.

## Critério de escolha

Considere volume, tipos, ferramenta de leitura e necessidade de inspeção. Converter para Parquet não corrige uma chave errada nem valida o significado das colunas.

A prática opcional de subir MinIO e ler/gravar um Parquet deve ocorrer em ambiente isolado, com configuração própria. Ela não é pré-requisito para concluir o pipeline PostgreSQL desta trilha.

## Como reconhecer os formatos em um exemplo

Um CSV pode começar com `orgao,valor` e ter uma linha como `A,100`. O separador também pode ser ponto e vírgula: é necessário conhecer a convenção do arquivo.

Em JSON, o mesmo registro pode ser `{"orgao": "A", "valor": 100}`. Os nomes das propriedades acompanham os valores e podem existir listas dentro de outras estruturas.

Parquet guarda dados de maneira binária e colunar. Não foi feito para leitura direta em um editor de texto; uma ferramenta de dados interpreta seu conteúdo. Essa organização pode evitar a leitura de colunas desnecessárias, mas o benefício depende do arquivo e da consulta.

## Veja também

- [Documentar colunas e seguir a linhagem](../guias/engenharia-metadados.md)
- [Prática: da gold ao gráfico no Superset](../tutoriais/engenharia-consumo.md)
