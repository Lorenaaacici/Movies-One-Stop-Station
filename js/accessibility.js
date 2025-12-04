/**
 * MOSS Global Accessibility Manager
 * Applies accessibility settings across all pages
 */

const AccessibilityManager = {
    STORAGE_KEY: 'moss_accessibility',

    init() {
        this.loadSettings();
    },

    loadSettings() {
        const settings = localStorage.getItem(this.STORAGE_KEY);
        if (!settings) return;

        try {
            const parsed = JSON.parse(settings);

            if (parsed.largerText) {
                document.documentElement.style.fontSize = '120%';
            }

            if (parsed.highContrast) {
                document.body.classList.add('high-contrast');
            }
        } catch (e) {
            console.error('Error loading accessibility settings:', e);
        }
    },

    toggleLargerText(enabled) {
        if (enabled) {
            document.documentElement.style.fontSize = '120%';
        } else {
            document.documentElement.style.fontSize = '';
        }
        this.saveSettings();
    },

    toggleHighContrast(enabled) {
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        this.saveSettings();
    },

    saveSettings() {
        const settings = {
            largerText: document.documentElement.style.fontSize === '120%',
            highContrast: document.body.classList.contains('high-contrast')
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    },

    getSettings() {
        const settings = localStorage.getItem(this.STORAGE_KEY);
        if (!settings) return { largerText: false, highContrast: false };
        try {
            return JSON.parse(settings);
        } catch (e) {
            return { largerText: false, highContrast: false };
        }
    }
};

// Initialize immediately when script loads (before DOMContentLoaded)
// This prevents flash of unstyled content
AccessibilityManager.init();

// Make globally available
window.AccessibilityManager = AccessibilityManager;

/**
 * MOSS Mobile Navigation Manager
 * Handles mobile menu toggle functionality across all pages
 */
const MobileNavManager = {
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupMobileMenu();
        });
    },

    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (!mobileToggle || !navMenu) return;

        // Toggle menu on button click
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('mobile-open');
            mobileToggle.classList.toggle('active', isOpen);
            mobileToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('mobile-open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu when clicking a nav link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('mobile-open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
                navMenu.classList.remove('mobile-open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileToggle.focus();
            }
        });

        // Handle window resize - close menu if resizing to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('mobile-open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
};

// Initialize mobile navigation
MobileNavManager.init();

// Make globally available
window.MobileNavManager = MobileNavManager;
