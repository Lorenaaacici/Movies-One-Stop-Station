/**
 * MOSS Support Page JavaScript
 */

const SupportPage = {
    init() {
        console.log('Initializing Support Page...');
        this.setupFAQ();
        this.setupCustomDropdown();
        this.setupContactForm();
        this.setupAccessibility();
        this.syncAccessibilityUI();
    },

    // FAQ Accordion
    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current item
                item.classList.toggle('active');
                question.setAttribute('aria-expanded', !isActive);
            });
        });
    },

    // Custom Dropdown
    setupCustomDropdown() {
        const dropdowns = document.querySelectorAll('.custom-dropdown');

        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-menu');
            const items = dropdown.querySelectorAll('.dropdown-item');
            const hiddenInput = dropdown.querySelector('input[type="hidden"]');
            const valueDisplay = dropdown.querySelector('.dropdown-value');

            // Set initial placeholder state
            valueDisplay.classList.add('placeholder');

            // Toggle dropdown
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const isOpen = dropdown.classList.contains('open');

                // Close all other dropdowns
                document.querySelectorAll('.custom-dropdown.open').forEach(d => {
                    if (d !== dropdown) d.classList.remove('open');
                });

                dropdown.classList.toggle('open');
                trigger.setAttribute('aria-expanded', !isOpen);
            });

            // Handle item selection
            items.forEach(item => {
                item.addEventListener('click', () => {
                    const value = item.dataset.value;
                    const text = item.textContent;

                    // Update hidden input
                    if (hiddenInput) {
                        hiddenInput.value = value;
                    }

                    // Update display
                    valueDisplay.textContent = text;
                    valueDisplay.classList.remove('placeholder');

                    // Update selected state
                    items.forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');

                    // Close dropdown
                    dropdown.classList.remove('open');
                    trigger.setAttribute('aria-expanded', 'false');
                });
            });

            // Close on click outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('open');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });

            // Keyboard navigation
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dropdown.classList.remove('open');
                    trigger.setAttribute('aria-expanded', 'false');
                } else if (e.key === 'ArrowDown' && dropdown.classList.contains('open')) {
                    e.preventDefault();
                    const firstItem = menu.querySelector('.dropdown-item');
                    if (firstItem) firstItem.focus();
                }
            });

            items.forEach((item, index) => {
                item.setAttribute('tabindex', '-1');
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = items[index + 1];
                        if (next) next.focus();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = items[index - 1];
                        if (prev) prev.focus();
                        else trigger.focus();
                    } else if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        item.click();
                    } else if (e.key === 'Escape') {
                        dropdown.classList.remove('open');
                        trigger.focus();
                    }
                });
            });
        });
    },

    // Contact Form
    setupContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Validate
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                this.showToast('Please fill in all fields');
                return;
            }

            // Simulate form submission
            console.log('Form submitted:', formData);

            // Show success message
            this.showToast('Thank you! Your message has been sent.');

            // Reset form
            form.reset();

            // Reset custom dropdown
            const dropdown = document.querySelector('.custom-dropdown');
            if (dropdown) {
                const valueDisplay = dropdown.querySelector('.dropdown-value');
                const items = dropdown.querySelectorAll('.dropdown-item');
                valueDisplay.textContent = 'Select a topic';
                valueDisplay.classList.add('placeholder');
                items.forEach(i => i.classList.remove('selected'));
            }
        });
    },

    // Accessibility Options
    setupAccessibility() {
        const options = document.querySelectorAll('.accessibility-option');

        options.forEach(option => {
            option.addEventListener('click', () => {
                const optionType = option.dataset.option;
                option.classList.toggle('active');
                const isActive = option.classList.contains('active');

                if (window.AccessibilityManager) {
                    switch (optionType) {
                        case 'text':
                            window.AccessibilityManager.toggleLargerText(isActive);
                            this.showToast(isActive ? 'Larger text enabled' : 'Larger text disabled');
                            break;
                        case 'contrast':
                            window.AccessibilityManager.toggleHighContrast(isActive);
                            this.showToast(isActive ? 'High contrast enabled' : 'High contrast disabled');
                            break;
                    }
                }
            });
        });
    },

    // Sync UI with saved accessibility settings
    syncAccessibilityUI() {
        if (!window.AccessibilityManager) return;

        const settings = window.AccessibilityManager.getSettings();

        if (settings.largerText) {
            const textOption = document.getElementById('text-option');
            if (textOption) textOption.classList.add('active');
        }

        if (settings.highContrast) {
            const contrastOption = document.getElementById('contrast-option');
            if (contrastOption) contrastOption.classList.add('active');
        }
    },

    // Toast Notification
    showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        const toastMessage = toast.querySelector('.toast-message');
        if (toastMessage) {
            toastMessage.textContent = message;
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    SupportPage.init();
});
