document.addEventListener('DOMContentLoaded', function() {
    // Filtro por tipo: os cards trazem data-tipo, gerado pelo hook publicacoes_cards.py
    const filtros = document.querySelectorAll('.filtros-container .filtro-btn');
    const vazio = document.querySelector('.publicacoes-vazio');

    filtros.forEach(function(botao) {
        botao.addEventListener('click', function() {
            const tipo = botao.dataset.tipo;
            filtros.forEach(function(b) { b.setAttribute('aria-pressed', String(b === botao)); });
            let visiveis = 0;
            document.querySelectorAll('.publications-page-section [data-tipo]:not(button)').forEach(function(card) {
                const mostra = !tipo || card.dataset.tipo === tipo;
                card.hidden = !mostra;
                if (mostra) visiveis++;
            });
            vazio.hidden = visiveis > 0;
        });
    });

    // Funcionalidade da caixa de pesquisa
    const pesquisaBtn = document.getElementById('pesquisa-btn');
    const pesquisaInputContainer = document.getElementById('pesquisa-input-container');
    const pesquisaInput = document.getElementById('pesquisa-input');
    const fecharPesquisaBtn = document.getElementById('fechar-pesquisa-btn');

    // Abrir caixa de pesquisa
    pesquisaBtn.addEventListener('click', function() {
        pesquisaInputContainer.classList.add('active');
        pesquisaInput.focus();
    });

    // Fechar caixa de pesquisa
    fecharPesquisaBtn.addEventListener('click', function() {
        pesquisaInputContainer.classList.remove('active');
        pesquisaInput.value = '';
    });

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && pesquisaInputContainer.classList.contains('active')) {
            pesquisaInputContainer.classList.remove('active');
            pesquisaInput.value = '';
        }
    });

    // Fechar ao clicar fora da caixa
    document.addEventListener('click', function(e) {
        if (!pesquisaInputContainer.contains(e.target) && !pesquisaBtn.contains(e.target)) {
            pesquisaInputContainer.classList.remove('active');
            pesquisaInput.value = '';
        }
    });
});
