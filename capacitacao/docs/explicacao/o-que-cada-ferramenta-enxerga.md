# O que SAST, SCA, segredos e misconfig enxergam (e o que não enxergam)

> Tipo: **Explicação**

## Contexto

Segurança automatizada não é uma ferramenta: são perguntas diferentes feitas por ferramentas diferentes. Saber qual pergunta cada uma responde evita dois erros comuns: esperar que o Bandit encontre uma dependência vulnerável e concluir que o código é seguro porque o relatório veio vazio.

## A ideia

| Técnica | O que analisa | Pergunta que responde | Ferramenta | Não enxerga |
| --- | --- | --- | --- | --- |
| SAST (teste estático) | O código-fonte que você escreveu, sem executá-lo | O meu código tem um padrão inseguro? | Bandit | O dado em tempo de execução; lógica de negócio; dado pessoal nos valores |
| SCA (análise de composição) | As bibliotecas que você importa | Alguma dependência tem vulnerabilidade conhecida (CVE)? | Trivy (vuln) | O seu código; falhas ainda não publicadas |
| Segredos | Arquivos do diretório de trabalho | Há credencial ou token no repositório? | Trivy (secret) | Segredo já apagado mas presente no histórico do Git; segredo sem padrão conhecido |
| Misconfiguration | Dockerfile, YAML de Kubernetes, compose, Terraform | A configuração é insegura? | Trivy (misconfig) | Configuração que só existe em tempo de execução |
| DAST (teste dinâmico) | A aplicação rodando | Dá para explorar de fora? | OWASP ZAP (recomendado, ainda não implementado) | Falhas que a entrada de teste não alcança |

**SAST cobre o código que você escreveu; SCA cobre o código que você importou.** Em projetos de dados, a maior parte do código que executa é importada (Airflow, providers, pandas, drivers). Por isso o SCA pesa tanto quanto o SAST.

### Como ler a gravidade

O Bandit classifica cada achado por **severidade** (impacto se for real) e **confiança** (chance de ser real). Um achado de severidade alta e confiança baixa merece olhar humano antes de virar pânico.

O Trivy usa LOW, MEDIUM, HIGH e CRITICAL. Uma vulnerabilidade em biblioteca não significa que o seu uso é explorável: o Trivy sabe que a versão é afetada, não se o seu código chama o trecho vulnerável.

O pipeline do GovHub barra PR com achados HIGH ou CRITICAL; abaixo disso, a decisão é sua (veja [Decidir o que fazer com um achado](../guias/decidir-o-que-fazer-com-um-achado.md)).

### Ferramenta é detector, não juiz

Há falsos positivos (achado que não é problema real) e falsos negativos (problema real que passa). Zero achados significa que as regras conhecidas não dispararam, não que o código é seguro.

## Trade-offs e alternativas

- Rodar mais escopos do Trivy (`vuln`, `secret`, `misconfig`) dá mais cobertura e mais ruído; filtrar por severidade reduz o ruído e esconde o que está abaixo do corte.
- O Bandit é rápido e roda no editor e no pre-commit, mas só enxerga padrões. Revisão humana e modelagem de ameaças cobrem a lógica.
- O DAST complementa o SAST para interfaces web, mas ainda não está implementado no GovHub.

## Conexões

- O maior ponto cego das duas ferramentas está em [Dado pessoal nos valores](dado-pessoal-nos-valores.md).
- Para ver cada técnica em ação: [Laboratório: do scan à correção](../tutoriais/laboratorio-do-scan-a-correcao.md).

## Veja também

- [Comandos do Bandit e do Trivy](../referencia/comandos-do-bandit-e-do-trivy.md)
- [Glossário de segurança de DAGs](../referencia/glossario-de-seguranca-de-dags.md)
