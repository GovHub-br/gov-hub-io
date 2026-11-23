# ADR 0011 — Nível 0 de fundamentos, fora do Gov Hub, e selos por nível

## Contexto

Uma revisão da trilha de Engenharia de Dados apontou que as aulas misturam conceitos de engenharia de dados com o funcionamento do Gov Hub desde o começo. Quem não conhece os conceitos precisa aprender, ao mesmo tempo, o que é uma camada e onde ela fica no repositório, e precisa subir a aplicação inteira (nível 2) antes de escrever a primeira consulta. A carga cognitiva fica alta para quem está começando.

A sugestão foi acrescentar um nível inicial, sem relação com o Gov Hub, com o próprio ambiente e com o código em notebooks, e marcar os níveis como "opcional/iniciante", "essencial" e "avançado". Os níveis existentes ficam como estão.

## Decisão

**Um nível 0, "Fundamentos: um pipeline de ponta a ponta", com oito aulas.** Ele não ensina o básico de programação: ensina engenharia de dados como um todo, num cenário fictício, construindo à mão cada etapa que as ferramentas do Gov Hub automatizam. São uma explicação do cenário, um guia de preparação do Jupyter, cinco práticas (coleta, gravação, camadas, testes e orquestração) e uma explicação que liga cada etapa à ferramenta do Gov Hub.

**O cenário é um sistema municipal de bicicletas compartilhadas, a Pedala Aurora**: oito estações e uma semana de viagens. Ele é entendido sem explicação prévia, tem cadastro e eventos, tempo, junção e uma pergunta clara, e não repete os contratos dos níveis 3 a 5. Os dados são sintéticos, gerados com semente fixa e com defeitos plantados (página repetida, falha temporária, viagem com fim antes do início, estação fora do cadastro e viagens atrasadas), cada um descoberto numa aula.

**Cada prática é um notebook que roda sozinho.** A Preparação gera os dados e liga uma API de mentira dentro do próprio kernel (`http.server` numa thread), recria o ponto de partida das aulas anteriores e usa o DuckDB como banco. Não há Docker, credenciais nem internet além da instalação dos pacotes. As células seguem três tipos (`Rode e observe`, `Sua vez`, `Confira`), sem emojis, e o resultado da conferência aparece como `[OK]`, `[ERRO]` ou `[AVISO]`, e a resposta de cada exercício fica nos metadados da célula. A aula explica o porquê e mostra a saída real; o notebook é onde a pessoa faz.

**Selos por nível.** A linha `Selo: iniciante | essencial | avancado` em `trilhas/<slug>.md` vira um selo no mapa. O nível 0 é `iniciante`, os níveis 1 a 4 são `essencial` e o 5 é `avancado`. Um nível `iniciante` é opcional: fica fora do andamento, da conclusão e do quiz, e só abre por padrão para quem ainda não começou a trilha. Os papéis `optional` e `advanced` das aulas ganharam rótulos próprios no mapa, em vez de "Apoio".

**O número 0, e não a renumeração.** Inserir um nível 1 novo obrigaria a trocar as dezenas de referências a "nível 4" e "nível 5" no texto das aulas. O progresso salvo não depende do número do nível, mas o texto depende.

**Botão do Colab.** A linha `> Notebook: [...] · Colab` acrescenta ao cartão um botão que abre o notebook no Google Colab, lido da `main` no GitHub. Ele só vale para notebooks que não dependem do ambiente do Gov Hub, como os do nível 0.

## Verificação

Os seis notebooks foram executados com e sem as respostas (`tests/test_notebooks.py`): rodam do início ao fim, as conferências passam com as respostas e pedem a resposta quando ela falta. As saídas mostradas nas aulas vêm dessas execuções. A recuperação da gravação depois de uma falha no meio da transação foi testada no DuckDB. As capturas do JupyterLab são de uma execução real, e as fotos, do Pexels, foram olhadas uma a uma antes de entrar, descartando as que mostravam marcas comerciais, já que o cenário é fictício (créditos em `assets/imagens/engenharia-fundamentos/CREDITOS.md`).

## Consequências

- A trilha tem 52 aulas em seis níveis; 44 contam para concluí-la.
- O quiz não tem perguntas do nível 0. As conferências dos notebooks fazem esse papel.
- Os notebooks do nível 0 compartilham o código do cenário e das etapas. Ao mudar uma etapa, mude-a em todos os notebooks que a recriam e rode `tests/test_notebooks.py`.
- O teste dos notebooks é pulado quando faltam `duckdb`, `httpx`, `pandas`, `matplotlib`, `nbclient`, `nbformat` e `ipykernel`, como no CI atual. Para valer no CI, o workflow precisa instalá-los.
- O botão do Colab só funciona depois que os notebooks chegam à `main`.

## Alternativas consideradas

Ensinar o básico de SQL e Python repetiria o começo do nível 3 e não diminuiria a dependência do Gov Hub. Usar dados reais de uma API pública tornaria as saídas imprevisíveis e as práticas dependentes da internet. Um PostgreSQL em Docker deixaria o SQL idêntico ao do Gov Hub, mas traria de volta a instalação que o nível quer evitar; o DuckDB tem um SQL muito próximo e roda no Colab. Mover a instalação do Gov Hub para o fim da trilha exigiria refazer as práticas dos níveis 3 e 4, que dependem dela; fica para depois, conforme o retorno de quem fizer o nível 0.
