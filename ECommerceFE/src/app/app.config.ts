import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
    withInterceptors([authInterceptor])
      // withInterceptors registra l'interceptor funzionale nell'HttpClient.
      // Da questo momento, OGNI richiesta HTTP dell'app passerà per authInterceptor.
      // L'array può contenere più interceptor, eseguiti nell'ordine indicato.
    )
  ]
};
