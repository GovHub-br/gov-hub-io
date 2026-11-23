# Prática: gravar sem duplicar

> Tipo: **Tutorial**

> Notebook: [engenharia-fundamentos-gravar.ipynb](../../notebooks/engenharia-fundamentos-gravar.ipynb) · Colab

Os arquivos da coleta precisam chegar a um banco de dados, onde é possível consultá-los com SQL. A parte difícil não é gravar: é gravar de um jeito que possa ser repetido. Pipelines rodam de novo o tempo todo, por falha, por correção ou por engano, e cada nova execução não pode somar ao que já estava lá.

## O que você vai aprender

- Criar um banco de dados num arquivo, com o DuckDB.
- Por que a tabela bruta guarda tudo como texto.
- Ver uma carga duplicar na segunda execução.
- Tornar a carga **idempotente**: rodar de novo dá o mesmo resultado.

## Antes de começar

O notebook refaz a coleta da aula anterior na Preparação, numa célula recolhida. Assim ele funciona sozinho, mesmo que você não tenha feito a outra prática.

## Passo 1: criar o banco e a tabela

O **DuckDB** é um banco de dados SQL que roda dentro do Python e guarda tudo num único arquivo, aqui `pedala.duckdb`. Ele dispensa servidor, mas o SQL é praticamente o mesmo de um PostgreSQL.

<!-- explica: Abre o arquivo `pedala.duckdb`, criando-o se ele ainda não existir, e cria a tabela `raw_viagens` com todas as colunas como texto (`varchar`), do jeito que vieram da API. O `if not exists` deixa rodar a célula de novo sem erro. -->

```python
con = duckdb.connect("pedala.duckdb")       # o banco é este arquivo
con.execute("""
    create table if not exists raw_viagens (
        data_ref        varchar,
        id_viagem       varchar,
        id_usuario      varchar,
        estacao_saida   varchar,
        estacao_chegada varchar,
        inicio          varchar,
        fim             varchar,
        coletado_em     varchar
    )
""")
```

Todas as colunas são `varchar`, texto. A tabela bruta, a **raw**, guarda o dado do jeito que veio; converter datas e números é trabalho da próxima etapa. Assim, um valor estranho na fonte não impede a carga: ele chega, fica registrado e é tratado depois. As duas colunas extras dizem **de que dia** é a linha (`data_ref`) e **quando** ela foi coletada (`coletado_em`).

## Passo 2: gravar, e gravar de novo

A função mais simples possível lê o arquivo e insere as linhas. Rode a carga dos sete dias duas vezes:

<!-- explica: Define a gravação mais simples: lê o arquivo do dia e insere as linhas, sem olhar o que já existe na tabela. Cada `?` recebe o valor de uma coluna da linha. Rodada duas vezes, ela grava cada dia duas vezes. -->

```python
def gravar_dia_ingenuo(con, arquivo):
    data, linhas = linhas_do_arquivo(arquivo)
    con.executemany("insert into raw_viagens values (?, ?, ?, ?, ?, ?, ?, ?)", linhas)
```

```text
Depois da rodada 1: 624 linhas
Depois da rodada 2: 1248 linhas
```

A segunda rodada inseriu tudo de novo. Num pipeline, isso acontece sempre que alguém reexecuta um dia, e os números de todas as camadas seguintes dobram sem nenhum erro aparecer.

## Passo 3: substituir o dia

A correção: antes de inserir um dia, apague o que já existe **daquele dia**. As duas operações ficam numa **transação** (`begin` … `commit`), para que aconteçam juntas ou não aconteçam. Se algo falhar no meio, o `rollback` desfaz o `delete` e o dia antigo volta inteiro: nunca fica um dia apagado e não regravado.

<!-- explica: Define `gravar_dia`: dentro de uma transação, apaga as linhas do dia (`delete`) e insere as novas. Se algo falhar no meio, o `rollback` desfaz o `delete` e o dia antigo volta inteiro. Por isso rodar duas vezes deixa o mesmo resultado. -->

```python
def gravar_dia(con, arquivo):
    """Substitui o dia inteiro: apaga o que havia daquele dia e grava de novo, numa transação."""
    data, linhas = linhas_do_arquivo(arquivo)
    con.execute("begin")
    try:
        con.execute("delete from raw_viagens where data_ref = ?", [data])
        con.executemany("insert into raw_viagens values (?, ?, ?, ?, ?, ?, ?, ?)", linhas)
        con.execute("commit")
    except Exception:
        con.execute("rollback")              # desfaz o delete: o dia antigo volta inteiro
        raise
    return len(linhas)
```

```text
Depois da rodada 1: 624 linhas
Depois da rodada 2: 624 linhas
     data_ref  linhas
0  2026-06-01      88
1  2026-06-02     106
2  2026-06-03      97
3  2026-06-04      99
4  2026-06-05     100
5  2026-06-06      60
6  2026-06-07      74
```

![Gravar duas vezes: somar ou substituir. À esquerda, inserir sem pensar: a rodada 1 deixa 624 linhas e a rodada 2, 1.248, porque toda nova execução soma ao que já estava lá. À direita, substituir o dia: begin, delete do dia, insert e commit; a rodada 1 deixa 624 linhas e a rodada 2 também, porque a carga é idempotente. Embaixo: 624 linhas para 623 viagens, porque a repetição que a API mandou em 03/06 fica na raw, que espelha a fonte.](../../assets/diagramas/engenharia-fundamentos-gravar.png)

**Leia assim:** 624 linhas para 623 viagens. A viagem que a API repetiu em 03/06 continua aqui, porque a raw é um espelho da fonte. O que mudou é que rodar de novo não acrescenta nada: a carga agora é idempotente.

Por que apagar o **dia**, e não a tabela inteira? Porque o pipeline roda um dia por vez. Refazer 05/06 não pode mexer em 04/06.

## Sua vez: o cadastro das estações

No notebook, você grava o cadastro em `raw_estacoes`, também sem duplicar. Como o cadastro é pequeno, a forma mais simples é substituir a tabela inteira a cada carga, com `create or replace table`. A conferência grava duas vezes e espera continuar com 8 estações.

## Passo 4: fechar e abrir de novo

```text
624 linhas continuam no arquivo
```

O dado está no arquivo `pedala.duckdb`, e não na memória do notebook: fechar a conexão e abrir outra não perde nada. É isso que um banco acrescenta aos arquivos da coleta: um lugar durável, consultável com SQL, onde várias etapas leem e escrevem.

## Erros comuns

| Erro | Consequência | Como evitar |
|---|---|---|
| `insert` sem apagar antes | Cada nova execução duplica o dia | Apagar o dia e inserir, numa transação |
| Apagar e inserir fora de transação | Uma falha no meio deixa o dia vazio | `begin` … `commit` |
| Transação sem `rollback` no erro | A conexão fica presa numa transação aberta, com o dia pela metade, e o próximo `begin` falha | `rollback` no `except`, e depois levantar o erro |
| Apagar a tabela inteira para refazer um dia | Os outros dias somem junto | Apagar só `where data_ref = ?` |
| Converter tipos na raw | Um valor inesperado derruba a carga inteira | Raw em texto; conversão na bronze |

## Confira o que entendeu

1. A gravação de 04/06 falhou depois do `delete` e antes do `commit`. Como fica a tabela?
2. Alguém propõe resolver a duplicação com `select distinct` em todas as consultas. Por que isso é pior do que a carga idempotente?

## Respostas comentadas

1. Como estava antes: o `except` chama `rollback`, que desfaz o `delete`, e as linhas antigas de 04/06 continuam lá. O erro segue para cima, para quem chamou saber que falhou, e basta rodar de novo. Sem o `rollback`, a transação ficaria aberta: a própria conexão veria o dia pela metade e o próximo `begin` falharia com *cannot start a transaction within a transaction*. Foi o que o DuckDB fez quando testamos.
2. Porque esconde o problema em vez de evitá-lo. A tabela continua crescendo a cada execução, toda consulta precisa lembrar do `distinct` e ele ainda apagaria a diferença entre uma linha duplicada por engano e duas linhas legítimas iguais. A carga idempotente deixa a tabela certa na origem.

## Próximos passos

- [Prática: transformar em camadas](engenharia-fundamentos-camadas.md)
