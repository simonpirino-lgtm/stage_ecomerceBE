import { ChangeDetectorRef, Component, inject, OnInit, HostListener, ViewChild, ElementRef, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiochiModel } from '../../models/giochi-model';
import { GiochiService } from '../../services/giochi-service';
import { Router } from '@angular/router';
import { CarrelloService } from '../../services/carrello.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-component.html',
  styleUrls: ['./home-component.css'],
})

@Injectable({
  providedIn: 'root'
})


export class HomeComponent implements OnInit {

  giochiModel: GiochiModel[] = [];
  searchTerm: string = '';
  transforms: { [id: number]: string } = {};

  private authService = inject(AuthService);

  cartCount: number = 0;

  isHovering = false;
  isLeaving = false;

  user: any = null;
  showMenu = false;

  isDark = false;

  selectedGenre: string = '';
  generi: string[] = [];

  menuIcon!: HTMLElement;

  private giochiService = inject(GiochiService);
  private carrelloService = inject(CarrelloService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  constructor(public theme: ThemeService) {}
  
  ngOnInit() {    
    this.theme.init();
    this.isDark = this.theme.isDark();

    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
    } else {
      this.router.navigate(['/']);
      return;
    }

    // 🔥 NUOVO: ricarica dati freschi dal backend
    this.authService.getMe().subscribe({
      next: (res: any) => {
        this.user.credito = res.credito;

        // 🔥 aggiorna anche localStorage
        localStorage.setItem('user', JSON.stringify(this.user));
      },
      error: (err) => {
        console.log("Errore getMe:", err);
      }
    });

    this.caricaCartCount();

    this.menuIcon = document.querySelector('.menu-icon') as HTMLElement;

    this.giochiService.getGiochi().subscribe({
      next: (data: GiochiModel[]) => {
        this.giochiModel = data;
        this.cdr.detectChanges();
      }
    });

    this.giochiService.getNomeCategoria().subscribe({
      next: (categorie: string[]) => {
        this.generi = categorie;
      }
    });
  }

  get giochiFiltrati() {
    const term = this.searchTerm.toLowerCase().trim();

    return this.giochiModel.filter(gioco =>
      gioco.titolo.toLowerCase().includes(term)
    );
  }

  onCategoryChange(genre: string) {
    this.selectedGenre = genre;

    const request = genre
      ? this.giochiService.getGiochiCategoria(genre)
      : this.giochiService.getGiochi();

    request.subscribe({
      next: (data) => {
        this.giochiModel = data;
        this.cdr.detectChanges(); // opzionale ma utile
      },
      error: (err) => console.error(err)
    });
  }

  /* -------------------------
     CARRELLO
  -------------------------- */
  aggiungiAlCarrello(gioco: GiochiModel, imgElement: HTMLElement) {
    this.animateToCart(imgElement);

    this.carrelloService.aggiungi(this.user.id, gioco.id, 1).subscribe({
      next: (res) => {
        /* console.log('Prodotto aggiunto:', res); */
        this.caricaCartCount();
      },
      error: (err) => console.error("Errore aggiunta carrello:", err)
    });
  }

  /* -------------------------
     MENU TOGGLE
  -------------------------- */
  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const target = event.target as HTMLElement;

    if (target.closest('.sidebar') || target.closest('.menu-icon')) {
      return;
    }

    this.showMenu = false;
  }

  /* -------------------------
     NAV
  -------------------------- */
  goToProfile() {
    this.router.navigate(['/account']);
    this.showMenu = false;
  }

  goToCart() {
    this.router.navigate(['/carrello']);
    this.showMenu = false;
  }

  goToCredit() {
    this.router.navigate(['/credito'])
  }

  logout() {
    localStorage.removeItem('user');
    this.authService.logout();
  }

  /* -------------------------
     HOVER EFFECT
  -------------------------- */
  onMouseEnter(event: MouseEvent, gioco: GiochiModel) {
    this.transforms[gioco.id] = 'scale(1.2)';
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

  /* -------------------------
     ANIMAZIONE CARRELLO
  -------------------------- */
  animateToCart(img: HTMLElement) {

    const rect = img.getBoundingClientRect();
    const menuIcon = this.menuIcon;
    const cartRect = menuIcon.getBoundingClientRect();

    const clone = img.cloneNode(true) as HTMLElement;
    clone.classList.add('flying-image');

    clone.style.top = rect.top + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';

    document.body.appendChild(clone);

    menuIcon.classList.add('magnet');

    setTimeout(() => {
      clone.style.top = cartRect.top + 'px';
      clone.style.left = cartRect.left + 'px';
      clone.style.width = '30px';
      clone.style.height = '30px';
      clone.style.opacity = '0.5';
      clone.style.filter = 'brightness(0.6)';

      menuIcon.classList.add('pulse');
    }, 10);

    setTimeout(() => {
      clone.remove();

      this.createBurst(cartRect);

      menuIcon.classList.add('vibrate');

      setTimeout(() => {
        menuIcon.classList.remove('vibrate');
        menuIcon.classList.remove('pulse');
        menuIcon.classList.remove('magnet');
      }, 300);

    }, 700);
  }

  createBurst(rect: DOMRect) {
    const burst = document.createElement('div');
    burst.classList.add('cart-burst');

    burst.style.top = rect.top + rect.height / 2 - 80 + 'px';
    burst.style.left = rect.left + rect.width / 2 - 80 + 'px';

    document.body.appendChild(burst);

    setTimeout(() => burst.remove(), 600);
  }

  caricaCartCount() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    this.carrelloService.getTotaleArticoli(user.id).subscribe({
      next: (res: any) => {
        this.cartCount = res.totaleArticoli || 0;
      },
      error: (err) => console.error(err)
    });
  }

  @ViewChild('titleEl') titleEl!: ElementRef;


  onHover(event: MouseEvent) {
    this.isHovering = true;
    this.isLeaving = false;

    this.onMoveTitle(event); // imposta subito direzione corretta
  }

  onLeave() {
    this.isHovering = false;
    this.isLeaving = true;
  }

  onMoveTitle(event: MouseEvent) {
    if (!this.isHovering) return; // 🔥 BLOCCO fondamentale

    const el = this.titleEl.nativeElement;
    const rect = el.getBoundingClientRect();

    const mouseX = event.clientX;
    const centerX = rect.left + rect.width / 2;

    if (mouseX > centerX) {
      if (!el.classList.contains('spin-right')) {
        el.classList.remove('spin-left');
        el.classList.add('spin-right');
      }
    } else {
      if (!el.classList.contains('spin-left')) {
        el.classList.remove('spin-right');
        el.classList.add('spin-left');
      }
    }
  }

  ngAfterViewInit() {
    const el = this.titleEl.nativeElement;

    el.addEventListener('animationiteration', () => {
      if (this.isLeaving) {
        el.classList.remove('spin-left', 'spin-right');
        this.isLeaving = false;
      }
    });
  }
}