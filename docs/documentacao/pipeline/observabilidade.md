# Observabilidade dos pipelines de dados

Este documento define a estratégia de observabilidade para os pipelines de ingestão (Airflow) e transformação (dbt) do projeto. O objetivo é reduzir falhas silenciosas, diminuir o tempo de detecção e resolução de problemas (MTTR) e aumentar a confiabilidade operacional.

---

## Princípios

- **Falhas devem ser barulhentas.** Um pipeline que falha silenciosamente é pior do que um pipeline que não existe.
- **Observabilidade começa no código.** Logs estruturados e mensagens significativas são responsabilidade de quem escreve a DAG.
- **Alertas devem ser acionáveis.** Só alertar sobre algo se houver uma ação esperada para quem recebe o alerta.

---

## Padrão de logging existente

O projeto já adota um padrão consistente de logging nas DAGs. Ele deve ser seguido em todas as novas implementações.

### Convenções estabelecidas

**Prefixo com nome do arquivo em todas as mensagens:**

```python
logging.info("[nome_do_arquivo.py] Mensagem descritiva")
```

Isso permite filtrar logs por DAG mesmo em ambientes onde múltiplas DAGs rodam simultaneamente.

**Níveis de log por situação:**

| Situação | Nível | Exemplo |
|---|---|---|
| Início de operação | `INFO` | `"[deputados_ingest_dag.py] Iniciando extração de deputados"` |
| Progresso com volume | `INFO` | `"[deputados_ingest_dag.py] Inserindo 513 deputados no schema camara_deputados"` |
| Conclusão com total | `INFO` | `"[deputados_ingest_dag.py] Concluído. Total de 513 registros processados."` |
| Dado ausente / vazio | `WARNING` | `"[deputados_ingest_dag.py] Nenhum deputado encontrado"` |
| Tipo inesperado / dado inválido | `ERROR` | `"Esperava uma lista, mas recebi: <class 'dict'>"` |
| Detalhe de item individual | `DEBUG` | `"Filiação processada: Nome -> Partido (2020)"` |

**Informar volume processado:**

Sempre logar quantos registros foram processados antes e depois de operações críticas (deduplicação, inserção):

```python
logging.info(f"[dag.py] Total de {len(registros)} registros coletados da API.")
logging.info(f"[dag.py] Após deduplicação: {len(registros_unicos)} registros únicos.")
logging.info(f"[dag.py] Inserindo {len(registros_unicos)} registros no schema X.")
```

**Falhar explicitamente em estados inesperados:**

Quando a DAG recebe dados em formato inesperado, registre o contexto e levante
uma exceção. Apenas retornar pode marcar a task como bem-sucedida e esconder a
falha.

```python
if not lista or not isinstance(lista, list):
    logging.error(f"Esperava uma lista, mas recebi: {type(lista)}")
    raise TypeError(f"Resposta inválida: {type(lista)}")
```

**Usar DEBUG para detalhes de iteração:**

Logs de itens individuais dentro de loops devem usar `DEBUG` para não poluir os logs em execuções normais:

```python
logging.debug(f"[dag.py] Item processado: {nome} -> {valor}")
```

---

## Múltiplas conexões PostgreSQL

O projeto usa conexões nomeadas distintas por domínio. Sempre especificar o `conn_id` correto ao chamar `get_postgres_conn()`:

| Conn ID | Domínio |
|---|---|
| `postgres_default` | Dados gerais / IPEA |
| `postgres_mir` | Dados do MIR (parlamentares, emendas, transferências) |

Usar a conexão errada não gera erro imediato mas insere dados no banco errado. Sempre verificar qual `conn_id` o domínio usa antes de implementar uma nova DAG.

---

## Métricas a monitorar

### Airflow (por DAG)

| Métrica | Descrição | Threshold de atenção |
|---|---|---|
| Duração da execução | Tempo total da DAG run | Desvio > 50% da média histórica |
| Taxa de falha | % de runs com status `failed` | > 0% em DAGs críticas |
| Número de retries | Reexecuções de uma task | > 1 por execução |
| Volume processado | Registros ingeridos por execução | Queda > 30% em relação à média |

### dbt (por execução)

| Métrica | Descrição |
|---|---|
| Testes com falha | Modelos com `not_null`, `unique`, etc. quebrados |
| Tempo de execução por modelo | Identificar modelos ficando mais lentos |
| Freshness das sources | Tabelas de origem desatualizadas além do esperado |

---

## Alertas

O projeto ainda não tem callbacks de falha implementados nas DAGs. A implementação é recomendada para DAGs críticas usando `on_failure_callback` nos `default_args`:

```python
import logging
from datetime import datetime, timedelta

def alertar_falha(context):
    dag_id = context["dag"].dag_id
    task_id = context["task_instance"].task_id
    execution_date = context["execution_date"]
    logging.error(
        f"[FALHA] dag_id={dag_id} task_id={task_id} execution_date={execution_date}"
    )
    # implementar notificação via webhook, Slack, e-mail, etc.

default_args = {
    "owner": "nome-do-responsavel",
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
    "on_failure_callback": alertar_falha,
}
```

### O que deve gerar alerta

**Crítico (resposta imediata):**
- Falha de DAG de ingestão principal (siafi, siape, compras_gov, transfere_gov)
- Quebra de teste dbt em modelo gold
- DAG não executada no schedule esperado

**Atenção (resposta no dia):**
- Retries acima do normal em qualquer DAG
- Queda significativa no volume ingerido
- Falha de teste dbt em modelo silver
- Tempo de execução muito acima da média

**Informativo (sem ação imediata):**
- Conclusão bem-sucedida de DAGs de longa duração
- Relatório diário de execuções

### Canais de alerta

O cliente IMAP em `airflow_lappis/plugins/cliente_email.py` é usado para
ingestão de anexos e não envia alertas. Notificações por e-mail exigem SMTP ou
outro provedor configurado no Airflow, com credenciais armazenadas no mecanismo
de secrets do ambiente.

Outras opções a avaliar com o time: Slack, Discord, webhooks.

---

## Ferramentas avaliadas

| Ferramenta | Papel | Status |
|---|---|---|
| **Airflow Metrics** | Métricas nativas de DAGs e tasks | Disponível nativamente |
| **Prometheus** | Coleta e armazenamento de métricas | A avaliar |
| **Grafana** | Dashboards de observabilidade | A avaliar |
| **OpenTelemetry** | Rastreamento distribuído | A avaliar |
| **Sentry** | Rastreamento de erros e exceções | A avaliar |

A decisão de quais ferramentas adotar deve ser validada com a equipe de infraestrutura antes da implementação.

---

## Critérios de aceitação

- [ ] Padrão de logging adotado em todas as novas DAGs
- [ ] `on_failure_callback` implementado nas DAGs críticas
- [ ] Canais de alerta definidos e configurados pela equipe
- [ ] Ferramentas de monitoramento selecionadas e integradas
