# Como responder a um segredo ou dado pessoal commitado

> Tipo: **Guia (how-to)**

## Objetivo

Agir na ordem certa. A ordem importa mais que a pressa.

## Antes de começar

- Não cole o segredo nem o dado em nenhuma mensagem, issue ou chat.
- Reportar rápido deve ser seguro: registre a lição sem procurar culpado.

## Passos

1. **Entenda que apagar e commitar de novo não basta.** O conteúdo continua no histórico, em clones e em forks.
2. **Credencial:** revogue ou rotacione imediatamente. Considere comprometida mesmo que o repositório seja privado.
3. **Avise o time de segurança e a governança de dados**, informando o que foi exposto, onde, desde quando e se o repositório é público ou privado.
4. **Deixe a remoção do histórico com o time de segurança.** Ela é feita de forma coordenada: reescrever histórico obriga todos a refazer seus clones.
5. **Dado pessoal:** avaliar se há incidente de segurança, e se é preciso comunicar a ANPD e os titulares quando houver risco ou dano relevante (art. 48 da LGPD), é decisão da governança. O seu papel é reportar rápido e com precisão.
6. **Corrija a causa, não só o arquivo.** Por que o controle não pegou? Se foi um mascaramento por nome de coluna, o conserto é o processo; se foi um template, o conserto é o template.

## Pronto

A credencial foi revogada ou rotacionada, o time de segurança e a governança foram avisados, e a causa-raiz foi corrigida.

## Veja também

- [Segurança (plataforma)](../plataforma/governanca/seguranca.md), com o fluxo de credencial exposta no Git
- [Dado pessoal nos valores](../explicacao/dado-pessoal-nos-valores.md)
- [Recomendações e próximos passos](../explicacao/recomendacoes-e-proximos-passos.md), sobre a lacuna do histórico do Git
