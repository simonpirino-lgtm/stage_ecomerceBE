import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { GiochiModel } from '../models/giochi-model';

@Injectable({ providedIn: 'root' })
export class GiochiAdminService {
  private http = inject(HttpClient);
private baseUrl = `${environment.apiUrl}/giochi`;

  create(payload: Partial<GiochiModel>) {
    return this.http.post<{ gioco: GiochiModel }>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<GiochiModel>) {
    return this.http.patch<{ gioco: GiochiModel }>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}