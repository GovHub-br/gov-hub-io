# Levantamento de Conteúdos — Trilha de Capacitação em Princípios Mínimos de Codificação Segura para DAGs

## Escopo da trilha

Esta trilha foi construída exclusivamente a partir da documentação oficial de segurança do Apache Airflow, versão 3.4.0, e das páginas oficiais diretamente relacionadas a ela. O conteúdo limita-se aos riscos, responsabilidades e mecanismos descritos nessas páginas; não acrescenta padrões externos, ferramentas de análise ou recomendações que não estejam documentados nas fontes listadas ao final.

## Lógica da trilha

A trilha segue a progressão **“por que” → “o quê” → “como revisar”**:

1. **Modelo de segurança do Airflow** — entender por que o código de uma DAG precisa ser tratado como código executável com impacto sobre a instalação.
2. **Entradas e sanitização** — reconhecer valores que podem vir da interface ou da configuração e compreender a responsabilidade de sanitizá-los antes de encaminhá-los a Operators, Hooks ou bibliotecas.
3. **Credenciais e dados sensíveis** — compreender o uso de Connections, Variables e Secrets Backends, além dos limites da ocultação automática de valores sensíveis.
4. **Contexto de execução e isolamento** — distinguir o que acontece durante a análise do arquivo da DAG e durante a execução da tarefa, sem presumir isolamento que a documentação não garante.
5. **Dependências de terceiros** — compreender como avaliar CVEs e atualizações de dependências no contexto do Airflow.
6. **Revisão prática** — aplicar os pontos anteriores a uma DAG e registrar os riscos identificados.

A responsabilidade do autor da DAG é o eixo transversal da trilha: o Airflow não verifica, valida nem coloca em sandbox o código submetido pelo autor. A documentação atribui ao autor a responsabilidade de garantir que esse código seja seguro.

---

## Módulo 1 — Fundamentos do modelo de segurança do Airflow

**Objetivo:** compreender o modelo de confiança adotado pelo Airflow e o impacto potencial do código escrito em uma DAG.

- Quem são os autores de DAGs no modelo de segurança do Airflow.
- Arquivos de DAG como código Python executado em diferentes componentes do Airflow.
- Execução de código de DAG em workers, no Dag File Processor e no Triggerer.
- Ausência de verificação, validação ou sandbox automática do código submetido.
- Responsabilidade do autor por revisar o código e evitar exposição de informações sensíveis ou criação de vulnerabilidades.
- Capacidade de o código acessar informações sensíveis usadas pelo Airflow ou enviá-las para fora da instalação.

## Módulo 2 — Entradas, sanitização e uso de Operators, Hooks e bibliotecas

**Objetivo:** identificar entradas que chegam ao código da DAG e compreender a responsabilidade de tratá-las antes de encaminhá-las a componentes que executam operações.

- Parâmetros de execução da DAG informados por usuários da interface.
- Valores obtidos de Variables e configurações de Connections.
- Encaminhamento de entradas a Operators, Hooks e bibliotecas de terceiros.
- Responsabilidade do autor pela sanitização das entradas antes de passá-las a essas interfaces.
- Riscos documentados de Remote Code Execution (RCE), Denial of Service (DoS), SQL injection e command injection quando valores não sanitizados são utilizados de forma insegura.
- Distinção documentada entre uma falha explorável por um usuário sem permissão para alterar DAGs e um caso que exige que o próprio autor altere o código da DAG.

## Módulo 3 — Connections, Variables, Secrets Backends e dados sensíveis

**Objetivo:** reconhecer como o Airflow disponibiliza credenciais e configurações e quais são os limites da proteção automática de informações sensíveis.

### 3.1 Connections e Hooks

- Connections como mecanismo do Airflow para armazenar parâmetros e credenciais de sistemas externos.
- Uso de Connections diretamente no código ou por meio de Hooks.
- Relação entre Hooks, Connections e Operators.
- Uso de Secrets Backends para recuperar Connections e Variables.

### 3.2 Variables e dados entre tarefas

- Variables como armazenamento de configuração de execução em formato chave/valor.
- Uso de Variables para valores dependentes do ambiente de execução.
- Uso de XComs para transmitir dados de uma tarefa para outra, em vez de usar Variables para essa finalidade.

### 3.3 Ocultação de valores sensíveis

- Valores de Connections e Variables que o Airflow tenta ocultar automaticamente em logs e em determinadas telas da interface.
- Dependência entre a ocultação automática e os nomes de variáveis ou campos que contenham palavras-chave sensíveis.
- Limite da ocultação automática: valores transmitidos por XCom ou outros canais não são automaticamente ocultados quando impressos pela tarefa seguinte.
- Uso de `mask_secret` para registrar valores sensíveis adicionais que precisem ser ocultados, antes de qualquer saída ou registro que os exponha.
- Limitação documentada para segredos transmitidos por variáveis de ambiente: eles não são ocultados automaticamente pelo Airflow.
- No caso do `KubernetesPodOperator`, uso de Secrets nativos do Kubernetes ou recuperação dinâmica por Connections/Variables em vez de passar segredos por variáveis de ambiente.

## Módulo 4 — Código da DAG, contexto de execução e limites de isolamento

**Objetivo:** evitar conclusões incorretas sobre o isolamento do código com base apenas na configuração de execução de uma tarefa.

- Diferença entre a análise do arquivo da DAG (*parsing*) e a execução da tarefa.
- Execução do código no nível do módulo durante a análise do arquivo da DAG.
- Limite de `run_as_user` e `default_impersonation`: essas configurações se aplicam à execução da tarefa, mas não isolam o código executado durante o *parsing*.
- Diferenças documentadas entre Local Executor, Celery Executor, Kubernetes Executor e Triggerer quanto ao contexto em que o código pode ser executado.
- No Airflow 3, comunicação dos workers com a API de execução sem acesso direto dos workers às credenciais do banco de metadados.
- Limitações documentadas: o Dag File Processor e o Triggerer podem manter acesso direto ao banco de metadados, dependendo da configuração e do contexto de execução.
- Ausência de isolamento completo entre tarefas ou autores de DAGs em determinados contextos, conforme as limitações descritas na documentação.

Este módulo apresenta limites do modelo de execução do Airflow para orientar a revisão do código. Não substitui as medidas de configuração e isolamento que a documentação atribui aos responsáveis pela implantação.

## Módulo 5 — Dependências e bibliotecas de terceiros

**Objetivo:** compreender o tratamento de vulnerabilidades conhecidas em dependências utilizadas pelo Airflow e por seus providers.

- Relação entre Airflow, providers e dependências de terceiros.
- Arquivos de constraints como registro das versões de dependências testadas para uma versão do Airflow.
- Diferença entre a presença de um CVE em uma dependência e a demonstração de que a vulnerabilidade é explorável no Airflow ou na implantação.
- Verificação da possibilidade de atualizar uma dependência e teste de compatibilidade com Airflow e providers.
- Consideração de versões atualizadas do Airflow e dos providers quando isso for necessário para permitir a atualização de dependências.

A documentação não estabelece, nessa seção, uma ferramenta específica de análise de dependências como requisito da trilha.

## Módulo 6 — Prática guiada: revisão de segurança de uma DAG

**Objetivo:** revisar uma DAG utilizando exclusivamente os riscos e limites descritos nos módulos anteriores.

### Etapas da revisão

1. Identificar parâmetros de execução, Variables e valores de Connections utilizados pela DAG.
2. Localizar os pontos em que esses valores são encaminhados a Operators, Hooks ou bibliotecas de terceiros e verificar se são sanitizados antes do uso.
3. Identificar acessos a credenciais e outros valores sensíveis, bem como os locais para os quais esses valores podem ser enviados ou impressos.
4. Verificar se a revisão considera os limites da ocultação automática, inclusive o uso de XCom, outros canais e variáveis de ambiente.
5. Identificar código executado durante o *parsing* e não presumir que `run_as_user` ou `default_impersonation` o isolem.
6. Identificar dependências e providers relevantes e avaliar CVEs à luz da orientação da documentação oficial.
7. Registrar os riscos encontrados e as correções necessárias, limitando-as aos pontos sustentados pela documentação consultada.

### Checklist mínimo de revisão

- [ ] As entradas provenientes de parâmetros, Variables ou configurações de Connections são identificadas antes de serem encaminhadas a Operators, Hooks ou bibliotecas?
- [ ] As entradas são sanitizadas antes de serem passadas a essas interfaces?
- [ ] O código pode acessar informações sensíveis ou enviá-las para fora da instalação?
- [ ] A revisão considera que a ocultação automática de valores sensíveis possui limites e não cobre automaticamente todos os canais de saída?
- [ ] Os segredos são tratados considerando as orientações e limitações documentadas para Connections, Variables, Secrets Backends e variáveis de ambiente?
- [ ] A revisão distingue código executado durante o *parsing* daquele executado durante a tarefa?
- [ ] A análise não presume que `run_as_user` ou `default_impersonation` isolem o código executado durante o *parsing*?
- [ ] As dependências e os providers foram considerados conforme a orientação oficial sobre CVEs, atualizações e compatibilidade?

---

## Formatos sugeridos por tipo de conteúdo

| Tipo de conteúdo | Formato recomendado |
| --- | --- |
| Modelo de segurança e responsabilidades do autor | Explicação conceitual baseada na documentação oficial |
| Entradas, sanitização, credenciais e ocultação | Referência organizada por risco e mecanismo do Airflow |
| Contexto de execução e limites de isolamento | Explicação com consulta aos limites documentados por componente e executor |
| Revisão de uma DAG | Tutorial guiado com o checklist deste documento |

## Priorização para uma primeira versão

Para uma primeira versão da trilha, priorizar os módulos **1 → 2 → 3 → 6**. Os módulos 4 e 5 complementam a revisão com os limites do contexto de execução e o tratamento de dependências descritos na documentação oficial.

---

## Fontes oficiais utilizadas

A documentação-base é a seção [Security do Apache Airflow](https://airflow.apache.org/docs/apache-airflow/stable/security/index.html), consultada na versão 3.4.0. Para detalhar os tópicos específicos da trilha, foram utilizadas as páginas oficiais relacionadas:

- [Airflow Security Model](https://airflow.apache.org/docs/apache-airflow/stable/security/security_model.html)
- [SQL Injection](https://airflow.apache.org/docs/apache-airflow/stable/security/sql.html)
- [Workload](https://airflow.apache.org/docs/apache-airflow/stable/security/workload.html)
- [Secrets](https://airflow.apache.org/docs/apache-airflow/stable/security/secrets/index.html)
- [Masking sensitive data](https://airflow.apache.org/docs/apache-airflow/stable/security/secrets/mask-sensitive-values.html)
- [Secrets Backend](https://airflow.apache.org/docs/apache-airflow/stable/security/secrets/secrets-backend/index.html)
- [Vulnerabilities in 3rd party dependencies](https://airflow.apache.org/docs/apache-airflow/stable/security/vulnerabilities-in-3rd-party-dependencies.html)
- [Variables](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/variables.html)
- [Connections & Hooks](https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/connections.html)
