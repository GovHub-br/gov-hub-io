# Segurança

Esta página resume as práticas de segurança esperadas para contribuições no GovHub BR. A política formal do repositório continua registrada em `SECURITY.md`.

## Escopo

As orientações cobrem pipelines de ingestão, modelos dbt, configurações de infraestrutura, documentação técnica e qualquer credencial ou segredo associado ao projeto.

## Reporte de vulnerabilidades

Não abra issues públicas para vulnerabilidades, exposição de credenciais ou vazamento de dados sensíveis.

Reporte o problema de forma privada para a equipe responsável, incluindo:

- descrição clara da vulnerabilidade;
- passos para reproduzir, quando aplicável;
- impacto potencial;
- versão, branch ou commit afetado.

A equipe deve confirmar o recebimento em até **3 dias úteis** e apresentar uma avaliação inicial em até **7 dias úteis**.

## Credenciais e segredos

- Nunca commitar tokens, senhas, chaves de API, arquivos `.env` reais ou dumps com credenciais.
- Variáveis sensíveis devem ficar em `.env` local ou no mecanismo de secrets do ambiente.
- Conexões de banco e APIs usadas por DAGs devem passar por **Airflow Connections** ou **Airflow Variables**, não por strings hardcoded.
- Se uma credencial for commitada por acidente, notifique a equipe imediatamente e rotacione ou revogue a chave afetada.

## Credencial exposta no Git

Quando uma credencial aparece em qualquer commit, ela deve ser tratada como comprometida, mesmo que o arquivo já tenha sido removido da branch principal.

Fluxo recomendado:

1. Revogar ou rotacionar a credencial exposta.
2. Auditar uso recente da credencial no provedor afetado.
3. Remover o dado sensível do histórico com ferramenta apropriada e revisão dos mantenedores.
4. Coordenar force-push, quando a reescrita de histórico for necessária.
5. Orientar contribuidores a descartar clones antigos e clonar novamente o repositório.
6. Evitar push de branches antigas que possam reintroduzir o histórico contaminado.

!!! warning "Importante"
    Mascarar uma credencial no estado atual do código não encerra o incidente se ela continua válida ou presente no histórico. A rotação ou revogação vem antes da limpeza do Git.

Endpoints públicos de APIs não são tratados como segredos por padrão. Tokens, senhas, certificados, chaves privadas, CPFs de serviço, connection strings com senha e client secrets devem ser tratados como segredos.

## Dados sensíveis

O GovHub pode processar dados de pessoal, dados financeiros e informações identificáveis. Ao desenvolver:

- não inclua dados reais em exemplos, fixtures, seeds ou prints;
- use dados sintéticos ou anonimizados em testes;
- trate campos como CPF, nome completo, dados bancários e dados funcionais com atenção;
- aplique mascaramento, hash ou restrição de acesso quando o dado bruto não for necessário para análise.

## Dependências

- Avalie a necessidade real antes de adicionar uma nova dependência.
- Prefira bibliotecas mantidas ativamente.
- Ao alterar `requirements.txt` ou `pyproject.toml`, verifique vulnerabilidades conhecidas com ferramentas como `pip audit`, quando disponível.

## Revisão

PRs com impacto em segurança, credenciais, dados sensíveis ou controle de acesso devem receber atenção reforçada no review. Quando houver dúvida, trate como mudança crítica e peça revisão adicional.
