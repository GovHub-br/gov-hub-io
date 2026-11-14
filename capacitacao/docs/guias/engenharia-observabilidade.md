# Logs, reconciliação e atualização

> Tipo: **Guia**

## Sinais de execução e de qualidade

Correlacione os logs e estados das tarefas com volume recebido, período de referência, chaves distintas e totais de controle. Uma tarefa sem exceções pode ter carregado o período errado ou um conjunto incompleto.

Os sinais técnicos e os controles sobre o conteúdo precisam permitir decidir se o dado está pronto para consumo ou exige correção e reprocessamento.

## Objetivo

Decidir se o dado pode ser usado depois de uma execução e registrar o que fazer quando não puder.

## Roteiro de investigação

1. **Localize a execução.** Anote DAG, tarefa, intervalo processado e tentativa.
2. **Leia o primeiro erro relevante.** Falha de autenticação, formato inválido e teste reprovado pedem correções diferentes.
3. **Confira o destino.** Verifique quantidade de registros, chaves distintas, data de referência e totais de controle.
4. **Reconcilie com a fonte.** Compare o mesmo período, unidade, filtros e situação dos registros. Totais de universos diferentes não são comparáveis.
5. **Corrija e reexecute com escopo conhecido.** Inclua os modelos dependentes que ficaram desatualizados.
6. **Registre a conclusão.** Diferencie “tarefa executou” de “dado conferido e pronto para consumo”.

## Exemplo: ligar os sinais à decisão de uso

| Sinal observado | O que permite concluir | Próxima conferência |
|---|---|---|
| Tarefa terminou sem exceção | O programa concluiu a execução | Quantidade, período e valores |
| Duas linhas chegaram, mas eram esperadas três | O conjunto não corresponde ao controle | Paginação, filtros e origem |
| Contagem correta, total 350 em vez de 300 | Há diferença de conteúdo ou critério | Valores, correções e universo comparado |
| Execução recente, referência antiga | Rodar agora não tornou o conteúdo atual | Data recebida e atualização da fonte |

Um log ilustrativo como “período=janeiro; recebidos=2; esperados=3” dá um ponto de partida. Ele não explica sozinho a causa, mas torna o desvio visível. Depois da investigação, registre também se o indicador está liberado para consumo ou continua aguardando correção.

## O que monitorar

Tempo de execução, falhas, retentativas e atraso do dado ajudam a enxergar o pipeline. A data da última carga não substitui a data de referência da fonte.

No ambiente local, os e-mails de falha e retentativa estão desligados. Confirme com a equipe quais alertas existem em outros ambientes; não presuma que alguém recebeu uma notificação.

## Pronto

Uma pessoa consegue entender o incidente pelo registro, reproduzir a conferência e saber se o indicador precisa de reprocessamento. Logs devem dar contexto sem expor credenciais ou dados pessoais.

## Como fazer uma reconciliação compreensível

**Reconciliar** é comparar a saída com uma referência para explicar se os valores concordam. Anote primeiro o período, a unidade de medida e quais registros entram na conta.

Por exemplo, a fonte mostra 300 reais para dois contratos ativos de janeiro. Se a gold mostra 350, não conclua imediatamente que há erro: verifique se ela também inclui contratos cancelados ou outro período. Depois de igualar os critérios, a diferença restante precisa de explicação.

Um registro de investigação útil pode ter: “Coleta de janeiro; duas linhas esperadas; três encontradas; repetição identificada após a junção; chave da tabela auxiliar corrigida; total final 300”. Essa sequência ajuda outra pessoa a repetir a conferência, sem exigir que ela reconstrua sua investigação pelos logs inteiros.

## Veja também

- [Prática: provocar e diagnosticar uma falha de qualidade](../tutoriais/engenharia-falha-qualidade.md)
- [Dados pessoais, segredos e menor privilégio](../explicacao/engenharia-acesso.md)
