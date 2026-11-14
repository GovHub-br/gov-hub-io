# PostgreSQL, formatos e o papel do MinIO

> Tipo: **Referência**

## Armazenamento de objetos e landing zone

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

## Exemplo: preservar o recebido e validar a carga

Considere, em uma landing zone de estudo, o bucket `formacao` e o objeto `contratos/2026-01.csv`. O recebimento do arquivo e sua transformação em tabela são eventos distintos:

| Etapa | Evidência de conferência |
|---|---|
| Recebimento | Objeto identificado e período correspondente à coleta |
| Leitura | Registros interpretados com separador, codificação e estrutura esperados |
| Carga no PostgreSQL | Quantidade, chaves e valores conferidos contra o recebido |
| Conversão para Parquet | Tipos e conteúdo preservados, com reconciliação dos totais |

Um arquivo convertido sem erro pode continuar com registros ausentes ou uma chave incorreta. Valide a equivalência do conteúdo antes de disponibilizar o novo formato para consumo. Esse cenário é conceitual: o MinIO não está integrado ao Compose da aplicação.

## Critério de escolha

Considere volume, tipos, ferramenta de leitura e necessidade de inspeção. Converter para Parquet não corrige uma chave errada nem valida o significado das colunas.

A prática opcional de subir MinIO e ler/gravar um Parquet deve ocorrer em ambiente isolado, com configuração própria. Ela não é pré-requisito para concluir o pipeline PostgreSQL desta trilha.

## Critérios de leitura dos arquivos

Na ingestão de CSV, explicite separador, codificação, cabeçalho e interpretação de tipos. No JSON, defina o caminho dos registros e o tratamento de estruturas aninhadas. Essas decisões fazem parte do contrato da fonte.

Para Parquet, considere a preservação dos tipos e a projeção de colunas nas consultas analíticas. O benefício depende da organização dos arquivos e das operações de leitura; mudar o formato não substitui os controles de integridade e reconciliação.

## Veja também

- [Documentar colunas e seguir a linhagem](../guias/engenharia-metadados.md)
- [Prática: da gold ao gráfico no Superset](../tutoriais/engenharia-consumo.md)
