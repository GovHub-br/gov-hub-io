# Superfície de ataque de uma DAG

> Tipo: **Explicação**

## Contexto

Uma DAG junta credenciais, entrada externa, dependências, contêiner e dado pessoal num só lugar. Cada um desses pontos é uma porta. Esta página mapeia as onze mais comuns e diz quem, se alguém, detecta cada uma.

## A ideia

| # | Risco | Como aparece numa DAG | Quem detecta |
| --- | --- | --- | --- |
| 1 | Credencial no código | Senha ou token em variável no arquivo da DAG | Bandit (B105, B106); Trivy (secret) |
| 2 | SQL montado por concatenação | f-string dentro de `get_records` ou `run` | Bandit (B608), de forma parcial |
| 3 | Desserialização insegura | `pickle.load` de modelo; `yaml.load` sem SafeLoader | Bandit (B301, B506) |
| 4 | Criptografia fraca | MD5 para pseudonimizar CPF | Bandit (B324) |
| 5 | Requisição insegura | `verify=False`; `requests` sem timeout | Bandit (B501, B113) |
| 6 | Template sem escape | Jinja2 com `autoescape=False` em relatório HTML | Bandit (B701) |
| 7 | Injeção de comando | `BashOperator` ou `subprocess` com `shell=True` e entrada externa | Bandit (B602, B605) |
| 8 | Dependência vulnerável | `requirements.txt` com versões antigas fixadas | Trivy (vuln) |
| 9 | Contêiner como root | Dockerfile sem `USER` | Trivy (misconfig) |
| 10 | Dado pessoal em log, XCom ou arquivo | `print(df.head())`; task que devolve linhas com CPF | nenhuma ferramenta: revisão humana |
| 11 | Segredo no histórico do Git | credencial commitada e depois apagada | nenhuma no scan do diretório atual |

Note as duas últimas linhas: são justamente as que mais doem e as que nenhuma das duas ferramentas pega.

## Trade-offs e alternativas

Os riscos 1 a 9 têm detecção automática, mas parcial: o B608, por exemplo, não pega todo SQL montado por string. Os riscos 10 e 11 dependem de processo (revisão de PR, mapeamento de dados sensíveis, varredura de histórico com Gitleaks, recomendada e ainda não implementada).

## Conexões

- As regras do Bandit citadas estão detalhadas em [Regras do Bandit mais comuns em DAGs](../referencia/regras-do-bandit-mais-comuns-em-dags.md).
- Cada risco aparece, em código, no [Laboratório](../tutoriais/laboratorio-do-scan-a-correcao.md).

## Veja também

- [O que cada ferramenta enxerga](o-que-cada-ferramenta-enxerga.md)
- [Apache Airflow (plataforma)](../plataforma/pipeline/airflow.md)
