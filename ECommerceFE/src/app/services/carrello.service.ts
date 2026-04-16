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
  subtotale: number;
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
  aggiungi(giocoId: number, prezzo: number): Observable<any> 
  {
    return this.http.post(`${this.apiUrl}/aggiungi`, { giocoId, prezzo });
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
   * Recupera solo il totale (utile se serve solo il costo in altre pagine).
   */
  getTotale(): Observable<{ totale: number }> {
    return this.http.get<{ totale: number }>(`${this.apiUrl}/totale`);
  }
}