# Prática: testar o dado

> Tipo: **Tutorial**

> Notebook: [engenharia-fundamentos-testes.ipynb](../../notebooks/engenharia-fundamentos-testes.ipynb) · Colab

Testar código é conferir se a função faz o que deveria. Testar dado é conferir se a **tabela** está como deveria: sem viagem duplicada, sem duração negativa, sem perder nada no caminho. Os testes rodam a cada carga, porque o código pode estar certo e o dado de hoje, errado.

![Duas pessoas numa oficina revisando uma bicicleta presa num suporte de manutenção](../../assets/imagens/engenharia-fundamentos/revisao-da-bicicleta.jpg)

Uma bicicleta passa por revisão antes de voltar para a estação. O dado também.

## O que você vai aprender

- Escrever um teste como uma consulta que procura linhas com problema.
- Provar que um teste funciona, fazendo-o falhar de propósito.
- Separar **erro**, que impede o dado de seguir, de **aviso**, que chama alguém.
- Conferir que a gold não perdeu nem ganhou viagens: a **reconciliação**.

## Antes de começar

A Preparação do notebook refaz a coleta, a gravação e as camadas das aulas anteriores. Você começa com a silver e a gold prontas.

## Passo 1: um teste é uma consulta

Cada teste procura linhas que **não deveriam existir**. Nenhuma linha: passou. Alguma linha: falhou, e o resultado já mostra quais.

<!-- explica: Declara os testes num dicionário: o nome, a gravidade (`erro` para o pipeline, `aviso` só avisa) e uma consulta SQL que procura as linhas com problema. Nenhuma linha devolvida quer dizer que o teste passou. -->

```python
TESTES = {
    "uma linha por viagem": ("erro", """
        select id_viagem from silver_viagens group by id_viagem having count(*) > 1"""),
    "início e fim preenchidos": ("erro", """
        select id_viagem from silver_viagens where inicio is null or fim is null"""),
    "duração não negativa": ("erro", """
        select id_viagem from silver_viagens where duracao_min < 0"""),
    "estação de saída existe no cadastro": ("aviso", """
        select id_viagem from silver_viagens where estacao_desconhecida"""),
}
```

A função `rodar_testes` executa cada consulta e mostra um quadro por teste:

```text
[OK] uma linha por viagem
[OK] início e fim preenchidos
[OK] duração não negativa
[AVISO] estação de saída existe no cadastro: 3 linha(s)
   Aviso: o dado segue, mas alguém precisa olhar.
```

**Erro ou aviso?** Um **erro** quer dizer que o dado está errado e não deve seguir: viagem duplicada, duração negativa. Um **aviso** quer dizer que o dado segue, mas alguém precisa agir. As três viagens da estação E99 aconteceram; o que falta é a estação no cadastro, e isso é trabalho de quem cuida do cadastro, não do pipeline.

## Passo 2: fazer o teste falhar

Um teste que nunca falhou não prova nada: talvez a consulta esteja errada e nunca encontre problema. Rode os mesmos testes contra a bronze, que ainda não tem as regras da silver:

```text
[ERRO] uma linha por viagem: 1 linha(s)
[OK] início e fim preenchidos
[ERRO] duração não negativa: 2 linha(s)
[AVISO] estação de saída existe no cadastro: 3 linha(s)
   Aviso: o dado segue, mas alguém precisa olhar.
```

Sem as regras, o teste de linha única pega a viagem repetida e o de duração pega as duas viagens impossíveis. Agora você sabe que esses testes funcionam, e que a silver os faz passar.

![Cada teste procura um defeito. Uma tabela com quatro testes e o resultado sem as regras, na bronze, e na silver. Uma linha por viagem procura a mesma viagem duas vezes: falha com 1 sem as regras e passa na silver. Duração não negativa procura fim antes do início: falha com 2 e passa. Estação no cadastro procura saída de uma estação que não existe: aviso com 3 nas duas. Reconciliação procura gold com saídas a mais ou a menos que a silver: não se aplica sem as regras e passa na silver com 621 igual a 621.](../../assets/diagramas/engenharia-fundamentos-testes.png)

## Passo 3: a reconciliação

Os testes acima olham linha por linha. Falta um que olhe o **todo**: a soma das saídas na gold tem que ser igual ao número de viagens na silver. Se não for, a gold perdeu ou inventou viagens no caminho, por exemplo com um filtro esquecido ou uma junção errada dentro da própria gold.

No notebook, essa consulta é a **Sua vez**. Uma resposta possível:

<!-- explica: Compara a soma das saídas na gold com o número de viagens na silver e só devolve uma linha se os dois valores forem diferentes. Como nos outros testes, nenhuma linha quer dizer que passou. -->

```sql
select * from (
    select
        (select sum(saidas) from gold_saidas_por_estacao_dia) as na_gold,
        (select count(*) from silver_viagens)                  as na_silver
) where na_gold <> na_silver
```

Como os outros testes, ela devolve uma linha quando há problema e nenhuma quando está tudo certo. A conferência testa a sua consulta duas vezes: na gold certa, onde ela deve passar, e numa gold quebrada de propósito, sem as viagens da E99, onde ela deve falhar.

## Passo 4: todos os testes juntos

```text
[OK] uma linha por viagem
[OK] início e fim preenchidos
[OK] duração não negativa
[AVISO] estação de saída existe no cadastro: 3 linha(s)
   Aviso: o dado segue, mas alguém precisa olhar.
[OK] gold reconcilia com a silver
[OK] Pode publicar
```

Essa é a bateria que vai rodar a cada carga, na próxima aula. Se um erro aparecer, o pipeline para antes de publicar.

## Erros comuns

| Erro | Consequência | Como evitar |
|---|---|---|
| Teste que nunca falhou | Pode estar sempre passando por engano | Rodar uma vez contra um dado com o defeito |
| Tudo como erro | O pipeline para por motivos que não são dele | Separar erro de aviso |
| Tudo como aviso | Ninguém olha, e o dado errado chega ao painel | Erro para o que torna a resposta falsa |
| Só testes de linha | Uma junção ou um filtro perde linhas sem nenhum teste reclamar | Reconciliar totais entre camadas |

## Confira o que entendeu

1. Alguém trocou o `left join` da silver por `inner join`. Qual dos testes desta aula percebe?
2. Por que o teste de estação no cadastro é um aviso, e não um erro?

## Respostas comentadas

1. Nenhum dos testes de linha: as viagens da E99 simplesmente somem, e a silver fica sem duplicatas, sem nulos e sem durações negativas. O aviso de estação desconhecida também some, porque não sobra nenhuma linha marcada. A reconciliação também passaria, porque gold e silver perderam as mesmas 3 viagens. Esse defeito só aparece comparando a silver com a camada anterior: 618 viagens onde a bronze, sem as duas impossíveis e a repetida, tem 621. Testes entre camadas existem para isso.
2. Porque a viagem é real: alguém retirou uma bicicleta e a devolveu. Parar o pipeline esconderia 621 viagens corretas por causa de 3 com o cadastro incompleto. O aviso deixa a resposta sair e chama quem pode corrigir o cadastro.

## Próximos passos

- [Prática: orquestrar o pipeline](engenharia-fundamentos-orquestrar.md)
