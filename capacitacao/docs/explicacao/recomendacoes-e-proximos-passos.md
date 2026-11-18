# Recomendações e próximos passos

> Tipo: **Explicação**

## Contexto

Uma trilha honesta diz o que ainda não está coberto e como medir se ela está funcionando. Esta página reúne as lacunas conhecidas, a cultura que sustenta a prática e as fontes do conteúdo.

## A ideia

### Lacunas conhecidas

- **Segredos no histórico do Git.** O scan do Trivy olha o diretório de trabalho. Uma ferramenta de varredura de histórico, como o Gitleaks, está recomendada e ainda não foi implementada.
- **DAST.** O OWASP ZAP está recomendado para as interfaces web da plataforma e ainda não foi implementado.
- **Dado pessoal nos valores.** Nem o Bandit nem o Trivy cobrem isso. A cobertura vem do mapeamento de dados sensíveis (detecção sobre os valores) e dos guias de governança.
- **Revisão humana.** Padrões de lógica, como uma DAG que expõe dado demais por desenho, só aparecem na revisão de PR e na modelagem de ameaças.

### Cultura e métricas

O OWASP aponta que um programa de *security champions* é base de uma boa postura de segurança: um integrante interessado de cada equipe recebe treinamento adicional e ajuda o time a incorporar segurança. Para medir o avanço, acompanhe:

- tempo médio para corrigir achados altos e críticos;
- porcentagem de PRs reprovados no gate na primeira tentativa (deve cair com o tempo);
- supressões (`nosec`, `.trivyignore`) com revisão vencida;
- porcentagem de repositórios e DAGs com os scans ativos.

Para medir a maturidade da prática como um todo, o OWASP SAMM é o modelo de referência.

### Para se aprofundar

O OWASP Developer Guide lista ambientes de treino. O **PyGoat** (aplicação Python vulnerável de propósito) e o **WrongSecrets** (erros de gestão de segredos) combinam com esta trilha.

## Trade-offs e alternativas

Medir mais coisas dá mais visibilidade e mais burocracia. Comece por duas métricas (tempo de correção e cobertura dos scans) e acrescente as outras quando o processo estiver estável.

## Conexões

- A lacuna do histórico do Git conecta com [Responder a um segredo ou dado pessoal commitado](../guias/responder-a-um-segredo-ou-dado-pessoal-commitado.md).
- Para aplicar tudo de uma vez: [Exercício final: triagem de uma DAG real](../desafios/triagem-de-uma-dag-real.md).

## Veja também

**Fontes**

- OWASP Developer Guide, *Secure development and integration* (devguide.owasp.org), licença CC BY-SA 4.0. O ciclo seguro, as fases e a lógica de SAST, SCA, DAST, cadeia de suprimentos e cultura foram adaptados dessa página.
- OWASP: CI/CD Security Cheat Sheet, Top 10 Proactive Controls, Security Champions Guide, SAMM, CycloneDX, Dependency-Check.
- Diátaxis, framework de documentação (diataxis.fr): tutorial, guia, referência e explicação.
- Documentação do [Trivy](https://aquasecurity.github.io/trivy/) e do [Bandit](https://bandit.readthedocs.io/).
- GovHub: [roadmap de documentação](https://govhub-br.github.io/govhub-roadmap/), [página de capacitação](https://gov-hub.io/capacitacao/), documento interno *Ferramentas de SAST e SCA* e levantamento da trilha de dashboards (estrutura por quê, o quê, como).
- Lei Geral de Proteção de Dados (Lei 13.709/2018).
