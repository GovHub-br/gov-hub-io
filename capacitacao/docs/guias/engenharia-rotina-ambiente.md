# Rotina local e verificação final

> Tipo: **Guia**

## Objetivo

Retomar o ambiente de estudo e comprovar que ele está preparado para as próximas práticas. Os comandos desta aula partem da raiz da aplicação e usam apenas o ambiente local.

![A rotina do ambiente local em quatro etapas: iniciar, com docker compose up -d; acompanhar, com docker compose ps, make dev-check e docker compose logs -f airflow; verificar o código, com make lint e make test; e encerrar, com docker compose down. Do encerramento, a rotina volta ao início no dia seguinte. Duas notas: make dev serve só para cadastrar de novo as Variables ou a conexão padrão; e docker compose down -v remove os volumes e pode apagar o banco local, por isso não deve ser usado numa parada normal.](../../assets/diagramas/engenharia-rotina-local.png)

## Iniciar e acompanhar

<!-- explica: Sobe os containers da aplicação em segundo plano (`-d`, o terminal fica livre), lista o estado de cada um e confere se as Variables e a conexão do Airflow continuam cadastradas. -->

```bash
docker compose up -d
docker compose ps
make dev-check
```

Para acompanhar um serviço, use `docker compose logs -f airflow` ou substitua `airflow` pelo serviço investigado. Interromper o acompanhamento do log não encerra o contêiner.

Se alterou a configuração das Variables ou da conexão padrão e precisa reaplicá-la, revise os parâmetros locais e execute `make dev`. Esse alvo reconfigura itens do Airflow; não é necessário repeti-lo em toda leitura de logs.

## Verificações de desenvolvimento

<!-- explica: `make lint` confere formatação e estilo do código Python e SQL sem alterar nenhum arquivo (black, ruff, mypy, sqlfmt e sqlfluff). `make test` roda os testes automatizados da pasta `tests` com o pytest. -->

```bash
make lint
make test
```

Essas verificações conferem código e comportamento cobertos pelos testes. Elas não validam todas as fontes externas nem substituem os controles de qualidade dos dados. `make format`, quando necessário, altera arquivos; confira o diff resultante antes de preparar uma contribuição.

## Encerrar e retomar sem resetar

<!-- explica: Para e remove os containers da aplicação. Os volumes, onde ficam os dados do banco, são mantidos: na próxima subida, as tabelas continuam lá. -->

```bash
docker compose down
```

Para retomar, use `docker compose up -d` e repita os controles de disponibilidade. Não acrescente `-v` para uma parada normal: isso remove os volumes e pode apagar o banco local.

## Critério de conclusão do nível

Antes de seguir para modelagem e construção das camadas, confirme:

- Revisão e requisitos do projeto registrados.
- `.env` local protegido e configuração compatível com os serviços.
- Airflow, PostgreSQL e Superset disponíveis para as práticas.
- DAG de estudo reconhecida, sem erro de importação que a impeça.
- Banco e destino dbt conhecidos e conexão validada.
- Diagnóstico e retomada possíveis sem apagar dados por padrão.

Guarde uma anotação curta com revisão, verificações e eventuais limitações. A conclusão do nível não exige disparar uma coleta protegida nem criar um indicador. A próxima etapa usa SQL aplicado e casos do projeto para planejar e construir as camadas de dados.

## Referências

- [Instalação e rotina de desenvolvimento](https://gov-hub.io/documentacao/instalacao/)
- [Roteiro do contribuidor](https://gov-hub.io/documentacao/onboarding/roteiro/)

## Veja também

- [Executar o dbt e conferir os dados no banco](engenharia-dbt-configuracao.md)
- [Prática: SQL para decidir quem entra no resultado](../tutoriais/engenharia-sql.md)
