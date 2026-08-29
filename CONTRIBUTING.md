# Gov Hub BR — Guia de Contribuição

Antes de tudo, obrigado por considerar contribuir com o **Gov Hub BR**.  
Acreditamos que colaboração e transparência são pilares essenciais para construir soluções públicas mais eficientes e sustentáveis.

O **Gov Hub BR** é um projeto **open source** com o propósito de transformar dados públicos em **ativos estratégicos** para a administração pública e a sociedade.  
Toda contribuição é bem-vinda — seja código, documentação, ideias ou feedback.

---

## Como Contribuir

### 1. Faça um fork do repositório

Clique em “Fork” no canto superior direito da página do projeto e clone o repositório no seu ambiente local:

```bash
git clone https://github.com/seu-usuario/govhub-br.git
cd govhub-br
```

### 2. Crie uma branch

Crie uma branch com um nome descritivo:

```bash
git checkout -b minha-contribuicao
```

Exemplos:

- `ajuste-na-doc`
- `feature-nova-transformacao`
- `fix-corrige-erros`

### 3. Faça suas alterações

Você pode contribuir de diversas formas:

- Melhorias no código ou pipelines de dados
- Ajustes ou acréscimos na documentação
- Sugestões de novas funcionalidades
- Correções de erros ou inconsistências

Teste e valide sua contribuição antes de enviar.

---

# Padrões do Projeto

Este documento define as boas práticas para garantir qualidade, consistência e colaboração eficiente no desenvolvimento do projeto.

---

## Padrões de Issue

### Objetivo de uma Issue

Uma Issue deve:

- Descrever claramente o problema, tarefa ou sugestão

- Contextualizar por que isso é importante

- Permitir que qualquer pessoa consiga assumir a tarefa

- Servir como referência para Pull Requests futuros

- Issues bem estruturadas ajudam a equipe a priorizar, discutir e resolver demandas com mais eficiência.

### Template Oficial de Issue

Todo envio de issue deve seguir o template padrão do repositório:

[Template de Issue](.github/ISSUE_TEMPLATE/issue-template.md)

### Boas práticas gerais

- Use títulos claros e específicos
Ex.: "Erro 500 ao buscar emendas sem parâmetro de ano", e não "Bug no endpoint".

- Adicione labels adequados
(bug, enhancement, documentation, good first issue, etc.)

- Inclua contexto e referências, como PRs, erros de log, links de dados.

- Se houver dependências, mencione:
“Depende da issue #42”

- Evite criar issues duplicadas
Sempre pesquise antes de abrir uma nova.

- Se a issue tiver impacto relevante, indique na descrição.

## Padrões de Commit

As mensagens de commit devem ser claras, consistentes e descritivas, facilitando o histórico e o rastreamento de mudanças.

### Formato Padrão

```bash
tipo(escopo): descrição breve
```

### Exemplos

- `feat(api): adiciona endpoint para dados abertos`
- `fix(pipeline): corrige erro no processamento`
- `docs: melhora guia de contribuição`

### Tipos Recomendados

| Tipo       | Descrição                                    |
| ---------- | -------------------------------------------- |
| `feat`     | Nova funcionalidade                          |
| `fix`      | Correção de bug                              |
| `docs`     | Alterações na documentação                   |
| `chore`    | Tarefas de manutenção                        |
| `refactor` | Melhorias internas sem alterar comportamento |

Dica: Prefira mensagens curtas e no imperativo, como “adiciona”, “corrige”, “melhora”.

---

## Padrões de Branch

As branches devem seguir uma convenção clara que indique o propósito da alteração.

### Convenção sugerida

```
feature/nome-da-feature
fix/nome-da-correção
docs/nome-da-doc
```

### Exemplo

```
feature/novo-dashboard
```

Utilize nomes descritivos, sempre em minúsculo e com hífens para separar palavras.

---

## Padrões de Pull Request

### Objetivo de um PR

Um Pull Request deve comunicar de forma clara:

- O que foi alterado

- Por que foi alterado

- Como foi alterado (quando relevante)

- Quais impactos podem ocorrer

- Como validar/testar a alteração

O PR deve permitir que qualquer pessoa, mesmo sem contexto prévio, consiga revisar e entender a contribuição.

### Template Oficial de Pull Request

Todo PR deve obrigatoriamente utilizar o template oficial do repositório:

[Template de PR](.github/ISSUE_TEMPLATE/PULL_REQUEST_TEMPLATE.md)

### Não abra PRs que:

- Possuem erros conhecidos ou código não testado

- Alteram funcionalidades sem explicação

- Não seguem o template obrigatório

- Contêm múltiplas mudanças não relacionadas

- Possuem commits temporários como “WIP”, “teste”, “quick fix”, etc.

### Boas práticas gerais

- PRs pequenos são mais fáceis de revisar.
Evite misturar múltiplos assuntos.

- Sempre relacione a issue correspondente, quando existir.
Use: resolve #123.

- Evite commits irrelevantes no PR.
Antes de abrir, faça squash ou limpe a branch, se necessário.

- Inclua evidências da mudança

- Garanta que o PR esteja claro para quem não participou da implementação.

---


## Testes

Os testes do projeto seguem o padrão **pytest**, garantindo a confiabilidade e estabilidade do código.  
Toda nova funcionalidade deve vir acompanhada de testes automatizados que validem seu comportamento.

### Tecnologias e Bibliotecas

Os testes utilizam:

- **pytest** → Framework principal para execução e estrutura dos testes.
- **unittest.mock (patch, MagicMock)** → Para simular dependências externas e chamadas de API.
- **importlib.reload** → Para recarregar módulos e validar carregamento de variáveis de ambiente.
- **os / sys** → Para manipulação de caminhos e variáveis de ambiente durante os testes.

### Estrutura Recomendada

Os arquivos de teste ficam em `tests/` e seguem o formato:

```
tests/
├── cliente_emendas/
│   └── test_cliente_emendas.py
```

Cada arquivo deve conter uma **classe de testes** (`TestNomeDaClasse`) e métodos nomeados com o prefixo `test_`.

Exemplo:

```python
class TestClienteEmendas:
    """Testes para a classe ClienteEmendas."""

    def setup_method(self):
        """Configuração inicial."""
        self.cliente = ClienteEmendas()

    def test_init(self):
        """Testa inicialização do cliente."""
        assert self.cliente.base_url == "https://api.portaldatransparencia.gov.br"
```

### Boas Práticas

- **Um cenário por teste**: cada método `test_` deve validar apenas um comportamento.
- **Use mocks sempre que houver dependências externas**, como chamadas de API (`@patch`).
- **Inclua mensagens de docstring** explicando o propósito de cada teste.
- **Cubra casos de sucesso e falha** — inclusive comportamentos inesperados (ex: respostas vazias, erros da API).
- **Evite dependências entre testes**: use `setup_method` ou `fixtures` para preparar o ambiente.

### Executando os Testes

Para rodar todos os testes:

```bash
pytest -v
```

Para gerar relatório de cobertura:

```bash
pytest --cov=airflow_lappis --cov-report=term-missing
```

Para executar apenas uma classe ou método específico:

```bash
pytest tests/cliente_emendas/test_cliente_emendas.py::TestClienteEmendas::test_get_emendas_success
```

### Integração Contínua

Nos pipelines CI/CD, recomenda-se adicionar:

```bash
pytest --maxfail=1 --disable-warnings -q
```

Isso garante que falhas sejam detectadas rapidamente e que a saída de logs seja limpa.

---

## Contato e Suporte

Tem dúvidas, sugestões ou quer contribuir?  
Entre em contato com o time do projeto pelos canais oficiais:

**Instagram:** [@lab.livre](https://www.instagram.com/lab.livre/)  
**Issues:** Abra uma issue diretamente no repositório para reportar problemas ou sugerir melhorias.

---

## Contribuições

Contribuições pequenas e bem descritas são sempre bem-vindas!  
Cada melhoria ajuda a tornar os dados públicos mais úteis, acessíveis e transparentes para todos.
