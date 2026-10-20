# Aulas da trilha de adoção: origem

As aulas desta pasta são cópias adaptadas da documentação técnica oficial do Gov Hub
(<https://gov-hub.io/govhub/documentacao/>), do repositório
[`GovHub-br/gov-hub-io`](https://github.com/GovHub-br/gov-hub-io), pasta `docs/documentacao/`, no
commit `8def869b67c4d2109601a1893fc0a9c8c6713bf7`. Os caminhos espelham os de lá
(`docs/documentacao/adocao/deploy-inicial.md` → `docs/plataforma/adocao/deploy-inicial.md`), o que
facilita comparar com a fonte. Esta página não faz parte da trilha.

## O que foi adaptado

O texto original foi mantido. Mudou só:

1. As caixas `!!! tipo "Título"` do MkDocs viraram citação, com o título em negrito.
2. As linhas `style … fill:` dos diagramas Mermaid foram removidas (cores fora da paleta). Os
   diagramas continuam em Mermaid por enquanto; serão trocados por PNG da skill `govhub-diagramas`.
   Os diagramas largos demais para a coluna da aula mudaram de direção (horizontal para vertical,
   ou o inverso no dicionário de dados), sem mudar nós nem ligações.
3. Travessões no texto corrido viraram dois-pontos, vírgula ou ponto (regra da identidade visual).
4. Cada aula termina com o crédito para a página oficial.
5. As imagens que as aulas usam foram copiadas para `docs/plataforma/imagens/` (na origem ficam em
   `docs/assets/images/`), e o caminho na aula foi ajustado.

Os links não foram reescritos: os que apontam para páginas que não estão nesta pasta podem não abrir
no site.

## Licença da fonte

```
MIT License

Copyright (c) 2025 Gov Hub br
```

O texto completo está em <https://github.com/GovHub-br/gov-hub-io/blob/main/LICENSE>.
