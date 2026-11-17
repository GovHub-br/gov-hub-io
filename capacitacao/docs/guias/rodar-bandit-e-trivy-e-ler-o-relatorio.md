# Como rodar o Bandit e o Trivy e ler o relatório

> Tipo: **Guia (how-to)**

## Objetivo

Rodar os dois scans no seu projeto e entender o que cada coluna do relatório diz.

## Antes de começar

- Bandit e Trivy instalados (veja o [Laboratório](../tutoriais/laboratorio-do-scan-a-correcao.md)).
- Um projeto com `dags/` e, de preferência, `requirements.txt` com versões fixadas (`==`) ou um arquivo de lock.

## Passos

1. Rode o Bandit nas pastas de código. A opção `-ll` mostra só severidade média ou alta:

   ```bash
   bandit -r dags/ plugins/ -ll -x tests
   ```

2. Rode o Trivy no diretório do projeto, filtrando o que bloqueia PR:

   ```bash
   trivy fs . --scanners vuln,secret,misconfig --severity HIGH,CRITICAL --format table -o reports/trivy.txt
   ```

3. **Leia o Bandit.** Cada achado traz o *Issue* (identificador e descrição), a *Severity*, a *Confidence*, o CWE, o local (arquivo e linha) e o trecho de código. Comece por severidade alta com confiança alta.
4. **Leia o Trivy.** A tabela de vulnerabilidades traz a biblioteca, o CVE, a severidade, a versão instalada e a **Fixed Version**. Fixed Version vazia significa que ainda não há correção publicada (veja [Corrigir uma dependência vulnerável](corrigir-uma-dependencia-vulneravel.md)). Nos segredos, o relatório mostra arquivo, linha e categoria.
5. **Trate o relatório como informação sensível.** Ele pode conter trechos de segredos e é um mapa de fraquezas. Coloque `reports/` no `.gitignore` e nunca o anexe a um artefato público.

> **Atenção.** O Trivy lê as dependências de arquivos como `requirements.txt` com versões fixadas (`==`) ou de arquivos de lock. Um `requirements.txt` sem versões fixas dá pouca informação ao scan e torna a build irreproduzível.

## Pronto

Você tem um relatório do Bandit e um do Trivy, sabe localizar severidade, confiança e Fixed Version, e `reports/` está fora do Git.

## Veja também

- [Decidir o que fazer com um achado](decidir-o-que-fazer-com-um-achado.md)
- [Comandos do Bandit e do Trivy](../referencia/comandos-do-bandit-e-do-trivy.md)
