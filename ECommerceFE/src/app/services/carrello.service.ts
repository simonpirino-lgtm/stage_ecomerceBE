import { Injectable } from '@angular/core';
import { GiochiModel } from '../models/giochi-model';

@Injectable({
  providedIn: 'root'
})
export class CarrelloService {

  // Array privato che contiene i giochi aggiunti
  private carrello: GiochiModel[] = [];

  constructor() { }

  // Aggiunge un gioco al carrello
  aggiungi(gioco: GiochiModel): void {
    this.carrello.push(gioco);
    console.log('Prodotto aggiunto:', gioco.titolo);
  }

  // Restituisce la lista dei prodotti nel carrello
  getCarrello(): GiochiModel[] {
    return this.carrello;
  }

  // Calcola il totale dei prezzi
  getTotale(): number {
    return this.carrello.reduce((tot, gioco) => {
      // Converte la stringa prezzo in numero, gestendo eventuali virgole
      const prezzoNum = parseFloat(gioco.prezzo.replace(',', '.'));
      return tot + (isNaN(prezzoNum) ? 0 : prezzoNum);
    }, 0);
  }

  // Rimuove un elemento in base alla sua posizione (index)
  rimuovi(index: number): void {
    if (index > -1 && index < this.carrello.length) {
      this.carrello.splice(index, 1);
    }
  }

  // Svuota completamente il carrello
  svuota(): void {
    this.carrello = [];
  }

  // Restituisce il numero di oggetti nel carrello
  getConteggio(): number {
    return this.carrello.length;
  }
}
