# Requisitos para Adoção

Pré-requisitos de infraestrutura e equipe para implantar o GovHub BR no seu órgão.

## Público

Esta seção é voltada para **equipes de TI do governo** que desejam implantar o GovHub para integrar dados do seu órgão ou contexto.

## Avaliação Inicial

Antes de iniciar o deploy, faça um diagnóstico simples da maturidade de dados do órgão. Essa etapa evita começar pela infraestrutura sem clareza sobre fontes, donos, restrições e casos de uso.

| Frente | Perguntas orientadoras |
| --- | --- |
| Inventário de sistemas | Quais sistemas serão integrados? Há API, banco, arquivo ou extração manual? |
| Qualidade dos dados | Existem duplicidades, campos obrigatórios ausentes, códigos divergentes ou bases desatualizadas? |
| Acesso e segurança | A fonte exige token, certificado digital, VPN, liberação formal ou tratamento LGPD? |
| Casos de uso | Quais decisões ou painéis justificam a integração inicial? |
| Responsáveis | Quem conhece a regra de negócio, quem opera a fonte e quem aprova acesso? |

Comece por 1 ou 2 fontes públicas ou de menor risco. Fontes com certificado digital, dados pessoais ou dados financeiros detalhados devem entrar depois que o fluxo de segurança e governança estiver acordado.

## Infraestrutura Mínima

### Cluster Kubernetes

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| Nodes | 3 | 5+ |
| CPU total | 16 cores | 32+ cores |
| Memória total | 32 GB | 64+ GB |
| Storage (SSD) | 500 GB | 1+ TB |
| Kubernetes versão | 1.26+ | 1.28+ |

### Componentes Obrigatórios

| Componente | Necessário para | Alternativa |
|------------|----------------|-------------|
| Kubernetes | Runtime dos serviços do ambiente adotado | — |
| Helm 3 | Deploy dos charts | — |
| Git | Versionamento e GitOps | — |
| Certificados TLS | HTTPS em produção | Let's Encrypt |
| DNS | Acesso aos serviços | — |

### Conectividade

- Acesso à internet para download de imagens Docker
- Acesso às APIs governamentais (TransfereGov, ComprasGov, Siorg)
- Certificados digitais para Siape/Siafi (se aplicável)
- VPN ou rede interna para acesso ao cluster

## Equipe Mínima

| Perfil | Responsabilidade | Quantidade |
|--------|------------------|------------|
| DevOps/SRE | Cluster K8s, Argo CD, monitoramento | 1-2 |
| Engenheiro de Dados | DAGs Airflow, models dbt | 1-2 |
| Analista de Dados | Dashboards Superset, análises | 1 |

## Conhecimentos Necessários

| Área | Básico | Intermediário |
|------|--------|---------------|
| Kubernetes | `kubectl`, pods, services | Helm, operators, RBAC |
| Docker | Build, run, compose | Multi-stage builds |
| Git | Clone, commit, push | Rebase, GPG, workflows |
| SQL | SELECT, JOIN, GROUP BY | Window functions, CTEs |
| Python | Scripts básicos | Airflow operators |

## Decisões Prévias

Antes de iniciar o deploy, defina:

1. **Quais fontes de dados** integrar (começar com 1-2 públicas é recomendado)
2. **Modelo de deploy**: cluster próprio vs. compartilhado
3. **Modelo de fork**: fork leve (schemas PG) vs. instância separada
4. **Política de acesso**: quem verá quais dados
5. **Ambiente**: preprod + prod ou apenas prod

## Estratégia de Adoção

Para reduzir risco, a adoção deve ser incremental:

| Etapa | Objetivo | Resultado esperado |
| --- | --- | --- |
| Prova de conceito | Validar stack, acesso e fluxo básico | Uma fonte simples ingerida e consultável |
| Piloto | Atender um caso de uso real | DAG, modelos dbt e dashboard revisados por usuários |
| Expansão | Adicionar fontes e domínios relacionados | Padrões reutilizados, governança e observabilidade amadurecidas |
| Operação contínua | Manter execução confiável | Rotina de PRs, monitoramento, backups e gestão de acesso |

## Checklist Pré-Deploy

- [ ] Cluster K8s operacional e acessível
- [ ] `kubectl`, `helm`, `argocd` CLI instalados
- [ ] Repositório Git criado para o fork
- [ ] DNS configurado para os serviços
- [ ] Certificados TLS disponíveis
- [ ] Credenciais de API das fontes escolhidas
- [ ] Equipe com acesso ao cluster

## Próximo Passo

→ [Deploy Inicial](deploy-inicial.md)
