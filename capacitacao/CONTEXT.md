# Contexto de autoria da trilha

A linguagem ubíqua que a equipe usa para **construir e refatorar esta trilha** (pedagogia, taxonomia,
autoria). Este é o glossário de quem escreve — distinto do
[glossário do material](docs/referencia/glossario.md), que define os termos de dashboards para quem
lê.

## Linguagem

### Taxonomia da documentação

**Quadrante Diátaxis**
Um dos quatro propósitos de leitura pelos quais o material é organizado: Tutorial (aprender), Guia
(fazer), Referência (consultar), Explicação (entender).
_Evite_: categoria, seção, módulo.

**Tipo de página**
O propósito declarado da página, escrito no cabeçalho `> Tipo:`. A trilha tem **seis**: os quatro
quadrantes Diátaxis mais **Desafio** e **Pesquisa**.
_Evite_: formato, gênero.

**Página de desafio**
Uma página em `docs/desafios/` — a entrega integradora, julgada por critérios de aceitação. Tem público
real e artefatos definidos.
_Evite_: exercício, atividade.

**Página de pesquisa**
Uma página em `docs/pesquisa/` — análise comparativa ou white paper (pergunta de pesquisa →
metodologia → resultados → conclusão). Não é aprender fazendo.
_Evite_: relatório, estudo.

**Rascunho**
Uma página que carrega o marcador `Rascunho — a escrever` e é majoritariamente `_A definir._`. Tem
esqueleto, mas ainda não tem conteúdo. Pode ser *estruturada* (esqueleto normalizado), mas não
*refatorada* (não há prosa para melhorar).
_Evite_: página vazia, placeholder.

### Vocabulário do domínio na autoria

**Levantamento de conteúdos**
O documento-fonte da equipe, em três versões (V1 ementa, V2 ementa expandida, V3 conteúdo escrito). É a
origem do material, não o material.
_Evite_: ementa (quando você quer dizer especificamente o documento inteiro).

**Nível**
Uma etapa de uma trilha em `trilhas/<slug>.md`, escrita como `## Nível N · Título`. Substitui a noção de "módulo"
do levantamento original, porque um nível agrupa páginas de tipos diferentes, e um módulo agrupava
temas.
_Evite_: módulo, capítulo.

**Trilha**
Uma sequência de níveis definida em `trilhas/<slug>.md`. Aulas podem estar em várias trilhas; o progresso é da aula.
_Evite_: curso, módulo.

**Papel**
A prioridade do item dentro do nível: `core` (essencial), `support` (apoio), `capstone`, `optional`,
`advanced`. Define a cadência, não a dificuldade.
_Evite_: peso, nível (que já é outra coisa).

**Token de marca**
Uma variável de cor ou tipografia declarada em `assets/govhub.css` (`--gh-purple`, `--ink`…). É onde a
identidade visual do GovHub vive; nenhuma página declara cor própria.
_Evite_: variável CSS, cor do tema.

**Gancho de contexto**
A abertura de uma página que conecta o conceito a um painel real que a pessoa vai precisar construir.
Vem antes do objetivo ou dos passos.
_Evite_: introdução (quando você quer dizer especificamente o gancho).

## Ambiguidades resolvidas

- **"Módulo"** — não usar. O levantamento original organiza por módulos temáticos; a trilha organiza
  por **níveis**, que agrupam páginas de quadrantes diferentes. Traduzir "módulo 3" para "nível 3"
  perde informação: o Módulo 3 (acessibilidade) virou parte do Nível 3, junto com design visual.

- **"Checklist"** — é sempre uma página de **Referência**, mesmo quando aparece como etapa dentro do
  tutorial. O tutorial referencia; não duplica.

- **"Dashboard bom"** — no material, "bom" significa *responde à pergunta com o menor esforço
  possível*. Nunca significa esteticamente agradável. Quando a página precisar falar de estética, use
  "consistência visual".

## Diálogo de exemplo

> **Quem escreve:** "Esta página sobre escolha de gráfico deveria ter um passo a passo de como criar o
> visual no Superset?"
>
> **Quem revisa:** "Não. Ela é Referência — descreve quando cada visual serve. O passo a passo é um
> Guia separado, em `docs/guias/`. Se os dois convivessem na mesma página, quem está consultando teria
> que atravessar instruções que não pediu."
>
> **Quem escreve:** "E a seção de 'erros comuns'? Ela opina."
>
> **Quem revisa:** "Aí é Explicação. Erros comuns explicam o raciocínio por trás da escolha — vão para
> `docs/explicacao/erros-comuns-na-escolha-do-grafico.md`. A referência fica com a tabela de quando
> usar cada visual."
