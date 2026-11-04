# Clientes Python: uma responsabilidade por fonte

> Tipo: **Explicação**

## O mínimo de Python para ler um cliente

**Python** é uma linguagem de programação: uma forma de escrever instruções que o computador consegue executar. Um arquivo `.py` guarda essas instruções. Você pode começar lendo nomes e responsabilidades, antes de escrever um programa completo.

Uma **variável** dá um nome a um valor, como `pagina = 1`. Uma **função** reúne passos sob um nome. Ela pode receber informações de entrada, chamadas **argumentos**, e devolver uma saída com `return`.

```python
def somar_valores(valor_a, valor_b):
    return valor_a + valor_b

total = somar_valores(100, 200)
```

`def` inicia a definição da função; os dois valores são somados e `total` recebe 300. Os espaços no início da linha indicam quais instruções pertencem à função. Copiá-los corretamente faz parte da sintaxe do Python.

Uma **API** é uma interface pela qual um programa faz pedidos a outro. O cliente transforma uma necessidade, como “buscar os contratos deste mês”, em pedidos que a fonte entende.

Uma API muda a autenticação. Se a lógica estiver espalhada por várias DAGs, cada coleta exigirá uma correção. Um cliente concentra a conversa com a fonte em um lugar.

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

A saída é `[{"id": 10, "orgao": "A", "valor": 100}]`. `orgao` é o argumento recebido; `==` compara valores; a expressão com `for` percorre os registros e mantém os que atendem à condição.

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

## Como ler sem se perder no arquivo

Procure primeiro as funções e seus argumentos. Um nome como `buscar_dados` sugere coleta; depois identifique onde há um pedido à fonte e onde a resposta é devolvida. Linhas com `import` trazem bibliotecas ou funções de outros arquivos.

**Autenticação** verifica a identidade de quem faz o pedido. **Tipagem** descreve o tipo esperado para um valor, como texto ou número. Essas informações ajudam a entender a entrada e a saída, mesmo quando você ainda não conhece todos os detalhes da implementação.

## Veja também

- [Quando sobrescrever e quando guardar histórico](engenharia-historico.md)
- [REST, SOAP, e-mail, bancos e arquivos](../referencia/engenharia-fontes.md)
