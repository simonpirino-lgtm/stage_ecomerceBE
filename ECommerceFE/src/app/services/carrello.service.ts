import { inject, Injectable } from '@angular/core';
import { GiochiModel } from '../models/giochi-model';

@Injectable({
  providedIn: 'root'
})
export class CarrelloService {

  private carrello: GiochiModel[] = [];
  private carrelloService = inject(CarrelloService);

  aggiungi(gioco: GiochiModel) {
  this.carrelloService.aggiungi(gioco);
  alert(`Aggiunto al carrello: ${gioco.titolo}`);
}

  getCarrello() {
    return this.carrello;
  }

  getTotale(): number {
    return this.carrello.reduce((tot, gioco) => tot + +gioco.prezzo, 0);
  }

  rimuovi(index: number) {
    this.carrello.splice(index, 1);
  }

  svuota() {
    this.carrello = [];
  }
}