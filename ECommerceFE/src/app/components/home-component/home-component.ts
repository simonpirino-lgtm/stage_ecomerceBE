import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { GiochiModel } from '../../models/giochi-model';
import { GiochiService } from '../../services/giochi-service';
import { CommonModule } from '@angular/common';

@Component
({
  selector: 'app-home-component',
  imports: [CommonModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent
{
   giochiModel : GiochiModel[] = [];
   private giochiService = inject(GiochiService);
   private cdr = inject(ChangeDetectorRef);
    ngOnInit()
    {
     this.giochiService.getGiochi().subscribe({
        next: (data) => {
          console.log('Dati ricevuti:', data);
          this.giochiModel = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Errore nel caricamento:', err)
      });
    }
}
