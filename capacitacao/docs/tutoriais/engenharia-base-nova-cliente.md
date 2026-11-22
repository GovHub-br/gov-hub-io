# Prática: o cliente da fonte

> Tipo: **Tutorial**

## O que você vai construir

Um método novo, `ClientePNCP.get_contratos`, que busca uma página de contratos do PNCP. Você vai escrevê-lo a partir do que a avaliação da fonte descobriu, conferi-lo contra a API de verdade e deixar um teste que garante que uma falha da API para a carga.

![O caminho desta prática em três etapas. Primeiro, o método get_contratos, em plugins/cliente_pncp.py. Depois, a conferência contra a API real, nas três respostas que a avaliação da fonte mostrou: 200 com registros devolve a lista e o total de páginas, 204 sem corpo devolve lista vazia e zero páginas, e qualquer outro status levanta um erro. Por fim, um teste em tests/test_plugins/ garante que as falhas, a API que não responde e o pedido errado, levantam erro em vez de virar lista vazia.](../../assets/diagramas/engenharia-base-nova-cliente.png)

O cliente é a primeira peça do caminho da [issue ao painel](../explicacao/engenharia-base-nova.md). Se ele for confiável, a DAG pode tratá-lo como uma caixa fechada.

## O que você vai aprender

- Decidir se uma fonte pede uma classe nova ou um método novo.
- Transformar o que a [avaliação da fonte](../guias/engenharia-avaliar-fonte.md) descobriu (`204` sem corpo, limite de 500, `422`) em código.
- Conferir o método contra a API real.
- Escrever um teste para as falhas, o comportamento que ninguém perceberia se fosse desfeito.

## Antes de começar

- O repositório `data-application-gov-hub` com `make setup` concluído, como na [prática do nível 2](engenharia-ambiente.md).
- O ambiente no ar (`docker compose ps`), para o passo 3.
- Uma branch para o estudo. Ela não será enviada ao GitHub:

<!-- explica: Cria a branch `feat/pncp-contratos` a partir do ponto em que você está e muda para ela. Os commits do estudo ficam separados da `main`. -->

```bash
git checkout -b feat/pncp-contratos
```

## Passo 1: decidir onde o código mora

O repositório tem **um cliente por fonte**, e o do PNCP já existe em `airflow_lappis/plugins/cliente_pncp.py`. A regra para decidir:

| Situação | O que fazer |
|---|---|
| Fonte nova, com outro endereço e outras regras | Classe nova, em `plugins/cliente_<fonte>.py` |
| Endpoint novo de uma fonte que já tem cliente | Método novo na classe existente |

Contratos são outro endpoint da mesma API (`/api/consulta/v1/contratos`), com o mesmo endereço-base. O caminho certo é um método novo em `ClientePNCP`, escrito no mesmo estilo do método vizinho, `get_contratacoes_publicacao`.

## Passo 2: escrever o método

Em `cliente_pncp.py`, dentro de `ClientePNCP`, logo antes de `get_itens_e_resultados`:

```python
    def get_contratos(
        self,
        data_inicial: str,
        data_final: str,
        cnpj_orgao: str,
        pagina: int = 1,
        tamanho_pagina: int = 500,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Busca uma página de contratos publicados no PNCP por um órgão.

        Returns:
            (registros, total_paginas). Sem contratos no período: ([], 0).

        Raises:
            RuntimeError: se a API não responder com sucesso, para que uma carga
            incompleta não pareça completa.
        """
        status, corpo = request_safe(
            self,
            http.HTTPMethod.GET,
            "/consulta/v1/contratos",
            headers={"accept": "application/json"},
            params={
                "dataInicial": data_inicial,
                "dataFinal": data_final,
                "cnpjOrgao": cnpj_orgao,
                "pagina": pagina,
                "tamanhoPagina": tamanho_pagina,
            },
        )
        if status == http.HTTPStatus.NO_CONTENT:
            return [], 0
        if status != http.HTTPStatus.OK or not isinstance(corpo, dict):
            raise RuntimeError(f"PNCP /contratos respondeu {status.value}: {corpo!r}")
        return corpo["data"], corpo["totalPaginas"]
```

Cada decisão vem da avaliação da fonte:

| No método | Por quê |
|---|---|
| `tamanho_pagina` padrão de 500 | É o máximo que a API aceita; acima disso, ela responde `400` |
| Devolve a página e o total de páginas | Como `get_contratacoes_publicacao`. Quem chama decide o laço, e o cliente continua sem estado |
| `204` vira `([], 0)` | É a resposta normal de um período sem contratos, e não um erro |
| Qualquer outra resposta levanta `RuntimeError` | Uma falha não pode virar lista vazia: a carga incompleta pareceria completa. A mensagem leva o status e o corpo, para quem ler o log saber o que houve |
| Tipos nos parâmetros e no retorno | O `make lint` roda o `mypy` em todo o repositório |

## Passo 3: conferir contra a API real

Confira o método de verdade, dentro do container do Airflow, que enxerga a internet e o código atualizado:

<!-- explica: Roda, dentro do container do Airflow, um Python que chama o `get_contratos` novo contra a API real nas três situações da avaliação da fonte: o semestre com dados, os dois dias sem contratos e a data com hífens, que deve virar `RuntimeError`. O tempo de espera sobe de 10 para 60 segundos, porque a API do PNCP às vezes demora. -->

```bash
docker compose exec airflow python -c "
import logging; logging.disable(logging.CRITICAL)
from cliente_pncp import ClientePNCP
api = ClientePNCP(); api.DEFAULT_TIMEOUT = 60
registros, total_paginas = api.get_contratos('20260101', '20260630', '33892175000100')
print(len(registros), 'registros em', total_paginas, 'página(s)')
print(api.get_contratos('20260101', '20260102', '33892175000100'))
try:
    api.get_contratos('2026-01-01', '20260630', '33892175000100')
except RuntimeError as e:
    print('RuntimeError:', str(e)[:140])
"
```

```text
30 registros em 1 página(s)
([], 0)
RuntimeError: PNCP /contratos respondeu 422: {'path': '/pncp-consulta/v1/contratos', 'message': 'Data Inicial com tamanho inválido.', 'error': '422 UNPROCESSABLE_ENTITY
```

Leia assim: são as três situações da avaliação da fonte. Os contratos do Ipea no primeiro semestre, o período vazio (`([], 0)`) e a data em formato errado, que agora para a carga com uma mensagem útil. O `logging.disable` só silencia os logs do cliente, para a saída ficar curta.

Se o `docker compose exec airflow` falhar porque o container não está de pé, volte ao [nível 2](../guias/engenharia-airflow-configuracao.md). Os números dependem da fonte: se o Ipea publicar contratos retroativos, o total pode ser maior que 30.

## Passo 4: um teste para as falhas

No repositório, só 4 dos 12 clientes têm testes, e eles chegaram depois, em PRs próprios. Você não precisa cobrir cada resposta da API: o passo 3 já mostrou o caso com dados e o período vazio, e um erro neles aparece na primeira execução. A falha é diferente. Se alguém trocar o `raise` por um `return [], 0`, nada quebra: a DAG termina verde, com dados faltando. É essa decisão que merece um teste.

Crie `tests/test_plugins/test_cliente_pncp.py`:

```python
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
```

Leia assim:

- **Os dois `patch` impedem que o teste fale com a internet.** O primeiro troca o cliente HTTP por um objeto de mentira; o segundo troca a chamada à API por uma resposta combinada.
- **`parametrize` roda o mesmo teste com as duas falhas**: a API que não responde (`503`, que o cliente recebe depois de esgotar as tentativas) e o pedido errado (`422`, que a avaliação da fonte mostrou).
- **`pytest.raises` exige o `RuntimeError`**, com o status na mensagem.

O arquivo `tests/conftest.py` do repositório já coloca `plugins/` e `helpers/` no caminho de importação, então `from cliente_pncp import ClientePNCP` funciona. Rode:

<!-- explica: Roda com o pytest, pelo ambiente do Poetry, só o teste do cliente do PNCP, uma vez para cada falha. `--no-cov` desliga o relatório de cobertura, que o projeto liga por padrão e que aqui só alongaria a saída. -->

```bash
poetry run pytest tests/test_plugins/test_cliente_pncp.py --no-cov
```

```text
tests/test_plugins/test_cliente_pncp.py::test_get_contratos_levanta_erro_quando_a_api_falha[api_nao_responde] PASSED [ 50%]
tests/test_plugins/test_cliente_pncp.py::test_get_contratos_levanta_erro_quando_a_api_falha[pedido_errado] PASSED [100%]
============================== 2 passed in 0.05s ===============================
```

## Erros comuns

- **Devolver lista vazia quando a API falha.** A carga parece completa, e o dado some sem alarme. É o que o teste impede.
- **Pedir mais de 500 por página.** A API responde `400 Tamanho de página inválido`.
- **Testar só com resposta combinada.** O teste prova a lógica do método, não a API. A conferência do passo 3, contra a API real, continua necessária.

## O que você aprendeu

- Um endpoint novo de uma fonte existente é um método novo no cliente dela.
- O que a avaliação da fonte descobriu vira decisão de código: tamanho da página, `204` como período vazio e erro para todo o resto.
- A conferência contra a API real mostra que o método funciona; o teste guarda a decisão que, desfeita, ninguém notaria.

## Confira o que entendeu

1. A API respondeu `429 Too Many Requests`. O `get_contratos` devolve uma lista vazia ou levanta um erro? E por quê?
2. Por que o teste cobre as falhas, e não o caso com dados?

## Respostas comentadas

1. Levanta `RuntimeError`. Só `200` com dados e `204` têm tratamento próprio; todo o resto é falha. Uma lista vazia pareceria um período sem contratos, e a carga seguiria como se estivesse completa.
2. Porque um erro no caso com dados aparece na primeira execução: a conferência do passo 3 e a DAG mostram números errados ou nenhum número. Uma falha transformada em lista vazia não aparece em lugar nenhum: a DAG termina verde e o dado falta. O teste existe para o que é silencioso.

## Próximos passos

- [Prática: a DAG de ingestão no padrão do repositório](engenharia-base-nova-dag.md)
- [Fontes e clientes do repositório](../referencia/engenharia-fontes.md)
