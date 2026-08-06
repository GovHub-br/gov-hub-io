# Contribuindo com o GovHub BR

Obrigado pelo interesse em contribuir! O GovHub BR é um projeto open source que busca transformar dados governamentais em ativos estratégicos para a gestão pública.

---

## Como Contribuir

1. **Abra uma issue** descrevendo o problema ou melhoria (ver [requisitos de issue](#requisitos-de-issue))
2. **Fork** o repositório
3. **Crie uma branch** com o prefixo correto (`feat/`, `fix/`, `docs/`, `refactor/`)
4. **Faça suas alterações** com commits assinados (GPG)
5. **Abra um PR** seguindo o [protocolo de documentação mínima](#protocolo-de-documentação-mínima-para-prs)
6. Aguarde o review — PRs sem documentação mínima **não serão aprovados**

---

## Áreas de Contribuição

| Área | Descrição | Repo |
|------|-----------|------|
| Pipeline | Novas DAGs, models dbt | `data-application-gov-hub` |
| Dashboards | Novos painéis Superset | `data-application-gov-hub` |
| Infra | Manifests K8s, Helm | `continuous-deployment` |
| Documentação | Melhorias nos docs | `gov-hub` ou este repo |
| Pesquisa | POCs, IA, OCR | `govhub-research` |
| Governança | OpenMetadata config | `openmetadata-declarative-governance` |

---

## Requisitos de Issue

Toda issue deve conter no mínimo:

- **Título claro** descrevendo o problema ou funcionalidade
- **Descrição** explicando o contexto e o porquê
- **Critérios de aceitação** — o que define que a issue está concluída?
- **Labels** apropriadas (`bug`, `feature`, `docs`, `infra`, etc.)

**Exemplo de issue bem descrita:**

```
Título: Adicionar DAG de ingestão do PNCP — itens de licitação

Descrição:
O PNCP disponibiliza endpoint com itens detalhados de licitações.
Precisamos ingerir esses dados para alimentar o modelo gold de compras.

Critérios de aceitação:
- DAG criada em data_ingest/pncp/
- Dados salvos na tabela pncp.itens_licitacoes no PostgreSQL
- dbt run e dbt test passando
- PR com descrição do que foi feito
```

Issues sem critérios de aceitação podem ser fechadas ou devolvidas para complementação.

---

## Protocolo de Documentação Mínima para PRs

Todo PR deve obrigatoriamente conter:

### 1. Descrição do porquê

Explique a motivação da mudança — não apenas o que foi feito, mas **por que** foi necessário.

```
❌ "Adiciona DAG do PNCP"
✅ "Adiciona DAG de ingestão do PNCP para cobrir dados de itens de licitação
    que estavam ausentes no pipeline de compras públicas (issue #42)"
```

### 2. O que foi alterado

Liste os arquivos principais adicionados ou modificados e o que cada um faz.

```
- airflow_lappis/dags/data_ingest/pncp/itens_licitacoes_ingest_dag.py — nova DAG
- airflow_lappis/dags/dbt/ipea/models/contratos_dbt/bronze/itens_licitacoes.sql — novo modelo bronze
- airflow_lappis/dags/dbt/ipea/models/contratos_dbt/bronze/schema.yml — testes adicionados
```

### 3. Como testar

Descreva os passos mínimos para validar a mudança localmente.

```
1. docker compose up -d
2. Trigger manual da DAG pncp_itens_licitacoes_ingest_dag no Airflow
3. Verificar registros em pncp.itens_licitacoes: SELECT COUNT(*) FROM pncp.itens_licitacoes;
4. dbt run --select contratos_dbt.bronze.itens_licitacoes
5. dbt test --select contratos_dbt.bronze.itens_licitacoes
```

### 4. Issue relacionada

Todo PR deve referenciar a issue que originou a mudança.

```
Closes #42
```

---

## Checklist de PR por Tipo

Marque todos os itens aplicáveis antes de abrir o PR.

### DAGs de ingestão

- [ ] Nome da DAG segue o formato `<origem>_<dominio>_<acao>`
- [ ] Usa TaskFlow API (`@dag`, `@task`)
- [ ] Schedule via `get_dynamic_schedule()`
- [ ] `owner` preenchido com nome da pessoa ou time
- [ ] `catchup=False` declarado
- [ ] Airflow Variables validadas antes do uso
- [ ] Conexão PostgreSQL via `get_postgres_conn()`
- [ ] DAG no diretório correto (`data_ingest/<origem>/`)
- [ ] PR com descrição, o que foi alterado e como testar

### Modelos dbt

- [ ] Nome segue o prefixo da camada (`brz_`, `slv_`, `gld_`)
- [ ] Modelo no diretório correto (`<dominio>_dbt/<camada>/`)
- [ ] `schema.yml` atualizado com `description` e `meta.tags`
- [ ] `dt_ingest` propagado
- [ ] `dbt run` e `dbt test` passando localmente
- [ ] PR com descrição, o que foi alterado e como testar

### Documentação

- [ ] Arquivo no caminho correto dentro de `docs/`
- [ ] Links internos funcionando
- [ ] Build do MkDocs sem erros (`docker run --rm -v .:/docs squidfunk/mkdocs-material build`)
- [ ] PR com descrição do que foi adicionado ou corrigido

### Infraestrutura

- [ ] Manifests testados em pré-produção antes do PR para produção
- [ ] Secrets não commitados
- [ ] Overlay correto (`values.preprod.yaml` ou `values.prod.yaml`) atualizado
- [ ] PR com descrição do impacto e como reverter se necessário

---

## Padrões de Código

| Aspecto | Padrão |
|---------|--------|
| Branches | `feat/`, `fix/`, `refactor/`, `docs/` |
| Commits | [Conventional Commits](https://www.conventionalcommits.org/) |
| Assinatura | GPG recomendado; obrigatório apenas quando a ruleset do repositório exigir |
| Code style | `make lint` deve passar sem erros |
| Testes | `make test` deve passar antes do PR |

Para detalhes de padrões de DAGs e modelos dbt, consulte [Padrões de Engenharia](pipeline/padroes-engenharia.md).

---

## Ambiente de Desenvolvimento

Consulte [Instalação](instalacao.md) para configurar seu ambiente.

---

## Contato

- **Issues**: GitHub de cada repositório
- **Email**: lablivreunb@gmail.com
