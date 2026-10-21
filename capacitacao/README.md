# Trilhas de Capacitação — GovHub

> Um material prático para quem constrói dashboards no **GovHub**, com **Apache Superset** e
> **Power BI**. Da pergunta de negócio ao painel publicado — com acessibilidade tratada como
> requisito, não como acabamento.

Este documento é o **ponto de entrada**: explica o que estamos construindo, como o conteúdo está
organizado (framework **Diátaxis**) e como editar e evoluir o material.

- Estrutura do conteúdo: [Diátaxis](https://diataxis.fr/)
- Acessibilidade: [eMAG](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital) e [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)
- Trilhas de aprendizagem: [index.html#trilhas](index.html#trilhas) (catálogo) · fonte de cada trilha em `trilhas/<slug>.md`

> Vai editar o material? Pule para a seção 7 — [Como editar e contribuir](#7-como-editar-e-contribuir).

---

## 1. Visão geral

Muita gente passa boa parte do dia procurando informação dentro de planilhas: filtra colunas, ordena
dados, monta tabelas temporárias e repete o processo toda vez que precisa responder uma pergunta
simples. O problema não está nos dados — está na forma como eles são apresentados.

Esta trilha ensina a transformar dados em decisão: primeiro o vocabulário e o raciocínio crítico,
depois a execução técnica na ferramenta.

### A lógica da trilha

A trilha segue a progressão **"por quê" → "o quê" → "como" → prática**:

1. **Fundamentos conceituais**: por que um dashboard é bom ou ruim
2. **Princípios mínimos de design**: arquitetura da informação e hierarquia visual (valem para
   qualquer ferramenta)
3. **Gráficos**: qual visual responde qual pergunta, no Superset e no Power BI
4. **Mão na massa**: vídeos aplicando tudo isso no Superset e no Power BI (em breve)

### Público

Quem constrói ou encomenda painéis no GovHub: analistas, gestão e equipes técnicas. Não se assume
formação em design nem em estatística.

### Pré-requisitos

- Noções básicas de dados (o que é uma tabela, uma métrica, um filtro).
- Acesso ao ambiente do GovHub para a parte prática.

---

## 2. Princípios de organização (Diátaxis)

Cada página tem **um único propósito**. A regra de ouro do Diátaxis: não misturar aprender, fazer,
consultar e entender na mesma página.

| Quadrante | Pasta | Propósito |
|---|---|---|
| **Tutorial** | `docs/tutoriais/` | aprender fazendo, guiado do início ao fim |
| **Guia (how-to)** | `docs/guias/` | resolver uma tarefa concreta |
| **Referência** | `docs/referencia/` | consultar fatos durante o trabalho |
| **Explicação** | `docs/explicacao/` | entender o porquê, o contexto e os trade-offs |

Além dos quatro quadrantes, duas seções complementares:

| Seção | Pasta | Propósito |
|---|---|---|
| **Desafio** | `docs/desafios/` | entrega integradora com critérios de aceitação |
| **Pesquisa** | `docs/pesquisa/` | análise comparativa (pergunta → metodologia → resultados) |

O mapeamento do levantamento de conteúdos original para esses tipos está registrado em
[ADR 0001](docs/adr/0001-mapeamento-diataxis-do-levantamento.md).

---

## 3. Estrutura de pastas

```
Dashboards-Roadmap/
├── README.md                    visão geral + estrutura + como editar
├── trilhas/                     fonte de cada trilha (<slug>.md)
├── CONTEXT.md                   linguagem ubíqua da autoria
├── CONTRIBUTING.md              como contribuir
├── index.html                   página inicial: apresentação, login e catálogo de trilhas
├── trilhas.html                 endereço antigo do catálogo, só redireciona
├── mapa.html                    mapa de uma trilha (?trilha=<slug>), um nível por vez
├── doc.html                     página da aula (Markdown), por trilha
├── quiz.html                    quiz de revisão (?trilha=<slug>), liberado ao concluir a trilha
├── concluida.html · roadmap.html   endereços antigos, só redirecionam
├── quiz/<slug>.json             perguntas do quiz de revisão, uma por aula (editado à mão)
├── assets/
│   ├── govhub.css               identidade visual (tokens do modo sóbrio) e componentes comuns
│   ├── topo.js                  topo comum: busca, Início/Trilhas, Dúvidas, conta, rodapé
│   ├── login.js                 modal Entrar: Google, e-mail e senha, criar conta, recuperar a senha
│   ├── mapa.css · mapa.js       mapa da trilha · hub-nucleo.js: regras puras do mapa, busca e quiz
│   ├── leitor.css · leitor.js   página da aula (doc.html) · feedback.js: avaliação da aula
│   ├── celebracao.js            modal de conclusão da trilha, com a nota de 1 a 5
│   ├── paginas.css              página inicial, catálogo e quiz
│   ├── caminho.js               quais ?path= o leitor aceita (só .md do próprio site)
│   ├── progresso-*.js           progresso: núcleo, loja e Firebase (ADR 0004)
│   ├── firebase-config.js       configuração do Firebase (vazia = só navegador)
│   ├── logo/ · icones/ · ilustracoes/   logotipo, ícones dos tipos de página e SVGs didáticos
├── tests/                       node --test tests/*.test.js
├── firestore.rules              regras de segurança do progresso
├── firebase.json                configuração do Firebase CLI (regras)
├── tools/gen_roadmap.py         trilhas/*.md -> json + md + xmind
├── tools/gen_pdf.py             PDFs das aulas e das trilhas (no deploy; fontes e logos em tools/pdf/)
├── docs/
│   ├── tutoriais/  guias/  referencia/  explicacao/  desafios/  pesquisa/
│   ├── adr/                     decisões de arquitetura do material
│   ├── trilhas/                 gen · <slug>.json|.md|.xmind por trilha, mais index.json e index.md (catálogo)
│   └── index.md                 índice da documentação
├── exemplos/                    dados, temas e wireframes de apoio
└── templates/                   um template por tipo de página
```

`gen` marca arquivos **regenerados** por `tools/gen_roadmap.py` — não edite à mão.

O desenho das páginas segue o protótipo da designer (hub da trilha, versão 2_6; [ADR 0007](docs/adr/0007-hub-da-trilha.md)).
As cores e a tipografia de todas as páginas vêm de `assets/govhub.css`, que segue a identidade visual
do GovHub ([ADR 0002](docs/adr/0002-identidade-visual-govhub.md)).

---

## 4. A trilha

A trilha de Dashboards segue os módulos do documento de conteúdo da capacitação: três níveis abertos,
com 27 aulas, e um nível de prática em vídeo anunciado como "em breve":

| Nível | Tema |
|---|---|
| 1 | Fundamentos conceituais |
| 2 | Princípios mínimos de design (arquitetura da informação e hierarquia visual) |
| 3 | Gráficos |
| 4 | Mão na massa no Superset e no Power BI (vídeos, em breve) |

No catálogo da página inicial, **cada nível conta como uma aula** (o card mostra "3 aulas · 1 em breve" e o
progresso por níveis concluídos); dentro do mapa, a contagem continua por aula.

Um nível em breve é declarado em `trilhas/<slug>.md` com a linha `Status: em-breve` logo abaixo do
título do nível e não tem aulas: aparece no mapa como "Em breve", não conta no andamento e fica fora
do PDF. Quando os vídeos existirem, basta tirar a linha e listar as aulas.

Em cada nível, faça primeiro os itens **essenciais**; os de **apoio/opcionais** vêm quando forem
necessários.

- Mapa com progresso: [mapa.html?trilha=dashboards](mapa.html?trilha=dashboards)
- O progresso também pode ser marcado **de dentro de cada página**: quem está lendo clica em
  *Marcar como feito* e a trilha registra. É o mesmo progresso, nos dois lugares.
- Sem login, o progresso vive no navegador de quem estuda: não sincroniza entre navegadores nem
  entre dispositivos, e some se os dados do site forem limpos. O login (Google, ou e-mail e senha) é **opcional**:
  quem entra leva o progresso (de todas as trilhas) para qualquer computador, salvo no Firebase
  (seção 7.6).
- Versão em texto: [docs/trilhas/dashboards.md](docs/trilhas/dashboards.md)
- Fonte: [trilhas/dashboards.md](trilhas/dashboards.md)

### Formato dos itens

```
- [tipo] **Título** — papel — `caminho/para/doc.md`
```

- **tipo**: `tutorial` · `how-to` · `reference` · `explanation` · `challenge` · `research`
- **papel**: `core` · `support` · `capstone` · `optional` · `advanced`

---

## 5. Status do conteúdo

As trilhas só listam aulas escritas. A trilha de Dashboards tem três níveis completos e o nível de
prática em vídeo anunciado como "em breve"; a trilha de implantação está toda marcada como "em breve".

---

## 6. Pré-visualizar localmente

A capacitação mora em `capacitacao/` no repositório do site do Gov Hub (`GovHub-br/gov-hub-io`) e é
publicada em **gov-hub.io/capacitacao/**. Ela é estática: o topo e o rodapé apontam para o site com
caminhos relativos (`../...`).

Só a capacitação (os links para o resto do site não abrem):

```bash
cd capacitacao && python3 -m http.server 8000
# abrir http://localhost:8000/
```

O site inteiro, como no ar (na raiz do repositório gov-hub-io):

```bash
mkdocs build                                   # gera site/
rsync -a --exclude pdf --exclude tests --exclude tools capacitacao/ site/capacitacao/
cd site && python3 -m http.server 8000         # abrir http://localhost:8000/capacitacao/
```

Testes (dentro de `capacitacao/`):

```bash
node --test tests/*.test.js
python3 -m unittest discover -s tests -p 'test_*.py'
```

---

## 7. Como editar e contribuir

### 7.1 Editar uma página de conteúdo

1. Escolha o quadrante: aprender (`tutoriais`), fazer (`guias`), consultar (`referencia`), entender
   (`explicacao`).
2. Abra o arquivo na pasta correspondente em `docs/`.
3. Siga o template em `templates/` — há um por tipo de página.
4. Mantenha o cabeçalho `> Tipo: **X**` logo abaixo do título.

Material de apoio (dados, temas, wireframes) vai em `exemplos/`.

### 7.2 Editar a trilha

Edite **apenas** `trilhas/<slug>.md` e rode:

```bash
python3 tools/gen_roadmap.py
```

Isso regenera, para cada trilha, `docs/trilhas/<slug>.json`, `.md` e `.xmind`, e o catálogo
(`docs/trilhas/index.json` e `index.md`). O gerador
**valida** tipos e papéis e falha com mensagem clara em caso de erro de digitação. Ele também **cria um
esqueleto** para todo `.md` referenciado que ainda não exista, e **nunca renomeia** caminhos. Um mesmo
documento pode estar em várias trilhas, mas não se repete dentro da mesma.

**Criar uma trilha nova:** copie `trilhas/dashboards.md` para `trilhas/<slug>.md`, troque o cabeçalho,
liste os itens (aulas já existentes podem ser reaproveitadas; o progresso é da aula) e rode o gerador.
O campo `categoria` do cabeçalho é `negocial` (para quem usa os dados) ou `tecnica` (para quem opera
a plataforma): o catálogo mostra essa etiqueta no card e lista as negociais primeiro. Veja o [ADR 0005](docs/adr/0005-varias-trilhas.md).

Campos opcionais do cabeçalho, usados pelo mapa (ADR 0007):

| Campo | Para quê |
|---|---|
| `chamada` | frase do topo do mapa (sem ela, vale a `descricao`) |
| `status: em-breve` | o card aparece desabilitado no catálogo |
| `status: oculta` | a trilha some do catálogo e da busca (o link direto para o mapa continua abrindo) |
| `etapas` | "A lógica da trilha": `Rótulo=Descrição \| Rótulo=Descrição \| …` |
| `etapas_subtitulo` · `etapas_nota` | linha abaixo do título e nota no pé do quadro (`**trecho**` vira negrito) |

Logo abaixo de cada `## Nível N · Título`, a linha opcional `Etapa: <rótulo> · Ícone: <nome>` liga o nível
a uma etapa e escolhe o ícone do nível (`assets/icones/<nome>-sober.svg`, da biblioteca
`GovHub-br/skills-assets`). O gerador falha se a etapa não estiver em `etapas` ou se o ícone não existir.

**Quiz de revisão:** `quiz/<slug>.json` traz uma pergunta por aula (chave = id da aula, `correta` =
índice da opção certa). Trilha sem esse arquivo não tem quiz.

### 7.3 Mudar cores, tipografia ou logotipo

Tudo o que é marca vive em `assets/govhub.css`: os tokens do modo sóbrio do Gov Hub
(`--primary-purple`, `--dark-navy`, `--bg-soft`, `--accent-rose`…), a barra superior, os botões, a
caixa de "feito" e as etiquetas de tipo de página. Mudou um token ali, mudou nas três páginas. Logotipo
e símbolo ficam em `assets/logo/` e `assets/favicon.svg`; os ícones dos tipos de página, em
`assets/icones/`.

Os tipos de página não têm cor própria: se distinguem por ícone e nome. Ao escolher uma cor, use só a
paleta e verifique o contraste — texto precisa de **4,5:1** e indicadores não textuais de **3:1**
(WCAG 2.1 AA). O raciocínio completo está no [ADR 0003](docs/adr/0003-identidade-visual-sobria.md).

### 7.3.1 Diagramas

Os diagramas das aulas ficam em `assets/diagramas/`: `<nome>.html` é a fonte versionada e
`<nome>.png` (3000 px de largura) é o que as aulas mostram. Esse é o padrão. Por enquanto, as aulas
da trilha de adoção (`docs/plataforma/`) ainda usam blocos Mermaid, que o leitor desenha com a paleta
e só baixa quando a aula tem diagrama; eles serão trocados por PNG.

Para regenerar, use a skill `govhub-diagramas` do plugin govhub-core. Com `SKILL` apontando para a
pasta da skill na sua instalação do plugin:

```bash
node $SKILL/scripts/inline_assets.mjs $SKILL/templates/<familia>.html assets/diagramas/<nome>.html
node $SKILL/scripts/render.mjs assets/diagramas/<nome>.html     # gera assets/diagramas/<nome>.png
```

Regra de cor: paleta sóbria. O pêssego `#FFE7E1` do template da skill deve ser trocado por
`#F2F1F6` em cada diagrama.

### 7.3.2 PDFs das aulas e das trilhas

Cada aula tem o botão **Baixar PDF** e cada mapa, **Baixar a trilha em PDF** (capa, sumário e um
capítulo por nível). Os arquivos são gerados no deploy por `tools/gen_pdf.py`, adaptado do
`build_doc.py` da skill govhub-visual-identity (mesma capa, faixa de capítulo, rodapé e tabela), e
ficam em `pdf/` no site publicado, fora do git. Fontes (Reddit Sans, OFL) e logos ficam em `tools/pdf/`.

Para gerar localmente (pasta `pdf/`, ignorada pelo git):

```bash
pip install markdown beautifulsoup4 lxml weasyprint
python3 tools/gen_pdf.py                       # tudo; --trilha <slug> ou --aula <id> para um só
# diagramas Mermaid viram imagem com o mermaid-cli; sem ele, viram um aviso para a versão on-line:
MMDC="npx -y @mermaid-js/mermaid-cli@11" python3 tools/gen_pdf.py
```

### 7.4 Arquivos gerados — não edite à mão

- `docs/trilhas/*.json`, `docs/trilhas/*.md` e `docs/trilhas/*.xmind`.
- `pdf/` (só existe no site publicado ou depois de rodar `tools/gen_pdf.py`).

As páginas HTML não têm regiões geradas: o mapa e o catálogo são montados no navegador a partir do JSON.

### 7.5 Publicar

A capacitação é publicada junto com o site do Gov Hub, pelo workflow `.github/workflows/deploy.yml`
do repositório gov-hub-io: todo push na `main` publica gov-hub.io, com a capacitação em
`/capacitacao/`. No mesmo job (que também roda em PRs, sem publicar), o workflow:

1. roda os testes da capacitação (Node e Python);
2. roda `tools/gen_roadmap.py` e **falha se algum arquivo gerado estiver desatualizado**, ou seja,
   se alguém editou uma trilha em `trilhas/` sem regenerar, ou esqueceu de commitar o esqueleto de
   uma página nova;
3. gera os PDFs das aulas e das trilhas (`tools/gen_pdf.py`);
4. copia `capacitacao/` para `site/capacitacao/` (sem `tests/` e `tools/`), junto com os PDFs.

Não há build das páginas: elas vão como estão, porque `doc.html` lê os `.md` em tempo de execução.

### 7.6 Salvar o progresso no Firebase

Sem configuração, o site funciona e o progresso fica só no navegador. Para que quem entra (com o Google
ou com e-mail e senha) leve o progresso para qualquer computador:

1. Em <https://console.firebase.google.com>, crie um projeto (o Google Analytics não é necessário).
2. **Configurações do projeto → Seus apps → Web (`</>`)**: registre um app e copie o objeto
   `firebaseConfig` para `assets/firebase-config.js` (pelo menos `apiKey`, `authDomain`, `projectId`
   e `appId`). Esse arquivo já está preenchido para o projeto `capacitacao-gov-hub`; estes passos
   servem para recriar o projeto ou trocá-lo por outro.
3. **Authentication → Método de login**: ative **Google** e **E-mail/senha** (sem "link de e-mail").
   Em **Authentication → Modelos**, os e-mails de confirmação e de nova senha saem em português (o site
   pede `pt-BR`); dá para trocar o remetente e o texto ali.
4. **Authentication → Configurações → Domínios autorizados**: o domínio do site (`gov-hub.io`, e
   `www.gov-hub.io` se ele for usado). `localhost` já vem autorizado.
5. **Firestore Database**: crie o banco em **modo de produção**.
6. Publique as regras de [`firestore.rules`](firestore.rules): cole o conteúdo em
   **Firestore → Regras → Publicar**, ou rode `firebase deploy --only firestore:rules` (Firebase CLI).
   As regras de `firestore.rules` são as que estão publicadas no console; mantenha os dois sempre
   iguais. Elas incluem as das coleções `feedback` (avaliação da aula) e `avaliacao_trilha` (nota de
   1 a 5 da trilha), ambas só de criação e com campos validados, e precisam estar publicadas
   **antes** do deploy que as usa; sem elas o envio falha.
7. Commite `assets/firebase-config.js`. Ao abrir o site, o botão **Entrar** aparece na barra superior e
   abre o modal com Google, e-mail e senha, criar conta e recuperar a senha (`assets/login.js`).

Os valores de `firebaseConfig` são públicos por natureza; o que protege os dados são as regras do
passo 6. A decisão está no [ADR 0004](docs/adr/0004-progresso-no-firebase.md).
A avaliação das aulas está no [ADR 0006](docs/adr/0006-feedback-anonimo.md): a resposta não leva
uid, nome, e-mail nem horário, mas não é anônima diante de quem administra o projeto Firebase.

**Ler o feedback.** Console do Firebase → Firestore → coleção `feedback` (filtros por `trilha` e
`aula`) e coleção `avaliacao_trilha` (`trilha`, `nota`, `periodo`). Para ter uma tabela, exporte a coleção para o BigQuery (ou leia com um script pequeno usando
o Admin SDK). `gcloud firestore export` gera um export do Firestore no Cloud Storage, não uma planilha.

---

## 8. Origem do conteúdo

O conteúdo desta trilha vem do levantamento de conteúdos elaborado pela equipe (versões V1, V2 e V3 do
documento de trabalho), incluindo a seção de metodologia que mapeia a ementa para os quatro tipos do
Diátaxis. A estrutura do repositório — trilha com fonte única, gerador, visualizador de Markdown e
organização Diátaxis — foi reaproveitada de um handbook anterior construído com as mesmas premissas.
