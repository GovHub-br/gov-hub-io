# OpenMetadata

Plataforma de governança e catalogação de dados do GovHub BR.

## Papel na Arquitetura

OpenMetadata fornece catálogo de dados, linhagem e ownership para garantir que os dados do GovHub são descobríveis, rastreáveis e confiáveis.

!!! info "Status a confirmar"
    O repositório de governança declarativa é a referência para catálogo, owners, domínios e classificações. Antes de depender de um recurso específico em produção, confirme com a equipe responsável se ele já está habilitado no ambiente alvo.

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| Catálogo | Descoberta de datasets (search) |
| Linhagem | Rastreio Bronze → Silver → Gold |
| Ownership | Responsáveis por cada dataset |
| Domínios | Organização por órgão/sistema |
| Qualidade | Integração com testes dbt |
| Tags | Classificação e sensibilidade |

## Domínios

| Domínio | Datasets | Owner |
|---------|----------|-------|
| Transferências | transferegov_*, fato_transferencias | Equipe Pipeline |
| Pessoal | siape_*, fato_servidores | Equipe Pipeline |
| Financeiro | siafi_*, execucao_financeira | Equipe Pipeline |
| Compras | comprasgov_*, fato_compras | Equipe Pipeline |
| Organizacional | siorg_*, dim_orgaos | Equipe Pipeline |

## Linhagem

```mermaid
graph LR
    A[API TransfereGov] --> B[MinIO: bronze-transferegov]
    B --> C[silver.transferencias]
    C --> D[gold.fato_transferencias]
    D --> E[Superset: Dashboard Transferências]
```

Quando a integração está habilitada, OpenMetadata captura linhagem via dbt e Airflow.

## Configuração Declarativa

O repositório [`openmetadata-declarative-governance`](https://github.com/GovHub-br/openmetadata-declarative-governance) permite configurar governança como código:

- Domínios
- Times e usuários
- Produtos de dados
- Tags e classificações

```yaml
# Exemplo de configuração declarativa
domains:
  - name: Transferências
    description: Dados de convênios e transferências voluntárias
    owner: equipe-pipeline
    data_products:
      - gold.fato_transferencias
      - silver.transferencias
```

## Como Completar a Configuração

Itens pendentes para configuração completa:

| Item | Status | Como completar |
|------|--------|----------------|
| Catálogo de tables | ✅ Funcional | Automático via conector PG |
| Linhagem dbt | ✅ Funcional | Automático via integração dbt |
| Owners por dataset | ⚠️ Parcial | Declarar no repo de governança |
| Domínios por fork | ❌ Pendente | Criar domínios para cada fork temático |
| Tags de sensibilidade | ❌ Pendente | Classificar dados Siape/Siafi |
| Testes de qualidade | ⚠️ Parcial | Configurar ingestion de resultados dbt test |

Para adicionar owners e domínios, edite o repo [`openmetadata-declarative-governance`](https://github.com/GovHub-br/openmetadata-declarative-governance) seguindo o padrão abaixo e use o fluxo de revisão/deploy adotado pelo time.

## Referências

- [OpenMetadata Docs](https://docs.open-metadata.org/)
- Repo: [`openmetadata-declarative-governance`](https://github.com/GovHub-br/openmetadata-declarative-governance)
