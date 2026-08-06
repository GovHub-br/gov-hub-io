# Gerenciamento de Secrets

Gestão de credenciais e certificados no GovHub BR.

## Princípios

- **Nunca** commitar credenciais no repositório
- Secrets criados via `kubectl` ou gerenciadores externos
- Certificados digitais (SIAFI/SIAPE) são críticos e tratados separadamente
- Acesso por ambiente (preprod/prod) — consultar equipe de infra

## Criação de Secrets

### Via kubectl

```bash
kubectl -n <namespace> create secret generic <secret-name> \
    --from-literal=username=<user> \
    --from-literal=password=<pass>
```

### Via arquivo

```bash
kubectl -n airflow create secret generic siape-cert \
    --from-file=cert.pem=./certificado.pem \
    --from-file=key.pem=./chave.pem
```

## Secrets por Componente

### Airflow

| Secret | Namespace | Uso |
|--------|-----------|-----|
| `airflow-db` | airflow | Conexão PostgreSQL do Airflow |
| `minio-credentials` | airflow | Acesso ao MinIO |
| `siape-cert` | airflow | Certificado Siape |
| `siafi-cert` | airflow | Certificado Siafi |
| `transferegov-api-key` | airflow | API Key TransfereGov |

### PostgreSQL

| Secret | Namespace | Uso |
|--------|-----------|-----|
| `postgres-credentials` | postgres | User/password do banco |

### Superset

| Secret | Namespace | Uso |
|--------|-----------|-----|
| `superset-secret-key` | superset | Flask SECRET_KEY |
| `superset-db` | superset | Conexão PostgreSQL |

### MinIO

| Secret | Namespace | Uso |
|--------|-----------|-----|
| `minio-root-credentials` | minio | Root access/secret key |

## Certificados Digitais

Certificados para acesso a sistemas governamentais (Siape, Siafi):

- Formato: PEM (certificado + chave privada)
- Validade: Verificar periodicamente
- Renovação: Processo manual junto ao órgão emissor
- Storage: Kubernetes Secrets (nunca em Git)

!!! warning "Crítico"
    Os nomes das secrets e chaves esperadas constam nos READMEs de Airflow
    e JupyterHub no repo `continuous-deployment`. Consulte antes de fazer deploy.

## Ambiente Local

Para desenvolvimento local, os valores padrão ficam em `local.env` e são
copiados para `.env` pelo `make setup`:

```yaml
environment:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  POSTGRES_USER_DW: postgres_dw
  POSTGRES_PASSWORD_DW: postgres_dw
  POSTGRES_DB_DW: data_warehouse
```

!!! note
    Credenciais locais são apenas para desenvolvimento. Nunca usar em produção.

## Boas Práticas

1. Rotacionar secrets periodicamente
2. Usar least-privilege para service accounts
3. Auditar acessos via logs do cluster
4. Considerar Sealed Secrets ou External Secrets Operator para automação
