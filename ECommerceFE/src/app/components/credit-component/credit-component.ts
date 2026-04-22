import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-credit-component',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './credit-component.html',
  styleUrl: './credit-component.css',
})

export class CreditComponent {
  amount: number = 0;
  message: string = '';
  currentCredit: number = 0;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCredit();
  }

  loadCredit() {
    this.authService.getMe().subscribe({
      next: (res: any) => {
        this.currentCredit = res.credito;
      },
      error: (err) => {
        console.log("Errore caricamento credito", err);
      }
    });
  }

  addCredit() {
    if (this.amount <= 0) {
      this.message = 'Inserisci un importo valido';
      return;
    }

    this.authService.addCredit(this.amount).subscribe({
      next: (res: any) => {
        console.log("RISPOSTA BACKEND:", res);

        this.currentCredit = res.credito;
        this.message = 'Credito aggiornato: ' + res.credito;

        this.amount = 0;

        // 🔥 forza aggiornamento UI
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log("ERRORE BACKEND:", err);
        this.message = 'Errore durante aggiornamento';
      }
    });
  }
}