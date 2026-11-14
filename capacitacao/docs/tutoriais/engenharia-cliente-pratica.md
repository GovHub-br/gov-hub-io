# Prática: do cliente mínimo à camada raw

> Tipo: **Tutorial**

## O que você vai construir

Uma coleta pequena em Python, primeiro com respostas inventadas e depois com gravação em uma tabela local. Assim você entende cada parte sem depender de uma API ou credencial real.

## Ambiente da prática

Use o Jupyter local em `http://localhost:8888`, com kernel Python e acesso ao PostgreSQL da aplicação. Execute os blocos Python em sequência; a gravação SQL usa o mesmo banco que será acessado pelo projeto dbt na próxima prática.

## 1. Representar duas páginas de resposta

```python
paginas = [
    [{"id": 1, "orgao": "A", "valor": 100}],
    [{"id": 2, "orgao": "B", "valor": 200}],
]
print(paginas[0])
```

A entrada simula duas páginas, cada uma com um registro. A coleta deve reunir ambos sem perder a identificação e os valores de origem.

## 2. Reunir os registros e conferir a saída

Reúna as páginas e valide quantidade e identidade dos registros:

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

As verificações exigem dois registros com IDs 1 e 2. A saída deve preservar os valores 100 e 200, sem agregar nem aplicar regras de indicador.

## 3. Simular uma página ausente

Execute `coletar([paginas[0], None])` para simular uma página ausente. A execução deve falhar com `ValueError: Uma página não foi recebida`, em vez de aceitar a primeira página como carga completa. Depois, retome o exemplo válido com `registros = coletar(paginas)`.

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

A chave primária em `id` define o conflito do upsert. A atualização usa os valores recebidos em `excluded`, preservando a identidade dos registros nas reexecuções.

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

A validação da coleta em memória e a conferência da persistência são controles distintos. Nesta prática, os blocos Python e SQL são executados separadamente; na aplicação, a integração é feita pelo cliente PostgreSQL.

## Resultado esperado

Você reuniu páginas com Python, reconheceu uma falha e demonstrou a repetição de carga no banco. A tabela de estudo permanece com duas linhas e total 350 após a correção. Esses resultados serão a entrada da próxima prática de transformação.

## Veja também

- [Paginação, tempo limite e falha visível](../guias/engenharia-resiliencia.md)
- [DAGs, tarefas e configuração no Airflow](../referencia/engenharia-airflow.md)
