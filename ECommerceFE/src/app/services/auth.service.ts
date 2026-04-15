import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.baseUrl}/api/v1/auth/login`, data);
  }

  register(data: any) {
    return this.http.post(`${this.baseUrl}/api/v1/auth/register`, data);
  }
}