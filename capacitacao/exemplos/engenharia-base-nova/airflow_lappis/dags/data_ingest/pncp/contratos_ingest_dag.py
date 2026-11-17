import logging
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import yaml
from airflow.decorators import dag, task
from airflow.exceptions import AirflowFailException
from airflow.models import Variable
from airflow.models.param import Param

from cliente_pncp import ClientePNCP
from cliente_postgres import ClientPostgresDB
from postgres_helpers import get_postgres_conn
from schedule_loader import get_dynamic_schedule


@dag(
    schedule_interval=get_dynamic_schedule("pncp_contratos_ingest_dag"),
    start_date=datetime(2026, 1, 1),
    catchup=False,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=2)},
    params={
        "data_inicial": Param(None, type=["null", "string"], description="AAAAMMDD"),
        "data_final": Param(None, type=["null", "string"], description="AAAAMMDD"),
    },
    tags=["pncp", "contratos"],
)
def pncp_contratos_ingest_dag() -> None:
    """Contratos publicados no PNCP pelo órgão configurado em airflow_variables."""

    @task
    def coletar(**context: Any) -> list[dict]:
        orgao = Variable.get("airflow_orgao")
        config = yaml.safe_load(Variable.get("airflow_variables"))
        cnpj = config.get(orgao, {}).get("orgao_pncp")
        if not cnpj:
            # Erro de configuração: tentar de novo não resolve.
            raise AirflowFailException(
                f"airflow_variables não tem orgao_pncp para o órgão '{orgao}'"
            )

        hoje = datetime.now()
        data_inicial = context["params"]["data_inicial"] or (
            hoje - timedelta(days=30)
        ).strftime("%Y%m%d")
        data_final = context["params"]["data_final"] or hoje.strftime("%Y%m%d")

        api = ClientePNCP()
        api.DEFAULT_TIMEOUT = 60
        registros: list[dict] = []
        pagina, total_paginas = 1, 1
        while pagina <= total_paginas:
            itens, total_paginas = api.get_contratos(
                data_inicial, data_final, cnpj, pagina
            )
            registros.extend(itens)
            pagina += 1

        # Convenção do repositório: hora de Brasília, sem fuso. O bronze acrescenta
        # '-03:00'. datetime.now() sozinho usaria o relógio do container, em UTC.
        dt_ingest = (
            datetime.now(ZoneInfo("America/Sao_Paulo")).replace(tzinfo=None).isoformat()
        )
        for registro in registros:
            registro["dt_ingest"] = dt_ingest
        logging.info(
            "%s contratos do CNPJ %s publicados entre %s e %s",
            len(registros),
            cnpj,
            data_inicial,
            data_final,
        )
        return registros

    @task
    def gravar(registros: list[dict]) -> dict:
        if registros:
            ClientPostgresDB(get_postgres_conn()).insert_data(
                registros,
                table_name="contratos",
                conflict_fields=["numeroControlePNCP"],
                primary_key=["numeroControlePNCP"],
                schema="pncp",
            )
        dt_ingest = registros[0]["dt_ingest"] if registros else None
        return {"enviados": len(registros), "dt_ingest": dt_ingest}

    @task
    def conferir(carga: dict) -> None:
        if carga["enviados"] == 0:
            logging.info("Nenhum contrato publicado no período")
            return
        # dt_ingest foi gerado pela própria DAG: não vem de fora.
        consulta = "select count(*) from pncp.contratos where dt_ingest = '{}'"
        [(gravados,)] = ClientPostgresDB(get_postgres_conn()).execute_query(
            consulta.format(carga["dt_ingest"])
        )
        logging.info(
            "Enviados: %s | Gravados nesta carga: %s", carga["enviados"], gravados
        )
        if gravados != carga["enviados"]:
            raise ValueError(f"Enviados {carga['enviados']}, gravados {gravados}")

    conferir(gravar(coletar()))


pncp_contratos_ingest_dag()
