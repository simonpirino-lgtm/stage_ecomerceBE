import { ChangeDetectorRef, Component, Injectable, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'
import { GiochiService } from '../../services/giochi-service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-libreria',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './libreria-component.html',
  styleUrls: ['./libreria-component.css']
})
@Injectable({
  providedIn: 'root'
})
export class LibreriaComponent implements OnInit {
  private giochiService = inject(GiochiService);
  private cdr = inject(ChangeDetectorRef)

  user: any = null;
  
  mieigiochi: any[] = [];
  isLoading: boolean = true; // Per mostrare un eventuale loader
  
  constructor(private authService: AuthService, public theme: ThemeService) {}


  ngOnInit(): void {
    this.theme.init();
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    // opzionale ma consigliato: refresh dati backend
    this.authService.getMe().subscribe({
      next: (res: any) => {
        this.user.credito = res.credito;
        localStorage.setItem('user', JSON.stringify(this.user));
      },
      error: (err) => console.error(err)
    });
    this.authService.initAuth().subscribe();
    this.caricaLibreria();
  }

  caricaLibreria() {
    this.isLoading = true;
    this.giochiService.getLibreria().subscribe({
      next: (res) => {
        this.mieigiochi = res;
        this.isLoading = false;
        console.log('Giochi caricati:', res);
        this.cdr.detectChanges();

      },
      error: (err) => {
        this.isLoading = false;
        console.error('Errore libreria:', err);
      }
    });
  }

  // Metodo per il pulsante Scarica/Gioca
  scaricaGioco(gioco: any) {
    alert(`Avvio del download di: ${gioco.titolo}`);
    // Qui in futuro potrai aggiungere la logica per aprire un link o cambiare stato
  }
}