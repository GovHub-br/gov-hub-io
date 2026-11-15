# Executar o dbt e conferir os dados no banco

> Tipo: **Guia**

## Objetivo

Ajustar o projeto dbt existente para o PostgreSQL local e executar um modelo. O ambiente e as dependências já devem estar preparados, com as tabelas de origem carregadas no banco.

Os arquivos estão em `airflow_lappis/dags/dbt/ipea/`, no repositório `data-application-gov-hub`. Vamos usar o banco local `postgres` como exemplo; se o seu banco tiver outro nome, use esse nome nos três ajustes abaixo.

## 1. Apontar o profiles.yml para o banco local

O `profiles.yml` define a conexão: servidor, credenciais, banco e schema padrão. Para executar o dbt pelo terminal do computador, ajuste o perfil existente:

```yaml
ipea:
  target: prod
  outputs:
    prod:
      type: postgres
      host: localhost
      user: postgres
      password: "{{ env_var('DB_DW_PASSWORD', 'postgres') }}"
      port: 5432
      dbname: postgres
      schema: ipea
```

Use o usuário e a senha do seu PostgreSQL local. O trecho lê a senha de `DB_DW_PASSWORD`, se definida, ou usa `postgres` como padrão local. Confira também essa variável no terminal para não reutilizar uma senha de outro ambiente.

O destino continua chamado `prod` porque a macro de schemas do projeto considera esse nome ao aplicar os schemas dos domínios, como `contratos`. **Esse nome é um rótulo do perfil; o destino efetivo é definido por host, porta e banco.** O `dbname` identifica o banco; `schema` é o namespace padrão dentro dele.

Se executar dentro do contêiner Airflow, use `host: postgres`, nome do serviço no Compose. O exemplo de execução desta aula usa o terminal do computador, por isso o host é `localhost`.

## 2. Ajustar o banco no dbt_project.yml

O arquivo `dbt_project.yml` referencia o perfil `ipea` e organiza os modelos por domínio. No bloco `models → ipea`, altere **somente** a linha `+database: analytics_ipea` para:

```yaml
models:
  ipea:
    +database: postgres
```

Esse trecho mostra apenas o ajuste: preserve os blocos de domínios, materializações, permissões e hooks que já existem abaixo dele. Mantenha também `profile: ipea` no arquivo.

O `+database` configura o banco de destino dos modelos e pode sobrescrever o banco do perfil. Por isso, mudar apenas `profiles.yml` deixaria uma referência a `analytics_ipea`. Para esta execução PostgreSQL, mantenha ambos apontando para `postgres`.

## 3. Ajustar o destino dos snapshots

Abra `snapshots/tables_snapshot.yml`. Os quatro snapshots existentes têm `database: analytics`; altere esse valor para `postgres` em **todos eles**: `contratos_snapshot`, `faturas_snapshot`, `empenhos_snapshot` e `cronogramas_snapshot`.

O primeiro fica assim:

```yaml
snapshots:
  - name: contratos_snapshot
    relation: ref('contratos')
    config:
      schema: snapshots
      database: postgres
      unique_key: id
      strategy: check
      check_cols: [situacao, num_parcelas, valor_parcela, valor_global, valor_acumulado]
```

Preserve as chaves e colunas de comparação de cada snapshot. O `ref('contratos')` aponta para o modelo do projeto; `database` define o banco do histórico e `schema` organiza seu destino dentro desse banco.

Esses ajustes alinham a configuração do histórico ao ambiente local. **`dbt run` executa modelos; snapshots são executados separadamente com `dbt snapshot`.** Não é necessário executá-los para rodar o modelo desta aula.

## 4. Executar um modelo existente

No terminal com o ambiente dbt do projeto ativo, partindo da raiz do repositório:

```bash
cd airflow_lappis/dags/dbt/ipea
export DBT_PROFILES_DIR="$PWD"
dbt debug
```

O diretório atual contém o `dbt_project.yml`; `DBT_PROFILES_DIR` indica que o perfil também está nessa pasta. O `dbt debug` deve confirmar a conexão com o banco local antes da execução.

Para executar um modelo, use o nome do arquivo SQL sem a extensão:

```bash
dbt run -m nome_do_modelo
```

Por exemplo, o arquivo `models/contratos_dbt/bronze/contratos.sql` corresponde a:

```bash
dbt run -m contratos
```

Esse modelo lê a origem `compras_gov.contratos`, converte campos e materializa a tabela `contratos.contratos`. A origem precisa existir no banco local e conter as colunas esperadas; a execução do modelo não faz a coleta da API. Os schemas, as funções e as permissões usados pelos hooks do projeto também devem estar preparados.

O `-m` seleciona o modelo solicitado; ele não executa automaticamente seus modelos anteriores. Para um modelo que depende de outros ainda não materializados, use `dbt run -m +nome_do_modelo` para incluir os antecessores. A opção equivalente atual é `--select`, por exemplo `dbt run --select contratos`.

## 5. Conferir a saída

Após a execução indicar sucesso, conecte o cliente SQL ou o Superset ao mesmo banco `postgres` e consulte:

```sql
select count(*) as quantidade_contratos
from contratos.contratos;

select id, situacao, valor_global
from contratos.contratos
limit 10;
```

A primeira consulta confere o volume materializado; a segunda permite inspecionar os campos transformados. O resultado depende dos dados já carregados na sua origem local.

## Referências

- [Projetos e perfis dbt do Gov Hub](https://gov-hub.io/documentacao/pipeline/dbt/)
- [Modelos e materializações](https://gov-hub.io/documentacao/tutoriais/dbt/modelos/)
- [Seleção de modelos no dbt](https://docs.getdbt.com/reference/node-selection/syntax)

## Veja também

- [Validar PostgreSQL e Superset](engenharia-acessos-locais.md)
- [Rotina local e verificação final](engenharia-rotina-ambiente.md)
