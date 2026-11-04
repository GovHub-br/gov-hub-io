# Prática: schema e testes antes do SQL

> Tipo: **Tutorial**

## O que você vai construir

Um modelo bronze a partir da tabela `formacao.empenhos_estudo`, preparada na prática do cliente mínimo. Essa tabela tem IDs 1 e 2, órgãos A e B e valores 150 e 200 após a correção. Antes de transformar, vamos descrever o que deve ser verdadeiro no resultado.

## Preparar a edição

Abra a aplicação no editor e encontre `airflow_lappis/dags/dbt/ipea/`. Dentro de `models/`, crie uma pasta `formacao` e, nela, uma pasta `bronze`. Todos os arquivos desta prática ficam nesse projeto dbt.

Use o ambiente dbt preparado pela aplicação, com conexão ao banco local. O comando `dbt debug` verifica a configuração e a conexão; execute-o antes dos demais comandos. Se houver falha de conexão ou perfil, resolva essa preparação antes de tentar criar o modelo.

**YAML** é um formato de configuração. Seus nomes, listas e espaços organizam as informações; não é SQL. Use espaços, mantendo a indentação do exemplo.

## 1. Declarar a origem

Crie `models/formacao/sources.yml` com este conteúdo:

```yaml
version: 2
sources:
  - name: formacao
    schema: formacao
    tables:
      - name: empenhos_estudo
```

`sources` lista as fontes; `name` dá o nome que será usado pelo dbt; `schema` indica a divisão do banco; `tables` lista as tabelas. Essa declaração aponta para a tabela já existente, sem criar ou preencher sua origem. A conexão escolhe o banco local.

## 2. Descrever o resultado antes de escrevê-lo

Crie `models/formacao/schema.yml`:

```yaml
version: 2
models:
  - name: formacao_bronze
    description: Uma linha por ID recebido na tabela de estudo.
    columns:
      - name: id
        description: Identificador único do registro de estudo.
        tests:
          - not_null
          - unique
      - name: orgao
        description: Código do órgão de estudo.
      - name: valor
        description: Valor numérico em reais.
```

`models` reúne as descrições dos modelos; `columns`, as colunas; `tests`, as expectativas verificáveis. `not_null` exige ID preenchido; `unique` exige que ele não se repita. Esse arquivo descreve o resultado, não insere registros.

## 3. Escrever o modelo bronze

Crie `models/formacao/bronze/formacao_bronze.sql`:

```sql
{{ config(materialized='table') }}

select
    id::integer as id,
    orgao::text as orgao,
    valor::numeric as valor
from {{ source('formacao', 'empenhos_estudo') }}
```

`config` define que o resultado será uma tabela. `source` liga a consulta à declaração da etapa 1. `::integer`, `::text` e `::numeric` tornam explícitos os tipos esperados. Nenhuma linha é filtrada e não há regra de indicador.

## 4. Executar e conferir

No terminal, no diretório do projeto dbt, execute:

```bash
dbt run --select formacao_bronze
dbt test --select formacao_bronze
```

O primeiro comando cria a saída; o segundo confere as regras. Os testes devem aprovar. No resultado da execução, identifique o schema de destino, que pode ser definido pela configuração do projeto; não presuma que seja o mesmo da origem. Confira duas linhas, IDs 1 e 2 e total 350 no banco.

## 5. Ver um teste reprovar e depois aprovar

A origem tem chave primária e impede IDs repetidos. Para testar apenas a saída, acrescente temporariamente ao SQL, depois do primeiro `from`, este trecho:

```sql
union all
select id::integer, orgao::text, valor::numeric
from {{ source('formacao', 'empenhos_estudo') }}
```

`union all` reúne os dois resultados preservando as repetições. Execute novamente `dbt run` e `dbt test`: o teste `unique` deve reprovar porque cada ID aparece duas vezes. O teste `not_null` pode continuar aprovado, pois são regras diferentes.

Remova o trecho temporário e repita os comandos. A saída deve voltar a duas linhas e os testes devem aprovar. Não deixe a duplicação no modelo final: ela serviu apenas para demonstrar a detecção de uma falha.

## Exemplo: o que cada teste deve mostrar

| Estado do modelo | Quantidade de linhas | `not_null` no ID | `unique` no ID |
|---|---|---|---|
| SQL original | 2 | Aprova | Aprova |
| Com o `union all` temporário | 4 | Aprova | Reprova |
| Após remover o trecho e executar de novo | 2 | Aprova | Aprova |

Na falha controlada, a saída repete os IDs 1 e 2, mas nenhum fica vazio. Por isso apenas o teste de unicidade precisa reprovar. Essa comparação mostra que “um teste aprovou” não equivale a “todos os requisitos foram atendidos”.

Confira também os valores: antes da duplicação, 150 + 200 = 350; com as linhas repetidas, o total vira 700. A falha de chave ajuda a detectar um problema que, sem conferência, poderia aparecer no gráfico como um valor maior e aparentemente legítimo.

## O que você aprendeu

A declaração de fonte localiza a entrada, a descrição define expectativas e o SQL prepara a saída. Executar sem erro não garante qualidade; os testes verificam condições específicas. Na próxima etapa, acompanhe como essas transformações aparecem no Airflow.

## Veja também

- [Modelos dbt: source, ref e materializações](../referencia/engenharia-dbt.md)
- [Como o Cosmos leva o dbt ao Airflow](../explicacao/engenharia-cosmos.md)
