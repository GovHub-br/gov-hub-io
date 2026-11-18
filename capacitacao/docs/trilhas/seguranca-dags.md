# Desenvolvimento seguro de DAGs

SAST e SCA na prática, com Bandit e Trivy, para quem escreve DAGs do Airflow no GovHub.

> Versão visual, com progresso: **[mapa da trilha](../../mapa.html?trilha=seguranca-dags)**
> Gerado a partir de **[trilhas/seguranca-dags.md](../../trilhas/seguranca-dags.md)** por `tools/gen_roadmap.py` — não edite à mão.

---

### Nível 1 · Segurança no ciclo da DAG
*Por que segurança não é uma etapa no fim: o ciclo seguro de desenvolvimento aplicado a uma DAG e a superfície de ataque que ela expõe.*
- [Segurança no ciclo de desenvolvimento da DAG](../explicacao/seguranca-no-ciclo-da-dag.md) — *Explicação* · **Essencial**
- [Superfície de ataque de uma DAG](../explicacao/superficie-de-ataque-de-uma-dag.md) — *Explicação* · Apoio

### Nível 2 · O que as ferramentas enxergam
*SAST, SCA, segredos e misconfiguration: que pergunta cada técnica responde e onde está o ponto cego, que é o dado pessoal nos valores.*
- [O que SAST, SCA, segredos e misconfig enxergam (e o que não enxergam)](../explicacao/o-que-cada-ferramenta-enxerga.md) — *Explicação* · **Essencial**
- [Dado pessoal nos valores: o que nenhuma ferramenta vê](../explicacao/dado-pessoal-nos-valores.md) — *Explicação* · **Essencial**

### Nível 3 · Do scan à correção
*Laboratório guiado de ponta a ponta: uma DAG insegura de propósito, os dois scans, a correção e a descoberta do que as ferramentas deixaram passar.*
- [Laboratório: do scan à correção](../tutoriais/laboratorio-do-scan-a-correcao.md) — *Tutorial* · **Essencial**

### Nível 4 · Resolver no dia a dia
*Guias para os problemas concretos que aparecem no trabalho: ler o relatório, decidir o que fazer com cada achado, tratar credenciais e dependências, proteger dado pessoal, automatizar os scans e reagir a um vazamento.*
- [Rodar Bandit e Trivy e ler o relatório](../guias/rodar-bandit-e-trivy-e-ler-o-relatorio.md) — *Guia* · **Essencial**
- [Decidir o que fazer com um achado](../guias/decidir-o-que-fazer-com-um-achado.md) — *Guia* · Apoio
- [Tratar credenciais em DAGs](../guias/tratar-credenciais-em-dags.md) — *Guia* · **Essencial**
- [Corrigir uma dependência vulnerável](../guias/corrigir-uma-dependencia-vulneravel.md) — *Guia* · Apoio
- [Manter dado pessoal fora de logs, XCom e repositório](../guias/manter-dado-pessoal-fora-de-logs-xcom-e-repositorio.md) — *Guia* · **Essencial**
- [Encaixar os scans no fluxo: pre-commit, PR e CI](../guias/encaixar-os-scans-no-fluxo.md) — *Guia* · **Essencial**
- [Responder a um segredo ou dado pessoal commitado](../guias/responder-a-um-segredo-ou-dado-pessoal-commitado.md) — *Guia* · Apoio

### Nível 5 · Consultar e revisar
*O que consultar enquanto trabalha (comandos, regras, checklist, glossário), a autoavaliação, as lacunas que a trilha ainda não cobre e o exercício final, antes e depois.*
- [Checklist pré-PR](../referencia/checklist-pre-pr.md) — *Referência* · **Essencial**
- [Comandos do Bandit e do Trivy](../referencia/comandos-do-bandit-e-do-trivy.md) — *Referência* · Apoio
- [Regras do Bandit mais comuns em DAGs](../referencia/regras-do-bandit-mais-comuns-em-dags.md) — *Referência* · Apoio
- [Glossário de segurança de DAGs](../referencia/glossario-de-seguranca-de-dags.md) — *Referência* · Apoio
- [Autoavaliação](../referencia/autoavaliacao.md) — *Referência* · Apoio
- [Recomendações e próximos passos](../explicacao/recomendacoes-e-proximos-passos.md) — *Explicação* · Apoio
- [Exercício final: triagem de uma DAG real (antes e depois)](../desafios/triagem-de-uma-dag-real.md) — *Desafio* · **Capstone**

