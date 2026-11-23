# Prática: coletar de uma API

> Tipo: **Tutorial**

> Notebook: [engenharia-fundamentos-coleta.ipynb](../../notebooks/engenharia-fundamentos-coleta.ipynb) · Colab

Coletar é buscar o dado na fonte e trazê-lo para perto de você. Parece um único pedido, mas uma coleta de verdade precisa percorrer páginas, sobreviver a falhas e conferir se recebeu tudo. Nesta prática você coleta a semana de viagens da Pedala Aurora e guarda cada dia como veio.

## O que você vai aprender

- Percorrer todas as páginas que a API informa.
- Dar a cada resposta de erro a decisão certa: tentar de novo, seguir ou parar.
- Conferir o que chegou contra o total que a própria fonte informa.
- Guardar o dado bruto, sem mexer nele, com a hora da coleta.

## Passo 1: pedir todas as páginas de um dia

A API entrega as viagens de um dia em páginas de 40. A primeira resposta já diz quantas páginas existem (`total_paginas`). A função `coletar_dia` pede uma página por vez até a última:

<!-- explica: Define `coletar_dia`: pede a página 1 e continua até a última, usando o `total_paginas` que a própria API informa. Devolve todas as viagens juntas e o `total_registros` que a API disse existir, para você comparar depois. Se `pedir` devolver `None`, o dia não tem viagens e a função devolve uma lista vazia. -->

```python
def coletar_dia(data):
    """Todas as viagens de um dia, página por página, e o total que a API informa."""
    viagens, pagina, total_paginas, total_registros = [], 1, 1, 0
    while pagina <= total_paginas:
        corpo = pedir("/viagens", {"data": data, "pagina": pagina})
        if corpo is None:                    # 204: não há viagens neste dia
            return [], 0
        viagens.extend(corpo["viagens"])
        total_paginas, total_registros = corpo["total_paginas"], corpo["total_registros"]
        pagina += 1
    return viagens, total_registros
```

```text
88 viagens coletadas; a API informou 88
```

**Leia assim:** o laço não sabe de antemão quantas páginas há. Ele começa supondo uma, e a primeira resposta corrige o número. É a própria fonte que guia a coleta.

## Passo 2: quando a API falha

Agora colete 02/06. Na página 2, o servidor responde que está ocupado:

```text
Falhou: 503 {'erro': 'servidor ocupado, tente de novo'}
```

Nem todo erro é igual, e a coleta precisa decidir o que fazer com cada um:

![Uma coleta que confere o que recebeu. No alto, as viagens de 03/06: a página 1 com 40 viagens, a página 2 com 41 linhas porque repete a última da página 1, a página 3 com 16 viagens e a conferência: 97 linhas, 96 diferentes, avisa e guarda como veio. Embaixo, três respostas e três decisões: 503, servidor ocupado, é temporário, espera e tenta de novo; 204, sem conteúdo, quer dizer que não há viagens no dia, lista vazia sem erro; 400, pedido errado, é permanente, insistir não resolve, corrija o pedido.](../../assets/diagramas/engenharia-fundamentos-coleta.png)

A nova versão de `pedir` trata cada caso:

<!-- explica: Redefine `pedir`, a função que faz cada pedido à API, para tratar três casos: a resposta 204 (dia sem viagens) devolve `None`; um erro 5xx, do servidor, espera 1 segundo e tenta de novo, até 3 vezes; qualquer outro erro (4xx) para na hora com `raise_for_status`, porque repetir um pedido errado não o conserta. -->

```python
def pedir(caminho, parametros=None, tentativas=3):
    """Faz um pedido à API. Tenta de novo quando o erro é do servidor (5xx)."""
    for tentativa in range(1, tentativas + 1):
        resposta = httpx.get(API + caminho, params=parametros, timeout=10)
        if resposta.status_code == 204:
            return None                      # dia sem viagens: a resposta vem vazia
        if resposta.status_code >= 500 and tentativa < tentativas:
            print(f"  {resposta.status_code} na tentativa {tentativa}: nova tentativa em 1 segundo")
            time.sleep(1)
            continue
        resposta.raise_for_status()          # 4xx: o pedido está errado; insistir não resolve
        return resposta.json()
```

Com ela, os três casos se comportam como devem:

```text
106 viagens coletadas; a API informou 106
Dia sem viagens: ([], 0)
Pedido errado: 400 use data=AAAA-MM-DD e pagina=1, 2, ...
```

A falha de 02/06 acontece só no primeiro pedido, como um servidor que estava ocupado naquele instante. Se você rodar o notebook de novo, ela não se repete: é assim com falhas temporárias.

## Passo 3: conferir a coleta

Receber dados sem erro não quer dizer receber todos, nem só os certos. Compare três números de cada dia: as linhas recebidas, as viagens diferentes e o total que a API informou.

```text
2026-06-01: recebidas  88 · diferentes  88 · a API informou  88
2026-06-02: recebidas 106 · diferentes 106 · a API informou 106
2026-06-03: recebidas  97 · diferentes  96 · a API informou  96
```

**Leia assim:** em 03/06 chegaram 97 linhas para 96 viagens. A página 2 repetiu a última viagem da página 1, algo que acontece em APIs reais quando um registro novo entra enquanto você pagina. A coleta **não apaga** a repetida: ela guarda o que veio e avisa. A limpeza fica para a transformação, e assim a evidência do problema não se perde.

No notebook, a **Sua vez** é escrever essa conferência numa função, `resumo(viagens, total)`, que devolve `"ok"` ou `"diferente"`.

## Passo 4: guardar como veio

Cada dia vira um arquivo JSON na pasta `bruto/`, com a hora da coleta:

```text
bruto/viagens_2026-06-01.json · 88 viagens
bruto/viagens_2026-06-02.json · 106 viagens
bruto/viagens_2026-06-03.json · 97 viagens
bruto/viagens_2026-06-04.json · 99 viagens
bruto/viagens_2026-06-05.json · 100 viagens
bruto/viagens_2026-06-06.json · 60 viagens
bruto/viagens_2026-06-07.json · 74 viagens
```

Por que guardar antes de transformar? Se uma regra estiver errada, dá para refazer tudo a partir daqui, sem pedir de novo à fonte. E, se a fonte mudar ou apagar algo, você ainda tem o que recebeu naquele dia.

## Passo 5: olhar um arquivo

```text
{'data': '2026-06-03',
 'coletado_em': '2026-11-23T16:12:28',
 'total_registros': 96,
 'viagens': '97 viagens'}
```

O arquivo guarda, além das viagens, o total que a fonte informou e a hora da coleta (a sua será outra). Com isso, qualquer pessoa consegue refazer a conferência depois.

## Erros comuns

| Erro | Consequência | Como evitar |
|---|---|---|
| Parar no primeiro `503` | A coleta da semana falha por um problema de segundos | Tentar de novo os erros 5xx, com espera |
| Tentar de novo um `400` | Pedidos inúteis, e a falha só aparece mais tarde | Erro 4xx para na hora, com a mensagem da fonte |
| Tratar `204` como erro | Um dia sem viagens derruba a coleta | `204` vira lista vazia |
| Não conferir o total | Página repetida ou faltando passa despercebida | Comparar recebidas, diferentes e informadas |
| Limpar na coleta | A evidência do problema some | Guardar como veio e limpar na transformação |

## Confira o que entendeu

1. A API respondeu `429 Too Many Requests` (muitos pedidos). Pela lógica desta aula, a coleta deve tentar de novo ou parar?
2. Por que a coleta guarda as 97 linhas de 03/06, se só 96 viagens existem?

## Respostas comentadas

1. Tentar de novo, com espera: o `429` é um `4xx`, mas é temporário, porque a fonte está pedindo calma. A regra "4xx para" vale para pedidos errados, como o `400`. Na [prática de coleta do nível 4](engenharia-coleta-python.md), com a API do PNCP, o `429` é tratado exatamente assim.
2. Porque a camada bruta é um espelho da fonte. Se a coleta limpasse, ninguém saberia que a API repete registros, e uma limpeza errada não teria como ser desfeita. A transformação remove a repetida, e a conferência da coleta deixa o aviso registrado.

## Próximos passos

- [Prática: gravar sem duplicar](engenharia-fundamentos-gravar.md)
