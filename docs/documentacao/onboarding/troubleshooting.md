# Troubleshooting

Problemas comuns e soluções para o ambiente GovHub BR.

## Docker

### Containers não sobem

**Sintoma**: `docker compose up -d` falha ou containers reiniciam.

**Soluções**:

```bash
# Verificar logs
docker compose logs <service>

# Rebuild completo
docker compose down -v
docker compose build --no-cache
docker compose up -d

# Verificar espaço em disco
docker system df
docker system prune -a
```

### Portas em uso

**Sintoma**: "port already in use"

**Solução**:

```bash
# Identificar processo na porta
lsof -i :8080

# Matar processo
kill -9 <PID>
```

## Airflow

### DAG não aparece na UI

**Causas possíveis**:

1. Erro de sintaxe no Python
2. Arquivo fora de `airflow_lappis/dags/`
3. Import error

**Solução**:

```bash
# Testar DAG
docker compose exec airflow airflow dags list
docker compose exec airflow python /opt/airflow/dags/minha_dag.py
```

### Task falha com connection error

**Solução**: Verificar se a connection existe no Airflow:

1. UI → Admin → Connections
2. Verificar se `minio_default`, `postgres_default` existem

## dbt

### `dbt debug` falha

**Causa**: PostgreSQL não acessível ou credenciais erradas.

**Solução**:

```bash
# Verificar se PostgreSQL está rodando
docker compose ps postgres

# Testar conexão
psql -h localhost -p 5432 -U postgres_dw -d data_warehouse
```

### Model falha com "relation does not exist"

**Causa**: Source/upstream model não materializado.

**Solução**:

```bash
# Rodar dependências primeiro
dbt run --select +meu_model

# Ou full refresh
dbt run --full-refresh
```

## MinIO

### Upload falha com "Access Denied"

**Solução**: Verificar credenciais:

```bash
# Testar acesso
aws --endpoint-url http://localhost:9000 s3 ls \
    --profile minioadmin
```

## PostgreSQL

### Não consegue conectar

```bash
# Verificar se está rodando
docker compose ps postgres

# Testar conexão
psql -h localhost -p 5432 -U postgres_dw -d data_warehouse -c "SELECT 1;"
```

## Git

### Commit rejeitado (sem GPG)

```bash
# Verificar configuração
git config --global --get user.signingkey

# Se não configurado, ver Git Workflow
```

### Pre-commit falha

```bash
# Rodar lint manualmente
make lint

# Reformatar
black .
ruff check --fix .
```
