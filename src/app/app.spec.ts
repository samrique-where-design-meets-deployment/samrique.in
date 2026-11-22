import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the hero title and main navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('From first sketch');
    expect(compiled.querySelector('#projects')).toBeTruthy();
  });

  it('should open and display Money Manager product details with screens', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openMoneyManager']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.product-page')).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Money Manager');
    expect(app['moneyManagerScreens'].length).toBe(8);
  });

  it('should open and display Samrique E-Marketplace product details with screens', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openMarketplace']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.marketplace-page')).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Marketplace');
    expect(app['marketplaceScreens'].length).toBe(18);
  });

  it('should open and display Samrique Mama product details with screens', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openMama']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.mama-page')).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Mama');
    expect(app['mamaScreens'].length).toBe(11);
  });

  it('should open and display Zipi Bike Taxi product details with screens', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openZipi']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.zipi-page')).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Zipi');
    expect(app['zipiScreens'].length).toBe(22);
  });

  it('should open and display Zest Grocery product details with screens', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openZest']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.zest-page')).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Zest');
    expect(app['zestScreens'].length).toBe(25);
  });

  it('should open screen modal and allow switching between preview mockup and raw asset', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const sampleScreen = app['moneyManagerScreens'][1];

    app['openScreenModal'](sampleScreen, 'preview');
    fixture.detectChanges();

    expect(app['activeModalScreen']).toBe(sampleScreen);
    expect(app['modalViewMode']).toBe('preview');

    app['setModalViewMode']('asset');
    fixture.detectChanges();
    expect(app['modalViewMode']).toBe('asset');

    app['closeScreenModal']();
    fixture.detectChanges();
    expect(app['activeModalScreen']).toBeNull();
  });

  it('should close screen modal when Escape is pressed', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const sampleScreen = app['mamaScreens'][3];

    app['openScreenModal'](sampleScreen);
    fixture.detectChanges();
    expect(app['activeModalScreen']).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(app['activeModalScreen']).toBeNull();
  });

  it('should reveal the projects section when returning from a product page', async () => {
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = () => { };
    window.history.pushState({}, '', '/products/money-manager');
    const fixture = TestBed.createComponent(App);
    try {
      await fixture.whenStable();
      fixture.detectChanges();

      const homeLogo = fixture.nativeElement.querySelector('.product-nav a[aria-label="Samrique home"]') as HTMLAnchorElement;
      homeLogo.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(window.location.hash).toBe('#projects');
    } finally {
      fixture.destroy();
      window.history.replaceState({}, '', '/');
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }
  });

  it('should open and display Pricing page and select a tier', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openPricing']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pricing-page')).toBeTruthy();
    expect(compiled.querySelector('h2')?.textContent).toContain('Clear pricing');

    app['selectPricingTier']('Starter MVP');
    fixture.detectChanges();
    expect(app['contactForm'].package).toBe('Starter MVP');
    expect(app['contactForm'].budget).toBe('From ₹1,00,000');
    expect(app['enquiryOpen']).toBe(true);
  });

  it('should include SQLite in Money Manager tech stack', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const hasSqlite = app['moneyManagerStack'].some(([category, tech]) =>
      category.toLowerCase().includes('database') || tech.toLowerCase().includes('sqlite')
    );
    expect(hasSqlite).toBe(true);
  });

  it('should validate and submit booking request via FormSubmit', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openBooking']();
    fixture.detectChanges();

    const mockForm = document.createElement('form');
    mockForm.setAttribute('action', 'https://formsubmit.co/ajax/samrique.in@gmail.com');
    const fakeEvent = { preventDefault: () => { } } as unknown as SubmitEvent;

    // Missing date/time
    app['submitBookingRequest'](fakeEvent, mockForm);
    expect(app['bookingError']).toBe('Choose a date and time to request a call.');

    // Provide date and time
    app['selectedBookingDate'] = '2026-11-18';
    app['selectedBookingTime'] = '11:00 AM';
    app['bookingName'] = 'Musaddique Ali';
    app['bookingEmail'] = 'musaddique.ali@gmail.com';

    // Mock fetch
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ success: 'true' }), { status: 200 }));

    app['submitBookingRequest'](fakeEvent, mockForm);
    expect(app['bookingSending']).toBe(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://formsubmit.co/ajax/samrique.in@gmail.com',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(app['bookingStatus']).toBe('ok');
    expect(app['bookingSending']).toBe(false);
    fetchSpy.mockRestore();
  });

  it('should render Udyam MSME registration information in the footer', async () => {
    window.history.pushState({}, '', '/');
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['returnToHome']();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('UDYAM-TN-36-0066570');
    expect(compiled.textContent).toContain('MSME Registered');
    expect(compiled.textContent).toContain('Ambur, Tamil Nadu');
  });

  it('should open and close the Udyam Registration modal', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app['showUdyamModal']).toBe(false);

    app['openUdyamModal']();
    fixture.detectChanges();
    expect(app['showUdyamModal']).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Enterprise Registration Details');
    expect(compiled.textContent).toContain('Samrique, proprietorship of P. Musaddique Ali');
    expect(compiled.textContent).toContain('UDYAM-TN-36-0066570');

    app['closeUdyamModal']();
    fixture.detectChanges();
    expect(app['showUdyamModal']).toBe(false);
  });

  it('should verify all pricing page copy fixes and milestone rules', async () => {
    window.history.pushState({}, '', '/');
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openPricing']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // Check non-range pricing
    expect(compiled.textContent).toContain('From ₹1,00,000');
    expect(compiled.textContent).toContain('From ₹2,50,000');
    // Check extra screen price
    expect(compiled.textContent).toContain('from ₹12,000 per simple screen');
    // Check rush delivery
    expect(compiled.textContent).toContain('30% shorter timeline, subject to availability');
    expect(compiled.textContent).toContain('+25%');
    // Milestone box
    expect(compiled.textContent).toContain('No full upfront payment');
    expect(compiled.textContent).toContain('Due on delivery of the final approved build. Source code and store handover follow after payment.');
    expect(compiled.textContent).toContain('+ GST if applicable');
    expect(compiled.textContent).toContain('Detailed terms are agreed in a written contract before work begins.');
    // Check support and reply times
    expect(compiled.textContent).toContain('30 Days Free Post-Launch Support on all packages');
    expect(compiled.textContent).toContain('scoped roadmap within 48 hours');

    app['returnToHome']();
    fixture.detectChanges();
  });

  it('should open and close the Privacy Policy modal', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openPrivacyModal']();
    fixture.detectChanges();
    expect(app['showPrivacyModal']).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Privacy Policy');
    expect(compiled.textContent).toContain('Information We Collect');
    expect(compiled.textContent).toContain('Samrique');

    app['closePrivacyModal']();
    fixture.detectChanges();
    expect(app['showPrivacyModal']).toBe(false);
  });

  it('should open and close the Terms of Service modal', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openTermsModal']();
    fixture.detectChanges();
    expect(app['showTermsModal']).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Terms of Service');
    expect(compiled.textContent).toContain('Full source code handover');
    expect(compiled.textContent).toContain('Fixed-Price Sprints & Scope');
    expect(compiled.textContent).toContain('GST');

    app['closeTermsModal']();
    fixture.detectChanges();
    expect(app['showTermsModal']).toBe(false);
  });

  it('should have concrete proof points and concept MVP classifications defined for all 4 projects', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    const proofPoints = [
      app['moneyManagerProofPoint'],
      app['marketplaceProofPoint'],
      app['mamaProofPoint'],
      app['zipiProofPoint'],
    ];

    for (const point of proofPoints) {
      expect(point.problemSolved).toBeTruthy();
      expect(point.keyUserFlows).toBeTruthy();
      expect(point.architectureTimeline).toBeTruthy();
      expect(point.classification).toContain('Concept');
      expect(point.notice).toBeTruthy();
    }
  });

  it('should render proof point section when opening a product detail page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['openMoneyManager']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const proofSection = compiled.querySelector('#product-proof-point');
    expect(proofSection).toBeTruthy();
    expect(proofSection?.textContent).toContain('Problem Solved');
    expect(proofSection?.textContent).toContain('Key User Flows Built');
    expect(proofSection?.textContent).toContain('Architecture & Timeline');
    expect(proofSection?.textContent).toContain('Concept MVP');
  });

  it('should render engineering proof points on the homepage projects section', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app['returnToProjects']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const projectsSection = compiled.querySelector('#projects');
    expect(projectsSection).toBeTruthy();
    expect(projectsSection?.textContent).toContain('Engineering & Product Proof Point');
    expect(projectsSection?.textContent).toContain('Problem Solved');
    expect(projectsSection?.textContent).toContain('Key User Flows Built');
    expect(projectsSection?.textContent).toContain('Architecture & Timeline');
    expect(projectsSection?.textContent).toContain('Product Showcase • Concept MVP');
  });
});
