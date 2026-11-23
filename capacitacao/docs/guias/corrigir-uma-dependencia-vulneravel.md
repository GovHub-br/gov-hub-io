# Como corrigir uma dependência vulnerável

> Tipo: **Guia (how-to)**

## Objetivo

Sair de um CVE no relatório para uma versão corrigida em produção.

## Antes de começar

- Um relatório do Trivy com a vulnerabilidade (veja [Rodar Bandit e Trivy e ler o relatório](rodar-bandit-e-trivy-e-ler-o-relatorio.md)).
- Um ambiente de homologação para testar a DAG.

## Passos

1. No relatório do Trivy, anote a biblioteca, a versão instalada e a **Fixed Version**.
2. Descubra se a dependência é **direta** (você declarou) ou **transitiva** (veio de outra). `pip show pacote` mostra quem a requer; o `pipdeptree` desenha a árvore.
3. **Direta:** atualize a versão fixada. **Transitiva:** atualize o pacote que a traz; se não houver versão nova dele, fixe a transitiva explicitamente e teste.
4. **Se o CVE está numa dependência do Airflow ou de um provider:** as dependências do Airflow são testadas em conjunto e publicadas num arquivo de *constraints* para cada versão. Atualizar uma biblioteca isolada pode quebrar o Airflow. O caminho é atualizar o Airflow ou o provider, junto com a equipe responsável pela plataforma.
5. Rode os testes e a DAG em homologação e repita o scan.
6. **Sem Fixed Version?** Mitigue, registre e acompanhe o aviso do mantenedor (veja [Decidir o que fazer com um achado](decidir-o-que-fazer-com-um-achado.md)).
7. **Mantenha o que roda sob controle.** Fixe versões ou use lock file e deixe um bot de atualização de dependências propor PRs. A imagem base do Docker também é dependência: `trivy image nome:tag` a analisa.

## Pronto

O novo scan não lista mais o CVE, a DAG passa em homologação e as versões estão fixadas.

## Veja também

- [Apache Airflow (plataforma)](../plataforma/pipeline/airflow.md)
- [Comandos do Bandit e do Trivy](../referencia/comandos-do-bandit-e-do-trivy.md)
