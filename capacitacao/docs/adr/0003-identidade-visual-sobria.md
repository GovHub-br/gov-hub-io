# ADR 0003 — Identidade visual sóbria do Gov Hub

**Status:** aceito · substitui o [ADR 0002](0002-identidade-visual-govhub.md)
**Data:** 2026-10-01

## Contexto

O ADR 0002 adotou a identidade publicada em gov-hub.io: roxo `#7A34F3`, laranja `#F19F42` e Inter. Em
2026-09-30 a equipe de design e comunicação do Gov Hub fechou o **modo sóbrio** do manual de identidade
(skill `govhub-visual-identity`), que passa a valer para toda peça — página, relatório, slide, post — e
descontinua a paleta colorida. A trilha precisa acompanhar a marca da plataforma de que faz parte.

## Decisão

`assets/govhub.css` passa a carregar os tokens do modo sóbrio e continua sendo a fonte única de cor e
tipografia do site.

| Token | Valor | Uso |
|---|---|---|
| `--primary-purple` | `#613EFF` | assinatura: barra superior, links, botões, caixa marcada, progresso |
| `--dark-navy` | `#0A005A` | títulos, cabeçalho de tabela, blocos de código, fundos escuros |
| `--bg-soft` | `#F2F1F6` | blocos, cards, zebra, aula ativa, etiquetas |
| `--accent-rose` | `#BE006E` | acento pontual: o botão "Concluir e avançar", um CTA por seção |
| `--purple-600` / `--purple-700` | `#5235D9` / `#3F28A6` | hover / active e roxo de texto pequeno |
| `--border-soft` | `#E9DFFF` | bordas e divisórias |

Tipografia **Reddit Sans** em tudo (títulos em 800). Logotipo e símbolo são os arquivos do MIV
(`assets/logo/`, `assets/favicon.svg`).

**Tipos de página sem cor própria.** As seis cores por tipo (verde, azul, magenta, laranja, vermelho,
azul-petróleo) saem: ficam fora da paleta. Cada tipo passa a ser uma etiqueta `#F2F1F6` com texto navy,
o nome escrito e um ícone de produto Gov Hub (variante `-sober`, em `assets/icones/`):

| Tipo | Ícone |
|---|---|
| Tutorial | `book-open` |
| Guia | `wrench` |
| Referência | `document-text` |
| Explicação | `light-bulb` |
| Desafio | `trophy` |
| Pesquisa | `beaker` |

## Consequências

- **A distinção entre tipos deixa de depender de cor** (WCAG 1.4.1): ícone e nome carregam a
  informação. Quem lia o tipo pela cor da borda no mapa passa a ler a etiqueta.
- **Contrastes:** branco sobre roxo (5,0:1), navy e `#BE006E`; navy sobre branco e `#F2F1F6`; roxo em
  texto pequeno usa `#3F28A6`. Nunca roxo sobre navy nem `#BE006E` sobre roxo.
- **Exceções de cor literal, documentadas:** o painel "Tudo colorido" de `assets/ilustracoes/atencao-visual.svg`, cujas cores são
  o conteúdo do exemplo — um painel com cores demais —, não a identidade do site.
- **Dependências externas:** Reddit Sans vem do Google Fonts (sem internet, cai na pilha do sistema).
  Logos e ícones são cópias; se o MIV mudar, os arquivos em `assets/logo/` e `assets/icones/` precisam
  ser trocados à mão (os ícones vêm de `GovHub-br/skills-assets`).

Atualização (2026-10): os diagramas são PNGs da skill `govhub-diagramas` (ADR 0003 continua valendo para o resto). Exceção temporária: as aulas da trilha de adoção (`docs/plataforma/`) mantêm os blocos Mermaid da documentação de origem até serem convertidas; o leitor os desenha com as cores da paleta e só carrega a biblioteca quando a aula tem diagrama.
