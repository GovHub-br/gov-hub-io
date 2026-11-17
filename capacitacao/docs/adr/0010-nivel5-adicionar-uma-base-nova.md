# ADR 0010 — Trocar o nível 5 por uma contribuição de base nova

## Contexto

O nível 5 original reunia qualidade, observabilidade, acesso, metadados, consumo no Superset, formatos e um desafio. As nove aulas repetiam o formato que o nível 3 abandonou: exemplos inventados e soltos ("100 e 200", "órgão A e B"), nenhuma saída real, nenhum diagrama e várias sobreposições com o que o nível 3 (reconciliação, `USAGE` e `SELECT`, descrição do modelo) e o nível 4 (testes antes do SQL, teste singular, guia de fonte nova) já ensinam.

O objetivo da trilha mudou na revisão: quem a conclui deve conseguir **evoluir o projeto**, e não só entender engenharia de dados.

## Decisão

O nível 5 passa a se chamar "Adicionar uma base nova ao Gov Hub" e leva uma fonte da issue ao pull request, em doze aulas: visão geral do caminho; avaliar a fonte e escrever a issue; cliente, DAG, domínio, bronze, silver e gold, cada um como prática; documentação e consumo; abertura do PR e revisão; checklist; e desafio.

O exemplo condutor são os **contratos publicados no PNCP** pelo órgão configurado, porque a API é pública, não é ingerida pelo repositório, e o aluno já conhece a API do nível 4. A pergunta da entrega é "quanto o órgão contratou em cada mês, separando contratos de empenhos?".

Os assuntos do nível antigo foram redistribuídos, e não descartados:

| Assunto antigo | Onde está agora |
|---|---|
| Qualidade e prática de falha | Testes antes do código em cada prática; falhas provocadas e reconciliação na silver e na gold |
| Dados pessoais, segredos e menor privilégio | Avaliação da fonte (classificar), `grants` no domínio e regra de privacidade testada na silver |
| Logs, reconciliação e atualização | A DAG com conferência da carga; a reconciliação da gold; as três datas na aula de documentação |
| Documentar e seguir a linhagem | Aula de documentação, com capturas do dbt docs |
| Da gold ao gráfico no Superset | Conferência do que o consumo enxerga; o painel fica na trilha de Dashboards |
| Contribuir com uma mudança revisável | Aula do PR, agora com commits atômicos, descrição preenchida e protocolo de revisão |
| Formatos e MinIO | Removida: o MinIO não está no Compose da aplicação |
| Guia de fonte nova, do nível 4 | Absorvido pelo checklist e pelo nível inteiro |

Os caminhos das aulas de documentação, contribuição e desafio foram mantidos, para o progresso salvo continuar valendo. As outras aulas têm identificadores novos, e as sete removidas deixam de contar.

## Verificação

Tudo que as aulas mostram foi executado: o cliente e a DAG contra a API real, a cadeia dbt na versão que o `requirements.txt` fixa (1.7.13), os testes (`pytest`, 102 passam) e as consultas, em PostgreSQL 17 com o fuso UTC. O desafio foi rodado de fato para o Ministério da Justiça (404 instrumentos em junho de 2026). Os arquivos de cada etapa estão em `exemplos/engenharia-base-nova/`, idênticos aos que foram testados na aplicação.

## Achados que o nível registra

Ao construir a base, apareceram fatos sobre o projeto que as aulas ensinam e que a equipe da aplicação pode querer tratar:

- O dbt 1.7.13 ignora a chave `data_tests:` do `schema.yml`: nas bronzes de contratos e de TED, nenhum teste é encontrado; com o dbt 1.12, 47 só na de contratos.
- O `dt_ingest` das 44 DAGs que o gravam usa `datetime.now()`, em UTC no container, e as bronzes acrescentam `-03:00`.
- A skill `govhub-pipeline-guide` diverge do código (caminhos de teste, cliente, domínios, e o comportamento de um `schema.yml` sem modelo).
- O método `get_contratacoes_publicacao` devolve lista vazia quando a API falha, o que já tinha aparecido no nível 4.

A ADR não os corrige: eles são de outro repositório, e as aulas os apresentam como achados com a evidência.

## Consequências

- A trilha tem 44 aulas em cinco níveis; o nível 4 passa a ter 11, e o nível 5, 12.
- O nível 5 depende de um ambiente com Docker, da API pública do PNCP e do `data-application-gov-hub` na revisão citada. Os números mudam se a fonte retificar registros, e as aulas dizem isso.
- As aulas assumem que o aluno **não** envia o trabalho à aplicação sem uma issue atribuída; a prática é local, e o desafio aceita uma issue real.
- A base de estudo e o gabarito precisam mudar juntos com as aulas. Ao alterar um arquivo de `exemplos/engenharia-base-nova/`, rode de novo os comandos das aulas e confira as saídas.

## Alternativas consideradas

Manter o nível de qualidade e governança, só reescrito no padrão do nível 3, ensinaria mais conceitos, mas não entregaria a capacidade de contribuir. Uma fonte de natureza diferente (por exemplo, SOAP) treinaria mais a avaliação de algo desconhecido, mas gastaria o nível numa API nova em vez do processo. O PNCP reaproveita o que o nível 4 construiu. Uma issue real como único exemplo dependeria de existir uma atribuível a cada aluno; ela fica como opção do desafio.
