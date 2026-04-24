import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GiochiModel } from '../models/giochi-model';

// Definiamo le interfacce per una tipizzazione forte
export interface CarrelloItem {
  id: number;
  id_utente: number;
  gioco_id: number;
  quantita: number;
  prezzo_unitario: number;
  Gioco?: GiochiModel; // Contiene i dettagli (titolo, immagine) grazie all'include del backend
}

export interface CarrelloResponse {
  items: CarrelloItem[];
  totaleArticoli: number;
  subtotale: number | null;
  iva: number;
  totale: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarrelloService {
  private apiUrl = 'http://localhost:3000/api/v1/carrello'; 
  
  // Uso inject() per coerenza con gli altri tuoi componenti
  private http = inject(HttpClient);

  /**
   * Recupera l'intero carrello.
   * Il backend restituisce già items, totaleArticoli e subtotale.
   */
  getCarrello(id:number): Observable<CarrelloResponse> {
    return this.http.get<CarrelloResponse>(`${this.apiUrl}/get/${id}`);
  }

  /**
   * Aggiunge un prodotto al carrello.
   * Nota: ho cambiato l'endpoint in '/aggiungi' per farlo coincidere con la rotta backend.
   */
  aggiungi(utenteId: number, giocoId: number, quantita: number) {
    return this.http.post(`${this.apiUrl}/aggiungi`, {
      utenteId,
      giocoId,
      quantita
    });
  }

  /**
   * Aggiorna la quantità di un elemento esistente.
   */
  updateQuantita(id: number, quantita: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-qty`, { id, quantita });
  }

  /**
   * Rimuove un elemento dal carrello tramite il suo ID primario.
   */
  rimuovi(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Recupera il totale del carrello (quantità e prezzo).
   */
  getTotaleArticoli(id: number): Observable<{ totaleArticoli: number; totalePrezzo: number }> {
    return this.http.get<{ totaleArticoli: number; totalePrezzo: number }>(`${this.apiUrl}/totale/${id}`);
  }

  checkout() {
    return this.http.post('http://localhost:3000/api/v1/checkout', {});
  }

}