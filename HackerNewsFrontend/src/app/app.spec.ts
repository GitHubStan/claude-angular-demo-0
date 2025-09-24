import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { App } from './app';
import { Location } from '@angular/common';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        RouterTestingModule.withRoutes([
          { path: 'welcome', component: App },
          { path: 'news', component: App }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('Navigation', () => {
    it('should render navigation bar', () => {
      const nav = fixture.debugElement.query(By.css('.main-nav'));
      expect(nav).toBeTruthy();
    });

    it('should render brand link', () => {
      const brand = fixture.debugElement.query(By.css('.nav-brand'));
      expect(brand).toBeTruthy();
      expect(brand.nativeElement.textContent).toContain('My Sample App');
    });

    it('should render navigation links', () => {
      const links = fixture.debugElement.queryAll(By.css('.nav-links a'));
      expect(links.length).toBe(2);
      expect(links[0].nativeElement.textContent).toContain('Home');
      expect(links[1].nativeElement.textContent).toContain('News');
    });

    it('should navigate when links are clicked', async () => {
      const links = fixture.debugElement.queryAll(By.css('.nav-links a'));
      
      // Click News link
      links[1].nativeElement.click();
      await fixture.whenStable();
      expect(location.path()).toBe('/news');

      // Click Home link
      links[0].nativeElement.click();
      await fixture.whenStable();
      expect(location.path()).toBe('/');
    });
  });

  describe('Layout', () => {
    it('should have main content area', () => {
      const mainContent = fixture.debugElement.query(By.css('.main-content'));
      expect(mainContent).toBeTruthy();
    });

    it('should apply proper styling to navigation', () => {
      const nav = fixture.debugElement.query(By.css('.main-nav'));
      const styles = window.getComputedStyle(nav.nativeElement);
      expect(styles.position).toBe('fixed');
      expect(styles.zIndex).toBe('1000');
    });
  });

  describe('Routing', () => {
    it('should mark active route with active class', async () => {
      await router.navigate(['/news']);
      fixture.detectChanges();

      const newsLink = fixture.debugElement.queryAll(By.css('.nav-links a'))[1];
      expect(newsLink.classes['active']).toBeTrue();
    });

    it('should have router outlet', () => {
      const outlet = fixture.debugElement.query(By.css('router-outlet'));
      expect(outlet).toBeTruthy();
    });
  });
});
