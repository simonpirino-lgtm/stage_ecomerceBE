import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GiochiModel } from '../models/giochi-model';

export interface CarrelloItem extends GiochiModel {
  quantita: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarrelloService {
  private apiUrl = 'http://localhost:3000/api/carrello'; 

  constructor(private http: HttpClient) {}

  getCarrello(): Observable<CarrelloItem[]> {
    return this.http.get<CarrelloItem[]>(this.apiUrl);
  }

  aggiungi(gioco: GiochiModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { giocoId: gioco.id, prezzo: gioco.prezzo });
  }

  updateQuantita(id: number, quantita: number): Observable<any> {
    // Il return è fondamentale per poter fare il .subscribe() nel componente
    return this.http.put(`${this.apiUrl}/update-qty`, { id, quantita });
  }

  rimuovi(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTotale(): Observable<{ totale: number }> {
    return this.http.get<{ totale: number }>(`${this.apiUrl}/totale`);
  }
}
