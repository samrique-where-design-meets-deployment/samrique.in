export const templates = {
    header: `
    <header class="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <a href="#" class="flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-coral to-accent flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-coral/20 group-hover:scale-105 transition-transform">S</div>
                <div class="flex flex-col">
                    <span class="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                        Samrique <span class="w-2 h-2 rounded-full bg-coral inline-block animate-pulse"></span>
                    </span>
                    <span class="text-xs text-slate-400 font-medium">Digital Solutions</span>
                </div>
            </a>
            <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                <a href="#services" class="hover:text-coral transition-colors">Services</a>
                <a href="#projects" class="hover:text-coral transition-colors">Projects</a>
                <a href="#about" class="hover:text-coral transition-colors">About</a>
                <a href="#contact" class="hover:text-coral transition-colors">Contact</a>
            </nav>
            <div class="hidden sm:flex items-center gap-4">
                <a href="#contact" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral to-accent text-white font-semibold text-sm shadow-lg shadow-coral/25 hover:shadow-coral/40 transition-all">Start a Project</a>
            </div>
            <button id="mobile-menu-btn" class="md:hidden text-slate-300 hover:text-white p-2 rounded-lg focus:outline-none">
                <i class="fa-solid fa-bars text-xl"></i>
            </button>
        </div>
        <div id="mobile-menu" class="hidden md:hidden glass-card border-t border-slate-800 px-4 pt-4 pb-6 space-y-3">
            <a href="#services" class="mobile-link block px-3 py-2 rounded-lg text-slate-300 hover:bg-dark-800 hover:text-coral transition-colors">Services</a>
            <a href="#projects" class="mobile-link block px-3 py-2 rounded-lg text-slate-300 hover:bg-dark-800 hover:text-coral transition-colors">Projects</a>
            <a href="#about" class="mobile-link block px-3 py-2 rounded-lg text-slate-300 hover:bg-dark-800 hover:text-coral transition-colors">About</a>
            <a href="#contact" class="mobile-link block px-3 py-2 rounded-lg text-slate-300 hover:bg-dark-800 hover:text-coral transition-colors">Contact</a>
        </div>
    </header>`,

    hero: `
    <section class="relative min-h-screen flex items-center justify-center pt-28 pb-20 hero-gradient overflow-hidden">
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-coral/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-coral/30 text-coral text-xs font-semibold uppercase tracking-wider mb-8">
                <i class="fa-solid fa-bolt text-accent"></i> Flutter Development & Digital Solutions
            </div>
            <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Crafting High-Performance <span class="bg-gradient-to-r from-coral via-accent to-orange-400 bg-clip-text text-transparent">Digital Products</span>
            </h1>
            <p class="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                Crafting high-performance cross-platform mobile apps, seamless payment integrations, and scalable digital products engineered for growth.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <a href="#projects" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-coral to-accent text-white font-bold text-base shadow-xl shadow-coral/30 hover:scale-105 transition-all flex items-center justify-center gap-3">
                    <span>View Projects</span> <i class="fa-solid fa-arrow-down"></i>
                </a>
                <a href="#contact" class="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-white font-bold text-base border border-slate-700 hover:border-coral/50 transition-all flex items-center justify-center gap-3">
                    <span>Start a Project</span> <i class="fa-solid fa-paper-plane text-coral"></i>
                </a>
            </div>
        </div>
    </section>`,

    services: `
    <section id="services" class="py-24 bg-dark-950 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-16">
                <span class="text-coral text-sm font-semibold tracking-wider uppercase mb-3 block">What We Do</span>
                <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">Engineering Excellence Across All Platforms</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="glass-card rounded-2xl p-8 border border-slate-800 hover:border-coral/40 transition-all">
                    <div class="w-14 h-14 rounded-xl bg-coral/10 border border-coral/20 flex items-center justify-center text-coral text-2xl mb-6"><i class="fa-solid fa-mobile-screen-button"></i></div>
                    <h3 class="text-xl font-bold text-white mb-3">Flutter App Development</h3>
                    <p class="text-slate-300 text-sm leading-relaxed">High-performance cross-platform mobile applications for Android and iOS engineered for speed.</p>
                </div>
                <div class="glass-card rounded-2xl p-8 border border-slate-800 hover:border-coral/40 transition-all">
                    <div class="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-2xl mb-6"><i class="fa-solid fa-wallet"></i></div>
                    <h3 class="text-xl font-bold text-white mb-3">UPI & Payment Integration</h3>
                    <p class="text-slate-300 text-sm leading-relaxed">Seamless, secure payment gateway and wallet payout implementations for fast checkout flows.</p>
                </div>
            </div>
        </div>
    </section>`,

    contact: `
    <section id="contact" class="py-24 bg-dark-900 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div class="lg:col-span-5 space-y-8">
                    <div>
                        <span class="text-coral text-sm font-semibold tracking-wider uppercase mb-3 block">Get In Touch</span>
                        <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">Let's Build Something Extraordinary Together</h2>
                        <p class="text-slate-300 text-base leading-relaxed">Have a project in mind or need expert consultation? Reach out directly.</p>
                    </div>
                </div>
                <div class="lg:col-span-7">
                    <div class="glass-card rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative">
                        <form id="contact-form" class="space-y-6">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Your Name</label>
                                    <input type="text" id="name" required class="w-full px-4 py-3 rounded-xl bg-dark-950 border border-slate-800 text-white focus:outline-none focus:border-coral text-sm" placeholder="John Doe">
                                </div>
                                <div class="space-y-2">
                                    <label class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                                    <input type="email" id="email" required class="w-full px-4 py-3 rounded-xl bg-dark-950 border border-slate-800 text-white focus:outline-none focus:border-coral text-sm" placeholder="john@example.com">
                                </div>
                            </div>
                            <button type="submit" id="submit-btn" class="w-full py-4 rounded-xl bg-gradient-to-r from-coral to-accent text-white font-bold text-base shadow-lg">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>`,

    footer: `
    <footer class="bg-dark-950 border-t border-slate-800 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-coral to-accent flex items-center justify-center text-white font-extrabold text-sm">S</div>
                <span class="text-base font-bold text-white">Samrique — Flutter Development & Digital Solutions</span>
            </div>
            <p class="text-xs text-slate-500">&copy; <span id="current-year">2026</span> Samrique. All rights reserved.</p>
        </div>
    </footer>`
};
