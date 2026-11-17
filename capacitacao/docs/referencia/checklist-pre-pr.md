# Checklist pré-PR

> Tipo: **Referência**

## Resumo

Lista de verificação para passar antes de abrir o pull request de uma DAG. Leva cerca de 5 minutos.

## Código

- [ ] Nenhuma senha, token ou chave no código, no `.env` versionado ou no notebook
- [ ] Credenciais vêm de Connection ou secrets backend
- [ ] Queries parametrizadas, com só as colunas e linhas necessárias
- [ ] `yaml.safe_load`; sem `pickle` de origem não confiável; sem `eval`
- [ ] `requests` com `timeout` e com validação de certificado
- [ ] Pseudonimização com HMAC e chave fora do código e do banco

## Dados

- [ ] Logs só com contagens e formatos
- [ ] XCom só com referências
- [ ] Notebooks sem saídas salvas; amostras sem dado real
- [ ] Dados de teste sintéticos ou pseudonimizados

## Ferramentas

- [ ] Bandit rodado; achados médios e altos corrigidos ou justificados com `nosec` e ID
- [ ] Trivy rodado (vuln, secret, misconfig); HIGH e CRITICAL corrigidos ou registrados
- [ ] Dependências com versão fixada; Dockerfile com `USER` não root
- [ ] Relatórios fora do commit e fora de artefatos públicos

## Pull request

- [ ] A descrição informa que dados a DAG toca e se há dado pessoal
- [ ] Toda supressão tem motivo, responsável e data de revisão

## Veja também

- [Encaixar os scans no fluxo](../guias/encaixar-os-scans-no-fluxo.md)
- [Manter dado pessoal fora de logs, XCom e repositório](../guias/manter-dado-pessoal-fora-de-logs-xcom-e-repositorio.md)
