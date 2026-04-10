import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { GiochiModel } from '../../models/giochi-model';
import { GiochiService } from '../../services/giochi-service';

@Component
({
  selector: 'app-home-component',
  imports: [],
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
      this.giochiService.getGiochi().subscribe((data) => 
      {
        this.giochiModel = data;
        this.cdr.detectChanges();
      });
    }
}
