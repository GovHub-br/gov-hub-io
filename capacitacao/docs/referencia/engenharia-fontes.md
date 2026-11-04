# REST, SOAP, e-mail, bancos e arquivos

> Tipo: **Referência**

## O que muda de uma fonte para outra?

Alguns sistemas deixam um programa pedir registros diretamente; outros entregam arquivos que alguém precisa receber e abrir. O objetivo continua sendo obter registros completos e entender seu significado. O modo de pedir e interpretar a resposta é que muda.

Em uma API REST, um **endpoint** é um endereço para uma operação, como consultar contratos. A **requisição** é o pedido; a **resposta** é o conteúdo devolvido. JSON representa esse conteúdo com nomes e valores, por exemplo `{"orgao": "A", "valor": 100}`.

SOAP é outro padrão de comunicação, normalmente baseado em mensagens XML e em uma descrição formal do serviço. Você não precisa escrever todas essas mensagens manualmente: bibliotecas como `zeep` ajudam a construí-las.

IMAP é o protocolo usado para consultar uma caixa de e-mail. SQL Server é um sistema de banco de dados, diferente do PostgreSQL; seu cliente precisa da conexão apropriada.

## Como a fonte chega à aplicação

| Fonte | Formato ou mecanismo | Onde estudar no código |
|---|---|---|
| API REST | Respostas geralmente em JSON e paginação | `cliente_ibge.py`, `cliente_pncp.py`, `cliente_contratos.py` |
| SOAP | Mensagens XML e contrato do serviço | `cliente_siafi.py`, com `zeep` |
| E-mail | Anexo de relatório ou planilha via IMAP | `cliente_email.py` e `email_ingest_dag_factory.py` |
| SQL Server | Consultas via conexão configurada | `cliente_sqlserver.py` |
| Arquivo | CSV, XLSX, XML ou ZIP | Leitores em `airflow_lappis/helpers/` |

## Exemplo: reconhecer o registro em formatos diferentes

O contrato 10, do órgão A, com valor 100 pode chegar assim:

**JSON**, comum em APIs REST:

```json
{"id": 10, "orgao": "A", "valor": 100}
```

**XML**, usado em mensagens de serviços como SOAP:

```xml
<contrato><id>10</id><orgao>A</orgao><valor>100</valor></contrato>
```

**CSV**, que também pode chegar como anexo:

```csv
id,orgao,valor
10,A,100
```

O exemplo XML mostra apenas a representação do registro, não uma mensagem SOAP completa. O formato informa como ler o conteúdo; não define sozinho como autenticar, buscar páginas ou descobrir quais registros mudaram.

Em uma planilha, uma linha “TOTAL, 100” não deve virar outro contrato: é preciso distinguir os registros das linhas de apresentação do relatório.

## Perguntas para qualquer fonte

Confira autenticação, período disponível, limite de requisições, paginação, formato, campos obrigatórios e chave dos registros. Para anexos, registre como identificar o relatório e evitar processar o mesmo arquivo novamente.

Bibliotecas como `requests` e `httpx` fazem chamadas web; `pandas` e `openpyxl` ajudam na leitura de planilhas. Elas não definem sozinhas o contrato da fonte.

## Certificados e credenciais

Algumas APIs do governo exigem certificados. A cadeia de certificados ICP-Brasil é preparada no `Dockerfile`. Não desative a verificação de certificados para resolver erro de conexão.

Credenciais vêm da configuração do ambiente. Os nomes das variáveis podem ser documentados; valores reais, tokens e certificados privados não entram no código nem nos exemplos.

## Antes de escolher uma biblioteca

Liste o que a fonte exige: uma senha ou token, um certificado, parâmetros de período e o formato de saída. Um **token** funciona como uma credencial de acesso; um **certificado** pode ser usado para estabelecer confiança na comunicação.

Se a origem for uma planilha, confira qual aba contém os registros, onde está o cabeçalho e se há linhas de total misturadas. Abrir o arquivo com sucesso não garante que todas as linhas representem o mesmo tipo de informação.

## Veja também

- [Clientes Python: uma responsabilidade por fonte](../explicacao/engenharia-clientes.md)
- [Paginação, tempo limite e falha visível](../guias/engenharia-resiliencia.md)
