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
    Element.prototype.scrollIntoView = () => {};
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
});
