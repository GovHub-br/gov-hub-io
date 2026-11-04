# Prática: executar e investigar uma DAG

> Tipo: **Tutorial**

## Antes de clicar em executar

Esta prática pressupõe que você já iniciou os serviços na aula de ambiente local. Abra o endereço do Airflow no navegador e entre com o usuário configurado no `.env`.

Na lista de DAGs, o nome exibido é o **identificador** da rotina. Abrir seus detalhes permite consultar o grafo e as execuções. Cada execução reúne o estado das tarefas naquele momento: aguardando, executando, concluída ou com falha.

Uma coleta pode precisar de credenciais que você não possui. Para começar, escolha uma fonte pública e confirme os parâmetros com a equipe. Não ter acesso à fonte é diferente de não entender o Airflow.

## O que você vai aprender

Executar uma coleta local e localizar a tarefa que falhou, sem disparar todo o ambiente.

## Antes de começar

Use uma DAG de estudo, uma fonte pública e parâmetros de período limitados. Confirme no código se ela grava no banco local e se dispara outras DAGs.

## Passos

1. Abra `http://localhost:8080` e encontre a DAG. Compare o identificador com o arquivo em `airflow_lappis/dags/data_ingest/`.
2. Leia tarefas, dependências, parâmetros e retentativas antes de disparar.
3. Dispare uma execução manual. Acompanhe o grafo e abra o log de cada tarefa.
4. Confira o destino no PostgreSQL. Tarefa verde indica execução concluída, mas a conferência dos dados continua necessária.
5. Em uma DAG de estudo, provoque uma falha controlada, como uma configuração inválida. Observe a tarefa e a mensagem; restaure a configuração antes de tentar novamente.
6. Consulte `dynamic_schedules` em Admin → Variables. Preserve o valor anterior e o formato esperado por `plugins/schedule_loader.py` ao experimentar um novo horário local.

## Exemplo: ler o estado sem confundir causa e consequência

Uma execução de estudo pode apresentar:

| Tarefa | Estado ilustrativo | O que investigar |
|---|---|---|
| Coletar | Sucesso | Confirmar quantidade e período recebidos |
| Gravar | Falha | Abrir o log desta tarefa |
| Transformar | Falha anterior, ou `upstream_failed` | Resolver primeiro a gravação de que depende |

Uma mensagem como “conexão com banco recusada” aponta para acesso ou disponibilidade do banco. Ela não demonstra que o SQL de transformação está errado. Confira serviço, endereço e configuração da conexão antes de alterar o modelo.

Depois da correção, acompanhe a nova tentativa e confira as linhas no destino. Os estados acima são exemplos para interpretação, não uma descrição obrigatória das telas ou mensagens de toda DAG.

## Como verificar

Você consegue apontar execução, intervalo, tarefa e causa da falha. Depois da correção, repita somente o necessário e confira a idempotência.

Mudar o agendamento não substitui uma execução manual nem garante backfill. Verifique `catchup` e os parâmetros de período da DAG.

## Um roteiro para acompanhar a primeira execução

Abra o grafo e anote os nomes das tarefas antes do disparo. Use a ação de execução manual da DAG, normalmente representada por um botão de reprodução. Depois selecione a execução criada, e não uma execução antiga da lista.

Ao selecionar uma tarefa, procure a opção de logs. O **log** é o relato de mensagens produzido durante a execução. Leia o horário e procure a mensagem que explica o erro; a última linha pode apenas resumir que a tarefa falhou.

Se um teste controlado falhar como planejado, isso é um resultado útil: você conseguiu reconhecer a falha. Corrigir a configuração e repetir permite confirmar a causa. Não provoque erros na primeira DAG que encontrar: use uma cópia local de estudo e saiba qual configuração será restaurada.

Para `dynamic_schedules`, comece apenas lendo e guardando o valor atual. Mude somente a entrada da DAG escolhida, mantendo a estrutura das demais configurações.

## Veja também

- [DAGs, tarefas e configuração no Airflow](../referencia/engenharia-airflow.md)
- [Modelos dbt: source, ref e materializações](../referencia/engenharia-dbt.md)
