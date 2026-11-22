# Validar e entregar uma camada confiável

> Tipo: **Guia**

## Objetivo

Fechar o nível com uma revisão antes da entrega. Um `dbt run` bem-sucedido prova que o processamento terminou; não prova que a tabela responde à pergunta. Antes de entregar uma tabela ao Superset, ela precisa passar por algumas perguntas, e cada uma retoma o que você viu nas aulas anteriores.

![A validação em cinco etapas: conferir identidade e cobertura, reconciliar os totais com a entrada, testar os casos da especificação, conferir o acesso com a conta de consumo e documentar a entrega no Superset. Quando a reconciliação ou os casos falham, o caminho volta para a camada responsável, que é corrigida, e a validação recomeça pelos testes.](../../assets/diagramas/engenharia-validacao-entrega.png)

## A lista de entrega

| Pergunta | Como conferir | Onde você viu |
|---|---|---|
| Cada linha é o que a especificação diz? | Linhas = valores distintos da chave = registros esperados da entrada | [Granularidade](../explicacao/engenharia-granularidade.md) |
| Os totais fecham com a entrada? | Toda diferença entre a entrega e a entrada tem uma explicação escrita | [Planejar a entrega](../explicacao/engenharia-planejamento-modelos.md) |
| Os casos da especificação dão o resultado esperado? | Uma consulta compara cada exemplo com a tabela e devolve só as divergências | [Planejar a entrega](../explicacao/engenharia-planejamento-modelos.md) |
| Cada regra está num lugar só, na camada certa? | Nenhuma regra de população repetida em várias golds; nenhuma correção de formato fora da bronze | [Camadas](../explicacao/engenharia-camadas.md) e [Onde mora cada regra](../explicacao/engenharia-modelos-reutilizaveis.md) |
| As medidas podem ser agregadas como o painel vai agregar? | Medidas aditivas na tabela; percentuais calculados no gráfico | [Granularidade](../explicacao/engenharia-granularidade.md) |
| A atualização não duplica nem perde o que importa? | Chave sem medidas; histórico guardado quando a pergunta exige | [Histórico](../explicacao/engenharia-historico.md) |
| A conta de consumo lê só o que deve? | `USAGE` no schema e `SELECT` só nas tabelas de entrega | Nesta aula |
| A descrição diz o que a linha é e o que a ausência significa? | Descrição do modelo com granularidade, população e significado dos nulos | Nesta aula |

## Na base de estudo: a reconciliação encontra o contrato 104

Nas aulas anteriores, a gold de estudo ficou com uma diferença em relação à especificação, e foi dito que um teste a encontraria. É a segunda pergunta da lista: os totais fecham com a entrada?

```sql
with bronze as (
    select sum(despesas_pagas) as pago from estudo_modelagem.bronze_empenhos
), sem_contrato as (
    select coalesce(sum(despesas_pagas), 0) as pago
    from estudo_modelagem.bronze_empenhos
    where contrato_id is null
), gold as (
    select coalesce(sum(despesas_pagas), 0) as pago from estudo_modelagem.gold_contratos_resumo
)
select bronze.pago as pago_na_bronze,
       sem_contrato.pago as sem_contrato,
       gold.pago as pago_na_gold,
       bronze.pago - sem_contrato.pago - gold.pago as diferenca_sem_explicacao
from bronze, sem_contrato, gold;
```

```text
 pago_na_bronze | sem_contrato | pago_na_gold | diferenca_sem_explicacao
----------------+--------------+--------------+--------------------------
      117750.50 |      7250.00 |     95500.50 |                 15000.00
```

Os 7.250,00 do empenho sem contrato estão previstos na especificação. Os 15.000,00 restantes, não: são o pagamento do contrato 104, que é inativo. O filtro `situacao = 'Ativo'` da silver, copiado do modelo real, tira os inativos da associação com empenhos, e a gold, que lista todos os contratos, recebe o 104 sem pagamento.

Reconciliar não é exigir que os números sejam iguais; é exigir que **toda diferença tenha explicação**. Esta não tinha, e a correção vai para a camada responsável: retirar o filtro da silver. Com isso, a diferença sem explicação vai a zero.

A correção traz uma lição a mais. Com o pagamento de volta, o 104 (inativo e pago por inteiro) passa a aparecer como `pendente_baixa = 'Sim'`, porque a gold usa a regra do modelo real, "pago igual ao global". Antes, ele dava "Não" por acaso, sem pagamento. O teste dos casos da especificação pega a divergência, e a regra da gold passa a exigir também `c.situacao = 'Ativo'`. **Corrigir uma camada pode mudar o resultado de outra regra: rode todos os testes depois de cada correção.**

**No projeto real**, a silver `contratos_empenhos` tem o mesmo filtro, e a gold `contratos_resumo` lista todos os contratos. Num banco local verificado em novembro de 2026, nenhum contrato inativo tinha `despesas_pagas` preenchido, embora a descrição da coluna diga "Valor total já pago do contrato conforme registros do SIAFI". Pode ser intencional mostrar pagamentos só de contratos ativos, mas regra e descrição precisam dizer a mesma coisa. É uma decisão para a área responsável, e a reconciliação é o que a tornou visível.

## A conta de consumo lê só o que deve

O Superset não lê o banco com a conta de administração, e sim com uma role de leitura. No PostgreSQL, ela precisa de duas permissões diferentes:

| Permissão | O que libera | Sem ela |
|---|---|---|
| `USAGE` no schema | Entrar no schema | A consulta falha com `permission denied for schema` |
| `SELECT` na tabela | Ler aquela tabela | O schema abre, mas a leitura da tabela é negada |

No projeto, a role se chama `de_postgres` (ou o nome em `DB_DW_READONLY_ROLE`). O `dbt_project.yml` concede `SELECT` nas pastas silver e gold e nenhum na bronze, e a macro `conceder_usage_dinamico` concede `USAGE` nos schemas que o dbt gerencia. Para conferir:

```sql
select has_schema_privilege('de_postgres', 'contratos', 'USAGE') as usa_schema,
       has_table_privilege('de_postgres', 'contratos.contratos_resumo', 'SELECT') as le_gold,
       has_table_privilege('de_postgres', 'contratos.contratos', 'SELECT') as le_bronze;
```

Pela configuração, o esperado é `t`, `t` e `f`. Se a role não existir no seu ambiente, rode `make setup-roles` na raiz da aplicação e execute os modelos de novo. A camada da tabela não decide sozinha o que pode ser exposto: uma silver com CPF continua sendo dado pessoal, assunto da [prática da silver](../tutoriais/engenharia-base-nova-silver.md), no nível 5, que protege o CPF de fornecedores pessoa física.

## A descrição acompanha a tabela

A descrição do modelo é a especificação que fica junto do código. Para a gold de estudo, ela seria:

```yaml
- name: gold_contratos_resumo
  description: >
    Uma linha por contrato do ComprasGov, ativo ou inativo, com o valor global
    e o valor pago pelos empenhos associados a ele.
    despesas_pagas nulo significa que nenhum empenho foi associado ao contrato,
    e não que nada foi pago. Empenhos sem contrato não entram nesta tabela;
    eles aparecem na reconciliação com a bronze de empenhos.
    pendente_baixa é 'Sim' quando o contrato está ativo e o valor pago é igual
    ao valor global.
```

No Superset, defina as métricas a partir da granularidade: `sum(valor_global)` e `sum(despesas_pagas)` podem ser somados, porque há uma linha por contrato; o percentual pago é `sum(despesas_pagas) / sum(valor_global)`, nunca a média dos percentuais. O guia [Documentar a tabela e conferir o que o consumo enxerga](engenharia-metadados.md), no nível 5, confere esse caminho, e a construção do painel é assunto da trilha de [Dashboards no Gov Hub](../../mapa.html?trilha=dashboards).

Os testes da primeira pergunta da lista também ficam no código. A gold real `contratos_resumo` não tem testes declarados na revisão atual; a proposta é acrescentar `not_null` e `unique` à coluna `contrato_id` no `schema.yml` e executar `dbt test --select contratos_resumo`.

## Casos reais: regra, descrição e permissões mudam juntas

O [commit cea6962, de 08/10/2026](https://github.com/GovHub-br/data-application-gov-hub/commit/cea6962baf7a7ab146ae10cae06f5c3220bd592c), excluiu os servidores desligados das contagens de `kpis_servidores` e, no mesmo commit, acrescentou à descrição do modelo que "servidores desligados não são contados". Regra e descrição mudaram juntas, que é o que faltou no caso do valor pago dos contratos inativos.

O [commit 6238c36, de 18/08/2026](https://github.com/GovHub-br/data-application-gov-hub/commit/6238c36ba24bd2cdbb080be13d63ad796af9335e), criou o controle de acesso de leitura: as concessões por pasta e a [macro de `USAGE`](https://github.com/GovHub-br/data-application-gov-hub/blob/046bae840132cd17e6ba55a7ff9c942105f59927/airflow_lappis/dags/dbt/ipea/macros/conceder_usage_dinamico.sql), cujo comentário explica a divisão entre entrar no schema e ler cada tabela.

## Pronto

A entrega está pronta quando cada pergunta da lista tem uma resposta que alguém pode conferir: uma consulta, um teste ou uma linha da descrição. No próximo nível, o foco passa a alimentar, automatizar e operar esse percurso.

## Confira o que entendeu

1. A gold soma 1,2 milhão pagos e a bronze de empenhos soma 1,25 milhão. A diferença é um erro?
2. Depois de corrigir a silver, o contrato 104 passou a aparecer como pendente de baixa. O que esse episódio ensina?

## Respostas comentadas

1. Depende. Cada parcela dos 50 mil precisa de explicação prevista na especificação, como pagamentos sem contrato. Se tudo estiver explicado, não é erro; uma parcela sem explicação é.
2. Que os testes rodam depois de cada correção, e todos eles. Uma regra que dava o resultado certo por acaso passou a errar quando outra camada foi corrigida.

## Veja também

- [Posição atual e histórico: reconstrução, incremental e snapshot](../explicacao/engenharia-historico.md)
- [Ingestão: trazer o dado da fonte para o banco](../explicacao/engenharia-ingestao.md)
