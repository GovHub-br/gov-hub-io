# Git Workflow

Padrões de versionamento e colaboração do GovHub BR.

## Assinatura de commits (GPG)

A assinatura GPG aumenta a rastreabilidade da autoria e é recomendada. Ela só
é obrigatória quando a ruleset do repositório exigir commits assinados.

### 1. Gerar chave GPG

```bash
gpg --full-generate-key
```

### 2. Configurar Git

```bash
# Listar chaves
gpg --list-secret-keys --keyid-format=long

# Configurar (substitua SUA_KEY_ID)
git config --global user.signingkey SUA_KEY_ID
git config --global commit.gpgsign true
```

### 3. Adicionar chave ao GitHub

```bash
gpg --armor --export SUA_KEY_ID
```

Cole a saída em GitHub → Settings → SSH and GPG keys → New GPG key.

## Branches

Prefixos obrigatórios:

| Prefixo | Uso |
|---------|-----|
| `feat/` | Nova funcionalidade |
| `fix/` | Correção de bug |
| `refactor/` | Refatoração sem mudança de comportamento |
| `docs/` | Apenas documentação |

Exemplo: `feat/dag-ingestao-siorg`

## Commits

Padrão: [Conventional Commits](https://www.conventionalcommits.org/)

```
<tipo>(<escopo>): <descrição>

feat(airflow): adiciona DAG de ingestão do Siorg
fix(dbt): corrige dedup em silver.transferencias
docs(onboarding): atualiza setup local
refactor(minio): simplifica upload operator
```

## Pull Requests

1. Criar branch a partir de `main`
2. Fazer alterações e garantir que testes passam (`make lint && make test`)
3. Rebase com main antes de abrir PR:

```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
```

4. Abrir PR com descrição do "porquê" e lista de mudanças
5. Aguardar review dos Code Owners aplicáveis

As exigências de aprovação e merge são definidas pela ruleset de cada
repositório. Consulte também o [Protocolo de Revisão de PRs](../pipeline/protocolo-mr.md).

## Pre-commit Hooks

Configurados automaticamente via `make setup`:

- Linting (ruff/black)
- Formatação
- Verificação de secrets acidentais
- Trailing whitespace
