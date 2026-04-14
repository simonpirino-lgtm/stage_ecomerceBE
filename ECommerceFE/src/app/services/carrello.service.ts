import { Injectable } from '@angular/core';
import { GiochiModel } from '../models/giochi-model';

export interface CarrelloItem extends GiochiModel {
  quantita: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarrelloService {
  private carrello: CarrelloItem[] = [];

  aggiungi(gioco: GiochiModel) {
    const esistente = this.carrello.find(item => item.id === gioco.id);
    if (esistente) {
      esistente.quantita += 1;
    } else {
      this.carrello.push({ ...gioco, quantita: 1 });
    }
  }

  getCarrello() {
    return this.carrello;
  }

  getTotale(): number {
    return this.carrello.reduce(
      (tot, item) => tot + (parseFloat(item.prezzo) || 0) * item.quantita,
      0
    );
  }

  rimuovi(index: number) {
    this.carrello.splice(index, 1);
  }

  svuota() {
    this.carrello = [];
  }
}
