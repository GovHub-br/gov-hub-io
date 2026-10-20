# Visuais avançados do Power BI: Funnel, Decomposition Tree e Waterfall

> Tipo: **Referência**

## Resumo

Três visuais do Power BI sem equivalente nativo no Superset. Cada um responde a um tipo de pergunta que
os visuais tradicionais não cobrem bem: onde o processo perde volume, o que explica um resultado, e o
que somou e subtraiu até chegar ao valor final.

---

## Funnel

Representa **etapas sequenciais de um processo** e mostra como um volume inicial se transforma ao
longo de uma jornada até o resultado final. Evidencia conversões e perdas entre etapas, ajudando a
identificar gargalos e pontos de abandono.

Diferente dos gráficos de comparação, que analisam categorias independentes, o Funnel representa um
fluxo onde cada etapa **depende da anterior**.

### Quando utilizar

Quando existe uma sequência lógica e ordenada de etapas pelas quais pessoas, documentos, solicitações
ou processos precisam passar.

*Exemplos:* jornada de atendimento; processo seletivo; aprovação de solicitações; cadastro de pessoas
usuárias; fluxos administrativos; processos de fiscalização ou auditoria.

Sempre que houver uma pergunta sobre conversão, aprovação ou evolução entre etapas, o Funnel pode ser
uma boa escolha.

### Exemplos de análise

Uma área de recrutamento visualiza quantas pessoas candidatas passam pelas etapas de inscrição,
triagem, entrevista e contratação. Em atendimento, o gráfico acompanha solicitações recebidas,
analisadas, aprovadas e concluídas.

Em ambos os casos o objetivo é identificar em qual ponto ocorre a maior redução do volume e direcionar
ações.

### Principais vantagens

- identificação rápida de gargalos;
- visualização clara das perdas entre etapas;
- facilidade para acompanhar taxas de conversão;
- comunicação simples para públicos não técnicos.

### Boas práticas

**Use apenas etapas sequenciais.** Cada nível deve representar continuidade do processo.

**Organize as etapas na ordem correta.** O fluxo deve seguir a ordem da operação real.

**Monitore taxas de conversão.** Os percentuais de avanço costumam informar mais do que o número bruto.

**Mantenha apenas etapas relevantes.** Excesso de etapas dificulta identificar os principais problemas.

### Erros comuns

| Erro | Por quê |
|---|---|
| Usar Funnel para comparar categorias | regiões e equipes independentes pedem gráficos de barras |
| Criar etapas sem relação entre si | sem continuidade, o conceito de funil perde sentido |
| Exibir muitas etapas | funis longos reduzem a clareza |
| Ignorar os motivos das perdas | identificar a redução é o primeiro passo; o valor está em investigar as causas |

---

## Decomposition Tree

A Árvore de Decomposição investiga a **composição de um indicador** e identifica os fatores que mais
influenciam um resultado.

Enquanto a maioria dos gráficos responde *"o que aconteceu?"*, a Árvore de Decomposição ajuda a
responder *"por que aconteceu?"*. Ela permite explorar um indicador em diferentes níveis de
detalhamento — região, unidade, categoria, equipe — revelando gradualmente os elementos que o compõem.

### Quando utilizar

Quando é preciso entender as causas de um resultado, especialmente quando um indicador agregado
levanta questionamentos.

*Exemplos:* queda no número de atendimentos; aumento das despesas; redução da produtividade; aumento
do tempo médio de resposta; mudanças inesperadas nos indicadores.

Sempre que a pergunta for *"o que está causando esse resultado?"*.

### Exemplos de análise

A partir do total de atendimentos de um período, é possível explorar por região, depois por unidade,
depois por equipe e, finalmente, por pessoa atendente.

Uma área financeira pode investigar uma despesa total identificando quais departamentos, projetos ou
categorias de gasto mais contribuíram para o valor.

### Principais vantagens

- facilita análises exploratórias;
- ajuda a identificar causas de problemas ou oportunidades;
- permite aprofundar sem criar vários gráficos diferentes;
- organiza a informação de forma hierárquica e intuitiva.

### Boas práticas

**Comece pelo indicador principal.** Quanto mais relevante o indicador, maior o valor da investigação.

**Use dimensões que façam sentido.** Os níveis devem representar fatores realmente capazes de explicar
o resultado: região, unidade, equipe, categoria, canal de atendimento.

**Mantenha uma hierarquia clara.** Quanto mais natural a sequência, mais fácil interpretar.

**Use para investigação, não para monitoramento.** É mais eficiente para descoberta de causas do que
para acompanhamento diário.

### Erros comuns

| Erro | Por quê |
|---|---|
| Usar muitas dimensões simultaneamente | níveis em excesso escondem os fatores que importam |
| Explorar dimensões sem relação com o problema | nem toda categoria ajuda a explicar um resultado |
| Usar para acompanhamento rotineiro | para monitoramento contínuo, indicadores e gráficos tradicionais são mais eficientes |
| Buscar apenas confirmações | a ferramenta serve também para descobrir fatores inesperados |

---

## Waterfall

O Gráfico de Cascata mostra como diferentes **aumentos e reduções** contribuem para a formação de um
resultado final. Em vez de apresentar apenas o valor inicial e o final, evidencia cada etapa
intermediária.

Responde a perguntas como: o que contribuiu para o crescimento? Quais fatores causaram redução? Como
chegamos ao valor final? Qual foi o impacto de cada componente?

### Quando utilizar

Quando há interesse em entender a composição de uma variação ou a construção de um resultado ao longo
de contribuições positivas e negativas.

*Exemplos:* variação orçamentária; evolução de despesas; crescimento ou redução de pessoas atendidas;
alterações de estoque; mudanças em indicadores operacionais.

### Exemplos de análise

Uma área financeira demonstra como a receita do período foi impactada por novas entradas, descontos,
cancelamentos e receitas adicionais.

Uma organização analisa a evolução do orçamento, evidenciando quais departamentos aumentaram ou
reduziram gastos.

### Principais vantagens

- facilita o entendimento de ganhos e perdas;
- mostra a contribuição individual de cada fator;
- explica mudanças de forma visual e intuitiva;
- melhora a comunicação de análises financeiras e operacionais.

### Boas práticas

**Use uma sequência lógica.** A leitura precisa permitir compreender naturalmente como o resultado foi
construído.

**Destaque ganhos e perdas.** Cores consistentes para contribuições positivas e negativas.

**Limite a quantidade de componentes.** Priorize os fatores mais relevantes.

**Forneça contexto.** Informação complementar ajuda a interpretar as contribuições observadas.

### Erros comuns

| Erro | Por quê |
|---|---|
| Usar para comparar categorias | regiões e departamentos independentes pedem barras |
| Exibir muitos componentes | a sequência fica difícil de interpretar |
| Misturar fatores sem relação | os componentes devem fazer parte da construção do mesmo resultado |
| Não destacar o resultado final | se o valor final não está claro, a leitura perde eficiência |

## Veja também

- [Guia rápido: pergunta → gráfico](guia-rapido-pergunta-para-grafico.md)
- [Azure Maps (Power BI)](azure-maps.md)
