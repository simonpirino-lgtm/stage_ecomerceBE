import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarrelloService, CarrelloResponse } from '../../services/carrello.service';

@Component({
  selector: 'app-carrello-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrello-page.html',
  styleUrls: ['./carrello-page.css']
})
export class CarrelloPageComponent implements OnInit {
  // Dati del carrello
  items: any[] = [];
  
  // Variabili popolate direttamente dai calcoli del Backend
  totaleArticoli: number = 0;
  subtotale: number = 0;
  totalePrezzo: number = 0;
  iva: number = 0;
  totale: number = 0;

  // Injection dei servizi
  private carrelloService = inject(CarrelloService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.caricaCarrello();
  }

  /**
   * Restituisce il totale dei prezzi del carrello
   */
  getTotaleArticoli(): number {
    return this.totalePrezzo;
  }

  /**
   * Recupera i dati dal server. 
   * Nota: Il server restituisce già i totali calcolati.
   */
  caricaCarrello(): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.error('User not found in localStorage');
      return;
    }

    let userId: number;
    try {
      const userObj = JSON.parse(userStr);
      userId = userObj.id || parseInt(userStr, 10);
    } catch {
      userId = parseInt(userStr, 10);
    }

    if (!userId) {
      console.error('Invalid user ID');
      return;
    }

    this.carrelloService.getCarrello(userId).subscribe({
      next: (risposta: CarrelloResponse) => {
        // Assegnazione dei dati pronti dal backend
        this.items = risposta.items || [];
        this.totaleArticoli = risposta.totaleArticoli || 0;
        this.subtotale = risposta.subtotale || 0;
        this.iva = risposta.iva || 0;
        this.totale = risposta.totale || 0;
        
        this.cdr.detectChanges(); // Forza il refresh della UI
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

}