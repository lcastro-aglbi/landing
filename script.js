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
    // MOBILE MENU TOGGLE & TOUCH DRAG MANIPULATION
    // =========================================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let currentTranslateX = 0;

    function openMobileMenu() {
        if (!mobileNav) return;
        mobileNav.classList.add('active');
        mobileNav.classList.remove('dragging');
        mobileNav.style.display = 'flex';
        mobileNav.style.transform = 'translateX(0)';
        document.body.classList.add('menu-open'); // Bloquea interacción con la página principal
    }

    function closeMobileMenu() {
        if (!mobileNav) return;
        mobileNav.classList.remove('active', 'dragging');
        mobileNav.style.transform = '';
        document.body.classList.remove('menu-open'); // Libera interacción con la página principal
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) closeMobileMenu();
    });

    // --- MANIPULACIÓN TÁCTIL EN TIEMPO REAL (DRAG / MANIPULAR CON EL DEDO) ---
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        const screenWidth = window.innerWidth;
        const isOpen = mobileNav && mobileNav.classList.contains('active');

        // Permitir arrastrar si el menú está abierto O si inicia el toque cerca del borde derecho (para abrir)
        if (isOpen || startX > screenWidth - 60) {
            isDragging = true;
            if (isOpen) {
                mobileNav.classList.add('dragging');
            }
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging || !mobileNav) return;

        const touch = e.touches[0];
        currentX = touch.clientX;
        const deltaX = currentX - startX;
        const isOpen = mobileNav.classList.contains('active');

        if (isOpen) {
            // Si el menú está abierto y deslizamos a la derecha (deltaX > 0), el menú sigue al dedo
            if (deltaX > 0) {
                currentTranslateX = deltaX;
                mobileNav.style.transform = `translateX(${currentTranslateX}px)`;
            }
        } else {
            // Si el menú está cerrado y deslizamos desde el borde derecho hacia la izquierda (deltaX < 0)
            if (deltaX < 0) {
                mobileNav.style.display = 'flex';
                mobileNav.classList.add('dragging');
                const screenWidth = window.innerWidth;
                const offset = Math.max(0, screenWidth + deltaX);
                mobileNav.style.transform = `translateX(${offset}px)`;
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!isDragging || !mobileNav) return;
        isDragging = false;
        mobileNav.classList.remove('dragging');

        const isOpen = mobileNav.classList.contains('active');
        const screenWidth = window.innerWidth;

        if (isOpen) {
            // Si se arrastró más del 30% del ancho hacia la derecha, se cierra
            if (currentTranslateX > screenWidth * 0.3) {
                closeMobileMenu();
            } else {
                // Si no, regresa suavemente a la posición abierta
                openMobileMenu();
            }
        } else {
            // Si se arrastró hacia la izquierda más del 30%, se abre por completo
            const deltaX = currentX - startX;
            if (deltaX < -screenWidth * 0.3) {
                openMobileMenu();
            } else {
                // Si no se arrastró lo suficiente, se vuelve a ocultar
                closeMobileMenu();
            }
        }

        currentTranslateX = 0;
    }, { passive: true });

    // =========================================================
    // NAVBAR SCROLL EFFECT (Ocultar al bajar / Mostrar al subir)
    // =========================================================
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (!navbar) return;

        const currentScrollY = window.scrollY;

        // Fondo con desenfoque al pasar de los 50px
        navbar.classList.toggle('scrolled', currentScrollY > 50);

        // Ocultar al deslizar hacia abajo, mostrar al deslizar hacia arriba
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.classList.add('navbar-hidden');
        } else {
            navbar.classList.remove('navbar-hidden');
        }

        lastScrollY = currentScrollY;
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

        let autoScrollInterval;

        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                const scrollAmount = slides[0].clientWidth + 32;
                if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
                    carousel.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }, 3000);
        };

        const stopAutoScroll = () => {
            clearInterval(autoScrollInterval);
        };

        startAutoScroll();

        carousel.addEventListener('mouseenter', stopAutoScroll);
        carousel.addEventListener('mouseleave', startAutoScroll);
        carousel.addEventListener('touchstart', stopAutoScroll);
        carousel.addEventListener('touchend', startAutoScroll);

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

    // =========================================================
    // DETAIL PAGE TRANSITION ANIMATION (Go to Detail)
    // =========================================================
    const moreInfoBtns = document.querySelectorAll('.card-btn, a[href*="servicios/"]');
    moreInfoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            e.preventDefault();

            const navContainer = document.querySelector('.nav-container');
            const logo = document.querySelector('.navbar .logo');
            const navActions = document.querySelector('.nav-actions');
            const navLinks = document.querySelector('.nav-links');

            // 1. Logo viaja al centro horizontal
            if (navContainer && logo) {
                const containerRect = navContainer.getBoundingClientRect();
                const logoRect = logo.getBoundingClientRect();
                const currentCenter = logoRect.left + logoRect.width / 2;
                const targetCenter = containerRect.left + containerRect.width / 2;
                const deltaX = targetCenter - currentCenter;

                logo.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.25, 0.64, 1)';
                logo.style.transform = `translateX(${deltaX}px)`;
            }

            // 2. Acciones (Tema y Contacto) se desplazan a la derecha y se ocultan
            if (navActions) {
                navActions.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease';
                navActions.style.transform = 'translateX(120%)';
                navActions.style.opacity = '0';
                navActions.style.pointerEvents = 'none';
            }

            // 3. Menú de navegación central se desvanece
            if (navLinks) {
                navLinks.style.transition = 'transform 0.35s ease, opacity 0.3s ease';
                navLinks.style.transform = 'scale(0.92) translateY(-8px)';
                navLinks.style.opacity = '0';
                navLinks.style.pointerEvents = 'none';
            }

            document.body.style.transition = 'opacity 0.45s ease';
            document.body.style.opacity = '0.7';

            sessionStorage.setItem('agl_nav_anim', 'to_detail');

            setTimeout(() => {
                window.location.href = href;
            }, 450);
        });
    });

    // =========================================================
    // RETURN ANIMATION ON HOME (Logo: Center -> Left, Nav & Actions: Fade/In)
    // =========================================================
    if (sessionStorage.getItem('agl_nav_anim') === 'returning_home') {
        sessionStorage.removeItem('agl_nav_anim');

        const navContainer = document.querySelector('.nav-container');
        const logo = document.querySelector('.navbar .logo');
        const navActions = document.querySelector('.nav-actions');
        const navLinks = document.querySelector('.nav-links');

        if (navContainer && logo) {
            const containerRect = navContainer.getBoundingClientRect();
            const logoRect = logo.getBoundingClientRect();
            const currentCenter = logoRect.left + logoRect.width / 2;
            const targetCenter = containerRect.left + containerRect.width / 2;
            const deltaX = targetCenter - currentCenter;

            // 1. Estado inicial previo a la animación (Logo al centro, botones y enlaces ocultos)
            logo.style.transition = 'none';
            logo.style.transform = `translateX(${deltaX}px)`;

            if (navActions) {
                navActions.style.transition = 'none';
                navActions.style.transform = 'translateX(60px)';
                navActions.style.opacity = '0';
            }

            if (navLinks) {
                navLinks.style.transition = 'none';
                navLinks.style.transform = 'translateY(-10px) scale(0.95)';
                navLinks.style.opacity = '0';
            }

            // Forzar reflow para asegurar que el navegador aplique los estilos de inicio
            logo.getBoundingClientRect();

            // 2. Transición coordinada en paralelo
            requestAnimationFrame(() => {
                setTimeout(() => {
                    // Logo regresa a la izquierda
                    logo.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.25, 0.64, 1)';
                    logo.style.transform = 'translateX(0)';

                    // Acciones (Tema y Contacto) entran desde la derecha de forma fluida
                    if (navActions) {
                        navActions.style.transition = 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s ease';
                        navActions.style.transform = 'translateX(0)';
                        navActions.style.opacity = '1';
                    }

                    // Enlaces del menú aparecen suavemente
                    if (navLinks) {
                        navLinks.style.transition = 'transform 0.5s ease 0.1s, opacity 0.45s ease 0.1s';
                        navLinks.style.transform = 'none';
                        navLinks.style.opacity = '1';
                    }

                    // Limpieza de estilos inline al terminar
                    setTimeout(() => {
                        logo.style.transition = '';
                        logo.style.transform = '';
                        if (navActions) {
                            navActions.style.transition = '';
                            navActions.style.transform = '';
                            navActions.style.opacity = '';
                        }
                        if (navLinks) {
                            navLinks.style.transition = '';
                            navLinks.style.transform = '';
                            navLinks.style.opacity = '';
                        }
                    }, 650);
                }, 40);
            });
        }
    }

    window.addEventListener('pageshow', () => {
        const logo = document.querySelector('.navbar .logo');
        const navActions = document.querySelector('.nav-actions');
        const navLinks = document.querySelector('.nav-links');
        if (logo) { logo.style.transform = ''; logo.style.transition = ''; }
        if (navActions) { navActions.style.transform = ''; navActions.style.opacity = ''; navActions.style.transition = ''; navActions.style.pointerEvents = ''; }
        if (navLinks) { navLinks.style.transform = ''; navLinks.style.opacity = ''; navLinks.style.transition = ''; navLinks.style.pointerEvents = ''; }
        document.body.style.opacity = '';
    });
});