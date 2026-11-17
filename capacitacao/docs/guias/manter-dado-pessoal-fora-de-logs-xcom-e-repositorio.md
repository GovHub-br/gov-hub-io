# Como manter dado pessoal fora de logs, XCom e repositório

> Tipo: **Guia (how-to)**

## Objetivo

Cobrir o que nenhuma ferramenta cobre. Este é o guia mais importante para cientistas de dados.

## Antes de começar

- Leia [Dado pessoal nos valores](../explicacao/dado-pessoal-nos-valores.md): o guia assume que você sabe por que o nome da coluna não basta.

## Passos

1. **Logue contagens e formatos, nunca valores.** `log.info('linhas: %d', n)`. Para mostrar um formato, use uma máscara como `NNN.NNN.NNN-NN`, nunca o valor.
2. **XCom leva referências, não linhas.** O XCom fica no banco de metadados do Airflow e aparece na interface. Passe o nome da tabela de staging ou o caminho do arquivo num armazenamento com controle de acesso.
3. **Minimize.** Selecione só as colunas e só as linhas de que a tarefa precisa.
4. **Amostras e documentação.** Use amostra aleatória, não as primeiras linhas (as mais antigas têm formato diferente). Não decida o que mascarar pelo nome da coluna: detecte pelos valores, com reconhecedores que conferem o dígito verificador, e grave no relatório só o formato, nunca o valor.
5. **Dados de teste** são sintéticos ou pseudonimizados com chave guardada fora do banco. Nunca uma cópia de produção.
6. **Pseudonimização continua sendo dado pessoal.** Use HMAC com chave secreta, como no laboratório, e não guarde a chave no banco mascarado.
7. **Limpe os notebooks.** Eles guardam as saídas das células dentro do arquivo `.ipynb`. Limpe-as antes do commit, por exemplo com o `nbstripout`.
8. **Na revisão do PR, procure os suspeitos de sempre:**

   ```bash
   grep -rnE 'print[(]|head[(]|to_csv[(]|display[(]' dags/ notebooks/
   ```

9. **Coluna que você não conhece?** Trate como dado pessoal até provar o contrário, olhando os valores com um detector, e não pelo nome ou pela descrição.

## Pronto

Logs só têm contagens e formatos, o XCom só leva referências, os notebooks estão sem saídas e nenhuma amostra do repositório tem dado real.

## Veja também

- [Checklist pré-PR](../referencia/checklist-pre-pr.md)
- [Responder a um segredo ou dado pessoal commitado](responder-a-um-segredo-ou-dado-pessoal-commitado.md)
