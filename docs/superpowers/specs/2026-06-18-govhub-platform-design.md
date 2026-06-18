# SDD — GovHub Platform

**Versão:** 1.0  
**Data:** 2026-06-18  
**Status:** Draft  
**Tipo:** Software Design Document (SDD)

---

## 1. Visão Geral

### 1.1 Propósito

O GovHub Platform é uma plataforma web de catálogo e hub de dados públicos. Ela consome a infraestrutura de dados existente do GovHub (Airflow, dbt, fontes de dados) e a expõe como um produto de dados navegável, documentado e visualizável por quatro perfis de usuários distintos.

### 1.2 Escopo

Esta especificação cobre a POC do GovHub Platform, composta por:

- Catálogo público de datasets com busca, metadados, query builder e download
- Integração com OpenMetadata (OPM) como fonte de verdade para metadados, lineage e dashboards
- Integração com Superset via Embedded SDK para visualização de dashboards
- Backend FastAPI + Frontend React (Next.js)
- Autenticação com quatro perfis de usuário

Fora do escopo desta POC: execução de queries na plataforma, ingestão de dados (responsabilidade da infraestrutura existente), interface de edição de metadados (feita diretamente no OPM).

### 1.3 Usuários

| Perfil | Descrição | Permissões |
|---|---|---|
| `citizen` | Cidadão geral | Leitura pública do catálogo, download, query builder |
| `researcher` | Jornalista / pesquisador | Igual ao citizen + datasets restritos marcados no OPM |
| `public_servant` | Servidor público / gestor | Igual ao researcher + cadastro e edição de conexões de fontes |
| `developer` | Desenvolvedor / técnico | Igual ao researcher + geração de API keys para acesso programático |

---

## 2. Arquitetura

### 2.1 Diagrama Geral

```
┌─────────────────────────────────────────────────────────┐
│                    GovHub Platform                       │
│                                                          │
│  ┌──────────────┐        ┌──────────────────────────┐   │
│  │  React SPA   │◄──────►│     FastAPI Backend       │   │
│  │  (Next.js)   │        │                          │   │
│  └──────────────┘        │  ┌────────────────────┐  │   │
│         │                │  │  Catalog Module    │  │   │
│         │ embed          │  │  Auth Module       │  │   │
│         ▼                │  │  Download Module   │  │   │
│  ┌──────────────┐        │  │  Query Builder     │  │   │
│  │   Superset   │        │  └────────────────────┘  │   │
│  │ (Embedded    │        │           │               │   │
│  │    SDK)      │        └───────────┼───────────────┘   │
│  └──────────────┘                    │                   │
└─────────────────────────────────────┼───────────────────┘
                                       │
              ┌───────────────────────┬┘
              │                       │
              ▼                       ▼
   ┌──────────────────┐    ┌──────────────────────┐
   │   OpenMetadata   │    │  GovHub DB (Postgres) │
   │  (metadados,     │    │  - conexões/fontes    │
   │   lineage,       │    │  - usuários/perfis    │
   │   dashboards,    │    │  - configs download   │
   │   permissões)    │    └──────────────────────┘
   └──────────────────┘
              │
              ▼
   ┌──────────────────────────────────┐
   │   Fontes de Dados                │
   │  (Postgres, Iceberg, Trino,      │
   │   DuckDB, Databricks...)         │
   └──────────────────────────────────┘
```

### 2.2 Princípios Arquiteturais

- **OpenMetadata como fonte de verdade:** Todo metadado (colunas, tipos, descrições, lineage, permissões de dado, dashboards vinculados) vive no OPM. O GovHub DB persiste apenas o que o OPM não cobre.
- **React nunca chama OPM ou Superset diretamente:** Todo tráfego passa pelo FastAPI, que centraliza autenticação, autorização e orquestração.
- **Motor de dados plugável:** O campo `engine` nas conexões de fonte permite suportar diferentes tecnologias de processamento sem mudanças na interface.

---

## 3. Componentes

### 3.1 Backend — FastAPI

#### 3.1.1 Auth Module

Responsável por autenticação e controle de perfis.

- Autenticação via JWT (access token + refresh token)
- Login por email/senha; cadastro com seleção de perfil (`citizen` ou `researcher`)
- Promoção para `public_servant` e `developer` via admin interno
- Geração e validação de API keys para o perfil `developer`
- Middleware de autorização por perfil em todos os endpoints protegidos

#### 3.1.2 Catalog Module

Interface entre o GovHub e o OpenMetadata.

Endpoints expostos:

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/datasets` | Listagem com busca e filtros (delega ao OPM) |
| `GET` | `/api/v1/datasets/:id` | Detalhe: docs, guia de uso, colunas (lê do OPM) |
| `GET` | `/api/v1/datasets/:id/lineage` | Grafo de lineage (lê do OPM) |
| `GET` | `/api/v1/datasets/:id/dashboards` | Dashboards vinculados (lê do OPM) |
| `POST` | `/api/v1/sources` | Cadastra nova fonte de dados (`public_servant`) |
| `PUT` | `/api/v1/sources/:id` | Edita conexão de fonte (`public_servant`) |
| `DELETE` | `/api/v1/sources/:id` | Remove fonte (`public_servant`) |

APIs do OPM consumidas:

- `GET /api/v1/tables` — listagem de datasets
- `GET /api/v1/tables/:id` — metadados de colunas
- `GET /api/v1/lineage/table/:id` — lineage
- `GET /api/v1/dashboards` — dashboards vinculados ao dataset
- `GET /api/v1/permissions/table/:id` — verificação de acesso por perfil
- `POST /api/v1/services/databaseServices` — registro de nova fonte

#### 3.1.3 Query Builder Module

Gera SQL a partir de colunas selecionadas pelo usuário.

- Recebe: `dataset_id`, lista de `column_names`, filtros opcionais
- Lê o tipo de `engine` da fonte registrada no GovHub DB
- Gera SQL dialeto-compatível (ANSI com variações por engine)
- Retorna apenas a string SQL — não executa

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/datasets/:id/query` | Gera SQL a partir das colunas selecionadas |

#### 3.1.4 Download Module

Conecta à fonte de dados, executa query e serializa o resultado.

- Lê credenciais de conexão do GovHub DB (criptografadas em repouso)
- Executa query completa ou filtrada no engine da fonte
- Serializa para Parquet (obrigatório) ou formatos opcionais configurados por dataset (CSV, JSON, XLSX)
- Retorna stream do arquivo via `StreamingResponse`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/datasets/:id/download` | Download do dataset no formato especificado |

### 3.2 Frontend — React (Next.js)

#### Página 1 — Home / Exploração (`/`)

- Busca full-text de datasets
- Filtros por tema, órgão responsável, formato de download disponível
- Listagem em cards: nome, descrição curta, órgão, formatos disponíveis
- SSR para indexação pelos motores de busca

#### Página 2 — Detalhe do Dataset (`/datasets/:id`)

Organizada em abas:

| Aba | Conteúdo | Fonte |
|---|---|---|
| Documentação | Descrição, contexto, órgão, período de cobertura | OPM via FastAPI |
| Guia de Uso | Instruções de consumo, exemplos de queries | OPM via FastAPI |
| Metadados | Tabela de colunas: nome, tipo, descrição, nullability | OPM via FastAPI |
| Query Builder | Seleção de colunas → SQL gerado; botão copiar | FastAPI |
| Download | Formatos disponíveis; botão dispara download | FastAPI |
| Lineage | Grafo visual de origem e transformações | OPM via FastAPI |
| Dashboards | Embed de dashboards Superset vinculados | Superset via FastAPI |

#### Página 3 — Admin de Fontes (`/admin/sources`) — `public_servant`

- CRUD de conexões de fontes de dados
- Campos: nome, tipo de engine, string de conexão, formatos de download habilitados
- Ao salvar, FastAPI registra a fonte no GovHub DB e no OPM

#### Página 4 — Perfil do Desenvolvedor (`/profile/developer`)

- Geração e revogação de API keys
- Documentação dos endpoints disponíveis para consumo programático

#### Página 5 — Autenticação (`/auth`)

- Login (email/senha) e cadastro (citizen/researcher)
- Autenticação via JWT com refresh token

---

## 4. Integrações

### 4.1 OpenMetadata

**Autenticação:** JWT de service account dedicado ao GovHub.  
**Comunicação:** API REST — o GovHub nunca acessa o banco do OPM diretamente.  
**Documentação dos datasets:** Feita pela equipe interna diretamente na UI do OPM. O GovHub apenas lê e exibe.

Fluxo de cadastro de nova fonte:
1. `public_servant` preenche formulário no GovHub
2. FastAPI salva credenciais de conexão no GovHub DB (criptografadas)
3. FastAPI registra o serviço no OPM via `POST /api/v1/services/databaseServices`
4. OPM passa a catalogar as tabelas dessa fonte

### 4.2 Superset

**Método:** Embedded SDK (`@superset-ui/embedded-sdk`)

Fluxo de embed:
1. Usuário acessa aba "Dashboards" de um dataset
2. React solicita guest token ao FastAPI (`GET /api/v1/datasets/:id/dashboards/:dashboard_id/embed-token`)
3. FastAPI consulta OPM para confirmar que o dashboard está vinculado ao dataset
4. FastAPI chama Superset (`POST /api/v1/security/guest_token/`) com as permissões do perfil do usuário
5. FastAPI retorna o guest token ao React
6. React usa o SDK para renderizar o dashboard — credenciais do Superset nunca chegam ao browser

---

## 5. Modelo de Dados (GovHub DB)

```sql
-- Usuários e autenticação
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile VARCHAR(20) NOT NULL CHECK (profile IN ('citizen','researcher','public_servant','developer')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys para desenvolvedores
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    label VARCHAR(100),
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conexões com fontes de dados
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    engine VARCHAR(50) NOT NULL CHECK (engine IN ('postgres','trino','duckdb','iceberg','databricks')),
    connection_string TEXT NOT NULL, -- criptografado em repouso
    opm_service_id VARCHAR(255),     -- ID do serviço registrado no OPM
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datasets: vínculo entre GovHub e OPM
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opm_table_id VARCHAR(255) UNIQUE NOT NULL, -- chave de vínculo com OPM
    data_source_id UUID REFERENCES data_sources(id),
    download_formats TEXT[] DEFAULT ARRAY['parquet'], -- formatos habilitados
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Nota:** Metadados de colunas, lineage, permissões de dado e dashboards vinculados são gerenciados inteiramente no OPM. O campo `opm_table_id` é o elo entre as duas plataformas.

---

## 6. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend | React + Next.js | SSR para SEO, ecossistema rico para UIs de dados |
| Backend | FastAPI (Python) | Familiar ao time de dados, async, OpenAPI automático |
| Banco de dados | PostgreSQL | Já usado na infraestrutura GovHub |
| Metadados / Governança | OpenMetadata | Já adotado na infraestrutura GovHub |
| BI / Dashboards | Apache Superset | Já adotado na infraestrutura GovHub |
| Auth | JWT (access + refresh) | Stateless, compatível com API keys |
| Download | PyArrow (Parquet), Pandas (outros formatos) | Ecossistema Python de dados |
| Embed Superset | `@superset-ui/embedded-sdk` | Oficial Superset, token-based |

---

## 7. Decisões de Design Registradas

| Decisão | Alternativa considerada | Justificativa |
|---|---|---|
| OPM como fonte de verdade para metadados | GovHub com DB próprio de metadados sincronizado | Elimina duplicação e risco de inconsistência |
| FastAPI para POC | Django+DRF (mais robusto) | Velocidade de desenvolvimento para POC; migração possível depois |
| Next.js com SSR | SPA pura | SEO necessário para datasets públicos indexáveis |
| Superset via Embedded SDK | iframe simples | Segurança: guest tokens por usuário, sem exposição de credenciais |
| Dashboards vinculados lidos do OPM | `superset_dashboard_ids` no GovHub DB | OPM já cataloga dashboards — evita duplicação |
| React nunca chama OPM/Superset diretamente | Frontend chamando OPM diretamente | Centraliza auth, autorização e rate limiting no backend |

---

## 8. Fora do Escopo (POC)

- Execução de queries na plataforma (query builder gera SQL apenas)
- Ingestão e transformação de dados (responsabilidade da infraestrutura Airflow/dbt)
- Interface de edição de metadados dentro do GovHub (feita no OPM)
- Notificações e alertas
- Internacionalização (i18n)
- Testes de carga e plano de escalabilidade
