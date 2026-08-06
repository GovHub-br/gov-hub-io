document.addEventListener('DOMContentLoaded', function() {
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
