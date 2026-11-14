# Prática: executar e investigar uma DAG

> Tipo: **Tutorial**

## Preparação da execução

Use o Airflow local com serviços e conexão PostgreSQL configurados. Escolha uma DAG de fonte pública e um período limitado; confirme se ela dispara outras DAGs antes da execução.

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

## Investigação da execução

Registre DAG, identificador da execução, intervalo processado, tarefa e tentativa. No log, identifique o primeiro erro relevante e relacione-o à etapa que falhou: coleta, persistência ou transformação.

Para a falha controlada, use uma cópia local de estudo e registre a configuração a restaurar. Depois da correção, reexecute o necessário e confira o conteúdo do destino, além do estado da tarefa.

Ao testar `dynamic_schedules`, preserve o valor atual e modifique apenas a entrada da DAG escolhida, mantendo o formato esperado por `plugins/schedule_loader.py`.

## Veja também

- [DAGs, tarefas e configuração no Airflow](../referencia/engenharia-airflow.md)
- [Modelos dbt: source, ref e materializações](../referencia/engenharia-dbt.md)
