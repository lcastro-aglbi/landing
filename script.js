document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // FAVICON
    // =========================================================
    let favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }
    favicon.type = 'image/png';
    favicon.href = 'Logos/favicon.png';

    // =========================================================
    // THEME TOGGLE (Dark ↔ Light Mode)
    // =========================================================
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const mobileToggle = document.getElementById('mobile-theme-toggle');
    const themeLogos = document.querySelectorAll('.theme-logo');

    const DARK_LOGO = 'Logos/logo blanco.png';
    const LIGHT_LOGO = 'Logos/logo negro.png';

    function applyTheme(theme) {
        if (theme === 'light') {
            htmlEl.setAttribute('data-theme', 'light');
            themeLogos.forEach(img => img.src = LIGHT_LOGO);
        } else {
            htmlEl.removeAttribute('data-theme');
            themeLogos.forEach(img => img.src = DARK_LOGO);
        }
        localStorage.setItem('agl-theme', theme);
    }

    function toggleTheme() {
        const current = htmlEl.getAttribute('data-theme');
        applyTheme(current === 'light' ? 'dark' : 'light');
    }

    const savedTheme = localStorage.getItem('agl-theme') || 'dark';
    applyTheme(savedTheme);

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileToggle) mobileToggle.addEventListener('click', toggleTheme);

    // =========================================================
    // MOBILE MENU TOGGLE
    // =========================================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function openMobileMenu() {
        if (!mobileNav) return;
        mobileNav.classList.add('active');
        mobileNav.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        if (!mobileNav) return;
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) closeMobileMenu();
    });

    // =========================================================
    // NAVBAR SCROLL EFFECT
    // =========================================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // =========================================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // =========================================================
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // =========================================================
    // FORM VALIDATION & SANITIZATION
    // =========================================================
    const soloLetrasNumeros = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]+$/;

    const camposRestringidos = [
        { id: 'nombre', label: 'Nombre completo' },
        { id: 'empresa', label: 'Nombre de la empresa' },
        { id: 'cargo', label: 'Cargo / Puesto' },
        { id: 'sector', label: 'Sector / Industria' },
        { id: 'telefono', label: 'Teléfono / WhatsApp' },
        { id: 'codigo', label: 'Código de referencia' }
    ];

    function showFieldError(input, message) {
        input.classList.add('input-error');
        let errorEl = input.parentElement.querySelector('.field-error-msg');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error-msg';
            input.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }

    function clearFieldError(input) {
        input.classList.remove('input-error');
        const errorEl = input.parentElement.querySelector('.field-error-msg');
        if (errorEl) errorEl.remove();
    }

    camposRestringidos.forEach(({ id }) => {
        const input = document.getElementById(id);
        if (!input) return;

        input.addEventListener('input', () => {
            const cursor = input.selectionStart;
            const original = input.value;
            const limpio = original.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
            if (original !== limpio) {
                input.value = limpio;
                input.setSelectionRange(cursor - (original.length - limpio.length), cursor - (original.length - limpio.length));
            }
            clearFieldError(input);
        });
    });

    // =========================================================
    // FORM SUBMISSION (Google Apps Script Webhook)
    // =========================================================
    const diagnosticoForm = document.getElementById('diagnostico-form');
    if (diagnosticoForm) {
        diagnosticoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let hayErrores = false;
            camposRestringidos.forEach(({ id, label }) => {
                const input = document.getElementById(id);
                if (!input) return;
                const valor = input.value.trim();
                if (!valor) {
                    showFieldError(input, `${label} es requerido.`);
                    hayErrores = true;
                } else if (!soloLetrasNumeros.test(valor)) {
                    showFieldError(input, `${label} solo admite letras y números, sin símbolos.`);
                    hayErrores = true;
                } else {
                    clearFieldError(input);
                }
            });

            if (hayErrores) return;

            const submitBtn = document.getElementById('submit-btn');
            const formMessage = document.getElementById('form-message');

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';
            formMessage.textContent = '';
            formMessage.className = 'form-message';

            const formData = new FormData(diagnosticoForm);
            const rawData = Object.fromEntries(formData.entries());

            const payload = {
                "id_unico": Math.random().toString(36).substring(2, 9).toUpperCase(),
                "nombre_completo": rawData.nombre,
                "telefono": rawData.telefono,
                "empresa": rawData.empresa,
                "cargo": rawData.cargo,
                "sector": rawData.sector,
                "codigo_referencia": rawData.codigo,
                "area_reforzar": rawData.area
            };

            const APPSHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwOgSJXFioMA9yx5_ZjxrFFUcD8wkj5imAdGJX_6NzpMANX5l_y-D5ZoYjz-Ca2DpQW/exec';

            try {
                await fetch(APPSHEET_WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: JSON.stringify(payload)
                });

                formMessage.textContent = '¡Gracias! Tus datos han sido enviados exitosamente. Nos pondremos en contacto pronto.';
                formMessage.classList.add('success');
                diagnosticoForm.reset();

            } catch (error) {
                console.error('Error submitting form:', error);
                formMessage.textContent = 'Hubo un error al enviar el formulario. Por favor, intenta de nuevo o contáctanos por WhatsApp.';
                formMessage.classList.add('error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar <i class="fas fa-arrow-right"></i>';
            }
        });
    }

    // =========================================================
    // BACK TO TOP SCROLL LOGIC
    // =========================================================
    const footerBackToTop = document.getElementById('back-to-top-footer');
    if (footerBackToTop) {
        footerBackToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // =========================================================
    // CAROUSEL LOGIC (AUTO-SCROLL & ILUMINACIÓN)
    // =========================================================
    const carousel = document.getElementById('industries-carousel');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const slides = document.querySelectorAll('.carousel-slide');

    if (carousel && slides.length > 0) {
        // 1. Iluminación: Observer para detectar cuáles están visibles
        const carouselObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active-slide');
                } else {
                    entry.target.classList.remove('active-slide');
                }
            });
        }, {
            root: carousel,
            threshold: 0.75
        });

        slides.forEach(slide => carouselObserver.observe(slide));

        // 2. Movimiento automático (poco a poco)
        let autoScrollInterval;

        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                const scrollAmount = slides[0].clientWidth + 32;
                if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
                    carousel.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }, 5000);
        };

        const stopAutoScroll = () => {
            clearInterval(autoScrollInterval);
        };

        startAutoScroll();

        // Pausa automática si el usuario interactúa
        carousel.addEventListener('mouseenter', stopAutoScroll);
        carousel.addEventListener('mouseleave', startAutoScroll);
        carousel.addEventListener('touchstart', stopAutoScroll);
        carousel.addEventListener('touchend', startAutoScroll);

        // 3. Botones manuales
        if (prevBtn && nextBtn) {
            nextBtn.addEventListener('click', () => {
                const scrollAmount = slides[0].clientWidth + 32;
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });

            prevBtn.addEventListener('click', () => {
                const scrollAmount = slides[0].clientWidth + 32;
                carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }
    }
});