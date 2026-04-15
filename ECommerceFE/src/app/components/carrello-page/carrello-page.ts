import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarrelloService, CarrelloItem } from '../../services/carrello.service';

@Component({
  selector: 'app-carrello-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrello-page.html',
  styleUrls: ['./carrello-page.css']
})
export class CarrelloPageComponent implements OnInit 
{
  items: CarrelloItem[] = [];
  
  // Variabili per i calcoli (inizializzate a 0 per evitare errori nel template)
  totaleArticoli: number = 0;
  subtotale: number = 0;

  private carrelloService = inject(CarrelloService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.caricaCarrello();
  }

  caricaCarrello(): void {
    this.carrelloService.getCarrello().subscribe({
      next: (dati) => {
        this.items = dati || [];
        this.aggiornaConteggi(); // Ricalcola tutto appena arrivano i dati
        this.cdr.detectChanges(); // Forza il controllo dei cambiamenti
      },
      error: (err) => console.error('Errore caricamento:', err)
    });
  }

  // Spostiamo la logica di calcolo qui per non sovraccaricare l'HTML
  private aggiornaConteggi(): void {
    this.totaleArticoli = this.items.reduce((acc, item) => acc + (item.quantita || 0), 0);
    
    this.subtotale = this.items.reduce((acc, item) => {
      const prezzo = typeof item.prezzo === 'string' ? parseFloat(item.prezzo) : item.prezzo;
      return acc + ((prezzo || 0) * (item.quantita || 0));
    }, 0);
  }

  // Metodi per l'interfaccia (ora restituiscono variabili già pronte)
  getTotaleArticoli(): number {
    return this.totaleArticoli;
  }

  getSubtotale(): number {
    return this.subtotale;
  }

  cambiaQuantita(gioco: CarrelloItem, modifica: number): void {
    const nuovaQty = (gioco.quantita || 1) + modifica;
    if (nuovaQty <= 0) {
      this.rimuovi(gioco.id);
    } else {
      this.carrelloService.updateQuantita(gioco.id, nuovaQty).subscribe({
        next: () => this.caricaCarrello(),
        error: (err) => console.error('Errore update:', err)
      });
    }
  }

  rimuovi(id: number): void {
    this.carrelloService.rimuovi(id).subscribe({
      next: () => this.caricaCarrello(),
      error: (err) => console.error('Errore rimozione:', err)
    });
  }
}
