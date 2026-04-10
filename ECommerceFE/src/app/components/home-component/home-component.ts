import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiochiModel } from '../../models/giochi-model';
import { GiochiService } from '../../services/giochi-service';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
  giochiModel: GiochiModel[] = [];
  searchTerm: string = ''; 

  
  private giochiService = inject(GiochiService);
  private cdr = inject(ChangeDetectorRef);

  // Getter per filtrare i giochi in base alla textbox
  get giochiFiltrati() {
    return this.giochiModel.filter(gioco =>
      gioco.titolo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  ngOnInit() {
    this.giochiService.getGiochi().subscribe({
      next: (data) => {
        this.giochiModel = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Errore nel caricamento dati:", err)
    });
  }

  aggiungiAlCarrello(gioco: GiochiModel) {
    alert(`Aggiunto al carrello: ${gioco.titolo}`);
  }
}
