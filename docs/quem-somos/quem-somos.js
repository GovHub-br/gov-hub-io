// ========================================
// QUEM SOMOS - JAVASCRIPT FILE
// ========================================

// Função para preload das imagens da equipe
function preloadTeamImages() {
    const teamImages = [
        // UnB Team
        '/land/dist/images/equipe/alex_reis.png',
        '/land/dist/images/equipe/carla.png',
        '/land/dist/images/equipe/laila.png',
        '/land/dist/images/equipe/isaque.png',
        '/land/dist/images/equipe/joao.png',
        '/land/dist/images/equipe/arthur.png',
        '/land/dist/images/equipe/davi.png',
        '/land/dist/images/equipe/joyce.png',
        '/land/dist/images/equipe/mateus.png',
        '/land/dist/images/equipe/guilherme_gusmao.jpg',
        '/land/dist/images/equipe/vinicius.png',
        
        // IPEA Team
        '/land/dist/images/equipe/fernando_gaiger.png',
        '/land/dist/images/equipe/gustavo_camilo.png',
        
        // Parceiros
        '/land/dist/images/equipe/joao_freitas.jpeg',
        '/land/dist/images/equipe/matheus_dias.jpeg',
        '/land/dist/images/equipe/pedro_rossi.jpeg',
        '/land/dist/images/equipe/victor_suzuki.png'
    ];
    
    console.log('🔄 Iniciando preload das imagens da equipe...');
    
    let loadedCount = 0;
    const totalImages = teamImages.length;
    
    teamImages.forEach(src => {
        const img = new Image();
        
        img.onload = function() {
            loadedCount++;
            console.log(`✅ Imagem carregada: ${src} (${loadedCount}/${totalImages})`);
            
            if (loadedCount === totalImages) {
                console.log('🎉 Todas as imagens da equipe foram carregadas com sucesso!');
            }
        };
        
        img.onerror = function() {
            loadedCount++;
            console.warn(`⚠️ Erro ao carregar imagem: ${src} (${loadedCount}/${totalImages})`);
        };
        
        img.src = src;
    });
}

// Função para inicializar funcionalidades específicas da página Quem Somos
function initQuemSomos() {
    // Preload das imagens quando o DOM estiver carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preloadTeamImages);
    } else {
        preloadTeamImages();
    }
    
    console.log('👥 Página Quem Somos inicializada com sucesso!');
}

// Inicializar quando o script for carregado
initQuemSomos();

// Exportar função para uso global (se necessário)
window.preloadTeamImages = preloadTeamImages;
