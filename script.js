document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // THEME TOGGLE (Dark ↔ Light Mode)
    // =========================================================
    const htmlEl        = document.documentElement;
    const themeToggle   = document.getElementById('theme-toggle');
    const mobileToggle  = document.getElementById('mobile-theme-toggle');
    const themeLogos    = document.querySelectorAll('.theme-logo');

    const DARK_LOGO  = 'Logos/logo blanco.png';
    const LIGHT_LOGO = 'Logos/logo negro.png';

    // Apply theme and update logos
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

    // Load saved preference on page load
    const savedTheme = localStorage.getItem('agl-theme') || 'dark';
    applyTheme(savedTheme);

    if (themeToggle)  themeToggle.addEventListener('click', toggleTheme);
    if (mobileToggle) mobileToggle.addEventListener('click', toggleTheme);

    // =========================================================
    // MOBILE MENU TOGGLE
    // =========================================================
    const mobileMenuBtn  = document.getElementById('mobile-menu-btn');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    const mobileNav      = document.getElementById('mobile-nav');
    const mobileLinks    = document.querySelectorAll('.mobile-link');

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

    // Cerrar al hacer click en un link
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Cerrar si se amplía la pantalla a desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) closeMobileMenu();
    });

    // =========================================================
    // NAVBAR SCROLL EFFECT
    // =========================================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Scroll Animations using Intersection Observer
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Unobserve once animated
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Diagnostico Form Submit Logic
    const diagnosticoForm = document.getElementById('diagnostico-form');
    if (diagnosticoForm) {
        diagnosticoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submit-btn');
            const formMessage = document.getElementById('form-message');

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';
            formMessage.textContent = '';
            formMessage.className = 'form-message';

            // Gather form data
            const formData = new FormData(diagnosticoForm);
            const rawData = Object.fromEntries(formData.entries());

            // Payload — claves deben coincidir EXACTAMENTE con el Apps Script
            // La fecha la genera el servidor con new Date()
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

            console.log('Enviando payload:', JSON.stringify(payload, null, 2));

            // New Google Apps Script Webhook URL
            const APPSHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxBp0h4DgfMm9MNTBgTsNPQFmEBD5WKqSDatxNzjYjEvZaOqAmnBiupBNVWZFTJfGyH/exec';

            try {
                // Content-Type debe ser text/plain para evitar preflight CORS con no-cors
                // Google Apps Script igual puede leer el JSON con e.postData.contents
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

    // Back to Top Scroll Logic
    const footerBackToTop = document.getElementById('back-to-top-footer');

    if (footerBackToTop) {
        footerBackToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
