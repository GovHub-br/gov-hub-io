# Exercício final: triagem de uma DAG real (antes e depois)

> Tipo: **Desafio**

## O desafio

Escolha uma DAG real de baixo risco, rode os dois scans, triague os achados, corrija ao menos três e abra um PR com o relatório de triagem na descrição. Compare o antes e o depois.

## Público real

A equipe que mantém a DAG e o time de segurança do GovHub, que precisam entender, pela descrição do PR, o que foi encontrado, o que foi decidido e por quê.

## O que entregar

- A tabela de triagem, com uma linha por achado: o que é, onde está, decisão (corrigir, mitigar ou aceitar) e porquê.
- Um PR com pelo menos **três** achados corrigidos.
- A comparação do antes e do depois dos relatórios do Bandit e do Trivy (contagem por severidade basta).
- Uma nota sobre o que as ferramentas **não** cobrem nessa DAG (dado pessoal em log, XCom ou arquivo).

## Critérios de aceitação

- [ ] Bandit e Trivy rodados (`vuln`, `secret`, `misconfig`) e os relatórios ficaram fora do commit e de artefatos públicos.
- [ ] Todo achado médio, alto ou crítico tem decisão registrada.
- [ ] Toda supressão tem ID do teste, motivo, responsável e data de revisão.
- [ ] A descrição do PR **não** contém trechos de segredo nem dado pessoal.
- [ ] A descrição do PR informa que dados a DAG toca e se há dado pessoal.
- [ ] O [Checklist pré-PR](../referencia/checklist-pre-pr.md) foi percorrido.

## Como será revisado

Pelo time de segurança e por um par da equipe da DAG, com o checklist pré-PR e os critérios acima. A revisão olha a qualidade da decisão registrada, não só o número de achados corrigidos.

> Para se aprofundar depois do desafio, veja o PyGoat e o WrongSecrets em [Recomendações e próximos passos](../explicacao/recomendacoes-e-proximos-passos.md).
