# Filtros e segmentação

> Tipo: **Explicação**

## Contexto

Filtros são extremamente úteis e, ao mesmo tempo, uma das maiores causas de complexidade desnecessária
em dashboards.

O objetivo de um filtro é ajudar a chegar mais rápido à informação desejada. Quando existem filtros
demais, o efeito costuma ser o contrário.

## Onde posicionar

As abordagens mais comuns são:

- barra lateral esquerda;
- faixa superior da página;
- painel recolhível.

O mais importante é **manter consistência entre todas as páginas** do dashboard. Ninguém deveria
precisar reaprender onde os filtros estão a cada tela.

## Como nomear

Os nomes dos filtros devem usar termos conhecidos por quem vai usá-los.

| Prefira | Evite |
|---|---|
| Período | Referência Temporal |
| Unidade | Centro Organizacional |
| Região | Dimensão Territorial |
| Equipe | Agrupamento Funcional |

Quanto mais simples o nome, menor o esforço de interpretação. Nomes técnicos vindos direto do modelo
de dados são uma das causas mais frequentes de painéis que "parecem difíceis".

## Quantos oferecer

Uma boa regra é disponibilizar apenas os filtros realmente usados durante a análise. Antes de criar
um filtro, pergunte:

> **"As pessoas realmente vão usar isso para tomar decisões?"**

Se a resposta for não, provavelmente o filtro não precisa existir. Filtros desnecessários aumentam a
complexidade sem gerar valor.

## Trade-offs e alternativas

Cortar filtros reduz flexibilidade, e sempre haverá alguém que gostaria de um recorte específico. Duas
saídas costumam funcionar melhor do que adicionar mais um seletor:

- oferecer o recorte como uma página de detalhamento, não como filtro global;
- registrar o pedido e observar se ele reaparece — muitos filtros são pedidos uma vez e nunca usados.

## Veja também

- [Estrutura de navegação](estrutura-de-navegacao.md)
