// Mangalam HDPE Pipes - Interactivity Script

// ========================
// UTILITIES
// ========================

/**
 * Detects if the device is touch-enabled
 * @returns {boolean}
 */
const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
};

// ========================
// IMAGE CAROUSEL
// ========================
const heroImages = [
    'assets/Frame 2147223897.png',
    'assets/Fishnet Manufacturing Image (1) 1.png',
    'assets/Fishnet Manufacturing Image (1) 2.png',
];

let currentIndex = 0;

/**
 * Navigates to a specific slide in the hero carousel
 * @param {number} index 
 */
function goToSlide(index) {
    const mainImg = document.getElementById('hero-main-img');
    const thumbs = document.querySelectorAll('.thumb');

    if (!mainImg) return;

    // Clamp index with wrap-around
    currentIndex = (index + heroImages.length) % heroImages.length;

    mainImg.style.opacity = '0';
    setTimeout(() => {
        mainImg.src = heroImages[currentIndex];
        mainImg.style.opacity = '1';
        // Update zoom preview source when image changes
        updateZoomBackground(mainImg.src);
    }, 150);

    // Update active state of thumbnails
    thumbs.forEach(thumb => thumb.classList.remove('active'));
    const activeThumb = document.querySelector(`.thumb[data-index="${currentIndex}"]`);
    if (activeThumb) activeThumb.classList.add('active');
}

// ========================
// STICKY SCROLL HEADER
// ========================

/**
 * Initializes the sticky header that appears after scrolling past the first fold
 */
function initStickyHeader() {
    const stickyHeader = document.getElementById('stickyScrollHeader');
    const heroSection = document.querySelector('.hero');

    if (!stickyHeader || !heroSection) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateStickyHeader() {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        const scrollY = window.scrollY;
        const scrollingUp = scrollY < lastScrollY;

        // Show sticky header when scrolled past the hero section (first fold)
        if (heroBottom < 0) {
            // We're past the hero - show if scrolling down, hide if scrolling up
            if (scrollingUp) {
                stickyHeader.classList.remove('visible');
            } else {
                stickyHeader.classList.add('visible');
            }
        } else {
            // Still in hero area, always hide
            stickyHeader.classList.remove('visible');
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateStickyHeader);
            ticking = true;
        }
    }, { passive: true });
}

// ========================
// CAROUSEL IMAGE ZOOM
// ========================

/**
 * Updates the background image of the zoom preview panel
 * @param {string} src 
 */
function updateZoomBackground(src) {
    const zoomPreview = document.getElementById('zoomPreview');
    if (zoomPreview) {
        zoomPreview.style.backgroundImage = `url('${src}')`;
    }
}

/**
 * Initializes the zoom lens functionality for the hero carousel
 * Disabled on touch devices for better UX
 */
function initCarouselZoom() {
    if (isTouchDevice()) return;

    const wrapper = document.getElementById('carouselWrapper');
    const mainImg = document.getElementById('hero-main-img');
    const lens = document.getElementById('zoomLens');
    const preview = document.getElementById('zoomPreview');

    if (!wrapper || !mainImg || !lens || !preview) return;

    const ZOOM_FACTOR = 2.8;
    const LENS_SIZE = 120;
    const PREVIEW_SIZE = 340;

    // Set initial background
    updateZoomBackground(mainImg.src);

    function onMouseMove(e) {
        const rect = mainImg.getBoundingClientRect();

        // Get cursor position relative to the image
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // Clamp to image bounds
        x = Math.max(LENS_SIZE / 2, Math.min(x, rect.width - LENS_SIZE / 2));
        y = Math.max(LENS_SIZE / 2, Math.min(y, rect.height - LENS_SIZE / 2));

        // Position the lens (centered on cursor)
        lens.style.left = `${x - LENS_SIZE / 2}px`;
        lens.style.top = `${y - LENS_SIZE / 2}px`;

        // Calculate background position percentage
        const xPercent = (x - LENS_SIZE / 2) / (rect.width - LENS_SIZE);
        const yPercent = (y - LENS_SIZE / 2) / (rect.height - LENS_SIZE);

        const bgX = -(xPercent * (rect.width * ZOOM_FACTOR - PREVIEW_SIZE));
        const bgY = -(yPercent * (rect.height * ZOOM_FACTOR - PREVIEW_SIZE));

        preview.style.backgroundPosition = `${bgX}px ${bgY}px`;
        preview.style.backgroundSize = `${rect.width * ZOOM_FACTOR}px ${rect.height * ZOOM_FACTOR}px`;
    }

    wrapper.addEventListener('mousemove', onMouseMove);

    // Sync zoom preview with main image changes
    const imgObserver = new MutationObserver(() => {
        updateZoomBackground(mainImg.src);
    });
    imgObserver.observe(mainImg, { attributes: true, attributeFilter: ['src'] });
}

// ========================
// MOBILE NAVIGATION
// ========================

/**
 * Initializes the mobile hamburger menu toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileOverlay = document.getElementById('mobileNavOverlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!menuToggle || !mobileOverlay) return;

    const toggleMenu = () => {
        const isOpened = menuToggle.classList.contains('active');
        menuToggle.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = isOpened ? '' : 'hidden'; // Prevent scrolling when menu is open
        menuToggle.setAttribute('aria-expanded', !isOpened);
    };

    menuToggle.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// ========================
// DOMContentLoaded INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
    // Hero Carousel Controls
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Thumbnail Interactivity
    document.querySelectorAll('.thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            const idx = parseInt(thumb.getAttribute('data-index'), 10);
            goToSlide(idx);
        });
    });

    // Manufacturing Process Tabs
    document.querySelectorAll('.process-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const stepId = btn.getAttribute('data-process');
            document.querySelectorAll('.process-tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.process-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(`p-${stepId}`);
            if (target) target.classList.add('active');
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                const answer = faq.querySelector('.faq-answer');
                if (answer) answer.style.display = 'none';
            });
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                if (answer) answer.style.display = 'block';
            }
        });
    });

    // Applications Slider Navigation
    const appCarousel = document.querySelector('.applications-carousel');
    const prevAppBtn = document.querySelector('.prev-app');
    const nextAppBtn = document.querySelector('.next-app');
    if (appCarousel && prevAppBtn && nextAppBtn) {
        prevAppBtn.addEventListener('click', () => appCarousel.scrollBy({ left: -400, behavior: 'smooth' }));
        nextAppBtn.addEventListener('click', () => appCarousel.scrollBy({ left: 400, behavior: 'smooth' }));
    }

    // Feature Initializations
    initStickyHeader();
    initCarouselZoom();
    initMobileMenu();
});
