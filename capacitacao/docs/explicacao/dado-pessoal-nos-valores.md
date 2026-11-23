# Dado pessoal nos valores: o que nenhuma ferramenta vê

> Tipo: **Explicação**

## Contexto

Bandit e Trivy olham código e configuração. Nenhum dos dois olha os valores que passam pela DAG. Isso importa porque, em bases legadas, o nome da coluna não diz o que ela guarda. Uma coluna chamada `campo3`, numa tabela descrita como "campos auxiliares", pode guardar CPF. Nada no nome da tabela, no nome da coluna ou na descrição avisa.

## A ideia

Três consequências para quem escreve DAGs:

- **Pergunte ao dado, não ao nome.** A detecção de dado pessoal deve olhar os valores (formato mais dígito verificador de CPF e CNPJ) e decidir por coluna, pela proporção de valores que passam. A documentação ajuda, mas não é a prova.
- **Combinações identificam.** CEP sozinho não identifica ninguém; CEP com data de nascimento e sexo identifica a maioria das pessoas. Esses campos são quase-identificadores e precisam ser tratados em conjunto.
- **Pseudonimizar não é anonimizar.** Trocar o CPF por um hash com chave secreta preserva unicidade e junções, mas, pela LGPD, o dado continua sendo dado pessoal e continua sob a lei inteira. Não chame de base anonimizada algo que foi apenas pseudonimizado.

### Por que o MD5 não pseudonimiza um CPF

Um CPF tem cerca de um bilhão de combinações válidas. Um hash sem chave é desfeito por força bruta em minutos: basta calcular o hash de todos os CPFs possíveis e comparar. Com um HMAC cuja chave fica guardada fora do banco, quem não tem a chave não consegue montar a tabela de correspondência. Mesmo assim, o resultado continua sendo dado pessoal.

## Trade-offs e alternativas

- **Detecção por valores** é mais cara e pode errar (uma coluna numérica qualquer pode "parecer" CPF), mas protege o que o nome da coluna esconde. Detecção por nome é barata e deixa passar justamente o caso legado.
- **Tratar como pessoal até prova em contrário** gera mais restrição do que o necessário, mas o erro contrário, expor dado real, é muito mais caro.
- **Pseudonimização** mantém junções entre tabelas; a **anonimização** verdadeira as perde.

## Conexões

- A prática está em [Manter dado pessoal fora de logs, XCom e repositório](../guias/manter-dado-pessoal-fora-de-logs-xcom-e-repositorio.md).
- Se o dado já vazou: [Responder a um segredo ou dado pessoal commitado](../guias/responder-a-um-segredo-ou-dado-pessoal-commitado.md).

## Veja também

- [O que cada ferramenta enxerga](o-que-cada-ferramenta-enxerga.md)
- Lei Geral de Proteção de Dados (Lei 13.709/2018)
