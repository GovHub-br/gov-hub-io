# Avaliar a fonte e escrever a issue

> Tipo: **Guia**

## Objetivo

Antes de escrever código, responder a três perguntas: a base vale o custo de entrar no projeto? Como a fonte se comporta de verdade? O que exatamente a tabela final vai responder? As respostas viram uma issue que qualquer pessoa da equipe consegue avaliar.

Meia hora aqui economiza dias depois. As três perguntas pegam cedo problemas que, descobertos na gold, obrigariam a refazer a DAG.

![A avaliação de uma fonte em três passos que terminam na issue. Primeiro, conferir se a base já existe no repositório. Depois, pedir dados à API nas três situações que a DAG vai encontrar em produção, anotando pedido, resposta e decisão de cada uma. Há dados: o semestre do Ipea volta com status 200, 30 registros numa página, e a decisão é pedir 500 por página e percorrer totalPaginas. Não há dados: 1º e 2 de janeiro voltam com 204 e corpo vazio, e o cliente trata isso como nada no período. O pedido está errado: uma data com hífens volta com 422 e a mensagem do erro, e a carga para em vez de virar lista vazia. Por fim, preencher a ficha da fonte e a especificação da tabela. A issue reúne o porquê, a ficha e a especificação.](../../assets/diagramas/engenharia-avaliar-fonte.png)

## Antes de começar

- Um terminal com `curl`. Os pedidos abaixo vão à API pública do PNCP, sem senha.
- O repositório `data-application-gov-hub` aberto, para procurar o que já existe.

## Passo 1: a base já existe?

Procure a fonte no repositório antes de propor uma base nova:

<!-- explica: Procura a palavra pncp em todos os arquivos versionados da pasta `airflow_lappis`, onde ficam DAGs, clientes e o projeto dbt, e lista só o nome dos arquivos que a contêm. -->

```bash
git grep -l pncp -- airflow_lappis
```

```text
airflow_lappis/dags/data_ingest/pncp/itens_resultados_licitacoes.py
airflow_lappis/dags/data_ingest/pncp/licitacoes_ingest.py
airflow_lappis/plugins/cliente_pncp.py
```

`git grep` procura só nos arquivos versionados: deixa de fora caches do Python e arquivos de estudo que você ainda tenha na pasta.

Leia assim: já existe um cliente do PNCP e duas DAGs que coletam contratações (as compras), seus itens e resultados. Nenhum arquivo em `models/` cita o PNCP, então não há fonte declarada nem modelo dbt.

Há também uma sobreposição a considerar. O domínio `contratos_dbt` já traz os contratos do Ipea pela API do ComprasGov (Contratos.gov.br), e os 30 contratos do Ipea no PNCP foram publicados por esse mesmo sistema (`usuarioNome = "Contratos.gov.br"`). O que o PNCP acrescenta é o `numeroControlePncpCompra`, que liga cada contrato à contratação já coletada pela `pncp_publicacoes_dag`, e o mesmo formato para qualquer órgão. Esse é o **porquê** da issue. Sem ele, um revisor perguntaria, com razão, por que ter duas cópias dos mesmos contratos.

## Passo 2: testar a API nas três situações que a DAG vai encontrar

A documentação diz o que a API deveria fazer, e o exemplo dela mostra só o caso em que há dados. O cliente que você vai escrever precisa saber o que acontece também quando não há dados e quando o pedido sai errado. A forma de descobrir é fazer esses pedidos agora, à mão, e anotar a resposta de cada um:

| Situação | Quando acontece em produção | O que pedir para ver |
|---|---|---|
| **Há dados** | Na maioria das execuções: o órgão publicou contratos no período | Um período com contratos conhecidos: o 1º semestre de 2026 do Ipea |
| **Não há dados** | Numa execução em que o órgão não publicou nada, como nos primeiros dias do ano | Um período curto sem nenhum contrato: 1º e 2 de janeiro de 2026 |
| **O pedido está errado** | Quando o código monta um parâmetro num formato que a API não aceita | O mesmo pedido, com a data escrita com hífens |

Os três pedidos usam o mesmo endereço da API de contratos do PNCP, `/api/consulta/v1/contratos`, e mudam só os parâmetros: `dataInicial` e `dataFinal` são o período de **publicação**, `cnpjOrgao` é o CNPJ do órgão (`33892175000100` é o do Ipea), `pagina` é a página pedida e `tamanhoPagina`, quantos registros vêm em cada página.

### Situação 1: há dados

<!-- explica: A primeira linha pede à API do PNCP os contratos que o Ipea publicou de 1º de janeiro a 30 de junho de 2026, até 500 por página, e salva a resposta no arquivo `contratos_ipea.json`. A segunda abre esse arquivo com Python e imprime três números: o total de registros no período, o total de páginas e quantos registros vieram nesta página. -->

```bash
curl -s "https://pncp.gov.br/api/consulta/v1/contratos?dataInicial=20260101&dataFinal=20260630&cnpjOrgao=33892175000100&pagina=1&tamanhoPagina=500" > contratos_ipea.json
python3 -c "import json; d = json.load(open('contratos_ipea.json')); print(d['totalRegistros'], d['totalPaginas'], len(d['data']))"
```

```text
30 1 30
```

Leia assim: 30 registros no período, uma página, 30 registros nesta página. A resposta não traz só a lista: traz também `totalRegistros` e `totalPaginas`, que dizem se é preciso pedir mais páginas. O arquivo `contratos_ipea.json` serve para o passo 3.

### Situação 2: não há dados

<!-- explica: Pede os contratos do Ipea publicados em 1º e 2 de janeiro de 2026, um período sem nenhum. Em vez de mostrar a resposta, mostra só o código de status HTTP e quantos bytes vieram no corpo. -->

```bash
curl -s -o /dev/null -w "%{http_code} %{size_download} bytes\n" "https://pncp.gov.br/api/consulta/v1/contratos?dataInicial=20260101&dataFinal=20260102&cnpjOrgao=33892175000100&pagina=1"
```

```text
204 0 bytes
```

Leia assim: a API respondeu `204` (sucesso, sem conteúdo) e um corpo vazio. Não veio uma lista vazia, `{"data": []}`, como muita gente esperaria: não veio nada. Um código que sempre tenta ler o JSON da resposta quebra aqui.

### Situação 3: o pedido está errado

<!-- explica: Faz o mesmo pedido da situação 1, mas com a data inicial escrita `2026-01-01`, com hífens, em vez de `20260101`, e mostra a resposta da API. -->

```bash
curl -s "https://pncp.gov.br/api/consulta/v1/contratos?dataInicial=2026-01-01&dataFinal=20260630&cnpjOrgao=33892175000100&pagina=1"
```

```text
{"path":"/pncp-consulta/v1/contratos","message":"Data Inicial com tamanho inválido.","error":"422 UNPROCESSABLE_ENTITY",...}
```

Leia assim: a API recusou o pedido com `422` e disse qual parâmetro está errado. Um erro desses é do nosso código, e não da fonte: tentar de novo não resolve.

### O que cada situação decide

Cada resposta vira uma decisão de código:

| O que a fonte fez | Decisão |
|---|---|
| Aceitou até 500 registros por página (`tamanhoPagina=501` devolve `400 Tamanho de página inválido`) | Pedir 500 por página e percorrer `totalPaginas` |
| Sem registros, respondeu `204`, sem corpo, e não uma lista vazia | O cliente precisa tratar `204` como "nada no período" |
| Data no formato errado: `422` com mensagem clara | Datas sempre como `AAAAMMDD`; um erro desses deve parar a carga, não virar lista vazia |

## Passo 3: preencher a ficha da fonte

Olhe os registros com os olhos de quem vai modelar: conte valores distintos da chave, veja os valores de cada campo categórico, procure nulos e extremos. Um script curto em Python sobre `contratos_ipea.json` basta, como na [prática de coleta](../tutoriais/engenharia-coleta-python.md) do nível 4. A ficha resume o que importa para as próximas aulas:

| Item | Contratos do PNCP (Ipea, 1º semestre de 2026) |
|---|---|
| Acesso | Aberto, sem senha |
| Filtros | Período de **publicação** e CNPJ do órgão |
| Chave | `numeroControlePNCP`: 30 registros, 30 valores distintos |
| Volume | 30 registros no semestre; o Ministério da Justiça publicou 404 só em junho |
| Mudanças | 6 dos 30 registros têm `numeroRetificacao` maior que zero: o registro muda depois de publicado |
| Dados pessoais | `tipoPessoa = "PF"` significa fornecedor pessoa física, e então `niFornecedor` é um CPF. Não há PF entre os 30 do Ipea; no Ministério da Justiça, em junho, há 5 entre 404 |
| Esquisitices | 2 contratos assinados em 2025 e publicados em 2026; um contrato de R$ 1.180,93 com 1.630 parcelas; `valorAcumulado` sempre nulo |

Três itens da ficha mudam o projeto da base:

- **Filtro por publicação.** Um contrato retificado continua com a data de publicação original. Uma carga que pede só "os últimos 30 dias de publicação" não traz as retificações de contratos mais antigos. A issue precisa dizer isso, para que ninguém confie na base como espelho exato da fonte sem uma carga periódica mais longa.
- **CPF na fonte.** A raw e a bronze vão guardar o que a API manda, CPF inclusive. A decisão de não expor isso cabe à silver, e já fica escrita na issue.
- **Datas diferentes.** A pergunta é sobre o mês de assinatura, mas a API filtra por publicação. Um contrato assinado em dezembro de 2025 e publicado em janeiro de 2026 entra na carga de janeiro e na linha de dezembro da gold.

## Passo 4: escrever a especificação

É a mesma especificação do nível 3, agora para a base nova:

| Item | Decisão |
|---|---|
| Pergunta | Quanto o Ipea contratou em cada mês, separando contratos de empenhos? |
| Grão da gold | Uma linha por mês de assinatura e tipo de instrumento |
| População | Todos os instrumentos publicados pelo órgão e coletados, sem filtro por vigência |
| Medidas | Quantidade de instrumentos; soma do valor global, em reais |
| Chave das camadas de linha | `numeroControlePNCP` |
| Dado pessoal | NI e nome do fornecedor só para pessoa jurídica, a partir da silver |
| Conferência | Quantidade e valor total da gold iguais aos da bronze |

## Passo 5: abrir a issue

```markdown
## Fonte
Contratos publicados no PNCP (API /api/consulta/v1/contratos), pelo órgão configurado.

## Por que
O domínio contratos_dbt já traz contratos pelo ComprasGov. O PNCP acrescenta o
numeroControlePncpCompra, que liga cada contrato à contratação já coletada pela
pncp_publicacoes_dag, no mesmo formato para qualquer órgão.

## O que a fonte mostrou
- Até 500 registros por página; 204 sem corpo quando não há registros; 422 para data inválida.
- Chave numeroControlePNCP (30 de 30 distintos no Ipea, 1º semestre de 2026).
- Registros são retificados depois de publicados; o filtro é por data de publicação.
- tipoPessoa = "PF" traz CPF em niFornecedor.

## Entrega
- Cliente: ClientePNCP.get_contratos, com teste.
- DAG: pncp_contratos_ingest_dag, raw pncp.contratos, CNPJ em airflow_variables (orgao_pncp).
- dbt: domínio pncp_dbt; gold com uma linha por mês de assinatura e tipo de instrumento.
- Silver sem NI e nome de fornecedor que não seja pessoa jurídica.
```

Use o modelo de issue do repositório, se houver um para a sua equipe, e a label do domínio: caminhos em `dags/data_ingest/pncp/` são revisados pelo time do Ipea.

## Erros comuns

- **Ler só a documentação.** O `204` sem corpo não aparece no exemplo da documentação, e foi ele que decidiu como o cliente trata a ausência de dados.
- **Deixar a especificação para depois.** Grão e população decididos na gold obrigam a mudar a silver e, às vezes, a DAG.
- **Tratar CPF como detalhe de implementação.** A decisão sobre dado pessoal é de projeto: ela vai na issue, onde a equipe pode discutir.

## Confira o que entendeu

1. A DAG vai rodar todo dia, pedindo os contratos publicados nos últimos 30 dias. Um contrato de 2025 é retificado hoje. A base fica com a versão nova?
2. Por que o "porquê" da issue é parte da avaliação, e não uma formalidade?

## Respostas comentadas

1. Não. O filtro é por data de publicação, e a desse contrato é de 2025: ele não entra na janela. A base fica com a versão antiga até uma carga que cubra 2025. A issue registra isso, e a DAG aceita um período explícito para essas recargas, como você verá na aula da DAG.
2. Porque uma base nova tem custo de manutenção, e esta se sobrepõe a uma que já existe. Sem dizer o que ela acrescenta, a equipe não consegue decidir se vale mantê-la. O porquê também orienta a modelagem: se o valor está no vínculo com a compra, essa chave precisa chegar até a silver.

## Veja também

- [O caminho de uma base nova, da issue ao painel](../explicacao/engenharia-base-nova.md)
- [Planejar a entrega antes dos modelos](../explicacao/engenharia-planejamento-modelos.md)
- [Prática: o cliente da fonte](../tutoriais/engenharia-base-nova-cliente.md)
