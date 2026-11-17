# Desafio: uma base nova de ponta a ponta

> Tipo: **Desafio**

## O desafio

Nas aulas, você construiu os contratos do Ipea passo a passo. Agora a base precisa provar que **funciona sem você ao lado**: com outros dados, em outra escala, com os casos que a amostra do Ipea não tinha. O desafio tem duas partes, e a segunda é a que mais ensina.

1. **Rodar o mesmo percurso para outro órgão**, o Ministério da Justiça, e conferir os números que o percurso deve produzir.
2. **Corrigir o que esse órgão revela**: uma brecha real na regra de privacidade, e as melhorias que ela pede.

No fim, você entrega o que entregaria numa contribuição real: código, testes, descrição de PR e as evidências de que cada afirmação se repete.

![As duas partes do desafio e o que cada uma entrega. A parte um troca o órgão na configuração, coleta 404 contratos do Ministério da Justiça de junho de 2026, constrói a cadeia e confere os números esperados. A parte dois usa o que a conferência revelou: dois fornecedores pessoa jurídica com razão social terminada em onze dígitos, o padrão de microempreendedor individual, que a regra atual deixa passar. A entrega reúne a correção, o teste novo e a descrição do PR.](../../assets/diagramas/engenharia-base-nova-desafio.png)

## Antes de começar

- As aulas do nível concluídas, com a cadeia do Ipea funcionando e `dbt build` verde.
- O terminal do dbt e do Airflow como nas práticas.
- Uma branch nova para o desafio (`git checkout -b feat/pncp-contratos-desafio`). Nada daqui precisa ir ao GitHub.

## Parte 1: o mesmo percurso, outro órgão

A DAG lê o CNPJ do órgão em `airflow_variables`. Para outro órgão, a mudança é de **configuração**, e não de código. Acrescente à Variable uma entrada para o Ministério da Justiça e aponte `airflow_orgao` para ela:

```json
{"ipea": {"codigos_ug": [113601, 113602], "orgao_pncp": "33892175000100"},
 "mj": {"orgao_pncp": "00394494000136"}}
```

<!-- explica: Troca o órgão ativo do ambiente para `mj`. As DAGs que leem a Variable `airflow_orgao` passam a buscar em `airflow_variables` a configuração do Ministério da Justiça. -->

```bash
docker compose exec airflow airflow variables set airflow_orgao mj
```

O CNPJ do Ministério começa com zeros. Como o JSON guarda **texto**, e a DAG não converte para inteiro, eles se mantêm; a DAG vizinha, `pncp_publicacoes_dag`, usa `int()` e os perderia.

Os dois órgãos ficam na **mesma** raw: a chave `numeroControlePNCP` não se repete entre órgãos, e o `orgao_cnpj` no grão da gold mantém cada um no seu lugar. É para isso que ele está lá.

Rode a DAG para junho de 2026:

<!-- explica: Executa a DAG de contratos uma vez, no terminal, para o período de 1º a 30 de junho de 2026, agora com o Ministério da Justiça como órgão ativo. Os contratos do Ipea que já estão na raw continuam lá. -->

```bash
docker compose exec airflow airflow dags test pncp_contratos_ingest_dag 2026-11-16 \
  --conf '{"data_inicial": "20260601", "data_final": "20260630"}'
```

E construa a cadeia:

<!-- explica: Reconstrói bronze, seed, silver e gold, com os testes de cada uma, agora com os contratos dos dois órgãos na raw. Rode no terminal do dbt, dentro do container. -->

```bash
dbt build --select +pncp_contratos_resumo_mensal --no-populate-cache
```

### O que você deve obter

| Conferência | Resultado esperado |
|---|---|
| Linhas na raw, e chaves distintas | 434 e 434 (30 do Ipea e 404 do Ministério) |
| Segunda execução da DAG, para o mesmo período | Continua em 434 |
| Fornecedores do Ministério por tipo, na silver | PJ: 395, PF: 5, PE: 4 |
| Linhas com NI ou nome de fornecedor preenchido, entre PF e PE | 0 das 9 |
| Linhas da gold | 41: 14 do Ipea e 27 do Ministério |
| Ministério na gold | 404 instrumentos; R$ 479.442.978,43 |
| Ipea na gold | 30 instrumentos; R$ 2.020.249,70, os mesmos de antes |
| `dbt build` | `PASS=24 WARN=0 ERROR=0` |

Se algum número divergir, o caminho é o da [aula da gold](../tutoriais/engenharia-base-nova-gold.md): olhar a camada onde ele aparece primeiro. Os valores acima foram obtidos em 16/11/2026; a API pode mudar se houver retificações, e a diferença deve ser pequena e explicável.

### Dois exercícios dentro da parte 1

**Paginação.** Com 500 registros por página, os 404 do Ministério cabem numa só, e o laço da DAG nunca percorre uma segunda página. Para exercitá-lo, passe `tamanho_pagina=100` na chamada de `get_contratos` da DAG e confirme que ela percorre **5 páginas** e grava os mesmos **404** registros, sem repetir nenhum. A API devolve `totalPaginas: 5`, e a última página tem 4 registros.

**Um período sem contratos.** Dispare a DAG, ainda para o Ministério, com `{"data_inicial": "20260101", "data_final": "20260102"}` e confirme que a execução termina verde, com a mensagem `Nenhum contrato publicado no período` e sem tentar gravar. É o comportamento do `204` que a [aula do cliente](../tutoriais/engenharia-base-nova-cliente.md) testou.

## Parte 2: a brecha que o Ministério revela

Na parte 1, o teste de privacidade passou: PF e PE saíram sem NI nem nome. Mas olhe os fornecedores **PJ**:

```sql
select count(*) as pj,
       count(*) filter (where nomerazaosocialfornecedor ~ '[0-9]{11}$') as razao_social_termina_em_11_digitos
from pncp.contratos
where tipopessoa = 'PJ' and orgaoentidade__cnpj = '00394494000136';
```

```text
 pj  | razao_social_termina_em_11_digitos 
-----+------------------------------------
 395 |                                  2
```

Dois fornecedores PJ têm a razão social terminada em 11 dígitos. É o padrão da razão social de um microempreendedor individual (MEI): o nome do titular seguido do CPF. A regra da silver olha só `tipo_pessoa` e **os deixa passar**: o nome e o CNPJ de ambos aparecem na silver, que a role de leitura lê. A [aula da silver](../tutoriais/engenharia-base-nova-silver.md) apontou essa possibilidade; agora ela tem uma contagem. **Não imprima nem copie essas razões sociais**: elas contêm um CPF.

Sua tarefa é decidir e implementar o tratamento, **com teste**:

1. **Escreva primeiro o teste.** Um teste singular, em `tests/pncp/`, que procura na silver linhas com `fornecedor_nome` terminado em 11 dígitos e devolve as violações. Rode e veja **falhar com 2 linhas**, antes de qualquer correção.
2. **Corrija a regra** na silver, para que o NI e o nome só apareçam quando o fornecedor é PJ **e** o nome não segue o padrão de MEI. Rode e veja o teste passar.
3. **Atualize a descrição** do modelo, que diz "o fornecedor só aparece quando é pessoa jurídica". Ela deixou de ser a regra inteira.
4. **Registre a decisão.** O que a equipe perde, e o que ganha, ao esconder o nome de um MEI? Nesta aula, a resposta é sua, e a justificativa também. Se houvesse dúvida, o lugar de perguntar é a issue.

Há uma dica para o item 2: a expressão regular da consulta acima serve de ponto de partida. Mas pense no que ela **não** pega: um MEI cuja razão social tem um espaço, um ponto ou outra pontuação entre o nome e os dígitos. Uma regra precisa de testes para os dois lados: o que deve passar, e o que não deve.

## O que entregar

- A configuração (Variable) e a evidência da carga: contagens da raw antes e depois da segunda execução.
- O `dbt build` com `PASS=24` (ou o número que a sua versão tiver, justificado).
- O teste de MEI, mostrado **falhando** e depois **passando**.
- A correção da silver e a descrição atualizada.
- Uma descrição de PR no modelo do repositório, com **Impacto e configuração**, como na [aula do PR](../guias/engenharia-contribuicao.md).
- Uma frase sobre a decisão: o que foi escondido, e por quê.

## Critérios de aceite

1. A mesma DAG carrega os dois órgãos só com mudança de configuração, e uma segunda execução não altera nenhum total.
2. A silver mantém as 434 linhas: nenhuma regra de privacidade remove um instrumento, e `left join` e `relationships` continuam valendo.
3. A gold continua a fechar com a bronze: **434** instrumentos e **R$ 481.463.228,13** no total, como antes da correção. A correção esconde um nome, e não um valor.
4. O teste de MEI reprova antes da correção, com 2 linhas, e aprova depois.
5. Nenhum CPF, nome de pessoa física ou razão social de MEI aparece no PR, nos logs ou nas evidências.
6. A descrição do modelo, a regra e o teste dizem a mesma coisa.
7. Outra pessoa repete a conferência com os comandos da descrição e obtém os mesmos números.

## Para ir além

Cada item abaixo é uma contribuição possível, em ordem de dificuldade:

- **Data da carga na gold.** O painel não consegue dizer "atualizado em": a gold não tem a data da carga. Acrescente `max(dt_ingest)` à gold e documente. Pense: a coluna é aditiva? Em que muda o teste de grão?
- **Vínculo com a contratação.** A silver guarda `numero_controle_pncp_compra`. Quantos contratos do Ipea têm uma contratação correspondente na tabela `pncp.contratacoes_publicacao`, coletada pela outra DAG? No ambiente usado nestas aulas, **3 dos 30**. O que isso diz sobre a cobertura da outra coleta? Qual é o risco de uma junção `inner` aqui?
- **A skill desatualizada.** O [checklist](../referencia/engenharia-checklist-base-nova.md) lista seis divergências entre o guia da aplicação e o código. Corrija uma, num PR de documentação, com a evidência.
- **O `data_tests:` do projeto.** Dois arquivos de `schema.yml` usam a chave que o dbt 1.7.13 ignora. Qual o efeito, em quantos testes, e o que propor à equipe?
- **Uma issue real.** Pergunte ao time do Ipea por uma issue de fonte nova atribuível a você, e aplique o percurso inteiro.

## Como autoavaliar

Responda sem consultar as aulas. Se alguma resposta não vier, a aula está no parêntese:

| Pergunta | Aula |
|---|---|
| Por que a base nova existe, se já há contratos do ComprasGov? | [Avaliar a fonte](../guias/engenharia-avaliar-fonte.md) |
| O que o cliente faz quando a API responde `204`? E quando não responde? | [O cliente](../tutoriais/engenharia-base-nova-cliente.md) |
| Por que a DAG falha na hora quando falta `orgao_pncp`? | [A DAG](../tutoriais/engenharia-base-nova-dag.md) |
| Por que o schema do domínio não pode ser o da raw? | [O domínio no dbt](../tutoriais/engenharia-base-nova-dominio.md) |
| O que `unique` e `relationships` pegam, e o que só a reconciliação pega? | [A silver](../tutoriais/engenharia-base-nova-silver.md), [A gold](../tutoriais/engenharia-base-nova-gold.md) |
| Como alguém sabe se a tabela está atualizada? | [Documentar](../guias/engenharia-metadados.md) |
| O que a revisão confere, e o que você diz antes que ela pergunte? | [Abrir o PR](../guias/engenharia-contribuicao.md) |

## Limite da entrega

Use o ambiente local e os dados públicos do PNCP. Não use credenciais reais nem envie nada ao repositório sem uma issue atribuída a você. A proposta é completar o percurso com evidências, e não ampliar a base.

## Veja também

- [Checklist: adicionar uma base nova](../referencia/engenharia-checklist-base-nova.md)
- [Abrir o PR e passar pela revisão](../guias/engenharia-contribuicao.md)
