import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { GiochiModel } from '../models/giochi-model';
import { HttpClient } from '@angular/common/http';

@Injectable
({
  providedIn: 'root',
})
export class GiochiService 
{
  private http = inject(HttpClient);

  getGiochi() : Observable <GiochiModel[]>

  {
    return this.http.get<GiochiModel[]>('http://localhost:3000/api/v1/giochi');
  }
}
