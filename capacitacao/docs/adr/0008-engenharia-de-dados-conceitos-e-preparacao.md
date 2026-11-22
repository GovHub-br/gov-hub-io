# ADR 0008 — Separar conceitos e preparação em Engenharia de Dados

## Contexto

O público da trilha é de TI, com conhecimentos gerais de programação. O primeiro nível misturava apresentação conceitual, configuração local e operação de cargas. A preparação em uma única aula não cobria as validações necessárias para as práticas seguintes.

## Decisão

O nível 1 reúne cinco aulas: engenharia de dados, contexto do Gov Hub, ETL/ELT, arquitetura e organização macro, e glossário técnico/contextual. O nível 2 reúne sete aulas de preparação local baseadas na documentação pública e na configuração executável da aplicação.

SQL e modelagem passam ao nível 3; ingestão, orquestração e transformação, ao 4; qualidade, governança e entrega, ao 5. As aulas de cargas repetíveis e reprocessamento são deslocadas para o nível 4. Seus caminhos e IDs permanecem iguais.

## Consequências

- O percurso tem 40 aulas em cinco níveis, com no máximo 12 aulas por nível.
- A preparação tem critérios de conclusão por serviço e conexão, com configuração visual e execução seletiva de um modelo do projeto dbt existente no banco local, sem exigir fontes protegidas.
- A arquitetura local distingue o Compose da infraestrutura compartilhada e não presume MinIO no ambiente de estudo.
- A aula separada de diagnóstico foi removida; as validações ficam nos respectivos serviços.
- As telas de Connections, Variables e Superset usam capturas da documentação e parâmetros ajustados ao Compose. A aula dbt ajusta profiles.yml, dbt_project.yml e o destino dos snapshots do projeto existente, sem instalar um projeto auxiliar; a execução usa as origens já carregadas no banco local.
- A navegação, o catálogo e a revisão acompanham a nova sequência; o progresso existente continua associado às mesmas aulas.

## Alternativas consideradas

Manter a preparação dentro do nível conceitual preservaria a mistura de propósitos. Transformá-la apenas em apoio externo reduziria o acompanhamento da preparação no percurso. Criar uma etapa independente torna os pré-requisitos e as validações visíveis antes das práticas.
