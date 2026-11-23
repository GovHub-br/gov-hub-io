# Segurança no ciclo de desenvolvimento da DAG

> Tipo: **Explicação**

## Contexto

Uma DAG é código que roda sozinho, em agenda, com as credenciais do data warehouse, e costuma tocar dado pessoal. O notebook que era exploração vira rotina automática com permissões amplas. Por isso a segurança precisa estar no caminho do código, e não numa revisão no fim.

Esta trilha é para cientistas de dados e analistas que escrevem DAGs do Airflow em Python e não têm formação em segurança. Ao final, você será capaz de:

- explicar por que segurança faz parte do ciclo de desenvolvimento da DAG;
- rodar o Bandit e o Trivy e ler os relatórios;
- reconhecer e corrigir os padrões inseguros mais comuns em DAGs;
- decidir o que fazer com cada achado: corrigir, mitigar ou aceitar com justificativa;
- saber o que essas ferramentas não enxergam, em especial dado pessoal nos valores das tabelas.

## A ideia

O OWASP Developer Guide descreve o ciclo seguro de desenvolvimento (SDLC seguro) com uma regra central: ele nunca é um ciclo separado. É o mesmo ciclo de sempre, com ações de segurança dentro de cada fase. Quando a segurança vira uma etapa à parte, equipes ocupadas a empurram para depois. A meta é que o próprio time de desenvolvimento assuma as ações de segurança de cada fase.

O OWASP organiza o ciclo em quatro fases iterativas (requisitos, projeto, implementação e verificação) e quatro menos iterativas, mas igualmente importantes (análise de lacunas, métricas, operação, treinamento e cultura). Aplicado a uma DAG:

| Fase | Pergunta de segurança | Exemplo numa DAG | Ferramenta ou artefato |
| --- | --- | --- | --- |
| Requisitos | Que dados esta DAG toca? Há dado pessoal? Para que finalidade? | A DAG lê uma tabela de agentes com CPF | classificação do dado; documentos de governança |
| Projeto | Onde cada segredo vive? Que dado trafega entre tasks? Qual o menor privilégio possível? | Usuário de banco somente leitura, dedicado à DAG | modelagem de ameaças simples (abaixo) |
| Implementação | Estou usando o padrão seguro? | Query parametrizada em vez de f-string | Bandit no editor e no pre-commit |
| Verificação | Um scan automático e uma revisão aprovam? | Bandit e Trivy no PR | pipeline de segurança no CI |
| Operação | O que muda depois do deploy? | Credencial que vence; biblioteca com CVE novo | Trivy periódico; rotação de segredos |
| Treinamento e cultura | Quem no time domina isso? | Um security champion por equipe | esta trilha |

### Modelagem de ameaças em quatro perguntas

Você não precisa de ferramenta para começar. Antes de escrever a DAG, responda por escrito:

1. O que estamos construindo?
2. O que pode dar errado?
3. O que vamos fazer a respeito?
4. Fizemos um bom trabalho?

A pergunta 2 costuma render mais com o desenho do fluxo de dados na mão: de onde o dado sai, por onde passa (XCom, arquivo temporário, log) e onde pousa.

### Dois casos reais do GovHub (generalizados)

- **Mascaramento por nome de coluna.** Um script que gerava documentação gravava amostras de linhas reais no repositório. O passo de mascaramento decidia pelo nome da coluna (cpf, email, telefone). Colunas com nomes genéricos passaram direto, e dados reais foram parar no repositório. O incidente foi tratado e o histórico reescrito. Lição: proteção que olha o nome da coluna não protege o dado.
- **Falha replicada por template.** Um módulo cliente compartilhado usava Jinja2 com autoescape desligado e MD5. Por ter sido copiado como template, o mesmo achado apareceu em vários repositórios. Lição: corrija no template, não repositório por repositório.

## Trade-offs e alternativas

Segurança dentro de cada fase custa atenção do time de desenvolvimento desde o começo. A alternativa, uma revisão de segurança no fim feita por outra equipe, parece mais barata, mas descobre os problemas tarde, quando corrigir custa mais, e vira gargalo. O preço de embutir a segurança no ciclo é aprender o básico; é por isso que existe esta trilha e a figura do *security champion*.

## Conexões

- As ferramentas que automatizam as fases de implementação e verificação estão em [O que cada ferramenta enxerga](o-que-cada-ferramenta-enxerga.md).
- O que muda numa DAG, em concreto, está em [Superfície de ataque de uma DAG](superficie-de-ataque-de-uma-dag.md).

## Veja também

- [Segurança (plataforma)](../plataforma/governanca/seguranca.md)
- [Recomendações e próximos passos](recomendacoes-e-proximos-passos.md)
