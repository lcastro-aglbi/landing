document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close mobile menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

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

    // ── Validación de campos: solo letras, números y espacios ──────────────
    // Regex: letras (incluyendo acentos y ñ), números y espacios
    const soloLetrasNumeros = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]+$/;

    const camposRestringidos = [
        { id: 'nombre',   label: 'Nombre completo' },
        { id: 'empresa',  label: 'Nombre de la empresa' },
        { id: 'cargo',    label: 'Cargo / Puesto' },
        { id: 'sector',   label: 'Sector / Industria' },
        { id: 'telefono', label: 'Teléfono / WhatsApp' },
        { id: 'codigo',   label: 'Código de referencia' }
    ];

    camposRestringidos.forEach(({ id }) => {
        const input = document.getElementById(id);
        if (!input) return;

        // Bloquea símbolos en tiempo real mientras el usuario escribe
        input.addEventListener('input', () => {
            // Reemplaza cualquier carácter que no sea letra, número, espacio o acento
            const cursor = input.selectionStart;
            const original = input.value;
            const limpio = original.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
            if (original !== limpio) {
                input.value = limpio;
                // Restaura la posición del cursor tras limpiar
                input.setSelectionRange(cursor - (original.length - limpio.length), cursor - (original.length - limpio.length));
            }
            // Quita error visual si el campo ya es válido
            clearFieldError(input);
        });
    });

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

    // ── Lógica de envío del formulario ───────────────────────────────────────
    const diagnosticoForm = document.getElementById('diagnostico-form');
    if (diagnosticoForm) {
        diagnosticoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validación pre-envío
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
            const APPSHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwOgSJXFioMA9yx5_ZjxrFFUcD8wkj5imAdGJX_6NzpMANX5l_y-D5ZoYjz-Ca2DpQW/exec';

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
});
