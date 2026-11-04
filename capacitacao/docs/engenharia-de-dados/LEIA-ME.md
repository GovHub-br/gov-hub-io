# Trilha de Engenharia de Dados no Gov Hub

Aprenda a preparar o ambiente, coletar dados, organizar modelos e entregar um indicador confiável. As práticas usam a aplicação `GovHub-br/data-application-gov-hub`; o site `gov-hub-io` apresenta o material de estudo.

## Organização

| Nível | Conteúdo | Aulas |
|---|---|---|
| Base e conceitos | Ambiente, pastas, vocabulário, ELT e reprocessamento | 7 |
| SQL e modelagem | Consultas, tipos, chaves, camadas, granularidade e histórico | 7 |
| Ingestão, orquestração e transformação | Clientes Python, fontes, Airflow, dbt e Cosmos | 10 |
| Qualidade, governança e entrega | Testes, observabilidade, acesso, metadados, consumo e contribuição | 9 |

Faça as aulas essenciais em sequência e consulte as de apoio quando precisar. Qualidade e proteção dos dados acompanham o percurso desde a primeira carga. O desafio final reúne as práticas em um único indicador.

## Ambiente das práticas

- Use ambiente local e dados públicos ou sintéticos.
- O PostgreSQL armazena os dados e executa as transformações; o Superset apresenta os resultados.
- O MinIO é preparatório e não integra o Compose da aplicação.
- As práticas não exigem publicação em produção nem envio de contribuições.
- O quiz contém uma pergunta de revisão por aula.

## Pré-visualizar e editar

Com o servidor aberto em `capacitacao/`, acesse `http://localhost:8000/mapa.html?trilha=engenharia-de-dados`.

A sequência é definida em `trilhas/engenharia-de-dados.md`. Depois de alterá-la, execute `python3 tools/gen_roadmap.py` nessa pasta para atualizar o catálogo e os arquivos gerados. Edite o conteúdo diretamente nos arquivos de cada aula.
