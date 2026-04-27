import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    const user = this.authService.currentUser();
    if (user?.role === 'admin') return true;

    this.router.navigate(['/home']);   // non admin → torna alla home
    return false;
  }
}