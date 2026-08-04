# Gerenciamento de Secrets

Gestão de credenciais e certificados no GovHub BR.

## Princípios

- **Nunca** commitar credenciais no repositório
- Secrets criados via `kubectl` ou gerenciadores externos
- Certificados digitais (SIAFI/SIAPE) são críticos e tratados separadamente
- Acesso por ambiente (preprod/prod) — consultar equipe de infra


## Onde encontrar configurações sensíveis

Nem toda configuração sensível fica no mesmo lugar. Antes de alterar uma DAG ou investigar erro de credencial, identifique o tipo da configuração:

| Tipo | Onde procurar | Quando usar |
| --- | --- | --- |
| Airflow Variables | Airflow UI em Admin > Variables; localmente, alvo `make dev` do `data-application-gov-hub` | Parâmetros de execução, órgão alvo, schedules e configurações por fonte. |
| Airflow Connections | Airflow UI em Admin > Connections; localmente, importação feita pelo `Makefile` | Dados de conexão com bancos, APIs e serviços externos. |
| Kubernetes Secrets | Namespace do componente no cluster | Credenciais reais de ambientes compartilhados, staging ou produção. |
| GitHub Actions Secrets | Settings > Secrets and variables > Actions no repositório | Tokens e credenciais usados por workflows de CI/CD. |
| Arquivos locais `.env` | Criados a partir de `local.env` no desenvolvimento | Apenas valores de desenvolvimento local. |

Para Airflow, use esta regra simples:

- **Variable**: configuração lida pela DAG como parâmetro, por exemplo `airflow_orgao`, `airflow_variables` e `dynamic_schedules`.
- **Connection**: credencial estruturada de acesso a serviço, por exemplo `postgres_default`.
- **Secret do ambiente**: valor sensível real usado por produção, como senha, token, certificado ou chave privada.

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

Para desenvolvimento local, os valores padrão ficam em `local.env` e são copiados para `.env` pelo `make setup`. O `make dev` também configura as Airflow Variables e importa a connection `postgres_default` no Airflow local.

```yaml
environment:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  POSTGRES_USER_DW: postgres_dw
  POSTGRES_PASSWORD_DW: postgres_dw
  POSTGRES_DB_DW: data_warehouse
```

Validação local:

```bash
make dev-check

docker compose exec airflow airflow variables list
docker compose exec airflow airflow connections get postgres_default
```

!!! note
    Credenciais locais são apenas para desenvolvimento. Nunca usar em produção.

## Boas Práticas

1. Rotacionar secrets periodicamente
2. Usar least-privilege para service accounts
3. Auditar acessos via logs do cluster
4. Considerar Sealed Secrets ou External Secrets Operator para automação
