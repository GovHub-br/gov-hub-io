/* ===================================
   ACOMPANHAMENTO ORÇAMENTÁRIO - GOVHUB
   =================================== */

const DATA_URL = '../land/public/data/acompanhamento_orcamentario.json';

const DEFAULT_HISTORICO = {
    meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    tesouro: [0, 0, 0, 100000, 0, 0, 0, 190000, 380000, 0, 0, 0],
    comprasNetPago: [0, 0, 0, 0, 0, 350000, 0, 0, 0, 0, 0, 0],
    comprasNetCronograma: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

document.addEventListener('DOMContentLoaded', () => {
    loadBudgetTrackingData();
});

async function loadBudgetTrackingData() {
    try {
        const urlWithBust = `${DATA_URL}?v=${Date.now()}`;
        const response = await fetch(urlWithBust, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();

        populateContractInfo(data.contract);
        populateContractualData(data.contractual_data);
        populateIndicators(data.indicadores);
        initializeCharts(data.historico);
    } catch (error) {
        console.error('Erro ao carregar dados de acompanhamento orçamentário:', error);
        populateContractInfo();
        populateContractualData();
        populateIndicators();
        initializeCharts();
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) {
        el.textContent = value;
    }
}

function formatCompactValue(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    const num = Number(value);
    const abs = Math.abs(num);
    if (abs >= 1_000_000) {
        return (num / 1_000_000).toFixed(2).replace('.', ',') + 'M';
    }
    if (abs >= 1_000) {
        return (num / 1_000).toFixed(0).replace('.', ',') + 'k';
    }
    return num.toLocaleString('pt-BR');
}

function formatCurrency(value, fractionDigits = 2) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return Number(value).toLocaleString('pt-BR', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    });
}

function populateContractInfo(contract = {}) {
    setText('numero-contrato', contract.numero || '-');
    setText('categoria-contrato', contract.categoria || '-');
    setText('fornecedor-contrato', contract.fornecedor || '-');
    setText('objetivo-contrato', contract.objetivo || '-');
}

function populateContractualData(data = {}) {
    setText('valor-contratado', formatCompactValue(data.valor_contratado));
    setText('valor-parcela', formatCompactValue(data.valor_parcela));
    setText('numero-parcelas', data.numero_parcelas ?? '-');
    setText('valor-global', formatCompactValue(data.valor_global));
}

function populateIndicators(indicadores = {}) {
    const tesouro = indicadores.tesouro || {};
    const compras = indicadores.comprasnet || {};

    setText('tesouro-empenhado', formatCurrency(tesouro.valor_empenhado));
    setText('tesouro-a-liquidar', formatCurrency(tesouro.valor_a_liquidar));
    setText('tesouro-pago', formatCurrency(tesouro.valor_pago));

    setText('comprasnet-cronogramas', formatCurrency(compras.valor_cronogramas));
    setText('comprasnet-faturado', formatCurrency(compras.valor_faturado));
    setText('comprasnet-contratual-disponivel', formatCurrency(compras.valor_contratual_disponivel));
}

function buildCommonOptions(yMax, stepSize) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 5,
                bottom: 5,
                left: 5,
                right: 5
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        family: 'Inter',
                        size: 11
                    },
                    padding: 3
                }
            },
            y: {
                beginAtZero: true,
                max: yMax,
                grid: {
                    display: true,
                    color: '#f1f5f9',
                    lineWidth: 1
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        family: 'Inter',
                        size: 11
                    },
                    padding: 3,
                    stepSize: stepSize,
                    callback: function(value) {
                        return value + 'k';
                    }
                }
            }
        },
        elements: {
            point: {
                radius: 4,
                hoverRadius: 6,
                hoverBorderWidth: 3,
                borderWidth: 2
            },
            line: {
                tension: 0.1
            }
        }
    };
}

function getTooltipConfig(color) {
    return {
        enabled: true,
        backgroundColor: color,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 0,
        cornerRadius: 6,
        displayColors: false,
        titleFont: {
            family: 'Inter',
            size: 12,
            weight: '600'
        },
        bodyFont: {
            family: 'Inter',
            size: 12,
            weight: '500'
        },
        padding: {
            top: 8,
            bottom: 8,
            left: 12,
            right: 12
        },
        callbacks: {
            title: function(context) {
                return context[0].label;
            },
            label: function(context) {
                return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(context.parsed.y * 1000);
            }
        }
    };
}

function createDataset(label, data, borderColor, backgroundColor) {
    return {
        label,
        data,
        borderColor,
        backgroundColor,
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: borderColor,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: borderColor,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3
    };
}

function createLineChart(canvasId, labels, datasets, tooltipColor, baseOptions) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const options = {
        ...baseOptions,
        plugins: {
            ...baseOptions.plugins,
            tooltip: getTooltipConfig(tooltipColor)
        }
    };

    new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels, datasets },
        options
    });
}

function initializeCharts(historico = DEFAULT_HISTORICO) {
    const months = historico?.meses || DEFAULT_HISTORICO.meses;
    const tesouroValues = (historico?.tesouro || DEFAULT_HISTORICO.tesouro).map(value => Number(value) || 0);
    const comprasPagoValues = (historico?.comprasNetPago || DEFAULT_HISTORICO.comprasNetPago).map(value => Number(value) || 0);
    const comprasCronogramaValues = (historico?.comprasNetCronograma || DEFAULT_HISTORICO.comprasNetCronograma).map(value => Number(value) || 0);

    const tesouroGerencialData = tesouroValues.map(value => value / 1000);
    const comprasNetPagoData = comprasPagoValues.map(value => value / 1000);
    const comprasNetCronogramaData = comprasCronogramaValues.map(value => value / 1000);

    const combined = [...tesouroGerencialData, ...comprasNetPagoData, ...comprasNetCronogramaData];
    const maxValue = combined.reduce((acc, value) => Math.max(acc, value), 0);
    const yMax = maxValue > 0 ? Math.ceil(maxValue / 50) * 50 : 50;
    const stepSize = yMax <= 50 ? 10 : Math.max(10, Math.ceil(yMax / 8 / 10) * 10);

    const baseOptions = buildCommonOptions(yMax, stepSize);

    createLineChart(
        'tesouroGerencialChart',
        months,
        [
            createDataset(
                'SUM (coalesce(siafi_valor_pago, 0))',
                tesouroGerencialData,
                '#0A005A',
                'rgba(102, 48, 143, 0.1)'
            )
        ],
        '#0A005A',
        baseOptions
    );

    createLineChart(
        'comprasNetChart',
        months,
        [
            createDataset(
                'SUM (coalesce(comprasgov_valor_pago, 0))',
                comprasNetPagoData,
                '#9F5528',
                'rgba(159, 85, 40, 0.1)'
            ),
            createDataset(
                'SUM (coalesce(comprasgov_valor_cronograma, 0))',
                comprasNetCronogramaData,
                '#F59E0B',
                'rgba(245, 158, 11, 0.1)'
            )
        ],
        '#F59E0B',
        baseOptions
    );
}