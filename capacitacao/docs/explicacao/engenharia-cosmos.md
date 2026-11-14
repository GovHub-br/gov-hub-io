# Como o Cosmos leva o dbt ao Airflow

> Tipo: **Explicação**

## Dois mapas do mesmo trabalho

O dbt conhece as relações entre modelos: um resumo gold depende de uma integração silver, que depende de uma bronze. O Airflow precisa enxergar quais tarefas executar e acompanhar seus estados. O Cosmos faz essa ligação.

O cliente já coletou os dados, mas os modelos precisam rodar na ordem correta. Manter uma lista manual de dependências duplicaria o grafo que o dbt já conhece.

## A ligação entre as ferramentas

O **Astronomer Cosmos** representa os recursos dbt como tarefas no Airflow. O dbt continua definindo as dependências entre modelos; o Airflow coordena a execução e oferece acompanhamento por tarefa.

A DAG está em `airflow_lappis/dags/dbt/ipea/cosmos_dag.py`, com execução diária à 01:00 e duas retentativas. O horário e as retentativas são configurados nessa DAG; o fuso segue a configuração do ambiente.

## O que observar no grafo

Encontre um modelo bronze e acompanhe seus descendentes silver e gold. Uma falha no início pode impedir a atualização dos indicadores dependentes.

O horário agendado não prova que a ingestão terminou. A relação entre coleta e transformação precisa considerar disponibilidade dos dados, dependências e a configuração efetiva da aplicação.

## Exemplo: reconhecer o mesmo modelo em duas ferramentas

| No projeto dbt | Na execução coordenada pelo Airflow |
|---|---|
| Bronze converte os valores recebidos | A tarefa correspondente executa o recurso bronze |
| Silver usa `ref()` para depender da bronze | A tarefa dependente aguarda conforme as dependências geradas |
| Gold resume a silver | A execução da gold depende dos recursos anteriores |

Se a bronze falhar, não comece alterando o cálculo da gold apenas porque seu valor está antigo. Localize primeiro o recurso com erro, confira o log e determine quais saídas não foram atualizadas.

Os nomes e o agrupamento das tarefas dependem da configuração do Cosmos. Para reconhecer a correspondência, use o nome do recurso e a operação mostrada no log; não presuma que todos os ambientes exibem exatamente o mesmo desenho.

## Investigação curta

Ao ver uma falha, identifique o recurso dbt, leia o SQL ou teste correspondente e confira o log da tarefa. Depois de corrigir, determine quais descendentes ficaram desatualizados.

Reexecutar o ambiente inteiro pode custar tempo e dificultar o diagnóstico. O escopo da correção deve seguir a linhagem do dado afetado.

## Um exemplo de falha que se propaga

Se a bronze não conseguir converter os valores recebidos, a silver dependente pode não ser executada. A gold pode continuar com dados de uma execução anterior. Encontrar a tabela gold no banco, portanto, não comprova que ela foi atualizada hoje.

Ao investigar, compare a execução do Airflow, o modelo dbt correspondente e a data de referência dos dados. Os três elementos respondem a perguntas diferentes: quando a tarefa rodou, qual transformação foi usada e a que período o conteúdo se refere.

Uma tarefa impedida por uma falha anterior não tem necessariamente um defeito próprio. Comece pela tarefa que falhou e só depois avalie os resultados dependentes que precisam ser atualizados.

## Veja também

- [Prática: schema e testes antes do SQL](../tutoriais/engenharia-dbt-pratica.md)
- [Prática: rastrear uma transformação até a gold](../guias/engenharia-cadeia-pratica.md)
