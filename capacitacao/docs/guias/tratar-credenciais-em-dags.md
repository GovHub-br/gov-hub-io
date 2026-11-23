# Como tratar credenciais em DAGs

> Tipo: **Guia (how-to)**

## Objetivo

Nenhuma credencial no código, no repositório nem no log.

## Antes de começar

- Acesso para criar Connections no Airflow (ou um secrets backend configurado pela equipe de plataforma).
- Se algo já vazou, vá direto a [Responder a um segredo ou dado pessoal commitado](responder-a-um-segredo-ou-dado-pessoal-commitado.md).

## Passos

1. **Use Connections.** Crie a conexão no Airflow e referencie só o identificador na DAG: `PostgresHook(postgres_conn_id='dw_homolog')`. A senha nunca aparece no arquivo.
2. **Prefira um secrets backend** (um cofre de segredos ou o gerenciador de segredos da nuvem ou do Kubernetes) a guardar segredos no banco de metadados do Airflow.
3. **Use uma conta de serviço por pipeline, com o menor privilégio possível**, somente leitura onde leitura bastar. Nunca use o token de administrador. Tokens pessoais vencem, e um pipeline que depende de um deles quebra sem aviso; conta de serviço com rotação planejada resolve as duas coisas.
4. **Mantenha o `.env` fora do Git.** Versione só um `.env.example` com nomes e valores falsos. No compose, exija o segredo para falhar cedo em vez de subir com senha vazia ou padrão:

   ```yaml
   environment:
     DB_PASSWORD: ${DB_PASSWORD:?Defina DB_PASSWORD no arquivo .env}
   ```

5. **Não imprima conexões nem URIs.** Uma URI de conexão contém a senha.
6. **Confira antes do PR:**

   ```bash
   trivy fs . --scanners secret
   ```

## Pronto

O `trivy fs . --scanners secret` não aponta nada, as DAGs só citam identificadores de Connection e o `.env` real não está versionado.

## Veja também

- [Gerenciamento de Secrets (plataforma)](../plataforma/infraestrutura/secrets.md)
- [Segurança (plataforma)](../plataforma/governanca/seguranca.md)
- [Checklist pré-PR](../referencia/checklist-pre-pr.md)
