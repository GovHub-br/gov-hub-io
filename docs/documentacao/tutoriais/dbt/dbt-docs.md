# Documentação com dbt Docs

dbt Docs gera automaticamente documentação para projetos de transformação de dados.

## Exemplo de Documentação YAML

Arquivos YAML dentro de `airflow_lappis/dags/dbt/ipea/models/` descrevem
modelos, colunas, testes e macros. O nome do arquivo pode variar, desde que use
a extensão `.yml`.

```yaml
version: 2

models:
  - name: contratos
    description: >
      Tabela com informações sobre contratos, incluindo detalhes como o valor do contrato, a data de início e término, e o status do contrato.
      Esta tabela é fundamental para entender a execução e o cumprimento dos contratos firmados.
      A tabela é atualizada diariamente e contém dados de contratos firmados pelo IPEA.
    columns:
      - name: id
        description: >
          Identificador único do contrato, utilizado para referenciar o contrato em outras tabelas e análises.
macros:
  - name: create_udfs
    description: >
      Função que cria as UDFs necessárias para o funcionamento do projeto.
      Essa função deve ser chamada no início de cada run para garantir que todas as UDFs estejam disponíveis.
```

## Como Utilizar

1. Execute o comando para gerar a documentação:
    
    ```bash
    dbt docs generate
    ```
    
    Verifique se `catalog.json` e `manifest.json` foram criados em `target/`.
    
2. Garanta que você criou os modelos com `dbt run` ou `dbt build` para visualizar a documentação de todas as colunas, não apenas aquelas descritas no seu projeto.
3. Inicie o servidor local de documentação:
    
    ```bash
    dbt docs serve --port 8081
    ```
    
4. Acesse a documentação em <http://localhost:8081>.

## Principais Recursos

- Visualização do DAG (Directed Acyclic Graph) dos modelos
- Documentação automática de modelos, colunas e testes
- Navegação interativa entre dependências
- Visualização do código SQL dos modelos

## Boas Práticas

- Documente seus modelos usando blocos de documentação em YAML
- Adicione descrições detalhadas para colunas importantes
- Mantenha a documentação atualizada conforme o projeto evolui
- Use tags para organizar melhor seus modelos

## Referência

- [Documentação de projetos dbt](https://docs.getdbt.com/docs/build/documentation)
