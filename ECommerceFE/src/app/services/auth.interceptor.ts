import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

// Stato condiviso per gestire il refresh del token in parallelo
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // 1. Saltiamo l'intercettazione per le rotte di Login/Refresh/Logout
  // per evitare loop infiniti se il server risponde 401 su queste
  if (isAuthRoute(req.url)) {
    return next(req);
  }

  // 2. Aggiunge il Bearer Token (preso dal Signal di AuthService) e procede
  return next(addAuthToken(req, authService)).pipe(
    catchError((error: unknown) => {
      // 3. Se riceviamo 401 (Unauthorized), proviamo a rigenerare il token
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Esclude le chiamate di autenticazione dall'aggiunta del Bearer Token
 */
function isAuthRoute(url: string): boolean {
  const authEndpoints = [
    '/api/v1/auth/login',
    '/api/v1/auth/refresh',
    '/api/v1/auth/logout'
  ];
  return authEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * Clona la richiesta originale inserendo l'header Authorization con il token attuale
 */
function addAuthToken(req: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> {
  const token = authService.getToken(); // Legge dal Signal dell'AuthService
  
  if (!token) {
    return req; 
  }

  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Gestisce il recupero del Token se scaduto (Errore 401)
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<any> {

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // Chiamata al backend per ottenere un nuovo Access Token usando il Refresh Cookie
    return authService.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);

        // Riesegue la richiesta originale con il nuovo token appena ottenuto
        return next(addAuthToken(req, authService));
      }),
      catchError((error) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);

        // Se anche il refresh fallisce, l'utente deve rifare il login
        authService.logout();
        return throwError(() => error);
      })
    );
  }

  // Se un refresh è già in corso, mettiamo le altre richieste in "attesa"
  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap(() => next(addAuthToken(req, authService)))
  );
}