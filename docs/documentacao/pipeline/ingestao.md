# Ingestão de Dados

Esta página resume como as fontes governamentais entram no pipeline do GovHub BR. A fonte de verdade do código atual é o repositório `gov-hub`, especialmente `airflow/dags/data_ingest/`, `airflow/plugins/` e `airflow/helpers/`.

## Organização por origem

```text
airflow/dags/data_ingest/
  compras_gov/
```

Os clientes de API e integrações ficam em `airflow/plugins/`, por exemplo `cliente_compras_gov.py`, `cliente_postgres.py`, `cliente_storage.py`, `cliente_superset.py` e `cliente_email.py`.

## Fontes documentadas

| Origem | Caminho principal | Observação |
| --- | --- | --- |
| ComprasGov | `data_ingest/compras_gov/` | contratações, contratos, itens, fornecedores, órgãos, UASGs, catálogo e pesquisa de preços |

## Fluxo comum

Nem toda DAG segue exatamente os mesmos passos, mas o desenho recorrente é:

1. Ler configuração do Airflow e parâmetros do intervalo de execução.
2. Chamar cliente de API, arquivo, e-mail ou banco externo em `plugins/`.
3. Validar retorno e registrar logs com volume processado.
4. Persistir dados na landing zone ou no PostgreSQL, conforme o contrato da DAG.
5. Quando necessário, disparar DAGs dependentes ou deixar o Cosmos/dbt transformar as camadas analíticas.

## Configuração por órgão

O desenvolvimento local pode usar variáveis do Airflow para parametrizar escopos de execução, como órgãos, domínios e schedules.

```json
{
  "mgi": {
    "codigos_orgao": ["26000"]
  }
}
```

Essas variáveis devem ser configuradas pelo setup local ou pelo ambiente de execução antes da DAG depender delas.

## Persistência

Quando a DAG persistir dados no PostgreSQL, use os helpers e clientes compartilhados:

```python
from postgres_helpers import get_postgres_conn
from cliente_postgres import ClientPostgresDB

db = ClientPostgresDB(get_postgres_conn())
```

Quando a DAG pertencer a um domínio com conexão própria, passe o `conn_id` explicitamente.

## Dados sensíveis

Fontes como SIAPE e SIAFI podem conter dados pessoais, financeiros ou funcionais sensíveis. Para essas fontes:

- não incluir dados reais em exemplos, fixtures ou prints;
- evitar logs com identificadores pessoais;
- documentar restrições de acesso;
- consultar [Segurança](../governanca/seguranca.md) e [Controle de Acesso](../governanca/acesso.md) antes de expor modelos finais.

## Checklist para nova ingestão

- [ ] Pasta correta em `data_ingest/<origem>/`
- [ ] Cliente reutilizado ou criado em `plugins/cliente_<origem>.py`
- [ ] Helper existente reaproveitado quando aplicável
- [ ] Schedule via `get_dynamic_schedule()`
- [ ] Variáveis obrigatórias validadas antes do uso
- [ ] Conexão PostgreSQL via `get_postgres_conn()`
- [ ] Logs com início, volume processado, destino e conclusão
- [ ] Tratamento de retorno vazio ou formato inesperado
- [ ] Teste local com `airflow dags test`
- [ ] Documentação/dbt atualizados quando a mudança criar novo dado analítico
