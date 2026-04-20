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

// Variabili di modulo condivise tra tutte le invocazioni dell'interceptor
// Necessarie per coordinare il refresh quando più richieste ricevono 401 in parallelo
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);
// null = nessun refresh in corso o refresh fallito
// stringa = il nuovo token dopo un refresh riuscito

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // Le route auth non hanno bisogno del Bearer token
  // (e non devono essere intercettate per evitare loop infiniti)
  if (isAuthRoute(req.url)) {
    return next(req);
  }

  // Aggiunge il token alla richiesta e la esegue
  return next(addAuthToken(req, authService)).pipe(
    catchError((error: unknown) => {
      // Intercetta solo gli errori 401 (non autorizzato / token scaduto)
      // Gli altri errori (400, 404, 500...) vengono propagati normalmente
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

// Determina se la richiesta è verso una route di autenticazione
// Queste route non richiedono il token e non devono essere intercettate
function isAuthRoute(url: string): boolean {
  return (
    url.includes('/api/v1/auth/login')   ||
    url.includes('/api/v1/auth/refresh') ||
    url.includes('/api/v1/auth/logout')
  );
}

// Clona la richiesta aggiungendo l'header Authorization
// Le richieste HTTP sono immutabili in Angular → si usa .clone() per modificarle
function addAuthToken(req: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> {
  const token = authService.getToken();
  if (!token) return req; // nessun token in memoria → manda la richiesta com'è
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
    // Aggiunge (o sovrascrive) l'header Authorization alla copia della richiesta
  });
}

// Gestisce il caso in cui una richiesta riceve 401
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<any> {

  if (!isRefreshing) {
    // Questa è la prima richiesta che riceve 401: fa il refresh
    isRefreshing = true;
    refreshTokenSubject.next(null);
    // next(null) segnala alle altre richieste in attesa che il refresh è in corso

    return authService.refreshToken().pipe(
      switchMap((response) => {
        // Refresh riuscito
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
        // next(token) sblocca tutte le richieste che stavano aspettando

        // Riprova la richiesta originale con il nuovo token
        return next(addAuthToken(req, authService));
      }),
      catchError((error) => {
        // Refresh fallito (cookie scaduto, token non nel DB, ecc.)
        isRefreshing = false;
        refreshTokenSubject.next(null);

        // Forza il logout: azzera i signal e naviga al login
        authService.logout();
        return throwError(() => error);
      })
    );
  }

  // Un refresh è già in corso (isRefreshing = true)
  // Questa richiesta aspetta che il BehaviorSubject emetta il nuovo token
  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    // filter aspetta finché il token non è null (cioè finché il refresh non completa)
    take(1),
    // take(1) completa l'Observable dopo aver ricevuto il primo valore non-null
    switchMap(() => next(addAuthToken(req, authService)))
    // Riprova la richiesta con il nuovo token ora disponibile nel signal
  );
}