# Geoespacial: Maps e Bubble Maps

> Tipo: **Referência**

## Resumo

Algumas informações só fazem sentido quando analisadas junto com sua localização geográfica. Em muitos
cenários não basta saber **quanto** aconteceu — é necessário entender também **onde** aconteceu.

Mapas transformam coordenadas, cidades, estados ou regiões em visualizações fáceis de interpretar,
ajudando a identificar concentrações, vazios geográficos e padrões territoriais que seriam difíceis de
perceber em tabelas.

## Quando utilizar mapas

Quando a localização tem influência direta na interpretação dos dados.

*Exemplos:* atendimentos por município; demandas por estado; ocorrências georreferenciadas;
distribuição de unidades administrativas; cobertura de serviços.

O mapa adiciona **contexto geográfico** à análise. Sem essa necessidade, outros gráficos geralmente
serão mais eficientes.

## Maps (Superset) / Filled Map (Power BI)

Exibem informação associada a regiões geográficas específicas.

### Quando utilizar

Para responder perguntas como: onde ocorre maior concentração? Como os resultados se distribuem no
território? Quais regiões apresentam melhor desempenho? Existem áreas com comportamentos semelhantes?

*Exemplos:* atendimentos por município; solicitações por região; cobertura de programas públicos.

### Exemplo de análise

Em um painel com o total de atendimentos por município, uma tabela apresentaria todos os valores. O
mapa permite visualizar imediatamente municípios com maior demanda, concentração regional, áreas com
baixa utilização do serviço e possíveis desigualdades territoriais.

### Principais vantagens

- facilita a compreensão territorial;
- evidencia concentrações geográficas;
- identifica lacunas de cobertura;
- permite colorir áreas por intensidade.

## Bubble Maps

Usam círculos proporcionais para representar valores sobre um mapa. Quanto maior o valor, maior a
bolha. Permitem visualizar simultaneamente localização, volume e concentração.

### Quando utilizar

- comparar volumes entre localidades;
- destacar pontos de maior relevância;
- visualizar concentração de eventos;
- analisar distribuição de recursos.

*Exemplos:* número de atendimentos por município; quantidade de pessoas usuárias por cidade; demandas
registradas por unidade.

### Exemplo de análise

Em uma organização com unidades distribuídas por todo o estado, o Bubble Map permite identificar
rapidamente quais cidades concentram mais atendimentos, quais localidades têm baixa utilização e onde
estão os principais polos de demanda.

### Principais vantagens

- combina localização e volume na mesma visualização;
- permite comparações geográficas rápidas;
- facilita a identificação de concentrações.

## Maps ou Bubble Maps?

| Use **Maps** quando o foco for | Use **Bubble Maps** quando o foco for |
|---|---|
| distribuição territorial | comparação de volumes |
| cobertura geográfica | intensidade de ocorrências |
| análise por regiões administrativas | concentração de eventos |
| *Ex.:* indicadores por município, cobertura de serviços | *Ex.:* atendimentos por cidade, solicitações por localidade |

## Boas práticas

**Use mapas apenas quando a geografia for relevante.** Se a localização não influencia a análise,
gráficos de barras normalmente serão mais simples e eficientes.

> *Atendimentos por município* → o mapa pode ser útil.
> *Atendimentos por setor interno* → o mapa não agrega valor.

**Evite excesso de informação simultânea.** Muitos pontos, cores e camadas dificultam a leitura.

**Considere a densidade das regiões.** Em áreas com muitas localidades próximas, bolhas e marcadores
podem se sobrepor; filtros e níveis de zoom melhoram a experiência.

**Use cores de forma consistente.** Uma escala simples e intuitiva produz melhores resultados do que
múltiplas cores sem significado claro.

## Erros comuns

| Erro | Por quê |
|---|---|
| Usar mapas só porque parecem interessantes | muitas análises são compreendidas mais rápido em barras ou tabelas resumidas |
| Exibir dados sem contexto geográfico | se a localização não influencia a decisão, o mapa só adiciona complexidade |
| Excesso de localidades | mapas com centenas de pontos ficam ilegíveis; use agrupamentos, filtros e detalhamento progressivo |

## Observações

Um bom mapa não existe para decorar o dashboard. Ele existe para revelar padrões geográficos,
concentrações e oportunidades difíceis de perceber em listas de números.

## Veja também

- [Azure Maps (Power BI)](azure-maps.md)
- [Mapas: Superset vs. Power BI](../pesquisa/mapas-superset-vs-power-bi.md)
