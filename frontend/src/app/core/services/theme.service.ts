import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public isDarkMode = signal<boolean>(localStorage.getItem('policygpt_theme') === 'dark');

  constructor() {
    this.applyTheme(this.isDarkMode());
  }

  public toggleTheme(): void {
    const newMode = !this.isDarkMode();
    this.isDarkMode.set(newMode);
    localStorage.setItem('policygpt_theme', newMode ? 'dark' : 'light');
    this.applyTheme(newMode);
  }

  private applyTheme(dark: boolean): void {
    if (dark) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      document.body.classList.add('theme-dark');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      document.body.classList.remove('theme-dark');
    }
  }
}
