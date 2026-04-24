import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiochiService } from '../../services/giochi-service';

@Component({
  selector: 'app-libreria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './libreria-component.html',
  styleUrls: ['./libreria-component.css']
})
export class LibreriaComponent implements OnInit {
  private giochiService = inject(GiochiService);
  
  mieigiochi: any[] = [];
  isLoading: boolean = true; // Per mostrare un eventuale loader

  ngOnInit(): void {
    this.caricaLibreria();
  }

  caricaLibreria() {
    this.isLoading = true;
    this.giochiService.getLibreria().subscribe({
      next: (res) => {
        this.mieigiochi = res;
        this.isLoading = false;
        console.log('Giochi caricati:', res);
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