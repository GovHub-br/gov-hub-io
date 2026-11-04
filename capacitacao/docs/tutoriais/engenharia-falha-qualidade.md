# Prática: provocar e diagnosticar uma falha de qualidade

> Tipo: **Tutorial**

## O erro será criado de propósito

O objetivo é aprender a reconhecer um problema conhecido. Use uma tabela de estudo, nunca uma tabela da qual outras pessoas dependam. Se a origem tem três linhas e a bronze só converte tipos, esperamos três linhas na saída.

O teste `row_count_match` compara quantidades de linhas. Seu nome pode ser lido como “as contagens correspondem?”. Já o arquivo `schema.yml` reúne descrições e testes; a indentação, isto é, os espaços no início das linhas, organiza suas seções.

Para encontrar um exemplo da macro, use a busca do editor por `row_count_match` no diretório dbt. Abra uma configuração existente, identifique quais tabelas ela compara e só então adapte o exemplo às suas tabelas de estudo.

## O que você vai aprender

Reconhecer uma falha real de dados e diferenciar seu sintoma da causa.

## Antes de começar

Use tabelas sintéticas locais e um modelo bronze de estudo. Anote contagem, chaves e um total financeiro. Não provoque falhas em bases compartilhadas.

## Passos

1. Leia uma utilização existente de `row_count_match` em `schema.yml` e adapte seus argumentos ao par origem/bronze de estudo.
2. Execute o modelo e os testes. As contagens devem ser iguais quando a bronze apenas converte tipos.
3. No modelo de estudo, introduza temporariamente um filtro que elimine um registro. Execute novamente: o teste de contagem deve falhar.
4. Leia a saída do `dbt test`, encontre o nome do teste e confira o SQL compilado indicado no log.
5. Remova o filtro, refaça o modelo e confirme a aprovação. O filtro serviu para a simulação e não deve permanecer na bronze.
6. Proponha dois testes para uma gold de TEDs: um sobre sua chave e outro sobre um total ou relacionamento de negócio.

## Exemplo: acompanhe a linha que desapareceu

Use três registros sintéticos, de valores 100, 200 e 300. A origem tem três linhas e total 600.

| Momento | Linhas na origem | Linhas na bronze | Total na bronze |
|---|---|---|---|
| Antes da falha | 3 | 3 | 600 |
| Filtro temporário retira o registro de valor 100 | 3 | 2 | 500 |
| Filtro removido e modelo reexecutado | 3 | 3 | 600 |

O teste de contagem deve reprovar no segundo momento e aprovar no terceiro. A origem não foi alterada: a perda foi provocada apenas na transformação de estudo.

Agora imagine manter três linhas, mas converter o valor 100 em 10. A contagem aprovaria, embora o total caísse para 510. Esse segundo caso mostra por que é necessário combinar contagem, tipos e reconciliação de valores.

## Como verificar

Registre entrada, resultado esperado, falha produzida e correção. Faça também uma reconciliação do total com a origem: contagens iguais não detectam todos os valores incorretos.

Se a macro ou seu nome mudou, siga a implementação atual e registre a adaptação; não invente parâmetros a partir do nome.

## O que observar antes, durante e depois

Registre três momentos: primeiro, o teste aprova com a mesma quantidade nas duas tabelas; depois, falha quando o filtro elimina uma linha; por fim, aprova após a remoção do filtro e a nova execução do modelo.

Não basta remover o filtro do arquivo: o banco ainda pode guardar a saída da execução anterior. Execute a transformação novamente e depois o teste.

O **SQL compilado** é a consulta final que o dbt montou ao resolver expressões e macros. O log informa seu caminho para investigação. Abra esse arquivo para ler, preservando o modelo original como lugar da correção.

Uma falha esperada no exercício mostra que o controle detectou o problema. Se aprovar apesar da linha perdida, confira se você executou o teste certo e se ele está apontando para o par de tabelas correto.

## Veja também

- [Qualidade: o que precisa ser verdadeiro no dado](../referencia/engenharia-qualidade.md)
- [Logs, reconciliação e atualização](../guias/engenharia-observabilidade.md)
