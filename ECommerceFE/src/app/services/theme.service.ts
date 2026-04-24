import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly key = 'theme';

  isDark(): boolean {
    return localStorage.getItem(this.key) === 'dark';
  }

  setDark(isDark: boolean) {
    localStorage.setItem(this.key, isDark ? 'dark' : 'light');
    document.body.classList.toggle('dark-theme', isDark);
  }

  toggle() {
    const newValue = !this.isDark();
    this.setDark(newValue);
    return newValue;
  }

  init() {
    this.setDark(this.isDark());
  }
}