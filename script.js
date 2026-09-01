document.addEventListener('DOMContentLoaded', () => {

    let favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }
    favicon.type = 'image/png';
    favicon.href = 'Logos/favicon.png';

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

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

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
                formMessage.textContent = 'Hubo un error al enviar el formulario. Por favor, intenta de nuevo o contáctanos por WhatsApp.';
                formMessage.classList.add('error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar <i class="fas fa-arrow-right"></i>';
            }
        });
    }

    const footerBackToTop = document.getElementById('back-to-top-footer');
    if (footerBackToTop) {
        footerBackToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const carousel = document.getElementById('industries-carousel');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (carousel && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            const scrollAmount = carousel.clientWidth;
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            const scrollAmount = carousel.clientWidth;
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }
});

// =========================================================
// TRANSLATION TOGGLE (ES / EN)
// =========================================================
const translations = {
    es: {
        // Navbar & Mobile Nav
        nav_about: "¿Qué hacemos?",
        nav_diag: "Diagnóstico",
        nav_ind: "Industrias",
        nav_eco: "Ecosistema",
        nav_int: "Integración",
        nav_val: "Propuesta de Valor",
        nav_contact: "Contacto",
        nav_about_mob: "¿Qué hacemos?",
        nav_diag_mob: "Diagnóstico",
        nav_ind_mob: "Industrias",
        nav_eco_mob: "Ecosistema",
        nav_int_mob: "Integración",
        nav_val_mob: "Propuesta de Valor",
        nav_contact_mob: "Contacto",

        // Hero
        hero_title: "Evoluciona tu operación <br><span class='gradient-text'>sin detener tu negocio</span>",
        hero_desc: "Transformamos datos operativos en indicadores (KPIs) en el tiempo justo para accionar y proteger la rentabilidad de tu negocio.",
        hero_btn: "Inicia tu evolución <i class='fas fa-arrow-right'></i>",

        // About
        about_title: "¿Qué hacemos en AGL Latinoamérica?",
        about_subtitle: '"Nacidos en la operación directa en campo, no en un laboratorio de software."',
        about_c1_title: "Transformación Operacional",
        about_c1_desc: "AGL Latinoamérica es una empresa especializada en la transformación operacional que combina consultoría estratégica, ingeniería y software para las industrias más exigentes.",
        about_c1_li1: "<i class='fas fa-check-circle'></i> Transformacion Operacional",
        about_c1_li2: "<i class='fas fa-check-circle'></i> Servicios clave o SaaS",
        about_c1_li3: "<i class='fas fa-check-circle'></i> Herramientas y Big Data",
        about_c2_title: "Transferencia de Conocimiento",
        about_c2_desc: "Llevamos la experiencia real de campo a tu organización. Codificamos años de conocimiento operativo industrial en tecnología ágil para convertir procesos complejos en operaciones simples y medibles.",
        about_c3_title: "Nuestro Propósito",
        about_c3_desc: "Empoderar a tu dirección con visibilidad operativa continua y capacidad de anticipación. Garantizamos la toma de decisiones basada en datos para llevar a tu empresa a la excelencia operativa.",

        // Symptoms
        symp_title: "Síntomas comunes de una operación que necesita evolucionar",
        symp_1: 'Dependencia de personas clave: "Tu operación se detiene o pierde calidad si falta una persona clave. El conocimiento crítico vive en la mente del personal y no en un proceso institucionalizado."',
        symp_2: 'Información tardía y retrabajos: "Te enteras de las pérdidas, cuellos de botella o errores cuando ya afectaron tu margen. Tomas decisiones con datos de \'ayer\' y no en tiempo para tomar acción."',
        symp_3: 'Dependencia de hojas de cálculo: "El negocio intenta gestionarse con decenas de hojas de cálculo desconectadas, propensas a errores humanos y que nadie actualiza a tiempo."',
        symp_4: 'Sistemas rígidos que nadie usa: "Invertiste en un ERP o software costoso que el equipo de campo terminó rechazando por complejo, obligándolos a volver a los registros en papel u hojas de cálculo."',

        // Diagnostic
        diag_title: "Diagnóstico Operacional AGL®",
        diag_c1_title: "1. Evaluación de Pilares Operativos",
        diag_c1_desc: "Analizamos la salud global de tu operación evaluando 6 áreas críticas: estructura organizacional, estandarización, flujo de datos, control de errores, cultura de cambio e impacto financiero.",
        diag_c2_title: "2. Entrega del Dictamen IPO",
        diag_c2_desc: "Procesamos la información recopilada para entregarte un Dictamen Operativo que incluye:",
        diag_c2_li1: "<strong>Índice de Preparación Operacional (IPO) exacto.</strong>",
        diag_c2_li2: "<strong>Nivel de Madurez Actual</strong> (silos o dependencia de personas).",
        diag_c3_title: "3. Hoja de Ruta hacia la Excelencia",
        diag_c3_desc: "Prioridades clave de corrección y una propuesta estratégica para eliminar retrabajos, automatizar la información y escalar tu excelencia operativa.",

        // Industries
        ind_title: "Industrias que impulsamos hacia la excelencia",
        ind_desc: "Nuestra experiencia abarca diversos sectores clave adaptando las soluciones a tu operación.",
        ind_1: "Minería",
        ind_2: "Construcción",
        ind_3: "Logística y Transporte",
        ind_4: "Manufactura Planta",
        ind_5: "Servicios de Comercio",
        ind_6: "Agroindustria",

        // Ecosystem
        eco_title: "Ecosistema de Soluciones AGL",
        eco_subtitle: "Diseñadas desde la operación",
        eco_c1_title: "Tableros de Control",
        eco_c1_desc: "Visualización de datos clave (KPIs) en tiempo real para toma de decisiones ágiles.",
        eco_c2_title: "Digitalización",
        eco_c2_desc: "Eliminación de papel y procesos manuales mediante herramientas a medida.",
        eco_c3_title: "Integración de Sistemas",
        eco_c3_desc: "Conectamos diferentes fuentes de datos para una única fuente de la verdad.",

        // Integration
        int_title: "¿Cómo nos integramos con tu empresa sin paralizar tu operación?",
        int_1: "<strong>Servicio Catalizador: </strong>Atacamos el punto de mayor problemática operativa o fuga financiera primero. Generamos victorias rápidas e impacto directo en semanas, sin detener la operación diaria de tu empresa.",
        int_2: "<strong>Escalabilidad Gradual: </strong> Evolucionamos al ritmo de tu equipo. Habilitamos módulos y automatizaciones de forma progresiva para garantizar una adopción natural y sin curva de frustración.",
        int_3: "<strong>¿Ya cuentas con software? </strong> No reemplazamos tu ERP existente, lo potenciamos. Actuamos como la capa ágil de captura y control que conecta el trabajo en campo con tu sistema actual.",

        // Value Prop
        val_title: "Nuestra propuesta de valor",
        val_desc: "Ecosistema de Soluciones AGL - Diseñadas desde la operación",
        val_c1_title: "Consultoría + Tecnología",
        val_c1_desc: "No solo te decimos qué hacer en un reporte estático; construimos y desplegamos la herramienta para ejecutarlo de punta a punta.",
        val_c2_title: "Control Centralizado",
        val_c2_desc: "Unificamos la información dispersa de tus áreas operativas y administrativas en un solo centro de mando claro y accesible.",
        val_c3_title: "Automatización Escalable",
        val_c3_desc: "Convertimos las tareas manuales, repetitivas y en papel en flujos digitales automáticos y libres de error humano.",
        val_c4_title: "Visibilidad e Impacto en margen",
        val_c4_desc: "Transformamos datos operativos en indicadores (KPIs) en el tiempo justo para accionar y para proteger la rentabilidad de tu negocio.",

        // Form
        form_title: "Agenda tu <span class='highlight-green'>Diagnóstico</span>",
        form_desc: "Completa tus datos para personalizar la sesión de análisis operativo.",
        form_lbl_name: "NOMBRE COMPLETO <span class='required'>*</span>",
        form_lbl_phone: "TELÉFONO / WHATSAPP <span class='required'>*</span>",
        form_lbl_company: "NOMBRE DE LA EMPRESA <span class='required'>*</span>",
        form_lbl_role: "CARGO / PUESTO <span class='required'>*</span>",
        form_lbl_sector: "SECTOR / INDUSTRIA <span class='required'>*</span>",
        form_lbl_code: "CÓDIGO DE REFERENCIA <span class='required'>*</span>",
        form_lbl_area: "¿Qué área necesitas reforzar primero? <span class='required'>*</span>",
        form_rad_op: "Operativa<br><small>Business Operations, MasterMend, Risk</small>",
        form_rad_adm: "Administrativa<br><small>WorkForce, Supply, ProFinance</small>",
        form_btn: "Enviar <i class='fas fa-arrow-right'></i>",

        // Footer
        footer_desc: "Nacidos en la operación directa en campo, impulsando la excelencia.",
        footer_totop: "<span>Volver arriba</span> <i class='fas fa-arrow-up'></i>",
        footer_copy: "&copy; 2026 AGL Latinoamérica. Todos los derechos reservados."
    },
    en: {
        // Navbar & Mobile Nav
        nav_about: "What we do",
        nav_diag: "Diagnosis",
        nav_ind: "Industries",
        nav_eco: "Ecosystem",
        nav_int: "Integration",
        nav_val: "Value Proposition",
        nav_contact: "Contact",
        nav_about_mob: "What we do",
        nav_diag_mob: "Diagnosis",
        nav_ind_mob: "Industries",
        nav_eco_mob: "Ecosystem",
        nav_int_mob: "Integration",
        nav_val_mob: "Value Proposition",
        nav_contact_mob: "Contact",

        // Hero
        hero_title: "Evolve your operation <br><span class='gradient-text'>without stopping your business</span>",
        hero_desc: "We transform operational data into indicators (KPIs) right on time to take action and protect your business profitability.",
        hero_btn: "Start your evolution <i class='fas fa-arrow-right'></i>",

        // About
        about_title: "What do we do at AGL Latinoamérica?",
        about_subtitle: '"Born in direct field operations, not in a software lab."',
        about_c1_title: "Operational Transformation",
        about_c1_desc: "AGL Latinoamérica specializes in operational transformation, combining strategic consulting, engineering, and software for the most demanding industries.",
        about_c1_li1: "<i class='fas fa-check-circle'></i> Operational Transformation",
        about_c1_li2: "<i class='fas fa-check-circle'></i> Core Services or SaaS",
        about_c1_li3: "<i class='fas fa-check-circle'></i> Tools & Big Data",
        about_c2_title: "Knowledge Transfer",
        about_c2_desc: "We bring real field experience to your organization. We code years of industrial operational knowledge into agile technology to turn complex processes into simple, measurable operations.",
        about_c3_title: "Our Purpose",
        about_c3_desc: "Empower your management with continuous operational visibility and anticipation capabilities. We guarantee data-driven decision-making to lead your company to operational excellence.",

        // Symptoms
        symp_title: "Common symptoms of an operation that needs to evolve",
        symp_1: 'Dependence on key people: "Your operation stops or loses quality if a key person is missing. Critical knowledge lives in the staff\'s minds, not in an institutionalized process."',
        symp_2: 'Delayed information and rework: "You learn about losses, bottlenecks, or errors when they have already affected your margin. You make decisions with yesterday\'s data, not in time to take action."',
        symp_3: 'Dependence on spreadsheets: "The business tries to manage itself with dozens of disconnected spreadsheets, prone to human error and rarely updated on time."',
        symp_4: 'Rigid systems nobody uses: "You invested in an expensive ERP or software that the field team ended up rejecting for being too complex, forcing them back to paper records or spreadsheets."',

        // Diagnostic
        diag_title: "AGL® Operational Diagnosis",
        diag_c1_title: "1. Evaluation of Operational Pillars",
        diag_c1_desc: "We analyze the overall health of your operation by evaluating 6 critical areas: organizational structure, standardization, data flow, error control, culture of change, and financial impact.",
        diag_c2_title: "2. Delivery of the IPO Report",
        diag_c2_desc: "We process the collected information to deliver an Operational Report that includes:",
        diag_c2_li1: "<strong>Exact Operational Readiness Index (IPO).</strong>",
        diag_c2_li2: "<strong>Current Maturity Level</strong> (silos or dependence on people).",
        diag_c3_title: "3. Roadmap to Excellence",
        diag_c3_desc: "Key priorities for correction and a strategic proposal to eliminate rework, automate information, and scale your operational excellence.",

        // Industries
        ind_title: "Industries we drive towards excellence",
        ind_desc: "Our experience covers various key sectors, adapting solutions to your operation.",
        ind_1: "Mining",
        ind_2: "Construction",
        ind_3: "Logistics & Transport",
        ind_4: "Plant Manufacturing",
        ind_5: "Commercial Services",
        ind_6: "Agribusiness",

        // Ecosystem
        eco_title: "AGL Solutions Ecosystem",
        eco_subtitle: "Designed from the operation",
        eco_c1_title: "Dashboards",
        eco_c1_desc: "Visualization of key data (KPIs) in real-time for agile decision-making.",
        eco_c2_title: "Digitalization",
        eco_c2_desc: "Elimination of paper and manual processes through custom tools.",
        eco_c3_title: "System Integration",
        eco_c3_desc: "We connect different data sources for a single source of truth.",

        // Integration
        int_title: "How do we integrate with your company without paralyzing your operation?",
        int_1: "<strong>Catalyst Service: </strong>We attack the point of greatest operational issue or financial leak first. We generate quick wins and direct impact in weeks, without stopping your company's daily operation.",
        int_2: "<strong>Gradual Scalability: </strong> We evolve at your team's pace. We enable modules and automations progressively to ensure natural adoption without a frustration curve.",
        int_3: "<strong>Already have software? </strong> We don't replace your existing ERP; we enhance it. We act as the agile data capture and control layer that connects fieldwork with your current system.",

        // Value Prop
        val_title: "Our Value Proposition",
        val_desc: "AGL Solutions Ecosystem - Designed from the operation",
        val_c1_title: "Consulting + Technology",
        val_c1_desc: "We don't just tell you what to do in a static report; we build and deploy the tool to execute it end-to-end.",
        val_c2_title: "Centralized Control",
        val_c2_desc: "We unify scattered information from your operational and administrative areas into a single, clear, and accessible command center.",
        val_c3_title: "Scalable Automation",
        val_c3_desc: "We turn manual, repetitive, and paper-based tasks into automatic digital workflows free of human error.",
        val_c4_title: "Visibility and Margin Impact",
        val_c4_desc: "We transform operational data into indicators (KPIs) right on time to take action and protect your business profitability.",

        // Form
        form_title: "Schedule your <span class='highlight-green'>Diagnosis</span>",
        form_desc: "Fill in your details to customize the operational analysis session.",
        form_lbl_name: "FULL NAME <span class='required'>*</span>",
        form_lbl_phone: "PHONE / WHATSAPP <span class='required'>*</span>",
        form_lbl_company: "COMPANY NAME <span class='required'>*</span>",
        form_lbl_role: "JOB TITLE / ROLE <span class='required'>*</span>",
        form_lbl_sector: "SECTOR / INDUSTRY <span class='required'>*</span>",
        form_lbl_code: "REFERENCE CODE <span class='required'>*</span>",
        form_lbl_area: "Which area do you need to reinforce first? <span class='required'>*</span>",
        form_rad_op: "Operational<br><small>Business Operations, MasterMend, Risk</small>",
        form_rad_adm: "Administrative<br><small>WorkForce, Supply, ProFinance</small>",
        form_btn: "Submit <i class='fas fa-arrow-right'></i>",

        // Footer
        footer_desc: "Born in direct field operations, driving excellence.",
        footer_totop: "<span>Back to top</span> <i class='fas fa-arrow-up'></i>",
        footer_copy: "&copy; 2026 AGL Latinoamérica. All rights reserved."
    }
};

let currentLang = 'es';
const langToggleBtn = document.getElementById('lang-toggle');

if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'es' ? 'en' : 'es';

        // Actualiza el texto del botón
        langToggleBtn.textContent = currentLang === 'es' ? 'EN' : 'ES';

        // Recorre todos los elementos con data-key y cambia el texto
        document.querySelectorAll('[data-key]').forEach(elem => {
            const key = elem.getAttribute('data-key');
            if (translations[currentLang][key]) {
                elem.innerHTML = translations[currentLang][key];
            }
        });
    });
}