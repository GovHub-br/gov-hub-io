// ========================================
// INDEX (HOME) - JAVASCRIPT FILE
// ========================================

// Função para preload das imagens específicas da home
function preloadHomeImages() {
    const homeImages = [
        '/land/dist/images/contratos_homev2.png',
        '/land/dist/images/teds_homev2.png',
        '/land/dist/images/pessoal_homev2.png',
        '/land/dist/images/orcamento_homev2.png',
        '/land/dist/images/lab-livre-black.svg',
        '/land/dist/images/unb.png',
        '/land/dist/images/ipea.png'
    ];
    
    console.log('🏠 Iniciando preload das imagens da home...');
    
    let loadedCount = 0;
    const totalImages = homeImages.length;
    
    homeImages.forEach(src => {
        const img = new Image();
        
        img.onload = function() {
            loadedCount++;
            console.log(`✅ Imagem da home carregada: ${src} (${loadedCount}/${totalImages})`);
            
            if (loadedCount === totalImages) {
                console.log('🎉 Todas as imagens da home foram carregadas com sucesso!');
            }
        };
        
        img.onerror = function() {
            loadedCount++;
            console.warn(`⚠️ Erro ao carregar imagem da home: ${src} (${loadedCount}/${totalImages})`);
        };
        
        img.src = src;
    });
}

// Função para inicializar funcionalidades específicas da home
function initHome() {
    // Preload das imagens quando o DOM estiver carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preloadHomeImages);
    } else {
        preloadHomeImages();
    }
    
    console.log('🏠 Página Home inicializada com sucesso!');
}

// Inicializar quando o script for carregado
initHome();

// Função para controlar as imagens da hero mobile
function showMobileImage(imageNumber) {
    // Esconder todas as imagens mobile
    const mobileImages = document.querySelectorAll('.mobile-image-container');
    mobileImages.forEach(img => {
        img.classList.remove('mobile-image-fade-in');
        img.classList.add('mobile-image-fade-out');
    });
    
    // Mostrar a imagem selecionada
    const selectedImage = document.getElementById(`mobile-image-${imageNumber}`);
    if (selectedImage) {
        selectedImage.classList.remove('mobile-image-fade-out');
        selectedImage.classList.add('mobile-image-fade-in');
    }
}

// Exportar funções para uso global
window.preloadHomeImages = preloadHomeImages;
window.showMobileImage = showMobileImage;
