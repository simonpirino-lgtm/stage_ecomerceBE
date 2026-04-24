import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GiochiModel } from '../models/giochi-model';
import { HttpClient } from '@angular/common/http';

@Injectable
({
  providedIn: 'root',
})
export class GiochiService
{
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/v1';

  /* -------------------------
     GIOCHI
  -------------------------- */
  getGiochi(): Observable<GiochiModel[]> {
    return this.http
      .get<{ giochi: GiochiModel[] }>(`${this.baseUrl}/giochi/getall`)
      .pipe(map(response => response.giochi));
  }

  /* -------------------------
     CATEGORIE
  -------------------------- */
  getNomeCategoria(): Observable<string[]> {
    return this.http
      .get<{ categorie: { nome: string }[] }>(`${this.baseUrl}/categorie`)
      .pipe(
        map(response => response.categorie.map(c => c.nome))
      );
  }

  /* -------------------------
     GIOCHI PER CATEGORIA
  -------------------------- */
  getGiochiCategoria(nome: string): Observable<GiochiModel[]> {
    return this.http
      .get<{ giochi: GiochiModel[] }>(`${this.baseUrl}/giochi/categoria/${nome}`)
      .pipe(map(response => response.giochi));
  }

/* -------------------------
    LIBRERIA UTENTE
-------------------------- */
getLibreria(): Observable<any[]> {
  // Usiamo baseUrl che hai già definito e puntiamo alla rotta libreria
  return this.http.get<any[]>(`${this.baseUrl}/libreria`);
}
}
