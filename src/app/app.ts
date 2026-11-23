import { AfterViewInit, ChangeDetectorRef, Component, HostListener, NgZone, OnDestroy } from '@angular/core';
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
  protected bookingSending = false;
  protected bookingStatus: 'ok' | 'err' | '' = '';
  protected bookingMessageText = '';
  protected bookingGotcha = '';
  protected bookingName = '';
  protected bookingEmail = '';
  protected bookingPhone = '';
  protected bookingMessage = '';
  protected bookingService = 'General consultation';
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
  protected showZest = ['/products/zest-grocery', '/products/zest', '/products/samrique-zest-grocery'].includes(this.routePath);
  protected showJanovexa = ['/products/janovexa', '/products/janovexa-civic-grievance', '/products/samrique-janovexa'].includes(this.routePath);
  protected showFieldora = ['/products/fieldora', '/products/fieldora-staff-tracking', '/products/samrique-fieldora'].includes(this.routePath);
  protected showPricingPage = ['/start-a-project', '/pricing', '/pricing-plans'].includes(this.routePath);

  // Modal Lightbox state
  protected activeModalScreen: ProductScreen | null = null;
  protected modalViewMode: 'preview' | 'asset' = 'preview';
  protected cardViewModes: Record<string, 'preview' | 'asset'> = {};

  // Pricing & Currency State
  protected showPricingUSD = true;

  // Legal Modals State
  protected showPrivacyModal = ['/privacy', '/privacy-policy'].includes(this.routePath);
  protected showTermsModal = ['/terms', '/terms-of-service', '/terms-and-conditions'].includes(this.routePath);
  protected showUdyamModal = false;
  protected enquiryOpen = false;

  // Contact Enquiry Form State
  protected contactForm = {
    name: '',
    email: '',
    phone: '',
    company: '',
    project_type: '',
    package: '',
    budget: '',
    timeline: '',
    details: '',
    _gotcha: '',
  };
  protected contactSending = false;
  protected contactStatus: 'ok' | 'err' | '' = '';
  protected contactMessage = '';

  // Category filters
  protected moneyManagerCategory = 'All';
  protected marketplaceCategory = 'All';
  protected mamaCategory = 'All';
  protected zipiCategory = 'All';
  protected zestCategory = 'All';
  protected janovexaCategory = 'All';
  protected fieldoraCategory = 'All';

  private revealObserver?: IntersectionObserver;
  private bookingTrigger?: HTMLElement;

  constructor(
    private readonly zone: NgZone,
    private readonly changeDetector: ChangeDetectorRef,
  ) { }

  private readonly handleScroll = (): void => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    document.getElementById('top-progress-bar')?.style.setProperty('width', `${progress}%`);

    const sections = ['hero', 'services', 'how-it-works', 'projects', 'gov-solutions', 'about'];
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
    this.enquiryOpen = false;
    this.bookingTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.bookingOpen = true;
    this.bookingNoticeVisible = false;
    this.bookingError = '';
    this.bookingStatus = '';
    this.bookingMessageText = '';
    this.bookingSending = false;
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

    if (this.showUdyamModal && event.key === 'Escape') {
      this.closeUdyamModal();
      return;
    }

    if (this.showPrivacyModal && event.key === 'Escape') {
      this.closePrivacyModal();
      return;
    }

    if (this.showTermsModal && event.key === 'Escape') {
      this.closeTermsModal();
      return;
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
    const gotcha = (formData.get('_gotcha') as string) || this.bookingGotcha;
    if (gotcha) {
      return;
    }

    const name = ((formData.get('bookingName') as string) || this.bookingName || '').trim();
    const email = ((formData.get('bookingEmail') as string) || this.bookingEmail || '').trim();
    const phone = ((formData.get('bookingPhone') as string) || this.bookingPhone || '').trim();
    const message = ((formData.get('bookingMessage') as string) || this.bookingMessage || '').trim();

    const subject = `[Discovery Call Request] ${this.selectedBookingDateLabel} at ${this.selectedBookingTime} - ${name || 'Founder'}`;
    this.bookingSending = true;
    this.bookingStatus = '';
    this.bookingError = '';
    this.bookingMessageText = '';

    const actionUrl = form.getAttribute('action') || 'https://formsubmit.co/ajax/samrique.in@gmail.com';
    const payload = {
      _gotcha: gotcha,
      name: name,
      email: email,
      _replyto: email,
      phone: phone || 'N/A',
      preferred_date: `${this.selectedBookingDateLabel} (${this.selectedBookingDate})`,
      preferred_time: `${this.selectedBookingTime} (${this.bookingTimezone})`,
      service: this.bookingService,
      project_idea: message || 'N/A',
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
    };

    fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`Submission endpoint returned ${r.status}`);
        }
        this.bookingStatus = 'ok';
        this.bookingMessageText =
          'Discovery call request received! We will review your preferred time and reply by email within 24 hours to confirm.';
        this.bookingName = '';
        this.bookingEmail = '';
        this.bookingPhone = '';
        this.bookingMessage = '';
        this.bookingNoticeVisible = true;
      })
      .catch(() => {
        this.bookingStatus = 'err';
        this.bookingMessageText =
          'We could not confirm the request with FormSubmit. It may still have been delivered, so please wait for our email reply before submitting again.';
      })
      .finally(() => {
        this.bookingSending = false;
        this.changeDetector.markForCheck();
      });
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

  private scheduleRevealObservation(): void {
    window.requestAnimationFrame(() => this.observeRevealElements());
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
    if (this.showZest) return this.zestScreens;
    if (this.showJanovexa) return this.janovexaScreens;
    if (this.showFieldora) return this.fieldoraScreens;
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
      'retail': '#10b981',
      'wholesale': '#3b82f6',
      'delivery': '#f59e0b',
      '01_citizen_portal': '#4A1525',
      '02_department_admin_portal': '#0B132B',
      '03_field_officer_portal': '#FF6B35',
      'citizen portal': '#4A1525',
      'department admin': '#0B132B',
      'field officer': '#FF6B35',
      'staff': '#059669',
    };
    return map[category?.toLowerCase()] || '#17b3a3';
  }

  protected getCategoryCount(screens: ProductScreen[], category: string): number {
    if (category === 'All') return screens.length;
    return screens.filter((s) => s.category.toLowerCase() === category.toLowerCase()).length;
  }

  protected get totalProductBuilds(): number {
    return 7;
  }

  protected get totalDocumentedScreens(): number {
    return (
      this.marketplaceScreens.length +
      this.moneyManagerScreens.length +
      this.mamaScreens.length +
      this.zipiScreens.length +
      this.zestScreens.length +
      this.janovexaScreens.length +
      this.fieldoraScreens.length
    );
  }

  // --- Proof Points & Case Build Classifications ---
  protected readonly moneyManagerProofPoint = {
    badge: 'Personal Finance · Offline-First',
    classification: 'Product Showcase / Concept MVP',
    notice: 'Internal reference build engineered to demonstrate offline-first state architecture, sub-second SQLite performance, and zero-latency transaction pipelines. Not a live banking service with active external users.',
    problemSolved: 'Users hesitate to adopt finance apps that require continuous cloud lock-in or sensitive bank linking, creating latency and privacy concerns. Samrique Money Manager solves this with an instant, private, local-first transaction ledger.',
    keyUserFlows: 'Sub-second expense & income recording with automated balance reconciliation across accounts → monthly spending distribution insights by category → one-tap filtered CSV ledger export.',
    architectureTimeline: 'Engineered in a 2-week agile sprint utilizing an offline-first SQLite database architecture, reactive GetX controller lifecycle ensuring consistent 60fps frame rates, and strict type-safe Dart models.'
  };

  protected readonly marketplaceProofPoint = {
    badge: 'Digital Commerce · Multi-Role',
    classification: 'Product Showcase / Concept MVP',
    notice: 'Turnkey concept build engineered to demonstrate multi-vendor commerce, asynchronous payment webhooks, and KYC moderation. Built as an internal concept MVP; not an active commercial marketplace with public sellers.',
    problemSolved: 'Digital creators and boutique design agencies struggle with cumbersome multi-vendor platforms that suffer from delayed onboarding, manual KYC bottlenecks, and high checkout drop-offs.',
    keyUserFlows: 'Buyer catalog discovery & search → Razorpay checkout → secure tokenized digital file download | Seller KYC onboarding & verification → listing approval moderation dashboard → seller wallet payout requests.',
    architectureTimeline: 'Architected and built in a 4-week sprint using Flutter with modular Provider state management, unified REST API service adapters, and 18 production-ready screens compiled across mobile, tablet, and web.'
  };

  protected readonly mamaProofPoint = {
    badge: 'Pregnancy & Wellness · HealthTech',
    classification: 'Product Showcase / Concept MVP',
    notice: 'Maternal health proof-of-capability app engineered to validate gestational calculation engines, real-time physiological timers, and secure medical logging. Built as an internal product showcase; not a certified clinical or live consumer service.',
    problemSolved: 'Expectant mothers face clinical, fragmented utilities that overwhelm them with ads and clinical jargon rather than offering a calm, reassuring, and intuitive companion for tracking milestones, daily symptoms, and prenatal appointments.',
    keyUserFlows: 'Dynamic due-date gestation engine calculating weekly milestones and developmental fruit analogies → interactive contraction stopwatch and fetal kick counter → daily symptom journaling & prenatal appointment reminder pipeline.',
    architectureTimeline: 'Engineered in a 3-week design-to-code sprint utilizing Provider for decoupled event streams, Flutter Secure Storage for encrypted local session tokens, and a human-centered Material 3 aesthetic.'
  };

  protected readonly zipiProofPoint = {
    badge: 'On-Demand Mobility · Dual-Persona',
    classification: 'Product Showcase / Concept MVP',
    notice: 'Multi-persona on-demand mobility platform engineered to demonstrate real-time geospatial dispatch, dynamic fare calculation, and dual-role driver/rider state synchronization. Built as an internal concept MVP; not an operating fleet with live municipal riders.',
    problemSolved: 'Metropolitan commuters lose hours in traffic gridlock with unpredictable cab surge pricing, while independent two-wheeler drivers lack reliable dispatching, upfront fare transparency, and trusted driver verification.',
    keyUserFlows: 'Commuter live map pickup selection → Google Maps route polyline rendering → instant captain matching & tracking → itemized digital fare invoice | Captain KYC document submission → real-time order radar alert acceptance → earnings analytics dashboard.',
    architectureTimeline: 'Architected and delivered in a 4-week sprint featuring a synchronized dual-persona architecture with GetX state management, Google Maps Flutter SDK, real-time geocoding, and modular mock dispatch engines.'
  };

  protected readonly zestProofPoint = {
    badge: 'Quick-Commerce & Wholesale · Multi-Role',
    classification: 'Product Showcase / Concept MVP',
    notice: 'Multi-role quick-commerce and wholesale grocery application prototype engineered to demonstrate unified B2C retail shopping, B2B wholesale ordering with volume tiers, and a 4-stage driver fulfillment pipeline backed by demo data fixtures.',
    problemSolved: 'Grocery businesses struggle to unify retail consumer quick-delivery, bulk restaurant wholesale procurement, and last-mile driver coordination into a single maintainable Flutter codebase without fragmenting state and business logic.',
    keyUserFlows: 'B2C consumer catalog discovery, search & express cart checkout → B2B wholesale bulk tier ordering, Net 30 credit terms & saved supply lists → Delivery partner task acceptance → store pickup → OpenStreetMap transit → customer handover & earnings analytics.',
    architectureTimeline: 'Engineered in an agile sprint using Flutter & Dart (SDK ^3.13.5), GetX reactive state management and dependency injection, flutter_map with OpenStreetMap integration, and a unified multi-persona architecture.'
  };

  protected readonly janovexaProofPoint = {
    badge: 'Civic Tech & Public Service · Multi-Role',
    title: 'JANOVEXA – Citizen Services Platform',
    projectType: 'Independent Product Demonstration / Portfolio Project',
    classification: 'Independent Product Demonstration / Portfolio Project',
    demoLabel: 'INDEPENDENT PRODUCT DEMONSTRATION',
    notice: 'JANOVEXA is an independently conceptualized and developed citizen services platform demonstration by SAMRIQUE. The platform demonstrates our capabilities in citizen complaint management, service requests, complaint tracking, notifications, administrative workflows and mobile application development. This project is presented solely as a technology demonstration to showcase our software development capabilities.',
    disclaimer: 'These products are independently developed by SAMRIQUE and are not officially commissioned, approved or endorsed by any government department. No government department affiliation or official partnership is implied.',
    syntheticDataNotice: 'Demonstration uses synthetic, anonymized demo data: No real citizen records, government employee details or confidential information.',
    problemSolved: 'Municipal grievance redressal often suffers from opaque resolution timelines, unverified complaint geotags, fragmented citizen communication, and disconnected field dispatch, leading to breached SLAs and declining civic trust.',
    keyUserFlows: 'Citizen 5-step grievance registration with OSM map pin drop & evidence upload → Department admin queue triage, SLA tracking & field officer dispatch → Field officer on-site navigation, repair resolution & timestamped audit journey → Citizen closure verification & reopening.',
    architectureTimeline: 'Engineered with Flutter SDK ^3.47.7, Dart ^3.13.5, Flutter Riverpod ^3.5.0 compile-safe state management, flutter_map ^8.3.2 & latlong2 ^0.10.1 with OpenStreetMap tiles, and modern Material 3 design tokens spanning 41 screens across 3 distinct municipal roles.'
  };

  protected readonly fieldoraProofPoint = {
    badge: 'Field Workforce & Staff Tracking · Multi-Role',
    title: 'FIELDORA — Field Workforce & Staff Tracking Platform',
    projectType: 'Independent Product Demonstration / Portfolio Project',
    classification: 'Independent Product Demonstration / Portfolio Project',
    demoLabel: 'INDEPENDENT PRODUCT DEMONSTRATION',
    notice: 'FIELDORA is an independently conceptualized and developed field workforce and staff tracking platform demonstration by SAMRIQUE. The platform demonstrates our capabilities in GPS-verified attendance, real-time route tracking, daily activity reporting, dispatch administration, supervisor inspection workflows, and mobile application development. This project is presented solely as a technology demonstration to showcase our software development capabilities.',
    disclaimer: 'These products are independently developed by SAMRIQUE and are not officially commissioned, approved or endorsed by any government department. No official organization or government department affiliation is implied.',
    syntheticDataNotice: 'Demonstration uses synthetic, anonymized demo data: No real personnel records, employee details or confidential information.',
    problemSolved: 'Organizations struggle with unverified attendance timesheets, lack of real-time field staff visibility, delayed work order dispatch, cumbersome paper-based reporting, and staff privacy concerns during off-duty hours.',
    keyUserFlows: 'Frontline staff GPS check-in (±8m verification) & privacy consent → Live route polyline tracking on OpenStreetMap with manual stop controls → Daily task inspection checklist & geotagged photo reports → Admin live OpenStreetMap fleet radar, animated route playback, work order dispatch, and report approval workflows.',
    architectureTimeline: 'Engineered with Flutter SDK 3.47.7, Dart 3.13.5, Flutter Riverpod ^3.5.0 reactive state architecture, OpenStreetMap tiles with flutter_map ^8.3.2 and latlong2 ^0.10.1, Material 3 design tokens, and Intl ^0.20.3 across 38 screens and 2 distinct mobile roles.'
  };

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
    ['Application framework', 'Flutter'],
    ['Programming language', 'Dart (SDK >=3.0.0 <4.0.0)'],
    ['State management and navigation', 'GetX'],
    ['Local database & persistence', 'SQLite (sqflite) offline ledger & SharedPreferences'],
    ['Backend communication', 'REST API using http'],
    ['Currency and date formatting', 'intl'],
    ['UI', 'Material 3, light and dark themes'],
    ['Automated tests', 'Flutter test framework'],
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
    ['State management', 'Provider'],
    ['API communication', 'Dio and HTTP; REST API integration'],
    ['Local preferences', 'SharedPreferences'],
    ['UI and media', 'Material Design, carousel_slider, flutter_staggered_grid_view, shimmer, cached_network_image, flutter_svg, flutter_animate'],
    ['Payments', 'Razorpay Flutter'],
    ['Notifications and analytics dependencies', 'Firebase Messaging, flutter_local_notifications, Firebase Analytics'],
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
    { title: 'Community & peer support', detail: 'Topic-based discussion threads for expectant mothers to share tips and prenatal experiences, with offline caching and backend moderation sync on the roadmap.' },
    { title: 'Responsive experience', detail: 'A pregnancy-themed Flutter UI built with Material 3 components.' },
  ];

  protected readonly mamaStack = [
    ['Application framework', 'Flutter'],
    ['Programming language', 'Dart (>=3.0.0 <4.0.0)'],
    ['State management', 'Provider'],
    ['API communication', 'HTTP REST API'],
    ['Date and time formatting', 'intl'],
    ['Secure storage & tokens', 'flutter_secure_storage & SharedPreferences for authenticated session caching & token encryption'],
  ];

  protected readonly zipiFeatures = [
    { title: 'Role-based experience', detail: 'Dedicated, tailored workflows for commuters (riders) and captain drivers with seamless role switching.' },
    { title: 'Live interactive map booking', detail: 'Map-based pickup and drop-off point selection, real-time vehicle dispatch, route polyline preview, and ETA estimation.' },
    { title: 'Upfront fare & ride options', detail: 'Transparent fare breakdown based on trip distance, surge multipliers, and vehicle choices (Bike Taxi, Express Delivery, EV Bike).' },
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
    ['Local cache & storage', 'SharedPreferences'],
    ['Design system', 'Custom On-Demand Mobility theme, Material 3'],
  ];

  protected readonly zestFeatures = [
    { title: 'Three role-based experiences', detail: 'Seamless switching between B2C customer, B2B wholesale buyer, and delivery partner workflows with pre-configured quick-switch demo accounts.' },
    { title: 'B2C retail grocery shopping', detail: 'Browse department categories, live keyword search with price and stock filters, detailed product view, wishlist favorites, and responsive shopping cart.' },
    { title: 'B2B wholesale & volume tiers', detail: 'Bulk purchasing with tiered unit pricing, minimum order quantities (MOQ), crate/bag configurations, and automated volume discount calculations.' },
    { title: 'Net 30 trade credit wallet', detail: 'Dedicated wholesale credit ledger with real-time balance tracking, Net 30 payment term selection, and recurring saved order lists for restaurants.' },
    { title: '4-stage driver delivery pipeline', detail: 'Structured delivery partner fulfillment workflow: task dispatch acceptance, store pickup checklist, live GPS transit, and customer doorstep handover.' },
    { title: 'OpenStreetMap & live routing', detail: 'Map views powered by flutter_map and latlong2 using OpenStreetMap tiles for hub pickup routing, transit tracking, and drop-off guidance.' },
    { title: 'Driver earnings & surge zones', detail: 'Performance dashboard tracking daily payouts, tip totals, shift booking schedule, and high-demand surge zone incentives.' },
    { title: 'Shared product architecture', detail: 'Centralized ProductModel in Dart supporting dual retail/wholesale prices, derived stock status, and sample catalogue across fresh produce, dairy, bakery, and pantry.' },
  ];

  protected readonly zestStack = [
    ['Application framework', 'Flutter and Dart (SDK ^3.13.5 / Flutter 3.47.x)'],
    ['State management & routing', 'GetX (routing, dependency injection, reactive controllers)'],
    ['Mapping & Geolocation', 'flutter_map & latlong2 with OpenStreetMap tiles'],
    ['API communication scaffold', 'http / GetConnect ApiProvider with mock fixture fallback'],
    ['Typography & Design system', 'Google Fonts (Plus Jakarta Sans), Material 3, custom theme'],
    ['Formatting & Media', 'intl for date/currency formatting, cached_network_image'],
    ['Multi-persona architecture', 'B2C Customer, B2B Wholesale Buyer, Delivery Partner'],
    ['Automated testing suite', 'Flutter test framework (widget and workflow test suite in test/)'],
  ];

  protected readonly janovexaFeatures = [
    { title: 'Three synchronized civic portals', detail: 'Dedicated role-based portals for Citizens (01_Citizen_Portal), Department Administrators (02_Department_Admin_Portal), and Field Engineers (03_Field_Officer_Portal) with tailored UX and state models.' },
    { title: '5-step evidence-based grievance filing', detail: 'Intuitive wizard covering category selection, character-counted description, interactive OSM map pin placement, 10MB photo/document uploads, and instant reference ID generation (JVX-2026-01482).' },
    { title: 'OpenStreetMap GIS & geotagging', detail: 'Interactive vector/raster map powered by flutter_map and latlong2 with live GPS current-location auto-fill, reverse geocoding, and ward validation.' },
    { title: 'Transparent lifecycle audit timeline', detail: 'Vertical connected timeline providing real-time visibility into complaint registration, department assignment, technician dispatch, and resolution verification.' },
    { title: 'Multi-department admin dashboard', detail: 'Central command for Electrical, Solid Waste, Water Supply & Sewerage, and Roads departments featuring live SLA compliance (94.2%), turnaround times, and officer dispatch sheets.' },
    { title: 'Field officer workspace & routing', detail: 'Assigned work order queue with turn-by-turn map directions, Mark On-Site check-in, on-site photo proof upload, and direct ticket resolution.' },
    { title: 'Citizen charter & SLA governance', detail: 'Clear statutory turnaround targets, escalation matrices, public service announcements, and transparent citizen rights charter.' },
    { title: 'Reopen & citizen recourse loop', detail: 'Empowers citizens to reopen unsatisfactory resolutions within a defined window by providing additional notes and photographic proof.' },
  ];

  protected readonly janovexaStack = [
    ['Frontend Mobile Framework', 'Flutter SDK ^3.47.7 & Dart ^3.13.5 (cross-platform native compiled)'],
    ['State Management', 'Flutter Riverpod ^3.5.0 (Declarative, compile-safe application state)'],
    ['Mapping & GIS Navigation', 'flutter_map ^8.3.2 & latlong2 ^0.10.1 (OpenStreetMap interactive vector/raster tiles)'],
    ['Design System & Typography', 'Material 3 (M3) with custom brand tokens (Imperial Maroon #4A1525, Orange #FF6B35, Navy #0B132B) & Google Fonts (Plus Jakarta Sans)'],
    ['Localization & Date/Time', 'intl ^0.20.3 (localized complaint timestamps and date formatting)'],
    ['Iconography & Visual Assets', 'Cupertino Icons ^1.0.8 & high-fidelity custom civic vector assets'],
    ['Target Backend Architecture', 'NestJS enterprise TypeScript REST API with modular dependency injection & OpenAPI / Swagger contracts'],
    ['Target Database & ORM', 'PostgreSQL relational database with Prisma ORM type-safe schemas and audit migrations'],
    ['Target Security & Auth', 'Stateless JWT authentication with role-based access control (citizen, field_officer, dept_admin)'],
    ['Test & Emulation Harness', 'Android ADB automated pipeline & Impeller Engine (OpenGLES) on Android 17 / API 37 emulator'],
  ];

  protected readonly fieldoraFeatures = [
    { title: 'Two Synchronized Enterprise Roles', detail: 'Tailored mobile experiences for Field Staff (18 screens) and Admin & Supervisors (20 screens) with role-based permission tiers.' },
    { title: 'GPS-Verified Attendance & Geofencing', detail: 'Check-in/out with precision location verification (±8m), break deduction calculation, and authorized geofenced job site enforcement.' },
    { title: 'Shift-Bound Privacy Control', detail: '"Visible on duty. Private off duty." Transparent location consent disclosures, visible duty indicators, manual tracking pause controls, and automatic end-of-shift tracking cut-off.' },
    { title: 'OpenStreetMap Live Fleet Radar & Playback', detail: 'Interactive vector/raster maps with live markers for on-duty employees, animated route playback with speed controls (1x, 2x, 5x), and waypoint scrubbers.' },
    { title: 'Task Dispatch & Field Inspections', detail: 'Work order dispatch form by priority and site, paired with an interactive field inspection checklist, progress notes, and one-tap completion.' },
    { title: 'Geotagged Photo Reports & Approvals', detail: 'Daily activity reports with up to 5 photos from camera/gallery, offline draft support, supervisor review remarks, and Approve / Request Changes workflow.' },
    { title: 'Compliance & Performance Analytics', detail: 'Fleet attendance compliance percentage, late arrivals, velocity index scorecards, and comprehensive PDF / Excel / CSV export capabilities.' },
  ];

  protected readonly fieldoraStack = [
    ['Frontend Mobile Framework', 'Flutter SDK ^3.47.7 & Dart ^3.13.5 (cross-platform native compiled)'],
    ['State Management', 'Flutter Riverpod ^3.5.0 (Declarative, compile-safe application state)'],
    ['Mapping & GIS Navigation', 'flutter_map ^8.3.2 & latlong2 ^0.10.1 (OpenStreetMap interactive vector/raster tiles, live polylines & geofences)'],
    ['Design System & Typography', 'Material 3 (M3) with custom enterprise field tokens & Google Fonts (Inter, Plus Jakarta Sans)'],
    ['GPS Tracking & Attendance', 'Geolocator & Background Location services with ±8m geofence validation and off-duty privacy cut-offs'],
    ['Localization & Date/Time', 'intl ^0.20.3 (timestamped shift audits, route playback scrubbers & localized date formatting)'],
    ['Iconography & Visual Assets', 'Cupertino Icons ^1.0.8 & high-fidelity custom operations vector assets'],
    ['Target Backend Architecture', 'Enterprise TypeScript / Node.js REST API with WebSockets for real-time fleet radar dispatch'],
    ['Target Database & Geodata', 'PostgreSQL / PostGIS geospatial database with Prisma ORM type-safe schemas and audit migrations'],
    ['Target Security & Audit', 'Stateless JWT authentication with role-based access control (field_staff, supervisor, admin) & immutable audit trail'],
    ['Test & Emulation Harness', 'Android ADB automated pipeline & Impeller Engine (OpenGLES) on Android 17 / API 37 emulator'],
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
      name: 'Captain Login Screen',
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
      name: 'Captain OTP Verification Screen',
      category: 'Authentication',
      previewImage: 'assets/images/zipi_bike_taxi_app/06_driver_otp_preview.png',
      assetImage: 'assets/images/zipi_bike_taxi_app/05-otp-driver.png',
      description: 'High-security OTP validation guaranteeing captain identity prior to accepting rides.',
      tags: ['Captain Security', 'Identity Gate'],
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
      description: 'Captain partner onboarding capturing driving license credentials, city, and vehicle details.',
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
      description: 'Verification checklist for the captain’s driving license, vehicle registration (RC), and pollution certificate.',
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

  protected readonly zestScreens: ProductScreen[] = [
    // --- B2C Customer Screens ---
    {
      id: 'zest-b2c-home',
      screenNumber: '01',
      name: 'B2C Grocery Home Screen',
      category: 'Retail',
      previewImage: 'assets/images/zest_grocery/zest_grocery_showcase.jpg',
      assetImage: 'assets/images/zest_grocery/b2c_home.png',
      description: 'Customer storefront with promotional banners, quick-order categories, featured fresh produce, and one-tap cart addition.',
      tags: ['Retail Storefront', 'Express Delivery'],
    },
    {
      id: 'zest-b2c-categories',
      screenNumber: '02',
      name: 'Grocery Categories Explorer',
      category: 'Retail',
      previewImage: 'assets/images/zest_grocery/b2c_categories.png',
      assetImage: 'assets/images/zest_grocery/b2c_categories.png',
      description: 'Category hierarchy featuring fresh fruits, vegetables, dairy, bakery essentials, and packaged grocery goods.',
      tags: ['Category Tree', 'Department Browsing'],
    },
    {
      id: 'zest-b2c-search',
      screenNumber: '03',
      name: 'Product Search & Filtering Screen',
      category: 'Retail',
      previewImage: 'assets/images/zest_grocery/b2c_search.png',
      assetImage: 'assets/images/zest_grocery/b2c_search.png',
      description: 'Instant autocomplete search with price filters, category chips, in-stock toggles, and recent search history.',
      tags: ['Live Search', 'Faceted Filters'],
    },
    {
      id: 'zest-b2c-product',
      screenNumber: '04',
      name: 'Retail Product Details Screen',
      category: 'Retail',
      previewImage: 'assets/images/zest_grocery/b2c_product.png',
      assetImage: 'assets/images/zest_grocery/b2c_product.png',
      description: 'Detailed product page displaying high-resolution imagery, per-unit pricing, stock availability, nutritional notes, and cart controls.',
      tags: ['Product Information', 'Unit Pricing'],
    },
    {
      id: 'zest-b2c-cart',
      screenNumber: '05',
      name: 'B2C Shopping Cart & Checkout',
      category: 'Retail',
      previewImage: 'assets/images/zest_grocery/b2c_cart.png',
      assetImage: 'assets/images/zest_grocery/b2c_cart.png',
      description: 'Interactive shopping cart with item quantity steppers, bill breakdown, delivery slot selection, and checkout CTA.',
      tags: ['Cart Management', 'Order Summary'],
    },
    {
      id: 'zest-b2c-favorites',
      screenNumber: '06',
      name: 'Saved Favorites & Wishlist',
      category: 'Retail',
      previewImage: 'assets/images/zest_grocery/b2c_favorites.png',
      assetImage: 'assets/images/zest_grocery/b2c_favorites.png',
      description: 'Bookmarked grocery items for fast repeat shopping, stock alert indicators, and one-click add to active cart.',
      tags: ['Wishlist', 'Repeat Purchases'],
    },
    {
      id: 'zest-b2c-account',
      screenNumber: '07',
      name: 'Customer Account & Addresses',
      category: 'Retail',
      previewImage: 'assets/images/zest_grocery/b2c_account.png',
      assetImage: 'assets/images/zest_grocery/b2c_account.png',
      description: 'Consumer profile overview managing saved delivery locations, order history, customer support, and demo account switching.',
      tags: ['Customer Profile', 'Address Book'],
    },
    {
      id: 'zest-b2c-more',
      screenNumber: '08',
      name: 'Services & Helpdesk Hub',
      category: 'Retail',
      previewImage: 'assets/images/zest_grocery/b2c_more.png',
      assetImage: 'assets/images/zest_grocery/b2c_more.png',
      description: 'App preferences, order cancellation policy, customer support chat, FAQs, and terms of service.',
      tags: ['Customer Support', 'Service Policies'],
    },

    // --- B2B Wholesale Buyer Screens ---
    {
      id: 'zest-b2b-registration',
      screenNumber: '09',
      name: 'Wholesale Business Registration',
      category: 'Wholesale',
      previewImage: 'assets/images/zest_grocery/b2b_registration.png',
      assetImage: 'assets/images/zest_grocery/b2b_registration.png',
      description: 'B2B onboarding flow capturing trade name, GSTIN identification, FSSAI license, delivery dock address, and business type.',
      tags: ['B2B Onboarding', 'GSTIN Verification'],
    },
    {
      id: 'zest-b2b-home',
      screenNumber: '10',
      name: 'B2B Wholesale Portal Home',
      category: 'Wholesale',
      previewImage: 'assets/images/zest_grocery/b2b_home.png',
      assetImage: 'assets/images/zest_grocery/b2b_home.png',
      description: 'Wholesale catalog interface showing bulk quantity tiers, MOQ notifications, crate discounts, and Net 30 credit banner.',
      tags: ['Wholesale Catalog', 'Bulk Tiers'],
    },
    {
      id: 'zest-b2b-categories',
      screenNumber: '11',
      name: 'Bulk Wholesale Categories',
      category: 'Wholesale',
      previewImage: 'assets/images/zest_grocery/b2b_categories.png',
      assetImage: 'assets/images/zest_grocery/b2b_categories.png',
      description: 'Departmental bulk categories including commercial farm crates, wholesale produce, dairy cartons, and staple sacks.',
      tags: ['Commercial Supply', 'Bulk Categories'],
    },
    {
      id: 'zest-b2b-product',
      screenNumber: '12',
      name: 'Wholesale Product & Tier Pricing',
      category: 'Wholesale',
      previewImage: 'assets/images/zest_grocery/b2b_product.png',
      assetImage: 'assets/images/zest_grocery/b2b_product.png',
      description: 'Bulk product specifications displaying minimum wholesale quantities (MOQ), crate/bag volume tiers, and tiered margin savings.',
      tags: ['MOQ Thresholds', 'Tiered Pricing'],
    },
    {
      id: 'zest-b2b-cart',
      screenNumber: '13',
      name: 'Wholesale Bulk Cart & Net 30 Terms',
      category: 'Wholesale',
      previewImage: 'assets/images/zest_grocery/b2b_cart.png',
      assetImage: 'assets/images/zest_grocery/b2b_cart.png',
      description: 'Large-scale purchase order review with automatic tier discounts, freight calculation, and Net 30 credit checkout option.',
      tags: ['Bulk Orders', 'Net 30 Checkout'],
    },
    {
      id: 'zest-b2b-saved-lists',
      screenNumber: '14',
      name: 'Saved Order Lists & Quick Reorder',
      category: 'Wholesale',
      previewImage: 'assets/images/zest_grocery/b2b_saved-lists.png',
      assetImage: 'assets/images/zest_grocery/b2b_saved-lists.png',
      description: 'Custom standing purchase templates for restaurants, caterers, and retail grocers for instant weekly stock replenishment.',
      tags: ['Standing Orders', 'Quick Reorder'],
    },
    {
      id: 'zest-b2b-wallet',
      screenNumber: '15',
      name: 'Net 30 Credit Wallet & Invoices',
      category: 'Wholesale',
      previewImage: 'assets/images/zest_grocery/b2b_wallet.png',
      assetImage: 'assets/images/zest_grocery/b2b_wallet.png',
      description: 'B2B credit balance management, available trade credit line, pending invoice due dates, and settlement payment history.',
      tags: ['Trade Credit', 'Invoice Ledger'],
    },
    {
      id: 'zest-b2b-profile',
      screenNumber: '16',
      name: 'Business Profile & Tax Records',
      category: 'Wholesale',
      previewImage: 'assets/images/zest_grocery/b2b_profile.png',
      assetImage: 'assets/images/zest_grocery/b2b_profile.png',
      description: 'Commercial enterprise settings with verified GSTIN, trade license records, registered billing address, and contact officers.',
      tags: ['Business Entity', 'Tax Compliance'],
    },

    // --- Delivery Partner Screens ---
    {
      id: 'zest-delivery-home',
      screenNumber: '17',
      name: 'Delivery Partner Home Dashboard',
      category: 'Delivery',
      previewImage: 'assets/images/zest_grocery/delivery_home.png',
      assetImage: 'assets/images/zest_grocery/delivery_home.png',
      description: 'Driver operational hub featuring duty online/offline toggle, today earnings gauge, active dispatch alert, and surge hot-spots.',
      tags: ['Driver Hub', 'Duty Toggle'],
    },
    {
      id: 'zest-delivery-tasks',
      screenNumber: '18',
      name: 'Delivery Tasks & Dispatch Pool',
      category: 'Delivery',
      previewImage: 'assets/images/zest_grocery/delivery_tasks.png',
      assetImage: 'assets/images/zest_grocery/delivery_tasks.png',
      description: 'Real-time dispatch requests queue displaying pickup hub location, delivery distance, estimated transit time, and payout.',
      tags: ['Dispatch Radar', 'Task Queue'],
    },
    {
      id: 'zest-delivery-pickup',
      screenNumber: '19',
      name: 'Store Pickup & Order Checklist',
      category: 'Delivery',
      previewImage: 'assets/images/zest_grocery/delivery_pickup.png',
      assetImage: 'assets/images/zest_grocery/delivery_pickup.png',
      description: 'Store arrival workflow with fulfillment center directions, parcel item checklist verification, and departure confirmation.',
      tags: ['Store Pickup', 'Package Checklist'],
    },
    {
      id: 'zest-delivery-transit',
      screenNumber: '20',
      name: 'Live Transit Navigation & Map',
      category: 'Delivery',
      previewImage: 'assets/images/zest_grocery/delivery_transit.png',
      assetImage: 'assets/images/zest_grocery/delivery_transit.png',
      description: 'Map navigation powered by flutter_map and OpenStreetMap with live transit path, destination marker, and customer phone dialer.',
      tags: ['OpenStreetMap', 'Live Routing'],
    },
    {
      id: 'zest-delivery-handover',
      screenNumber: '21',
      name: 'Customer Handover & Verification',
      category: 'Delivery',
      previewImage: 'assets/images/zest_grocery/delivery_handover.png',
      assetImage: 'assets/images/zest_grocery/delivery_handover.png',
      description: 'Doorstep completion screen verifying customer handover, delivery passcode confirmation, and contactless drop photo capture.',
      tags: ['Doorstep Delivery', 'OTP Handover'],
    },
    {
      id: 'zest-delivery-completed',
      screenNumber: '22',
      name: 'Order Completed & Payout Summary',
      category: 'Delivery',
      previewImage: 'assets/images/zest_grocery/delivery_completed.png',
      assetImage: 'assets/images/zest_grocery/delivery_completed.png',
      description: 'Successful delivery screen breaking down base trip fare, distance bonus, customer tip, and readiness for next dispatch.',
      tags: ['Delivery Completed', 'Trip Payout'],
    },
    {
      id: 'zest-delivery-earnings',
      screenNumber: '23',
      name: 'Driver Earnings & Performance',
      category: 'Delivery',
      previewImage: 'assets/images/zest_grocery/delivery_earnings.png',
      assetImage: 'assets/images/zest_grocery/delivery_earnings.png',
      description: 'Comprehensive earnings analytics with daily payout graphs, weekly milestones, completed deliveries, and tip totals.',
      tags: ['Earnings Analytics', 'Incentives'],
    },
    {
      id: 'zest-delivery-shifts',
      screenNumber: '24',
      name: 'Shift Scheduling & Surge Zones',
      category: 'Delivery',
      previewImage: 'assets/images/zest_grocery/delivery_shifts.png',
      assetImage: 'assets/images/zest_grocery/delivery_shifts.png',
      description: 'Weekly shift planner with booking slots, high-demand surge map zones, peak bonus multipliers, and attendance tracking.',
      tags: ['Shift Planner', 'Surge Zones'],
    },
    {
      id: 'zest-delivery-profile',
      screenNumber: '25',
      name: 'Driver Partner Profile & KYC',
      category: 'Delivery',
      previewImage: 'assets/images/zest_grocery/delivery_profile.png',
      assetImage: 'assets/images/zest_grocery/delivery_profile.png',
      description: 'Courier partner identification, vehicle registration documentation, driving license KYC status, and customer rating metrics.',
      tags: ['Driver Profile', 'KYC Compliance'],
    },
  ];

  protected readonly janovexaScreens: ProductScreen[] = [
    // ==========================================
    // 01_Citizen_Portal (27 Screens)
    // ==========================================
    // --- Onboarding & Authentication ---
    {
      id: 'jvx-splash',
      screenNumber: '01',
      name: 'Brand Splash & Mission Screen',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/01_splash_screen.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/01_splash_screen.png',
      description: 'Animated 3D ribbon mark with civic slogan "Your voice. A better city. Together, we make progress" and smooth boot transition.',
      tags: ['Splash Screen', 'Brand Identity'],
    },
    {
      id: 'jvx-welcome',
      screenNumber: '02',
      name: 'Welcome & Value Proposition',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/02_welcome_screen.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/02_welcome_screen.png',
      description: 'City skyline illustration with landmark civic buildings, value proposition ("Better neighbourhoods. Built together."), and action buttons.',
      tags: ['Civic Onboarding', 'Value Proposition'],
    },
    {
      id: 'jvx-role-select',
      screenNumber: '03',
      name: 'Multi-Role Portal Selection',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/03_role_selection_screen.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/03_role_selection_screen.png',
      description: 'Role selection hub directing citizens, field engineers, and department administrators to their dedicated workflows.',
      tags: ['Role Gateway', 'Portal Switcher'],
    },
    {
      id: 'jvx-cit-login',
      screenNumber: '04',
      name: 'Citizen Sign In',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/04_citizen_login_screen.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/04_citizen_login_screen.png',
      description: 'Credential-based login with mobile number or email, password visibility toggle, "Log in with OTP" fallback, and secure account storage notices.',
      tags: ['Authentication', 'Citizen Login'],
    },
    {
      id: 'jvx-cit-signup',
      screenNumber: '05',
      name: 'Citizen Account Registration',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/05_citizen_signup_screen.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/05_citizen_signup_screen.png',
      description: 'Citizen sign-up capturing Full name, Mobile number, Email address, and Password with visibility toggle and strength criteria.',
      tags: ['Account Registration', 'Citizen Sign-up'],
    },
    {
      id: 'jvx-forgot-pw',
      screenNumber: '06',
      name: 'Forgot Password Screen',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/06_forgot_password_screen.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/06_forgot_password_screen.png',
      description: 'Mobile number entry with automated code dispatch and 5-minute code expiration guidance for account recovery.',
      tags: ['Account Recovery', 'Forgot Password'],
    },
    {
      id: 'jvx-otp-verify',
      screenNumber: '07',
      name: 'OTP Verification Screen',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/07_otp_verification_screen.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/07_otp_verification_screen.png',
      description: '6 individual verification boxes with auto-focus, live resend timer, 1-tap quick fill for demo (123456), and simulated SMS notification banner.',
      tags: ['OTP Verification', '2FA Security'],
    },
    {
      id: 'jvx-reset-pw',
      screenNumber: '08',
      name: 'Reset Password Screen',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/08_reset_password_screen.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/08_reset_password_screen.png',
      description: 'Password creation with real-time criteria validation (8+ characters, uppercase & lowercase, number/special character).',
      tags: ['Password Reset', 'Credential Security'],
    },
    // --- Citizen Dashboard & Tracking ---
    {
      id: 'jvx-cit-home',
      screenNumber: '09',
      name: 'Citizen Home Dashboard',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/01_citizen_home_dashboard.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/01_citizen_home_dashboard.png',
      description: 'Greeting header ("Good morning, Aarav - Ward 12 · Indiranagar"), alert bell, hero burgundy action card, live grievance updates banner, 4 metric counters (07 Total, 02 Pending, 02 In progress, 02 Resolved), and recent complaints list.',
      tags: ['Citizen Dashboard', 'Civic Feed'],
    },
    {
      id: 'jvx-cit-grievances',
      screenNumber: '10',
      name: 'My Grievances List (All)',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/02_citizen_grievances_list_all.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/02_citizen_grievances_list_all.png',
      description: 'Searchable complaint list with filter pills (All · 6, In Progress · 3, Resolved · 3) displaying reference numbers, addresses, submission dates, and status badges.',
      tags: ['My Complaints', 'Filter & Search'],
    },
    {
      id: 'jvx-cit-details',
      screenNumber: '11',
      name: 'Complaint Details & Active Alert',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/03_citizen_complaint_details.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/03_citizen_complaint_details.png',
      description: 'Reference header, status pill, active "REPAIR UNDERWAY" alert banner, OpenStreetMap geotag, assigned officer details, attached evidence viewer, and dynamic actions.',
      tags: ['Complaint Details', 'SLA Tracking'],
    },
    {
      id: 'jvx-cit-audit',
      screenNumber: '12',
      name: 'Status Audit History Timeline',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/04_citizen_status_audit_history.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/04_citizen_status_audit_history.png',
      description: 'Vertical connected timeline detailing lifecycle milestones: Repair in progress, Assigned to department, Under review, and Complaint registered.',
      tags: ['Status History', 'Audit Trail'],
    },
    {
      id: 'jvx-cit-reopen',
      screenNumber: '13',
      name: 'Reopen Complaint Request',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/05_citizen_reopen_complaint.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/05_citizen_reopen_complaint.png',
      description: 'Recourse form for resolved complaints requiring further attention, allowing citizens to submit detailed justification and attach additional photo proof.',
      tags: ['Reopen Complaint', 'Citizen Recourse'],
    },
    {
      id: 'jvx-cit-analytics',
      screenNumber: '14',
      name: 'Civic Analytics & SLA Metrics',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/06_citizen_analytics_reports.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/06_citizen_analytics_reports.png',
      description: 'Zonal transparency metrics showing 71.4% resolution rate, departmental ticket breakdowns, and average civic turnaround velocity.',
      tags: ['Civic Analytics', 'Resolution SLA'],
    },
    {
      id: 'jvx-cit-charter',
      screenNumber: '15',
      name: 'Citizen Charter & Guidelines',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/07_citizen_instructions_charter.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/07_citizen_instructions_charter.png',
      description: 'Statutory municipal turnaround SLAs, escalation tiers, guaranteed citizen rights, and department response timelines.',
      tags: ['Citizen Charter', 'Service Standards'],
    },
    {
      id: 'jvx-cit-alerts',
      screenNumber: '16',
      name: 'Alerts & Notifications Feed',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/08_citizen_alerts_notifications.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/08_citizen_alerts_notifications.png',
      description: 'Live alerts feed with unread count badges, "Mark all as read", filter tabs (All, Unread · 2), and interactive 1-tap links directly to complaint details.',
      tags: ['Notification Feed', 'Broadcast Alerts'],
    },
    {
      id: 'jvx-cit-profile',
      screenNumber: '17',
      name: 'Citizen Profile & Quick Links',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/09_citizen_user_profile.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/09_citizen_user_profile.png',
      description: 'Verified citizen account badge for Aarav Sharma (+91 98765 43210), quick shortcuts to settings and support, and direct switch to Department Admin Dashboard.',
      tags: ['Citizen Profile', 'Identity Verification'],
    },
    {
      id: 'jvx-cit-edit-profile',
      screenNumber: '18',
      name: 'Edit Citizen Profile',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/10_citizen_edit_profile.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/10_citizen_edit_profile.png',
      description: 'Profile editing interface managing full name, phone verification update, email address, and residential ward neighbourhood.',
      tags: ['Edit Profile', 'Ward Info'],
    },
    {
      id: 'jvx-cit-change-pw',
      screenNumber: '19',
      name: 'Change Account Password',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/11_citizen_change_password.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/11_citizen_change_password.png',
      description: 'Credential modification screen requiring current password verification and validating new password strength rules.',
      tags: ['Security Settings', 'Password Change'],
    },
    {
      id: 'jvx-cit-settings',
      screenNumber: '20',
      name: 'Citizen Application Settings',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/12_citizen_settings_screen.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/12_citizen_settings_screen.png',
      description: 'Toggle switches for Push notifications, SMS updates, and Email copies, plus Language selector and Privacy & permissions controls.',
      tags: ['App Settings', 'Notification Preferences'],
    },
    {
      id: 'jvx-cit-help',
      screenNumber: '21',
      name: 'Civic Help, FAQs & Helpline',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/13_citizen_help_support_faqs.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/13_citizen_help_support_faqs.png',
      description: 'Searchable civic FAQs, 24/7 toll-free municipal helpline (1912), emergency escalation contacts, and terms of service.',
      tags: ['Help & Support', 'Municipal Helpline'],
    },
    // --- 5-Step Grievance Registration ---
    {
      id: 'jvx-step1-cat',
      screenNumber: '22',
      name: 'Step 1: Category Selection',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/01_step1_category_selection.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/01_step1_category_selection.png',
      description: 'Grievance triage selection between Roads & footpaths, Water supply, Streetlights, Waste & sanitation, and Other civic issues.',
      tags: ['Category Selection', 'Step 1 of 5'],
    },
    {
      id: 'jvx-step2-details',
      screenNumber: '23',
      name: 'Step 2: Grievance Details',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/02_step2_grievance_details.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/02_step2_grievance_details.png',
      description: 'Category confirmation, complaint title, contextual landmark description, and character counter (123 / 1000 characters).',
      tags: ['Grievance Details', 'Step 2 of 5'],
    },
    {
      id: 'jvx-step3-map',
      screenNumber: '24',
      name: 'Step 3: OSM Geolocation Map',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/03_step3_location_gps_map.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/03_step3_location_gps_map.png',
      description: 'Search bar, interactive stylized city grid map with pin marker, GPS auto-fill ("Use current location"), and ward verification.',
      tags: ['OpenStreetMap Pin', 'Step 3 of 5'],
    },
    {
      id: 'jvx-step4-evidence',
      screenNumber: '25',
      name: 'Step 4: Evidence Photo Upload',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/04_step4_evidence_upload.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/04_step4_evidence_upload.png',
      description: 'Dashed upload zone ("Take a photo or browse files") supporting images and documents up to 10MB, plus list of attached evidence files.',
      tags: ['Evidence Upload', 'Step 4 of 5'],
    },
    {
      id: 'jvx-step5-review',
      screenNumber: '26',
      name: 'Step 5: Review & Declaration',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/05_step5_review_and_confirm.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/05_step5_review_and_confirm.png',
      description: 'Comprehensive review summary card with Category, inline Edit shortcuts, Title, Description, Geolocation, and statutory Declaration checkbox.',
      tags: ['Review Summary', 'Step 5 of 5'],
    },
    {
      id: 'jvx-submission-success',
      screenNumber: '27',
      name: 'Complaint Registered Success',
      category: '01_Citizen_Portal',
      previewImage: 'assets/images/janovexa/01_Citizen_Portal/06_submission_success.png',
      assetImage: 'assets/images/janovexa/01_Citizen_Portal/06_submission_success.png',
      description: 'Success checkmark badge, reference ID generator (JVX-2026-01482), "Track complaint", and "Back to dashboard" direct actions.',
      tags: ['Submission Success', 'Tracking ID'],
    },

    // ==========================================
    // 02_Department_Admin_Portal (8 Screens)
    // ==========================================
    {
      id: 'jvx-adm-login',
      screenNumber: '28',
      name: 'Department Admin Login',
      category: '02_Department_Admin_Portal',
      previewImage: 'assets/images/janovexa/02_Department_Admin_Portal/10_department_admin_login_screen.png',
      assetImage: 'assets/images/janovexa/02_Department_Admin_Portal/10_department_admin_login_screen.png',
      description: 'Agency administrator credential checkpoint with department tag security and administrative authorization.',
      tags: ['Admin Auth', 'Agency Checkpoint'],
    },
    {
      id: 'jvx-adm-dash',
      screenNumber: '29',
      name: 'Department Admin Dashboard',
      category: '02_Department_Admin_Portal',
      previewImage: 'assets/images/janovexa/02_Department_Admin_Portal/01_department_admin_dashboard.png',
      assetImage: 'assets/images/janovexa/02_Department_Admin_Portal/01_department_admin_dashboard.png',
      description: 'Multi-department switcher (Electrical, Solid Waste, Water Supply, Roads), real-time KPIs (Total Received, Active/Under Repair, SLA Met 94.2%), and triage queue table.',
      tags: ['Admin Command', 'Department KPIs'],
    },
    {
      id: 'jvx-adm-assign',
      screenNumber: '30',
      name: 'Assign Field Officer Bottom Sheet',
      category: '02_Department_Admin_Portal',
      previewImage: 'assets/images/janovexa/02_Department_Admin_Portal/02_admin_assign_officer_sheet.png',
      assetImage: 'assets/images/janovexa/02_Department_Admin_Portal/02_admin_assign_officer_sheet.png',
      description: 'Bottom sheet modal to allocate field engineers (K. Ramesh Rao, Smt. Geetha V., Anand Kulkarni) with workload stats and 1-tap dispatch.',
      tags: ['Officer Dispatch', 'Task Allocation'],
    },
    {
      id: 'jvx-adm-update',
      screenNumber: '31',
      name: 'Update Complaint Status Sheet',
      category: '02_Department_Admin_Portal',
      previewImage: 'assets/images/janovexa/02_Department_Admin_Portal/03_admin_update_status_sheet.png',
      assetImage: 'assets/images/janovexa/02_Department_Admin_Portal/03_admin_update_status_sheet.png',
      description: 'Modal sheet to move ticket lifecycle status, enter official resolution remarks, and broadcast real-time updates and notifications to the citizen.',
      tags: ['Status Update', 'Citizen Broadcast'],
    },
    {
      id: 'jvx-adm-sla',
      screenNumber: '32',
      name: 'Zonal SLA & Performance Reports',
      category: '02_Department_Admin_Portal',
      previewImage: 'assets/images/janovexa/02_Department_Admin_Portal/04_admin_zonal_sla_reports.png',
      assetImage: 'assets/images/janovexa/02_Department_Admin_Portal/04_admin_zonal_sla_reports.png',
      description: 'Department-wide resolution speed, zonal SLA met vs breached breakdown, turnaround time metrics, and escalation audits.',
      tags: ['Zonal SLA', 'Compliance Reports'],
    },
    {
      id: 'jvx-adm-history',
      screenNumber: '33',
      name: 'Archived Resolution History',
      category: '02_Department_Admin_Portal',
      previewImage: 'assets/images/janovexa/02_Department_Admin_Portal/05_admin_resolution_history.png',
      assetImage: 'assets/images/janovexa/02_Department_Admin_Portal/05_admin_resolution_history.png',
      description: 'Archived audit logs of resolved grievances with multi-parameter filtering by department, resolution date, and assigned officer.',
      tags: ['Resolution Archive', 'Audit Logs'],
    },
    {
      id: 'jvx-adm-sops',
      screenNumber: '34',
      name: 'Administrative Operating SOPs',
      category: '02_Department_Admin_Portal',
      previewImage: 'assets/images/janovexa/02_Department_Admin_Portal/06_admin_administrative_sops.png',
      assetImage: 'assets/images/janovexa/02_Department_Admin_Portal/06_admin_administrative_sops.png',
      description: 'Operational protocol guidelines, statutory turnaround requirements, grievance priority classification, and triage rules.',
      tags: ['Administrative SOPs', 'Triage Rules'],
    },
    {
      id: 'jvx-adm-profile',
      screenNumber: '35',
      name: 'Admin Profile & Agency Info',
      category: '02_Department_Admin_Portal',
      previewImage: 'assets/images/janovexa/02_Department_Admin_Portal/07_admin_profile_management.png',
      assetImage: 'assets/images/janovexa/02_Department_Admin_Portal/07_admin_profile_management.png',
      description: 'Administrator identity, municipal agency affiliation (BBMP / BESCOM), designated zonal jurisdiction, and session credentials.',
      tags: ['Admin Profile', 'Agency Credentials'],
    },

    // ==========================================
    // 03_Field_Officer_Portal (6 Screens)
    // ==========================================
    {
      id: 'jvx-off-login',
      screenNumber: '36',
      name: 'Field Officer Login',
      category: '03_Field_Officer_Portal',
      previewImage: 'assets/images/janovexa/03_Field_Officer_Portal/09_officer_login_screen.png',
      assetImage: 'assets/images/janovexa/03_Field_Officer_Portal/09_officer_login_screen.png',
      description: 'Officer badge ID, department tag, and staff credentials checkpoint for field engineers and on-site inspection teams.',
      tags: ['Staff Login', 'Officer Checkpoint'],
    },
    {
      id: 'jvx-off-workspace',
      screenNumber: '37',
      name: 'Field Officer Workspace & Orders',
      category: '03_Field_Officer_Portal',
      previewImage: 'assets/images/janovexa/03_Field_Officer_Portal/01_field_officer_workspace.png',
      assetImage: 'assets/images/janovexa/03_Field_Officer_Portal/01_field_officer_workspace.png',
      description: 'Assigned work orders feed with turn-by-turn routing, priority badges, "Mark On-Site" arrival check-in, and "Mark Resolved" resolution actions.',
      tags: ['Work Orders', 'Field Dispatch'],
    },
    {
      id: 'jvx-off-history',
      screenNumber: '38',
      name: 'Officer Work History & Archive',
      category: '03_Field_Officer_Portal',
      previewImage: 'assets/images/janovexa/03_Field_Officer_Portal/02_field_officer_history.png',
      assetImage: 'assets/images/janovexa/03_Field_Officer_Portal/02_field_officer_history.png',
      description: 'Personal work order resolution archive with completion timestamps, photographic proof records, and citizen sign-offs.',
      tags: ['Work History', 'Closed Tickets'],
    },
    {
      id: 'jvx-off-reports',
      screenNumber: '39',
      name: 'Officer Performance Reports',
      category: '03_Field_Officer_Portal',
      previewImage: 'assets/images/janovexa/03_Field_Officer_Portal/03_field_officer_performance_reports.png',
      assetImage: 'assets/images/janovexa/03_Field_Officer_Portal/03_field_officer_performance_reports.png',
      description: 'Personal SLA velocity dashboard, total work orders handled, first-time fix rate, and monthly engineering efficiency ratings.',
      tags: ['Performance Metrics', 'Officer SLA'],
    },
    {
      id: 'jvx-off-safety',
      screenNumber: '40',
      name: 'Field Safety & SOP Guidelines',
      category: '03_Field_Officer_Portal',
      previewImage: 'assets/images/janovexa/03_Field_Officer_Portal/04_field_officer_safety_guidelines.png',
      assetImage: 'assets/images/janovexa/03_Field_Officer_Portal/04_field_officer_safety_guidelines.png',
      description: 'Standard operating safety procedures, mandatory PPE gear requirements, high-voltage hazard protocols, and on-site evidence capture standards.',
      tags: ['Safety Guidelines', 'Field SOPs'],
    },
    {
      id: 'jvx-off-profile',
      screenNumber: '41',
      name: 'Officer Profile & Official ID Badge',
      category: '03_Field_Officer_Portal',
      previewImage: 'assets/images/janovexa/03_Field_Officer_Portal/05_field_officer_profile.png',
      assetImage: 'assets/images/janovexa/03_Field_Officer_Portal/05_field_officer_profile.png',
      description: 'Official municipal engineer identity card, verified beat ward assignment, department credentials, and emergency desk contact.',
      tags: ['Official Badge', 'Beat Assignment'],
    },
  ];

  protected readonly fieldoraScreens: ProductScreen[] = [
    // --- Part 1: Staff Mobile App Role (18 Screens + Main Shell) ---
    {
      id: 'fld-stf-01-splash',
      screenNumber: '01',
      name: 'Splash Screen',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_01_splash.png',
      assetImage: 'assets/images/fieldora/staff/staff_01_splash.png',
      description: 'Hero branding, assets/logo.png, 3-step value prop, animated progress bar with auto-transition.',
      tags: ['Auth', 'Splash Experience', 'Brand Identity'],
    },
    {
      id: 'fld-stf-02-login',
      screenNumber: '02',
      name: 'Login Screen',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_02_login.png',
      assetImage: 'assets/images/fieldora/staff/staff_02_login.png',
      description: 'Employee ID / work email credentials, role switcher link, security advisory notice.',
      tags: ['Auth', 'Staff Credentials', 'Security Notice'],
    },
    {
      id: 'fld-stf-03-forgot-password',
      screenNumber: '03',
      name: 'Forgot / Reset Password',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_03_forgot_password.png',
      assetImage: 'assets/images/fieldora/staff/staff_03_forgot_password.png',
      description: 'Password recovery input, expiration timers, spam folder instructions.',
      tags: ['Auth', 'Password Recovery', 'Security Timers'],
    },
    {
      id: 'fld-stf-04-consent',
      screenNumber: '04',
      name: 'Tracking Consent & Permissions',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_04_consent.png',
      assetImage: 'assets/images/fieldora/staff/staff_04_consent.png',
      description: 'Privacy disclosure (Precise, Background, Notifications), "Visible on duty. Private off duty."',
      tags: ['Tracking', 'Privacy Consent', 'Shift Compliance'],
    },
    {
      id: 'fld-stf-05-home',
      screenNumber: '05',
      name: 'Home Dashboard',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_05_home_dashboard.png',
      assetImage: 'assets/images/fieldora/staff/staff_05_home_dashboard.png',
      description: 'On-duty elapsed timer, 3 KPI cards (Tasks Today, Completed, Distance), Up Next task card.',
      tags: ['Core', 'Duty Timer', 'Staff Dashboard'],
    },
    {
      id: 'fld-stf-06-check-in-out',
      screenNumber: '06',
      name: 'Check-in / Check-out',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_06_check_in_out.png',
      assetImage: 'assets/images/fieldora/staff/staff_06_check_in_out.png',
      description: 'GPS-verified location card (±8m), today\'s timeline, check-in / check-out button.',
      tags: ['Attendance', 'GPS Verification', 'Shift Check-in'],
    },
    {
      id: 'fld-stf-07-attendance-history',
      screenNumber: '07',
      name: 'Attendance History',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_07_attendance_history.png',
      assetImage: 'assets/images/fieldora/staff/staff_07_attendance_history.png',
      description: 'Month selector, monthly statistics (Present, Late, Absent), recent shifts list.',
      tags: ['Attendance', 'Monthly Records', 'Shift History'],
    },
    {
      id: 'fld-stf-08-attendance-detail',
      screenNumber: '08',
      name: 'Attendance Detail',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_08_attendance_detail.png',
      assetImage: 'assets/images/fieldora/staff/staff_08_attendance_detail.png',
      description: 'Verified timestamps, break deduction, geofence site verification, "Report an issue" button.',
      tags: ['Attendance', 'Geofence Verification', 'Break Deduction'],
    },
    {
      id: 'fld-stf-09-tracking-status',
      screenNumber: '09',
      name: 'Tracking Status & Stop Control',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_09_tracking_status.png',
      assetImage: 'assets/images/fieldora/staff/staff_09_tracking_status.png',
      description: 'OpenStreetMap route preview, sync timestamps, signal accuracy, red manual stop button.',
      tags: ['Tracking', 'Manual Stop Control', 'Signal Accuracy'],
    },
    {
      id: 'fld-stf-10-route-map',
      screenNumber: '10',
      name: 'My Route Map',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_10_my_route_map.png',
      assetImage: 'assets/images/fieldora/staff/staff_10_my_route_map.png',
      description: 'Interactive OpenStreetMap route polyline, distance/stops counters, waypoint timeline.',
      tags: ['Tracking', 'Route Polyline', 'OpenStreetMap Waypoints'],
    },
    {
      id: 'fld-stf-11-task-list',
      screenNumber: '11',
      name: 'Task List',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_11_task_list.png',
      assetImage: 'assets/images/fieldora/staff/staff_11_task_list.png',
      description: 'Dark progress card with lime progress bar, category filter pills (All, Pending, Done).',
      tags: ['Activity', 'Work Orders', 'Progress Bar'],
    },
    {
      id: 'fld-stf-12-task-detail',
      screenNumber: '12',
      name: 'Task Detail & Status Update',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_12_task_detail.png',
      assetImage: 'assets/images/fieldora/staff/staff_12_task_detail.png',
      description: 'Task instructions, interactive inspection checklist, progress notes, "Mark complete".',
      tags: ['Activity', 'Inspection Checklist', 'Status Update'],
    },
    {
      id: 'fld-stf-13-create-report',
      screenNumber: '13',
      name: 'Create Daily Activity Report',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_13_create_report.png',
      assetImage: 'assets/images/fieldora/staff/staff_13_create_report.png',
      description: 'Task link, date dropdown, summary textarea, blocker notes, offline draft capability.',
      tags: ['Activity', 'Daily Activity Report', 'Offline Drafts'],
    },
    {
      id: 'fld-stf-14-photo-upload',
      screenNumber: '14',
      name: 'Photo Capture & Upload',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_14_photo_upload.png',
      assetImage: 'assets/images/fieldora/staff/staff_14_photo_upload.png',
      description: 'Camera trigger, gallery selector, upload queue (up to 5 photos), geotag warning.',
      tags: ['Activity', 'Geotagged Evidence', 'Photo Upload'],
    },
    {
      id: 'fld-stf-15-report-history',
      screenNumber: '15',
      name: 'Report History',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_15_report_history.png',
      assetImage: 'assets/images/fieldora/staff/staff_15_report_history.png',
      description: 'Submissions filterable by All, Drafts, Submitted; displays supervisor review remarks.',
      tags: ['Activity', 'Supervisor Remarks', 'Report History'],
    },
    {
      id: 'fld-stf-16-notifications',
      screenNumber: '16',
      name: 'Notifications',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_16_notifications.png',
      assetImage: 'assets/images/fieldora/staff/staff_16_notifications.png',
      description: 'Grouped by Today / Yesterday; task updates, approval alerts, shift reminders.',
      tags: ['Core', 'Alerts Feed', 'Shift Reminders'],
    },
    {
      id: 'fld-stf-17-profile',
      screenNumber: '17',
      name: 'Profile',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_17_profile.png',
      assetImage: 'assets/images/fieldora/staff/staff_17_profile.png',
      description: 'Staff ID dossier, department, supervisor, base location, shift timing, contact info.',
      tags: ['Auth', 'Staff Dossier', 'Shift Timing'],
    },
    {
      id: 'fld-stf-18-settings',
      screenNumber: '18',
      name: 'Settings',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_18_settings.png',
      assetImage: 'assets/images/fieldora/staff/staff_18_settings.png',
      description: 'Push notifications toggles, shift reminders, location permissions, language, sign out.',
      tags: ['Core', 'Privacy Controls', 'App Settings'],
    },
    {
      id: 'fld-stf-19-main-shell',
      screenNumber: '—',
      name: 'Staff Main Shell',
      category: 'Staff',
      previewImage: 'assets/images/fieldora/staff/staff_19_main_shell.png',
      assetImage: 'assets/images/fieldora/staff/staff_19_main_shell.png',
      description: '5-tab bottom navigation bar (Home, Attendance, Route, Tasks, More Menu).',
      tags: ['Navigation', 'Bottom Navigation Shell', 'Staff UX'],
    },

    // --- Part 2: Admin & Supervisor Mobile App Role (20 Screens + Main Shell) ---
    {
      id: 'fld-adm-01-login',
      screenNumber: '01',
      name: 'Admin Login',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_01_login.png',
      assetImage: 'assets/images/fieldora/admin/admin_01_login.png',
      description: 'Dedicated supervisor & administrator authentication gateway.',
      tags: ['Auth', 'Supervisor Gateway', 'Security Authentication'],
    },
    {
      id: 'fld-adm-02-dashboard',
      screenNumber: '02',
      name: 'Dashboard (KPIs)',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_02_dashboard.png',
      assetImage: 'assets/images/fieldora/admin/admin_02_dashboard.png',
      description: 'Real-time fleet counter (Active in Field, Total, Off Duty, Pending Reports), quick actions.',
      tags: ['Dashboard', 'Fleet Counter', 'Operational KPIs'],
    },
    {
      id: 'fld-adm-03-employee-list',
      screenNumber: '03',
      name: 'Employee List',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_03_employee_list.png',
      assetImage: 'assets/images/fieldora/admin/admin_03_employee_list.png',
      description: 'Searchable directory with live status pills (On duty, Off duty, On leave) and department tags.',
      tags: ['Employees', 'Workforce Directory', 'Duty Status'],
    },
    {
      id: 'fld-adm-04-add-edit-employee',
      screenNumber: '04',
      name: 'Add / Edit Employee',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_04_add_edit_employee.png',
      assetImage: 'assets/images/fieldora/admin/admin_04_add_edit_employee.png',
      description: 'Staff provisioning form for names, IDs, designations, departments, base sites, and shifts.',
      tags: ['Employees', 'Workforce Provisioning', 'Staff Onboarding'],
    },
    {
      id: 'fld-adm-05-employee-detail',
      screenNumber: '05',
      name: 'Employee Detail',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_05_employee_detail.png',
      assetImage: 'assets/images/fieldora/admin/admin_05_employee_detail.png',
      description: 'Complete employee dossier, last active GPS coordinates, supervisor and shift details.',
      tags: ['Employees', 'Employee Dossier', 'GPS Coordinates'],
    },
    {
      id: 'fld-adm-06-departments',
      screenNumber: '06',
      name: 'Departments',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_06_departments.png',
      assetImage: 'assets/images/fieldora/admin/admin_06_departments.png',
      description: 'Divisional breakdown, staff counts, department leads, and "New Dept" creation modal.',
      tags: ['Settings', 'Divisional Structure', 'Department Leads'],
    },
    {
      id: 'fld-adm-07-shifts',
      screenNumber: '07',
      name: 'Shifts & Working Hours',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_07_shifts.png',
      assetImage: 'assets/images/fieldora/admin/admin_07_shifts.png',
      description: 'Shift policies, grace periods, assigned workforce counts, privacy cut-off explanation.',
      tags: ['Settings', 'Shift Policies', 'Privacy Cut-Off'],
    },
    {
      id: 'fld-adm-08-work-locations',
      screenNumber: '08',
      name: 'Work Locations',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_08_work_locations.png',
      assetImage: 'assets/images/fieldora/admin/admin_08_work_locations.png',
      description: 'Geofenced job sites, latitude/longitude, authorized radius in meters, assigned headcounts.',
      tags: ['Settings', 'Geofenced Job Sites', 'Radius Configuration'],
    },
    {
      id: 'fld-adm-09-live-map',
      screenNumber: '09',
      name: 'Live Map Dashboard',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_09_live_map.png',
      assetImage: 'assets/images/fieldora/admin/admin_09_live_map.png',
      description: 'Full-screen OpenStreetMap with live markers for on-duty employees & interactive card slider.',
      tags: ['Map', 'Live OpenStreetMap Radar', 'Fleet Tracking'],
    },
    {
      id: 'fld-adm-10-route-playback',
      screenNumber: '10',
      name: 'Route Playback',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_10_route_playback.png',
      assetImage: 'assets/images/fieldora/admin/admin_10_route_playback.png',
      description: 'Animated GPS route replay, timeline scrubber, speed multipliers (1x, 2x, 5x).',
      tags: ['Map', 'Animated GPS Replay', 'Speed Multipliers'],
    },
    {
      id: 'fld-adm-11-task-assignment',
      screenNumber: '11',
      name: 'Task Assignment',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_11_task_assignment.png',
      assetImage: 'assets/images/fieldora/admin/admin_11_task_assignment.png',
      description: 'Work order dispatch form with employee assignment, target site, due time, and priority.',
      tags: ['Tasks', 'Work Order Dispatch', 'Task Priority'],
    },
    {
      id: 'fld-adm-12-task-tracking',
      screenNumber: '12',
      name: 'Task List & Tracking',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_12_task_tracking.png',
      assetImage: 'assets/images/fieldora/admin/admin_12_task_tracking.png',
      description: 'Real-time status board of field work orders filtered by In Progress, Pending, Completed.',
      tags: ['Tasks', 'Status Board', 'Work Order Tracking'],
    },
    {
      id: 'fld-adm-13-reports-list',
      screenNumber: '13',
      name: 'Daily Activity Reports List',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_13_reports_list.png',
      assetImage: 'assets/images/fieldora/admin/admin_13_reports_list.png',
      description: 'Supervisor review queue of staff submissions across all operational divisions.',
      tags: ['Reports', 'Review Queue', 'Daily Activity Reports'],
    },
    {
      id: 'fld-adm-14-report-approval',
      screenNumber: '14',
      name: 'Activity Detail & Approval',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_14_report_approval.png',
      assetImage: 'assets/images/fieldora/admin/admin_14_report_approval.png',
      description: 'In-depth review with photo inspection, supervisor remarks input, Approve and Request Changes.',
      tags: ['Reports', 'Report Approval', 'Photo Inspection'],
    },
    {
      id: 'fld-adm-15-attendance-report',
      screenNumber: '15',
      name: 'Attendance Report',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_15_attendance_report.png',
      assetImage: 'assets/images/fieldora/admin/admin_15_attendance_report.png',
      description: 'Compliance percentage, late arrivals, absenteeism metrics, department breakdown, CSV export.',
      tags: ['Analytics', 'Attendance Compliance', 'CSV Export'],
    },
    {
      id: 'fld-adm-16-performance-report',
      screenNumber: '16',
      name: 'Employee Performance Report',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_16_performance_report.png',
      assetImage: 'assets/images/fieldora/admin/admin_16_performance_report.png',
      description: 'Fleet velocity index, productivity rankings, on-time leaderboard.',
      tags: ['Analytics', 'Velocity Index', 'Leaderboard'],
    },
    {
      id: 'fld-adm-17-activity-analytics',
      screenNumber: '17',
      name: 'Activity Analytics & Export',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_17_activity_analytics.png',
      assetImage: 'assets/images/fieldora/admin/admin_17_activity_analytics.png',
      description: 'Weekly submission bar chart, geotagged photo metrics, comprehensive PDF/Excel export.',
      tags: ['Analytics', 'Activity Trends', 'PDF/Excel Export'],
    },
    {
      id: 'fld-adm-18-roles-users',
      screenNumber: '18',
      name: 'Roles & Users',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_18_roles_users.png',
      assetImage: 'assets/images/fieldora/admin/admin_18_roles_users.png',
      description: 'Role-based permission tiers (Field Staff, Supervisor, Org Administrator) & access control.',
      tags: ['Settings', 'Role-Based Permissions', 'Access Control'],
    },
    {
      id: 'fld-adm-19-audit-log',
      screenNumber: '19',
      name: 'Consent & Audit Log',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_19_audit_log.png',
      assetImage: 'assets/images/fieldora/admin/admin_19_audit_log.png',
      description: 'Immutable audit trail of tracking start/stop events, geofence breaches, and consents.',
      tags: ['Settings', 'Immutable Audit Trail', 'Compliance Log'],
    },
    {
      id: 'fld-adm-20-settings',
      screenNumber: '20',
      name: 'Profile & System Settings',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_20_settings.png',
      assetImage: 'assets/images/fieldora/admin/admin_20_settings.png',
      description: 'Supervisor profile, GPS ping interval (2–5 min), 90-day retention policy, GIS tile config.',
      tags: ['Settings', 'System Settings', 'Retention Policy'],
    },
    {
      id: 'fld-adm-22-main-shell',
      screenNumber: '—',
      name: 'Admin Main Shell',
      category: 'Admin',
      previewImage: 'assets/images/fieldora/admin/admin_22_main_shell.png',
      assetImage: 'assets/images/fieldora/admin/admin_22_main_shell.png',
      description: '5-tab bottom navigation bar (Dashboard, Live Map, Staff, Tasks, Admin Hub).',
      tags: ['Navigation', 'Bottom Navigation Shell', 'Admin Hub'],
    },
  ];

  @HostListener('window:popstate')
  protected syncRoute(): void {
    this.showMoneyManager = ['/products/money-manager', '/products/samrique-money-manager'].includes(this.routePath);
    this.showMarketplace = ['/products/samrique-e-marketplace', '/products/quickcart'].includes(this.routePath);
    this.showMama = ['/products/samrique-mama', '/products/samrique-mama-pregnancy-tracker'].includes(this.routePath);
    this.showZipi = ['/products/zipi-bike-taxi', '/products/zipi-bike-taxi-app', '/products/samrique-zipi-multi-modal-transit'].includes(this.routePath);
    this.showZest = ['/products/zest-grocery', '/products/zest', '/products/samrique-zest-grocery'].includes(this.routePath);
    this.showJanovexa = ['/products/janovexa', '/products/janovexa-civic-grievance', '/products/samrique-janovexa'].includes(this.routePath);
    this.showFieldora = ['/products/fieldora', '/products/fieldora-staff-tracking', '/products/samrique-fieldora'].includes(this.routePath);
    this.showPricingPage = ['/start-a-project', '/pricing', '/pricing-plans'].includes(this.routePath);
    this.showPrivacyModal = ['/privacy', '/privacy-policy'].includes(this.routePath);
    this.showTermsModal = ['/terms', '/terms-of-service', '/terms-and-conditions'].includes(this.routePath);
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');

    if (!this.showMoneyManager && !this.showMarketplace && !this.showMama && !this.showZipi && !this.showZest && !this.showJanovexa && !this.showFieldora && !this.showPricingPage) {
      this.refreshHomeVisibility();
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      this.scheduleRevealObservation();
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
    this.showZest = false;
    this.showJanovexa = false;
    this.showFieldora = false;
    this.showPricingPage = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.scheduleRevealObservation();
  }

  protected openMarketplace(): void {
    if (this.routePath !== '/products/samrique-e-marketplace') {
      window.history.pushState({}, '', this.appPath('/products/samrique-e-marketplace'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = true;
    this.showMama = false;
    this.showZipi = false;
    this.showZest = false;
    this.showJanovexa = false;
    this.showFieldora = false;
    this.showPricingPage = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.scheduleRevealObservation();
  }

  protected openMama(): void {
    if (this.routePath !== '/products/samrique-mama') {
      window.history.pushState({}, '', this.appPath('/products/samrique-mama'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = true;
    this.showZipi = false;
    this.showZest = false;
    this.showJanovexa = false;
    this.showFieldora = false;
    this.showPricingPage = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.scheduleRevealObservation();
  }

  protected openZipi(): void {
    if (this.routePath !== '/products/zipi-bike-taxi') {
      window.history.pushState({}, '', this.appPath('/products/zipi-bike-taxi'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = true;
    this.showZest = false;
    this.showJanovexa = false;
    this.showFieldora = false;
    this.showPricingPage = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.scheduleRevealObservation();
  }

  protected openZest(): void {
    if (this.routePath !== '/products/zest-grocery') {
      window.history.pushState({}, '', this.appPath('/products/zest-grocery'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = false;
    this.showZest = true;
    this.showJanovexa = false;
    this.showFieldora = false;
    this.showPricingPage = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.scheduleRevealObservation();
  }

  protected openJanovexa(): void {
    if (this.routePath !== '/products/janovexa') {
      window.history.pushState({}, '', this.appPath('/products/janovexa'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = false;
    this.showZest = false;
    this.showJanovexa = true;
    this.showFieldora = false;
    this.showPricingPage = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.scheduleRevealObservation();
  }

  protected openFieldora(): void {
    if (this.routePath !== '/products/fieldora') {
      window.history.pushState({}, '', this.appPath('/products/fieldora'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = false;
    this.showZest = false;
    this.showJanovexa = false;
    this.showFieldora = true;
    this.showPricingPage = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    this.fieldoraCategory = 'All';
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.scheduleRevealObservation();
  }

  protected openStartProject(): void {
    if (this.routePath !== '/start-a-project') {
      window.history.pushState({}, '', this.appPath('/start-a-project'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = false;
    this.showZest = false;
    this.showJanovexa = false;
    this.showFieldora = false;
    this.showPricingPage = true;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.scheduleRevealObservation();
  }

  protected openPricing(): void {
    if (this.routePath !== '/pricing') {
      window.history.pushState({}, '', this.appPath('/pricing'));
    }
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = false;
    this.showZest = false;
    this.showJanovexa = false;
    this.showFieldora = false;
    this.showPricingPage = true;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.scheduleRevealObservation();
  }

  protected returnToHome(): void {
    window.history.pushState({}, '', this.appPath('/'));
    this.showMoneyManager = false;
    this.showMarketplace = false;
    this.showMama = false;
    this.showZipi = false;
    this.showZest = false;
    this.showJanovexa = false;
    this.showFieldora = false;
    this.showPricingPage = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    this.refreshHomeVisibility();
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
    this.showZest = false;
    this.showJanovexa = false;
    this.showFieldora = false;
    this.showPricingPage = false;
    this.activeModalScreen = null;
    document.body.classList.remove('modal-open');
    this.refreshHomeVisibility();
  }

  protected inquireAboutFieldora(): void {
    this.inquireAboutProduct('FIELDORA — Field Workforce & Staff Tracking Platform');
  }

  protected inquireAboutJanovexa(): void {
    this.inquireAboutProduct('JANOVEXA – Your City. Your Voice');
  }

  protected inquireAboutMoneyManager(): void {
    this.inquireAboutProduct('Samrique Money Manager');
  }

  protected inquireAboutZest(): void {
    this.inquireAboutProduct('Zest Grocery App');
  }

  protected inquireAboutProduct(productName: string): void {
    this.contactForm.project_type = 'New app from scratch';
    this.contactForm.package = 'Custom';
    this.contactForm.budget = 'From ₹6,00,000';
    this.contactForm.timeline = '1–3 months';
    this.contactForm.details = `Interested in custom deployment / commercial source code license for ${productName}.`;
    this.bookingService = `Custom Build / Source Code: ${productName}`;
    this.openEnquiry();
  }

  protected selectPricingTier(tierName: string, budget?: string): void {
    const tierLower = tierName.toLowerCase();
    if (tierLower.includes('starter') || tierLower.includes('mvp')) {
      this.contactForm.package = 'Starter MVP';
      this.contactForm.budget = 'From ₹1,00,000';
      this.contactForm.timeline = 'Within 1 month';
      this.contactForm.project_type = 'MVP to test an idea';
    } else if (tierLower.includes('standard')) {
      this.contactForm.package = 'Standard';
      this.contactForm.budget = 'From ₹2,50,000';
      this.contactForm.timeline = '1–3 months';
      this.contactForm.project_type = 'New app from scratch';
    } else if (tierLower.includes('premium')) {
      this.contactForm.package = 'Premium';
      this.contactForm.budget = 'From ₹6,00,000';
      this.contactForm.timeline = '1–3 months';
      this.contactForm.project_type = 'New app from scratch';
    } else {
      this.contactForm.package = 'Custom';
      this.contactForm.budget = budget || 'From ₹6,00,000';
      this.contactForm.timeline = 'Flexible';
      this.contactForm.project_type = 'New app from scratch';
    }
    this.bookingService = tierName;
    this.openEnquiry();
  }

  protected openEnquiry(tierName?: string): void {
    if (tierName) {
      this.selectPricingTier(tierName);
      return;
    }
    this.enquiryOpen = true;
    document.body.classList.add('booking-open');
    window.setTimeout(() => {
      const input = document.querySelector('.enquiry-dialog input[name="name"]') as HTMLInputElement | null;
      input?.focus();
    }, 120);
  }

  protected closeEnquiry(): void {
    this.enquiryOpen = false;
    document.body.classList.remove('booking-open');
  }

  protected switchToBookingModal(): void {
    this.closeEnquiry();
    this.openBooking();
  }

  protected togglePricingCurrency(isUSD: boolean): void {
    this.showPricingUSD = isUSD;
  }

  protected handleContactSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    this.contactStatus = '';
    this.contactMessage = '';

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const subject =
      `[Samrique Project Enquiry] ${this.contactForm.project_type || 'Mobile App'} - ${this.contactForm.name}`;

    this.contactSending = true;

    const actionUrl = form.getAttribute('action') || 'https://formsubmit.co/ajax/samrique.in@gmail.com';

    const payload = {
      name: this.contactForm.name,
      email: this.contactForm.email,
      _replyto: this.contactForm.email,
      phone: this.contactForm.phone || 'N/A',
      company: this.contactForm.company || 'N/A',
      project_type: this.contactForm.project_type || 'N/A',
      package: this.contactForm.package || 'Not specified',
      budget: this.contactForm.budget || 'Not specified',
      timeline: this.contactForm.timeline || 'Not specified',
        message: this.contactForm.details,
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
    };

    fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Submission endpoint returned ${r.status}`);
        const data = await r.json().catch(() => ({}));
        if (data.success === 'false' || data.success === false) {
          throw new Error(data.message || 'Form submission pending activation');
        }
        this.contactForm = {
          name: '',
          email: '',
          phone: '',
          company: '',
          project_type: '',
          package: '',
          budget: '',
          timeline: '',
          details: '',
          _gotcha: '',
        };
        this.contactStatus = 'ok';
        this.contactMessage =
          'Thank you. We received your enquiry and will reply within 24 hours, scoped roadmap within 48 hours.';
      })
      .catch(() => {
        this.contactStatus = 'err';
        this.contactMessage =
          'We could not confirm the enquiry with FormSubmit. It may still have been delivered, so please wait for our email reply before submitting again.';
      })
      .finally(() => {
        this.contactSending = false;
        this.changeDetector.markForCheck();
      });
  }

  protected openPrivacyModal(): void {
    this.showPrivacyModal = true;
    document.body.classList.add('modal-open');
  }

  protected closePrivacyModal(): void {
    this.showPrivacyModal = false;
    document.body.classList.remove('modal-open');
  }

  protected openTermsModal(): void {
    this.showTermsModal = true;
    document.body.classList.add('modal-open');
  }

  protected closeTermsModal(): void {
    this.showTermsModal = false;
    document.body.classList.remove('modal-open');
  }

  protected openUdyamModal(): void {
    this.showUdyamModal = true;
    document.body.classList.add('modal-open');
  }

  protected closeUdyamModal(): void {
    this.showUdyamModal = false;
    document.body.classList.remove('modal-open');
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
