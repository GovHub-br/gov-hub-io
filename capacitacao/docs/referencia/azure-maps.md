# Azure Maps (Power BI)

> Tipo: **Referência**

## Resumo

O Azure Maps é a visualização geoespacial avançada do Power BI. Além dos recursos tradicionais de
mapas, oferece funcionalidades para análise espacial: diferentes camadas de informação, agrupamentos
geográficos e visualizações interativas.

Enquanto gráficos tradicionais respondem sobre quantidade, comparação ou tendência, o Azure Maps
acrescenta a dimensão do **espaço geográfico**.

## Quando utilizar

Quando a localização tem influência direta na interpretação dos dados — especialmente em análises que
envolvem cidades, estados, regiões, endereços ou coordenadas.

*Exemplos:* atendimentos por município; cobertura de serviços; distribuição de pessoas usuárias;
ocorrências georreferenciadas; monitoramento territorial; logística e deslocamentos.

Sempre que a pergunta envolver **"onde?"**, o Azure Maps pode agregar valor.

## Exemplos de análise

- Analisar quais municípios concentram o maior volume de atendimentos.
- Visualizar a distribuição por estado ou região, identificando áreas de maior demanda.
- Compreender a distribuição de deslocamentos, tempos ou cobertura operacional.
- Identificar regiões com baixa cobertura ou locais que exigem maior atenção da gestão.

Em todos esses casos, a localização deixa de ser apenas um atributo dos dados e passa a fazer parte da
análise.

## Recursos além do mapa tradicional

- Heat Maps (mapas de calor);
- múltiplas camadas geográficas;
- agrupamento automático de pontos;
- rotas e trajetos;
- áreas de influência;
- diferentes estilos de mapa;
- análises espaciais mais complexas.

## Boas práticas

**Use mapas somente quando a localização for relevante.** Se a análise não depende da localização,
outras visualizações costumam ser mais eficientes.

**Escolha a camada geográfica adequada.** Nem sempre é necessário o máximo nível de detalhamento: às
vezes estado basta, às vezes é preciso chegar a município ou bairro.

**Use cores e tamanhos de forma consistente.** Cores devem ter significado claro; o mesmo vale para
bolhas, marcadores e áreas destacadas.

**Combine o mapa com outros visuais.** Mapas funcionam melhor complementados por KPIs, tabelas ou
gráficos comparativos — é preciso compreender não apenas *onde* algo acontece, mas também sua
magnitude e impacto.

## Erros comuns

| Erro | Por quê |
|---|---|
| Usar mapas apenas por apelo visual | se a geografia não importa para a análise, o mapa adiciona complexidade sem valor |
| Exibir informação em excesso | muitos marcadores e camadas escondem os padrões que importam |
| Ignorar diferenças de densidade geográfica | regiões maiores ocupam mais espaço visual, induzindo a interpretações equivocadas sobre relevância |
| Substituir comparações simples por mapas | muitas vezes um gráfico de barras comunica melhor uma comparação entre regiões |

## Observações

O Azure Maps responde bem a uma pergunta que outras visualizações dificilmente respondem com a mesma
eficiência: **"onde isso está acontecendo?"**

Para a maioria dos dashboards gerenciais e executivos, Maps e Bubble Maps do Superset já são
suficientes. O Azure Maps se destaca quando a geografia é parte central da análise e as decisões
dependem de relações espaciais mais complexas.

## Veja também

- [Geoespacial: Maps e Bubble Maps](graficos-geoespaciais.md)
- [Mapas: Superset vs. Power BI](../pesquisa/mapas-superset-vs-power-bi.md)
