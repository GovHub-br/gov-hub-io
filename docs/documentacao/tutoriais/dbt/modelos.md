# Modelos dbt

No **dbt (Data Build Tool)**, os **modelos** são arquivos SQL que definem como os dados devem ser transformados e estruturados.
Cada modelo gera uma tabela, view ou outro objeto no banco de dados, e pode ser **referenciado** e **reutilizado** em outras partes do projeto.

Essa abordagem permite organizar as transformações de forma modular, rastreável e escalável, garantindo qualidade e governança no pipeline de dados.

---

## Estrutura do `dbt_project.yml`

O arquivo `dbt_project.yml` é o **coração do projeto dbt**. Ele centraliza as configurações, como:

* Nome e versão do projeto
* Caminhos para modelos, macros, testes, seeds etc.
* Configurações padrão de materialização (tabelas, views, incrementais)
* Perfis de conexão com o banco de dados
* Ações automáticas antes ou depois de rodar os modelos

### Exemplo usado no projeto IPEA:

```yaml
name: 'ipea'
version: 1.0.0
config-version: 2

profile: ipea

# Caminhos para os artefatos do projeto
model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]

# Pastas que podem ser limpas com dbt clean
clean-targets:
  - "target"
  - "dbt_packages"
  - "logs"

# Configuração dos modelos
models:
  ipea: 
    +database: analytics
    contratos_dbt:
      +materialized: table
      +schema: contratos
      bronze:
        +materialized: incremental
      views:
        +materialized: view
    pessoas_dbt:
      +materialized: table
      +schema: pessoas
      views:
        +materialized: view
    ted_dbt:
      +materialized: table
      +schema: ted
      views:
        +materialized: view

# Macro executada antes de rodar os modelos
on-run-start:
  - '{{ create_udfs() }}'
```

Esse arquivo garante que o dbt saiba **onde encontrar os modelos, como executá-los e quais padrões aplicar** durante o build.

---

## Referenciando modelos

Uma das maiores forças do dbt é a **gestão automática de dependências entre modelos**.
Em vez de escrever subqueries gigantes ou referenciar diretamente tabelas do banco, usamos o macro `ref()`.

O dbt entende essas referências e monta o **grafo de dependência**: ele sabe a ordem correta de execução dos modelos e garante que cada transformação só rode depois de suas dependências estarem prontas.


### Sem dbt (SQL tradicional)

No SQL puro, é comum encadear transformações usando **subqueries** ou **CTEs**.
Por exemplo, para calcular a média de contratos ativos, teríamos algo assim:

```sql
create table contratos_ativos_media as
select 
    empresa_id,
    avg(valor) as media_valor
from (
    select
        id_contrato,
        empresa_id,
        valor,
        status
    from contratos_raw
    where status = 'ativo'
) as contratos_filtrados
group by empresa_id;
```

Nesse caso, toda a lógica fica embutida em uma única query.
Se precisarmos reutilizar a parte intermediária (`contratos_filtrados`), teremos que copiar e colar a subquery em outros lugares.

---

### Com dbt (usando `ref()`)

No dbt, quebramos as transformações em **modelos organizados em pastas (bronze, silver, gold)**.
Cada etapa fica em um arquivo separado e podemos **referenciar modelos anteriores** com `ref()`:

#### 1. Modelo Bronze (`models/bronze/contratos_base.sql`)

```sql
select
    id_contrato,
    empresa_id,
    valor,
    status
from {{ source('sistema_legado', 'contratos_raw') }}
```

---

#### 2. Modelo Silver (`models/silver/contratos_filtrados.sql`)

```sql
select
    id_contrato,
    empresa_id,
    valor
from {{ ref('contratos_base') }}
where status = 'ativo'
```

---

#### 3. Modelo Gold (`models/gold/contratos_ativos_media.sql`)

```sql
select 
    empresa_id,
    avg(valor) as media_valor
from {{ ref('contratos_filtrados') }}
group by empresa_id
```

---

### Benefícios práticos do `ref()`

1. **Independência do schema/nome físico:** você escreve `ref('contratos_base')` e o dbt resolve para o schema/tabela corretos na compilação.
2. **Grafo de execução automático:** o dbt entende que `contratos_ativos_media` depende de `contratos_filtrados`, que depende de `contratos_base`.
3. **Documentação e lineage:** ao gerar a documentação (`dbt docs generate`), você visualiza o fluxo completo (bronze → silver → gold).
4. **Reuso e modularidade:** cada transformação pode ser reutilizada em outros modelos sem duplicar código.


Resumindo: no SQL tradicional você teria queries longas com subqueries duplicadas; já no dbt, você ganha **modularidade, rastreabilidade e consistência** só organizando os modelos e usando `ref()`.

---

## Trabalhando com Sources


Em muitos projetos de dados, começamos a trabalhar a partir de **tabelas brutas** vindas de sistemas transacionais, APIs ou arquivos que foram carregados para o banco (camada **raw**).
Essas tabelas não foram criadas pelo dbt, mas são a **matéria-prima** para nossas transformações.

Para lidar com elas de forma organizada, o dbt oferece o conceito de **sources**.
Um `source` é uma referência declarada a uma tabela externa, que permite:

* **Manter rastreabilidade:** você sabe de onde o dado realmente veio.
* **Evitar hardcode de nomes e schemas:** assim como `ref()`, o `source()` resolve automaticamente o schema e a tabela correta.
* **Documentar a origem dos dados:** os sources aparecem no lineage e na documentação do dbt.
* **Testar qualidade na camada raw:** você pode aplicar testes (ex: `not_null`, `unique`) diretamente nos sources.

---

### Exemplo de uso do `source()`

```sql
select 
    id_contrato,
    empresa_id,
    valor,
    data_assinatura
from {{ source('transfere_gov', 'contratos') }}
```

Aqui, `transfere_gov` é o **nome da source** (geralmente definido em um arquivo `sources.yml`) e `contratos` é a tabela bruta dentro desse schema.
Na compilação, isso pode virar algo como:

```sql
select 
    id_contrato,
    empresa_id,
    valor,
    data_assinatura
from transfere_gov.contratos
```

---

### Como os sources se conectam ao dbt

Para declarar um source, usamos um arquivo YAML (ex: `models/sources.yml`):

```yaml
version: 2

sources:
  - name: transfere_gov
    schema: raw
    tables:
      - name: contratos
      - name: empenhos
```

Isso informa ao dbt que existe um schema chamado `raw` com as tabelas `contratos` e `empenhos`.
Agora, sempre que precisarmos usar esses dados brutos, referenciamos via `{{ source('transfere_gov', 'contratos') }}` em vez de escrever `raw.contratos`.

---

### Importância prática dos sources

* **Camada raw como contrato estável:** o dbt enxerga a camada bruta como o ponto de partida confiável para todas as transformações.
* **Separação clara de responsabilidades:** tudo que é “de fora” fica documentado como source; tudo que é “produzido dentro do projeto” é model.
* **Visibilidade do lineage:** na documentação interativa, você consegue ver graficamente quais modelos dependem de quais tabelas brutas.
* **Validação desde a origem:** garante que problemas (como nulos, duplicados ou chaves quebradas) sejam identificados antes mesmo de chegar nas camadas silver/gold.

---

Em resumo: os **sources** são a ponte entre a **camada raw** (dados crus) e os **modelos dbt** (transformações). Eles garantem rastreabilidade, qualidade e organização do pipeline de ponta a ponta.

---


## Tipos de Materialização

O dbt permite controlar como cada modelo será materializado:

* **Table:** Cria uma tabela física persistente, substituída a cada execução.
* **View:** Cria uma view SQL, atualizada em tempo de consulta.
* **Incremental:** Atualiza apenas novos ou modificados, ideal para grandes volumes.
* **Ephemeral:** Não cria objeto no banco, funciona como uma CTE dentro de outros modelos.

Cada tipo tem um caso de uso específico, balanceando **performance, custo e necessidade de atualização**.

---

## Boas práticas no uso do dbt

* **Nomenclatura consistente:** facilita leitura e manutenção.
* **Documentação clara:** cada modelo deve ter descrição no `.yml`.
* **Testes automáticos:** validar integridade (`not_null`, `unique`, `relationships`) e qualidade.
* **Modularidade:** dividir transformações em etapas pequenas e reutilizáveis.
* **Versionamento:** usar Git para rastrear mudanças.
* **Macros e variáveis:** evitar repetição de código.

---

## Conclusão

Com o dbt, conseguimos **padronizar e automatizar transformações de dados**, trazendo rastreabilidade, escalabilidade e confiança para os pipelines analíticos.
No contexto do projeto com o IPEA, isso garantiu que cada camada (bronze, silver, gold) tivesse processos bem definidos, organizados e facilmente auditáveis.

