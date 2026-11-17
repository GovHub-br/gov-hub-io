# Checklist: adicionar uma base nova

> Tipo: **Referência**

Consulta rápida para quem já fez as aulas do nível. Cada linha aponta para a aula que explica o porquê. Os exemplos usam a base de contratos do PNCP; troque `pncp` e `contratos` pelos nomes da sua fonte.

## 1. Os arquivos, na ordem

| Etapa | Arquivo | Aula |
|---|---|---|
| Issue | Fonte, porquê, o que a fonte mostrou, entrega | [Avaliar a fonte](../guias/engenharia-avaliar-fonte.md) |
| Cliente | `airflow_lappis/plugins/cliente_<fonte>.py` (método novo, se a fonte já tem cliente) | [O cliente](../tutoriais/engenharia-base-nova-cliente.md) |
| Teste do cliente | `tests/test_plugins/test_cliente_<fonte>.py`, para as falhas | [O cliente](../tutoriais/engenharia-base-nova-cliente.md) |
| Teste da DAG | `tests/dags/test_<fonte>_<entidade>_ingest_dag.py` | [A DAG](../tutoriais/engenharia-base-nova-dag.md) |
| DAG | `airflow_lappis/dags/data_ingest/<fonte>/<entidade>_ingest_dag.py` | [A DAG](../tutoriais/engenharia-base-nova-dag.md) |
| Fonte dbt | `models/sources.yml`, no projeto `airflow_lappis/dags/dbt/ipea/` | [O domínio no dbt](../tutoriais/engenharia-base-nova-dominio.md) |
| Domínio dbt | Bloco `<dominio>_dbt` em `dbt_project.yml` | [O domínio no dbt](../tutoriais/engenharia-base-nova-dominio.md) |
| Bronze | `models/<dominio>_dbt/bronze/schema.yml` (primeiro) e `<fonte>_<entidade>.sql` | [A bronze](../tutoriais/engenharia-base-nova-bronze.md) |
| Silver | `models/<dominio>_dbt/silver/schema.yml` e `.sql`, mais testes singulares em `tests/<fonte>/` | [A silver](../tutoriais/engenharia-base-nova-silver.md) |
| Gold | `models/<dominio>_dbt/gold/schema.yml` e `.sql`, mais os testes de grão e de reconciliação | [A gold](../tutoriais/engenharia-base-nova-gold.md) |
| PR | Descrição com comandos, evidências e impacto | [Abrir o PR](../guias/engenharia-contribuicao.md) |

## 2. Os comandos de cada etapa

| Quando | Comando | O que esperar |
|---|---|---|
| Sondar a fonte | `curl -s "<url>?...&pagina=1"` | Total de registros e de páginas; resposta para período vazio e para parâmetro errado |
| Teste do cliente | `poetry run pytest tests/test_plugins/test_cliente_<fonte>.py --no-cov` | Passa: as falhas da API levantam erro |
| Teste da DAG | `poetry run pytest tests/dags --no-cov` | `KeyError` antes da DAG existir; passa depois |
| Rodar a DAG | `airflow dags test <dag_id> <data> --conf '{...}'` | `Enviados: N | Gravados nesta carga: N` |
| Conferir a raw | `select count(*), count(distinct <chave>) from <fonte>.<tabela>` | As duas contagens iguais; a segunda execução não muda |
| Contar os testes | `dbt ls --select <modelo> --resource-type test` | O número que o `schema.yml` declara |
| Construir | `dbt build --select +<gold> --no-populate-cache` | Todos os modelos e testes verdes |
| Documentar | `dbt docs generate` | `catalog.json` em `target/` |
| Antes do PR | `poetry run pytest tests`, estilo nos arquivos novos, `git fetch` e `rebase` | Tudo verde nos arquivos que você alterou |

## 3. Convenções que o repositório espera

| Item | Convenção | Aula |
|---|---|---|
| Nome do schema da raw | O nome da fonte, em minúsculas (`pncp`) | [A DAG](../tutoriais/engenharia-base-nova-dag.md) |
| Schema do domínio dbt | Próprio, **diferente** do da raw (`pncp_dw`) | [O domínio no dbt](../tutoriais/engenharia-base-nova-dominio.md) |
| Nome do modelo | Único no projeto inteiro; prefixe com a fonte se precisar | [A bronze](../tutoriais/engenharia-base-nova-bronze.md) |
| Chave dos testes no `schema.yml` | `tests:` (funciona no dbt 1.7.13 e no 1.12) | [A bronze](../tutoriais/engenharia-base-nova-bronze.md) |
| Tipos | Raw tudo texto; a bronze converte, seguindo o formato **da fonte** | [A bronze](../tutoriais/engenharia-base-nova-bronze.md) |
| Bronze | Só renomeia e converte; nenhuma regra, nenhum filtro | [Camadas](../explicacao/engenharia-camadas.md) |
| Silver | Regras de população, junções e privacidade, com `left join` | [A silver](../tutoriais/engenharia-base-nova-silver.md) |
| Gold | Agrega; medidas aditivas; grão nomeado por tudo o que distingue as linhas | [A gold](../tutoriais/engenharia-base-nova-gold.md) |
| Permissões | Bronze sem leitura; silver e gold para `DB_DW_READONLY_ROLE` | [O domínio no dbt](../tutoriais/engenharia-base-nova-dominio.md) |
| Hora da carga | `dt_ingest`, hora de Brasília sem fuso; o bronze acrescenta `-03:00` | [A DAG](../tutoriais/engenharia-base-nova-dag.md) |
| Horário da DAG | `get_dynamic_schedule("<dag_id>")`; padrão `@daily` | [A DAG](../tutoriais/engenharia-base-nova-dag.md) |
| Configuração | Variables e Connections, nunca no código | [A DAG](../tutoriais/engenharia-base-nova-dag.md) |
| Commits e branch | Conventional Commits em minúsculas; `<tipo>/<descricao-curta>` | [Abrir o PR](../guias/engenharia-contribuicao.md) |
| Revisão | Label `team:*`; pelo menos uma aprovação; merge commit | [Abrir o PR](../guias/engenharia-contribuicao.md) |

## 4. Armadilhas encontradas ao construir esta base

Cada uma apareceu de verdade ao escrever o nível, e custa caro quando se descobre tarde.

| Armadilha | Sintoma | Defesa |
|---|---|---|
| `ClienteBase.request` com resposta `204` | `JSONDecodeError` | Usar `request_safe` e tratar `204` |
| `request_safe` não levanta exceção | Carga incompleta termina verde | O método olha o status e levanta `RuntimeError` |
| `data_tests:` no dbt 1.7.13 | 0 testes executados, sem aviso | Usar `tests:` e conferir com `dbt ls --resource-type test` |
| Nome de modelo repetido | `Compilation Error` por dois `schema.yml` | Prefixo da fonte |
| Schema do domínio igual ao da raw | A bronze **substitui** a tabela da DAG | Schema próprio (`pncp_dw`) |
| `schema.yml` sem modelo | Só um aviso `Did not find matching node` | Conferir a contagem de testes depois do build |
| `datetime.now()` no container | Hora UTC lida como Brasília: 3 horas à frente | Fixar o fuso na DAG |
| `parse_financial_value` em formato decimal com ponto | Valor multiplicado por 10 ou 100, sem erro | Usar `cast` quando o formato da fonte é `1234.56` |
| `int()` no CNPJ | Zeros à esquerda perdidos | Manter texto |
| `make dev` | Sobrescreve `airflow_variables`, sem a sua chave | Refazer a Variable depois |
| `inner join` na silver | Linhas somem sem que `unique` ou `not_null` reclamem | `left join` e `relationships`, mais a reconciliação |
| Regra de privacidade só por `tipo_pessoa` | Razão social de MEI (nome e CPF) passa | Segunda condição e teste, decididos pela equipe |
| `models_metadata` | Marca o projeto inteiro, não o modelo reconstruído | Usar `dt_ingest` para a frescura de uma tabela |

## 5. Quando o guia da aplicação e o código divergem

A aplicação tem um guia para agentes e pessoas, a skill `govhub-pipeline-guide` (em `.claude/skills/`), que descreve o mesmo caminho. É um bom roteiro, mas na revisão que este nível usou (`046bae8`) ele diverge do código em pontos que mudam o resultado. Em caso de dúvida, o código vence:

| O guia diz | O repositório tem |
|---|---|
| Testes em `tests/plugins/` e `tests/dags/` | `tests/test_plugins/`; a pasta `tests/dags/` não existia |
| Cliente com `requests` e `retry_on_exception` | `ClienteBase`, com `httpx`, e o `request_safe` |
| O projeto dbt pode ser `mir` ou `ipea` | Só existe `ipea` nesta revisão |
| Exemplos em `siconv_dbt` e `emendas_dbt` | Esses domínios não existem aqui |
| "O teste do `schema.yml` falha com *relation does not exist*" | O dbt 1.7 só **avisa** (`Did not find matching node for patch`) |
| Silver de exemplo com `inner join` e `where situacao = 'ATIVO'` | O padrão que esconde linhas, como a [aula de camadas](../explicacao/engenharia-camadas.md) mostrou |

Isso não invalida o guia: ele é útil como lista de etapas. A correção dele é uma boa contribuição.

## Veja também

- [O caminho de uma base nova, da issue ao painel](../explicacao/engenharia-base-nova.md)
- [Fontes e clientes do repositório](engenharia-fontes.md)
- [Comandos do dia a dia: Airflow, dbt e banco](engenharia-comandos.md)
