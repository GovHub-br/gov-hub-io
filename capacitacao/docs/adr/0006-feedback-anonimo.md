# ADR 0006 — Avaliação de cada aula sem dados de identificação

**Status:** aceito
**Data:** 2026-10-01

## Contexto

A equipe quer saber o que melhorar em cada aula. Para que a crítica seja franca, a pessoa precisa se
sentir livre para dizer que algo ficou confuso, sem que a resposta carregue o seu nome.

**O que este desenho garante:** o documento de feedback não leva nenhum dado que identifique a pessoa
e o site nunca lê o feedback. **O que ele não garante:** anonimato diante de quem administra o
projeto Firebase (ver Consequências).

## Decisão

- **Só com login.** O bloco "Conte como foi esta aula" aparece no fim de cada aula; sem login, ele
  convida a entrar com Google.
- **Coleção `feedback` sem identidade.** Cada documento tem `trilha`, `aula`, `clareza`, `uso`,
  `comentario` (opcional, até 1000 caracteres) e `periodo` mensal (`AAAA-MM`). Não há uid, nome, e-mail
  nem horário. O id do documento é aleatório.
- **Regras que só permitem criar**, com os campos validados (valores permitidos, tamanho do comentário,
  nenhuma chave a mais). Não há leitura, edição nem exclusão pelo site.
- **`avaliadas` no progresso.** O documento `progresso/<uid>` guarda só *que* a pessoa avaliou a aula,
  para o bloco mostrar "Obrigado" depois; nunca o conteúdo da resposta.
- **Sem edição.** Uma avaliação enviada não pode ser corrigida.
- **Leitura pelo console** do Firebase (Firestore, coleção `feedback`), por quem administra o projeto.

## Consequências

- **Não é anonimato diante de quem administra o projeto.** Logo depois de criar o feedback, o próprio
  site grava `progresso/{uid}` (`avaliadas.<aula>` e `atualizadoEm`). O Firestore guarda o horário
  exato de criação do documento de feedback (`createTime`) e o de atualização do progresso, ambos
  legíveis por quem tem acesso administrativo ou à API do projeto. Comparando os dois, essa pessoa
  consegue dizer quem avaliou, com alta confiança. Se os registros de auditoria de acesso a dados
  (Data Access audit logs) do Google Cloud estiverem ativados, eles também registram o autor de cada
  gravação. Eliminar essa ligação exigiria um servidor que recebesse as respostas e as regravasse em
  lote, sem o vínculo com quem enviou.
- O login obrigatório reduz spam.
- Não é possível corrigir uma avaliação enviada.
- A mesma pessoa pode avaliar de novo em outro dispositivo se a gravação de `avaliadas` falhar.
- As regras novas precisam ser publicadas no console antes do deploy do feedback.

## Alternativas consideradas

- **uid na resposta**, para permitir edição: descartada, porque liga a crítica à pessoa.
- **Feedback sem login, com Auth anônima:** descartada por abrir espaço a spam sem controle e por não
  permitir lembrar quais aulas já foram avaliadas.
- **Painel de leitura no site:** adiado; o console do Firebase atende a equipe por ora.
