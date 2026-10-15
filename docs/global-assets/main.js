// ========================================
// GOVHUB - MAIN JAVASCRIPT FILE
// ========================================

// Função para mostrar imagens na seção interativa
function showImage(imageNumber) {
    // Esconde todas as imagens
    const images = document.querySelectorAll('.image-container');
    
    images.forEach((img, index) => {
        if (index + 1 === imageNumber) {
            img.classList.remove('image-fade-out');
            img.classList.add('image-fade-in');
        } else {
            img.classList.remove('image-fade-in');
            img.classList.add('image-fade-out');
        }
    });
}

// Função para resetar para a primeira imagem quando não há hover
function resetToFirstImage() {
    showImage(1);
}

// Função para inicializar eventos touch para mobile
function initTouchEvents() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card, index) => {
        const imageNumber = index + 1;
        
        // Touch start - mostrar imagem
        card.addEventListener('touchstart', function(e) {
            e.preventDefault();
            showImage(imageNumber);
        });
        
        // Remover o touchend que fazia o reset automático
        // Agora a imagem permanece selecionada
    });
}

// Função para menu mobile
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    
    // Verificar se os elementos existem
    if (!mobileMenuToggle || !mobileMenu || !mobileMenuOverlay || !mobileMenuClose) {
        console.warn('Elementos do menu mobile não encontrados');
        return;
    }
    
    // Toggle do menu mobile
    mobileMenuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        
        // Adicionar/remover classe no body para prevenir scroll
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Fechar menu ao clicar no overlay
    mobileMenuOverlay.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Fechar menu ao clicar no botão X
    mobileMenuClose.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Fechar menu ao clicar em um link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Fechar menu ao clicar fora dele
    document.addEventListener('click', function(event) {
        if (!mobileMenuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Fechar menu ao redimensionar a tela (se voltar para desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Função para scroll suave nos links de navegação
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Ajuste para navbar fixa
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Função para navbar com scroll
function initNavbarScroll() {
    const navbar = document.querySelector('.custom-navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Função para animações de entrada
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos que devem ser animados
    const animatedElements = document.querySelectorAll('.publication-card, .client-card, .feature-card');
    animatedElements.forEach(el => observer.observe(el));
}

// Função para preload de imagens globais
function preloadGlobalImages() {
    const globalImages = [
        // Logos globais usados em todas as páginas
        '/govhub/land/dist/images/icons/instagram.svg',
        '/govhub/land/dist/images/icons/github.svg',
        '/govhub/land/dist/images/icons/linkedin.svg',
        '/govhub/land/dist/images/logo.png',
        '/govhub/land/dist/images/lab-livre-white.svg',
        '/govhub/land/dist/images/unb_footer.png',
        '/govhub/land/dist/images/ipea_footer.png'
    ];
    
    console.log('🌐 Iniciando preload de imagens globais...');
    
    globalImages.forEach(src => {
        const img = new Image();
        img.onload = function() {
            console.log(`✅ Imagem global carregada: ${src}`);
        };
        img.onerror = function() {
            console.warn(`⚠️ Erro ao carregar imagem global: ${src}`);
        };
        img.src = src;
    });
}

// Função para inicializar todas as funcionalidades
function initApp() {
    // Inicializar funcionalidades quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initSmoothScroll();
        initNavbarScroll();
        initScrollAnimations();
        preloadGlobalImages();
        initTouchEvents(); // Adicionar chamada para initTouchEvents
        
        console.log('GovHub - Aplicação inicializada com sucesso! 🚀');
    });
}

// Inicializar a aplicação
initApp();

// Exportar funções para uso global (se necessário)
window.showImage = showImage;
