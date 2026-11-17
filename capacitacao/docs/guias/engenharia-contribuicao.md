# Abrir o PR e passar pela revisão

> Tipo: **Guia**

## Objetivo

Transformar o trabalho das aulas anteriores em um pull request que outra pessoa consiga revisar sem perguntar nada: com commits que contam uma história, evidências que se repetem e uma descrição que diz o que muda para quem já usa o projeto.

![O caminho do trabalho pronto até o merge. O repositório local tem alterações em três arquivos já versionados e arquivos novos; seis commits atômicos as organizam. Antes de abrir o PR, a pessoa roda os testes, o estilo e o dbt, e atualiza a branch com a main. O PR é aberto com o modelo do projeto e a label do time, o que solicita a revisão do time do Ipea. A revisão exige pelo menos uma aprovação, com resposta esperada em dois dias úteis. O merge usa merge commit, e a branch é apagada depois.](../../assets/diagramas/engenharia-base-nova-pr.png)

A [aula 1](../explicacao/engenharia-base-nova.md) mostrou o caso do domínio de orçamento: a limpeza no Python, a mudança de dependências e a macro alterada ficaram misturadas em poucos commits, e a documentação chegou dois meses depois. Esta aula faz o contrário com a base de contratos do PNCP.

**A prática é local.** Prepare tudo, e envie ao GitHub só se a equipe responsável combinar uma contribuição real, com uma issue atribuída a você, como pede o `.github/CONTRIBUTING.md`.

## Antes de começar

- As aulas anteriores concluídas, com a base de contratos funcionando.
- O `.github/CONTRIBUTING.md` e o `.github/MERGE_REQUEST_PROTOCOL.md` do repositório da aplicação, que descrevem as regras que esta aula aplica.

## Passo 1: ver o que mudou, e o que não deve entrar

<!-- explica: Lista, em formato curto, os arquivos alterados (`M`) e os arquivos novos que o Git ainda não acompanha (`??`). Arquivos ignorados pelo `.gitignore` não aparecem. -->

```bash
git status --short
```

```text
 M airflow_lappis/dags/dbt/ipea/dbt_project.yml
 M airflow_lappis/dags/dbt/ipea/models/sources.yml
 M airflow_lappis/plugins/cliente_pncp.py
?? airflow_lappis/dags/data_ingest/pncp/contratos_ingest_dag.py
?? airflow_lappis/dags/dbt/ipea/models/pncp_dbt/
?? airflow_lappis/dags/dbt/ipea/tests/
?? tests/dags/
?? tests/test_plugins/test_cliente_pncp.py
```

Leia assim: três arquivos existentes foram alterados (`M`), e cinco caminhos novos aparecem (`??`). É a lista da [aula 1](../explicacao/engenharia-base-nova.md), e só ela. Tudo que **não** está aqui está certo: `.env`, `htmlcov/`, `target/` e `logs/` são ignorados pelo `.gitignore`.

O que costuma entrar por engano, e como evitar:

| O que | Por que não entra | O que fazer |
|---|---|---|
| `+database: postgres` no `dbt_project.yml` e a mudança do `profiles.yml` (nível 2) | São ajustes do **seu** ambiente local | `git add -p` no `dbt_project.yml`, escolhendo só o bloco `pncp_dbt` |
| Arquivos de estudo, como a pasta `formacao` do nível 4 | Eram para aprender, e não para o projeto | Descarte-os antes (`git status` mostra) |
| Notebooks e capturas de tela | Não são código do projeto | Deixe fora |
| `.env`, com senhas | Segredo | O `.gitignore` já o ignora; confira que ele não aparece no `git status` |

Com o `dbt_project.yml` limpo, o `git diff --stat` dos arquivos alterados fica assim:

```text
 airflow_lappis/dags/dbt/ipea/dbt_project.yml    | 14 ++++++++++
 airflow_lappis/dags/dbt/ipea/models/sources.yml |  5 ++++
 airflow_lappis/plugins/cliente_pncp.py          | 37 +++++++++++++++++++++++++
 3 files changed, 56 insertions(+)
```

Só linhas acrescentadas, nenhuma removida: a mudança **não altera** o que já existia. É a primeira informação que um revisor quer, e agora você pode afirmá-la.

## Passo 2: commits que contam a história

O projeto usa o padrão Conventional Commits: `<tipo>[escopo]: <descrição>`, com a descrição em letras minúsculas e sem ponto final. O corpo, se houver, fica separado por uma linha em branco, e a issue é fechada com `Closes: #<número>` no rodapé.

A ordem das aulas já é a ordem dos commits. Cada um deixa a suíte verde, e é isso que o torna reversível e legível:

| # | Mensagem | Arquivos |
|---|---|---|
| 1 | `feat(pncp): adiciona get_contratos ao cliente do pncp` | `plugins/cliente_pncp.py`, `tests/test_plugins/test_cliente_pncp.py` |
| 2 | `feat(pncp): adiciona dag de ingestão de contratos` | `contratos_ingest_dag.py`, `tests/dags/` |
| 3 | `feat(dbt): declara a fonte pncp e o domínio pncp_dbt` | `sources.yml`, bloco do `dbt_project.yml` |
| 4 | `feat(dbt): adiciona bronze de contratos do pncp` | `bronze/schema.yml`, `bronze/pncp_contratos.sql` |
| 5 | `feat(dbt): adiciona silver de contratos do pncp` | `silver/` e o teste de privacidade |
| 6 | `feat(dbt): adiciona gold mensal de contratos do pncp` | `gold/` e os dois testes da gold |

Por que não um commit só? Se a gold tiver um problema, reverter o commit 6 mantém a ingestão e a bronze; se o revisor discordar do cliente, só o commit 1 muda. E um commit de uma linha de aviso não substitui a leitura: **cada mensagem diz o que o commit faz, e o corpo, quando existe, diz por quê.**

A branch já tem o nome certo: `feat/pncp-contratos` segue o formato `<tipo>/<descricao-curta>` do protocolo.

## Passo 3: conferir tudo antes de abrir

O protocolo pede que o autor rode os testes e o lint antes de abrir o PR, e o CI do GitHub **não os garante**: o job de lint do `main.yaml` termina com `|| true`, e portanto nunca reprova um PR. A conferência local é a que vale. Uma por tipo de mudança:

| O que | Comando | Resultado no exemplo |
|---|---|---|
| Testes Python | `poetry run pytest tests --no-cov` | `102 passed` (99 que já existiam e 3 deste PR) |
| Estilo Python | `poetry run black --check <arquivos novos>` e `poetry run ruff check <arquivos novos>` | `3 files would be left unchanged`, `All checks passed!` |
| Estilo SQL | Na pasta do projeto dbt: `poetry run sqlfmt --check models/pncp_dbt tests/pncp` | `6 files passed formatting check` |
| Estilo SQL (regras) | Na mesma pasta: `poetry run sqlfluff lint models/pncp_dbt tests/pncp --config ../../../../.sqlfluff.ci --ignore templating` | `violations: 0 status: PASS` |
| Modelos e testes dbt | `dbt build --select +pncp_contratos_resumo_mensal` | `PASS=24 WARN=0 ERROR=0` |
| DAG | `airflow dags test pncp_contratos_ingest_dag <data>` | `Enviados: 30 | Gravados nesta carga: 30` |

Há um cuidado com o `make lint` completo: ele roda sobre o **repositório inteiro**, e pode reprovar por arquivos que você não tocou. Nos testes desta aula, com as versões que usei, o `black` já reprovava o próprio `cliente_pncp.py` antes da mudança (uma linha em branco), e o `sqlfmt --check` reprovava `models/ted_dbt/silver/pf_plano_acao.sql`. As versões da sua instalação podem divergir. Para saber se o problema é seu, compare com o estado anterior:

<!-- explica: A primeira linha guarda de lado só as suas mudanças em `cliente_pncp.py`, e o arquivo volta à versão anterior. A segunda confere se essa versão anterior já passava no `black`. A terceira devolve as suas mudanças ao arquivo. -->

```bash
git stash push -- airflow_lappis/plugins/cliente_pncp.py
poetry run black --check airflow_lappis/plugins/cliente_pncp.py
git stash pop
```

Se o arquivo já reprovava sem a sua mudança, **não o reformate** neste PR: o diff ficaria cheio de linhas que não são suas. Anote na descrição ("o lint já reprova em X, sem relação com esta mudança") e deixe a correção para um PR próprio.

Por fim, atualize a branch com a base, como o protocolo pede:

<!-- explica: A primeira linha baixa as novidades do repositório principal, o remote `upstream`, sem mexer nos seus arquivos. A segunda reaplica os seus commits, um a um, por cima da `main` mais recente, como se a branch tivesse começado agora. -->

```bash
git fetch upstream
git rebase upstream/main
```

O `rebase` reescreve os commits da sua branch. Faça-o só em branch que ninguém mais usa, e se o remote `origin` apontar para o repositório principal, use `origin/main`.

## Passo 4: a descrição do PR

O repositório tem um modelo em `.github/PULL_REQUEST_TEMPLATE.md`. Preencher cada seção com **fatos** é o que separa um PR revisável de um PR que gera perguntas. Para a base de contratos:

````markdown
## Descrição
Adiciona a ingestão e os modelos dbt dos contratos publicados no PNCP pelo órgão
configurado: método `ClientePNCP.get_contratos`, DAG `pncp_contratos_ingest_dag`,
raw `pncp.contratos` e o domínio `pncp_dbt` (bronze, silver e gold). Responde "quanto
o órgão contratou em cada mês, separando contratos de empenhos?". Complementa o
domínio de contratos do ComprasGov com o vínculo à contratação (`numeroControlePncpCompra`).

## Tipo de mudança
- [x] Nova funcionalidade / pipeline

## Issues relacionadas
Closes #<número da issue>

## Domínio de revisão
- [x] IPEA

## Como testar / validar
```bash
make test
airflow dags test pncp_contratos_ingest_dag 2026-11-16 \
  --conf '{"data_inicial": "20260101", "data_final": "20260630"}'
cd airflow_lappis/dags/dbt/ipea
dbt build --select +pncp_contratos_resumo_mensal
```

## Evidências
- `pytest tests`: 102 passed (3 novos: o teste de falhas do cliente, com 2 casos, e 1 da DAG).
- DAG: 30 contratos coletados e gravados; segunda execução mantém 30 linhas.
- dbt: PASS=24 (3 modelos, 1 seed, 20 testes). Gold: 14 linhas, 30 instrumentos,
  R$ 2.020.249,70, iguais aos da bronze (teste de reconciliação).
- Role de leitura: lê silver e gold; a bronze nega o acesso.
- `black`, `ruff`, `sqlfmt` e `sqlfluff` sem violações nos arquivos novos. O `make lint`
  completo reprova em `cliente_pncp.py` (black) e em `ted_dbt/silver/pf_plano_acao.sql`
  (sqlfmt) também sem esta mudança.

## Impacto e configuração
- Schema novo `pncp_dw`, com três tabelas; a role de leitura passa a ver duas delas.
  A seed `estados_brasil` já existia.
- A DAG exige a chave `orgao_pncp` do órgão em `airflow_variables` (a mesma que
  `pncp_publicacoes_dag` usa). Horário padrão `@daily`; pode ser configurado em
  `dynamic_schedules`.
- Nenhuma alteração em modelos ou DAGs existentes: nos três arquivos já versionados,
  56 linhas acrescentadas e nenhuma removida.

## Checklist
- [x] Título do PR segue Conventional Commits
- [x] Issue relacionada foi referenciada
- [x] Testes/lint foram executados ou a ausência foi justificada
- [x] Testes DBT adicionados/atualizados, se aplicável
- [x] Documentação atualizada, se aplicável
- [x] Sem dados sensíveis ou credenciais no código
- [x] Branch atualizada com `upstream/main` ou `origin/main`
- [x] Revisores automáticos por domínio foram solicitados pelo GitHub ou justificados no PR
````

O título do PR segue o mesmo padrão dos commits: `feat(pncp): adiciona ingestão e modelos dbt de contratos`.

Repare na seção **Impacto e configuração**, que não existe no modelo, e é a mais útil. Ela responde duas perguntas que a revisão sempre faz: o que muda para quem já usa, e o que precisa existir no ambiente para a mudança funcionar. É a lição da DAG que depende de Variable.

## Passo 5: encaminhar a revisão

O encaminhamento não é automático. O GitHub **não** escolhe revisores pelos arquivos que você alterou. O fluxo é este:

1. Você abre o PR (fora do modo rascunho) e adiciona a label do domínio, aqui `team:ipea`, porque `dags/data_ingest/pncp/` e `dags/dbt/ipea/` pertencem ao domínio do Ipea no mapa do protocolo.
2. O workflow `Request team review` roda quando a label é adicionada e solicita a revisão do time `@GovHub-br/ipea`. Ele não cria labels sozinho.
3. A `main` exige pelo menos **uma aprovação** antes do merge.
4. A primeira resposta é esperada em até **dois dias úteis**.

Sem a label, ninguém é solicitado, e o PR pode ficar parado sem que ninguém perceba. Se a label indicar um domínio diferente dos arquivos alterados, justifique no PR.

## Passo 6: o que a revisão confere

O protocolo lista os critérios de aprovação de código. A tabela mostra como este PR responde a cada um, e é uma boa lista para você conferir antes de pedir a revisão:

| Critério do protocolo | Como esta mudança responde |
|---|---|
| Segue os padrões de engenharia do repositório | DAG em TaskFlow, `get_dynamic_schedule`, `insert_data` com chave, `dt_ingest`, domínio com `grants` por camada |
| Sem `SELECT *` em modelos finais | A bronze lista as 26 colunas; a silver e a gold, também |
| Sem credenciais ou dados sensíveis | Nenhum segredo; o CPF de pessoa física não chega à silver, com teste |
| Testes passam | 102 no `pytest`; 24 no `dbt build` |
| Lint passa | Nos arquivos novos, sim; o que já reprovava está identificado |
| Commits seguem Conventional Commits | Seis commits, um por etapa |
| Lógica correta e legível | Descrições nos `schema.yml`; reconciliação da gold com a bronze |
| Plugins e helpers existentes reaproveitados | `ClientePNCP`, `request_safe`, `ClientPostgresDB.insert_data`, `get_dynamic_schedule` |

## Passo 7: as perguntas que a revisão vai fazer

Responda-as antes que sejam feitas, na descrição ou nos comentários do código:

| Pergunta provável | Resposta, com fonte |
|---|---|
| Por que mais uma base de contratos, se já há `contratos_dbt`? | O PNCP traz o vínculo com a contratação e o mesmo formato para qualquer órgão. Está na [issue](engenharia-avaliar-fonte.md) |
| Por que o schema `pncp_dw`, e não `pncp`? | `pncp` é o da raw; um modelo com o mesmo nome substituiria a tabela da DAG. Testado: 52 colunas viram 26 |
| Por que `tests:` e não `data_tests:` no `schema.yml`? | O `requirements.txt` fixa o dbt 1.7.13, que ignora `data_tests:`. Medido: 0 testes contra 9 |
| Por que a DAG tem três tarefas? | Para ver onde falhou. Com milhares de registros, a coleta e a gravação passariam a ser uma só |
| Por que `datetime.now(ZoneInfo(...))` e não só `datetime.now()`? | O container roda em UTC, e o bronze acrescenta `-03:00` |
| Por que o método novo levanta `RuntimeError` e o vizinho devolve lista vazia? | Uma carga incompleta não pode parecer completa. Mudar o vizinho é outro PR |

Se alguma resposta for "não sei", é um problema de projeto que apareceu cedo, e não só uma pergunta de revisão.

## Passo 8: responder à revisão

O protocolo define o que cabe a cada lado.

**Quem revisa** aprova, ou pede mudanças com comentários claros e, quando possível, uma sugestão de correção. Bloqueia com `request changes` só em problema real: um bug, uma credencial exposta, um padrão crítico violado ou um dado sensível. Preferência de estilo que nenhum documento exige é sugestão opcional, e não bloqueia.

**Quem escreve**, depois de um pedido de mudança:

- responde a **todos** os comentários antes de pedir nova revisão;
- aplica a mudança, ou justifica por que não faz sentido;
- marca cada comentário como resolvido e avisa o revisor quando terminar;
- se houver discordância, discute na própria thread e, sem consenso, leva ao canal do time.

Depois da aprovação, o merge usa **merge commit**, preservando o histórico dos seus seis commits, e a branch é apagada. O que acontece depois está na [tabela da aula 1](../explicacao/engenharia-base-nova.md): a documentação do dbt é publicada, os modelos entram na execução diária e a DAG passa a rodar no horário configurado.

## Erros comuns

- **Abrir o PR sem a label do time.** O GitHub não solicita ninguém, e o PR não avança.
- **Reformatar arquivos que já reprovavam o lint.** O diff fica com linhas que não são suas, e a revisão fica mais difícil.
- **Misturar mudanças.** Atualizar dependências, ajustar uma macro e criar uma base no mesmo PR junta riscos distintos numa só aprovação. Se a base exigir uma mudança de macro, ela vai num PR à parte.
- **"Testado e funcionando".** Não diz o que foi executado nem o que era esperado. Escreva os comandos e os números.
- **Esquecer a configuração.** Variables, horários e roles que a base exige precisam estar escritos na descrição.
- **Enviar de verdade sem issue atribuída.** O fluxo do repositório começa pela issue.

## Pronto

O PR está pronto quando alguém que não acompanhou o seu trabalho consegue: entender o que muda e por quê; repetir a conferência com os comandos da descrição e obter os mesmos números; saber o que precisa estar configurado no ambiente; e decidir se aprova sem precisar perguntar nada.

## Confira o que entendeu

1. O `make lint` reprovou, mas em `ted_dbt/silver/pf_plano_acao.sql`, que você não alterou. O que você faz antes de abrir o PR?
2. Você abriu o PR e, depois de dois dias úteis, ninguém respondeu. Que dois itens você verifica primeiro?

## Respostas comentadas

1. Confirma que o arquivo já reprovava sem a sua mudança (com `git stash`, ou rodando o lint na `main`). Se já reprovava, não o corrige neste PR: anota na descrição que o lint reprova nesse arquivo, por motivo anterior, e deixa a correção para um PR próprio. Corrigir no mesmo PR enche o diff de linhas alheias.
2. A label `team:*` do domínio e se o PR não está como rascunho. O workflow que solicita o time roda quando a label é adicionada e só vale para PRs fora do modo rascunho. Sem a label, ninguém foi solicitado. Se estiver tudo certo, o caminho é o canal de comunicação do time, como o protocolo indica.

## Veja também

- [Documentar a tabela e conferir o que o consumo enxerga](engenharia-metadados.md)
- [Prática: a gold e a conferência](../tutoriais/engenharia-base-nova-gold.md)
- [Desafio: uma base nova de ponta a ponta](../desafios/engenharia-desafio.md)
