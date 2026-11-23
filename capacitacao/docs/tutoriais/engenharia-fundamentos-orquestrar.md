# Prática: orquestrar o pipeline

> Tipo: **Tutorial**

> Notebook: [engenharia-fundamentos-orquestrar.ipynb](../../notebooks/engenharia-fundamentos-orquestrar.ipynb) · Colab

Até aqui, você rodou cada etapa à mão, célula por célula, na ordem certa. Um pipeline de verdade roda sozinho, todo dia, de madrugada: alguém (ou algo) precisa saber a ordem das etapas, tentar de novo quando uma falha, anotar o que aconteceu e refazer um dia antigo quando a fonte muda. Esse é o trabalho de um **orquestrador**.

![Uma estação de trem: no alto, um relógio e um quadro de partidas com horários, destinos e plataformas; embaixo, a plataforma com pessoas caminhando](../../assets/imagens/engenharia-fundamentos/quadro-de-partidas.jpg)

Um quadro de partidas não conduz nenhum trem: diz quando cada um sai, em que ordem e o que atrasou. O orquestrador faz o mesmo com as tarefas.

## O que você vai aprender

- Transformar cada etapa numa **tarefa** que recebe o dia.
- Declarar quem depende de quem e deixar o orquestrador decidir a ordem.
- Rodar a semana inteira e ler o histórico.
- Reprocessar um dia quando a fonte recebe viagens atrasadas.

## Antes de começar

A Preparação carrega as funções das aulas anteriores (`coletar_dia`, `salvar_bruto`, `gravar_dia`, `rodar_testes`…) e abre um banco vazio. Desta vez, quem enche o banco é o pipeline.

## Passo 1: as tarefas

Cada etapa vira uma função que recebe o dia. Nenhuma chama a outra: as dependências ficam declaradas à parte.

<!-- explica: Declara as quatro tarefas num dicionário: o nome, a função que a executa e, em `depende_de`, quais tarefas precisam rodar antes dela. É só uma descrição: quem decide a ordem é a função `ordem`, mostrada a seguir. -->

```python
TAREFAS = {
    "coletar":     {"depende_de": [],              "funcao": tarefa_coletar},
    "gravar":      {"depende_de": ["coletar"],     "funcao": tarefa_gravar},
    "transformar": {"depende_de": ["gravar"],      "funcao": tarefa_transformar},
    "testar":      {"depende_de": ["transformar"], "funcao": tarefa_testar},
}
```

A tarefa `testar` levanta um erro se algum teste de gravidade **erro** falhar. Avisos não param o pipeline.

## Passo 2: o mini orquestrador

O orquestrador tem três responsabilidades, em umas 30 linhas:

- **Ordem:** uma tarefa entra na fila quando todas de que ela depende já entraram.
- **Nova tentativa:** se uma tarefa falha, ela roda mais uma vez antes de o dia parar.
- **Histórico:** cada tentativa de cada tarefa vira uma linha, com dia, status e resultado.

<!-- explica: Define `ordem`: a cada volta, escolhe as tarefas cujas dependências já estão na fila e as acrescenta. Se numa volta nenhuma fica pronta, há um ciclo ou uma dependência que não existe, e a função levanta um erro em vez de rodar numa ordem errada. -->

```python
def ordem(tarefas):
    """Uma tarefa entra na fila quando todas as que ela depende já entraram."""
    fila = []
    while len(fila) < len(tarefas):
        prontas = [nome for nome, t in tarefas.items()
                   if nome not in fila and all(d in fila for d in t["depende_de"])]
        if not prontas:
            raise ValueError("dependência circular ou tarefa inexistente")
        fila.extend(prontas)
    return fila
```

```text
coletar → gravar → transformar → testar
```

## Passo 3: rodar a semana

Na vida real, o orquestrador roda uma vez por dia, para o dia anterior. No notebook, você roda os sete dias em sequência, como se estivesse recuperando uma semana:

```text
  503 na tentativa 1: nova tentativa em 1 segundo
{'ok': 28}
          dia       tarefa  tentativa status         resultado
4  2026-06-02      coletar          1     ok       106 viagens
5  2026-06-02       gravar          1     ok        106 linhas
6  2026-06-02  transformar          1     ok  camadas refeitas
7  2026-06-02       testar          1     ok         testes ok
```

**Leia assim:** 28 tarefas ok, 7 dias com 4 tarefas cada. Em 02/06, a coleta recebeu o `503` e passou na nova tentativa que o próprio `pedir` faz, por isso a tarefa aparece com uma única tentativa. O histórico tem uma linha por tarefa e por dia: quando algo der errado de madrugada, é nele que se descobre onde.

## Passo 4: reprocessar um dia

No dia seguinte, a fonte recebe quatro viagens de 05/06 que não tinham sido enviadas. O notebook simula isso com `chegam_viagens_atrasadas()`. Rode só aquele dia de novo:

<!-- explica: Guarda quantas saídas a gold tinha em 05/06, simula a chegada das viagens atrasadas na fonte e roda o pipeline só para aquele dia. Não existe código novo de reprocessamento: é a mesma `executar`, chamada com outra data. -->

```python
antes = saidas("2026-06-05")
chegam_viagens_atrasadas()          # a fonte recebeu as viagens atrasadas
executar("2026-06-05")              # reprocessa só aquele dia
```

```text
05/06 na gold: antes 100 · depois 104
raw_viagens de 05/06: 104 linhas
```

![Um pipeline por dia. No alto, cinco tarefas em sequência: coletar, da API para bruto/; gravar, de bruto/ para a raw; transformar, que refaz bronze, silver e gold; testar, em que um erro para tudo; e publicar, tracejada, que grava gold.csv e é a sua vez. Uma nota: em 02/06, a coleta recebeu um 503, tentou de novo e seguiu, e a semana terminou com 28 tarefas ok. Embaixo, reprocessar 05/06: a fonte recebe 4 viagens atrasadas, executar 2026-06-05 roda as tarefas só daquele dia e a gold de 05/06 vai de 100 para 104, com a raw do dia em 104 linhas, substituídas e não somadas.](../../assets/diagramas/engenharia-fundamentos-orquestrar.png)

Reprocessar só deu certo porque cada etapa é **idempotente**: a gravação substitui o dia em vez de somar, e as camadas são refeitas a partir da raw. Sem isso, rodar 05/06 de novo deixaria 204 linhas na raw: as 100 antigas e as 104 novas.

## Sua vez: publicar só depois dos testes

No notebook, você acrescenta a tarefa `publicar`, que grava a gold num arquivo `gold.csv` para alguém abrir numa planilha. Ela **depende de `testar`**: o orquestrador a coloca por último e nunca a roda se os testes falharem. A dependência também é uma proteção.

## Erros comuns

| Erro | Consequência | Como evitar |
|---|---|---|
| Uma tarefa chama a próxima | Ninguém consegue rodar uma etapa sozinha nem mudar a ordem | Tarefas independentes; dependências declaradas |
| Publicar sem depender dos testes | O dado errado chega a quem consome | `publicar` depende de `testar` |
| Reprocessar com carga não idempotente | O dia reprocessado duplica | Substituir o dia na gravação |
| Sem histórico | Uma falha de madrugada vira adivinhação | Uma linha por tarefa, dia e tentativa |

## Confira o que entendeu

1. Alguém declarou `"coletar": {"depende_de": ["testar"]}` por engano. O que `ordem` faz?
2. Num dia, a tarefa `testar` falhou duas vezes. O que acontece com `publicar` e com a gold do dia anterior?

## Respostas comentadas

1. Levanta `ValueError: dependência circular ou tarefa inexistente`. `coletar` espera `testar`, que espera `transformar`, que espera `gravar`, que espera `coletar`: nenhuma tarefa fica pronta para entrar na fila. É melhor falhar na hora do que rodar numa ordem errada.
2. `executar` para em `testar` e `publicar` não roda, então o `gold.csv` publicado continua sendo o da última execução que passou nos testes. Quem consome vê um dado de ontem, mas correto, e o histórico mostra onde parou. Um detalhe: a tabela gold no banco já foi refeita por `transformar`, por isso só o que passa por `publicar` está protegido.

## Próximos passos

- [Do notebook às ferramentas do Gov Hub](../explicacao/engenharia-fundamentos-ferramentas.md)
