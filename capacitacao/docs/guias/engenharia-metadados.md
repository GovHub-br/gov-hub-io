# Documentar colunas e seguir a linhagem

> Tipo: **Guia**

## Dados sobre os dados

**Metadados** explicam o conteúdo: o nome e o significado de uma coluna, a unidade monetária, o período de referência e a origem. Sem eles, `valor_total` pode significar contratado, empenhado, liquidado ou pago — contas que não devem ser confundidas.

**Linhagem** mostra de onde o resultado veio e quais transformações o produziram. Um catálogo reúne essas descrições para consulta. Ele funciona como um mapa que ajuda a encontrar e interpretar tabelas.

Para descrever um modelo, comece por uma pergunta concreta: “Quem abrir esta tabela conseguirá usá-la corretamente sem conversar comigo?”. Se a resposta depender de uma explicação oral, transforme essa explicação em descrição.

## Objetivo

Permitir que outra pessoa entenda o número sem depender de quem escreveu o SQL.

## Passos

1. Escolha um modelo gold e escreva sua finalidade e granularidade.
2. Descreva três colunas: significado, unidade, origem e regra de cálculo, quando existir.
3. Declare a chave e os testes no `schema.yml`. Reaproveite descrições de `descriptions.yml` quando forem realmente equivalentes.
4. No ambiente dbt configurado, execute `dbt docs generate`. Abra os arquivos gerados conforme a configuração local de documentação da aplicação.
5. Siga o grafo de `ref()` e `source()` até a origem. Compare-o com o percurso lido no código.
6. Registre quem responde pelo modelo e como uma alteração será comunicada aos consumidores.

## Exemplo de descrição útil

“Valor executado em reais, agregado por TED e exercício, segundo a regra do modelo de origem” ajuda mais que “valor total”. Inclua o tratamento de nulos, cancelamentos e atualização quando afetar a interpretação.

## Exemplo: uma coluna documentada para quem vai usá-la

| Campo da descrição | Exemplo preenchido |
|---|---|
| Nome da coluna | `valor_total` |
| Significado | Soma dos valores dos registros incluídos no modelo |
| Unidade | Reais |
| Granularidade do modelo | Uma linha por órgão e exercício |
| Origem | Modelo silver de estudo |
| Ausência de valor | Deve ser investigada; não é assumida como zero |

Com registros de 100 e 200 do mesmo órgão e exercício, a linha resultante vale 300. Sem a descrição de granularidade, alguém poderia tratar 300 como o valor de um contrato individual.

A linhagem acrescenta a pergunta “quais registros e transformações produziram esses 300?”. A descrição explica o significado; o caminho de dependências permite investigar o cálculo. As duas informações se complementam.

## Onde procurar no projeto

O projeto inclui `models/metadata/models_metadata.sql`, `macros/metadata/generate_metadata.sql` e `apply_comments` em `cliente_postgres.py`. São apoios ao catálogo e aos comentários, não substitutos da descrição de negócio.

## Pronto

Outra pessoa identifica origem, significado e período de um valor. Se uma regra mudar, ela também sabe quais consumidores precisam ser avisados.

## Roteiro de documentação do modelo

Para cada coluna escolhida, responda: o que ela representa, de onde vem, em que unidade está e o que significa ficar vazia. Se o valor for calculado, acrescente a regra e os filtros que mudam a interpretação.

Por exemplo, “Exercício orçamentário do registro, informado pela fonte; não é o ano em que a carga rodou” evita uma confusão comum. Use apenas afirmações que correspondam ao modelo que você está documentando.

`dbt docs generate` prepara a documentação; o comando não publica automaticamente uma página na internet. No catálogo gerado, procure o nome do modelo e suas dependências. O caminho gráfico deve corresponder aos `ref()` e `source()` que você leu nos arquivos.

Quando precisar de uma visualização local, `dbt docs serve` serve os arquivos gerados no ambiente em que o dbt está sendo executado. Leia no terminal o endereço e a porta disponíveis; em contêineres, a porta também precisa estar acessível no computador.

## Veja também

- [Dados pessoais, segredos e menor privilégio](../explicacao/engenharia-acesso.md)
- [PostgreSQL, formatos e o papel do MinIO](../referencia/engenharia-formatos.md)
