import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private router:      Router,
    private authService: AuthService
  ) {}

  canActivate(): Observable<boolean> | boolean {
    // Caso 1: token già in memoria (navigazione normale intra-app)
    // Restituisce true sincrono → nessuna chiamata HTTP, accesso immediato
    if (this.authService.isLoggedIn()) return true;

    // Caso 2: token assente (reload della pagina o primo accesso diretto all'URL)
    // Tenta di recuperare un nuovo access token usando il cookie httpOnly
    return this.authService.refreshToken().pipe(
      map(() => {
        // refreshToken() ha aggiornato il signal internamente (via tap nel service)
        // L'utente è autenticato → permetti la navigazione
        return true;
      }),
      catchError(() => {
        // Il refresh è fallito: cookie scaduto, assente o token invalidato
        // Redirect alla pagina di login
        this.router.navigate(['/']);
        return of(false);
        // of(false) crea un Observable che emette false e completa subito
      })
    );
  }

  canActivateChild(): Observable<boolean> | boolean {
    // Delega a canActivate per proteggere anche le route figlie
    return this.canActivate();
  }
}