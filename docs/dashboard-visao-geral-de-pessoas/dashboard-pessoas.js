// ========================================
// DASHBOARD DE PESSOAS - JAVASCRIPT FILE
// ========================================

const PESSOAS_DATA_PATHS = [
    '../land/public/data/pessoas_visao_geral.json'
];

// Cores para raça/cor
const colorMap = {
    'BRANCA': '#613EFF',
    'PARDA': '#0A005A', 
    'PRETA': '#9C88FF',
    'AMARELA': '#3F28A6',
    'INDÍGENA': '#E57AB4',
    'NÃO DECLARADA': '#C9BFFF',
    'NAO INFORMADO': '#C9BFFF'
};

async function fetchPessoasData() {
    for (const basePath of PESSOAS_DATA_PATHS) {
        try {
            const urlWithBust = `${basePath}?v=${Date.now()}`;
            const resp = await fetch(urlWithBust, { cache: 'no-store' });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return await resp.json();
        } catch (e) {
            // tenta próximo caminho
            continue;
        }
    }
    const hdr = document.querySelector('.header-date');
    if (hdr) hdr.textContent = 'Erro ao carregar dados';
    console.error('Não foi possível carregar pessoas_visao_geral.json');
    return null;
}

function setHeaderDateFromData(data) {
    const el = document.querySelector('.header-date');
    if (!el || !data || !data.meta || !data.meta.atualizado_em) return;
    el.textContent = data.meta.atualizado_em;
}

function setKpisFromData(data) {
    if (!data || !data.kpis) return;
    const { total_servidores, servidores_ativos_permanentes, aposentados, estagiarios } = data.kpis;

    const idMap = [
        ['kpi-total-servidores', total_servidores],
        ['kpi-ativos-permanentes', servidores_ativos_permanentes],
        ['kpi-aposentados', aposentados],
        ['kpi-estagiarios', estagiarios]
    ];
    let appliedById = 0;
    idMap.forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = formatKpi(Number(value) || 0);
            appliedById++;
        }
    });

    if (appliedById === idMap.length) return;

    const cards = Array.from(document.querySelectorAll('.budget-card'));
    cards.forEach(card => {
        const title = card.querySelector('.budget-card-title');
        const valueEl = card.querySelector('.budget-value');
        if (!title || !valueEl) return;
        const t = (title.textContent || '').toUpperCase();
        if (t.includes('TOTAL DE SERVIDORES')) valueEl.textContent = formatKpi(total_servidores);
        else if (t.includes('SERVIDORES ATIVOS PERMANENTES')) valueEl.textContent = formatKpi(servidores_ativos_permanentes);
        else if (t.includes('APOSENTADOS')) valueEl.textContent = formatKpi(aposentados);
        else if (t.includes('ESTAGIÁRIOS')) valueEl.textContent = formatKpi(estagiarios);
    });
}

function formatKpi(n) {
    if (n >= 1000) {
        const k = (n / 1000);
        return (Math.round(k * 100) / 100) + 'k';
    }
    return String(n);
}

function setGeneroFromData(data) {
    if (!data || !data.genero) return;
    const fem = Number(data.genero.feminino_percent) || 0;
    const masc = Number(data.genero.masculino_percent) || 0;

    const barItems = document.querySelectorAll('.chart-card .bars-container .bar-item');
    barItems.forEach(item => {
        const label = (item.querySelector('.bar-label')?.textContent || '').trim().toUpperCase();
        const fill = item.querySelector('.bar-fill');
        const value = item.querySelector('.bar-value');
        if (!fill || !value) return;
        if (label.includes('FEMININO')) {
            fill.style.width = fem + '%';
            value.textContent = fem.toFixed(1) + '%';
        } else if (label.includes('MASCULINO')) {
            fill.style.width = masc + '%';
            value.textContent = masc.toFixed(1) + '%';
        }
    });
}

function createRaceTreemapFromData(data) {
    const chartDom = document.getElementById('raceChart');
    if (!chartDom) return;
    if (!data || !Array.isArray(data.raca_cor) || data.raca_cor.length === 0) {
        chartDom.innerHTML = '<div style="color:#b91c1c;font-size:12px;">Sem dados de raça/cor</div>';
        return;
    }

    const myChart = echarts.init(chartDom);
    const mapped = data.raca_cor.map(item => ({
        name: item.nome_cor,
        value: item.valor,
        itemStyle: { 
            color: colorMap[item.nome_cor] || '#C9BFFF',
            borderColor: '#ffffff',
            borderWidth: 2
        }
    })).sort((a, b) => b.value - a.value);

    const option = {
        series: [
            {
                type: 'treemap',
                data: mapped,
                roam: false,
                nodeClick: false,
                breadcrumb: { show: false },
                label: {
                    show: true,
                    formatter: function(params) {
                        if (params.treePathInfo && params.treePathInfo.length > 1) {
                            return params.name + '\n' + params.value;
                        }
                        return '';
                    },
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textShadowColor: 'rgba(0, 0, 0, 0.5)',
                    textShadowBlur: 2
                },
                upperLabel: { show: false },
                itemStyle: { borderColor: '#ffffff', borderWidth: 2, gapWidth: 2 },
                emphasis: { itemStyle: { borderColor: '#613EFF', borderWidth: 3 } }
            }
        ]
    };

    myChart.setOption(option);
}

function setupCardHoverEffects() {
    const cards = document.querySelectorAll('.chart-card, .budget-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        });
    });
}

function animateKPIs() {
    const kpiValues = document.querySelectorAll('.budget-value');
    kpiValues.forEach((element, index) => {
        const finalValue = element.textContent;
        const isKValue = finalValue.includes('k');
        const numericValue = parseFloat(finalValue.replace('k', '')) || 0;
        element.textContent = '0';
        setTimeout(() => {
            let currentValue = 0;
            const steps = 50;
            const increment = numericValue / steps;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= numericValue) {
                    element.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    const displayValue = Math.floor(currentValue * 100) / 100;
                    element.textContent = isKValue ? displayValue + 'k' : displayValue.toString();
                }
            }, 20);
        }, index * 200);
    });
}

function overrideBrazilMapDataFromJson(data) {
    if (!data || !data.mapa_uf) return;
    const src = data.mapa_uf;
    Object.keys(src).forEach(uf => {
        const it = src[uf];
        brazilMapData[uf] = {
            name: it.nome || it.name || uf,
            value: it.valor || it.value || 0,
            percentage: it.percentual || it.percentage || '0%'
        };
    });
}

function loadBrazilMap() {
    const mapContainer = document.getElementById('brazilMap');
    if (!mapContainer) return;

    fetch('/govhub/land/dist/images/Map-Brasil.svg')
        .then(response => response.text())
        .then(svgText => {
            mapContainer.innerHTML = svgText;
            initializeMapInteractivity();
        })
        .catch(error => {
            console.error('Erro ao carregar o mapa do Brasil:', error);
            mapContainer.innerHTML = '<p>Erro ao carregar o mapa</p>';
        });
}

function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    const toHex = (v) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function lerpColor(startHex, endHex, t) {
    const s = hexToRgb(startHex);
    const e = hexToRgb(endHex);
    const r = Math.round(lerp(s.r, e.r, t));
    const g = Math.round(lerp(s.g, e.g, t));
    const b = Math.round(lerp(s.b, e.b, t));
    return rgbToHex(r, g, b);
}

function initializeMapInteractivity() {
    const mapContainer = document.getElementById('brazilMap');
    const svg = mapContainer.querySelector('svg');
    if (!svg) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    mapContainer.appendChild(tooltip);

    const paths = svg.querySelectorAll('path');
    const updateTooltipPosition = (e, tooltip) => {
        const rect = mapContainer.getBoundingClientRect();
        tooltip.style.left = (e.clientX - rect.left) + 'px';
        tooltip.style.top = (e.clientY - rect.top - 40) + 'px';
    };
    
    // Cores para o gradiente (0% -> 100%)
    const START_HEX = '#F2F1F6'; // claro da marca
    const END_HEX = '#613EFF';   // roxo
    
    paths.forEach((path) => {
        let stateId = path.getAttribute('id');
        if (stateId) stateId = stateId.toUpperCase().trim();
        const data = brazilMapData[stateId];
        const tooltipText = data ? `${data.name} ${data.percentage}` : stateId || 'Estado';

        // transição suave
        path.style.transition = 'fill 0.2s ease';

        path.addEventListener('mouseenter', function(e) {
            // salvar estado original APENAS uma vez
            if (!path.dataset.origFillSaved) {
                path.dataset.origFill = path.getAttribute('fill') ?? '';
                path.dataset.origStyle = path.getAttribute('style') ?? '';
                path.dataset.origFillSaved = '1';
            }

            tooltip.textContent = tooltipText;
            updateTooltipPosition(e, tooltip);
            tooltip.classList.add('show');

            const pctStr = (data && data.percentage) ? String(data.percentage) : '0%';
            const pct = Math.max(0, Math.min(100, parseFloat(pctStr) || 0));
            const t = pct / 100;
            const hoverColor = lerpColor(START_HEX, END_HEX, t);
            path.style.fill = hoverColor;
        });
        
        path.addEventListener('mouseleave', function() {
            tooltip.classList.remove('show');
            // restaurar exatamente o que havia antes
            const origStyle = path.dataset.origStyle ?? '';
            const origFill = path.dataset.origFill ?? '';
            if (origStyle !== '') {
                path.setAttribute('style', origStyle);
            } else {
                path.removeAttribute('style');
            }
            if (origFill !== '') {
                path.setAttribute('fill', origFill);
            } else {
                path.removeAttribute('fill');
            }
        });
        
        path.addEventListener('mousemove', function(e) {
            if (tooltip.classList.contains('show')) updateTooltipPosition(e, tooltip);
        });
    });
}

async function populateServidoresTableFromData(data) {
    const tbody = document.getElementById('servidoresTableBody');
    if (!tbody) return;
    if (!data || !Array.isArray(data.tabela_servidores)) {
        tbody.innerHTML = '';
        return;
    }
    tbody.innerHTML = '';
    data.tabela_servidores.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.cargo}</td>
            <td>${row.genero}</td>
            <td>${row.situacao}</td>
            <td>${row.cidade}</td>
            <td>${row.estado}</td>
            <td>${row.total}</td>
        `;
        tbody.appendChild(tr);
    });
}

function setupServidoresSearch() {
    const searchWrapper = document.getElementById('servidoresSearchWrapper');
    const searchInput = document.getElementById('servidoresSearchInput');
    const tableBody = document.getElementById('servidoresTableBody');
    if (!searchWrapper || !searchInput || !tableBody) return;
    searchWrapper.addEventListener('click', function(e) {
        if (e.target === searchInput) return;
        searchWrapper.classList.toggle('active');
        if (searchWrapper.classList.contains('active')) setTimeout(() => { searchInput.focus(); }, 100);
    });
    searchInput.addEventListener('click', function(e) { e.stopPropagation(); });
    document.addEventListener('click', function(e) { if (!searchWrapper.contains(e.target)) searchWrapper.classList.remove('active'); });
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            let found = false;
            cells.forEach(cell => { if (cell.textContent.toLowerCase().includes(searchTerm)) found = true; });
            row.style.display = (found || searchTerm === '') ? '' : 'none';
        });
    });
}

function initDashboard() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { initializeDashboard(); });
    } else {
        initializeDashboard();
    }
}

// Funções auxiliares que podem não estar implementadas
function setSituacaoFuncionalFromData(data) {
    if (!data || !data.situacao_funcional || !Array.isArray(data.situacao_funcional)) {
        console.warn('Dados de situação funcional não encontrados ou inválidos');
        return;
    }
    
    const chartContainer = document.querySelector('.functional-situation-chart');
    if (!chartContainer) {
        console.warn('Container do gráfico de situação funcional não encontrado');
        return;
    }
    
    const situacoes = data.situacao_funcional;
    
    // Encontrar o valor máximo para calcular porcentagens
    const maxValor = Math.max(...situacoes.map(s => Number(s.valor) || 0));
    
    if (maxValor === 0) {
        console.warn('Nenhum valor válido encontrado nos dados de situação funcional');
        return;
    }
    
    // Função para formatar label (primeira letra maiúscula, resto minúsculo)
    const formatLabel = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    
    // Gerar as barras dinamicamente a partir dos dados do JSON
    const barsContainer = chartContainer.querySelector('.bars-container');
    if (!barsContainer) {
        console.warn('Container das barras não encontrado');
        return;
    }
    
    // Limpar barras existentes
    barsContainer.innerHTML = '';
    
    // Criar barras para cada situação funcional
    situacoes.forEach(situacao => {
        const label = situacao.label || '';
        const valor = Number(situacao.valor) || 0;
                    const percentage = (valor / maxValor) * 100;
        
        const barItem = document.createElement('div');
        barItem.className = 'bar-item';
        barItem.innerHTML = `
            <div class="bar-header">
                <div class="bar-value">${valor.toLocaleString('pt-BR')}</div>
                <div class="bar-label">${formatLabel(label)}</div>
            </div>
            <div class="bar-container">
                <div class="bar-fill functional-bar" style="width: ${percentage}%"></div>
            </div>
        `;
        barsContainer.appendChild(barItem);
    });
    
    // Atualizar os labels do eixo
    const axisLabels = chartContainer.querySelectorAll('.axis-labels span');
    if (axisLabels.length >= 2) {
        axisLabels[0].textContent = '0';
        axisLabels[1].textContent = maxValor.toLocaleString('pt-BR');
    }
    
    console.log('Gráfico de situação funcional atualizado com sucesso');
}

function setupGenderControls() {
    // TODO: Implementar se necessário
}

function animateGenderBars() {
    // TODO: Implementar se necessário
}

function animateFunctionalBars() {
    // TODO: Implementar se necessário
}

async function initializeDashboard() {
    try {
        const data = await fetchPessoasData();
        if (data) {
            setHeaderDateFromData(data);
            setKpisFromData(data);
            setGeneroFromData(data);
            createRaceTreemapFromData(data);
            setSituacaoFuncionalFromData(data);
            overrideBrazilMapDataFromJson(data);
        }

        loadBrazilMap();
        await populateServidoresTableFromData(data);
        setupGenderControls();
        setupCardHoverEffects();
        setTimeout(() => { animateKPIs(); animateGenderBars(); animateFunctionalBars(); }, 500);
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
    }
}

const brazilMapData = {};

initDashboard();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setupServidoresSearch(); });
} else {
    setupServidoresSearch();
}
