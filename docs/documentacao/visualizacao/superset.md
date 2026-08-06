# Apache Superset

Plataforma de BI e visualização de dados do GovHub BR.

## Papel na Arquitetura

Superset conecta ao PostgreSQL (camada Gold) para fornecer dashboards interativos a gestores públicos e sociedade civil.

## Acesso

| Ambiente | URL | Credenciais |
|----------|-----|-------------|
| Local | `http://localhost:8088` | admin / admin |
| Produção | Via VPN (consultar equipe) | SSO |

## Datasets

Conectados ao schema `gold` do PostgreSQL:

| Dataset | Tabela | Uso |
|---------|--------|-----|
| Transferências | `gold.fato_transferencias` | Painel de convênios |
| Servidores | `gold.fato_servidores` | Indicadores de pessoal |
| Compras | `gold.fato_compras` | Métricas de compras |
| Órgãos | `gold.dim_orgaos` | Filtros e dimensões |

## Dashboards

| Dashboard | Público | Descrição |
|-----------|---------|-----------|
| Transferências Gov | Gestores | Convênios por órgão, valores, tendências |
| Indicadores de Pessoal | RH | Servidores por carreira, distribuição |
| Compras Públicas | Gestores | Contratos, licitações, fornecedores |
| Visão Geral | Todos | Resumo executivo multi-domínio |

## Configuração de Database

```
Database Name: GovHub Analytics
SQLAlchemy URI: postgresql://postgres_dw:<password>@postgres:5432/data_warehouse
```

## Permissões

| Role | Acesso |
|------|--------|
| Admin | Tudo (criar datasets, dashboards) |
| Alpha | Criar charts, explorar dados |
| Gamma | Visualizar dashboards compartilhados |
| Public | Dashboards públicos (se habilitado) |

## Deploy

Gerenciado via Argo CD:

```
continuous-deployment/
└── superset/
    ├── values.yaml
    └── values.prod.yaml
```

## Referências

- [Superset Docs](https://superset.apache.org/docs/intro)
- [Creating Charts](https://superset.apache.org/docs/creating-charts-dashboards/creating-your-first-dashboard)
