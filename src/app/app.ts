import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected currentYear = new Date().getFullYear();
  protected mobileMenuOpen = false;
  protected submissionNoticeVisible = false;
  protected showMoneyManager = window.location.pathname === '/products/money-manager';
  protected showMarketplace = ['/products/samrique-e-marketplace', '/products/quickcart'].includes(window.location.pathname);
  protected showMama = window.location.pathname === '/products/samrique-mama';

  protected readonly moneyManagerFeatures = [
    { title: 'Transaction tracking', detail: 'Record and edit income, expenses, and transfers between accounts. Each transaction can include an amount, category, account, date and time, plus optional notes or tags.' },
    { title: 'Monthly overview', detail: 'Browse transactions grouped by date, switch between months, and see monthly income and expense totals.' },
    { title: 'Accounts', detail: 'Create, edit, and delete bank, credit card, digital wallet, and cash accounts. View individual balances and a combined net-worth total.' },
    { title: 'Spending insights', detail: 'Review income, expenses, net balance, and category-level expense distribution by month or custom date range.' },
    { title: 'Categories', detail: 'Use built-in income and expense categories or add custom categories.' },
    { title: 'CSV export', detail: 'Export transaction records, including dates, amounts, accounts, notes, and tags.' },
    { title: 'Appearance', detail: 'Switch between light and dark themes. The selected theme is saved on the device.' },
    { title: 'Regional formatting', detail: 'Currency values are formatted in Indian rupees (INR).' },
  ];

  protected readonly moneyManagerStack = [
    ['Application framework', 'Flutter'], ['Programming language', 'Dart (SDK >=3.0.0 <4.0.0)'],
    ['State management and navigation', 'GetX'], ['Backend communication', 'REST API using http'],
    ['Local preferences', 'shared_preferences'], ['Currency and date formatting', 'intl'],
    ['CSV creation and saving', 'Dart CSV generation with file_saver'],
    ['UI', 'Material 3, light and dark themes'], ['Automated tests', 'Flutter test framework'],
  ];

  protected readonly moneyManagerRoutes = [
    'GET /transactions?month=YYYY-MM — month transactions and summary',
    'GET /transactions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD — date-range and export data',
    'POST /transactions and PUT /transactions/{id} — create and update transactions',
    'GET /accounts, POST /accounts, PUT /accounts/{id}, DELETE /accounts/{id}',
    'GET /categories, POST /categories, and GET /months',
    'GET /stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD — spending statistics',
  ];

  protected readonly marketplaceFeatures = [
    { title: 'Discover digital products', detail: 'Browse featured and new products, explore categories, and search or filter marketplace listings.' },
    { title: 'Product pages and reviews', detail: 'View galleries, descriptions, ratings, reviews, and seller information before purchasing.' },
    { title: 'Wishlist and cart', detail: 'Save products to a wishlist and manage items in a shopping cart.' },
    { title: 'Checkout and orders', detail: 'Check out with Razorpay, review order history, view invoices, and access downloads for purchased products.' },
    { title: 'Seller onboarding', detail: 'Complete seller onboarding and submit identity and KYC information for review.' },
    { title: 'Seller listings', detail: 'Create and manage listings with product details, pricing, categories, preview images, and downloadable files. Track review and approval status.' },
    { title: 'Seller business tools', detail: 'Review buyer information, sales analytics, wallet balances, and transactions, then request withdrawals from the seller wallet.' },
    { title: 'Marketplace administration', detail: 'Give administrators a dashboard and tools to review and moderate seller, KYC, and product submissions.' },
    { title: 'Themes and notifications', detail: 'Choose light or dark themes and receive notifications through Firebase Cloud Messaging and local notifications.' },
    { title: 'Media and document selection', detail: 'Select images and files for profiles, product listings, and identity verification documents.' },
  ];

  protected readonly marketplaceStack = [
    ['App framework', 'Flutter; Dart (SDK >=3.0.0 <4.0.0)'],
    ['State management', 'Provider'], ['API communication', 'Dio and HTTP; REST API integration'],
    ['Local preferences', 'SharedPreferences'],
    ['UI and media', 'Material Design, carousel_slider, flutter_staggered_grid_view, shimmer, cached_network_image, flutter_svg, flutter_animate'],
    ['Payments', 'Razorpay Flutter'],
    ['Notifications and analytics dependencies', 'Firebase Messaging, flutter_local_notifications, Firebase Analytics'],
    ['Device utilities', 'image_picker, file_picker, url_launcher, intl'],
    ['Platforms', 'Android, iOS, web, Windows, macOS, and Linux'],
  ];

  protected readonly mamaFeatures = [
    { title: 'Pregnancy overview', detail: 'See the estimated pregnancy week, trimester, days until the due date, and an illustrative fruit-size comparison based on the due date on your profile.' },
    { title: 'Account access', detail: 'Register with a name, email, password, and estimated due date; sign in and out; and restore the saved session when the app starts.' },
    { title: 'Daily health log', detail: 'Record weight, mood, sleep, and symptoms in a daily health log.' },
    { title: 'Kick counter and contractions', detail: 'Track baby kicks and record and time contractions.' },
    { title: 'Nutrition and hydration', detail: 'Log meals with meal type, calories, and protein, and record water intake.' },
    { title: 'Exercise tracking', detail: 'Keep a record of exercise as part of daily wellness habits.' },
    { title: 'Prenatal appointments', detail: 'Schedule visits with a date, time, and notes. See the next visit highlighted and delete appointments.' },
    { title: 'Community', detail: 'Browse sample discussions by topic and compose a post or tip. Community content is currently stored in the app rather than synchronized with the backend.' },
    { title: 'Responsive experience', detail: 'A pregnancy-themed Flutter UI built with Material 3 components.' },
  ];

  protected readonly mamaStack = [
    ['Application framework', 'Flutter'], ['Programming language', 'Dart (>=3.0.0 <4.0.0)'],
    ['State management', 'Provider'], ['API communication', 'HTTP REST API'],
    ['Local preferences', 'Shared Preferences (session and authentication token)'],
    ['Date and time formatting', 'Intl'], ['Secure storage', 'flutter_secure_storage is declared but not currently used by the authentication flow'],
  ];

  protected readonly mamaRoutes = [
    'POST /auth/register and POST /auth/login — account registration and sign-in',
    'Authenticated endpoints: /health, /kick, and /contraction',
    'Authenticated endpoints: /food, /water, and /exercise',
    'Authenticated endpoint: /appointment',
    'Authenticated API requests include the locally saved token',
  ];

  @HostListener('window:popstate')
  protected syncRoute(): void {
    this.showMoneyManager = window.location.pathname === '/products/money-manager';
    this.showMarketplace = ['/products/samrique-e-marketplace', '/products/quickcart'].includes(window.location.pathname);
    this.showMama = window.location.pathname === '/products/samrique-mama';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  protected openMoneyManager(): void {
    if (window.location.pathname !== '/products/money-manager') {
      window.history.pushState({}, '', '/products/money-manager');
    }
    this.showMoneyManager = true;
    this.showMarketplace = false;
    this.showMama = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  protected openMarketplace(): void {
    if (window.location.pathname !== '/products/samrique-e-marketplace') {
      window.history.pushState({}, '', '/products/samrique-e-marketplace');
    }
    this.showMoneyManager = false;
    this.showMarketplace = true;
    this.showMama = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  protected openMama(): void {
    if (window.location.pathname !== '/products/samrique-mama') {
      window.history.pushState({}, '', '/products/samrique-mama');
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  protected returnToProjects(): void {
    window.history.pushState({}, '', '/#projects');
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }));
  }

  protected inquireAboutMoneyManager(): void {
    window.history.pushState({}, '', '/#contact');
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }));
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  protected submitContactForm(event: SubmitEvent, form: HTMLFormElement): void {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const service =
      form.querySelector<HTMLSelectElement>('[name="service"]')?.selectedOptions[0]?.textContent?.trim() ??
      'General consultation';
    const subject = `Project inquiry: ${service}`;
    const body = [
      `Name: ${formData.get('name') ?? ''}`,
      `Email: ${formData.get('email') ?? ''}`,
      `Phone: ${formData.get('phone') || 'Not provided'}`,
      '',
      'Project details:',
      String(formData.get('message') ?? ''),
    ].join('\n');

    window.location.href = `mailto:samrique@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.submissionNoticeVisible = true;
  }

  protected resetContactForm(form: HTMLFormElement): void {
    form.reset();
    this.submissionNoticeVisible = false;
  }
}
