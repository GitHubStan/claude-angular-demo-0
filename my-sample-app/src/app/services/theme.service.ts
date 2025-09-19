import { Injectable, signal } from '@angular/core';

export interface Theme {
  id: string;
  name: string;
  properties: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Available themes
  private readonly themes: Theme[] = [
    {
      id: 'professional',
      name: 'Professional',
      properties: {
        // Nextech-inspired professional theme (current)
        '--color-primary': '#003b49',
        '--color-primary-dark': '#002935',
        '--color-secondary': '#76a239',
        '--color-secondary-dark': '#5e8129',
        '--color-accent': '#ef4423',
        '--color-accent-dark': '#d53a1f',
        '--color-success': '#4CAF50',
        '--color-danger': '#dc3545',

        '--color-text-primary': '#000000',
        '--color-text-secondary': '#6c757d',
        '--color-text-light': '#adb5bd',

        '--color-background-primary': '#ffffff',
        '--color-background-secondary': '#f8f9fa',
        '--color-background-tertiary': '#ffffff',

        '--color-border': '#e9ecef',
        '--color-shadow': 'rgba(0, 0, 0, 0.1)',

        '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      properties: {
        // Dark theme
        '--color-primary': '#4a90e2',
        '--color-primary-dark': '#357abd',
        '--color-secondary': '#50c878',
        '--color-secondary-dark': '#3da65a',
        '--color-accent': '#ff6b6b',
        '--color-accent-dark': '#ff5252',
        '--color-success': '#4CAF50',
        '--color-danger': '#f44336',

        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#b0bec5',
        '--color-text-light': '#78909c',

        '--color-background-primary': '#121212',
        '--color-background-secondary': '#1e1e1e',
        '--color-background-tertiary': '#2d2d2d',

        '--color-border': '#404040',
        '--color-shadow': 'rgba(255, 255, 255, 0.1)',

        '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }
    },
    {
      id: 'colorful',
      name: 'Colorful & Fun',
      properties: {
        // Vibrant, playful theme
        '--color-primary': '#ff6b9d',
        '--color-primary-dark': '#e91e63',
        '--color-secondary': '#4ecdc4',
        '--color-secondary-dark': '#26a69a',
        '--color-accent': '#ffd93d',
        '--color-accent-dark': '#ffc107',
        '--color-success': '#4CAF50',
        '--color-danger': '#ff5722',

        '--color-text-primary': '#2d3436',
        '--color-text-secondary': '#636e72',
        '--color-text-light': '#b2bec3',

        '--color-background-primary': '#ffeaa7',
        '--color-background-secondary': '#fab1a0',
        '--color-background-tertiary': '#fd79a8',

        '--color-border': '#fdcb6e',
        '--color-shadow': 'rgba(253, 203, 110, 0.3)',

        '--font-family': '"Comic Sans MS", "Apple Color Emoji", "Segoe UI Emoji", cursive, sans-serif'
      }
    }
  ];

  // Current theme signal
  private readonly currentThemeSignal = signal<Theme>(this.themes[0]);

  // Public getter for current theme
  public readonly currentTheme = this.currentThemeSignal.asReadonly();

  constructor() {
    // Load saved theme from localStorage
    const savedThemeId = localStorage.getItem('selected-theme');
    if (savedThemeId) {
      const savedTheme = this.themes.find(theme => theme.id === savedThemeId);
      if (savedTheme) {
        this.setTheme(savedTheme.id);
      }
    }

    // Apply initial theme
    this.applyTheme(this.currentThemeSignal());
  }

  // Get all available themes
  getThemes(): Theme[] {
    return this.themes;
  }

  // Set theme by ID
  setTheme(themeId: string): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (theme) {
      this.currentThemeSignal.set(theme);
      this.applyTheme(theme);
      localStorage.setItem('selected-theme', themeId);
    }
  }

  // Apply theme to the document
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Apply all theme properties as CSS custom properties
    Object.entries(theme.properties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Set data attribute for theme-specific styles
    root.setAttribute('data-theme', theme.id);
  }
}