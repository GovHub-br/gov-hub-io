# Autoavaliação

> Tipo: **Referência**

## Resumo

Cinco perguntas para conferir se você fixou os conceitos da trilha, cada uma com a resposta e a aula para revisar. Tente responder antes de ler. Para um teste interativo, use o quiz de revisão da trilha.

## Perguntas e respostas

**1. Por que o ciclo seguro de desenvolvimento não deve ser um ciclo separado?**
Porque a segurança que vira etapa à parte é adiada por equipes ocupadas; ela precisa estar dentro de cada fase.
*Revise:* [Segurança no ciclo de desenvolvimento da DAG](../explicacao/seguranca-no-ciclo-da-dag.md)

**2. Qual a diferença entre SAST e SCA, e qual ferramenta faz cada um?**
SAST analisa o código que você escreveu (Bandit); SCA analisa o código que você importou (Trivy).
*Revise:* [O que cada ferramenta enxerga](../explicacao/o-que-cada-ferramenta-enxerga.md)

**3. O Trivy não acusou segredos. Isso garante que não há segredo no repositório?**
Não. Ele não olha o histórico do Git e só reconhece padrões conhecidos.
*Revise:* [O que cada ferramenta enxerga](../explicacao/o-que-cada-ferramenta-enxerga.md)

**4. Por que mascarar pelo nome da coluna falha?**
Em bases legadas o nome não diz o conteúdo; uma coluna genérica pode guardar CPF. A decisão precisa vir dos valores.
*Revise:* [Dado pessoal nos valores](../explicacao/dado-pessoal-nos-valores.md)

**5. Quando é aceitável usar `# nosec`?**
Quando o achado é falso positivo ou risco assumido, com o ID do teste, o motivo, um responsável e revisão no PR.
*Revise:* [Decidir o que fazer com um achado](../guias/decidir-o-que-fazer-com-um-achado.md)

## Observações

- A pergunta de verificação do laboratório (HMAC em vez de MD5) está no final do [Laboratório](../tutoriais/laboratorio-do-scan-a-correcao.md).
- Depois da autoavaliação, faça o [Exercício final](../desafios/triagem-de-uma-dag-real.md).

## Veja também

- [Checklist pré-PR](checklist-pre-pr.md)
- [Glossário de segurança de DAGs](glossario-de-seguranca-de-dags.md)
