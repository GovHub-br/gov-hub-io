# DAGs, tarefas e configuração no Airflow

> Tipo: **Referência**

## O Airflow organiza o trabalho, não guarda o indicador

Imagine três tarefas: buscar contratos, gravar os registros e calcular o resumo. A segunda precisa da primeira; a terceira precisa dos dados gravados. O Airflow registra essa ordem e acompanha se cada tarefa conseguiu terminar.

**DAG** é a sigla de grafo acíclico dirigido. “Grafo” significa um conjunto de elementos ligados; “dirigido” indica a direção das dependências; “acíclico” significa que o caminho não volta ao início formando um ciclo. Na tela, isso aparece como caixas ligadas por setas.

Uma **execução** é uma ocasião em que a DAG roda. A mesma definição pode ter uma execução hoje e outra amanhã. Um erro em uma execução não significa necessariamente que o arquivo da DAG deixou de existir.

## Conceitos para ler uma DAG

| Termo | Papel |
|---|---|
| DAG | Define tarefas e dependências, sem ciclos |
| Task | Uma unidade de execução |
| Operador | Implementação de um tipo de tarefa |
| `schedule` | Define o agendamento |
| `catchup` | Controla a criação automática de execuções de intervalos passados |
| `retries` | Quantidade de novas tentativas após falha |
| `max_active_runs` | Limite de execuções simultâneas da DAG |
| TaskFlow | Define DAGs e tarefas com `@dag` e `@task` |

## Configuração e comunicação

**Variables** guardam configuração, como `airflow_orgao`, `airflow_variables` e `dynamic_schedules`. **Connections** guardam parâmetros de acesso, como `postgres_default`. No ambiente local, `make dev` prepara esses valores.

**XCom** transporta pequenas mensagens entre tarefas. Prefira passar referência ou caminho para um arquivo a transferir grandes conjuntos de dados. Veja um exemplo em `sgac/projetos_sgac_ingest_dag.py`.

## Exemplo: configuração e comportamento esperado

Considere uma DAG de estudo com três tarefas: coletar, gravar e transformar.

| Elemento | Exemplo | Efeito |
|---|---|---|
| Dependência | Gravar depende de coletar | Não grava antes de a coleta concluir com sucesso, usando a regra padrão |
| `retries` | 2 | Até duas novas tentativas depois da tentativa inicial |
| `max_active_runs` | 1 | Uma execução ativa dessa DAG por vez |
| XCom | Caminho `estudo/contratos.csv` | A próxima tarefa recebe a referência, não o arquivo inteiro |
| Connection | `postgres_default` | A tarefa consulta a configuração de acesso ao banco |

Com `retries = 2`, uma falha persistente pode resultar em três tentativas no total. Isso não quer dizer que três execuções diárias foram agendadas.

Com `catchup` desligado, ativar uma DAG não cria automaticamente todas as execuções históricas que ficaram para trás. Ainda é possível planejar um reprocessamento explícito quando a DAG o permite.

## Exemplo: reconhecer os decoradores no código

Este trecho é para leitura em um ambiente com Airflow instalado; não acessa fontes nem bancos:

```python
from datetime import datetime
from airflow.decorators import dag, task

@dag(start_date=datetime(2026, 1, 1), schedule=None, catchup=False)
def exemplo_formacao():
    @task
    def contar_registros():
        return 2

    @task
    def mostrar_quantidade(quantidade):
        print(f"Registros recebidos: {quantidade}")

    mostrar_quantidade(contar_registros())

dag_formacao = exemplo_formacao()
```

`@dag` define a rotina; `@task` define cada tarefa. A chamada final liga a saída de `contar_registros` à entrada de `mostrar_quantidade`: a segunda depende da primeira. O pequeno número é passado por XCom. Em uma execução no Airflow, o log da segunda tarefa deve mostrar `Registros recebidos: 2`.

`schedule=None` deixa este exemplo sem agendamento automático. Definir o código não equivale a já ter executado as tarefas: elas serão executadas pelo Airflow quando houver uma execução da DAG.

## Qual versão estudar

A aplicação usa Airflow **2.8.1**, localmente em modo standalone com LocalExecutor. Confira a versão instalada antes de seguir telas e exemplos de outra versão.

O ambiente mantém `ENABLE_XCOM_PICKLING` ligado, uma configuração que exige revisão de segurança com a equipe. Isso não é uma recomendação para ativá-lo em ambientes novos.

## Agendamento, tentativa e dependência são coisas diferentes

O agendamento define quando criar uma execução. A dependência define o que precisa acontecer antes de uma tarefa. A retentativa define o que fazer depois que uma tarefa falha. Alterar um desses elementos não corrige automaticamente os outros.

Os símbolos `@dag` e `@task` são **decoradores** Python: marcações que transformam funções em elementos reconhecidos pelo Airflow. Você pode começar identificando os nomes das tarefas e suas relações antes de estudar essa sintaxe.

Standalone reúne os componentes do Airflow para facilitar o ambiente local. LocalExecutor indica que as tarefas são executadas no próprio ambiente do Airflow. Esses nomes descrevem a organização da execução, não o conteúdo dos registros coletados.

## Veja também

- [Prática: do cliente mínimo à camada raw](../tutoriais/engenharia-cliente-pratica.md)
- [Prática: executar e investigar uma DAG](../tutoriais/engenharia-airflow-pratica.md)
