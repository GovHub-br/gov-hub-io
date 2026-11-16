# ADR 0009 — Reconstruir o nível 3 em torno da modelagem

## Contexto

O público já conhece SQL. As aulas anteriores de consultas, JOINs, tipos e desempenho não formavam um percurso suficiente de construção e manutenção das camadas analíticas.

Uma primeira versão do nível reorganizou o tema em oito aulas, mas manteve um formato de notas de revisão: muitos conceitos por aula, saídas de consulta descritas em texto, um domínio diferente a cada exemplo e ressalvas espalhadas pela prosa. Faltava um percurso em que a pessoa visse cada decisão acontecer.

## Decisão

O nível 3 tem nove aulas, nesta ordem: prática de SQL em duas partes (quem entra no resultado; como contar e somar); planejamento da entrega; responsabilidades das camadas; granularidade; formas de entrega (tabela larga, estrela, snowflake); onde mora cada regra no dbt; posição atual e histórico; validação e entrega. A granularidade vem antes das formas de entrega porque a primeira decisão de um modelo dimensional é o grão do fato.

Todas as aulas trabalham a mesma pergunta, "quanto foi contratado e quanto já foi pago em cada contrato?", sobre uma **base de estudo** sintética no schema `estudo_modelagem`. Ela imita a cadeia real `compras_gov.contratos` → `contratos` → `contratos_empenhos` → `contratos_resumo`, e cada registro foi escolhido para provocar uma decisão: unidade não cadastrada, contrato sem empenho, contrato inativo com pagamento, empenho sem contrato e data fora do padrão. Os scripts ficam em `exemplos/engenharia-modelagem/`.

Cada aula segue o mesmo desenho: gancho de contexto, o que se aprende, exemplo resolvido com a saída real da consulta e "Leia assim", o trecho correspondente do código da aplicação, um caso real, erros comuns e perguntas com respostas comentadas. As respostas ficam numa seção própria, sem HTML, para funcionar no site e no PDF.

O nível deixa dois problemas de propósito, ambos copiados do projeto real, para a aula de entrega encontrá-los com testes: o filtro de contratos ativos na silver, que tira da gold o pagamento de contratos inativos, e a regra de pendência de baixa, que passa a errar quando a silver é corrigida.

Os exemplos de código vêm do repositório data-application-gov-hub na revisão 046bae840132cd17e6ba55a7ff9c942105f59927. As saídas impressas nas aulas foram obtidas executando cada consulta em PostgreSQL 17 com fuso UTC, como no Compose da aplicação. Os números citados de um banco local real são apresentados com data e com o aviso de que variam por ambiente.

Os diagramas usam a skill `govhub-diagramas`. Como os temas do nível dependem de mostrar linhas de dados (JOIN, granularidade, linha do tempo de um snapshot), que nenhuma família da skill cobre, esses diagramas usam o CSS, as cores e o renderizador da skill com tabelas próprias.

## Consequências

- O nível 3 tem nove aulas e a trilha tem 42 aulas em cinco níveis. A ordem mudou, e os títulos também; os caminhos e IDs das aulas existentes foram mantidos, então o progresso salvo continua valendo. A segunda parte da prática de SQL (`tutoriais/engenharia-sql-medidas`) começa com ID próprio.
- A prática de SQL deixou de tratar permissões; o assunto passou para o guia de entrega, que funciona como recapitulação do nível em forma de lista de entrega e confere o acesso da role de leitura do projeto.
- A pessoa precisa só de um cliente SQL conectado ao PostgreSQL local para acompanhar o nível. As consultas sobre tabelas reais da aplicação são opcionais e indicadas como tal.
- O nome das pastas não é tratado como garantia de schema físico, de materialização ou de permissão.
- Modelos dimensionais propostos não são apresentados como tabelas já existentes na aplicação.
- A base de estudo, as saídas impressas e os diagramas precisam mudar juntos. Ao alterar um script de `exemplos/engenharia-modelagem/`, execute de novo as consultas das aulas e confira as saídas.

## Alternativas consideradas

Manter uma revisão de SQL básico não atenderia ao público. Remover todo SQL deixaria de explicar decisões que alteram população e medidas.

Usar as tabelas reais da aplicação como base dos exemplos tornaria o nível dependente de fontes que nem todo ambiente local tem carregadas, e as saídas mudariam a cada carga. A base sintética garante que todos vejam os mesmos números; o código real aparece em cada aula como comparação.

Variar o domínio a cada aula (contratos, servidores, bolsistas) mostraria mais partes do projeto, mas impediria a pessoa de acompanhar uma mesma entrega do começo ao fim. Os outros domínios aparecem nos casos reais.
