import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CarrelloService, CarrelloItem } from '../../services/carrello.service'; // Verifica che il percorso sia esatto

@Component({
  selector: 'app-carrello-page',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './carrello-page.html',
  styleUrl: './carrello-page.css',
})
export class CarrelloPage implements OnInit {
  // Queste proprietà servono al tuo HTML per la ricerca e le animazioni
  searchTerm: string = '';
  items: CarrelloItem[] = [];
  transforms: { [key: number]: string } = {};

  constructor(private carrelloService: CarrelloService) {}

  ngOnInit() {
    // Carichiamo i dati dal Service al caricamento della pagina
    this.aggiornaVista();
  }

  // Sincronizza i dati locali con quelli del Service
  aggiornaVista() {
    this.items = this.carrelloService.getCarrello();
  }

  // Metodo per il filtro di ricerca nel carrello
  get giochiFiltrati() {
    return this.items.filter(item =>
      item.titolo?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Richiama il calcolo matematico che hai già nel Service
  getSubtotale(): number {
    return this.carrelloService.getTotale();
  }

  // Conta quanti pezzi fisici ci sono nel carrello
  getTotaleArticoli(): number {
    return this.items.reduce((acc, item) => acc + item.quantita, 0);
  }

  // Gestione quantità direttamente integrata con il Service
  cambiaQuantita(item: CarrelloItem, delta: number) {
    const nuovoValore = item.quantita + delta;
    
    if (nuovoValore <= 0) {
      this.rimuovi(this.items.indexOf(item));
    } else {
      item.quantita = nuovoValore;
    }
  }

  rimuovi(index: number) {
    this.carrelloService.rimuovi(index);
    this.aggiornaVista(); // Refresh della lista
  }

  // --- ANIMAZIONI MOUSE (Per lo stile gaming che hai scelto) ---
  onMouseEnter(event: MouseEvent, gioco: CarrelloItem) {
    this.transforms[gioco.id] = 'scale(1.03) translateY(-5px)';
  }

  onMouseMove(event: MouseEvent, gioco: CarrelloItem) { }

  onMouseLeave(gioco: CarrelloItem) {
    this.transforms[gioco.id] = 'scale(1) translateY(0)';
  }
}