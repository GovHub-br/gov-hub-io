# Ingestão de Dados

Esta página resume como as fontes governamentais entram no pipeline do GovHub BR. A fonte de verdade do código é o repositório `data-application-gov-hub`, especialmente `airflow_lappis/dags/data_ingest/`, `airflow_lappis/plugins/` e `airflow_lappis/helpers/`.

## Organização por origem

```text
airflow_lappis/dags/data_ingest/
  compras_gov/
  dados_abertos/
  ibge/
  ipea_pro/
  pncp/
  sgac/
  siafi/
  siape/
  siconv/
  siorg/
  sisbolsas/
  tesouro_gerencial/
  transfere_gov/
  transferegov_emendas/
```

Os clientes de API e integrações ficam em `airflow_lappis/plugins/`, por exemplo `cliente_contratos.py`, `cliente_siafi.py`, `cliente_siape.py`, `cliente_siorg.py`, `cliente_pncp.py` e `cliente_postgres.py`.

## Fontes documentadas

| Origem | Caminho principal | Observação |
| --- | --- | --- |
| ComprasGov | `data_ingest/compras_gov/` | contratos, faturas, empenhos, cronogramas e terceirizados |
| SIAFI | `data_ingest/siafi/` e `data_ingest/tesouro_gerencial/` | notas, empenhos e arquivos do Tesouro Gerencial |
| SIAPE | `data_ingest/siape/` | dados de pessoal; exige cuidado com dados sensíveis |
| SIORG | `data_ingest/siorg/` | estrutura organizacional, unidades, cargos e funções |
| TransfereGov | `data_ingest/transfere_gov/` | programas, planos de ação e programação financeira |
| TransfereGov Emendas | `data_ingest/transferegov_emendas/` | recortes específicos de emendas e planos especiais |
| PNCP | `data_ingest/pncp/` | licitações e itens/resultados |
| Dados Abertos Legislativo | `data_ingest/dados_abertos/` | deputados, senadores, partidos e histórico parlamentar |
| IBGE | `data_ingest/ibge/` | recortes específicos usados pelo projeto |
| SisBolsas, SGAC, Ipea Pro | pastas dedicadas | integrações institucionais específicas |

## Fluxo comum

Nem toda DAG segue exatamente os mesmos passos, mas o desenho recorrente é:

1. Ler configuração do Airflow (`airflow_orgao`, `airflow_variables`, `dynamic_schedules`).
2. Chamar cliente de API, arquivo, e-mail ou banco externo em `plugins/`.
3. Validar retorno e registrar logs com volume processado.
4. Inserir ou atualizar dados no PostgreSQL via `ClientPostgresDB`.
5. Quando necessário, disparar DAGs dependentes ou deixar o Cosmos/dbt transformar as camadas analíticas.

## Configuração por órgão

O desenvolvimento local usa `airflow_orgao` para selecionar o órgão alvo e `airflow_variables` para mapear parâmetros por órgão, como códigos de UG.

```json
{
  "ipea": {
    "codigos_ug": [113601, 113602]
  },
  "unb": {
    "codigos_ug": [154040]
  }
}
```

Essas variáveis são configuradas pelo `make dev` no ambiente local.

## Persistência

O padrão atual usa PostgreSQL como destino principal das tabelas ingeridas. Use sempre:

```python
from postgres_helpers import get_postgres_conn
from cliente_postgres import ClientPostgresDB

db = ClientPostgresDB(get_postgres_conn())
```

Quando a DAG pertencer a um domínio com conexão própria, passe o `conn_id` explicitamente, como `get_postgres_conn("postgres_mir")`.

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
