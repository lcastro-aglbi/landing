document.addEventListener('DOMContentLoaded', () => {

    // FAVICON (Sube 3 niveles a la carpeta Logos)
    let favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }
    favicon.type = 'image/png';
    favicon.href = '../../../Logos/favicon.png';

    // THEME TOGGLE (Ajuste de rutas a 3 niveles)
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const themeLogos = document.querySelectorAll('.theme-logo');

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

    // NAVBAR SCROLL
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // SCROLL ANIMATIONS
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });

    animatedElements.forEach(el => observer.observe(el));

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