import { AfterViewInit, Component, HostListener, NgZone, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface BookingDay {
  key: string;
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isDisabled: boolean;
}

export interface ProductScreen {
  id: string;
  screenNumber: string;
  name: string;
  category: string;
  previewImage: string;
  assetImage: string;
  description: string;
  tags: string[];
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  protected currentYear = new Date().getFullYear();
  protected mobileMenuOpen = false;
  protected activeSection = 'hero';
  protected bookingOpen = false;
  protected bookingNoticeVisible = false;
  protected bookingError = '';
  protected bookingName = '';
  protected bookingEmail = '';
  protected bookingPhone = '';
  protected bookingMessage = '';
  protected bookingService = 'General consultation';
  protected bookingMailto = '';
  protected selectedBookingDate = '';
  protected selectedBookingTime = '';
  protected bookingMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  protected readonly bookingWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  protected readonly bookingTimes = Array.from({ length: 16 }, (_, index) => {
    const minutes = 9 * 60 + index * 30;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  });

  protected showMoneyManager = ['/products/money-manager', '/products/samrique-money-manager'].includes(this.routePath);
  protected showMarketplace = ['/products/samrique-e-marketplace', '/products/quickcart'].includes(this.routePath);
  protected showMama = ['/products/samrique-mama', '/products/samrique-mama-pregnancy-tracker'].includes(this.routePath);
  protected showZipi = ['/products/zipi-bike-taxi', '/products/zipi-bike-taxi-app', '/products/samrique-zipi-multi-modal-transit'].includes(this.routePath);

  // Modal Lightbox state
  protected activeModalScreen: ProductScreen | null = null;
  protected modalViewMode: 'preview' | 'asset' = 'preview';
  protected cardViewModes: Record<string, 'preview' | 'asset'> = {};

  // Category filters
  protected moneyManagerCategory = 'All';
  protected marketplaceCategory = 'All';
  protected mamaCategory = 'All';
  protected zipiCategory = 'All';

  private revealObserver?: IntersectionObserver;
  private bookingTrigger?: HTMLElement;

  constructor(private readonly zone: NgZone) { }

  private readonly handleScroll = (): void => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    document.getElementById('top-progress-bar')?.style.setProperty('width', `${progress}%`);

    const sections = ['hero', 'services', 'how-it-works', 'projects', 'about', 'contact'];
    const activeSection = sections
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)
      .filter((section) => section.getBoundingClientRect().top <= window.innerHeight * 0.4)
      .pop()?.id ?? 'hero';

    if (activeSection !== this.activeSection) {
      this.zone.run(() => {
        this.activeSection = activeSection;
      });
    }
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const card = event.target.closest<HTMLElement>('.glass-card');
    if (!card) {
      return;
    }

    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--card-mouse-x', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--card-mouse-y', `${event.clientY - bounds.top}px`);
  };

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver !== 'undefined') {
      this.revealObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      }, { threshold: 0.01, rootMargin: '100px 0px 100px 0px' });
      document.documentElement.classList.add('reveal-enabled');
      this.observeRevealElements();
    }

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      document.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      this.handleScroll();
    });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    document.documentElement.classList.remove('reveal-enabled');
    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('pointermove', this.handlePointerMove);
  }

  private get basePath(): string {
    const path = new URL(document.baseURI).pathname;
    return path.endsWith('/') ? path : `${path}/`;
  }

  private get routePath(): string {
    const path = window.location.pathname;
    return path.startsWith(this.basePath)
      ? `/${path.slice(this.basePath.length)}`
      : path;
  }

  protected appPath(path: string): string {
    return `${this.basePath}${path.replace(/^\/+/, '')}`;
  }

  protected scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  protected get calendarDays(): BookingDay[] {
    const firstDay = new Date(this.bookingMonth.getFullYear(), this.bookingMonth.getMonth(), 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastBookableDay = new Date(today);
    lastBookableDay.setDate(today.getDate() + 60);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const dateKey = this.dateKey(date);
      return {
        key: dateKey,
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === this.bookingMonth.getMonth(),
        isDisabled:
          date < today ||
          date > lastBookableDay ||
          date.getDay() === 0 ||
          date.getDay() === 6,
      };
    });
  }

  protected get bookingMonthLabel(): string {
    return this.bookingMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  protected get selectedBookingDateLabel(): string {
    if (!this.selectedBookingDate) {
      return 'Select a date';
    }

    return new Date(`${this.selectedBookingDate}T12:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  protected get bookingTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
  }

  protected get canGoToPreviousBookingMonth(): boolean {
    const now = new Date();
    return this.bookingMonth.getFullYear() > now.getFullYear() ||
      (this.bookingMonth.getFullYear() === now.getFullYear() && this.bookingMonth.getMonth() > now.getMonth());
  }

  protected get canGoToNextBookingMonth(): boolean {
    const lastBookableDay = new Date();
    lastBookableDay.setDate(lastBookableDay.getDate() + 60);
    return this.bookingMonth.getFullYear() < lastBookableDay.getFullYear() ||
      (this.bookingMonth.getFullYear() === lastBookableDay.getFullYear() && this.bookingMonth.getMonth() < lastBookableDay.getMonth());
  }

  protected changeBookingMonth(offset: number): void {
    this.bookingMonth = new Date(this.bookingMonth.getFullYear(), this.bookingMonth.getMonth() + offset, 1);
    this.selectedBookingDate = '';
    this.selectedBookingTime = '';
    this.bookingError = '';
  }

  protected selectBookingDate(dateKey: string): void {
    this.selectedBookingDate = dateKey;
    this.selectedBookingTime = '';
    this.bookingError = '';
  }

  protected selectBookingTime(time: string): void {
    this.selectedBookingTime = time;
    this.bookingError = '';
  }

  protected openBooking(): void {
    this.bookingTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.bookingOpen = true;
    this.bookingNoticeVisible = false;
    this.bookingError = '';
    this.bookingMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.selectedBookingDate = '';
    this.selectedBookingTime = '';
    document.body.classList.add('booking-open');
    window.setTimeout(() => document.getElementById('booking-name')?.focus(), 0);
  }

  protected closeBooking(): void {
    this.bookingOpen = false;
    document.body.classList.remove('booking-open');
    this.bookingTrigger?.focus();
    this.bookingTrigger = undefined;
  }

  @HostListener('document:keydown', ['$event'])
  protected handleDocumentKeydown(event: KeyboardEvent): void {
    if (this.activeModalScreen) {
      if (event.key === 'Escape') {
        this.closeScreenModal();
        return;
      }
      if (event.key === 'ArrowRight') {
        this.nextModalScreen();
        return;
      }
      if (event.key === 'ArrowLeft') {
        this.prevModalScreen();
        return;
      }
    }

    if (!this.bookingOpen) {
      return;
    }

    if (event.key === 'Escape') {
      this.closeBooking();
      return;
    }

    if (event.key === 'Tab') {
      const focusableElements = document.querySelectorAll<HTMLElement>(
        '.booking-dialog a[href], .booking-dialog button:not(:disabled), .booking-dialog input:not(:disabled), .booking-dialog textarea:not(:disabled)',
      );
      const first = focusableElements.item(0);
      const last = focusableElements.item(focusableElements.length - 1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  }

  protected submitBookingRequest(event: SubmitEvent, form: HTMLFormElement): void {
    event.preventDefault();
    if (!form.reportValidity()) {
      return;
    }
    if (!this.selectedBookingDate || !this.selectedBookingTime) {
      this.bookingError = 'Choose a date and time to request a call.';
      return;
    }

    const formData = new FormData(form);
    const subject = `Call request: ${this.selectedBookingDateLabel} at ${this.selectedBookingTime}`;
    const body = [
      '30-minute project discovery call request',
      `Preferred date: ${this.selectedBookingDateLabel} (${this.selectedBookingDate})`,
      `Preferred time: ${this.selectedBookingTime} (${this.bookingTimezone})`,
      `Name: ${formData.get('bookingName') ?? ''}`,
      `Email: ${formData.get('bookingEmail') ?? ''}`,
      `Phone: ${formData.get('bookingPhone') || 'Not provided'}`,
      `Service: ${this.bookingService}`,
      '',
      'Project idea:',
      String(formData.get('bookingMessage') || 'Not provided'),
      '',
      'This is a preferred time request, not a confirmed booking.',
    ].join('\n');

    this.bookingMailto = `mailto:samrique.in@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = this.bookingMailto;
    this.bookingNoticeVisible = true;
    this.bookingError = '';
  }

  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private observeRevealElements(): void {
    document.querySelectorAll('.reveal-on-scroll:not(.is-visible)').forEach((element) => {
      this.revealObserver?.observe(element);
    });
  }

  private refreshHomeVisibility(): void {
    const reveal = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const target = document.getElementById(hash);
        if (target) {
          target.querySelectorAll('.reveal-on-scroll').forEach((el) => {
            el.classList.add('is-visible');
            this.revealObserver?.unobserve(el);
          });
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }

      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-visible');
        this.revealObserver?.unobserve(el);
      });
    };

    setTimeout(reveal, 0);
    setTimeout(reveal, 80);
    setTimeout(reveal, 250);
  }

  // --- Modal Lightbox & View Toggles ---
  protected openScreenModal(screen: ProductScreen, viewMode: 'preview' | 'asset' = 'preview'): void {
    this.activeModalScreen = screen;
    this.modalViewMode = viewMode;
    document.body.classList.add('modal-open');
  }

  protected closeScreenModal(): void {
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
  }

  protected nextModalScreen(): void {
    if (!this.activeModalScreen) return;
    const screens = this.currentProductScreens;
    if (!screens.length) return;
    const currentIndex = screens.findIndex((s) => s.id === this.activeModalScreen?.id);
    if (currentIndex >= 0 && currentIndex < screens.length - 1) {
      this.activeModalScreen = screens[currentIndex + 1];
    } else {
      this.activeModalScreen = screens[0];
    }
  }

  protected prevModalScreen(): void {
    if (!this.activeModalScreen) return;
    const screens = this.currentProductScreens;
    if (!screens.length) return;
    const currentIndex = screens.findIndex((s) => s.id === this.activeModalScreen?.id);
    if (currentIndex > 0) {
      this.activeModalScreen = screens[currentIndex - 1];
    } else {
      this.activeModalScreen = screens[screens.length - 1];
    }
  }

  protected get currentProductScreens(): ProductScreen[] {
    if (this.showMoneyManager) return this.moneyManagerScreens;
    if (this.showMarketplace) return this.marketplaceScreens;
    if (this.showMama) return this.mamaScreens;
    if (this.showZipi) return this.zipiScreens;
    return [];
  }

  protected setModalViewMode(mode: 'preview' | 'asset'): void {
    this.modalViewMode = mode;
  }

  protected toggleCardView(screenId: string, mode: 'preview' | 'asset'): void {
    this.cardViewModes[screenId] = mode;
  }

  protected getCardView(screenId: string): 'preview' | 'asset' {
    return this.cardViewModes[screenId] || 'preview';
  }

  protected filterScreens(screens: ProductScreen[], category: string): ProductScreen[] {
    if (category === 'All') return screens;
    return screens.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  protected getCategoryColor(category: string): string {
    const map: Record<string, string> = {
      'onboarding': '#8b5cf6',
      'authentication': '#17b3a3',
      'buyer': '#3b82f6',
      'seller': '#f59e0b',
      'admin': '#ec6a6f',
      'transactions': '#10b981',
      'accounts': '#6366f1',
      'insights': '#ec4899',
      'settings': '#64748b',
      'daily vitals': '#f43f5e',
      'wellness': '#a855f7',
      'care': '#06b6d4',
      'transit': '#f97316',
      'captain': '#eab308',
      'compliance': '#ef4444',
      'profile': '#8b5cf6',
    };
    return map[category?.toLowerCase()] || '#17b3a3';
  }

  protected getCategoryCount(screens: ProductScreen[], category: string): number {
    if (category === 'All') return screens.length;
    return screens.filter((s) => s.category.toLowerCase() === category.toLowerCase()).length;
  }

  // --- Features & Stack Data ---
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

  protected readonly zipiFeatures = [
    { title: 'Role-based experience', detail: 'Dedicated, tailored workflows for commuters (riders) and captain drivers with seamless role switching.' },
    { title: 'Live interactive map booking', detail: 'Map-based pickup and drop-off point selection, real-time vehicle dispatch, route polyline preview, and ETA estimation.' },
    { title: 'Upfront fare & ride options', detail: 'Transparent fare breakdown based on trip distance, surge multipliers, and vehicle choices (Bike Taxi, Express, EV Bike).' },
    { title: 'Captain radar & dispatch', detail: 'Real-time order alert radar, trip acceptance or decline modals, and turn-by-turn navigation integration.' },
    { title: 'Captain KYC & verification', detail: 'End-to-end document submission and compliance verification for driving licenses, RC books, insurance, and vehicle fitness.' },
    { title: 'Digital ride invoices', detail: 'Automated receipt generation breaking down base fare, distance rate, wait charges, applicable taxes, and payment mode.' },
    { title: 'Safety & trip monitoring', detail: 'Live trip status sharing with emergency contacts, SOS alert trigger, and captain profile rating.' },
    { title: 'Multi-language accessibility', detail: 'Built-in support for English, Hindi, and regional languages for accessible onboarding across transit zones.' },
  ];

  protected readonly zipiStack = [
    ['Application framework', 'Flutter'],
    ['Programming language', 'Dart (SDK >=3.0.0 <4.0.0)'],
    ['State management & architecture', 'GetX / Provider architecture'],
    ['Mapping & Geolocation', 'Google Maps Flutter, Geolocator, Geocoding'],
    ['Real-time events & dispatch', 'WebSockets / Firebase Cloud Messaging'],
    ['Networking & API client', 'Dio and HTTP REST API'],
    ['Local cache & storage', 'SharedPreferences'],
    ['Design system', 'Custom On-Demand Mobility theme, Material 3'],
  ];

  // --- Screens Data ---
  protected readonly moneyManagerScreens: ProductScreen[] = [
    {
      id: 'mm-splash',
      screenNumber: '01',
      name: 'Splash & Welcome Screen',
      category: 'Onboarding',
      previewImage: 'assets/images/samrique_money_manager/splash-screen-preview.png',
      assetImage: 'assets/images/samrique_money_manager/splash-screen.png',
      description: 'Clean branded startup screen initializing local preferences, theme states, and account ledgers.',
      tags: ['Launch Screen', 'Brand Identity'],
    },
    {
      id: 'mm-trans',
      screenNumber: '02',
      name: 'Transactions Ledger Screen',
      category: 'Transactions',
      previewImage: 'assets/images/samrique_money_manager/01-transactions-preview.png',
      assetImage: 'assets/images/samrique_money_manager/transactions.png',
      description: 'Chronological listing of income and expense items grouped by date with net summary balance header.',
      tags: ['Income & Expense', 'Date Grouping'],
    },
    {
      id: 'mm-stats',
      screenNumber: '03',
      name: 'Analytics & Spending Statistics Screen',
      category: 'Insights',
      previewImage: 'assets/images/samrique_money_manager/02-stats-preview.png',
      assetImage: 'assets/images/samrique_money_manager/stats.png',
      description: 'Visual breakdown of spending patterns, category allocations, and monthly inflow/outflow comparisons.',
      tags: ['Expense Breakdown', 'Category Charts'],
    },
    {
      id: 'mm-accounts',
      screenNumber: '04',
      name: 'Multi-Account Portfolio Screen',
      category: 'Accounts',
      previewImage: 'assets/images/samrique_money_manager/03-accounts-preview.png',
      assetImage: 'assets/images/samrique_money_manager/accounts.png',
      description: 'Management of cash, bank, credit card, and digital wallet balances with cumulative net worth calculation.',
      tags: ['Multi-Account', 'Net Worth'],
    },
    {
      id: 'mm-more',
      screenNumber: '05',
      name: 'Settings & Preferences Screen',
      category: 'Settings',
      previewImage: 'assets/images/samrique_money_manager/04-more-preview.png',
      assetImage: 'assets/images/samrique_money_manager/more.png',
      description: 'CSV data export, category manager, currency preference, and light/dark theme customizer.',
      tags: ['CSV Export', 'Customization'],
    },
    {
      id: 'mm-add-tx',
      screenNumber: '06',
      name: 'Add Transaction Screen',
      category: 'Transactions',
      previewImage: 'assets/images/samrique_money_manager/05-add-transaction-preview.png',
      assetImage: 'assets/images/samrique_money_manager/add-transaction.png',
      description: 'Rapid input form for amounts, categories, account destination, datetime, and tags with numeric keypad.',
      tags: ['Quick Input', 'Tagging'],
    },
    {
      id: 'mm-add-acc',
      screenNumber: '07',
      name: 'Add New Account Screen',
      category: 'Accounts',
      previewImage: 'assets/images/samrique_money_manager/06-add-account-preview.png',
      assetImage: 'assets/images/samrique_money_manager/add-account.png',
      description: 'Setup flow for new financial accounts, credit cards, or digital wallets with custom icons and starting balance.',
      tags: ['Account Setup', 'Opening Balance'],
    },
    {
      id: 'mm-tx-detail',
      screenNumber: '08',
      name: 'Transaction Detail Screen',
      category: 'Transactions',
      previewImage: 'assets/images/samrique_money_manager/07-transaction-details-preview.png',
      assetImage: 'assets/images/samrique_money_manager/transaction-details.png',
      description: 'Detailed inspection view of individual entries with timestamp, notes, tags, and quick edit/delete actions.',
      tags: ['Transaction Audit', 'Edit / Delete'],
    },
  ];

  protected readonly marketplaceScreens: ProductScreen[] = [
    {
      id: 'em-splash',
      screenNumber: '01',
      name: 'Splash & Welcome Screen',
      category: 'Onboarding',
      previewImage: 'assets/images/samrique_e-%20marketplace/01_splash_screen_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/01_splash_screen.png',
      description: 'Entry splash presenting Samrique E-Marketplace digital discovery ecosystem with branding.',
      tags: ['Welcome Experience', 'Brand Identity'],
    },
    {
      id: 'em-login',
      screenNumber: '02',
      name: 'User Sign In Screen',
      category: 'Authentication',
      previewImage: 'assets/images/samrique_e-%20marketplace/02_login_screen_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/02_login_screen.png',
      description: 'Role-aware login interface for buyers, creators, and marketplace administrators.',
      tags: ['Authentication', 'Role Detection'],
    },
    {
      id: 'em-register',
      screenNumber: '03',
      name: 'Account Registration Screen',
      category: 'Authentication',
      previewImage: 'assets/images/samrique_e-%20marketplace/03_register_screen_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/03_register_screen.png',
      description: 'Creator and buyer registration with validation, password security, and terms acceptance.',
      tags: ['Registration', 'Account Setup'],
    },
    {
      id: 'em-forgot',
      screenNumber: '04',
      name: 'Password Recovery Screen',
      category: 'Authentication',
      previewImage: 'assets/images/samrique_e-%20marketplace/04_forgot_password_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/04_forgot_password.png',
      description: 'Email-based password reset with secure OTP verification flow.',
      tags: ['Security', 'OTP Reset'],
    },
    {
      id: 'em-buyer-home',
      screenNumber: '05',
      name: 'Buyer Marketplace Home Screen',
      category: 'Buyer',
      previewImage: 'assets/images/samrique_e-%20marketplace/05_buyer_home_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/buyer_01_home.png',
      description: 'Discovery hub with curated banners, trending UI kits, top categories, and new releases.',
      tags: ['Digital Discovery', 'Featured Items'],
    },
    {
      id: 'em-product-detail',
      screenNumber: '06',
      name: 'Product Details & Reviews Screen',
      category: 'Buyer',
      previewImage: 'assets/images/samrique_e-%20marketplace/06_buyer_product_detail_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/buyer_02_product_detail.png',
      description: 'Full product overview with asset carousel, price, ratings, user reviews, and Add-to-Cart CTA.',
      tags: ['Gallery & Specs', 'Reviews & Ratings'],
    },
    {
      id: 'em-categories',
      screenNumber: '07',
      name: 'Categories Directory Screen',
      category: 'Buyer',
      previewImage: 'assets/images/samrique_e-%20marketplace/07_buyer_categories_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/buyer_03_categories.png',
      description: 'Categorized asset catalog covering Flutter templates, mobile kits, web themes, and backend tools.',
      tags: ['Taxonomy', 'Asset Browsing'],
    },
    {
      id: 'em-search',
      screenNumber: '08',
      name: 'Search & Faceted Filters Screen',
      category: 'Buyer',
      previewImage: 'assets/images/samrique_e-%20marketplace/08_buyer_search_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/buyer_04_search.png',
      description: 'Instant search engine with live suggestions, price range sliders, and platform filters.',
      tags: ['Instant Search', 'Faceted Filters'],
    },
    {
      id: 'em-cart',
      screenNumber: '09',
      name: 'Shopping Cart Screen',
      category: 'Buyer',
      previewImage: 'assets/images/samrique_e-%20marketplace/09_buyer_cart_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/buyer_05_cart.png',
      description: 'Cart summary with license tiers, coupon voucher codes, and Razorpay payment gateway checkout.',
      tags: ['Cart Management', 'Discount Codes'],
    },
    {
      id: 'em-wishlist',
      screenNumber: '10',
      name: 'Wishlist & Favorites Screen',
      category: 'Buyer',
      previewImage: 'assets/images/samrique_e-%20marketplace/10_buyer_wishlist_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/buyer_06_wishlist.png',
      description: 'Bookmarked creative items for rapid checkout and price drop tracking.',
      tags: ['Wishlist', 'Saved Assets'],
    },
    {
      id: 'em-buyer-profile',
      screenNumber: '11',
      name: 'Buyer Profile & Downloads Screen',
      category: 'Buyer',
      previewImage: 'assets/images/samrique_e-%20marketplace/11_buyer_profile_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/buyer_07_profile.png',
      description: 'Order history ledger, direct ZIP downloads for purchased licenses, and account settings.',
      tags: ['Order History', 'License Downloads'],
    },
    {
      id: 'em-seller-dash',
      screenNumber: '12',
      name: 'Seller Dashboard Screen',
      category: 'Seller',
      previewImage: 'assets/images/samrique_e-%20marketplace/12_seller_dashboard_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/seller_01_dashboard.png',
      description: 'Creator portal overview showing total gross revenue, sales counts, and live store conversion metrics.',
      tags: ['Seller Portal', 'Sales Overview'],
    },
    {
      id: 'em-seller-prods',
      screenNumber: '13',
      name: 'Seller Product Catalog Screen',
      category: 'Seller',
      previewImage: 'assets/images/samrique_e-%20marketplace/13_seller_products_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/seller_02_products.png',
      description: 'Inventory management showing active listings, pending moderations, price editing, and sales tallies.',
      tags: ['Catalog Management', 'Price Updates'],
    },
    {
      id: 'em-seller-upload',
      screenNumber: '14',
      name: 'Publish Digital Asset Screen',
      category: 'Seller',
      previewImage: 'assets/images/samrique_e-%20marketplace/14_seller_upload_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/seller_03_upload_product.png',
      description: 'Asset publishing workflow with screenshot upload, ZIP archive attachment, and license tiering.',
      tags: ['Creator Upload', 'Asset Publishing'],
    },
    {
      id: 'em-seller-analytics',
      screenNumber: '15',
      name: 'Seller Sales Analytics Screen',
      category: 'Seller',
      previewImage: 'assets/images/samrique_e-%20marketplace/15_seller_analytics_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/seller_04_analytics.png',
      description: 'Visual revenue graphs, visitor click tracking, customer geography, and monthly revenue performance.',
      tags: ['Revenue Metrics', 'Conversion Data'],
    },
    {
      id: 'em-seller-wallet',
      screenNumber: '16',
      name: 'Seller Earnings Wallet Screen',
      category: 'Seller',
      previewImage: 'assets/images/samrique_e-%20marketplace/16_seller_wallet_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/seller_05_wallet.png',
      description: 'Available balance ledger, pending payouts, bank transfer history, and payout withdrawal requests.',
      tags: ['Payouts', 'Wallet Balance'],
    },
    {
      id: 'em-admin-dash',
      screenNumber: '17',
      name: 'Admin Control Center Screen',
      category: 'Admin',
      previewImage: 'assets/images/samrique_e-%20marketplace/17_admin_dashboard_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/admin_01_dashboard.png',
      description: 'Platform overview for administrators monitoring gross merchandise volume, active sellers, and disputes.',
      tags: ['Administration', 'Platform Metrics'],
    },
    {
      id: 'em-admin-kyc',
      screenNumber: '18',
      name: 'KYC & Moderation Screen',
      category: 'Admin',
      previewImage: 'assets/images/samrique_e-%20marketplace/18_admin_kyc_preview.png',
      assetImage: 'assets/images/samrique_e-%20marketplace/admin_03_kyc_verification.png',
      description: 'Verification queue for inspecting creator identity documents, tax information, and approving listings.',
      tags: ['KYC Verification', 'Trust & Safety'],
    },
  ];

  protected readonly mamaScreens: ProductScreen[] = [
    {
      id: 'mama-splash',
      screenNumber: '01',
      name: 'Splash & Welcome Screen',
      category: 'Onboarding',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/01_splash_screen_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/splash_screen_emulator.png',
      description: 'Warm, reassuring launch experience introducing Samrique Mama with soothing maternal aesthetics.',
      tags: ['Welcome Experience', 'Brand Identity'],
    },
    {
      id: 'mama-login',
      screenNumber: '02',
      name: 'Sign In Screen',
      category: 'Onboarding',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/02_login_screen_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/shot_login.png',
      description: 'Quick account sign-in restoring pregnancy timeline, synced health records, and saved notes.',
      tags: ['Authentication', 'Session Restore'],
    },
    {
      id: 'mama-register',
      screenNumber: '03',
      name: 'Registration & Due Date Screen',
      category: 'Onboarding',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/03_register_screen_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/shot_register.png',
      description: 'Account setup calculating estimated due date, current trimester, and baby development week.',
      tags: ['Account Onboarding', 'Due Date Setup'],
    },
    {
      id: 'mama-overview',
      screenNumber: '04',
      name: 'Pregnancy Overview Screen',
      category: 'Daily Vitals',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/04_pregnancy_overview_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/screen_live_now.png',
      description: 'Flagship home dashboard with week progression, fruit-size milestone, days left, and quick shortcuts.',
      tags: ['Weekly Milestones', 'Progress Tracker'],
    },
    {
      id: 'mama-health',
      screenNumber: '05',
      name: 'Health Tracking Screen',
      category: 'Daily Vitals',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/05_health_tracking_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/health_tab_screen.png',
      description: 'Daily health logger recording mood emoji ratings, sleep hours, symptoms checklist, and weight vitals.',
      tags: ['Daily Health Log', 'Symptoms Checklist'],
    },
    {
      id: 'mama-kick',
      screenNumber: '06',
      name: 'Kick Counter Screen',
      category: 'Daily Vitals',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/06_kick_counter_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/kick_tab_screen.png',
      description: 'One-tap movement logging measuring baby kick intervals and fetal activity frequency.',
      tags: ['Fetal Movements', 'Session Timer'],
    },
    {
      id: 'mama-contractions',
      screenNumber: '07',
      name: 'Contractions Timer Screen',
      category: 'Daily Vitals',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/07_contractions_timer_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/shot_contractions.png',
      description: 'Precision stopwatch recording contraction duration and intervals to guide hospital readiness.',
      tags: ['Labor Tracker', 'Interval Analytics'],
    },
    {
      id: 'mama-hydration',
      screenNumber: '08',
      name: 'Hydration & Nutrition Screen',
      category: 'Wellness',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/08_hydration_nutrition_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/shot_hydration.png',
      description: 'Daily water intake counter with target glass milestones and protein/calorie meal logs.',
      tags: ['Water Intake', 'Nutrition Log'],
    },
    {
      id: 'mama-wellness',
      screenNumber: '09',
      name: 'Wellness & Habits Screen',
      category: 'Wellness',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/09_wellness_activity_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/shot_wellness.png',
      description: 'Gentle prenatal yoga, stretching routines, breathing exercises, and mindful relaxation streaks.',
      tags: ['Daily Wellness', 'Safe Exercise'],
    },
    {
      id: 'mama-visits',
      screenNumber: '10',
      name: 'Prenatal Visits Screen',
      category: 'Care',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/10_prenatal_visits_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/shot_visits.png',
      description: 'Appointment planner highlighting upcoming doctor checkups, ultrasound dates, and clinical notes.',
      tags: ['Clinic Visits', 'Care Calendar'],
    },
    {
      id: 'mama-community',
      screenNumber: '11',
      name: 'Community & Advice Screen',
      category: 'Care',
      previewImage: 'assets/images/samrique_mama_pregnancy_tracker/11_community_discussions_preview.png',
      assetImage: 'assets/images/samrique_mama_pregnancy_tracker/shot_community.png',
      description: 'Supportive mother-to-mother forums with categorized threads, wellness tips, and advice exchanges.',
      tags: ['Community Support', 'Maternal Tips'],
    },
  ];

  protected readonly zipiScreens: ProductScreen[] = [
    {
      id: 'zipi-splash',
      screenNumber: '01',
      name: 'Splash & Welcome Screen',
      category: 'Onboarding',
      previewImage: 'assets/images/zipi_bike_taxi_app/01_splash_screen_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/01-splash.png',
      description: 'Startup screen introducing Zipi brand for agile, affordable on-demand bike taxi transit.',
      tags: ['Welcome Screen', 'Brand Identity'],
    },
    {
      id: 'zipi-role',
      screenNumber: '02',
      name: 'Role Selection Screen',
      category: 'Onboarding',
      previewImage: 'assets/images/zipi_bike_taxi_app/02_select_role_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/02-role-select.png',
      description: 'Interactive chooser directing users to either the Rider commuter experience or Captain driver partner flow.',
      tags: ['Role Switching', 'Dual Experience'],
    },
    {
      id: 'zipi-rider-login',
      screenNumber: '03',
      name: 'Rider Login Screen',
      category: 'Authentication',
      previewImage: 'assets/images/zipi_bike_taxi_app/03_rider_login_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/03-rider-login.png',
      description: 'Fast mobile number authentication interface for rapid transit booking without lengthy forms.',
      tags: ['Phone Auth', 'Fast Login'],
    },
    {
      id: 'zipi-driver-login',
      screenNumber: '04',
      name: 'Driver Captain Login Screen',
      category: 'Authentication',
      previewImage: 'assets/images/zipi_bike_taxi_app/04_driver_login_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/04-driver-login.png',
      description: 'Secure credentials portal for verified bike taxi captains accessing dispatch routes.',
      tags: ['Captain Auth', 'Fleet Portal'],
    },
    {
      id: 'zipi-rider-otp',
      screenNumber: '05',
      name: 'Rider OTP Verification Screen',
      category: 'Authentication',
      previewImage: 'assets/images/zipi_bike_taxi_app/07_rider_otp_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/05-otp-rider.png',
      description: 'One-time SMS passcode input with countdown timer and automatic verification.',
      tags: ['2FA Verification', 'SMS Code'],
    },
    {
      id: 'zipi-driver-otp',
      screenNumber: '06',
      name: 'Driver OTP Verification Screen',
      category: 'Authentication',
      previewImage: 'assets/images/zipi_bike_taxi_app/06_driver_otp_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/05-otp-driver.png',
      description: 'High-security OTP validation guaranteeing captain identity prior to accepting rides.',
      tags: ['Driver Security', 'Identity Gate'],
    },
    {
      id: 'zipi-rider-signup',
      screenNumber: '07',
      name: 'Rider Profile Registration Screen',
      category: 'Onboarding',
      previewImage: 'assets/images/zipi_bike_taxi_app/08_rider_signup_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/06-rider-signup.png',
      description: 'Account initialization capturing commuter name, email, and emergency contact details.',
      tags: ['User Onboarding', 'Emergency Contact'],
    },
    {
      id: 'zipi-driver-signup',
      screenNumber: '08',
      name: 'Captain Partner Onboarding Screen',
      category: 'Onboarding',
      previewImage: 'assets/images/zipi_bike_taxi_app/09_driver_signup_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/07-driver-signup.png',
      description: 'Driver partner onboarding capturing driving license credentials, city, and vehicle details.',
      tags: ['Captain Signup', 'Fleet Registration'],
    },
    {
      id: 'zipi-rider-home',
      screenNumber: '09',
      name: 'Rider Live Map & Booking Screen',
      category: 'Transit',
      previewImage: 'assets/images/zipi_bike_taxi_app/10_rider_home_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/08-rider-home.png',
      description: 'Interactive Google Maps screen with real-time captain bike markers, pickup address pin, and quick book button.',
      tags: ['Interactive Map', 'Live Bikes Radar'],
    },
    {
      id: 'zipi-driver-home',
      screenNumber: '10',
      name: 'Captain Dispatch & Radar Screen',
      category: 'Captain',
      previewImage: 'assets/images/zipi_bike_taxi_app/11_driver_home_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/09-driver-home.png',
      description: 'Captain duty toggle (Online / Offline), incoming booking request cards, and route preview.',
      tags: ['Duty Switch', 'Order Dispatch'],
    },
    {
      id: 'zipi-rider-dashboard',
      screenNumber: '11',
      name: 'Rider Activity Dashboard Screen',
      category: 'Transit',
      previewImage: 'assets/images/zipi_bike_taxi_app/12_rider_dadshboard_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/12-profile-rider.png',
      description: 'Commuter dashboard showing frequent destinations, past trip records, and saved addresses.',
      tags: ['Quick Access', 'Trip Log'],
    },
    {
      id: 'zipi-driver-orders',
      screenNumber: '12',
      name: 'Captain Trips & Order History Screen',
      category: 'Captain',
      previewImage: 'assets/images/zipi_bike_taxi_app/13_driver_order_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/11-driver-orders.png',
      description: 'Completed rides history, order timestamps, kilometer tallies, and passenger ratings.',
      tags: ['Trip Auditing', 'Rides Completed'],
    },
    {
      id: 'zipi-driver-earnings',
      screenNumber: '13',
      name: 'Captain Earnings & Metrics Screen',
      category: 'Captain',
      previewImage: 'assets/images/zipi_bike_taxi_app/14_driver_profile_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/10-driver-earnings.png',
      description: 'Daily and weekly revenue analytics, bonus incentives, and bank account settlement details.',
      tags: ['Earnings Analytics', 'Incentives'],
    },
    {
      id: 'zipi-rider-profile',
      screenNumber: '14',
      name: 'Rider Profile & Preferences Screen',
      category: 'Profile',
      previewImage: 'assets/images/zipi_bike_taxi_app/15_rider_profile_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/12-profile-rider.png',
      description: 'Commuter account settings, emergency SOS configurations, safety center, and helpdesk.',
      tags: ['Account Settings', 'Safety Features'],
    },
    {
      id: 'zipi-edit-driver',
      screenNumber: '15',
      name: 'Edit Captain Profile Screen',
      category: 'Captain',
      previewImage: 'assets/images/zipi_bike_taxi_app/16_edit_driver_profile_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/13-edit-profile-driver.png',
      description: 'Captain profile editor to update contact number, home operating zone, and profile photo.',
      tags: ['Profile Editing', 'Zone Settings'],
    },
    {
      id: 'zipi-edit-rider',
      screenNumber: '16',
      name: 'Edit Rider Profile Screen',
      category: 'Profile',
      previewImage: 'assets/images/zipi_bike_taxi_app/17_edit_rider_profile_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/13-edit-profile-rider.png',
      description: 'Rider personal information editor, avatar customization, and notification preferences.',
      tags: ['User Profile', 'Customization'],
    },
    {
      id: 'zipi-documents',
      screenNumber: '17',
      name: 'Captain Documents Upload Screen',
      category: 'Compliance',
      previewImage: 'assets/images/zipi_bike_taxi_app/18_documents_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/14-documents.png',
      description: 'Verification checklist for driver license, vehicle registration (RC), and pollution certificate.',
      tags: ['KYC Upload', 'Document Checklist'],
    },
    {
      id: 'zipi-doc-viewer',
      screenNumber: '18',
      name: 'Document Inspection Viewer Screen',
      category: 'Compliance',
      previewImage: 'assets/images/zipi_bike_taxi_app/19_documents_view_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/15-document-viewer.png',
      description: 'High-resolution zoomable viewer for verified government documents and compliance certificates.',
      tags: ['Inspection Viewer', 'Verification'],
    },
    {
      id: 'zipi-language',
      screenNumber: '19',
      name: 'Language Localization Screen',
      category: 'Settings',
      previewImage: 'assets/images/zipi_bike_taxi_app/20_language_settings_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/16-language-settings.png',
      description: 'Multi-lingual localization switcher providing English, Hindi, and regional language options.',
      tags: ['Localization', 'Language Switcher'],
    },
    {
      id: 'zipi-vehicle-select',
      screenNumber: '20',
      name: 'Vehicle Fleet Selection Screen',
      category: 'Transit',
      previewImage: 'assets/images/zipi_bike_taxi_app/21_vehicle_selection_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/17-vehicle-selection.png',
      description: 'Choice between Standard Bike Taxi, Express Delivery, and Eco EV Bike with fare comparison.',
      tags: ['Fleet Chooser', 'Fare Matrix'],
    },
    {
      id: 'zipi-invoice',
      screenNumber: '21',
      name: 'Digital Ride Invoice Screen',
      category: 'Transit',
      previewImage: 'assets/images/zipi_bike_taxi_app/22_rider_invoice_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/18-ride-invoice.png',
      description: 'Post-trip digital invoice breakdown of base fare, distance traveled, waiting time, taxes, and receipt download.',
      tags: ['Trip Invoice', 'Fare Breakdown'],
    },
    {
      id: 'zipi-verification',
      screenNumber: '22',
      name: 'Account Verification Status Screen',
      category: 'Compliance',
      previewImage: 'assets/images/zipi_bike_taxi_app/23_profile_verification_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/19-profile-verification.png',
      description: 'Real-time status tracker for captain background checks, document approval, and activation status.',
      tags: ['Compliance Status', 'Trust & Safety'],
    },
  ];

  @HostListener('window:popstate')
  protected syncRoute(): void {
    this.showMoneyManager = ['/products/money-manager', '/products/samrique-money-manager'].includes(this.routePath);
    this.showMarketplace = ['/products/samrique-e-marketplace', '/products/quickcart'].includes(this.routePath);
    this.showMama = ['/products/samrique-mama', '/products/samrique-mama-pregnancy-tracker'].includes(this.routePath);
    this.showZipi = ['/products/zipi-bike-taxi', '/products/zipi-bike-taxi-app', '/products/samrique-zipi-multi-modal-transit'].includes(this.routePath);
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');

    if (!this.showMoneyManager && !this.showMarketplace && !this.showMama && !this.showZipi) {
      this.refreshHomeVisibility();
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  protected openMoneyManager(): void {
    if (this.routePath !== '/products/money-manager') {
      window.history.pushState({}, '', this.appPath('/products/money-manager'));
    }
    this.showMoneyManager = true;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  protected openMarketplace(): void {
    if (this.routePath !== '/products/samrique-e-marketplace') {
      window.history.pushState({}, '', this.appPath('/products/samrique-e-marketplace'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = true;
    this.showMama = false;
    this.showZipi = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  protected openMama(): void {
    if (this.routePath !== '/products/samrique-mama') {
      window.history.pushState({}, '', this.appPath('/products/samrique-mama'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = true;
    this.showZipi = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  protected openZipi(): void {
    if (this.routePath !== '/products/zipi-bike-taxi') {
      window.history.pushState({}, '', this.appPath('/products/zipi-bike-taxi'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = true;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  protected scrollToProductSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected returnToProjects(): void {
    window.history.pushState({}, '', this.appPath('/#projects'));
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    this.refreshHomeVisibility();
  }

  protected inquireAboutMoneyManager(): void {
    if (this.routePath !== '/') {
      window.history.pushState({}, '', this.appPath('/#contact'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = false;
    this.refreshHomeVisibility();
    this.openBooking();
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
