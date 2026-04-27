import { Component, OnInit, ChangeDetectorRef, inject, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarrelloService, CarrelloResponse } from '../../services/carrello.service';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-carrello-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrello-page.html',
  styleUrls: ['./carrello-page.css']
})

export class CarrelloPageComponent implements OnInit {
  // Dati del carrello
  items = signal<any[]>([]);
  
  // Variabili popolate direttamente dai calcoli del Backend
  totaleArticoli = signal(0);
  subtotale = signal(0);
  iva = signal(0);
  totale = signal(0);
  totalePrezzo: number = 0;

  // Injection dei servizi
  private carrelloService = inject(CarrelloService);
  //private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private router = inject(Router);
  toastService: any;

  constructor(public theme: ThemeService) {}

  ngOnInit(): void {
    this.theme.init();
    this.caricaCarrello();
  }

  /**
   * Restituisce il totale dei prezzi del carrello
   */
  getTotaleArticoli(): number {
    return this.totaleArticoli();
  }

  /**
   * Recupera i dati dal server. 
   * Nota: Il server restituisce già i totali calcolati.
   */
  caricaCarrello(): void {
    const user = this.authService.currentUser();

    if (!user?.id) {
      console.error('Utente non valido o non autenticato');
      this.router.navigate(['/']);
      return;
    }

    if (!user) {
      console.error('Utente non loggato');
      return;
    }

    this.carrelloService.getCarrello(user.id).subscribe({
      next: (risposta: CarrelloResponse) => {
        this.items.set(risposta.items || []);
        this.totaleArticoli.set(risposta.totaleArticoli || 0);
        this.subtotale.set(risposta.subtotale || 0);
        this.iva.set(risposta.iva || 0);
        this.totale.set(risposta.totale || 0);
      },
      error: (err) => {
        console.error('Errore durante il caricamento del carrello:', err);
      }
    });
  }

  /**
   * Gestisce l'aumento o la diminuzione della quantità.
   * La logica di controllo (se <= 0 rimuovi) rimane qui per l'esperienza utente.
   */
  cambiaQuantita(item: any, modifica: number): void {
    const nuovaQty = (item.quantita || 1) + modifica;
    
    if (nuovaQty <= 0)
    {
      this.rimuovi(item.id);
    } else {
      this.carrelloService.updateQuantita(item.id, nuovaQty).subscribe({
        next: () => this.caricaCarrello(),
        error: (err) => console.error(err)
      });
    }
  }

  /**
   * Rimuove un elemento dal carrello tramite ID.
   */
  rimuovi(id: number): void {
    this.carrelloService.rimuovi(id).subscribe({
      next: () => {
        // Ricarica per aggiornare la lista e i totali
        this.caricaCarrello();
      },
      error: (err) => console.error('Errore durante la rimozione dell\'articolo:', err)
    });
  }

checkout(): void {
    this.carrelloService.checkout().subscribe({
      next: (res) => {
        this.toastService.success("Acquisto riuscito!");

        // 1. Recuperiamo i dati aggiornati dal server
        this.authService.getMe().subscribe({
          next: (user: any) => {
            this.authService.setCurrentUser(user);
            this.router.navigate(['/library']);
          },
          error: (err: any) => {
            console.error(err);
            this.router.navigate(['/library']);
          }
        });
      },
      error: (err) => {
        console.error("Errore checkout", err);
        this.toastService.error("Errore durante l'acquisto: " + (err.error?.error || "Credito insufficiente"));
      }
    });
  }
}

