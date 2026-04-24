import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiochiService } from '../../services/giochi-service';
import { GiochiModel } from '../../models/giochi-model';

@Component({
  selector: 'app-libreria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './libreria-component.html',
  styleUrls: ['./libreria-component.css']
})
export class LibreriaComponent implements OnInit {
  private giochiService = inject(GiochiService);
  
  // Usiamo un array di any perché la libreria restituisce l'oggetto Libreria + l'oggetto Gioco joinato
  mieigiochi: any[] = [];

  ngOnInit(): void {
    this.caricaLibreria();
  }

  caricaLibreria() {
    this.giochiService.getLibreria().subscribe({
      next: (res) => {
        this.mieigiochi = res;
        console.log('Giochi in libreria:', res);
      },
      error: (err) => {
        console.error('Errore nel recupero della libreria:', err);
      }
    });
  }
}