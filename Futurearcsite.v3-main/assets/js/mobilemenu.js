document.addEventListener('DOMContentLoaded', () => {
    // --- Kod för den nya mobilmenyn ---
    const menuToggleBtn = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const closeBtn = document.querySelector('.mobile-nav-close');

    const openMenu = () => {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (menuToggleBtn && mobileNav && closeBtn) {
        menuToggleBtn.addEventListener('click', openMenu);
        closeBtn.addEventListener('click', closeMenu);
    }

    // --- Kod för "Smart" Header på scroll (endast för startsidan) ---
    if (document.body.classList.contains('homepage')) {
        const header = document.querySelector('.floating-header');
        if (header) {
            const scrollThreshold = 50;
            window.addEventListener('scroll', () => {
                if (window.scrollY > scrollThreshold) {
                    header.classList.add('header-scrolled');
                } else {
                    header.classList.remove('header-scrolled');
                }
            });
        }
    }
});