# Prática: do cliente mínimo à camada raw

> Tipo: **Tutorial**

## O que você vai construir

Uma coleta pequena em Python, primeiro com respostas inventadas e depois com gravação em uma tabela local. Assim você entende cada parte sem depender de uma API ou credencial real.

## Abrir um caderno de estudo

Com o ambiente iniciado, abra o Jupyter em `http://localhost:8888`. Crie um notebook com kernel Python disponível. Um **notebook**, ou caderno, combina texto e células de código; o **kernel** é o processo que executa esse código. Se não houver um kernel Python disponível, conclua a configuração do Jupyter antes de continuar.

Selecione uma célula, cole o primeiro bloco e use Shift+Enter para executá-lo. A saída aparece abaixo. Execute as células na ordem; uma célula posterior pode usar nomes definidos na anterior.

## 1. Representar duas páginas de resposta

```python
paginas = [
    [{"id": 1, "orgao": "A", "valor": 100}],
    [{"id": 2, "orgao": "B", "valor": 200}],
]
print(paginas[0])
```

Colchetes criam uma **lista**, uma sequência de elementos. Chaves criam um **dicionário**, com nomes e valores, como `"id": 1`. Aqui há duas páginas, cada uma contendo um registro. Python começa a contar posições em zero: `paginas[0]` é a primeira página.

## 2. Reunir os registros e conferir a saída

Em outra célula, execute:

```python
def coletar(paginas_recebidas):
    registros = []
    for pagina in paginas_recebidas:
        if pagina is None:
            raise ValueError("Uma página não foi recebida")
        registros.extend(pagina)
    return registros

registros = coletar(paginas)
assert len(registros) == 2
assert {linha["id"] for linha in registros} == {1, 2}
print(registros)
```

`def` define a função; `for` repete os passos para cada página; `extend` acrescenta os registros à lista de saída; `return` devolve essa lista. Preserve os espaços no início das linhas.

`assert` verifica uma condição: se for falsa, a execução acusa erro. `len` conta os elementos, e o conjunto de IDs confere quais registros chegaram. O resultado deve mostrar duas linhas, com valores 100 e 200.

## 3. Simular uma página ausente

Execute `coletar([paginas[0], None])` em uma célula separada. `None` representa ausência de valor; `raise` interrompe a função com uma mensagem explícita. Você deve ver `ValueError: Uma página não foi recebida`. Essa falha é intencional. Depois, execute novamente `registros = coletar(paginas)` para retomar o exemplo válido.

## 4. Gravar no PostgreSQL local

No editor SQL conectado ao banco local, execute este exemplo separado. Ele reproduz os registros do caderno, sem conectar Python ao banco ainda:

```sql
create schema if not exists formacao;
create table if not exists formacao.empenhos_estudo (
    id integer primary key,
    orgao text not null,
    valor numeric not null
);
insert into formacao.empenhos_estudo (id, orgao, valor)
values (1, 'A', 100), (2, 'B', 200)
on conflict (id) do update
set orgao = excluded.orgao, valor = excluded.valor;
select * from formacao.empenhos_estudo order by id;
```

`create schema` prepara a divisão de estudo; `create table` define as colunas; `primary key` identifica cada registro; `not null` impede valor ausente. `insert` grava os dados. Em um conflito de ID, `excluded` contém os valores que chegaram e serão usados na atualização.

Repita o bloco `insert` e confira duas linhas. Depois mude apenas 100 para 150 e execute o `insert` novamente: o primeiro registro deve mudar, o segundo continuar com 200. Guarde essa tabela para a prática dbt.

## 5. Reconhecer a integração da aplicação

O exercício separou coleta e gravação para tornar os resultados visíveis. No projeto, o cliente da fonte produz os registros e `cliente_postgres.py` realiza a gravação. Abra uma DAG de IBGE e localize onde esses dois componentes são chamados. Compare os argumentos recebidos, sem precisar reescrever toda a DAG neste primeiro contato.

A integração Python com o banco é o próximo passo de implementação: siga a interface existente de `insert_data`, em vez de supor seus argumentos. O exemplo SQL acima não conecta automaticamente o notebook à aplicação.

## Exemplo: confira a gravação em cada momento

Depois de executar os blocos de gravação no banco local, compare:

| Momento | IDs esperados | Valores na ordem dos IDs | Total |
|---|---|---|---|
| Primeiro `insert` | 1 e 2 | 100 e 200 | 300 |
| Repetição sem mudanças | 1 e 2 | 100 e 200 | 300 |
| Correção do ID 1 | 1 e 2 | 150 e 200 | 350 |

O `select` ao final da prática mostra as linhas para essa comparação. Se aparecerem quatro registros após a repetição, o resultado não corresponde ao exemplo. Se o total continuar 300 após a correção, confira se você executou o `insert` alterado ou apenas editou o texto.

Na etapa Python, `print` exibe o conteúdo em memória. Ele não grava no PostgreSQL: a mudança só aparece na tabela depois da etapa de gravação. Essa diferença explica por que mudar uma célula do caderno não atualiza o banco automaticamente.

## Resultado esperado

Você reuniu páginas com Python, reconheceu uma falha e demonstrou a repetição de carga no banco. A tabela de estudo permanece com duas linhas e total 350 após a correção. Esses resultados serão a entrada da próxima prática de transformação.

## Veja também

- [Paginação, tempo limite e falha visível](../guias/engenharia-resiliencia.md)
- [DAGs, tarefas e configuração no Airflow](../referencia/engenharia-airflow.md)
