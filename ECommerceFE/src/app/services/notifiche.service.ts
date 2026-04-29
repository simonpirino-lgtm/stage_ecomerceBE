import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class NotificheService {

  private http = inject(HttpClient);

  notifiche = signal<any[]>([]);

  getNotifiche() {
    return this.http.get<any[]>('http://localhost:3000/api/v1/notifiche');
    }

  load() {
    this.getNotifiche().subscribe({
      next: (data) => this.notifiche.set(data),
      error: (err) => console.error(err)
    });
  }


  segnaComeLetta(id: number) {
    return this.http.patch(`http://localhost:3000/api/v1/notifiche/${id}`, {});
  }

  segnaTutte() {
    return this.http.patch(`http://localhost:3000/api/v1/notifiche`, {});
  }
}