from http import HTTPStatus
from unittest.mock import patch

import pytest

from cliente_pncp import ClientePNCP


@pytest.mark.parametrize(
    "falha",
    [
        (HTTPStatus.SERVICE_UNAVAILABLE, "request_error: timeout"),
        (HTTPStatus.UNPROCESSABLE_ENTITY, {"message": "Data Inicial inválida."}),
    ],
    ids=["api_nao_responde", "pedido_errado"],
)
def test_get_contratos_levanta_erro_quando_a_api_falha(
    falha: tuple[HTTPStatus, object],
) -> None:
    # Uma falha não pode virar lista vazia: a carga incompleta pareceria completa.
    with patch("cliente_base.httpx.Client"):
        cliente = ClientePNCP()
    with patch("cliente_pncp.request_safe", return_value=falha):
        with pytest.raises(RuntimeError, match=str(falha[0].value)):
            cliente.get_contratos("20260101", "20260630", "33892175000100")
