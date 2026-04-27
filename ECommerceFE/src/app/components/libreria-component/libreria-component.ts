import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  private authService = inject(AuthService);

  mieigiochi = signal<any[]>([]);
  utenti = signal<any[]>([]);
  utenteSelezionato = signal<any>(null);
  isLoading = signal(true);

  // ✅ ORA DERIVA DA AUTH SERVICE (NO LOCALSTORAGE)
  user = this.authService.currentUser;

  ngOnInit(): void {
    this.caricaLibreria();
    this.caricaUtenti();
  }

  caricaLibreria() {
    this.isLoading.set(true);

    this.giochiService.getLibreria().subscribe({
      next: (res) => {
        this.mieigiochi.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Errore libreria:', err);
      }
    });
  }

  caricaUtenti() {
    this.giochiService.getListaUtenti().subscribe({
      next: (res) => {
        this.utenti.set(res);
      },
      error: (err) => console.error("Errore caricamento utenti:", err)
    });
  }

  eseguiRegalo(item: any) {
    const destinatario = this.utenteSelezionato();

    if (!destinatario) return;

    this.giochiService.regalaGioco(destinatario, item.id_gioco).subscribe({
      next: () => {
        alert("Gioco regalato con successo!");
        this.caricaLibreria();
      },
      error: (err) => {
        alert("Errore: " + (err.error?.error || "Impossibile regalare"));
      }
    });
  }

  scaricaGioco(gioco: any) {
    alert(`Avvio del download di: ${gioco.titolo}`);
  }
}