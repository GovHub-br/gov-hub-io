# Revisão de Pull Requests

Esta página resume como as mudanças técnicas do GovHub BR são revisadas. As
regras operacionais do `data-application-gov-hub` estão no
[protocolo oficial do repositório](https://github.com/GovHub-br/data-application-gov-hub/blob/main/.github/MERGE_REQUEST_PROTOCOL.md),
que deve prevalecer em caso de divergência.

Nos projetos hospedados no GitLab, leia *Merge Request* (MR) como o equivalente
a *Pull Request* (PR).

## Antes de abrir o PR

1. Crie uma issue para registrar contexto e critérios de aceite.
2. Use uma branch com o prefixo adequado.
3. Execute os testes e verificações aplicáveis.
4. Atualize a documentação afetada.
5. Descreva motivação, mudanças, validação e issue relacionada.

Os padrões de branch e commit estão no [Git Workflow](../onboarding/git-workflow.md).
Os requisitos de conteúdo e checklists estão no [Guia de Contribuição](../CONTRIBUTING.md).

## Revisão por domínio

O `CODEOWNERS` do repositório define os times responsáveis por cada área. No
`data-application-gov-hub`, a distribuição atual é:

| Área alterada | Time responsável |
| --- | --- |
| DAGs e modelos dbt | `@GovHub-br/developers` |
| Plugins e helpers | `@GovHub-br/developers` |
| Templates do pipeline | `@GovHub-br/developers` |
| GitHub, CI/CD e configuração de contribuição | `@GovHub-br/infra` |
| Build, ambiente e execução local | `@GovHub-br/infra` |
| README principal | `@GovHub-br/developers` e `@GovHub-br/infra` |

Mudanças que atravessam domínios devem receber revisão de todos os times
aplicáveis.

## Proteção da branch principal

Para que o `CODEOWNERS` tenha efeito obrigatório, a ruleset da `main` deve:

- exigir PR antes do merge;
- exigir pelo menos uma aprovação;
- exigir aprovação dos Code Owners;
- bloquear force push e exclusão da branch.

As configurações do GitHub são a fonte de verdade para o bloqueio automático.
Quando alguma proteção não estiver habilitada, autores e mantenedores devem
aplicar a regra manualmente até a configuração ser corrigida.

## Critérios de revisão

### Código e dados

- comportamento e regra de negócio estão corretos;
- testes, lint e validações relevantes passaram;
- DAGs e modelos seguem os padrões de engenharia;
- logs permitem diagnosticar falhas sem expor dados sensíveis;
- credenciais e certificados não foram adicionados ao código ou ao histórico;
- impacto operacional e compatibilidade foram considerados.

### Documentação

- instruções correspondem ao comportamento atual;
- comandos, caminhos e links são verificáveis;
- não há conteúdo duplicado ou contraditório;
- exemplos não contêm credenciais reais nem dados pessoais;
- o build do MkDocs passa sem avisos.

## Durante a revisão

O revisor deve explicar problemas de forma objetiva e usar *request changes*
para falhas que realmente impedem o merge. Preferências de estilo que não
violam padrões documentados devem ser tratadas como sugestões.

O autor deve responder aos comentários, aplicar ou justificar cada solicitação
e pedir nova revisão depois de concluir as mudanças. Discussões técnicas devem
permanecer na thread do PR para preservar contexto e rastreabilidade.

## Aprovação e merge

O merge só deve ocorrer quando:

- os checks obrigatórios estiverem concluídos;
- as conversas relevantes estiverem resolvidas;
- as aprovações exigidas pela ruleset tiverem sido obtidas;
- não houver pedido de mudança pendente;
- a branch estiver apta a ser integrada sem conflito.

PRs urgentes continuam sujeitos a revisão e registro do motivo da urgência.
Incidentes com credenciais exigem primeiro revogação ou rotação do segredo;
apagar apenas o arquivo atual não elimina a exposição no histórico Git.
