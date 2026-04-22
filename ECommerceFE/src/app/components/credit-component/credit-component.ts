import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-credit-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './credit-component.html',
  styleUrl: './credit-component.css',
})

export class CreditComponent {
  amount: number = 0;
  message: string = '';

  constructor(private authService: AuthService) {}

  addCredit() {
    if (this.amount <= 0) {
      this.message = 'Inserisci un importo valido';
      return;
    }

    this.authService.addCredit(this.amount).subscribe({
      next: (res: any) => {
        this.message = 'Credito aggiornato: ' + res.credit;

        // aggiorna anche localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.credito = res.credito;
        localStorage.setItem('user', JSON.stringify(user));
      },
      error: () => {
        this.message = 'Errore durante aggiornamento';
      }
    });
  }
}
