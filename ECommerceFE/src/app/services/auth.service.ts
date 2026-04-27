import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';

interface LoginResponse {
  accessToken: string;
  user: { id: number; userid: string; credito: number };
}

interface RefreshResponse {
  accessToken: string;
}

interface UserData {
  id: number;
  userid: string;
  credito: number;
  role?: 'user' | 'admin'; 
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  initAuth(): Observable<any> {
    return this.refreshToken().pipe(
      tap(res => {
        this.accessTokenSignal.set(res.accessToken);
      }),
      catchError(err => {
        this.accessTokenSignal.set(null);
        this.userSignal.set(null);
        return of(null);
      })
    );
  }
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly baseUrl = 'http://localhost:3000/api/v1';

  // Signal per l'access token: null = non autenticato, stringa = autenticato
  // Vive solo in memoria → si azzera al reload della pagina (gestito dall'AuthGuard)
  private readonly accessTokenSignal = signal<string | null>(null);

  // Signal per i dati utente: usato dai componenti (es. mostrare il nome utente)
  private readonly userSignal = signal<UserData | null>(null);

  // Versioni readonly esposte ai componenti
  // I componenti possono leggere ma non modificare i signal direttamente
  readonly isAuthenticated = this.accessTokenSignal.asReadonly();
  readonly currentUser     = this.userSignal.asReadonly();

  login(userid: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.baseUrl}/auth/login`,
        { userid, password },
        { withCredentials: true }
        // withCredentials: true → il browser include i cookie nella risposta
        // In questo caso, il backend imposta il cookie refreshToken con Set-Cookie
        // e il browser lo accetta solo se withCredentials è true
      )
      .pipe(
        tap((res) => {
          // tap: esegue un side-effect senza modificare il valore dell'Observable
          // Salva l'access token e i dati utente nei signal
          this.accessTokenSignal.set(res.accessToken);
          this.userSignal.set(res.user);
        })
      );
  }

  register(userid: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, { userid, password });
  }

  refreshToken(): Observable<RefreshResponse> {
    return this.http
      .post<RefreshResponse>(
        `${this.baseUrl}/auth/refresh`,
        {},
        // {} → body vuoto: il backend non ha bisogno di dati nel body
        // Il refreshToken arriva automaticamente nel cookie
        { withCredentials: true }
        // withCredentials: true → il browser include il cookie refreshToken
        // nella richiesta verso il backend
      )
      .pipe(
        tap((res) => {
          // Aggiorna il signal con il nuovo access token
          this.accessTokenSignal.set(res.accessToken);
        })
      );
  }

  logout(): void {
    this.http
      .post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => {
          // Solo quando il backend ha confermato il logout:
          // 1. Azzera i signal
          this.accessTokenSignal.set(null);
          this.userSignal.set(null);
          // 2. Naviga alla pagina di login
          this.router.navigate(['/']);
        }
      });
  }

  // Usato dall'interceptor per aggiungere il token agli header
  getToken(): string | null {
    return this.accessTokenSignal();
  }

  // Usato dall'AuthGuard per decidere se permettere la navigazione
  isLoggedIn(): boolean {
    return !!this.accessTokenSignal();
    // !! converte il valore in boolean: null → false, stringa → true
  }

  getMe() {
    return this.http.get('http://localhost:3000/api/v1/utenti/me');
  }

  addCredit(amount: number) {
    return this.http.post('http://localhost:3000/api/v1/credito', { amount });
  }
  // Aggiungi questo metodo nella classe AuthService
  updateProfile(data: { newUserid?: string, newPassword?: string }): Observable<any> {
    return this.http.patch(`${this.baseUrl}/utenti/update-me`, data);
  }
  updateUserSignal(updatedUser: any) {
  // Dato che userSignal è privato, usiamo il setter del signal
  // Se avevi dichiarato: private readonly userSignal = signal<UserData | null>(null);
  this.userSignal.set(updatedUser);
}
}