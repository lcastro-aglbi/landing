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
    // Sube 3 niveles para encontrar la carpeta Logos
    favicon.href = '../../../Logos/favicon.png';

    // =========================================================
    // THEME TOGGLE (Dark / Light Mode)
    // =========================================================
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const mobileToggle = document.getElementById('mobile-theme-toggle');
    const themeLogos = document.querySelectorAll('.theme-logo');

    // Sube 3 niveles para encontrar la carpeta Logos
    const DARK_LOGO = '../../../Logos/logo blanco.png';
    const LIGHT_LOGO = '../../../Logos/logo negro.png';

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
    // BACK TO TOP
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
    // RETURN TO ECOSYSTEM ANIMATION (Logo travels Center -> Left)
    // =========================================================
    const returnLinks = document.querySelectorAll('.back-link, .navbar .logo');
    returnLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            e.preventDefault();

            const navContainer = document.querySelector('.nav-container');
            const logo = document.querySelector('.navbar .logo');

            if (navContainer && logo) {
                const containerRect = navContainer.getBoundingClientRect();
                const logoRect = logo.getBoundingClientRect();
                const deltaX = containerRect.left - logoRect.left;

                logo.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.25, 0.64, 1)';
                logo.style.transform = `translateX(${deltaX}px)`;
            }

            document.body.style.transition = 'opacity 0.45s ease';
            document.body.style.opacity = '0.7';

            sessionStorage.setItem('agl_nav_anim', 'returning_home');

            setTimeout(() => {
                window.location.href = href;
            }, 450);
        });
    });
});