# Como encaixar os scans no fluxo: pre-commit, PR e CI

> Tipo: **Guia (how-to)**

## Objetivo

Pegar o problema o mais cedo possível: no commit, antes do PR e no CI.

## Antes de começar

- Bandit e Trivy funcionando localmente (veja [Rodar Bandit e Trivy e ler o relatório](rodar-bandit-e-trivy-e-ler-o-relatorio.md)).

## Passos

1. **No commit (pre-commit).** Instale com `pip install pre-commit`, crie o `.pre-commit-config.yaml` e ative com `pre-commit install`:

   ```yaml
   repos:
     - repo: https://github.com/PyCQA/bandit
       rev: 1.9.4   # use a mesma versão do pipeline e confirme que a tag existe
       hooks:
         - id: bandit
           args: ['-ll']
           exclude: ^tests/
     - repo: local
       hooks:
         - id: trivy-segredos
           name: trivy (segredos)
           entry: trivy fs --scanners secret --exit-code 1 .
           language: system
           pass_filenames: false
   ```

2. **Antes do PR.** Rode os dois scans completos e passe pelo [Checklist pré-PR](../referencia/checklist-pre-pr.md).
3. **No PR.** O pipeline de segurança do GovHub roda o Bandit e o Trivy num único job e reprova o PR com achados HIGH ou CRITICAL. Os relatórios **não** são publicados como artefatos do GitHub Actions, porque o repositório é público e um relatório de vulnerabilidades público é um mapa para o atacante; o detalhe fica num repositório privado de segurança. Se não conseguir reproduzir o achado localmente, fale com o time de segurança.
4. **Se o gate falhar,** reproduza localmente com os mesmos comandos, corrija ou registre a decisão (veja [Decidir o que fazer com um achado](decidir-o-que-fazer-com-um-achado.md)). **Nunca desative o job** para fazer o PR passar.
5. **Depois do merge.** CVEs novos são publicados todos os dias. Rode o Trivy em agenda (por exemplo, semanalmente) no repositório e na imagem.

## Pronto

O hook roda a cada commit, o PR é barrado por HIGH ou CRITICAL e existe um scan periódico no repositório e na imagem.

## Veja também

- [Comandos do Bandit e do Trivy](../referencia/comandos-do-bandit-e-do-trivy.md)
- [Segurança no ciclo de desenvolvimento da DAG](../explicacao/seguranca-no-ciclo-da-dag.md)
