# Clientes Python: uma responsabilidade por fonte

> Tipo: **Explicação**

## Contrato de integração por fonte

O cliente concentra autenticação, paginação e tratamento de respostas da fonte. Se essas responsabilidades estiverem espalhadas por várias DAGs, uma mudança na API exigirá correções em múltiplos pontos.

## Exemplo: entrada e saída de uma função de coleta

Este código é uma simulação em Python, sem chamada à internet:

```python
def buscar_contratos(orgao):
    registros = [
        {"id": 10, "orgao": "A", "valor": 100},
        {"id": 20, "orgao": "B", "valor": 200},
    ]
    return [linha for linha in registros if linha["orgao"] == orgao]

print(buscar_contratos("A"))
```

Para o recorte do órgão A, a saída esperada é `[{"id": 10, "orgao": "A", "valor": 100}]`. O contrato de saída preserva os registros solicitados e não calcula o indicador final.

O filtro aqui simula o pedido “buscar registros do órgão A”; não calcula um indicador. Um cliente real precisa traduzir esse pedido para a interface da fonte, tratar erros e devolver os registros no formato combinado. A soma por órgão continua sendo responsabilidade da transformação.

## Divisão de responsabilidades

- **Cliente:** autentica, faz requisições, percorre páginas e interpreta respostas.
- **Helper:** oferece uma função reutilizável, como leitura de arquivo ou retentativa.
- **DAG:** define execução, dependências e chamada do cliente.
- **Cliente PostgreSQL:** grava os registros conforme a chave e a estratégia de carga.

Procure `cliente_*.py` em `airflow_lappis/plugins/` e as DAGs correspondentes em `dags/data_ingest/`.

## O que deve ficar explícito

A entrada do cliente inclui parâmetros como período e página. A saída deve ter formato previsível. Falha de conexão, resposta inválida e ausência legítima de registros são situações diferentes e precisam ser distinguíveis.

Tipagem ajuda a tornar esse contrato legível. A verificação Python do projeto inclui `mypy` em modo estrito; confira os comandos efetivos no `Makefile`.

## Regra de separação

O cliente não deve calcular o indicador final que o dbt também calcula. A ingestão traz os registros; a regra de negócio tem um lugar definido na transformação.

Ao estudar uma nova fonte, siga uma única coleta da DAG ao cliente e ao banco. Entender esse percurso é mais útil do que abrir todas as coletas ao mesmo tempo.

## Veja também

- [Quando sobrescrever e quando guardar histórico](engenharia-historico.md)
- [REST, SOAP, e-mail, bancos e arquivos](../referencia/engenharia-fontes.md)
