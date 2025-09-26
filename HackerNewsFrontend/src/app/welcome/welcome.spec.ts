import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { WelcomeComponent } from './welcome';
import { Router } from '@angular/router';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeComponent, RouterTestingModule]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Content Rendering', () => {
    it('should display the welcome heading', () => {
      const heading = fixture.debugElement.query(By.css('h1'));
      expect(heading.nativeElement.textContent).toContain('Welcome to My Sample App!');
    });

    it('should render feature list', () => {
      const features = fixture.debugElement.queryAll(By.css('.features li'));
      expect(features.length).toBeGreaterThan(0);
      
      // Check some specific features
      const featureTexts = features.map(f => f.nativeElement.textContent.trim());
      expect(featureTexts).toContain('Angular 20+ with standalone components');
      expect(featureTexts).toContain('Professional SCSS styling inspired by Nextech');
      expect(featureTexts).toContain('Modern routing with zoneless change detection');
    });

    it('should apply checkmark style to feature items', () => {
      const featureItem = fixture.debugElement.query(By.css('.features li'));
      const styles = window.getComputedStyle(featureItem.nativeElement);
      expect(featureItem).toBeTruthy();
    });
  });

  describe('CTA Button', () => {
    it('should display the CTA button', () => {
      const cta = fixture.debugElement.query(By.css('.btn.btn-primary'));
      expect(cta).toBeTruthy();
      expect(cta.nativeElement.textContent).toContain('View Hacker News');
    });

    it('should have correct routerLink for navigation', () => {
      const cta = fixture.debugElement.query(By.css('.btn.btn-primary'));
      expect(cta.attributes['routerLink']).toBe('/news');
    });

    it('should have proper styling', () => {
      const cta = fixture.debugElement.query(By.css('.btn.btn-primary'));
      expect(cta).toBeTruthy();
      expect(cta.classes['btn']).toBeTrue();
      expect(cta.classes['btn-primary']).toBeTrue();
    });
  });

  describe('Layout', () => {
    it('should have proper container classes', () => {
      const container = fixture.debugElement.query(By.css('.welcome-container'));
      expect(container).toBeTruthy();
      expect(container.classes['welcome-container']).toBeTrue();
    });

    it('should organize content in proper sections', () => {
      expect(fixture.debugElement.query(By.css('.features'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.cta-container'))).toBeTruthy();
    });
  });
});
