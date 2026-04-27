import { ChangeDetectorRef, Component, Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})

export class CreditComponent {
  amount: number = 0;
  message: string = '';
  currentCredit: number = 0;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
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
        
      }
    });
  } */
  loading = true;
  loadCredit() {
    //this.loading = true;

    this.authService.getMe().subscribe({
      next: (res: any) => {
        this.currentCredit = res.credito;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
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
       

        this.currentCredit = res.credito;
        this.message = 'Credito aggiornato: ' + res.credito;

        this.amount = 0;

        this.loadCredit();

        // 🔥 forza aggiornamento UI
        this.cdr.detectChanges();
      },
      error: (err) => {
       
        this.message = 'Errore durante aggiornamento';
      }
    });
  }
}