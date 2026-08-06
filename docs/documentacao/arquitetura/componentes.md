# Componentes

Detalhamento dos componentes principais da plataforma GovHub BR.

## Apache Airflow

**Papel**: Orquestração de pipelines de ingestão (ETL/ELT).

| Aspecto | Detalhe |
|---------|---------|
| Versão | Apache Airflow 2.x |
| Deploy | Kubernetes (Helm chart) |
| DAGs | Uma por fonte de dados |
| Schedule | Diário/semanal conforme fonte |
| UI | `http://localhost:8080` (local) |

**Responsabilidades**:

- Extrair dados de APIs governamentais
- Depositar raw data no MinIO (Bronze)
- Triggerar dbt runs após ingestão
- Monitorar e alertar falhas

## dbt (Data Build Tool)

**Papel**: Transformação de dados (Bronze → Silver → Gold).

| Aspecto | Detalhe |
|---------|---------|
| Versão | dbt-core |
| Adapter | dbt-postgres |
| Models | bronze/, silver/, gold/ |
| Tests | Schema + custom SQL |
| Docs | `dbt docs generate` |

**Responsabilidades**:

- Limpar e normalizar dados (Silver)
- Agregar e criar métricas (Gold)
- Testar qualidade em cada camada
- Documentar linhagem de dados

## MinIO

**Papel**: Object storage para camada Bronze (dados brutos).

| Aspecto | Detalhe |
|---------|---------|
| Deploy | Kubernetes (Helm chart) |
| Protocolo | S3-compatible |
| Buckets | Um por fonte (transferegov, siape, etc.) |
| Retenção | Indefinida |
| UI | MinIO Console |

**Responsabilidades**:

- Armazenar dados raw imutáveis
- Garantir reprodutibilidade do pipeline
- Servir como source para dbt

## PostgreSQL

**Papel**: Banco analítico (Silver e Gold layers).

| Aspecto | Detalhe |
|---------|---------|
| Deploy | Kubernetes (Helm chart) |
| Schemas | `silver`, `gold` |
| Conexão | Superset, JupyterHub, dbt |
| Backups | Configurados via K8s |

**Responsabilidades**:

- Armazenar dados transformados
- Servir queries analíticas (Superset)
- Metastore para pipelines

## Apache Superset

**Papel**: BI e visualização de dados.

| Aspecto | Detalhe |
|---------|---------|
| Deploy | Kubernetes (Helm chart) |
| Datasets | Conectado ao PostgreSQL (Gold) |
| Dashboards | Por domínio (transferências, pessoal, etc.) |
| UI | `http://localhost:8088` (local) |

**Responsabilidades**:

- Dashboards interativos para gestores
- Exploração de dados self-service
- Controle de acesso por role

## JupyterHub

**Papel**: Notebooks para análise interativa e pesquisa.

| Aspecto | Detalhe |
|---------|---------|
| Deploy | Kubernetes (Helm chart) |
| Kernels | Python 3.11+ |
| Acesso | Multi-user |
| UI | `http://localhost:8888` (local) |

**Responsabilidades**:

- Análises exploratórias
- Prototipagem de novos pipelines
- Pesquisa (IA, OCR, parsers)

## OpenMetadata

**Papel**: Governança e catalogação de dados.

| Aspecto | Detalhe |
|---------|---------|
| Config | Declarativa (repo dedicado) |
| Domínios | Por órgão/sistema |
| Linhagem | Bronze → Silver → Gold |

**Responsabilidades**:

- Catálogo de dados (discovery)
- Linhagem end-to-end
- Ownership e domínios
- Integração com testes dbt

## Trino + Apache Ranger

**Papel**: Acesso governado para dados sensíveis (row-level security, column masking).

| Aspecto | Detalhe |
|---------|---------|
| Trino | Query engine federada sobre PostgreSQL |
| Ranger | Políticas centralizadas de acesso |
| Caso de uso | Dados sensíveis (Siape/folha de pagamento) |
| Caminho | JupyterHub → Trino → PostgreSQL |

**Responsabilidades**:

- Row-level security (filtrar linhas por perfil do usuário)
- Column masking (ocultar colunas sensíveis)
- Audit log de acessos a dados restritos
- Centralizar políticas de acesso em um único ponto

!!! note "Quando usar Trino vs acesso direto"
    Superset e análises com dados públicos acessam PostgreSQL diretamente.
    Trino + Ranger é o caminho obrigatório apenas para dados sensíveis (pessoal, folha).

## Argo CD

**Papel**: Deploy GitOps de toda a infraestrutura.

| Aspecto | Detalhe |
|---------|---------|
| Padrão | App-of-Apps |
| Sync Waves | Negativa (DB/Storage) → 0 (Airflow) → 1+ (Superset/JupyterHub) |
| Ambientes | preprod, prod (overlays) |

**Responsabilidades**:

- Sincronizar estado do cluster com Git
- Deploy automático em push para main
- Rollback declarativo
- Detecção de drift
