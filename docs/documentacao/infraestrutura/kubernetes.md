# Kubernetes

Referência de organização Kubernetes para os serviços do GovHub BR.

## Visão Geral

Os manifests do projeto descrevem componentes como Airflow, MinIO, PostgreSQL, Superset e JupyterHub para execução como workloads Kubernetes, gerenciados via Argo CD (GitOps). Antes de operar um ambiente específico, confirme quais componentes estão habilitados no cluster alvo.

## Namespaces

| Namespace | Componentes |
|-----------|-------------|
| `argocd` | Argo CD (controle GitOps) |
| `airflow` | Scheduler, Webserver, Workers |
| `minio` | MinIO (object storage) |
| `postgres` | PostgreSQL (metastore/analytics) |
| `superset` | Apache Superset |
| `jupyterhub` | JupyterHub |
| `trino` | Trino + Ranger (acesso governado, quando habilitado) |

## Pré-requisitos

- Acesso ao cluster (`kubeconfig`)
- `kubectl`, `helm` e (opcional) `argocd` CLI instalados
- Acesso à VPN quando exigido pelo ambiente
- Secrets criados antes do deploy (ver cada componente)

## Comandos Úteis

```bash
# Verificar status dos pods
kubectl get pods -A

# Logs de um pod
kubectl logs -n airflow <pod-name>

# Port-forward para acesso local
kubectl port-forward -n superset svc/superset 8088:8088

# Verificar recursos
kubectl top pods -A
```

## Ambientes

| Ambiente | Descrição | Overlay |
|----------|-----------|---------|
| Pré-produção | Validação, testes de integração | `values.preprod.yaml` |
| Produção | Ambiente oficial | `values.prod.yaml` |

## Repositório

Manifests e configurações em: [`continuous-deployment`](https://github.com/GovHub-br/continuous-deployment)

```
continuous-deployment/
├── airflow/
├── app-of-apps/
├── argocd/
├── jupyterhub/
├── minio/
├── postgres/
├── superset/
└── README.md
```
