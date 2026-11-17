# Como decidir o que fazer com um achado

> Tipo: **Guia (how-to)**

## Objetivo

Dar um destino a cada achado, sem fingir que não existe e sem entrar em pânico.

## Antes de começar

- Um relatório do Bandit ou do Trivy (veja [Rodar Bandit e Trivy e ler o relatório](rodar-bandit-e-trivy-e-ler-o-relatorio.md)).

## Passos

1. **Confirme se é real.** Leia o trecho de código e verifique se ele está no caminho que roda em produção. Código de teste ou exemplo muda a conclusão.
2. **Avalie o impacto aqui.** Que dados a DAG toca, quem a executa e com que permissão, e se algo externo controla a entrada.
3. **Escolha uma saída e registre.**

   | Decisão | Quando | O que registrar |
   | --- | --- | --- |
   | Corrigir | Padrão. Sempre que a correção for simples ou o achado for alto ou crítico | o PR com a correção |
   | Mitigar | Não dá para corrigir agora (por exemplo, CVE sem versão corrigida) | controle compensatório, responsável e prazo |
   | Aceitar ou suprimir | Falso positivo, ou risco assumido conscientemente | justificativa escrita, responsável e data de revisão |

4. **Suprima sem esconder.**
   - No **Bandit**, use sempre o identificador do teste e um motivo: `# nosec B301 - artefato interno, hash verificado`. Um `# nosec` sem identificador silencia **todos** os testes daquela linha, inclusive os que você ainda não viu.
   - No **Trivy**, use o arquivo `.trivyignore`, com o motivo num comentário acima do CVE e, se a sua versão suportar, uma data de expiração:

     ```text
     # CVE-AAAA-NNNN: função vulnerável não é chamada por esta DAG. Responsável: <nome>. Revisar até 2027-01-15.
     CVE-AAAA-NNNN exp:2027-01-15
     ```

5. **Leve toda supressão para revisão no PR.**

## Pronto

Cada achado tem uma decisão registrada, e toda supressão tem identificador, motivo, responsável e data de revisão. Os prazos de correção por severidade seguem o processo de gestão de vulnerabilidades do GovHub e não são repetidos aqui.

## Veja também

- [Regras do Bandit mais comuns em DAGs](../referencia/regras-do-bandit-mais-comuns-em-dags.md)
- [Corrigir uma dependência vulnerável](corrigir-uma-dependencia-vulneravel.md)
