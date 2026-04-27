import { Component, OnInit, inject, signal } from '@angular/core';
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
  //private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  
  mieigiochi = signal<any[]>([]);
  utenti = signal<any[]>([]);
  utenteSelezionato = signal<any>(null);
  isLoading = signal(true);
  user: any = null;

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) this.user = JSON.parse(storedUser);

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

// Metodo per caricare gli utenti (chiamalo nel ngOnInit)
caricaUtenti() {
  this.giochiService.getListaUtenti().subscribe({
    next: (res) => {
      console.log("Utenti ricevuti:", res);
      this.utenti.set(res);
    },
    error: (err) => console.error("Errore caricamento utenti:", err)
  });
}

eseguiRegalo(item: any) {
  if (!this.utenteSelezionato) return;

  this.giochiService.regalaGioco(this.utenteSelezionato(), item.id_gioco).subscribe({
    next: (res) => {
      alert("Gioco regalato con successo!");
      this.caricaLibreria(); // Ricarica per aggiornare le quantità
    },
    error: (err) => alert("Errore: " + (err.error?.error || "Impossibile regalare"))
  });
}

  scaricaGioco(gioco: any) {
    alert(`Avvio del download di: ${gioco.titolo}`);
  }
}