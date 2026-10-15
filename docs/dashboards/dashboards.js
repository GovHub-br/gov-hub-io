// ========================================
// DASHBOARDS PAGE - JAVASCRIPT FILE
// ========================================

// Fonte da IDV nos rótulos desenhados em canvas
if (window.Chart) Chart.defaults.font.family = "'Reddit Sans', sans-serif";

// Função para criar o gráfico de rosca
function createBudgetChart() {
    const ctx = document.getElementById('budgetChart');
    if (!ctx) return;
    
    // Destruir gráfico existente se houver
    destroyChartIfExists('budgetChart');

    const palette = ['#613EFF', '#3F28A6', '#9C88FF', '#0A005A', '#BE006E', '#E57AB4', '#C9BFFF', '#5A5670', '#D9D2FF', '#8B72FF', '#F2A7CF'];

    function formatMillions(value) {
        const m = value / 1_000_000;
        return m.toFixed(1).replace('.', ',') + 'M';
    }

    function updateBudgetLegend(labels, values) {
        const chartCard = ctx.closest('.chart-card');
        if (!chartCard) return;
        const legend = chartCard.querySelector('.chart-legend');
        if (!legend) return;

        const legendItems = Array.from(legend.querySelectorAll('.legend-item'));
        const count = Math.min(legendItems.length, labels.length, values.length);

        for (let i = 0; i < count; i++) {
            const item = legendItems[i];
            const textEl = item.querySelector('.legend-text');
            if (!textEl) continue;
            const formatted = formatMillions(values[i]);
            const fullLabel = labels[i] || '';
            const limit = 45;
            const truncated = fullLabel.length > limit ? `${fullLabel.slice(0, limit)}…` : fullLabel;
            textEl.innerHTML = `<span class="legend-number">${formatted}</span> ${truncated}`;
            textEl.classList.add('has-tooltip');
            textEl.setAttribute('data-full', fullLabel);
        }
    }

    function renderChart(labels, values) {
        const backgroundColor = palette.slice(0, labels.length);
        const chartData = {
            labels: labels,
            datasets: [{
                data: values.map(v => v / 1_000_000),
                backgroundColor: backgroundColor,
                borderWidth: 0,
                cutout: '60%'
            }]
        };

        const config = {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: getTooltipConfig('Distribuição de Orçamento')
                },
                elements: { arc: { borderWidth: 0 } }
            }
        };

        new Chart(ctx, config);

        const totalMillions = values.reduce((sum, v) => sum + (v / 1_000_000), 0);
        updateChartTotal('budgetChart', Math.round(totalMillions));

        updateBudgetLegend(labels, values);
    }

    const dataUrl = '../land/public/data/orcamento_por_acao.json';
    const urlWithBust = `${dataUrl}?v=${Date.now()}`;

    fetch(urlWithBust, { cache: 'no-store' })
        .then(resp => {
            if (!resp.ok) throw new Error('fetch not ok');
            return resp.json();
        })
        .then(json => {
            const labels = json.map(item => item.descricao);
            const values = json.map(item => Number(item.valor) || 0);
            renderChart(labels, values);
        })
        .catch(() => {
            const labels = [
                'Ativos civis da união',
                'Aposentadorias e pensões civis da união',
                'Administração da unidade',
                'Contribuição da união de suas autarquias e fundações para o',
                'Concessão de bolsas para pesquisa economica',
                'Benefícios obrigatorios aos servidores civis, empregados, mi',
                'Exercício da presidência dos Brics pelo brasil',
                'Assistencia medica e odontologica aos servidores civis, empr...'
            ];
            const values = [262_000_000, 253_000_000, 73_200_000, 44_600_000, 8_870_000, 3_740_000, 2_380_000, 2_280_000];
            renderChart(labels, values);
        });
}

// Tooltip HTML externo (evita ficar atrás do texto central)
function externalDoughnutTooltipHandler(context) {
    const { chart, tooltip } = context;
    // Criar elemento do tooltip se não existir
    let tooltipEl = chart.canvas.parentNode.querySelector('.chartjs-external-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'chartjs-external-tooltip';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.transform = 'translate(-50%, -100%)';
        tooltipEl.style.zIndex = '9999';
        tooltipEl.style.minWidth = '120px';
        tooltipEl.style.maxWidth = '280px';
        tooltipEl.style.background = '#0A005A';
        tooltipEl.style.color = '#FFFFFF';
        tooltipEl.style.border = '1px solid #613EFF';
        tooltipEl.style.borderRadius = '8px';
        tooltipEl.style.padding = '8px 10px';
        tooltipEl.style.fontFamily = "'Reddit Sans', sans-serif";
        tooltipEl.style.fontSize = '12px';
        tooltipEl.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)';
        tooltipEl.style.whiteSpace = 'nowrap';
        tooltipEl.style.opacity = '0';
        chart.canvas.parentNode.appendChild(tooltipEl);
    }

    // Esconder se não ativo
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = '0';
        return;
    }

    // Conteúdo
    if (tooltip.body) {
        const titleLines = tooltip.title || [];
        const bodyLines = tooltip.body.map(b => b.lines);
        tooltipEl.innerHTML = '';

        const title = document.createElement('div');
        title.style.fontWeight = '600';
        title.style.marginBottom = '4px';
        title.textContent = titleLines.join(' ');
        tooltipEl.appendChild(title);

        bodyLines.forEach((body) => {
            const div = document.createElement('div');
            div.textContent = body.join(' ');
            tooltipEl.appendChild(div);
        });
    }

    // Posição
    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    const caret = tooltip.caretX !== undefined ? tooltip.caretX : 0;
    const baseX = positionX + caret;
    const baseY = positionY + (tooltip.caretY || 0) - 12;

    tooltipEl.style.left = baseX + 'px';
    tooltipEl.style.top = baseY + 'px';
    tooltipEl.style.opacity = '1';
}

// Função auxiliar para destruir gráfico existente antes de criar um novo
function destroyChartIfExists(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Verificar se há gráfico armazenado no canvas
    if (canvas.chart) {
        canvas.chart.destroy();
        canvas.chart = null;
    }
    
    // Verificar se Chart.js tem método getChart para obter instância existente
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
    }
}

// Função para inicializar funcionalidades específicas da página de dashboards
function initDashboards() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createBudgetChart();
            createAposentadoriasChart();
        });
    } else {
        createBudgetChart();
        createAposentadoriasChart();
    }
}

// Função para atualizar o total do gráfico
function updateChartTotal(chartId, totalValue) {
    const totalElement = document.querySelector(`#${chartId}`).parentElement.querySelector('.chart-total-number');
    if (totalElement) {
        totalElement.textContent = totalValue + 'M';
    }
}

// Função para criar configuração padrão de tooltip
function getTooltipConfig(title) {
    return {
        enabled: false, // desativa tooltip padrão (canvas)
        external: externalDoughnutTooltipHandler, // usa HTML externo para sobrepor o centro
        backgroundColor: '#0A005A',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        padding: 16,
        cornerRadius: 8,
        displayColors: true,
        borderColor: '#613EFF',
        borderWidth: 1,
        titleFont: {
            size: 14,
            weight: '600',
            family: 'Inter'
        },
        bodyFont: {
            size: 13,
            weight: '400',
            family: 'Inter'
        },
        callbacks: {
            title: function(context) {
                return title;
            },
            label: function(context) {
                const value = context.parsed;
                if (typeof value === 'number') {
                    return 'Valor: ' + value.toLocaleString('pt-BR') + 'M';
                }
                return 'Valor: ' + value;
            }
        }
    };
}

// Carregar KPIs orçamentários a partir do JSON público
function loadBudgetKpis() {
    const dataUrl = '../land/public/data/visao_orcamentaria_total_ipea.json';
    const urlWithBust = `${dataUrl}?v=${Date.now()}`;

    function formatMillions(value) {
        const millions = (Number(value) || 0) / 1_000_000;
        return millions.toFixed(1).replace('.', ',') + 'M';
    }

    function setValue(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = formatMillions(value);
        }
    }

    fetch(urlWithBust, { cache: 'no-store' })
        .then(resp => {
            if (!resp.ok) throw new Error('fetch not ok');
            return resp.json();
        })
        .then(json => {
            const row = Array.isArray(json) ? json[0] : json;
            if (!row) return;
            setValue('total-budget', row.orcamento_total);
            setValue('teds-budget', row.orcamento_recebido_teds);
            setValue('agency-budget', row.dotacao_atualizada);
            setValue('allocated-budget', row.orcamento_empenhado);
            setValue('unused-budget', row.orcamento_a_liquidar);
            setValue('programmed-expenses', row.despesas_a_pagar);
            setValue('paid-expenses', row.despesas_pagas);
        })
        .catch(() => {
            // mantém valores existentes se falhar
        });
}

// Carregar KPIs de contratos a partir do JSON público
function loadContractsKpis() {
    const dataUrl = '../land/public/data/orcamento_contratos.json';
    const urlWithBust = `${dataUrl}?v=${Date.now()}`;

    function formatCurrency(value) {
        return (Number(value) || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function setValue(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = formatCurrency(value);
        }
    }

    fetch(urlWithBust, { cache: 'no-store' })
        .then(resp => {
            if (!resp.ok) throw new Error('fetch not ok');
            return resp.json();
        })
        .then(json => {
            setValue('contratos-alocado-empenhado', json.orcamento_alocado_empenhado);
            setValue('contratos-saldo-empenho', json.saldo_de_empenho_a_liquidar);
            setValue('contratos-despesas-pagas', json.despesas_pagas);
        })
        .catch(() => {
            // mantém valores existentes se falhar
        });
}

// Carregar gráfico de barras dos maiores contratos
function loadContractsBars() {
    const dataUrl = '../land/public/data/10_maiores_contratos_natureza_despesa.json';
    const urlWithBust = `${dataUrl}?v=${Date.now()}`;

    function formatValue(value) {
        const num = Number(value) || 0;
        if (num >= 1000000) {
            const millions = num / 1000000;
            // Mostrar 2 casas decimais para valores em milhões para maior precisão
            return millions.toFixed(2).replace('.', ',') + 'M';
        } else if (num >= 1000) {
            const thousands = num / 1000;
            // Mostrar 1 casa decimal para valores em milhares
            return thousands.toFixed(1).replace('.', ',') + 'k';
        }
        return num.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function getNaturezaDespesa(item) {
        // Determina qual natureza de despesa tem valor
        if (item.locacao_de_mao_de_obra) return 'Locação de mão de obra';
        if (item.outros_servicos_de_terceiros_pj) return 'Outros serviços de terceiros - Pessoa Jurídica';
        if (item.passagens_e_despesas_com_locomocao) return 'Passagens e despesas com locomoção';
        if (item.servicos_de_ti_pj) return 'Serviços de TI - Pessoa Jurídica';
        return 'Não especificado';
    }

    function getValorTotal(item) {
        return (item.locacao_de_mao_de_obra || 0) + 
               (item.outros_servicos_de_terceiros_pj || 0) + 
               (item.passagens_e_despesas_com_locomocao || 0) + 
               (item.servicos_de_ti_pj || 0);
    }

    function getCorNatureza(natureza) {
        const cores = {
            'Locação de mão de obra': '#613EFF',
            'Outros serviços de terceiros - Pessoa Jurídica': '#0A005A',
            'Passagens e despesas com locomoção': '#BE006E',
            'Serviços de TI - Pessoa Jurídica': '#9C88FF',
            'Não especificado': '#5A5670'
        };
        return cores[natureza] || '#5A5670';
    }

    fetch(urlWithBust, { cache: 'no-store' })
        .then(resp => {
            if (!resp.ok) throw new Error('fetch not ok');
            return resp.json();
        })
        .then(json => {
            const container = document.getElementById('contracts-bars-container');
            if (!container) return;

            // Ordenar por valor total (maior para menor)
            const sortedData = json
                .map(item => ({
                    ...item,
                    valorTotal: getValorTotal(item),
                    natureza: getNaturezaDespesa(item)
                }))
                .sort((a, b) => b.valorTotal - a.valorTotal);

            // Encontrar o valor máximo para calcular percentuais
            const maxValue = Math.max(...sortedData.map(item => item.valorTotal));

            // Limpar container
            container.innerHTML = '';

            // Criar barras dinamicamente
            sortedData.forEach((item, index) => {
                const percentage = (item.valorTotal / maxValue) * 100;
                const formattedValue = formatValue(item.valorTotal);
                const cor = getCorNatureza(item.natureza);

                const barItem = document.createElement('div');
                barItem.className = 'contracts-bar-item';
                barItem.innerHTML = `
                    <div class="contracts-bar-header">
                        <span class="contracts-bar-value">${formattedValue}</span>
                        <span class="contracts-bar-label">${item.fornecedor_nome}</span>
                    </div>
                    <div class="contracts-bar-track">
                        <div class="contracts-bar-fill" style="width: ${percentage.toFixed(1)}%; background-color: ${cor};"></div>
                    </div>
                `;

                container.appendChild(barItem);
            });
        })
        .catch(() => {
            // mantém valores existentes se falhar
        });
}

// Carregar KPIs de TEDs recebidos
function loadTedsRecebidosKpis() {
    const dataUrl = '../land/public/data/teds_recebidos.json';
    const urlWithBust = `${dataUrl}?v=${Date.now()}`;

    function formatCurrency(value) {
        return (Number(value) || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function setValue(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
        }
    }

    fetch(urlWithBust, { cache: 'no-store' })
        .then(resp => {
            if (!resp.ok) throw new Error('fetch not ok');
            return resp.json();
        })
        .then(json => {
            setValue('teds-recebidos-total', json.teds_recebidos);
            setValue('teds-proximos-finalizar', json.teds_proximos_finalizar);
            setValue('teds-despesas-liquidar', formatCurrency(json.despesas_a_liquidar_teds));
        })
        .catch(() => {
            // mantém valores existentes se falhar
        });
}

// Carregar KPIs de TEDs enviados
function loadTedsEnviadosKpis() {
    const dataUrl = '../land/public/data/teds_enviados.json';
    const urlWithBust = `${dataUrl}?v=${Date.now()}`;

    function formatCurrency(value) {
        return (Number(value) || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function setValue(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = formatCurrency(value);
        }
    }

    fetch(urlWithBust, { cache: 'no-store' })
        .then(resp => {
            if (!resp.ok) throw new Error('fetch not ok');
            return resp.json();
        })
        .then(json => {
            setValue('teds-enviados-valor-firmado', json.valor_firmado);
            setValue('teds-enviados-destaque-orcamentario', json.destaque_orcamentario_enviado);
        })
        .catch((err) => {
            console.error('Erro ao carregar KPIs de TEDs enviados:', err);
        });
}


// Função para criar os gráficos de dashboard
function createDashboardCharts() {
    // Gráfico 1 - Aposentadorias, Reserva Remunerada e Reformas
    const retirementCtx = document.getElementById('retirementChart');
    if (retirementCtx) {
        // Dados do gráfico
        const retirementData = [
            { filled: 67, empty: 30 }, // Anel externo
            { filled: 67, empty: 30 },   // Anel médio
            { filled: 68, empty: 30 }    // Anel interno
        ];
        
        // Calcular total (soma dos valores preenchidos)
        const retirementTotal = retirementData.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(retirementCtx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [retirementData[0].filled, retirementData[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                    {
                        data: [retirementData[1].filled, retirementData[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                    {
                        data: [retirementData[2].filled, retirementData[2].empty],
                        backgroundColor: ['#0A005A', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: getTooltipConfig('Aposentadorias e Reformas')
                }
            }
        });
        
        // Atualizar o total automaticamente
        updateChartTotal('retirementChart', retirementTotal);
    }

    // Gráfico 2 - Vencimento e Vantagens Fixas - Pessoa civil
    const salaryCtx = document.getElementById('salaryChart');
    if (salaryCtx) {
        // Dados do gráfico
        const salaryData = [
            { filled: 87, empty: 30 }, // Anel externo
            { filled: 87, empty: 30 },   // Anel médio
            { filled: 86, empty: 30 }    // Anel interno
        ];
        
        // Calcular total (soma dos valores preenchidos)
        const salaryTotal = salaryData.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(salaryCtx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [salaryData[0].filled, salaryData[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                    {
                        data: [salaryData[1].filled, salaryData[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                    {
                        data: [salaryData[2].filled, salaryData[2].empty],
                        backgroundColor: ['#0A005A', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: getTooltipConfig('Vencimentos e Vantagens')
                }
            }
        });
        
        // Atualizar o total automaticamente
        updateChartTotal('salaryChart', salaryTotal);
    }

    // Gráfico 3 - A detalhar
    const detailCtx = document.getElementById('detailChart');
    if (detailCtx) {
        // Dados do gráfico
        const detailData = [
            { filled: 21, empty: 10 }, // Anel externo
            { filled: 21, empty: 10 },   // Anel médio
            { filled: 21, empty: 10 }    // Anel interno
        ];
        
        // Calcular total (soma dos valores preenchidos)
        const detailTotal = detailData.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(detailCtx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [detailData[0].filled, detailData[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                    {
                        data: [detailData[1].filled, detailData[1].empty],
                        backgroundColor: ['#BE006E', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                    {
                        data: [detailData[2].filled, detailData[2].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: getTooltipConfig('A Detalhar')
                }
            }
        });
        
        // Atualizar o total automaticamente
        updateChartTotal('detailChart', detailTotal);
    }

    // Gráfico 4 - Aposentadorias, Reserva Remunerada e Reformas
    const retirementChart2Ctx = document.getElementById('retirementChart2');
    if (retirementChart2Ctx) {
        const retirementChart2Data = [
            { filled: 101, empty: 56 }, // Anel externo
            { filled: 101, empty: 56 },   // Anel médio
        ];
        const retirementChart2Total = retirementChart2Data.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(retirementChart2Ctx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [retirementChart2Data[0].filled, retirementChart2Data[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '50%'
                    },
                    {
                        data: [retirementChart2Data[1].filled, retirementChart2Data[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: getTooltipConfig('Aposentadorias e Reformas')
                }
            }
        });
        updateChartTotal('retirementChart2', retirementChart2Total);
    }

    // Gráfico 5 - Vencimento e Vantagens Fixas - Pessoa civil
    const salaryChart2Ctx = document.getElementById('salaryChart2');
    if (salaryChart2Ctx) {
        const salaryChart2Data = [
            { filled: 101, empty: 56 }, // Anel externo
            { filled: 101, empty: 56 },   // Anel médio
        ];
        const salaryChart2Total = salaryChart2Data.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(salaryChart2Ctx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [salaryChart2Data[0].filled, salaryChart2Data[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '50%'
                    },
                    {
                        data: [salaryChart2Data[1].filled, salaryChart2Data[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: getTooltipConfig('Vencimentos e Vantagens')
                }
            }
        });
        updateChartTotal('salaryChart2', salaryChart2Total);
    }

    // Gráfico 6 - Concessão de Bolsas para Pesquisa
    const scholarshipCtx = document.getElementById('scholarshipChart');
    if (scholarshipCtx) {
        const scholarshipData = [
            { filled: 101, empty: 56 }, // Anel externo
            { filled: 101, empty: 56 },   // Anel médio
        ];
        const scholarshipTotal = scholarshipData.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(scholarshipCtx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [scholarshipData[0].filled, scholarshipData[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '50%'
                    },
                    {
                        data: [scholarshipData[1].filled, scholarshipData[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: getTooltipConfig('Concessão de Bolsas')
                }
            }
        });
        updateChartTotal('scholarshipChart', scholarshipTotal);
    }

    // Gráfico 7 - Aposentadorias, Reserva Remunerada e Reformas
    const retirementChart3Ctx = document.getElementById('retirementChart3');
    if (retirementChart3Ctx) {
        const retirementChart3Data = [
            { filled: 101, empty: 56 }, // Anel externo
            { filled: 101, empty: 56 },   // Anel médio
        ];
        const retirementChart3Total = retirementChart3Data.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(retirementChart3Ctx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [retirementChart3Data[0].filled, retirementChart3Data[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '50%'
                    },
                    {
                        data: [retirementChart3Data[1].filled, retirementChart3Data[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: getTooltipConfig('Aposentadorias e Reformas')
                }
            }
        });
        updateChartTotal('retirementChart3', retirementChart3Total);
    }

    // Gráfico 8 - Aposentadorias, Reserva Remunerada e Reformas
    const retirementChart4Ctx = document.getElementById('retirementChart4');
    if (retirementChart4Ctx) {
        const retirementChart4Data = [
            { filled: 101, empty: 56 }, // Anel externo
            { filled: 101, empty: 56 },   // Anel médio
        ];
        const retirementChart4Total = retirementChart4Data.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(retirementChart4Ctx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [retirementChart4Data[0].filled, retirementChart4Data[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '50%'
                    },
                    {
                        data: [retirementChart4Data[1].filled, retirementChart4Data[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: getTooltipConfig('Aposentadorias e Reformas')
                }
            }
        });
        updateChartTotal('retirementChart4', retirementChart4Total);
    }

    // Gráfico 9 - Vencimento e Vantagens Fixas - Pessoa civil
    const salaryChart3Ctx = document.getElementById('salaryChart3');
    if (salaryChart3Ctx) {
        const salaryChart3Data = [
            { filled: 101, empty: 56 }, // Anel externo
            { filled: 101, empty: 56 },   // Anel médio
        ];
        const salaryChart3Total = salaryChart3Data.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(salaryChart3Ctx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [salaryChart3Data[0].filled, salaryChart3Data[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '50%'
                    },
                    {
                        data: [salaryChart3Data[1].filled, salaryChart3Data[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: getTooltipConfig('Vencimentos e Vantagens')
                }
            }
        });
        updateChartTotal('salaryChart3', salaryChart3Total);
    }

    // Gráfico 10 - Vencimento e Vantagens Fixas - Pessoa civil
    const salaryChart4Ctx = document.getElementById('salaryChart4');
    if (salaryChart4Ctx) {
        const salaryChart4Data = [
            { filled: 101, empty: 56 }, // Anel externo
            { filled: 101, empty: 56 },   // Anel médio
        ];
        const salaryChart4Total = salaryChart4Data.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(salaryChart4Ctx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [salaryChart4Data[0].filled, salaryChart4Data[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '50%'
                    },
                    {
                        data: [salaryChart4Data[1].filled, salaryChart4Data[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: getTooltipConfig('Vencimentos e Vantagens')
                }
            }
        });
        updateChartTotal('salaryChart4', salaryChart4Total);
    }

    // Gráfico 11 - [A detalhar]
    const detailChart2Ctx = document.getElementById('detailChart2');
    if (detailChart2Ctx) {
        const detailChart2Data = [
            { filled: 101, empty: 56 }, // Anel externo
            { filled: 101, empty: 56 },   // Anel médio
        ];
        const detailChart2Total = detailChart2Data.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(detailChart2Ctx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [detailChart2Data[0].filled, detailChart2Data[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '50%'
                    },
                    {
                        data: [detailChart2Data[1].filled, detailChart2Data[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: getTooltipConfig('A Detalhar')
                }
            }
        });
        updateChartTotal('detailChart2', detailChart2Total);
    }

    // Gráfico 12 - [A detalhar]
    const detailChart3Ctx = document.getElementById('detailChart3');
    if (detailChart3Ctx) {
        const detailChart3Data = [
            { filled: 101, empty: 56 }, // Anel externo
            { filled: 101, empty: 56 },   // Anel médio
        ];
        const detailChart3Total = detailChart3Data.reduce((sum, ring) => sum + ring.filled, 0);
        
        new Chart(detailChart3Ctx, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [detailChart3Data[0].filled, detailChart3Data[0].empty],
                        backgroundColor: ['#9C88FF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '50%'
                    },
                    {
                        data: [detailChart3Data[1].filled, detailChart3Data[1].empty],
                        backgroundColor: ['#613EFF', '#F2F1F6'],
                        borderWidth: 1,
                        borderColor: '#F2F1F6',
                        cutout: '60%'
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: getTooltipConfig('A Detalhar')
                }
            }
        });
        updateChartTotal('detailChart3', detailChart3Total);
    }
}

// Função para atualizar a legenda do gráfico de contratos
function updateContractsLegend(labels, counts, percentages) {
    const chartCard = document.getElementById('contractsChart').closest('.chart-card');
    if (!chartCard) return;
    const legend = chartCard.querySelector('.chart-legend');
    if (!legend) return;

    const legendItems = Array.from(legend.querySelectorAll('.legend-item'));
    const count = Math.min(legendItems.length, labels.length, counts.length, percentages.length);

    for (let i = 0; i < count; i++) {
        const item = legendItems[i];
        const textEl = item.querySelector('.legend-text');
        if (!textEl) continue;
        
        const countValue = counts[i];
        const percentage = percentages[i];
        const label = labels[i];
        
        // Formatar percentual com 1 casa decimal
        const formattedPercentage = percentage.toFixed(1).replace('.', ',');
        
        textEl.innerHTML = `<span class="legend-number">${formattedPercentage}%</span> ${label}`;
    }
}

// Função para criar o gráfico de contratos
function createContractsChart() {
    const ctx = document.getElementById('contractsChart');
    if (!ctx) return;

    const dataUrl = '../land/public/data/contratos.json';
    const urlWithBust = `${dataUrl}?v=${Date.now()}`;

    fetch(urlWithBust, { cache: 'no-store' })
        .then(resp => {
            if (!resp.ok) throw new Error('fetch not ok');
            return resp.json();
        })
        .then(json => {
            const labels = json.map(item => item.categoria);
            const counts = json.map(item => Number(item.count) || 0);
            const total = counts.reduce((sum, count) => sum + count, 0);
            
            // Calcular percentuais
            const percentages = counts.map(count => (count / total) * 100);

            const chartData = {
                labels: labels,
                datasets: [{
                    data: percentages,
                    backgroundColor: [
                        '#613EFF',
                        '#9C88FF',
                        '#0A005A',
                        '#BE006E',
                        '#5A5670',
                        '#C9BFFF'
                    ],
                    borderWidth: 0,
                    cutout: '60%'
                }]
            };

            const config = {
                type: 'doughnut',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: false,
                            external: externalDoughnutTooltipHandler,
                            backgroundColor: '#0A005A',
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            padding: 16,
                            cornerRadius: 8,
                            displayColors: true,
                            borderColor: '#613EFF',
                            borderWidth: 1,
                            titleFont: {
                                size: 14,
                                weight: '600',
                                family: 'Inter'
                            },
                            bodyFont: {
                                size: 13,
                                weight: '400',
                                family: 'Inter'
                            },
                            callbacks: {
                                title: function(context) {
                                    return 'Contratos por Categoria';
                                },
                                label: function(context) {
                                    const index = context.dataIndex;
                                    const count = counts[index];
                                    const percentage = context.parsed;
                                    return context.label + ': ' + count.toLocaleString('pt-BR') + ' contratos (' + percentage.toFixed(1).replace('.', ',') + '%)';
                                }
                            }
                        }
                    },
                    elements: { arc: { borderWidth: 0 } }
                }
            };

            new Chart(ctx, config);
            
            // Atualizar a legenda com os dados reais
            updateContractsLegend(labels, counts, percentages);
        })
        .catch(() => {
            // Fallback com dados estáticos caso o JSON não carregue
            const chartData = {
                labels: [
                    'Serviços',
                    'Compras',
                    'Informática',
                    'Mão de obra',
                    'Serviços de Engenharia',
                    'Cessão'
                ],
                datasets: [{
                    data: [59.54, 24.81, 8.78, 3.82, 2.67, 0.38],
                    backgroundColor: [
                        '#613EFF',
                        '#9C88FF',
                        '#0A005A',
                        '#BE006E',
                        '#5A5670',
                        '#C9BFFF'
                    ],
                    borderWidth: 0,
                    cutout: '60%'
                }]
            };

            const config = {
                type: 'doughnut',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: false,
                            external: externalDoughnutTooltipHandler,
                            backgroundColor: '#0A005A',
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            padding: 16,
                            cornerRadius: 8,
                            displayColors: true,
                            borderColor: '#613EFF',
                            borderWidth: 1,
                            titleFont: {
                                size: 14,
                                weight: '600',
                                family: 'Inter'
                            },
                            bodyFont: {
                                size: 13,
                                weight: '400',
                                family: 'Inter'
                            },
                            callbacks: {
                                title: function(context) {
                                    return 'Contratos por Categoria';
                                },
                                label: function(context) {
                                    return context.label + ': ' + context.parsed.toFixed(2).replace('.', ',') + '%';
                                }
                            }
                        }
                    },
                    elements: { arc: { borderWidth: 0 } }
                }
            };

            new Chart(ctx, config);
        });
}

// Carregar e desenhar os gráficos "Como o dinheiro está sendo gasto?" a partir do JSON
function loadExpenseElementCharts() {
    const dataUrl = '../land/public/data/orcamento_por_elemento_despesa.json';
    const urlWithBust = `${dataUrl}?v=${Date.now()}`;

    function safeNum(v) { return Number(v) || 0; }

    // Mantém o esquema de cores original por gráfico
    function getRingColors(canvasId) {
        // [empenhado, pagas, aPagar]
        const purple = ['#9C88FF', '#613EFF', '#0A005A'];
        const green = ['#9C88FF', '#613EFF', '#0A005A'];
        const warm  = ['#9C88FF', '#613EFF', '#0A005A'];
        switch (canvasId) {
            case 'retirementChart':
            case 'salaryChart':
                return purple;
            case 'detailChart':
                return warm;
            // Segunda, terceira e quarta linhas originais usavam verdes
            case 'retirementChart2':
            case 'salaryChart2':
            case 'scholarshipChart':
            case 'retirementChart3':
            case 'retirementChart4':
            case 'salaryChart3':
            case 'salaryChart4':
            case 'detailChart2':
            case 'detailChart3':
                return green;
            default:
                return green;
        }
    }

    function createElementDonut(canvasId, record) {
        const ctx = document.getElementById(canvasId);
        if (!ctx || !record) return;

        // Base prioriza dotação; se ausente, usa empenhado; senão soma de pagas + a pagar
        const dotacao = safeNum(record.dotacao);
        const empenhado = safeNum(record.orcamento_alocado_empenhado);
        const pagas = safeNum(record.despesas_pagas);
        const aPagar = safeNum(record.despesas_programas_a_pagar);
        const base = dotacao > 0 ? dotacao : (empenhado > 0 ? empenhado : (pagas + aPagar));
        if (base <= 0) return;

        const valEmpenhado = Math.max(Math.min(empenhado, base), 0);
        const valPagas = Math.max(Math.min(pagas, base), 0);
        const valAPagar = Math.max(Math.min(aPagar, base), 0);

        // destrói gráfico anterior se existir
        window.__govhubCharts = window.__govhubCharts || {};
        if (window.__govhubCharts[canvasId]) {
            try { window.__govhubCharts[canvasId].destroy(); } catch (e) {}
        }

        const [cEmp, cPag, cAPag] = getRingColors(canvasId);

        const chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [
                    { label: 'orcamento_alocado_empenhado', data: [valEmpenhado, Math.max(base - valEmpenhado, 0)], backgroundColor: [cEmp, 'rgba(0,0,0,0)'], borderWidth: 1, borderColor: '#F2F1F6', cutout: '60%' },
                    { label: 'despesas_pagas', data: [valPagas, Math.max(base - valPagas, 0)], backgroundColor: [cPag, 'rgba(0,0,0,0)'], borderWidth: 1, borderColor: '#F2F1F6', cutout: '60%' },
                    { label: 'despesas_programas_a_pagar', data: [valAPagar, Math.max(base - valAPagar, 0)], backgroundColor: [cAPag, 'rgba(0,0,0,0)'], borderWidth: 1, borderColor: '#F2F1F6', cutout: '60%' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false,
                        external: externalDoughnutTooltipHandler,
                        backgroundColor: '#0A005A',
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        padding: 12,
                        borderColor: '#613EFF',
                        borderWidth: 1,
                        displayColors: true,
                        filter: function(item) { return item.dataIndex === 0; },
                        callbacks: {
                            title: function(items) {
                                if (!items || !items.length) return '';
                                const dsLabel = items[0].dataset.label || '';
                                const map = {
                                    'orcamento_alocado_empenhado': 'Orçamento alocado (empenhado)',
                                    'despesas_pagas': 'Despesas pagas',
                                    'despesas_programas_a_pagar': 'Despesas programadas (a pagar)'
                                };
                                return map[dsLabel] || dsLabel;
                            },
                            label: function(context) {
                                const raw = context.parsed;
                                const formatted = (typeof raw === 'number') ? raw.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : raw;
                                return formatted;
                            }
                        }
                    }
                }
            }
        });

        window.__govhubCharts[canvasId] = chartInstance;

        // Atualiza o valor central como Dotação (ou base) em milhões
        const totalMillions = Math.round((dotacao > 0 ? dotacao : base) / 1_000_000);
        updateChartTotal(canvasId, totalMillions);

        // Atualiza o título do card para o nome do elemento de despesa do JSON
        const card = ctx.closest('.dashboard-card');
        if (card) {
            const titleEl = card.querySelector('.dashboard-title');
            if (titleEl && record.elemento_despesa_desc) {
                titleEl.textContent = record.elemento_despesa_desc;
            }
        }
    }

    function indexByDesc(rows) {
        const map = new Map();
        rows.forEach(r => map.set((r.elemento_despesa_desc || '').toUpperCase(), r));
        return map;
    }

    fetch(urlWithBust, { cache: 'no-store' })
        .then(r => { if (!r.ok) throw new Error('fetch not ok'); return r.json(); })
        .then(json => {
            let rows = Array.isArray(json) ? json.slice() : [];
            // Empurra "[A DETALHAR]" para o final
            rows.sort((a,b) => {
                const ad = (a.elemento_despesa_desc || '').toUpperCase() === '[A DETALHAR]';
                const bd = (b.elemento_despesa_desc || '').toUpperCase() === '[A DETALHAR]';
                if (ad && !bd) return 1;
                if (!ad && bd) return -1;
                return 0;
            });
            const byDesc = indexByDesc(rows);

            const mapping = [
                { id: 'retirementChart', key: 'APOSENTADORIAS, RESERVA REMUNERADA E REFORMAS' },
                { id: 'salaryChart', key: 'VENCIMENTOS E VANTAGENS FIXAS - PESSOAL CIVIL' },
                { id: 'detailChart', key: '[A DETALHAR]' },
                { id: 'retirementChart2', key: 'LOCACAO DE MAO-DE-OBRA' },
                { id: 'salaryChart2', key: 'OBRIGACOES PATRONAIS' },
                { id: 'scholarshipChart', key: 'AUXILIO FINANCEIRO A PESQUISADORES' },
                { id: 'retirementChart3', key: 'PENSOES' },
                { id: 'retirementChart4', key: 'INDENIZACOES E RESTITUICOES' },
                { id: 'salaryChart3', key: 'SERVICOS DE TECNOLOGIA DA INFORMACAO E COMUNICACAO - PJ' },
                { id: 'salaryChart4', key: 'CONTRIBUICAO A ENTIDADE FECHADA PREVIDENCIA' },
                { id: 'detailChart2', key: 'OUTROS SERVICOS DE TERCEIROS PJ - OP.INT.ORC.' },
                { id: 'detailChart3', key: 'DIARIAS - PESSOAL CIVIL' }
            ];

            const usedKeys = new Set();
            mapping.forEach(({ id, key }) => {
                const rec = byDesc.get(key);
                if (rec) {
                    usedKeys.add(key);
                    createElementDonut(id, rec);
                }
            });

            // Renderizar cartões adicionais para elementos não mapeados
            const remaining = rows.filter(r => !usedKeys.has((r.elemento_despesa_desc || '').toUpperCase()));
            if (remaining.length > 0) {
                const container = document.querySelector('.expenses-section .container');
                if (container) {
                    let rowDiv = null;
                    remaining.forEach((rec, idx) => {
                        if (idx % 3 === 0) {
                            rowDiv = document.createElement('div');
                            rowDiv.className = 'row g-4 mb-4';
                            container.appendChild(rowDiv);
                        }
                        const col = document.createElement('div');
                        col.className = 'col-12 col-lg-4';
                        const card = document.createElement('div');
                        card.className = 'dashboard-card';
                        const title = document.createElement('h6');
                        title.className = 'dashboard-title';
                        title.textContent = rec.elemento_despesa_desc || '';
                        const chartContainer = document.createElement('div');
                        chartContainer.className = 'dashboard-chart-container';
                        const canvas = document.createElement('canvas');
                        const canvasId = `dynamicChart_${idx}`;
                        canvas.id = canvasId;
                        canvas.width = 200;
                        canvas.height = 200;
                        const center = document.createElement('div');
                        center.className = 'chart-center-text';
                        const num = document.createElement('span');
                        num.className = 'chart-total-number';
                        num.textContent = '0M';
                        const label = document.createElement('span');
                        label.className = 'chart-total-label';
                        label.textContent = 'Dotação';
                        center.appendChild(num);
                        center.appendChild(label);
                        chartContainer.appendChild(canvas);
                        chartContainer.appendChild(center);
                        card.appendChild(title);
                        card.appendChild(chartContainer);
                        col.appendChild(card);
                        rowDiv.appendChild(col);
                        createElementDonut(canvasId, rec);
                    });
                }
            }

            // Mover todos os cards "[A DETALHAR]" para o final visualmente
            const container = document.querySelector('.expenses-section .container');
            if (container) {
                const detailCols = Array.from(container.querySelectorAll('.dashboard-card .dashboard-title'))
                    .filter(h => (h.textContent || '').trim().toUpperCase() === '[A DETALHAR]')
                    .map(h => h.closest('.col-12.col-lg-4'));
                if (detailCols.length) {
                    // cria uma nova linha ao final para agrupar os "A DETALHAR"
                    const detailRow = document.createElement('div');
                    detailRow.className = 'row g-4 mb-4';
                    container.appendChild(detailRow);
                    detailCols.forEach(col => {
                        if (col && col.parentElement) {
                            detailRow.appendChild(col);
                        }
                    });
                }
                // Reflow: reconstroi as linhas em grupos de 3 para eliminar buracos visuais
                const allCols = Array.from(container.querySelectorAll('.col-12.col-lg-4'));
                // Remove todas as linhas atuais
                Array.from(container.querySelectorAll('.row.g-4.mb-4')).forEach(row => row.remove());
                // Recria as linhas com 3 colunas por linha
                for (let i = 0; i < allCols.length; i += 3) {
                    const row = document.createElement('div');
                    row.className = 'row g-4 mb-4';
                    container.appendChild(row);
                    allCols.slice(i, i + 3).forEach(col => row.appendChild(col));
                }
            }
        })
        .catch(() => {
            // mantém gráficos estáticos se falhar
        });
}

// Função para inicializar funcionalidades específicas da página de dashboards
function initDashboards() {
    // Criar o gráfico quando o DOM estiver carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createBudgetChart();
            createContractsChart();
            createDashboardCharts();
        });
    } else {
        createBudgetChart();
        createContractsChart();
        createDashboardCharts();
    }
    
    console.log('📊 Página Dashboards inicializada com sucesso!');
}

// ========================================
// ECHARTS CHARTS - GENDER AND RACE DISTRIBUTION
// ========================================

// Função para criar o gráfico em formato V para distribuição por gênero
function createGenderVChart() {
    // Gráfico de gênero agora é HTML/CSS estático, não precisa de JavaScript
    return;
}

// Função para atualizar o gráfico de gênero com dados do JSON
async function updateGenderChart() {
    try {
        // Carregar dados do JSON
        const response = await fetch('../land/public/data/servidores_sexo.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar dados de gênero');
        }
        const data = await response.json();
        
        // Encontrar os dados de feminino e masculino
        let femininoPercent = 0;
        let masculinoPercent = 0;
        
        data.forEach(item => {
            if (item.nome_sexo === 'FEMININO' && item.feminino !== null) {
                femininoPercent = item.feminino * 100;
            } else if (item.nome_sexo === 'MASCULINO' && item.masculino !== null) {
                masculinoPercent = item.masculino * 100;
            }
        });
        
        // Atualizar as barras do gráfico
        const femininoBar = document.querySelector('.bar-fill.feminino');
        const masculinoBar = document.querySelector('.bar-fill.masculino');
        const femininoValue = document.querySelector('.bar-item:first-child .bar-value');
        const masculinoValue = document.querySelector('.bar-item:last-child .bar-value');
        
        if (femininoBar && femininoValue) {
            femininoBar.style.width = `${femininoPercent}%`;
            femininoValue.textContent = `${femininoPercent.toFixed(1)}%`;
        }
        
        if (masculinoBar && masculinoValue) {
            masculinoBar.style.width = `${masculinoPercent}%`;
            masculinoValue.textContent = `${masculinoPercent.toFixed(1)}%`;
        }
        
        console.log('Gráfico de gênero atualizado com sucesso');
        
    } catch (error) {
        console.error('Erro ao atualizar gráfico de gênero:', error);
    }
}

// Função para atualizar o gráfico automaticamente a cada 30 segundos
function startGenderChartAutoUpdate() {
    // Atualizar imediatamente
    updateGenderChart();
    
    // Configurar atualização automática a cada 30 segundos
    setInterval(updateGenderChart, 30000);
    
    console.log('Atualização automática do gráfico de gênero iniciada (30s)');
}

// Função para criar o treemap de distribuição por raça/cor
// Função para carregar dados de raça/cor do JSON
async function loadServidoresCorData() {
    try {
        const response = await fetch('../land/public/data/servidores_cor.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('✅ Dados de servidores por cor carregados:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro ao carregar dados de servidores por cor:', error);
        return null;
    }
}

// Função para mapear dados do JSON para o formato do gráfico
function mapServidoresCorToChartData(jsonData) {
    if (!jsonData || !Array.isArray(jsonData)) {
        console.error('❌ Dados inválidos para mapeamento');
        return [];
    }

    // Mapeamento de cores para cada raça/cor
    const colorMap = {
        'BRANCA': '#613EFF',
        'PARDA': '#0A005A', 
        'PRETA': '#9C88FF',
        'AMARELA': '#3F28A6',
        'NAO INFORMADO': '#C9BFFF',
        'INDIGENA': '#E57AB4',
        '': '#C9BFFF' // Para valores vazios
    };

    // Filtrar dados válidos e mapear para o formato do gráfico
    const chartData = jsonData
        .filter(item => item.nome_cor && item.cor_ou_raca > 0) // Filtrar apenas dados válidos
        .map(item => ({
            name: item.nome_cor,
            value: item.cor_ou_raca,
            itemStyle: { 
                color: colorMap[item.nome_cor] || '#C9BFFF',
                borderColor: '#ffffff',
                borderWidth: 2
            }
        }))
        .sort((a, b) => b.value - a.value); // Ordenar por valor decrescente

    console.log('📊 Dados mapeados para o gráfico:', chartData);
    return chartData;
}

function createRaceTreemap() {
    const chartDom = document.getElementById('raceChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    // Carregar dados do JSON e criar o gráfico
    loadServidoresCorData().then(jsonData => {
        const data = mapServidoresCorToChartData(jsonData);
        
        if (data.length === 0) {
            console.error('❌ Nenhum dado válido encontrado para o gráfico');
            return;
        }

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: '#0A005A',
                borderColor: '#613EFF',
                borderWidth: 1,
                textStyle: {
                    color: '#ffffff',
                    fontFamily: "'Reddit Sans', sans-serif"
                },
                formatter: function(params) {
                    return params.name + '<br/>' + params.value + ' funcionários';
                }
            },
            series: [
                {
                    name: 'Distribuição por Raça/Cor',
                    type: 'treemap',
                    data: data,
                    roam: false,
                    nodeClick: false,
                    breadcrumb: {
                        show: false
                    },
                        label: {
                            show: true,
                            formatter: function(params) {
                                // Definir limite de valor para mostrar rótulo dentro do treemap
                                // Itens com valor abaixo deste limite terão o rótulo na legenda externa
                                const minLabelValue = 28; // Baseado nos dados: 28 PRETA aparece, 1 e 2 não
                                
                                // Mostrar rótulo dentro do treemap apenas se o valor for maior ou igual ao limite
                                if (params.value >= minLabelValue) {
                                    return params.value + '\n' + params.name;
                                } else {
                                    return ''; // Ocultar rótulo para itens pequenos (aparecerão na legenda)
                                }
                            },
                        fontSize: function(params) {
                            // Tamanho de fonte baseado no valor
                            if (params.value >= 500) return 16;
                            if (params.value >= 100) return 14;
                            if (params.value >= 50) return 12;
                            return 10;
                        },
                        fontWeight: 'bold',
                        color: '#ffffff',
                        fontFamily: "'Reddit Sans', sans-serif",
                        textShadowColor: 'rgba(0,0,0,0.5)',
                        textShadowBlur: 2,
                        position: 'inside',
                        align: 'center',
                        verticalAlign: 'middle'
                    },
                    upperLabel: {
                        show: false
                    },
                    itemStyle: {
                        borderColor: '#ffffff',
                        borderWidth: 1,
                        borderRadius: 0
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: '#613EFF',
                            borderWidth: 2
                        }
                    },
                    gapWidth: 0,
                    gapHeight: 0,
                    levels: [
                        {
                            itemStyle: {
                                borderColor: '#ffffff',
                                borderWidth: 1,
                                gapWidth: 0,
                                gapHeight: 0
                            }
                        }
                    ]
                }
            ]
        };

        myChart.setOption(option);
        
        // Definir limite de valor para mostrar na legenda (mesmo valor usado no formatter)
        const minLabelValue = 28;
        
        // Limpar legenda existente se houver
        const chartContainer = document.getElementById('raceChart').parentElement;
        const existingLegend = chartContainer.querySelector('.race-chart-legend');
        if (existingLegend) {
            existingLegend.remove();
        }
        
        // Criar novo contêiner da legenda
        const legendContainer = document.createElement('div');
        legendContainer.className = 'race-chart-legend';
        legendContainer.style.cssText = `
            display: flex;
            flex-direction: row;
            gap: 20px;
            margin-top: 10px;
            font-family: 'Reddit Sans', sans-serif;
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            box-sizing: border-box;
            padding-bottom: 8px;
            scrollbar-width: thin;
            scrollbar-color: #613EFF #F2F1F6;
        `;
        
        // Gerar itens da legenda para categorias abaixo do limite
        const legendItems = data.filter(item => item.value < minLabelValue);
        
        legendItems.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #1f2937;
                flex-shrink: 0;
                white-space: nowrap;
                min-width: fit-content;
                box-sizing: border-box;
            `;
            
            const legendDot = document.createElement('div');
            legendDot.style.cssText = `
                width: 12px;
                height: 12px;
                background-color: ${item.itemStyle.color};
                border-radius: 50%;
            `;
            
            legendItem.appendChild(legendDot);
            
            // Formatar nome para a legenda (com acentos e capitalização)
            let displayName = item.name;
            if (item.name === 'NAO INFORMADO') {
                displayName = 'Não informados';
            } else if (item.name === 'INDIGENA') {
                displayName = 'Indígenas';
            } else if (item.name === 'AMARELA') {
                displayName = 'Amarelos';
            } else if (item.name === 'PRETA') {
                displayName = 'Pretos';
            } else if (item.name === 'PARDA') {
                displayName = 'Pardos';
            } else if (item.name === 'BRANCA') {
                displayName = 'Brancos';
            }
            
            legendItem.appendChild(document.createTextNode(`${item.value} ${displayName}`));
            legendContainer.appendChild(legendItem);
        });
        
        // Adicionar a legenda ao container do gráfico apenas se houver itens
        if (legendItems.length > 0) {
            chartContainer.appendChild(legendContainer);
        }
        
        // Responsive com ajuste para mobile e desktop
        window.addEventListener('resize', function() {
            const chartDom = document.getElementById('raceChart');
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 576;
            
            if (chartDom) {
                if (isMobile) {
                    // Ajustar altura no mobile
                    chartDom.style.height = isSmallMobile ? '250px' : '300px';
                } else {
                    // Voltar para altura desktop
                    chartDom.style.height = '400px';
                }
            }
            
            // Forçar atualização da legenda
            const legendContainer = chartContainer.querySelector('.race-chart-legend');
            if (legendContainer) {
                legendContainer.style.display = 'flex';
                legendContainer.style.visibility = 'visible';
                legendContainer.style.opacity = '1';
            }
            
            myChart.resize();
        });
        
        // Ajuste inicial baseado no tamanho da tela
        const chartDom = document.getElementById('raceChart');
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 576;
        
        if (chartDom) {
            if (isMobile) {
                chartDom.style.height = isSmallMobile ? '250px' : '300px';
            } else {
                chartDom.style.height = '400px';
            }
            myChart.resize();
        }
        
        // Garantir que a legenda seja visível
        setTimeout(() => {
            const legendContainer = chartContainer.querySelector('.race-chart-legend');
            if (legendContainer) {
                legendContainer.style.display = 'flex';
                legendContainer.style.visibility = 'visible';
                legendContainer.style.opacity = '1';
            }
        }, 100);
        
    }).catch(error => {
        console.error('❌ Erro ao criar gráfico de raça/cor:', error);
    });
}

// Função para inicializar funcionalidades específicas da página de dashboards
function initDashboards() {
    // Criar o gráfico quando o DOM estiver carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createBudgetChart();
            createContractsChart();
            // createDashboardCharts(); // removido para evitar gráficos duplicados
            loadExpenseElementCharts();
            loadBudgetKpis();
            loadContractsKpis();
            loadContractsBars();
            loadTedsRecebidosKpis();
            createGenderVChart();
            startGenderChartAutoUpdate();
            createRaceTreemap();
            loadTedsRecebidosTable();
            loadTedsEnviadosTable();
            loadTedsEnviadosKpis();
            loadEmployeeData(); // Carregar dados de funcionários
            createAposentadoriasChart();
        });
    } else {
        createBudgetChart();
        createContractsChart();
        // createDashboardCharts(); // removido para evitar gráficos duplicados
        loadExpenseElementCharts();
        loadBudgetKpis();
        loadContractsKpis();
        loadContractsBars();
        loadTedsRecebidosKpis();
        createGenderVChart();
        startGenderChartAutoUpdate();
        createRaceTreemap();
        loadTedsRecebidosTable();
        loadTedsEnviadosTable();
        loadTedsEnviadosKpis();
        loadEmployeeData(); // Carregar dados de funcionários
        createAposentadoriasChart();
    }
    
    console.log('📊 Página Dashboards inicializada com sucesso!');
}

// Função para carregar e popular a tabela de TEDs recebidos
function loadTedsRecebidosTable() {
    fetch('../land/public/data/detalhamento_teds_recebidos.json')
        .then(resp => resp.json())
        .then(json => {
            const tbody = document.getElementById('teds-recebidos-tbody');
            if (!tbody) return;
            
            // Limpar tbody
            tbody.innerHTML = '';
            
            // Para cada item do JSON, criar uma linha
            json.forEach(item => {
                const tr = document.createElement('tr');
                
                // Formatar valor monetário
                const valorFormatado = (item.valor_firmado || 0).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                
                // Calcular percentuais
                const percentualTemporal = ((item.percentual_conclusao || 0) * 100).toFixed(2);
                const percentualOrcamentario = item.percentual_conclusao_orcamentaria 
                    ? ((item.percentual_conclusao_orcamentaria || 0) * 100).toFixed(2)
                    : '0';
                
                tr.innerHTML = `
                    <td>
                        <div class="teds-program">
                            <div class="teds-program-code">${item.unidade || ''}</div>
                            <div class="teds-program-text">${item.programa || ''}</div>
                        </div>
                    </td>
                    <td>${item.vigencia || ''}</td>
                    <td>${valorFormatado}</td>
                    <td>
                        <div class="teds-progress">
                            <div class="teds-progress-bar" style="width: ${percentualTemporal}%">
                                <span class="teds-progress-handle" style="left: ${percentualOrcamentario}%"></span>
                            </div>
                        </div>
                    </td>
                `;
                
                tbody.appendChild(tr);
            });
        });
}

// Função para carregar e popular a tabela de TEDs enviados
function loadTedsEnviadosTable() {
    fetch('../land/public/data/detalhamento_teds_enviados.json')
        .then(resp => resp.json())
        .then(json => {
            const tbody = document.getElementById('teds-enviados-tbody');
            if (!tbody) return;

            // Limpar tbody
            tbody.innerHTML = '';

            // Para cada item do JSON, criar uma linha
            json.forEach(item => {
                const tr = document.createElement('tr');

                // Formatar valor monetário
                const valorFormatado = (item.valor_firmado || 0).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                // Calcular percentuais
                const percentualTemporal = ((item.percentual_conclusao || 0) * 100).toFixed(2);
                const percentualOrcamentario = item.percentual_conclusao_orcamentaria
                    ? ((item.percentual_conclusao_orcamentaria || 0) * 100).toFixed(2)
                    : '0';

                tr.innerHTML = `
                    <td>
                        <div class="teds-sent-program">
                            <div class="teds-sent-program-code">${item.unidade_descentralizadora_responsavel || ''}</div>
                            <div class="teds-sent-program-text">${item.programa || ''}</div>
                        </div>
                    </td>
                    <td>${item.vigencia || ''}</td>
                    <td>${valorFormatado}</td>
                    <td>
                        <div class="teds-sent-progress">
                            <div class="teds-sent-progress-bar" style="width: ${percentualTemporal}%">
                                <span class="teds-progress-handle" style="left: ${percentualOrcamentario}%"></span>
                            </div>
                        </div>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        });
}

// Função para carregar dados de servidores do JSON
async function loadServidoresData() {
    try {
        const response = await fetch('../land/public/data/servidores.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('✅ Dados de servidores carregados:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro ao carregar dados de servidores:', error);
        return null;
    }
}

// Função para carregar e atualizar todos os dados de funcionários
async function loadEmployeeData() {
    try {
        const servidoresData = await loadServidoresData();
        
        if (servidoresData) {
            // Atualizar cards de funcionários ativos
            updateEmployeeCards(servidoresData);
            
            // Atualizar card de aposentadorias
            updateTotalAposentadorias(servidoresData);
            
            console.log('✅ Todos os dados de funcionários atualizados com sucesso!');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados de funcionários:', error);
    }
}

// Função para atualizar o card de total de aposentadorias
function updateTotalAposentadorias(servidoresData) {
    if (!servidoresData || servidoresData.length === 0) {
        console.error('❌ Dados de servidores inválidos');
        return;
    }

    const totalAposentadorias = servidoresData[0].aposentados;
    const totalElement = document.getElementById('total-aposentadorias');
    
    if (totalElement) {
        totalElement.textContent = totalAposentadorias.toLocaleString('pt-BR');
    }
}

// Função para atualizar os cards de funcionários ativos
function updateEmployeeCards(servidoresData) {
    if (!servidoresData || servidoresData.length === 0) {
        console.error('❌ Dados de servidores inválidos');
        return;
    }

    const data = servidoresData[0];
    
    // Atualizar servidores ativos
    const servidoresElement = document.getElementById('servidores-ativos');
    if (servidoresElement) {
        servidoresElement.textContent = data.servidores_ativos.toLocaleString('pt-BR');
    }
    
    // Atualizar estagiários
    const estagiariosElement = document.getElementById('estagiarios');
    if (estagiariosElement) {
        estagiariosElement.textContent = data.estagiarios.toLocaleString('pt-BR');
    }
    
    // Atualizar terceirizados
    const terceirizadosElement = document.getElementById('terceirizados');
    if (terceirizadosElement) {
        if (data.terceirizados === 0) {
            terceirizadosElement.textContent = '-';
        } else {
            terceirizadosElement.textContent = data.terceirizados.toLocaleString('pt-BR');
        }
    }
}

// Função para gerar dados do gráfico baseados nos dados reais
const MOCK_APOSENTADORIAS_SERIE = [15, 15, 14, 13, 14, 12, 14, 15, 12, 12, 13, 14];

function generateAposentadoriasChartData() {
    return [...MOCK_APOSENTADORIAS_SERIE];
}

// Função para criar o gráfico de linha de aposentadorias
async function createAposentadoriasChart() {
    const ctx = document.getElementById('aposentadoriasChart');
    if (!ctx || typeof Chart === 'undefined') {
        return;
    }

    // Destruir gráfico existente se houver
    destroyChartIfExists('aposentadoriasChart');

    // Carregar dados de servidores
    const servidoresData = await loadServidoresData();
    
    // Atualizar o card de total de aposentadorias
    updateTotalAposentadorias(servidoresData);
    
    // Atualizar os cards de funcionários ativos
    updateEmployeeCards(servidoresData);
    
    // Gerar dados do gráfico baseados nos dados reais
    const chartData = generateAposentadoriasChartData(servidoresData);

    const data = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
            label: 'Aposentadorias por Mês',
            data: chartData,
            borderColor: '#0A005A', // Cor roxa baseada em exemplo externo
            backgroundColor: '#0A005A',
            borderWidth: 3,
            fill: false,
            tension: 0, // Linha mais angular, menos arredondada
            pointRadius: 0, // Remove os pontos
            pointHoverRadius: 0, // Remove os pontos no hover
            pointBackgroundColor: 'transparent',
            pointBorderColor: 'transparent',
            pointBorderWidth: 0
        }]
    };

    // Configuração baseada em exemplo externo do Chart.js
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
             plugins: {
                 legend: {
                     display: false
                 },
                 tooltip: {
                     enabled: true,
                     backgroundColor: '#0A005A',
                     titleColor: '#ffffff',
                     bodyColor: '#ffffff',
                     borderColor: 'transparent',
                     borderWidth: 0,
                     cornerRadius: 8,
                     displayColors: false,
                     padding: 8,
                     titleFont: {
                         family: 'Inter',
                         size: 0
                     },
                     bodyFont: {
                         family: 'Inter',
                         size: 14,
                         weight: 'bold'
                     },
                     callbacks: {
                         title: function() {
                             return '';
                         },
                         label: function(context) {
                             return context.parsed.y.toString();
                         }
                     },
                     // Posicionamento para aparecer abaixo do ponto
                     position: 'nearest',
                     xAlign: 'center',
                     yAlign: 'bottom',
                     caretSize: 8,
                     caretPadding: 4
                 }
             },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: '#e5e7eb',
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            family: 'Inter',
                            size: 12,
                            weight: '500'
                        },
                        padding: 8
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    max: Math.max(...chartData) + 10, // Ajustar máximo baseado nos dados reais
                    grid: {
                        color: '#e5e7eb',
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            family: 'Inter',
                            size: 12,
                            weight: '500'
                        },
                        stepSize: Math.ceil((Math.max(...chartData) + 10) / 10),
                        padding: 8
                    }
                }
            },
            elements: {
                line: {
                    borderJoinStyle: 'miter', // Junções mais angulares
                    borderCapStyle: 'butt'   // Pontas mais retas
                },
                point: {
                    hoverBackgroundColor: 'transparent',
                    hoverBorderColor: 'transparent',
                    hoverBorderWidth: 0
                }
            }
        }
    };

    const chartInstance = new Chart(ctx, config);
    // Armazenar referência do gráfico no canvas para facilitar destruição futura
    ctx.chart = chartInstance;
}

// Função de fallback para garantir que o gráfico seja criado
function ensureAposentadoriasChart() {
    setTimeout(() => {
        const canvas = document.getElementById('aposentadoriasChart');
        if (canvas && !canvas.chart) {
            console.log('🔄 Tentando criar gráfico novamente...');
            createAposentadoriasChart();
        }
    }, 1000);
}

// Inicializar quando o script for carregado
initDashboards();

// Garantir que o gráfico seja criado
ensureAposentadoriasChart();

// Exportar funções para uso global
window.createBudgetChart = createBudgetChart;
window.createContractsChart = createContractsChart;
window.createDashboardCharts = createDashboardCharts;
window.createGenderVChart = createGenderVChart;
window.updateGenderChart = updateGenderChart;
window.startGenderChartAutoUpdate = startGenderChartAutoUpdate;
window.createRaceTreemap = createRaceTreemap;
window.createAposentadoriasChart = createAposentadoriasChart;
window.loadTedsRecebidosTable = loadTedsRecebidosTable;
window.loadTedsEnviadosTable = loadTedsEnviadosTable;
window.loadEmployeeData = loadEmployeeData;
window.initDashboards = initDashboards;

