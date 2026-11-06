import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the portfolio headline', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Crafting High-Performance');
  });

  it('should toggle and close the mobile navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const menuButton = fixture.nativeElement.querySelector('#mobile-menu-btn') as HTMLButtonElement;
    const mobileMenu = fixture.nativeElement.querySelector('#mobile-menu') as HTMLElement;
    menuButton.click();
    fixture.detectChanges();

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(mobileMenu.classList.contains('hidden')).toBe(false);

    mobileMenu.querySelector('a')?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(mobileMenu.classList.contains('hidden')).toBe(true);
  });

  it('should prevent the browser from submitting an invalid contact form', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('#contact-form') as HTMLFormElement;
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(fixture.nativeElement.querySelector('#success-box').hidden).toBe(true);
  });
});
