# Dados pessoais, segredos e menor privilégio

> Tipo: **Explicação**

## Entendendo acesso e identidade

Uma **credencial** permite que um programa ou pessoa se identifique, como usuário e senha. **Permissão** define o que essa identidade pode fazer depois de entrar. Conseguir conectar ao banco não significa poder ler ou alterar qualquer tabela.

Um **perfil**, chamado role no PostgreSQL, reúne permissões. Um perfil somente de leitura pode consultar os dados autorizados, sem inserir, alterar ou apagar registros. O princípio do **menor privilégio** é conceder apenas o necessário para a atividade.

Dados pessoais são informações relacionadas a uma pessoa identificada ou identificável. Um nome pode identificar diretamente; combinações de atributos também podem permitir a identificação, mesmo sem o nome aparecer.

As coletas do SIAPE podem trazer informações pessoais e financeiras. O fato de uma coluna estar disponível na origem não significa que ela deva aparecer em um indicador ou painel.

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

Considere a configuração fictícia `POSTGRES_PASSWORD=senha_de_exemplo`. O nome à esquerda identifica a configuração; o valor à direita é a credencial. Trocar uma senha real por esse texto fictício antes de compartilhar um exemplo evita expor o segredo. Não use a senha fictícia como recomendação para um ambiente real.

## Camada não é autorização automática

Uma tabela silver ou gold ainda pode conter informação pessoal. Confira colunas, agregação e finalidade antes de conceder leitura. Na prática com `pessoas_dbt`, registre o nome das colunas e a classificação proposta, sem copiar valores pessoais.

## Segredos fora do código

Use `.env` local e o mecanismo de configuração do ambiente. `local.env` pode ser um modelo versionado, preenchido apenas com exemplos e valores não secretos. Nunca inclua tokens, senhas reais ou chaves privadas em commits, cadernos ou logs.

O material introduz cuidados de proteção de dados; decisões de divulgação precisam seguir a política e a avaliação responsável do órgão.

## Exemplo de uma entrega com menos exposição

Se a pergunta é “quantas pessoas trabalham em cada unidade?”, o painel pode precisar de contagens por unidade, sem apresentar nomes ou identificadores individuais. A tabela usada na coleta pode ter mais detalhes do que a tabela destinada ao consumo.

Agrupar não torna qualquer resultado automaticamente apropriado para divulgação: grupos muito pequenos ainda exigem avaliação. A equipe responsável precisa definir a finalidade e o acesso adequado.

Um **segredo** é um valor que permite acesso, como uma senha ou token. O nome de uma variável, por exemplo `POSTGRES_PASSWORD`, explica qual configuração existe; seu valor real deve permanecer protegido. Copiar o `.env` inteiro para pedir ajuda pode expor esse valor, mesmo que o problema esteja em outra linha.

## Veja também

- [Logs, reconciliação e atualização](../guias/engenharia-observabilidade.md)
- [Documentar colunas e seguir a linhagem](../guias/engenharia-metadados.md)
