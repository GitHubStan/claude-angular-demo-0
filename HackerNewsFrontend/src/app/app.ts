import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ThemeService, Theme } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-sample-app');
  protected readonly showThemeDropdown = signal(false);
  protected readonly showUserMenu = signal(false);
  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  protected readonly themes = this.themeService.getThemes();
  protected readonly currentTheme = this.themeService.currentTheme;

  // Auth0 observables
  protected readonly isAuthenticated$ = this.authService.isAuthenticated$;
  protected readonly user$ = this.authService.user$;
  protected readonly isAuthEnabled = this.authService.isEnabled;

  // Toggle theme dropdown visibility
  toggleThemeDropdown(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showThemeDropdown.update(show => !show);
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
    this.themeService.setTheme(theme.id);
    this.closeThemeDropdown();
  }

  // Toggle user menu visibility
  toggleUserMenu(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showUserMenu.update(show => !show);
  }

  // Close user menu
  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showThemeDropdown()) {
      this.closeThemeDropdown();
    }
    if (this.showUserMenu()) {
      this.closeUserMenu();
    }
  }

  // Auth0 login
  login(): void {
    this.authService.login();
  }

  // Auth0 logout
  logout(): void {
    this.authService.logout();
  }
}
