import { ChangeDetectorRef, Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiochiModel } from '../../models/giochi-model';
import { GiochiService } from '../../services/giochi-service';
import { Router, RouterLink } from '@angular/router';
import { CarrelloService } from '../../services/carrello.service';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
  // Dati e Stato
  giochiModel: GiochiModel[] = [];
  searchTerm: string = '';
  transforms: { [id: number]: string } = {};
  user: any = null;
  showMenu = false;

  // Injection
  private giochiService = inject(GiochiService);
  private carrelloService = inject(CarrelloService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  // Getter per la ricerca in tempo reale
  get giochiFiltrati() {
    return this.giochiModel.filter(gioco =>
      gioco.titolo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  ngOnInit() {
    // Controllo Sessione Utente
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    } else {
      this.router.navigate(['/']); 
      return;
    }

    // Caricamento Giochi dal Database
    this.giochiService.getGiochi().subscribe({
      next: (data: GiochiModel[]) => {
        this.giochiModel = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error("Errore nel caricamento dati:", err)
    });
  }

  /**
   * AGGIUNGI AL CARRELLO
   * Invia i dati al backend. La logica di incremento quantità
   * è gestita interamente dal server.
   */
  // Prima (sbagliato):
// this.carrelloService.aggiungi(gioco.id).subscribe(...)

// Dopo (corretto):
aggiungiAlCarrello(gioco: GiochiModel) {
  // Passiamo SIA l'id CHE il prezzo come richiesto dal service
  this.carrelloService.aggiungi(gioco.id, gioco.prezzo).subscribe({
    next: (res) => {
      console.log('Prodotto aggiunto:', res);
      alert(`${gioco.titolo} aggiunto al carrello!`);
    },
    error: (err) => console.error("Errore aggiunta carrello:", err)
  });
}

  // --- GESTIONE UI & ANIMAZIONI ---

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  @HostListener('document:click')
  closeMenu() {
    this.showMenu = false;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.showMenu = false;
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  onMouseEnter(event: MouseEvent, gioco: GiochiModel) {
    this.transforms[gioco.id] = 'scale(1.1)';
  }

  onMouseMove(event: MouseEvent, gioco: GiochiModel) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    this.transforms[gioco.id] =
      `scale(1.1) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  onMouseLeave(gioco: GiochiModel) {
    delete this.transforms[gioco.id];
  }
}