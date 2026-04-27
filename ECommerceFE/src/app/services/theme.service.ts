import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly key = 'theme';
  private current = false;

  isDark(): boolean {
    return this.current;
  }

  setDark(isDark: boolean) {
    this.current = isDark;
    localStorage.setItem(this.key, isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  toggle() {
    this.setDark(!this.current);
    return this.current;
  }

  init() {
    this.current = localStorage.getItem(this.key) === 'dark';
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-theme', this.current);
  }
}