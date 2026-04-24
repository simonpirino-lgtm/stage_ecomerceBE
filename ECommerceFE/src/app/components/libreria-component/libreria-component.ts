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

// Metodo per caricare gli utenti (chiamalo nel ngOnInit)
caricaUtenti() {
  this.giochiService.getListaUtenti().subscribe({
    next: (res) => {
      console.log("Utenti ricevuti:", res);
      this.utenti = res; 
      this.cdr.detectChanges(); // Forza Angular a vedere i nuovi dati nella select
    },
    error: (err) => console.error("Errore caricamento utenti:", err)
  });
}

eseguiRegalo(item: any) {
  if (!this.utenteSelezionato) return;

  this.giochiService.regalaGioco(this.utenteSelezionato, item.id_gioco).subscribe({
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