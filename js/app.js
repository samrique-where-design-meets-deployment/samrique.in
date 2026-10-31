import { store } from './store.js';
import { templates } from './components.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Templates into index.html
    document.getElementById('site-header').innerHTML = templates.header;
    document.getElementById('site-hero').innerHTML = templates.hero;
    document.getElementById('site-services').innerHTML = templates.services;
    document.getElementById('site-contact').innerHTML = templates.contact;
    document.getElementById('site-footer').innerHTML = templates.footer;

    // 2. Set Footer Year
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 3. Mobile Menu Toggle Logic with Store
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = !store.getState().isMobileMenuOpen;
            store.setState({ isMobileMenuOpen: isOpen });
        });

        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                store.setState({ isMobileMenuOpen: false });
            });
        });

        store.subscribe((state) => {
            if (state.isMobileMenuOpen) {
                mobileMenu.classList.remove('hidden');
            } else {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // 4. Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Sending...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
                alert('Message Sent Successfully!');
                contactForm.reset();
            }, 1000);
        });
    }
});
