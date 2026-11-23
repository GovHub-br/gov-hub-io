# Glossário de segurança de DAGs

> Tipo: **Referência**

## Resumo

Termos usados ao longo da trilha de desenvolvimento seguro de DAGs, com a definição adotada aqui. Para os termos de dashboards, veja o [glossário da trilha de Dashboards](glossario.md).

---

**CVE**
Identificador público de uma vulnerabilidade conhecida.

**CVSS**
Pontuação de gravidade de uma vulnerabilidade.

**CWE**
Catálogo de tipos de fraqueza de software.

**DAST**
Teste da aplicação em execução, de fora para dentro.

**DevSecOps**
Segurança embutida nas práticas de DevOps e automatizada no pipeline.

**Falso positivo / falso negativo**
Alerta que não é problema real / problema real que não gerou alerta.

**Menor privilégio**
Dar a cada conta apenas a permissão de que precisa.

**Minimização**
Tratar só os dados necessários à finalidade.

**Pseudonimização**
Troca do identificador de modo que só uma informação guardada à parte o relaciona à pessoa. O dado continua pessoal.

**Quality gate**
Regra do CI que reprova o PR quando um critério não é atendido.

**Quase-identificador**
Campo que, combinado com outros (CEP, data de nascimento, sexo), identifica a pessoa.

**SAST**
Análise estática do código, sem executá-lo (Bandit).

**SBOM**
Lista dos componentes de um software; o CycloneDX é um padrão para isso.

**SCA**
Análise das dependências em busca de vulnerabilidades conhecidas (Trivy).

**SDLC**
Ciclo de vida de desenvolvimento de software. O seguro é o mesmo ciclo, com segurança em cada fase.

**Secrets backend**
Cofre externo de onde o Airflow lê conexões e variáveis sensíveis.

**XCom**
Mecanismo do Airflow para passar valores entre tasks, guardado no banco de metadados.
