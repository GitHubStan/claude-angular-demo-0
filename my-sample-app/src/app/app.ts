import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService, Theme } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-sample-app');
  protected readonly showThemeDropdown = signal(false);
  protected readonly themeService = inject(ThemeService);

  // Toggle theme dropdown visibility
  toggleThemeDropdown(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Toggle dropdown clicked, current state:', this.showThemeDropdown());
    this.showThemeDropdown.update(show => !show);
    console.log('New dropdown state:', this.showThemeDropdown());
  }

  // Close theme dropdown
  closeThemeDropdown(): void {
    this.showThemeDropdown.set(false);
  }

  // Select a theme
  selectTheme(theme: Theme, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Selecting theme:', theme.name);
    this.themeService.setTheme(theme.id);
    this.closeThemeDropdown();
  }

  // Get available themes
  get themes(): Theme[] {
    return this.themeService.getThemes();
  }

  // Get current theme
  get currentTheme(): Theme {
    return this.themeService.currentTheme();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    console.log('Document clicked, dropdown visible:', this.showThemeDropdown());
    if (this.showThemeDropdown()) {
      this.closeThemeDropdown();
    }
  }
}
