# Contribuir com uma mudança revisável

> Tipo: **Guia**

## Objetivo

Preparar uma alteração que outra pessoa consiga revisar e reproduzir.

## Antes de começar

Leia as regras de contribuição da aplicação. O fluxo usa issue atribuída, fork, branch, commits padronizados e PR pelo modelo do projeto. A prática é local: não é necessário enviar nada.

## Passos

1. Relacione a mudança a uma issue e defina qual resultado será corrigido ou acrescentado.
2. Crie uma branch específica no fluxo de fork adotado pela equipe.
3. Faça uma alteração pequena, com testes do comportamento relevante e descrições dos dados afetados.
4. Confira `git diff` e `git status`: exclua arquivos de ambiente, credenciais e saídas com dados pessoais.
5. Execute `make lint` e `make test`, conforme o `Makefile` da versão local, além dos testes dbt pertinentes.
6. Atualize sua branch com a base atual segundo a política do projeto. O fluxo usa rebase para atualizar a branch. Como ele reescreve commits, não o aplique a trabalho compartilhado sem coordenação.
7. Prepare a descrição do PR: problema, mudança, validação e impacto nos consumidores. Use o template e o encaminhamento de revisão por `team:*` quando previstos no repositório.

## Exemplo: transformar uma correção em trabalho revisável

| Etapa | Exemplo de conteúdo |
|---|---|
| Issue | “O total por órgão está duplicado depois da junção” |
| Branch | `fix/total-por-orgao` |
| Alteração | Corrigir a relação que multiplicava registros |
| Evidência | A amostra de 100 + 200 passa de 600 indevidos para 300 |
| Descrição do PR | Problema, regra ajustada e comandos de validação |

Uma mensagem de commit poderia ser `fix: corrige duplicação do total por órgão`. Isso registra a intenção da mudança; a evidência mostra seu efeito.

Na revisão, outra pessoa precisa conseguir repetir a conferência com os mesmos dados. “Testado e funcionando” não informa quais valores eram esperados nem o que foi executado. Registre também qualquer mudança de interpretação do indicador para quem o consome.

## Pronto

A revisão consegue verificar o resultado com os passos registrados. As verificações automáticas do GitHub complementam a conferência local; uma execução aprovada não substitui a revisão de regra de negócio.

## Validação específica da mudança de dados

Na descrição da contribuição, registre a fonte e os modelos afetados, a regra de negócio alterada, o período usado na conferência e as evidências de qualidade. Indique se há necessidade de reprocessar o histórico ou comunicar uma mudança aos consumidores.

Use o padrão de commits do projeto e as labels `team:*` previstas para encaminhar a revisão. Prepare a descrição com os resultados de `make lint`, `make test` e dos testes dbt pertinentes, sem enviar a contribuição durante a prática.

## Veja também

- [Prática: da gold ao gráfico no Superset](../tutoriais/engenharia-consumo.md)
- [Desafio: uma fonte até um indicador confiável](../desafios/engenharia-desafio.md)
