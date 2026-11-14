# Modelos dbt: source, ref e materializações

> Tipo: **Referência**

## O que o dbt acrescenta ao SQL?

Uma consulta isolada responde a um pedido. Um projeto dbt organiza várias consultas como um conjunto de transformações com dependências, testes e documentação. Ele usa a conexão com o banco para executar o trabalho: os dados continuam no PostgreSQL.

Um arquivo chamado `resumo_por_orgao.sql` corresponde a um modelo com esse nome, salvo configuração específica. Ao executar o modelo, o dbt prepara o SQL e cria ou atualiza sua representação no banco.

**Materializar** significa escolher como o resultado ficará disponível. Uma tabela guarda os registros calculados; uma visão guarda uma consulta que será usada quando alguém a consultar. Incremental atualiza uma parte do conjunto segundo a estratégia definida.

## Onde fica

O projeto dbt está em `airflow_lappis/dags/dbt/ipea/`. Um modelo é um arquivo SQL; o dbt organiza a execução a partir das dependências declaradas.

| Recurso | Uso |
|---|---|
| `source('fonte', 'tabela')` | Lê uma origem declarada em `models/sources.yml` |
| `ref('modelo')` | Lê outro modelo e registra a dependência |
| `table` | Persiste o resultado como tabela |
| `view` | Mantém uma consulta salva |
| `incremental` | Processa novos registros ou atualizações conforme a lógica configurada |
| `unique_key` | Identifica registros para a estratégia incremental |
| Macro / Jinja | Reutiliza e parametriza trechos de SQL |
| Seed | Pequena tabela de referência mantida em CSV |
| Snapshot | Registra versões observadas de uma tabela |

## Configuração

Leia `dbt_project.yml` para materializações por pasta, schemas e permissões. Entre as macros do projeto estão `parse_financial_value`, `safe_casts` e `get_custom_schema`.

Uma materialização incremental precisa de uma regra para selecionar mudanças. Só declarar `unique_key` não informa quais registros alterados devem ser buscados.

## Exemplo: uma origem, um modelo e um dependente

No modelo `formacao_bronze`, a expressão `source('formacao', 'empenhos_estudo')` aponta para a tabela de estudo declarada. Um modelo seguinte pode usá-lo assim:

```sql
select orgao, sum(valor) as total
from {{ ref('formacao_bronze') }}
group by orgao
```

Com as linhas A = 150 e B = 200, a saída tem A = 150 e B = 200. O exemplo mostra o corpo de um modelo dbt; as expressões entre chaves são resolvidas pelo dbt, não pelo editor SQL comum.

| Seleção | O que inclui neste exemplo |
|---|---|
| `formacao_bronze` | Só esse modelo, além dos testes aplicáveis conforme o comando |
| `formacao_bronze+` | Esse modelo e os modelos que dependem dele |

Uma seed poderia listar códigos fixos de órgãos; uma macro poderia padronizar a conversão dos valores. Ambas ajudam a reutilizar definições, mas não substituem a tabela de origem nem sua conferência.

## Comandos de consulta

Execute no ambiente dbt configurado da aplicação, com perfil e destino local conferidos:

- `dbt run`: executa modelos.
- `dbt test`: executa testes.
- `dbt build`: executa os recursos selecionados e seus testes.
- `--select modelo+`: seleciona o modelo e os seus descendentes.

O sinal `+` amplia o escopo. Confira a seleção antes de rodar contra um banco compartilhado.

## Como ler as expressões entre chaves

Em `select * from {{ ref('modelo_anterior') }}`, as chaves delimitam uma expressão que o dbt resolve antes de enviar o SQL ao banco. `ref` identifica a dependência de outro modelo. Para uma tabela recebida da fonte, usamos `source` com o nome da fonte e da tabela declaradas na configuração.

Isso permite que o dbt descubra a ordem de execução sem depender da ordem alfabética dos arquivos. Um **descendente** é um modelo que depende direta ou indiretamente do resultado de outro.

O **perfil** informa como conectar ao banco; o **destino**, ou target, escolhe uma configuração, como a local. Execute os comandos no ambiente dbt preparado pela aplicação, com perfil e destino local conferidos.

## Veja também

- [Prática: executar e investigar uma DAG](../tutoriais/engenharia-airflow-pratica.md)
- [Prática: schema e testes antes do SQL](../tutoriais/engenharia-dbt-pratica.md)
