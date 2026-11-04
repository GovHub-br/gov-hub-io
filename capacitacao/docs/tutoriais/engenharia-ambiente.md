# Preparar e conferir o ambiente local

> Tipo: **Tutorial**

## O que significa “ambiente local”?

É o conjunto de programas e configurações que roda no seu computador para estudo. **Produção** é o ambiente usado pelas pessoas no trabalho diário; nossa prática usa uma instalação separada.

Um **serviço** é um programa que fica disponível para receber pedidos, como o banco de dados. O Docker executa serviços em **contêineres**, ambientes isolados com as dependências necessárias. O Compose reúne as instruções para iniciar esses serviços juntos.

| Ferramenta | Para que você vai usá-la agora |
|---|---|
| Git | Baixar e acompanhar o código |
| `gh` | Conversar com o GitHub pelo terminal; deve estar instalado e autenticado |
| Docker e Compose | Iniciar os serviços locais |
| Make | Executar atalhos definidos no `Makefile` |
| Python e Poetry | Executar código Python e preparar suas bibliotecas |

Uma **biblioteca** é código pronto que o projeto utiliza. “Instalar dependências” significa preparar essas bibliotecas. Se alguma ferramenta ainda não estiver instalada, conclua essa preparação antes dos comandos abaixo.

## Como executar os comandos

Abra o aplicativo Terminal. Ele recebe instruções escritas: digite uma linha e pressione Enter. Não copie o nome de usuário nem o símbolo `%` ou `$` que aparece antes do cursor. Espere o comando terminar antes de executar o seguinte.

`cd` muda a pasta em que você está trabalhando. Use `pwd` para ver a pasta atual e `ls` para listar seu conteúdo. Antes de `make setup`, confirme que `ls` mostra o `Makefile` da aplicação.

## O que você vai construir

Um ambiente local para estudar as coletas e as transformações, sem depender do ambiente de produção.

## Antes de começar

Tenha Git, Docker com Compose, Make, Python 3.11 e Poetry 1.8.5. Credenciais reais só são necessárias para fontes protegidas.

## Passos

1. Baixe a aplicação, em uma pasta diferente da pasta do site:

   ```bash
   gh repo clone GovHub-br/data-application-gov-hub
   cd data-application-gov-hub
   ```

2. Leia `local.env` e o alvo `setup` no `Makefile`. Com o Docker aberto, execute:

   ```bash
   make setup
   make dev-check
   docker compose ps
   ```

   O comando `make setup` prepara o `.env`, instala dependências, constrói os serviços e configura o Airflow. A primeira execução pode demorar.

3. Abra os serviços:

   | Serviço | Endereço | Acesso |
   |---|---|---|
   | Airflow | `http://localhost:8080` | Variáveis `_AIRFLOW_WWW_USER_*` do `.env` |
   | Superset | `http://localhost:8088` | Configuração local no Compose |
   | Jupyter | `http://localhost:8888` | Configuração local no Compose |
   | PostgreSQL | Porta `5432` | Variáveis `POSTGRES_*` do `.env` |

4. Confira uma DAG de IBGE na tela e encontre seu arquivo em `airflow_lappis/dags/data_ingest/ibge/`.

## Exemplo: o que cada comando muda

| Comando | Antes | Depois esperado |
|---|---|---|
| `cd data-application-gov-hub` | Terminal na pasta que contém o projeto | Terminal dentro da pasta da aplicação |
| `make setup` | Código baixado, ambiente ainda por preparar | Configuração e serviços preparados pelo projeto |
| `docker compose ps` | Você ainda não sabe o estado dos serviços | Uma listagem para conferir se eles estão ativos |

Na listagem, procure o nome de cada serviço e seu estado. Um estado como `Up` indica que o contêiner está rodando; `Exited` indica que terminou. Esses estados não comprovam que uma coleta já executou: eles dizem respeito aos programas que a tornam possível.

Compare também duas ações: `http://localhost:8080` deve ser aberto no navegador; `docker compose ps` deve ser executado no terminal. Digitar um endereço na janela errada não substitui a outra ação.

## Como verificar

Os serviços aparecem ativos e o nome da DAG na interface corresponde ao código. Se houver erro, leia `docker compose logs` do serviço que falhou.

Para parar, use `docker compose down`; para retomar, `docker compose up -d`. Evite `down -v`: ele remove os volumes e pode apagar o banco local. O MinIO não integra o Compose da aplicação.

## Entendendo os endereços e a configuração

`localhost` significa “este computador”. A **porta**, o número depois dos dois-pontos, identifica o serviço: `8080` leva ao Airflow; `8088`, ao Superset. Abra o endereço no navegador, não no terminal.

O arquivo `.env` guarda pares de nome e valor, como o endereço do banco. O ponto inicial pode fazer o arquivo ficar oculto no explorador. `local.env` é o modelo usado para preparar essa configuração. Não é preciso memorizar todas as variáveis no primeiro dia: primeiro confirme que os serviços iniciaram e que você consegue entrar nas telas.

Se o terminal mostrar `command not found`, a ferramenta citada não está disponível nesse terminal. Se a página não abrir, confira `docker compose ps`: ter baixado o repositório não significa que os serviços já estão rodando.

## Veja também

- [Onde encontrar cada parte do projeto](../referencia/engenharia-mapa-repositorio.md)
- [Vocabulário e fontes do governo](../referencia/engenharia-glossario.md)
