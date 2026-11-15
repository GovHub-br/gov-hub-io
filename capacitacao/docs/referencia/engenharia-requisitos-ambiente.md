# Requisitos e versões do ambiente

> Tipo: **Referência**

## Requisitos do percurso local

O ambiente de desenvolvimento reúne Airflow, PostgreSQL e Superset no Docker Compose. A instalação também prepara as dependências Python e as verificações do projeto na máquina de desenvolvimento.

| Ferramenta | Versão ou condição a conferir |
|---|---|
| Git | Disponível e com acesso ao repositório da aplicação |
| Docker | 24 ou superior, com o daemon em execução |
| Docker Compose | Versão 2, usando `docker compose` |
| Make | Disponível para os alvos do projeto |
| Python | 3.11 para o ambiente de desenvolvimento da aplicação |
| pipx e Poetry | Poetry 1.8.5 no fluxo de instalação apresentado |

Confira as ferramentas antes de iniciar:

```bash
git --version
docker --version
docker compose version
docker info
make --version
python3.11 --version
pipx --version
poetry --version
```

`docker info` deve alcançar o daemon, e não apenas localizar o executável. No macOS, abra o Docker Desktop e aguarde sua inicialização. A versão de Python do sistema pode ser diferente; confirme que o projeto utilizará Python 3.11.

Se pipx já estiver disponível e Poetry ainda não estiver instalado:

```bash
pipx install poetry==1.8.5
```

## Versão da aplicação e comandos suportados

Use o `Makefile` do checkout como contrato dos comandos disponíveis. O percurso apresentado usa o alvo `setup` com Poetry. Outras revisões podem adotar outro gerenciador de dependências ou separar a inicialização em outro alvo; não combine instruções de revisões diferentes.

```bash
git rev-parse --short HEAD
git status --short
```

Registre a revisão usada no estudo. Antes de executar qualquer alvo adicional, confira se ele existe no `Makefile`; um alvo como `compose` não deve ser presumido só porque aparece em outro guia ou revisão.

Verifique espaço para imagens e volumes com `docker system df`. A construção inicial baixa imagens e dependências; erros de rede precisam ser resolvidos antes de avaliar falhas do pipeline.

## Referências

- [Instalação local do Gov Hub](https://gov-hub.io/documentacao/instalacao/)
- [Instalação do pipx](https://pipx.pypa.io/stable/installation/)

## Veja também

- [Vocabulário e fontes do governo](engenharia-glossario.md)
- [Configuração local e credenciais](../guias/engenharia-configuracao-local.md)
