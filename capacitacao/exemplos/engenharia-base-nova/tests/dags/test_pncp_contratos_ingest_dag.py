from pathlib import Path
from unittest.mock import patch

from airflow.models import DagBag

ARQUIVO_DAG = (
    Path(__file__).parents[2]
    / "airflow_lappis/dags/data_ingest/pncp/contratos_ingest_dag.py"
)


def test_dag_de_contratos_carrega_com_tres_tarefas_em_ordem() -> None:
    # get_dynamic_schedule lê a Variable dynamic_schedules ao carregar a DAG;
    # aqui não há banco do Airflow, então a leitura devolve "nenhum horário".
    with patch("airflow.models.Variable.get", return_value={}):
        dagbag = DagBag(dag_folder=str(ARQUIVO_DAG), include_examples=False)

    assert dagbag.import_errors == {}
    dag = dagbag.dags["pncp_contratos_ingest_dag"]
    assert [t.task_id for t in dag.topological_sort()] == [
        "coletar",
        "gravar",
        "conferir",
    ]
