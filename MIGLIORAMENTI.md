# Miglioramenti progetto stage_ecomerceBE

Lista delle attività da svolgere nei prossimi 2-3 giorni di lavoro sul progetto.
Ogni voce è strutturata con **Cos'è** (descrizione tecnica), **Perché** (motivazione) e **Esempio di codice** (prima/dopo) dove utile.

> Il documento è pensato per chi tocca Angular e Node/Express **per la prima volta**: gli esempi sono volutamente espliciti e completi.

---

## Sezione 1 — Migliorie Frontend (Angular 21)

### 1. Rimuovere `cdr.detectChanges()` e migrare a Signals

**Cos'è.** In 6 componenti diversi (`home-component.ts` fatto, `carrello-page.ts` fatto, `credit-component.ts` fatto, `settings-page.ts` saltato, `login-component.ts` fatto, `libreria-component.ts` fatto) viene iniettato `ChangeDetectorRef` e chiamato `cdr.detectChanges()` dopo le `subscribe`, per forzare l'aggiornamento della UI. Vanno rimosse tutte queste chiamate e i dati vanno gestiti con `signal()` (Angular 16+).

**Perché.** `detectChanges()` è un *workaround* costoso (ricalcola l'albero del componente) e fragile. I **signals** sono il modello reattivo nuovo di Angular: la UI si aggiorna automaticamente quando il signal cambia, senza bisogno di forzare nulla.

**Esempio — PRIMA (`credit-component.ts`):**
```ts
import { ChangeDetectorRef, Component } from '@angular/core';

export class CreditComponent {
  currentCredit: number = 0;

  constructor(private cdr: ChangeDetectorRef, private authService: AuthService) {}

  loadCredit() {
    this.authService.getMe().subscribe({
      next: (res: any) => {
        this.currentCredit = res.credito;
        this.cdr.detectChanges(); // 👈 DA TOGLIERE
      }
    });
  }
}
```

**DOPO (con signal):**
```ts
import { Component, signal, inject } from '@angular/core';

export class CreditComponent {
  private authService = inject(AuthService);

  // signal: contenitore reattivo. Si legge con currentCredit() e si scrive con .set()
  currentCredit = signal<number>(0);

  loadCredit() {
    this.authService.getMe().subscribe({
      next: (res: any) => {
        this.currentCredit.set(res.credito); // 👈 niente detectChanges
      }
    });
  }
}
```
//////////////////////////////////////////////////////////////////////////

**Nel template** invece di `{{ currentCredit }}` si scrive `{{ currentCredit() }}` (con le parentesi, perché è una funzione).

Per liste o oggetti complessi:
```ts
giochi = signal<GiochiModel[]>([]);

caricaGiochi() {
  this.giochiService.getGiochi().subscribe(data => {
    this.giochi.set(data);
  });
}

// Per aggiungere un elemento senza ricreare l'array:
aggiungi(g: GiochiModel) {
  this.giochi.update(lista => [...lista, g]);
}
```

---

### 2. Rimuovere `@Injectable` dai componenti

**Cos'è.** I file `home-component.ts`, `carrello-page.ts`, `credit-component.ts`, `settings-page.ts` hanno entrambi i decoratori `@Component` e `@Injectable({ providedIn: 'root' })`. Va lasciato **solo** `@Component`.

**Perché.** `@Injectable` è il decoratore dei **service**, non dei componenti. Mettere `@Injectable({ providedIn: 'root' })` su un componente è un errore concettuale.

**PRIMA:**
```ts
@Component({
  selector: 'app-credit-component',
  standalone: true,
  templateUrl: './credit-component.html',
})
@Injectable({ providedIn: 'root' })   // 👈 DA TOGLIERE
export class CreditComponent { }
```

**DOPO:**
```ts
@Component({
  selector: 'app-credit-component',
  standalone: true,
  templateUrl: './credit-component.html',
})
export class CreditComponent { }
```

---

### 3. Migrare alla nuova control flow `@if` / `@for` / `@switch`

**Cos'è.** Negli HTML si usano ancora le direttive storiche `*ngIf`, `*ngFor`, `*ngSwitch`. Da Angular 17 esiste la nuova *built-in control flow*: `@if`, `@for`, `@switch`.

**Perché.** Non richiede `CommonModule`, è più veloce in compilazione, ha un type-narrowing migliore e in `@for` rende obbligatorio il `track`, che migliora le performance del rendering delle liste.

**PRIMA (HTML):**
```html
<div *ngIf="user; else noUser">
  Ciao {{ user.userid }}
</div>
<ng-template #noUser>
  <p>Non sei loggato</p>
</ng-template>

<ul>
  <li *ngFor="let gioco of giochi">{{ gioco.titolo }}</li>
</ul>
```

**DOPO:**
```html
@if (user) {
  <div>Ciao {{ user.userid }}</div>
} @else {
  <p>Non sei loggato</p>
}

<ul>
  @for (gioco of giochi; track gioco.id) {
    <li>{{ gioco.titolo }}</li>
  } @empty {
    <li>Nessun gioco disponibile</li>
  }
</ul>
```

Il `track gioco.id` è **obbligatorio**: dice ad Angular come riconoscere gli elementi dell'array tra un re-render e l'altro.

---

### 4. Unificare la sorgente di verità sull'utente

**Cos'è.** Oggi l'utente loggato vive in **due posti**: `AuthService.userSignal` (memoria) e `localStorage.getItem('user')` (persistente). I componenti leggono da entrambi a casaccio. Va eliminato l'accesso diretto al `localStorage` nei componenti.

**Perché.** Due fonti = rischio di disallineamento. Già visibile in `settings-page.ts` dove dopo l'update si aggiorna il localStorage ma non il signal.

**PRIMA (`carrello-page.ts`):**
```ts
caricaCarrello(): void {
  const userStr = localStorage.getItem('user');     // 👈 lettura diretta
  const userObj = JSON.parse(userStr!);
  const userId = userObj.id;
  this.carrelloService.getCarrello(userId).subscribe(...);
}
```

**DOPO** — in `auth.service.ts` esponi il signal e usalo nei componenti:
```ts
// auth.service.ts
readonly currentUser = this.userSignal.asReadonly();
```

```ts
// carrello-page.ts
private authService = inject(AuthService);

caricaCarrello(): void {
  const user = this.authService.currentUser();
  if (!user) return;
  this.carrelloService.getCarrello(user.id).subscribe(...);
}
```

Il `localStorage` lo gestisce **solo** `AuthService` (al login: salva, al logout: rimuove).

---

### 5. Fix bug `carrello-page.ts` — checkout crasha

**Cos'è.** Nel file `carrello-page.ts` righe 33-34 ci sono `authService: any;` e `router: any;` ma **non sono mai iniettati**. Nel `checkout()` (riga 122) si chiamano e crashano con `Cannot read properties of undefined`.

**Perché.** È un bug funzionale: il checkout fallisce silenziosamente.

**PRIMA:**
```ts
export class CarrelloPageComponent {
  authService: any;   // 👈 mai inizializzato
  router: any;        // 👈 mai inizializzato

  checkout(): void {
    this.authService.getMe().subscribe(...); // 💥 undefined
  }
}
```

**DOPO:**
```ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export class CarrelloPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  checkout(): void {
    this.authService.getMe().subscribe(...); // ✅
  }
}
```

---

### 6. Spostare URL hardcoded in `environment.ts`

**Cos'è.** Stringhe come `http://localhost:3000/api/v1` sono ripetute in `auth.service.ts`, `carrello.service.ts`, `giochi-service.ts`. Vanno create due configurazioni e i service devono leggere da lì.

**Perché.** In produzione l'API non sarà su `localhost:3000`. Con gli environment basta cambiare un valore in un solo posto.

**Crea i file:**

`ECommerceFE/src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
};
```

`ECommerceFE/src/environments/environment.prod.ts`:
```ts
export const environment = {
  production: true,
  apiUrl: 'https://api.tuodominio.com/api/v1',
};
```

**Uso nei service:**
```ts
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GiochiService {
  private baseUrl = environment.apiUrl;

  getGiochi() {
    return this.http.get(`${this.baseUrl}/giochi/getall`);
  }
}
```

In `angular.json` aggiungi il `fileReplacements` per la build di produzione (dovrebbe già esserci di default su progetti Angular CLI).

---

### 7. Sostituire `alert()` con un sistema di notifiche

**Cos'è.** I `window.alert(...)` sono usati in `credit-component.ts`, `carrello-page.ts:125,145`, `libreria-component.ts:67,69`. Vanno rimpiazzati con un `ToastService` custom basato su signal.

**Perché.** `alert()` è bloccante, non si può stilizzare, rompe il design dell'app, su mobile è pessimo.

**Esempio di `ToastService` minimale:**
```ts
// services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info', durationMs = 3000) {
    const toast: Toast = { id: ++this.nextId, message, type };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== toast.id));
    }, durationMs);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error'); }
}
```

**Componente che mostra i toast** (montato in `app.html`):
```ts
// components/toast/toast.component.ts
@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast" [class]="t.type">{{ t.message }}</div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 1rem; right: 1rem; z-index: 9999; }
    .toast { padding: .8rem 1.2rem; margin-bottom: .5rem; border-radius: .4rem; color: #fff; }
    .toast.success { background: #2e7d32; }
    .toast.error   { background: #c62828; }
    .toast.info    { background: #1565c0; }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
```

**Uso:**
```ts
// PRIMA
alert("Acquisto riuscito!");

// DOPO
this.toastService.success("Acquisto riuscito!");
```

---

### 8. Eliminare la DOM manipulation diretta in `home-component.ts`

**Cos'è.** Nel metodo `animateToCart()` (`home-component.ts:161-198`) si usano `document.querySelector`, `cloneNode`, `document.body.appendChild`, `setTimeout`. Va portato in CSS animations o, se serve manipolazione DOM, in `Renderer2`.

**Perché.** `document.*` aggira Angular: rompe SSR, rompe i test, blocca le ottimizzazioni. `Renderer2` è l'API ufficiale per manipolare il DOM in modo "Angular-safe". Le animazioni CSS sono inoltre più performanti.

**Esempio con `Renderer2`:**
```ts
import { Renderer2, ElementRef, inject } from '@angular/core';

export class HomeComponent {
  private renderer = inject(Renderer2);

  animateToCart(img: HTMLElement) {
    const clone = this.renderer.createElement('img');
    this.renderer.setAttribute(clone, 'src', (img as HTMLImageElement).src);
    this.renderer.addClass(clone, 'flying-image');
    this.renderer.appendChild(document.body, clone);

    // Resto delle animazioni → spostato in CSS
    setTimeout(() => this.renderer.removeChild(document.body, clone), 700);
  }
}
```

**Ancora meglio con CSS** (più semplice e performante):
```css
/* home-component.css */
.flying-image {
  position: fixed;
  animation: flyToCart 0.7s ease-out forwards;
  pointer-events: none;
}
@keyframes flyToCart {
  0%   { transform: scale(1) translate(0, 0); opacity: 1; }
  100% { transform: scale(0.2) translate(80vw, -50vh); opacity: 0; }
}
```

---

### 9. Migrare login e settings a Reactive Forms

**Cos'è.** `login-component.ts` e `settings-page.ts` usano *template-driven forms* con `[(ngModel)]`. Vanno riscritti con `FormBuilder`, `FormGroup`, `Validators`.

**Perché.** I Reactive Forms sono testabili, gestiscono validazioni complesse, hanno stato osservabile e tipizzato. Oggi nel login non c'è nessuna validazione client-side.

**PRIMA (template-driven):**
```ts
// login-component.ts
form = { userid: '', password: '' };

onSubmit() {
  this.authService.login(this.form.userid, this.form.password).subscribe(...);
}
```
```html
<input [(ngModel)]="form.userid" name="userid" />
<input [(ngModel)]="form.password" name="password" type="password" />
<button (click)="onSubmit()">Login</button>
```

**DOPO (reactive):**
```ts
// login-component.ts
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule, /* ... */],
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  loginForm = this.fb.nonNullable.group({
    userid:   ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { userid, password } = this.loginForm.getRawValue();
    this.authService.login(userid, password).subscribe(...);
  }
}
```
```html
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <input formControlName="userid" />
  @if (loginForm.controls.userid.touched && loginForm.controls.userid.invalid) {
    <span class="error">Username obbligatorio (min. 3 caratteri)</span>
  }

  <input formControlName="password" type="password" />
  @if (loginForm.controls.password.touched && loginForm.controls.password.invalid) {
    <span class="error">Password obbligatoria (min. 6 caratteri)</span>
  }

  <button type="submit" [disabled]="loginForm.invalid">Login</button>
</form>
```

---

### 10. Tipizzare i metodi dei service

**Cos'è.** In `giochi-service.ts` ci sono firme `Observable<any[]>`. Vanno create interfacce dedicate.

**Perché.** `any` disabilita TypeScript: niente autocomplete, niente errori in compilazione, refactor pericolosi.

**PRIMA:**
```ts
getLibreria(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/libreria`);
}
getListaUtenti(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/utenti/all`);
}
regalaGioco(idDestinatario: number, idGioco: number): Observable<any> {
  return this.http.post(`${this.baseUrl}/libreria/regala`, { idDestinatario, idGioco });
}
```

**DOPO:**
```ts
// In models/libreria-model.ts
export interface LibreriaItem {
  id: number;
  id_utente: number;
  id_gioco: number;
  quantita: number;
  gioco: GiochiModel;
}

// In models/utente-model.ts
export interface UtenteLight {
  id: number;
  userid: string;
}

export interface RegaloResponse {
  message: string;
  risultato: LibreriaItem;
}

// In giochi-service.ts
getLibreria(): Observable<LibreriaItem[]> {
  return this.http.get<LibreriaItem[]>(`${this.baseUrl}/libreria`);
}
getListaUtenti(): Observable<UtenteLight[]> {
  return this.http.get<UtenteLight[]>(`${this.baseUrl}/utenti/all`);
}
regalaGioco(idDestinatario: number, idGioco: number): Observable<RegaloResponse> {
  return this.http.post<RegaloResponse>(`${this.baseUrl}/libreria/regala`, { idDestinatario, idGioco });
}
```

---

### 11. Rimuovere `services/checkout.service.js`

**Cos'è.** In `ECommerceFE/src/app/services/` esiste un file `checkout.service.js` (estensione `.js`). È una copia del backend finita per sbaglio nel frontend. Va cancellato. *(`session-storage.service.ts` resta com'è.)*

**Perché.** Codice morto, scritto in JavaScript dentro un progetto TypeScript, importa moduli Node (`require('../models')`) che nel browser non esistono.

**Azione:**
```bash
rm ECommerceFE/src/app/services/checkout.service.js
```

---

### 12. Rendere `ThemeService` reattivo con un signal

**Cos'è.** `theme.service.ts` legge e scrive `localStorage` ad ogni chiamata. Va rifatto con un `signal<boolean>` interno, esposto in sola lettura.

**Perché.** Con il signal, qualsiasi componente che usa `theme.isDark()` nel template si ri-renderizza automaticamente al cambio di tema.

**PRIMA:**
```ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'theme';

  isDark(): boolean {
    return localStorage.getItem(this.key) === 'dark';
  }

  toggle() {
    const newValue = !this.isDark();
    localStorage.setItem(this.key, newValue ? 'dark' : 'light');
    document.body.classList.toggle('dark-theme', newValue);
    return newValue;
  }
}
```

**DOPO:**
```ts
import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'theme';

  private readonly _isDark = signal(localStorage.getItem(this.key) === 'dark');
  readonly isDark = this._isDark.asReadonly();

  constructor() {
    // Sincronizza il body ogni volta che il signal cambia
    effect(() => {
      const dark = this._isDark();
      localStorage.setItem(this.key, dark ? 'dark' : 'light');
      document.body.classList.toggle('dark-theme', dark);
    });
  }

  toggle() {
    this._isDark.update(v => !v);
  }
}
```

**Uso nei componenti:**
```html
<!-- PRIMA: il template non si aggiorna automaticamente -->
<button>{{ theme.isDark() ? '☀️' : '🌙' }}</button>

<!-- DOPO: identico, ma ora reattivo per davvero -->
<button>{{ theme.isDark() ? '☀️' : '🌙' }}</button>
```

---

### 13. Tipizzare i modelli in `models/`

**Cos'è.** `GiochiModel` ha `categoria: any`. `carrello-model.ts` ha `prezzo: string | number` perché i `DECIMAL` MySQL arrivano come stringa e non vengono normalizzati.

**Perché.** È legato al punto 10 ma riguarda i **modelli** (i contratti dati). Un modello con `any` propaga incertezza in tutta l'app: oggi nei calcoli del totale si fa `parseFloat` ovunque "per sicurezza" proprio perché `prezzo` non è affidabile.

**PRIMA:**
```ts
// giochi-model.ts
export class GiochiModel {
  id!: number;
  titolo!: string;
  prezzo!: number;
  datarilascio!: string;
  sviluppatore!: string;
  image_url!: string;
  descrizione!: string;
  categoria: any;   // 👈 da tipizzare
}
```

**DOPO:**
```ts
// models/categoria-model.ts
export interface Categoria {
  id: number;
  nome: string;
}

// models/giochi-model.ts
export interface GiochiModel {
  id: number;
  titolo: string;
  prezzo: number;
  datarilascio: string;
  sviluppatore: string;
  image_url: string;
  descrizione: string;
  categoria?: Categoria[];
}
```

**Normalizzare `prezzo` una volta sola** nel service, non a ogni utilizzo:
```ts
// giochi-service.ts
getGiochi(): Observable<GiochiModel[]> {
  return this.http
    .get<{ giochi: any[] }>(`${this.baseUrl}/giochi/getall`)
    .pipe(
      map(res => res.giochi.map(g => ({
        ...g,
        prezzo: Number(g.prezzo),   // 👈 conversione qui, una volta sola
      }) as GiochiModel))
    );
}
```

Da qui in poi `prezzo` è garantito `number` ovunque, niente più `parseFloat` sparsi.

---

## Sezione 2 — Migliorie Backend (Node/Express + Sequelize)

### 1. Bug nel modello `Categoria`

**Cos'è.** In `Backend/src/models/Categoria.js` il campo si chiama `Nome` (maiuscola) ed è definito come `INTEGER(11)`. Nel resto del codice viene letto come `nome` minuscolo e usato come stringa.

**Perché.** Bug doppio: nome di colonna inconsistente + tipo sbagliato (un INTEGER non può contenere "Action" o "RPG"). Va allineato il modello allo schema reale del DB (probabilmente la tabella ha già `nome VARCHAR`).

**PRIMA:**
```js
const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  Nome: {                              // 👈 maiuscola
    type: DataTypes.INTEGER(11),       // 👈 tipo sbagliato
    allowNull: false,
  }
}, {
  tableName: 'categoria',
  timestamps: false,
});
```

**DOPO:**
```js
const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nome: {                              // ✅ minuscolo, coerente con le query
    type: DataTypes.STRING(255),       // ✅ tipo stringa
    allowNull: false,
  }
}, {
  tableName: 'categoria',
  timestamps: false,
});
```

Se la tabella nel DB ha davvero `Nome INT`, va eseguito anche un `ALTER TABLE`:
```sql
ALTER TABLE categoria CHANGE Nome nome VARCHAR(255) NOT NULL;
```

---

### 2. Endpoint `getAll` utenti — espone dati sensibili

**Cos'è.** In `Backend/src/controllers/utenti.controller.js` la funzione `getAllUtenti` (riga 25-34) usa `utentiRepo.findAll()` ma `utentiRepo` **non è importato** (errore runtime). Inoltre `Utenti.findAll()` restituisce di default *tutte* le colonne, incluso `password` (hash bcrypt) e `refreshToken`.

**Perché.** Esporre l'hash della password è un problema di sicurezza grave (attacco a dizionario offline). Esporre il `refreshToken` permette di impersonare l'utente per 7 giorni. **Mai restituire campi sensibili dal backend**.

**PRIMA:**
```js
// utenti.controller.js
const getAllUtenti = async (req, res) => {
    try {
        const utenti = await utentiRepo.findAll();   // 💥 utentiRepo non importato
        const altriUtenti = utenti.filter(u => u.id !== req.user.id);
        res.status(200).json(altriUtenti);            // 💥 ritorna password e refreshToken
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

**DOPO:**
```js
// utenti.controller.js
const utentiRepo = require('../repositories/utenti.repository'); // ✅ import aggiunto

const getAllUtenti = async (req, res) => {
    try {
        const utenti = await utentiRepo.findAllSafe();  // 👈 nuovo metodo
        const altriUtenti = utenti.filter(u => u.id !== req.user.id);
        res.status(200).json(altriUtenti);
    } catch (error) {
        res.status(500).json({ message: 'Errore recupero utenti' });
    }
};
```

```js
// utenti.repository.js
const findAllSafe = async () => {
    return await Utenti.findAll({
        attributes: { exclude: ['password', 'refreshToken'] }   // 👈 esclude i campi sensibili
    });
};

module.exports = { findAll, findAllSafe, updateUtente };
```

---

### 3. Stack trace esposto al client

**Cos'è.** In `Backend/src/controllers/carrello.controller.js` riga 18 si fa `res.status(500).json({ error: error.message, stack: error.stack })`.

**Perché.** Lo stack rivela path interni, nomi moduli, versioni librerie. Un attaccante può usarli per cercare CVE noti. Lo stack si logga **server-side**, al client si manda solo un messaggio generico.

**PRIMA:**
```js
const getCarrello = async (req, res) => {
    try {
        const utenteId = req.params.id;
        const carrello = await carrelloService.recuperaCarrelloCompleto(utenteId);
        res.status(200).json(carrello);
    } catch (error) {
        console.error("❌ ERRORE GET CARRELLO:", error);
        res.status(500).json({
            error: error.message,
            stack: error.stack       // 👈 DA TOGLIERE
        });
    }
};
```

**DOPO:**
```js
const getCarrello = async (req, res) => {
    try {
        const utenteId = req.params.id;
        const carrello = await carrelloService.recuperaCarrelloCompleto(utenteId);
        res.status(200).json(carrello);
    } catch (error) {
        console.error("ERRORE GET CARRELLO:", error);  // log lato server: stack incluso
        res.status(500).json({
            message: 'Errore nel recupero del carrello'  // ✅ messaggio generico al client
        });
    }
};
```

---

### 4. `checkout.service` non popola `checkout` / `checkout_righe`

**Cos'è.** Il flusso di checkout in `Backend/src/services/checkout.service.js`: legge il carrello, scala il credito, aggiunge alla libreria, svuota il carrello. **Non scrive mai nelle tabelle `checkout` e `checkout_righe`** anche se i modelli esistono. Inoltre `CheckoutRighe.js` non ha `prezzo_unitario`. Va aggiunto un campo `id_utente` e `totale` al modello `Checkout`, `prezzo_unitario` a `CheckoutRighe`, e la creazione dei record nel service.

**Perché.** Senza queste scritture **lo storico ordini è perso**. Salvare `prezzo_unitario` snapshot è fondamentale: se domani cambi il prezzo del gioco, gli ordini vecchi devono mostrare il prezzo a cui è stato venduto, non quello corrente.

**Modello `Checkout` aggiornato:**
```js
const Checkout = sequelize.define('Checkout', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_utente: {                        // ✅ NUOVO
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    totale: {                           // ✅ NUOVO
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    iva: {                              // ✅ NUOVO
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    datacreazione: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, { tableName: 'checkout', timestamps: false });
```

**Modello `CheckoutRighe` aggiornato:**
```js
const CheckoutRighe = sequelize.define('CheckoutRighe', {
    id:           { type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true },
    id_checkout:  { type: DataTypes.INTEGER(11), allowNull: false },
    id_gioco:     { type: DataTypes.INTEGER(11), allowNull: false },
    quantita:     { type: DataTypes.INTEGER(11), allowNull: false },
    prezzo_unitario: {                              // ✅ NUOVO: snapshot del prezzo
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, { tableName: 'checkout_righe', timestamps: false });
```

**SQL per allineare le tabelle:**
```sql
ALTER TABLE checkout
  ADD COLUMN id_utente INT NOT NULL,
  ADD COLUMN totale DECIMAL(10,2) NOT NULL,
  ADD COLUMN iva DECIMAL(10,2) NOT NULL;

ALTER TABLE checkout_righe
  ADD COLUMN prezzo_unitario DECIMAL(10,2) NOT NULL;
```

**`checkout.service.js` aggiornato (estratto, dentro la transazione `t`):**
```js
// ... (calcoli subtotale, iva, totale, controllo credito, scala credito - già esistenti)

// 6. ✅ NUOVO: crea il record Checkout
const nuovoCheckout = await Checkout.create({
    id_utente: utenteId,
    totale: totale.toFixed(2),
    iva: iva.toFixed(2),
}, { transaction: t });

// 7. ✅ NUOVO: crea le righe del checkout (con snapshot del prezzo)
for (const item of items) {
    await CheckoutRighe.create({
        id_checkout: nuovoCheckout.id,
        id_gioco: item.id_gioco,
        quantita: item.quantita,
        prezzo_unitario: parseFloat(item.gioco.prezzo).toFixed(2),
    }, { transaction: t });
}

// 8. aggiorna libreria (già esistente)
// 9. svuota carrello (già esistente)

await t.commit();
return { message: "Checkout completato", idOrdine: nuovoCheckout.id, totalePagato: totale };
```

---

### 5. Rimuovere i `console.log` sparsi nel codice

**Cos'è.** In tutto il backend ci sono `console.log` di debug:
- `auth.controller.js:80-81` — **logga il refresh token in chiaro**
- `checkout.controller.js:5` — logga `req.user`
- `carrello.controller.js:14` — logga il risultato del carrello
- `credit.route.js:8-9` — logga `req.user` e `req.body`
- vari in `carrello.service.js` (commentati ma da rimuovere)

Vanno tolti.

**Perché.** Riempiono i log di rumore e alcuni espongono dati sensibili: `auth.controller.js` stampa il refresh token completo, equivalente a scriverlo in chiaro su disco.

**PRIMA:**
```js
// auth.controller.js
const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("COOKIE RECEIVED:", req.cookies);     // 👈 DA TOGLIERE
  console.log("REFRESH TOKEN:", refreshToken);      // 👈 DA TOGLIERE
  // ...
};
```

```js
// credit.route.js
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log("REQ USER:", req.user);             // 👈 DA TOGLIERE
    console.log("BODY:", req.body);                 // 👈 DA TOGLIERE
    // ...
  }
});
```

**DOPO:** semplicemente rimuoverli. I `console.error` nei `catch` possono restare (servono per il debug di errori veri), ma i `console.log` di flusso normale no.

---

## Sezione 3 — Nuova feature: Pannello Admin "Gestione Giochi"

L'obiettivo è permettere agli utenti con ruolo `admin` di aggiungere, modificare ed eliminare giochi dal catalogo. Oggi i giochi possono essere inseriti solo manualmente nel database.

### Backend

#### 3.1 Aggiungere il campo `role` al modello `Utenti`

**Cos'è.** In `Backend/src/models/Utenti.js` aggiungere un campo `role`. Va anche aggiornata la tabella DB con un `ALTER TABLE`. Almeno un utente va promosso a `admin` manualmente.

**Perché.** Senza ruoli non c'è modo di distinguere utenti normali da amministratori. ENUM è meglio di un boolean: in futuro si possono aggiungere `moderator`, `support` senza migration.

**Modello aggiornato:**
```js
const Utenti = sequelize.define('utenti', {
    id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userid:   { type: DataTypes.STRING(500), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(500), allowNull: false },
    refreshToken: { type: DataTypes.STRING(500), allowNull: true },
    credito:  { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: '0.00' },
    role: {                                              // ✅ NUOVO
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    }
}, { tableName: 'utenti', timestamps: false });
```

**SQL:**
```sql
ALTER TABLE utenti
  ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user';

-- Promuovere il primo admin manualmente:
UPDATE utenti SET role = 'admin' WHERE userid = 'admin_username';
```

#### 3.2 Includere il `role` nel JWT al login

**Cos'è.** In `auth.service.js` la funzione `login` genera l'`accessToken` con payload `{ id, userid }`. Va aggiunto `role`.

**Perché.** Mettendo il ruolo nel token, il middleware `verifyToken` lo rende disponibile in `req.user.role` senza una query extra al DB ad ogni richiesta. Trade-off: se il ruolo cambia, il vecchio token resta valido fino alla scadenza (10 minuti — accettabile).

**PRIMA:**
```js
const accessToken = jwt.sign(
  { id: user.id, userid: user.userid },
  ACCESS_TOK,
  { expiresIn: '10m' }
);
```

**DOPO:**
```js
const accessToken = jwt.sign(
  { id: user.id, userid: user.userid, role: user.role },   // ✅ role aggiunto
  ACCESS_TOK,
  { expiresIn: '10m' }
);
```

Stessa cosa nella funzione `refresh`. Anche la response del login deve includere `role`:
```js
return {
  accessToken,
  refreshToken,
  user: {
    id: user.id,
    userid: user.userid,
    credito: user.credito,
    role: user.role          // ✅
  }
};
```

#### 3.3 Middleware `requireAdmin`

**Cos'è.** Una nuova funzione in `Backend/src/services/auth.middleware.js` che blocca le richieste se l'utente non è admin.

**Perché.** Evita di duplicare il check in ogni controller. Lo status 403 (Forbidden) è semanticamente diverso da 401 (Unauthorized).

```js
// Backend/src/services/auth.middleware.js

function verifyToken(req, res, next) {
  // ... codice esistente
}

function requireAdmin(req, res, next) {                    // ✅ NUOVO
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato: solo admin' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };
```

**Uso:**
```js
// giochi.route.js
router.post('/', verifyToken, requireAdmin, giochiController.create);
//             ↑                ↑
//             prima loggato,   poi admin
```

#### 3.4 Endpoint CRUD per i giochi

**Cos'è.** Aggiungere a `giochi.route.js` le rotte CRUD.

**Perché.** Oggi `giochi.route.js` ha solo le rotte di lettura. I verbi REST corretti rendono l'API auto-esplicativa.

**Route:**
```js
// Backend/src/routes/giochi.route.js
const express = require('express');
const router = express.Router();
const Controller = require('../controllers/giochi.controller');
const { verifyToken, requireAdmin } = require('../services/auth.middleware');

// Lettura (esistenti)
router.get('/getall', verifyToken, Controller.findAll);
router.get('/categoria/:nome', Controller.getGamesByCategory);

// CRUD admin (NUOVI)
router.post('/',         verifyToken, requireAdmin, Controller.create);
router.patch('/:id',     verifyToken, requireAdmin, Controller.update);
router.delete('/:id',    verifyToken, requireAdmin, Controller.remove);

module.exports = router;
```

**Controller:**
```js
// Backend/src/controllers/giochi.controller.js

const create = async (req, res) => {
    try {
        const { titolo, prezzo, datarilascio, sviluppatore, image_url, descrizione } = req.body;

        // Validazione minima
        if (!titolo || prezzo === undefined || prezzo < 0) {
            return res.status(400).json({ message: 'Titolo e prezzo (>=0) sono obbligatori' });
        }

        const nuovo = await giochiServizio.create({ titolo, prezzo, datarilascio, sviluppatore, image_url, descrizione });
        return res.status(201).json({ gioco: nuovo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Errore creazione gioco' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const aggiornato = await giochiServizio.update(id, req.body);
        if (!aggiornato) return res.status(404).json({ message: 'Gioco non trovato' });
        return res.status(200).json({ gioco: aggiornato });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Errore aggiornamento gioco' });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminato = await giochiServizio.remove(id);
        if (!eliminato) return res.status(404).json({ message: 'Gioco non trovato' });
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Errore eliminazione gioco' });
    }
};

module.exports = { findAll, getGamesByCategory, create, update, remove };
```

**Service e repository:**
```js
// services/giochi.service.js
const create = async (data) => giochiRepo.create(data);
const update = async (id, data) => giochiRepo.update(id, data);
const remove = async (id) => giochiRepo.remove(id);

module.exports = { findAll, getGamesByCategory, create, update, remove };
```

```js
// repositories/giochi.repository.js
const create = async (data) => Giochi.create(data);

const update = async (id, data) => {
    const gioco = await Giochi.findByPk(id);
    if (!gioco) return null;
    return gioco.update(data);
};

const remove = async (id) => {
    const gioco = await Giochi.findByPk(id);
    if (!gioco) return null;
    await gioco.destroy();
    return true;
};

module.exports = { findAll, getCategoryName, getGamesByCategory, create, update, remove };
```

### Frontend

#### 3.5 Aggiornare `AuthService` per includere `role`

**Cos'è.** L'interfaccia `UserData` va estesa con `role`. Il signal popolato al login già lo riceverà dal backend.

```ts
// auth.service.ts
interface UserData {
  id: number;
  userid: string;
  credito: number;
  role: 'user' | 'admin';      // ✅ NUOVO
}
```

#### 3.6 `RoleGuard` — guard per le rotte admin

**Cos'è.** Nuovo file `services/role.guard.ts`. Verifica che l'utente loggato abbia ruolo `admin`. Se non lo è, redirect a `/home`.

**Perché.** Tenere `AuthGuard` (è loggato?) e `RoleGuard` (ha il ruolo giusto?) separati permette di combinarli e di averne in futuro altri.

```ts
// ECommerceFE/src/app/services/role.guard.ts
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
```

#### 3.7 Aggiungere la route `/admin/giochi`

**Cos'è.** In `app.routes.ts` la nuova rotta protetta da entrambi i guard.

```ts
// ECommerceFE/src/app/app.routes.ts
import { AdminGiochiComponent } from './components/admin-giochi/admin-giochi';
import { RoleGuard } from './services/role.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home',     canActivate: [AuthGuard], component: HomeComponent },
  { path: 'carrello', canActivate: [AuthGuard], component: CarrelloPageComponent },
  // ... altre rotte ...

  // ✅ NUOVO
  {
    path: 'admin/giochi',
    canActivate: [AuthGuard, RoleGuard],
    component: AdminGiochiComponent
  },

  { path: '**', component: ErrorComponent }
];
```

#### 3.8 `GiochiAdminService` — service dedicato alle chiamate admin

```ts
// ECommerceFE/src/app/services/giochi-admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { GiochiModel } from '../models/giochi-model';

@Injectable({ providedIn: 'root' })
export class GiochiAdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/giochi`;

  create(payload: Partial<GiochiModel>) {
    return this.http.post<{ gioco: GiochiModel }>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<GiochiModel>) {
    return this.http.patch<{ gioco: GiochiModel }>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

#### 3.9 `AdminGiochiComponent` — il componente vero e proprio

```ts
// ECommerceFE/src/app/components/admin-giochi/admin-giochi.ts
import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GiochiService } from '../../services/giochi-service';
import { GiochiAdminService } from '../../services/giochi-admin.service';
import { ToastService } from '../../services/toast.service';
import { GiochiModel } from '../../models/giochi-model';

@Component({
  selector: 'app-admin-giochi',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-giochi.html',
  styleUrl: './admin-giochi.css',
})
export class AdminGiochiComponent {
  private fb = inject(FormBuilder);
  private giochiService = inject(GiochiService);
  private adminService = inject(GiochiAdminService);
  private toast = inject(ToastService);

  giochi = signal<GiochiModel[]>([]);
  inEditing = signal<GiochiModel | null>(null);

  form = this.fb.nonNullable.group({
    titolo:        ['', Validators.required],
    prezzo:        [0, [Validators.required, Validators.min(0)]],
    datarilascio:  ['', Validators.required],
    sviluppatore:  ['', Validators.required],
    image_url:     ['', Validators.required],
    descrizione:   ['', Validators.required],
  });

  ngOnInit() {
    this.carica();
  }

  carica() {
    this.giochiService.getGiochi().subscribe(g => this.giochi.set(g));
  }

  onSubmit() {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue();
    const editing = this.inEditing();

    const obs = editing
      ? this.adminService.update(editing.id, payload)
      : this.adminService.create(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(editing ? 'Gioco aggiornato' : 'Gioco creato');
        this.form.reset();
        this.inEditing.set(null);
        this.carica();
      },
      error: () => this.toast.error('Errore salvataggio')
    });
  }

  modifica(g: GiochiModel) {
    this.inEditing.set(g);
    this.form.patchValue(g);
  }

  elimina(g: GiochiModel) {
    if (!confirm(`Eliminare "${g.titolo}"?`)) return;
    this.adminService.remove(g.id).subscribe({
      next: () => { this.toast.success('Eliminato'); this.carica(); },
      error: () => this.toast.error('Errore eliminazione')
    });
  }

  annullaModifica() {
    this.inEditing.set(null);
    this.form.reset();
  }
}
```

**Template `admin-giochi.html`:**
```html
<h2>Gestione giochi</h2>

<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="titolo"       placeholder="Titolo" />
  <input formControlName="prezzo"       type="number" step="0.01" placeholder="Prezzo" />
  <input formControlName="datarilascio" type="date" />
  <input formControlName="sviluppatore" placeholder="Sviluppatore" />
  <input formControlName="image_url"    placeholder="URL immagine" />
  <textarea formControlName="descrizione" placeholder="Descrizione"></textarea>

  <button type="submit" [disabled]="form.invalid">
    {{ inEditing() ? 'Aggiorna' : 'Crea' }}
  </button>
  @if (inEditing()) {
    <button type="button" (click)="annullaModifica()">Annulla</button>
  }
</form>

<table>
  <thead>
    <tr><th>Titolo</th><th>Prezzo</th><th>Sviluppatore</th><th></th></tr>
  </thead>
  <tbody>
    @for (g of giochi(); track g.id) {
      <tr>
        <td>{{ g.titolo }}</td>
        <td>{{ g.prezzo | currency:'EUR' }}</td>
        <td>{{ g.sviluppatore }}</td>
        <td>
          <button (click)="modifica(g)">Modifica</button>
          <button (click)="elimina(g)">Elimina</button>
        </td>
      </tr>
    }
  </tbody>
</table>
```

#### 3.10 Voce "Admin" nel menu della home

```html
<!-- home-component.html, dentro la sidebar -->
@if (authService.currentUser()?.role === 'admin') {
  <a routerLink="/admin/giochi" class="menu-item">🎮 Gestione giochi</a>
}
```

E nel componente:
```ts
// home-component.ts
import { AuthService } from '../../services/auth.service';

export class HomeComponent {
  authService = inject(AuthService);  // public per usarlo nel template
  // ...
}
```

### Note di sicurezza importanti

- **I guard frontend non sono sicurezza, sono solo UX.** Un utente con DevTools può modificare il `role` nel signal o saltare il guard. La vera protezione è il middleware `requireAdmin` lato backend. **Ogni endpoint admin DEVE avere `requireAdmin`**, sempre.
- **Validare sempre lato server.** Anche se il form Angular ha `Validators.required` e `Validators.min(0)`, il backend deve ricontrollare. Postman bypassa il form.
- **Non fidarsi dell'`id_utente` dal body.** L'identità si legge da `req.user.id` (popolato da `verifyToken`), mai da `req.body.id_utente`.

---

## Sezione 4 — README del progetto

### Cos'è

Oggi nel progetto:
- `Backend/README.md` è praticamente vuoto.
- `ECommerceFE/README.md` è il README di default generato da Angular CLI.
- **Nella root del progetto non esiste un README**.

Va creato un `README.md` nella root che descriva il progetto nel suo complesso.

### Perché va aggiunto

Quando una persona nuova apre la repo (collega, valutatore, recruiter) la prima cosa che cerca è il README. Senza README:
- Non capisce di cosa si tratta
- Non sa come avviare il progetto in locale
- Non conosce le variabili d'ambiente
- Deve dedurre tutto leggendo il codice — costoso e scoraggiante

Un buon README riduce il tempo di onboarding da ore a minuti.

### Cosa deve contenere il README di questo progetto

- **Titolo e descrizione**: e-commerce di videogiochi con autenticazione JWT, gestione carrello, libreria personale, sistema di credito interno e (dopo questa sprint) pannello admin.
- **Stack tecnologico**: Angular 21 (standalone components, signals), Node.js + Express 5 + Sequelize 6, MySQL.
- **Prerequisiti**: Node.js 18+, MySQL 8, npm.
- **Setup `.env`**: lista delle variabili con valori di esempio.
- **Comandi di avvio**: `npm install` + `npm start` (concurrently già configurato).
- **Struttura del progetto**: schema ad albero delle cartelle.
- **API principali**: tabella riassuntiva degli endpoint.
- **Screenshot opzionali**.

---

## Template generico di README

Da copiare in `README.md` nella root e adattare. È una struttura standard valida per qualsiasi progetto.

````markdown
# Nome del Progetto

> Una frase breve che descrive cosa fa il progetto.

Descrizione più estesa: il problema che risolve, a chi è destinato, il contesto.

## Indice

- [Stack tecnologico](#stack-tecnologico)
- [Prerequisiti](#prerequisiti)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Avvio](#avvio)
- [Struttura del progetto](#struttura-del-progetto)
- [API principali](#api-principali)
- [Contribuire](#contribuire)
- [Licenza](#licenza)

## Stack tecnologico

- **Frontend**: framework + versione
- **Backend**: linguaggio + framework + versione
- **Database**: tipo + versione
- **Altro**: librerie rilevanti (auth, ORM, ecc.)

## Prerequisiti

- Node.js >= 18
- MySQL >= 8
- npm o yarn

## Installazione

```bash
# Clona il repository
git clone <url-del-repo>
cd nome-progetto

# Installa le dipendenze (root + sottocartelle se monorepo)
npm install
cd Backend && npm install
cd ../ECommerceFE && npm install
```

## Configurazione

Crea un file `.env` nella cartella `Backend/` partendo da `.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tua_password
DB_NAME=ecommerce
DB_DIALECT=mysql
JWT_SECRET=una_stringa_segreta_lunga
JWT_REFRESH=un_altra_stringa_segreta_lunga
PORT=3000
```

## Avvio

```bash
# Avvia frontend e backend insieme (dalla root)
npm start

# Oppure separatamente
npm run start:backend   # http://localhost:3000
npm run start:frontend  # http://localhost:4200
```

## Struttura del progetto

```
nome-progetto/
├── Backend/
│   ├── src/
│   │   ├── config/         # Configurazione DB e ambiente
│   │   ├── controllers/    # Gestione richieste HTTP
│   │   ├── services/       # Logica di business
│   │   ├── repositories/   # Accesso al database
│   │   ├── models/         # Modelli Sequelize
│   │   └── routes/         # Definizione delle rotte
│   ├── app.js
│   └── server.js
├── ECommerceFE/
│   └── src/app/
│       ├── components/     # Componenti UI
│       ├── services/       # Service Angular (HTTP, auth, ecc.)
│       └── models/         # Interfacce TypeScript
└── README.md
```

## API principali

| Metodo | Endpoint                  | Auth   | Descrizione                       |
|--------|---------------------------|--------|-----------------------------------|
| POST   | `/api/v1/auth/register`   | No     | Registrazione nuovo utente        |
| POST   | `/api/v1/auth/login`      | No     | Login                             |
| POST   | `/api/v1/auth/refresh`    | Cookie | Rinnova access token              |
| POST   | `/api/v1/auth/logout`     | No     | Logout                            |
| GET    | `/api/v1/giochi/getall`   | JWT    | Lista catalogo giochi             |
| GET    | `/api/v1/carrello/get/:id`| JWT    | Recupera carrello dell'utente     |
| POST   | `/api/v1/checkout`        | JWT    | Esegue il checkout del carrello   |
| POST   | `/api/v1/giochi`          | JWT+Admin | Crea nuovo gioco               |
| PATCH  | `/api/v1/giochi/:id`      | JWT+Admin | Modifica gioco esistente       |
| DELETE | `/api/v1/giochi/:id`      | JWT+Admin | Elimina gioco                  |

## Contribuire

1. Fork del repository
2. Crea un branch (`git checkout -b feature/nome-feature`)
3. Commit delle modifiche (`git commit -m 'descrizione'`)
4. Push del branch (`git push origin feature/nome-feature`)
5. Apri una Pull Request

## Licenza

Specificare la licenza (es. MIT, ISC, proprietary).
````

---

## Sezione 5 — Note finali

### Ordine di lavoro consigliato

Per sfruttare al meglio i 2-3 giorni a disposizione:

1. **Bug bloccanti / sicurezza** (mezza giornata): Sezione 2 punti 2, 3, 5 + Sezione 1 punto 5. Sono fix piccoli ma importanti.
2. **Migliorie strutturali frontend** (1 giorno): Sezione 1 punti 1, 2, 4, 6, 10, 13. Sono i refactor che impattano di più sulla qualità del codice.
3. **Modello dati corretto** (mezza giornata): Sezione 2 punti 1 e 4. Senza questi, l'admin lavora su fondamenta sbagliate.
4. **Feature pannello admin** (1 giorno): Sezione 3 completa.
5. **README** (poche ore, in parallelo a fine progetto): Sezione 4.

I punti rimanenti della Sezione 1 (3, 7, 8, 9, 11, 12) sono *nice-to-have* da fare se avanza tempo.

### Fuori scope per questa sprint

Le seguenti idee sono state valutate ma rimandate a sprint future:

- Pannello Kanban degli ordini con drag & drop
- Sistema di recensioni e voti sui giochi
- Wishlist / lista desideri
- Paginazione e ricerca avanzata sul catalogo
- Test automatici (Jest backend, Vitest/Karma frontend)
- Documentazione API con Swagger/OpenAPI
- Rate limiting sulle rotte di autenticazione
- Sistema di logging strutturato
- Migrazioni Sequelize formalizzate (oggi sono SQL manuali)
