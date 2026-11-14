# Paginação, tempo limite e falha visível

> Tipo: **Guia**

## Entendendo uma falha de comunicação

Uma falha temporária da fonte não deve produzir uma carga parcial reportada como completa. Defina como detectar a interrupção, preservar o estado da carga e retomar sem duplicações.

Uma API pode dividir 250 registros em páginas de 100: duas páginas completas e uma com 50. Buscar apenas a primeira deixa 150 registros de fora. **Paginação** é percorrer essas partes até o critério de término definido pela fonte.

## Objetivo

Evitar que uma coleta aparentemente bem-sucedida grave apenas parte dos registros.

## Passos

1. **Defina um tempo limite.** Uma requisição não deve bloquear a tarefa indefinidamente.
2. **Percorra todas as páginas.** Confira o critério de fim da API e registre quantas páginas e linhas chegaram.
3. **Valide a resposta.** Diferencie erro HTTP, conteúdo inválido e lista vazia legítima.
4. **Tente novamente apenas quando fizer sentido.** Limites temporários e indisponibilidade podem admitir nova tentativa com espera; credencial inválida exige correção.
5. **Não confirme uma carga parcial como completa.** Defina como uma execução interrompida será retomada ou refeita sem duplicações.
6. **Registre contexto suficiente.** Fonte, período e etapa que falhou ajudam na investigação. Não registre senhas nem conteúdo pessoal.

## Exemplo: acompanhar três páginas sem esconder uma falha

| Pedido | Resposta observada | Ação |
|---|---|---|
| Página 1 | 100 registros válidos | Guardar a parte recebida conforme a estratégia da carga |
| Página 2 | Tempo limite excedido | Repetir com espera, dentro do limite definido |
| Página 2, nova tentativa | 100 registros válidos | Continuar |
| Página 3 | 50 registros e indicação de término | Concluir a conferência de 250 registros |

Se a página 2 continuar falhando, a execução precisa indicar que o conjunto ficou incompleto. Ela não deve apresentar os primeiros 100 como se fossem o total da fonte.

O término deve seguir o contrato da API: uma página curta não é um critério universal. E uma resposta de “acesso negado” pede correção da credencial; esperar e repetir a mesma credencial indefinidamente não resolve a causa.

## Onde procurar

Leia `retry_helpers.py` e `safe_request.py` em `airflow_lappis/helpers/`, conforme a versão da aplicação. Compare o tratamento de erro dos clientes IBGE e SIAFI.

## Como verificar

Simule três situações em dados de teste: uma resposta com duas páginas, uma falha temporária e um conteúdo inválido. A primeira deve trazer todas as linhas; a segunda deve respeitar o limite de tentativas; a terceira deve falhar de forma identificável.

Retentativa no cliente e retentativa na tarefa se combinam. Confira o total de chamadas possível para não sobrecarregar a fonte.

## Como interpretar o teste proposto

Simular uma resposta significa entregar ao cliente um conteúdo controlado, sem chamar o sistema real. Assim você sabe de antemão quantas linhas deveriam chegar e pode provocar um erro sem depender de uma queda de internet.

Considere duas páginas de teste, com uma linha cada. Se a segunda falhar, o resultado não deve ser tratado como duas páginas concluídas. Um erro com a mensagem “falha ao obter página 2 do período de estudo” dá mais contexto que apenas “erro”.

Valide o estado da requisição e a estrutura do conteúdo recebido. Uma resposta bem-sucedida no transporte ainda pode conter erro da aplicação, dados incompletos ou um período incompatível com o solicitado.

## Veja também

- [REST, SOAP, e-mail, bancos e arquivos](../referencia/engenharia-fontes.md)
- [Prática: do cliente mínimo à camada raw](../tutoriais/engenharia-cliente-pratica.md)
