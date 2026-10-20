# ADR 0002 — Identidade visual do GovHub

**Status:** substituído pelo [ADR 0003](0003-identidade-visual-sobria.md)
**Data:** 2026-09-21

## Contexto

As páginas do repositório (`index.html`, `roadmap.html`, `doc.html`) nasceram com a paleta do
**gov.br**: azul `#1351B4`, azul-marinho `#071D41`, amarelo `#FFCD07` e a stack de fontes do sistema.
É a identidade correta para um portal `.gov.br`, mas o material não é um portal: ele é a trilha de
capacitação de uma plataforma específica, o **GovHub** (Ipea + UnB), que tem identidade própria —
roxo, laranja e tipografia Inter — publicada em <https://gov-hub.io>.

Duas identidades concorrentes no mesmo material custam caro: quem chega pela plataforma não reconhece
a trilha como parte dela, e quem produz conteúdo não sabe qual paleta seguir nos exemplos de
dashboard — justamente o assunto que a trilha ensina.

## Decisão

Adotamos a identidade visual do GovHub, com os tokens concentrados em **`assets/govhub.css`**, que
passa a ser a fonte única de cor e tipografia das três páginas.

| Token | Valor | Uso |
|---|---|---|
| `--gh-purple` | `#7A34F3` | primária: navbar, links, botões |
| `--gh-purple-l` | `#8B5CF6` | secundária: gradientes e decoração |
| `--gh-purple-d` | `#5B21B6` | títulos e estados de hover |
| `--gh-purple-dd` | `#3C1478` | fundos escuros: blocos de código e diagramas |
| `--gh-orange` | `#F19F42` | acento decorativo |
| `--gh-orange-l` | `#FFB864` | indicadores sobre o roxo |
| `--gh-orange-d` | `#C2410C` | acento em texto sobre fundo claro |
| `--ink` | `#202020` | texto corrido |

Junto com os tokens vêm o logotipo oficial (`assets/govhub-logo.svg`), o favicon da plataforma e a
tipografia **Inter**, com a stack do sistema como alternativa.

As **cores por tipo de página** (Diátaxis) foram mantidas — elas são funcionais, não decorativas. A
única mudança: *referência* saiu do roxo acinzentado `#7C4DA0` para o magenta `#A21CAF`, porque o roxo
antigo passou a competir com o roxo da marca.

## Consequências

**O laranja da marca não serve para texto.** `#F19F42` tem 2,15:1 sobre o branco — reprova em
qualquer critério da WCAG. Ele fica restrito a bordas e marcadores; texto usa `#C2410C` (5,2:1) e o
indicador de página atual na navbar usa `#FFB864` (3,4:1 sobre o roxo, o mínimo da WCAG 1.4.11 para
elementos não textuais). O site oficial usa branco sobre `#F19F42` no item ativo do menu, o que
reprova em contraste; aqui a trilha diverge da implementação de referência de propósito.

**Todas as demais combinações passam em AA.** Branco sobre a navbar roxa dá 5,8:1; os links inativos
da navbar, 4,8:1; as seis cores de tipo de página ficam entre 4,6:1 e 7,3:1 sobre o branco.

**A Inter vem do Google Fonts.** É uma dependência externa de CDN. Em ambiente fechado ou sem
internet, a página cai na stack do sistema sem quebrar o layout — se isso virar requisito, a fonte
deve ser hospedada em `assets/`.

**Logotipo e favicon são cópias.** Foram baixados de `gov-hub.io` e não acompanham mudanças da marca
automaticamente; se a plataforma revisar a identidade, os arquivos em `assets/` precisam ser trocados
à mão.

**Trocar a identidade de novo é barato.** Como as três páginas deixaram de declarar cores próprias, o
custo de uma revisão de marca passou a ser um arquivo.

## Alternativas consideradas

**Manter a paleta gov.br.** É a identidade do governo federal e tem contraste bem resolvido, mas o
material vive dentro do GovHub e a plataforma já se apresenta ao público com outra marca.

**Trocar só as cores, sem logotipo nem tipografia.** Mais barato e sem dependência de CDN, mas uma
marca é reconhecida pelo conjunto — cor sozinha não faz a trilha parecer parte da plataforma.

**Recolorir também as cores por tipo de página na família do roxo.** Daria um resultado mais coeso,
mas apagaria a distinção entre os seis tipos de página, que é informação, não enfeite.
