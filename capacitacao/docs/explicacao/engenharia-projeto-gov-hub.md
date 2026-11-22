# O Gov Hub e sua aplicação de dados

> Tipo: **Explicação**

## O problema que o projeto enfrenta

Dados de pessoal, orçamento, contratos e transferências estão distribuídos por sistemas com estruturas e critérios diferentes. Cruzá-los manualmente gera retrabalho, dificulta conferir a origem de um número e torna a atualização dependente de processos pouco repetíveis.

O Gov Hub integra e qualifica esses dados para apoiar gestão, acompanhamento de políticas e transparência. A aplicação de dados reúne coletas, transformações, testes e configurações que tornam esse trabalho executável e rastreável.

![Cinco fontes, SIAFI e Tesouro Gerencial para orçamento e execução financeira, SIAPE para pessoal, ComprasGov e PNCP para compras e contratos, TransfereGov para transferências e instrumentos e SIORG para estrutura organizacional, alimentam a aplicação data-application-gov-hub, que reúne coletas, transformações, testes e configurações. A aplicação integra os dados numa tabela analítica documentada e verificável, consumida por painéis, consultas SQL e notebooks. Uma nota de LGPD lembra que nem todo campo disponível pode ser publicado e que a finalidade e as regras de acesso acompanham o dado até o consumo.](../../assets/diagramas/engenharia-projeto-fontes.png)

## Fontes e perguntas que elas ajudam a responder

| Fonte | Assunto | Exemplo de necessidade analítica |
|---|---|---|
| SIAFI e Tesouro Gerencial | Orçamento e execução financeira | Acompanhar recursos e execução por órgão e exercício |
| SIAPE | Pessoal | Analisar a distribuição de pessoas com acesso apropriado |
| ComprasGov e PNCP | Compras e contratos | Acompanhar contratações e seus valores |
| TransfereGov | Transferências e instrumentos | Relacionar instrumentos, períodos e execução |
| SIORG | Estrutura organizacional | Identificar e relacionar unidades e órgãos |

A disponibilidade de uma fonte não significa que todos os seus campos podem ser publicados. A finalidade do indicador e as regras de acesso acompanham o dado até o consumo.

## Exemplo: uma pergunta que atravessa sistemas

Uma equipe quer acompanhar a execução de um instrumento por órgão e exercício. O valor financeiro, o cadastro organizacional e a identificação do instrumento podem vir de origens distintas. A aplicação precisa preservar as chaves de cada origem, definir as relações e explicitar o período considerado antes de produzir o indicador.

O resultado esperado inclui uma tabela analítica documentada e verificável. O painel é uma forma de consumo dessa tabela; consultas SQL e análises em notebooks também podem utilizá-la.

## Onde a aplicação se encaixa

| Repositório | Papel no trabalho |
|---|---|
| `data-application-gov-hub` | Pipeline principal e ambiente de desenvolvimento das práticas |
| `data-application-cidades` e `data-application-minc` | Aplicações temáticas que adaptam o contexto e as fontes |
| `continuous-deployment` | Implantação e configuração da infraestrutura compartilhada |
| `gov-hub-io`, neste material | Site e conteúdo de capacitação |

Nesta trilha, os comandos de ambiente e os exemplos de implementação são feitos na aplicação de dados. O repositório do site apresenta as aulas e não substitui o ambiente do pipeline.

## Referência do projeto

- [Visão geral e repositórios do Gov Hub](https://gov-hub.io/documentacao/)

## Veja também

- [Engenharia de dados: da fonte à decisão](engenharia-papel.md)
- [ELT e processamento em lote](engenharia-elt-lote.md)
