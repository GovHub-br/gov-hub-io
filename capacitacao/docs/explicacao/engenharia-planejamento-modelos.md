# Planejar a entrega antes dos modelos

> Tipo: **Explicação**

## Três respostas certas para a mesma pergunta

Nas duas partes da prática de SQL, você criou a base de estudo e viu as armadilhas de juntar, contar e somar. Agora volte à pergunta da gestão: **quanto já foi pago?** Com os mesmos cinco empenhos, três consultas corretas devolvem três totais diferentes:

| Se o total considerar… | Total pago |
|---|---|
| Só os contratos ativos | 95.500,50 |
| Todos os contratos, ativos e inativos | 110.500,50 |
| Todos os empenhos, inclusive o que não tem contrato | 117.750,50 |

Nenhuma das três consultas tem erro de SQL. Elas respondem a perguntas diferentes, e só quem usa o indicador pode dizer qual é a pergunta certa. Se essa decisão não for tomada antes, ela será tomada sem querer, por quem escrever o primeiro `where`.

Esta aula mostra como transformar a pergunta da gestão numa **especificação da entrega**: um texto curto, revisável, que vem antes do SQL e diz o que cada linha significa, o que entra, o que fica de fora e como conferir o resultado.

![O planejamento em duas raias. A área responsável pelo indicador faz a pergunta, decide os casos de dúvida e informa um número de referência. A engenharia de dados escreve a especificação, lista exemplos de inclusão e exclusão, constrói os modelos e transforma os exemplos em testes. Os casos de dúvida voltam para a área antes de virar código.](../../assets/diagramas/engenharia-planejar-entrega.png)

## O que você vai aprender

- Escrever a especificação de uma tabela antes do primeiro modelo.
- Usar exemplos concretos de inclusão e exclusão para tirar as dúvidas da regra.
- Separar regra de negócio de conveniência técnica.
- Reconhecer que associar registros de fontes diferentes também é uma decisão de negócio.

## A especificação: uma página antes do SQL

A especificação responde às perguntas que, sem ela, cada pessoa responderia de um jeito. Para a base de estudo, ela fica assim:

| Decisão | Definição para a entrega de estudo |
|---|---|
| Pergunta | Quanto foi contratado e quanto já foi pago em cada contrato? |
| Quem usa e onde | Equipe que acompanha a execução contratual, num painel do Superset |
| Cada linha representa | Um contrato da fonte ComprasGov, ativo ou inativo |
| Identificador | `contrato_id`, o `id` do contrato na fonte |
| Medidas | `valor_global` (do contrato) e `despesas_pagas` (soma dos pagamentos dos empenhos associados ao contrato) |
| Contrato sem empenho associado | Continua na tabela, com `despesas_pagas` nulo. Nulo quer dizer "nenhum empenho associado", e não "nada foi pago" |
| Empenho sem contrato | Fica fora da tabela, mas entra na conferência dos totais |
| Unidade não cadastrada | O contrato continua; a unidade aparece como "unidade não cadastrada" |
| Pendente de baixa | `'Sim'` quando o contrato está ativo e o valor pago é igual ao valor global |
| Atualização | `dt_ingest` informa a carga mais recente usada na linha |
| Conferência | Total pago na tabela + pagamentos sem contrato = total pago na entrada |

Cada linha dessa tabela fecha uma porta para a ambiguidade. "Cada linha representa um contrato" impede que alguém entregue uma linha por empenho. "Nulo quer dizer nenhum empenho associado" impede que um `coalesce` transforme falta de informação em zero. A linha de conferência já diz como alguém, depois, vai provar que a tabela está certa.

Escreva a especificação junto com quem responde pelo indicador. Ela não precisa de formato especial: pode ser a descrição do modelo no `schema.yml`, uma issue ou um documento curto. Precisa existir **antes** do modelo e ser atualizada junto com ele.

## Exemplos tiram as dúvidas que o texto deixa

"Um contrato ativo ou inativo" parece claro até alguém perguntar: um contrato inativo, totalmente pago, está pendente de baixa? O jeito mais eficaz de achar essas dúvidas é escrever **exemplos concretos com o resultado esperado**:

| Caso | Exemplo na base | Resultado esperado |
|---|---|---|
| Ativo, parcialmente pago | Contrato 101 | Aparece; pago 50.000,00; pendente de baixa: Não |
| Ativo, pago por inteiro | Contrato 102 | Aparece; pago 45.500,50; pendente de baixa: Sim |
| Ativo, sem empenho e com unidade não cadastrada | Contrato 103 | Aparece; pago nulo; unidade "990009 - unidade não cadastrada"; pendente de baixa: Não |
| Inativo, pago por inteiro | Contrato 104 | Aparece; pago 15.000,00; pendente de baixa: Não, porque o contrato já está encerrado |
| Empenho sem contrato | 2026NE000900 | Não aparece; seus 7.250,00 entram na conferência |

Repare no contrato 104. A regra de pendência, escrita só como "valor pago igual ao valor global", diria Sim para ele. O exemplo obrigou a decidir, e a decisão voltou para a especificação: a pendência vale só para contratos ativos.

Esses exemplos têm uma segunda vida: na aula [Validar e entregar uma camada confiável](../guias/engenharia-entrega-camada.md), eles viram um teste. Um caso que não foi escrito aqui não será testado depois.

Algumas dúvidas não se resolvem na engenharia. Se o valor pago passar do valor global, o contrato está pendente de baixa? Isso depende de como a área trata aditivos e estornos. Registre a pergunta como **pendência com o domínio**, escreva qual regra provisória o código usa e mantenha a pendência visível até a resposta.

## Regra de negócio ou conveniência técnica?

Na [primeira parte da prática de SQL](../tutoriais/engenharia-sql.md), o `inner join` com as unidades deixou a consulta mais curta e tirou o contrato 103 do resultado. Quem escreveu não decidiu excluir contratos de unidades não cadastradas; essa exclusão foi efeito da forma de escrever o SQL.

O teste é perguntar: **alguém da área aceitaria essa regra se ela estivesse escrita?** "Contratos de unidades sem cadastro não contam no total contratado" dificilmente passaria. Se a regra não sobrevive escrita, ela não pode existir escondida no SQL.

O mesmo vale para definições como "ativo". Um contrato pode estar ativo pela coluna `situacao`, pela vigência (data de hoje entre o início e o fim) ou pelas duas coisas. Cada escolha produz uma população diferente. Escolha uma, escreva qual e use a mesma em todas as saídas que dizem medir a mesma coisa.

## Associar registros também é uma decisão

Na base de estudo, cada empenho já chega com o `contrato_id`. Na aplicação real, não é assim: os empenhos vêm do SIAFI (pelo Tesouro Gerencial) e os contratos vêm do ComprasGov, e nada garante um identificador comum. O modelo silver `contratos_empenhos` resolve isso com **quatro tentativas em sequência**, conforme a própria descrição no `schema.yml`:

| Tentativa | Como associa o empenho ao contrato | Quando pode falhar ou mudar |
|---|---|---|
| 1 | Número do empenho e CNPJ/CPF do favorecido | O contrato não registra o número do empenho |
| 2 | Número do processo, quando o processo tem um único contrato | O processo passa a ter um segundo contrato |
| 3 | CNPJ/CPF, quando o fornecedor tem um único contrato | O fornecedor assina um segundo contrato |
| 4 | "Informação complementar", que combina unidade gestora, modalidade e número | O formato do campo muda na fonte |

Cada tentativa só considera os empenhos que as anteriores não associaram. Isso é uma regra de negócio, não um detalhe técnico: as tentativas 2 e 3 dependem de algo ser **único hoje**. Quando um fornecedor assina o segundo contrato, os empenhos dele que dependiam da tentativa 3 deixam de ser associados por ela. O painel muda sem que nenhum dado de pagamento tenha mudado.

Por isso a especificação tem a linha "Empenho sem contrato" e uma conferência de totais: o que não foi associado precisa continuar visível em algum lugar.

## Do planejamento aos modelos

Com a especificação pronta, cada necessidade encontra seu lugar. A cadeia de contratos da aplicação, em `airflow_lappis/dags/dbt/ipea/models/contratos_dbt/`, segue esta divisão:

| Necessidade da especificação | Onde ela é resolvida | Modelo real |
|---|---|---|
| Valor como número, data como data | Preparação por fonte (bronze) | `bronze/contratos.sql`, `bronze/empenhos_tesouro.sql` |
| Associar empenhos a contratos | Integração (silver) | `silver/contratos_empenhos.sql` |
| Uma linha por contrato, com as medidas e a pendência | Entrega (gold) | `gold/contratos_resumo.sql` |

A próxima aula detalha o que cada camada faz e constrói essa mesma cadeia na base de estudo.

## Caso real: definir "bolsista ativo"

Em **08/10/2026**, o [commit 5e11eaf](https://github.com/GovHub-br/data-application-gov-hub/commit/5e11eaf351b7c98bc4e25a7b50d15b023630f4b4) corrigiu os modelos de bolsistas. A mensagem descreve o problema:

> Os charts do dashboard de bolsistas divergiam dos números do Ipea. A ingestão está fiel à origem; a diferença vinha das regras nos modelos.

Três decisões de especificação aparecem nessa correção:

1. **A definição de ativo mudou de critério.** Antes, dependia só da data de término; passou a vir da situação do bolsista. A [macro `sisbolsas_bolsista_ativo`](https://github.com/GovHub-br/data-application-gov-hub/blob/046bae840132cd17e6ba55a7ff9c942105f59927/airflow_lappis/dags/dbt/ipea/macros/sisbolsas.sql) considera as situações 1 (Ativo) e 3 (Encerramento pendente).
2. **A regra foi conferida contra um número de referência.** O comentário da macro registra que, com a nova regra, a origem deu 252 bolsistas ativos em 08/10/2026, o mesmo número informado pelo Ipea em 11/09/2026. Esse é o papel da linha "Conferência" da especificação.
3. **A dúvida ficou escrita.** O mesmo comentário diz que a situação 3 foi incluída "por inferência, a confirmar com o Ipea". É uma pendência com o domínio registrada onde quem mantém o código vai ler.

A correção também trocou a origem da unidade: segundo a mensagem do commit, a tabela usada antes cobria só 17 de 216 chamadas e gerava `SEM_UNIDADE` no painel. É o caso do contrato 103 em escala real: um cadastro incompleto do outro lado da junção decidindo o que aparece no indicador.

Nenhuma dessas correções exigiu coletar de novo. A ingestão estava certa; faltava especificar a regra.

## Erros comuns

| Sintoma | Causa provável | Como evitar |
|---|---|---|
| Dois painéis mostram números diferentes para "ativos" | Cada saída implementou sua própria definição | Uma definição escrita, usada por todas as saídas |
| O número muda sem que a fonte tenha mudado | Regra de associação que depende de algo ser único hoje | Conferência de totais que mostre o que não foi associado |
| Ninguém sabe se o nulo é zero | A especificação não diz o que significa a ausência | Uma linha da especificação para cada tipo de ausência |
| Discussão sem fim sobre a regra | Debate no abstrato | Exemplos concretos com o resultado esperado |

## Confira o que entendeu

1. Por que a especificação traz "Cada linha representa um contrato, ativo ou inativo", e não só "contratos"?
2. A área diz: "conta como ativo o contrato com vigência em curso". A coluna `situacao` diz `Ativo` para um contrato cuja vigência terminou ontem. O que você faz?
3. Um fornecedor que tinha um único contrato assina um segundo. Na cadeia real, o que pode acontecer com os pagamentos dele no painel?
4. Qual linha da especificação permite provar, depois, que nenhum pagamento se perdeu?

## Respostas comentadas

1. Porque "contratos" deixa em aberto a população (só ativos?) e a granularidade (uma linha por contrato, ou por contrato e empenho?). A frase completa define as duas coisas, e o 104 entra.
2. Leva o caso para a área como exemplo concreto: "este contrato, com estas datas e esta situação, entra?". As duas regras dão populações diferentes, e a escolha precisa ser escrita na especificação, não decidida no SQL.
3. Os empenhos associados a ele pela tentativa 3 (CNPJ com um único contrato) deixam de ser associados por ela. Se nenhuma outra tentativa os associar, saem do valor pago dos contratos, embora nenhum pagamento tenha mudado.
4. A conferência: total pago na tabela mais pagamentos sem contrato deve ser igual ao total pago na entrada. Qualquer diferença precisa de explicação.

## Veja também

- [Prática: SQL para contar e somar sem enganos](../tutoriais/engenharia-sql-medidas.md)
- [Definir as responsabilidades de cada camada](engenharia-camadas.md)
