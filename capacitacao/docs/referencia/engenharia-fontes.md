# REST, SOAP, e-mail, bancos e arquivos

> Tipo: **Referência**

## Contrato de ingestão por fonte

Cada integração precisa definir autenticação, recorte temporal, paginação, formato e critério de completude. Na aplicação, clientes REST, SOAP, e-mail e SQL Server têm implementações próprias; a DAG coordena sua execução e a gravação no destino.

## Como a fonte chega à aplicação

| Fonte | Formato ou mecanismo | Onde estudar no código |
|---|---|---|
| API REST | Respostas geralmente em JSON e paginação | `cliente_ibge.py`, `cliente_pncp.py`, `cliente_contratos.py` |
| SOAP | Mensagens XML e contrato do serviço | `cliente_siafi.py`, com `zeep` |
| E-mail | Anexo de relatório ou planilha via IMAP | `cliente_email.py` e `email_ingest_dag_factory.py` |
| SQL Server | Consultas via conexão configurada | `cliente_sqlserver.py` |
| Arquivo | CSV, XLSX, XML ou ZIP | Leitores em `airflow_lappis/helpers/` |

## Exemplo: preservar o contrato da fonte

Considere uma fonte de contratos cujo código de órgão é `0012` e cujo valor chega como texto `1.234,56`:

| Elemento recebido | Decisão de ingestão e transformação |
|---|---|
| Código `0012` | Preservar a identidade e os zeros iniciais |
| Valor textual `1.234,56` | Preservar o recebido e aplicar a conversão numérica na bronze |
| Mesmo contrato em duas páginas | Identificar pela chave completa e validar a política de atualização |
| Linha de total em relatório anexado | Separar registros de negócio das linhas de apresentação |

REST, SOAP e anexos exigem leitores diferentes, mas a conferência de identidade, tipos, período e completude continua necessária. A biblioteca de leitura não define essas regras pelo projeto.

## Perguntas para qualquer fonte

Confira autenticação, período disponível, limite de requisições, paginação, formato, campos obrigatórios e chave dos registros. Para anexos, registre como identificar o relatório e evitar processar o mesmo arquivo novamente.

A escolha de `requests`, `httpx`, `pandas` ou `openpyxl` não substitui a definição do contrato da fonte e dos controles de ingestão.

## Certificados e credenciais

Algumas APIs do governo exigem certificados. A cadeia de certificados ICP-Brasil é preparada no `Dockerfile`. Não desative a verificação de certificados para resolver erro de conexão.

Credenciais vêm da configuração do ambiente. Os nomes das variáveis podem ser documentados; valores reais, tokens e certificados privados não entram no código nem nos exemplos.

## Antes de escolher uma biblioteca

Confirme as exigências de autenticação, certificados, parâmetros de período e formato de saída antes de implementar o cliente.

Se a origem for uma planilha, confira qual aba contém os registros, onde está o cabeçalho e se há linhas de total misturadas. Abrir o arquivo com sucesso não garante que todas as linhas representem o mesmo tipo de informação.

## Veja também

- [Clientes Python: uma responsabilidade por fonte](../explicacao/engenharia-clientes.md)
- [Paginação, tempo limite e falha visível](../guias/engenharia-resiliencia.md)
