# Configuração local e credenciais

> Tipo: **Guia**

## Objetivo

Preparar o checkout e revisar os parâmetros locais antes da construção dos serviços. Todas as ações deste nível ocorrem em `data-application-gov-hub`, não no repositório da capacitação.

## 1. Obter a aplicação

```bash
git clone git@github.com:GovHub-br/data-application-gov-hub.git
cd data-application-gov-hub
```

O exemplo usa acesso SSH ao GitHub. Se já existe um checkout de estudo, use-o e confira sua revisão e alterações pendentes antes de atualizar. O fluxo de fork e as regras de contribuição ficam na documentação de Git do projeto.

## 2. Revisar o modelo de configuração

Leia `local.env`, `docker-compose.yml` e os alvos `setup`, `dev` e `dev-check` do `Makefile`. Se `.env` ainda não existir, prepare a cópia local:

```bash
cp -n local.env .env
git check-ignore .env
```

Não sobrescreva um `.env` existente: ele pode conter ajustes do seu ambiente. `make setup` também cria essa cópia quando ela não existe.

| Grupo de parâmetros | O que conferir |
|---|---|
| `POSTGRES_*` | Banco e credenciais locais usados pelo serviço PostgreSQL |
| `_AIRFLOW_WWW_USER_*` | Acesso à interface local do Airflow |
| `AIRFLOW_HOME` e `AIRFLOW_UID` | Diretórios e execução do Airflow no contêiner |
| `DB_DW_READONLY_*` | Perfil de leitura para consumo autorizado |
| Configuração da fonte escolhida | Acesso exigido pela DAG, quando houver |

Credenciais externas e certificados não são necessários para começar com dados sintéticos. Só configure uma fonte protegida quando houver acesso autorizado e uma prática que realmente a utilize.

## 3. Conferir a configuração de acesso ao banco

O alvo `make dev` usa parâmetros `AIRFLOW_LOCAL_DB_*` e configura `postgres_default`. Esses parâmetros precisam apontar para o mesmo banco local que os serviços e as DAGs utilizarão. Não suponha que alterar apenas uma variável do `.env` atualize automaticamente todas as conexões já cadastradas.

No dbt, a conexão é definida pelo `profiles.yml` e pelas variáveis `DB_DW_*`. A validação desse perfil terá uma aula própria; ele não é a mesma configuração de `postgres_default`.

![De onde cada parte lê a configuração. O local.env, modelo versionado, é copiado com cp -n para o .env, a cópia local que fica fora do Git e pode ser conferida com git check-ignore .env. O .env é lido pelos serviços do Compose: POSTGRES_*, _AIRFLOW_WWW_USER_*, AIRFLOW_HOME, AIRFLOW_UID e DB_DW_READONLY_*. Abaixo, duas configurações de banco separadas: o make dev usa AIRFLOW_LOCAL_DB_* e cadastra a conexão postgres_default do Airflow, e o dbt conecta pelo profiles.yml e pelas variáveis DB_DW_*. As duas precisam apontar para o mesmo PostgreSQL local.](../../assets/diagramas/engenharia-configuracao-env.png)

## Pronto

O `.env` está fora do controle de versão, os parâmetros locais estão revisados e nenhuma credencial de ambiente compartilhado foi incorporada ao checkout. A assinatura de commits, quando exigida pela ruleset, pode ser configurada antes de contribuir; não é necessário publicar nenhuma alteração para estudar.

## Referências

- [Instalação local](https://gov-hub.io/documentacao/instalacao/)
- [Gerenciamento de secrets](https://gov-hub.io/documentacao/infraestrutura/secrets/)
- [Fluxo Git do projeto](https://gov-hub.io/documentacao/onboarding/git-workflow/)

## Veja também

- [Requisitos e versões do ambiente](../referencia/engenharia-requisitos-ambiente.md)
- [Inicializar os serviços com make setup](../tutoriais/engenharia-ambiente.md)
