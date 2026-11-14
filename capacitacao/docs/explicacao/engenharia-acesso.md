# Dados pessoais, segredos e menor privilégio

> Tipo: **Explicação**

## Acesso aos dados de pessoal

As coletas do SIAPE podem trazer informações pessoais e financeiras. A disponibilidade de uma coluna na fonte não autoriza sua exposição em indicadores ou painéis. Mesmo sem nomes, combinações de atributos podem permitir identificar uma pessoa.

Defina os acessos conforme a finalidade de cada etapa: ingestão, transformação e consumo. O perfil de leitura deve ficar restrito aos objetos autorizados.

## Três decisões antes do consumo

1. **Classificar:** identifique quais atributos permitem reconhecer uma pessoa e quais exigem acesso restrito.
2. **Minimizar:** use apenas os atributos necessários à finalidade do indicador.
3. **Limitar o acesso:** dê a cada perfil somente as permissões necessárias.

O perfil `DB_DW_READONLY_ROLE` é preparado por `docker/postgres/setup_roles.sh`. As permissões da aplicação são descritas em `dbt_project.yml`: o consumo usa silver e gold; a bronze não é liberada ao perfil de leitura.

## Exemplo: separar coleta, consulta e apresentação

Em um cenário de estudo:

| Necessidade | Dados ou ação necessários | Permissão a evitar sem necessidade |
|---|---|---|
| Coletar registros autorizados | Gravar no destino definido para a ingestão | Alterar qualquer tabela do banco |
| Conferir um indicador | Ler as tabelas autorizadas para a análise | Apagar registros da coleta |
| Mostrar quantidade por unidade | Ler a saída agregada aprovada | Exibir nomes e identificadores pessoais |

Assim, “somente leitura” não significa “leitura de tudo”: o perfil também precisa estar limitado aos objetos permitidos.

## Camada não é autorização automática

Uma tabela silver ou gold ainda pode conter informação pessoal. Confira colunas, agregação e finalidade antes de conceder leitura. Na prática com `pessoas_dbt`, registre o nome das colunas e a classificação proposta, sem copiar valores pessoais.

## Segredos fora do código

Use `.env` local e o mecanismo de configuração do ambiente. `local.env` pode ser um modelo versionado, preenchido apenas com exemplos e valores não secretos. Nunca inclua tokens, senhas reais ou chaves privadas em commits, cadernos ou logs.

O material introduz cuidados de proteção de dados; decisões de divulgação precisam seguir a política e a avaliação responsável do órgão.

## Exemplo de uma entrega com menos exposição

Se a pergunta é “quantas pessoas trabalham em cada unidade?”, o painel pode precisar de contagens por unidade, sem apresentar nomes ou identificadores individuais. A tabela usada na coleta pode ter mais detalhes do que a tabela destinada ao consumo.

Agrupar não torna qualquer resultado automaticamente apropriado para divulgação: grupos muito pequenos ainda exigem avaliação. A equipe responsável precisa definir a finalidade e o acesso adequado.

Ao compartilhar diagnósticos, remova credenciais e atributos pessoais dos logs e arquivos de configuração. Preserve o contexto técnico necessário à investigação, sem anexar o `.env` completo.

## Veja também

- [Logs, reconciliação e atualização](../guias/engenharia-observabilidade.md)
- [Documentar colunas e seguir a linhagem](../guias/engenharia-metadados.md)
