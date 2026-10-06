import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the routed home view by default', async () => {
    await TestBed.inject(Router).navigateByUrl('/');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-home-view')).toBeTruthy();
    const home = compiled.querySelector('app-home-view');
    expect(home?.querySelector('h2')?.textContent).toContain('Your library');
    // * Phase 2: the grid renders one big card per playlist
    const gridCards = compiled.querySelectorAll('app-source-card .aspect-square');
    expect(gridCards.length).toBeGreaterThan(0);
  });
});
