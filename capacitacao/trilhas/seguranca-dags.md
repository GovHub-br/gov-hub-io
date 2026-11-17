---
slug: seguranca-dags
titulo: Desenvolvimento seguro de DAGs
descricao: SAST e SCA na prática, com Bandit e Trivy, para quem escreve DAGs do Airflow no GovHub.
categoria: tecnica
chamada: Uma DAG é código que roda sozinho, em agenda, com as credenciais do data warehouse, e muitas vezes toca dado pessoal. Aprenda a escaneá-la, a corrigir o que as ferramentas apontam e a enxergar o que elas não enxergam.
etapas: Por quê=Segurança no ciclo da DAG | O quê=O que as ferramentas enxergam | Prática=Do scan à correção | Como=Resolver no dia a dia | Consultar=Consultar e revisar
etapas_subtitulo: Cinco etapas em sequência: do "por quê" à consulta no dia a dia
etapas_nota: **Dado pessoal** nos valores das tabelas é o ponto cego do Bandit e do Trivy: o nível 2 e o guia de dado pessoal cobrem essa lacuna.
---
# Trilha de aprendizagem: Desenvolvimento seguro de DAGs

> **Fonte única da trilha.** Edite **apenas este arquivo** e rode `python3 tools/gen_roadmap.py`. Ele regenera `docs/trilhas/seguranca-dags.json`, `docs/trilhas/seguranca-dags.md` e `docs/trilhas/seguranca-dags.xmind`. O formato dos itens é o mesmo de `trilhas/dashboards.md`.
>
> **Público:** cientistas de dados e analistas que escrevem DAGs do Airflow em Python e não têm formação em segurança. **Pré-requisitos:** Python, Git, terminal e noção básica de Docker.
>
> **Ferramentas:** Bandit (SAST para Python) e Trivy (SCA, segredos e misconfiguration). **Versão do conteúdo:** 2.0, reorganizada a partir do "Guia de Capacitação: Desenvolvimento Seguro de DAGs" v1.0 (04/11/2026).
>
> **Atenção ao publicar:** os casos reais do GovHub aparecem de forma generalizada, sem nomes de repositórios, arquivos ou números. Revise antes de publicar fora do ambiente interno.
>
> **Cadência:** faça os itens **core** de cada nível, de cima para baixo; **support** fica para quando for necessário. Os itens **core** formam o MVP da trilha (marcados com ★ no guia original). O desafio é o **capstone**.

## Nível 1 · Segurança no ciclo da DAG
Etapa: Por quê · Ícone: light-bulb
Por que segurança não é uma etapa no fim: o ciclo seguro de desenvolvimento aplicado a uma DAG e a superfície de ataque que ela expõe.

- [explanation] **Segurança no ciclo de desenvolvimento da DAG** — core — `docs/explicacao/seguranca-no-ciclo-da-dag.md`
- [explanation] **Superfície de ataque de uma DAG** — support — `docs/explicacao/superficie-de-ataque-de-uma-dag.md`

## Nível 2 · O que as ferramentas enxergam
Etapa: O quê · Ícone: shield-check
SAST, SCA, segredos e misconfiguration: que pergunta cada técnica responde e onde está o ponto cego, que é o dado pessoal nos valores.

- [explanation] **O que SAST, SCA, segredos e misconfig enxergam (e o que não enxergam)** — core — `docs/explicacao/o-que-cada-ferramenta-enxerga.md`
- [explanation] **Dado pessoal nos valores: o que nenhuma ferramenta vê** — core — `docs/explicacao/dado-pessoal-nos-valores.md`

## Nível 3 · Do scan à correção
Etapa: Prática · Ícone: beaker
Laboratório guiado de ponta a ponta: uma DAG insegura de propósito, os dois scans, a correção e a descoberta do que as ferramentas deixaram passar.

- [tutorial] **Laboratório: do scan à correção** — core — `docs/tutoriais/laboratorio-do-scan-a-correcao.md`

## Nível 4 · Resolver no dia a dia
Etapa: Como · Ícone: wrench
Guias para os problemas concretos que aparecem no trabalho: ler o relatório, decidir o que fazer com cada achado, tratar credenciais e dependências, proteger dado pessoal, automatizar os scans e reagir a um vazamento.

- [how-to] **Rodar Bandit e Trivy e ler o relatório** — core — `docs/guias/rodar-bandit-e-trivy-e-ler-o-relatorio.md`
- [how-to] **Decidir o que fazer com um achado** — support — `docs/guias/decidir-o-que-fazer-com-um-achado.md`
- [how-to] **Tratar credenciais em DAGs** — core — `docs/guias/tratar-credenciais-em-dags.md`
- [how-to] **Corrigir uma dependência vulnerável** — support — `docs/guias/corrigir-uma-dependencia-vulneravel.md`
- [how-to] **Manter dado pessoal fora de logs, XCom e repositório** — core — `docs/guias/manter-dado-pessoal-fora-de-logs-xcom-e-repositorio.md`
- [how-to] **Encaixar os scans no fluxo: pre-commit, PR e CI** — core — `docs/guias/encaixar-os-scans-no-fluxo.md`
- [how-to] **Responder a um segredo ou dado pessoal commitado** — support — `docs/guias/responder-a-um-segredo-ou-dado-pessoal-commitado.md`

## Nível 5 · Consultar e revisar
Etapa: Consultar · Ícone: clipboard-document-list
O que consultar enquanto trabalha (comandos, regras, checklist, glossário), as lacunas que a trilha ainda não cobre e o exercício final antes e depois.

- [reference] **Checklist pré-PR** — core — `docs/referencia/checklist-pre-pr.md`
- [reference] **Comandos do Bandit e do Trivy** — support — `docs/referencia/comandos-do-bandit-e-do-trivy.md`
- [reference] **Regras do Bandit mais comuns em DAGs** — support — `docs/referencia/regras-do-bandit-mais-comuns-em-dags.md`
- [reference] **Glossário de segurança de DAGs** — support — `docs/referencia/glossario-de-seguranca-de-dags.md`
- [explanation] **Recomendações e próximos passos** — support — `docs/explicacao/recomendacoes-e-proximos-passos.md`
- [challenge] **Triagem de uma DAG real (antes e depois)** — capstone — `docs/desafios/triagem-de-uma-dag-real.md`
