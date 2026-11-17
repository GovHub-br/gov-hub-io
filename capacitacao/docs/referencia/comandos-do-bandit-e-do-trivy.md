# Comandos do Bandit e do Trivy

> Tipo: **Referência**

## Resumo

Os comandos e opções mais usados nesta trilha. Confirme as opções na documentação da versão instalada.

## Bandit

| Objetivo | Comando |
| --- | --- |
| Escanear um diretório | `bandit -r dags/` |
| Só severidade média ou alta | `bandit -r dags/ -ll` |
| Só severidade alta | `bandit -r dags/ -lll` |
| Relatório em arquivo (txt, json, html, csv, xml, yaml) | `bandit -r dags/ -f json -o reports/bandit.json` |
| Excluir pastas | `bandit -r . -x .venv,tests,build` |
| Um arquivo | `bandit arquivo.py` |
| Suprimir uma linha, com motivo | `# nosec B301 - motivo` |

## Trivy

| Objetivo | Comando ou opção |
| --- | --- |
| Escanear o diretório (vulnerabilidades, segredos, misconfig) | `trivy fs . --scanners vuln,secret,misconfig` |
| Só HIGH e CRITICAL | `--severity HIGH,CRITICAL` |
| Falhar o job quando houver achado | `--exit-code 1` (sem isso, o código de saída é 0) |
| Ignorar o que não tem correção publicada | `--ignore-unfixed` |
| Saída em arquivo | `--format table -o reports/trivy.txt` (ou `--format json`) |
| Analisar uma imagem de contêiner | `trivy image nome:tag` |
| Ignorar um CVE com justificativa | arquivo `.trivyignore` |

## Observações

- O escopo `config` está depreciado em favor de `misconfig`.
- O Bandit sai com código diferente de zero quando encontra problemas; o Trivy só o faz com `--exit-code 1`.

## Veja também

- [Rodar Bandit e Trivy e ler o relatório](../guias/rodar-bandit-e-trivy-e-ler-o-relatorio.md)
- [Regras do Bandit mais comuns em DAGs](regras-do-bandit-mais-comuns-em-dags.md)
