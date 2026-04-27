import { ChangeDetectorRef, Component, Injectable, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-credit-component',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './credit-component.html',
  styleUrl: './credit-component.css',
})

export class CreditComponent {
  amount = signal(0);
  message = signal('');
  currentCredit = signal(0);
  loading = signal(true);

  constructor(
    private authService: AuthService,
    //private cdr: ChangeDetectorRef,
    public theme: ThemeService
  ) {}

  ngOnInit() {
    this.theme.init();
    this.loadCredit();
  }

  /* loadCredit() {
    this.authService.getMe().subscribe({
      next: (res: any) => {
        this.currentCredit = res.credito;
      },
      error: (err) => {
        console.log("Errore caricamento credito", err);
      }
    });
  } */
  loadCredit() {
    //this.loading = true;

    this.authService.getMe().subscribe({
      next: (res: any) => {
        this.currentCredit.set(res.credito);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  addCredit() {
    if (this.amount() <= 0) {
      this.message.set('Inserisci un importo valido');
      return;
    }

    this.authService.addCredit(this.amount()).subscribe({
      next: (res: any) => {
        console.log("RISPOSTA BACKEND:", res);

        this.currentCredit.set(res.credito);
        this.message.set('Credito aggiornato: ' + res.credito);

        this.amount.set(0);

        this.loadCredit();

        // 🔥 forza aggiornamento UI
        //this.cdr.detectChanges();
      },
      error: (err) => {
        console.log("ERRORE BACKEND:", err);
        this.message.set('Errore durante aggiornamento');
      }
    });
  }
}