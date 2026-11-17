# Regras do Bandit mais comuns em DAGs

> Tipo: **Referência**

## Resumo

As regras que mais aparecem em código de DAG, com o que sinalizam e a correção típica. Use o ID para suprimir de forma específica e para procurar a explicação na documentação do Bandit. O relatório também traz o CWE de cada achado.

## Regras

| ID | Nome | O que sinaliza | Correção típica |
| --- | --- | --- | --- |
| B101 | assert_used | `assert` em código de produção (some com otimização) | validar com `if` e levantar exceção |
| B105, B106, B107 | hardcoded_password_* | senha ou token em string, em argumento de função ou em valor padrão | Connection ou secrets backend |
| B113 | request_without_timeout | `requests` sem `timeout` | `timeout=10` e `raise_for_status()` |
| B301 | pickle | `pickle.load` ou `loads` | formato que não executa código; ou origem confiável com hash verificado e `nosec` justificado |
| B307 | eval | uso de `eval()` | `ast.literal_eval` ou lógica explícita |
| B324 | hashlib | MD5 ou SHA-1 | SHA-256; HMAC com chave para pseudonimizar |
| B403 | import_pickle | `import pickle` (baixa severidade) | aceitar com `nosec B403` e motivo, quando o uso do `pickle` está justificado |
| B501 | request_with_no_cert_validation | `verify=False` | remover; configurar o certificado da CA interna |
| B506 | yaml_load | `yaml.load` | `yaml.safe_load` |
| B602, B605 | shell=True, processo via shell | comando montado como texto | lista de argumentos sem shell; nunca entrada externa no comando |
| B608 | hardcoded_sql_expressions | SQL montado com f-string, `format` ou concatenação | parâmetros (`%s`) |
| B701 | jinja2_autoescape_false | template Jinja2 sem escape | `select_autoescape()` |

## Observações

- O conjunto de testes varia entre versões do Bandit; confirme na documentação da versão instalada.
- Um `# nosec` sem ID silencia todos os testes da linha. Use sempre o ID e um motivo.

## Veja também

- [Superfície de ataque de uma DAG](../explicacao/superficie-de-ataque-de-uma-dag.md)
- [Decidir o que fazer com um achado](../guias/decidir-o-que-fazer-com-um-achado.md)
