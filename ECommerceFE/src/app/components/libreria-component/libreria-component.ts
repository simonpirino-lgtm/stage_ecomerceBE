import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // FONDAMENTALE PER ngModel
import { GiochiService } from '../../services/giochi-service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-libreria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './libreria-component.html',
  styleUrls: ['./libreria-component.css']
})
export class LibreriaComponent implements OnInit {
  private giochiService = inject(GiochiService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  
  mieigiochi: any[] = [];
  utenti: any[] = []; // Inizializzalo sempre come array vuoto
  utenteSelezionato: any = null;
  user: any = null;
  isLoading: boolean = true;

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) this.user = JSON.parse(storedUser);

    this.caricaLibreria();
    this.caricaUtenti();
  }

  caricaLibreria() {
    this.isLoading = true;
    this.giochiService.getLibreria().subscribe({
      next: (res) => {
        this.mieigiochi = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Errore libreria:', err);
      }
    });
  }

    caricaUtenti() {
    this.giochiService.getListaUtenti().subscribe({
      next: (res) => {
        this.utenti = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Log specific details: status code and the message from the server
        console.error(`Error Code: ${err.status}\nMessage: ${err.message}`);
        if (err.error) console.error("Server Body:", err.error);
      }
    });
  }

  eseguiRegalo(item: any) {
    if (!this.utenteSelezionato) {
      alert("Seleziona un utente prima di regalare!");
      return;
    }

    const confirmRegalo = confirm(`Vuoi regalare una copia di ${item.gioco.titolo}?`);
    if (!confirmRegalo) return;

    // Chiamata al service (implementazione sotto)
    this.giochiService.regalaGioco(this.utenteSelezionato, item.gioco.id).subscribe({
      next: () => {
        alert("Regalo inviato!");
        this.caricaLibreria(); // Aggiorna la tabella (quantità diminuirà)
      },
      error: (err) => alert("Errore: " + (err.error?.message || "Impossibile regalare"))
    });
  }

  scaricaGioco(gioco: any) {
    alert(`Avvio del download di: ${gioco.titolo}`);
  }
}