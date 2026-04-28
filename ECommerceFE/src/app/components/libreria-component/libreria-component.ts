import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiochiService } from '../../services/giochi-service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-libreria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterModule],
  templateUrl: './libreria-component.html',
  styleUrls: ['./libreria-component.css']
})
export class LibreriaComponent implements OnInit {

  private giochiService = inject(GiochiService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  mieigiochi = signal<any[]>([]);
  utenti = signal<any[]>([]);
  //utenteSelezionato = signal<any>(null);
  utenteSelezionato: Record<number, number | null> = {};
  isLoading = signal(true);

  // ✅ ORA DERIVA DA AUTH SERVICE (NO LOCALSTORAGE)
  user = this.authService.currentUser;

  constructor(public theme: ThemeService) {}

  ngOnInit(): void {
    this.theme.init();
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
  const destinatario = this.utenteSelezionato[item.id];
  if (!destinatario) return;

  const conferma = confirm("Sei sicuro di voler regalare questo gioco?");
  if (!conferma) return;

    this.giochiService.regalaGioco(destinatario, item.id_gioco).subscribe({
        next: () => {
          this.toastService.success("Gioco regalato con successo!");
          this.caricaLibreria();
        },
        error: (err) => {
          this.toastService.error("Errore: " + (err.error?.error || "Impossibile regalare"));
        }
    });
}

  scaricaGioco(gioco: any) {
    //this.toastService.success(`Avvio del download di: ${gioco.titolo}`);
    window.location.href = gioco.game_url;
  }

  getUtentiRegalabiliPerGioco(idGioco: number) {
    return this.utenti().filter(u => 
      !u.Libreria || !u.Libreria.some((l: { id_gioco: number }) => l.id_gioco === idGioco)
    );
  }
}