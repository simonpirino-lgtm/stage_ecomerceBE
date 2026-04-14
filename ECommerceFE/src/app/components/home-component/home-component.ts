import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiochiModel } from '../../models/giochi-model';
import { GiochiService } from '../../services/giochi-service';
import { CarrelloService } from '../../services/carrello.service'; // 1. Importa il service
import { RouterLink } from '@angular/router';

@Component
({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit 
{
  giochiModel: GiochiModel[] = [];
  searchTerm: string = ''; 
  transforms: { [id: number]: string } = {};

  private giochiService = inject(GiochiService);
  private carrelloService = inject(CarrelloService); // 2. Iniettalo qui con inject
  private cdr = inject(ChangeDetectorRef);

  get giochiFiltrati() 
  {
    return this.giochiModel.filter(gioco =>
      gioco.titolo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  ngOnInit() 
  {
    this.giochiService.getGiochi().subscribe({
      next: (data: GiochiModel[]) => {
        this.giochiModel = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error("Errore nel caricamento dati:", err)
    });
  }

  aggiungiAlCarrello(gioco: GiochiModel) 
  {
    // 3. Ora this.carrelloService è riconosciuto
    this.carrelloService.aggiungi(gioco).subscribe
    ({
      next: (res: any) => 
      { // Aggiunto il tipo :any per evitare l'errore implicit any
        alert('Gioco aggiunto al carrello!');
      },
      error: (err: any) => console.error("Il server non ha salvato:", err)
    });
  }

  onMouseEnter(event: MouseEvent, gioco: GiochiModel) 
  {
    this.transforms[gioco.id] = 'scale(1.2)';
  }

  onMouseMove(event: MouseEvent, gioco: GiochiModel) 
  {
    const target = event.currentTarget as HTMLElement; // Meglio usare currentTarget per il rect
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    this.transforms[gioco.id] = `scale(1.2) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  onMouseLeave(gioco: GiochiModel) 
  {
    delete this.transforms[gioco.id];
  }
}
