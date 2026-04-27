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
    .get<{ giochi: any[] }>(`${this.baseUrl}/giochi/getall`)
    .pipe(
      map(res => res.giochi.map(g => ({
        ...g,
        prezzo: Number(g.prezzo),   // 👈 conversione qui, una volta sola
      }) as GiochiModel))
    );
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
  // Nota: l'URL deve corrispondere a dove hai montato le libreriaRoute nel file index delle rotte
  return this.http.get<any[]>(`${this.baseUrl}/libreria`);
}
getListaUtenti(): Observable<any[]> {
  // Aggiunto /all per combaciare con router.get('/all', ...)
  return this.http.get<any[]>(`${this.baseUrl}/utenti/all`);
}

regalaGioco(idDestinatario: number, idGioco: number): Observable<any> {
  return this.http.post(`${this.baseUrl}/libreria/regala`, { idDestinatario, idGioco });
}
}
