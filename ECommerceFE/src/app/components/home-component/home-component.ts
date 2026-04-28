import { Component, inject, OnInit, HostListener, ViewChild, ElementRef, signal, computed, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiochiModel } from '../../models/giochi-model';
import { GiochiService } from '../../services/giochi-service';
import { Router } from '@angular/router';
import { CarrelloService } from '../../services/carrello.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { GiochiAdminService } from '../../services/giochi-admin.service';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-component.html',
  styleUrls: ['./home-component.css'],
})
export class HomeComponent implements OnInit {

  giochiModel = signal<GiochiModel[]>([]);
  searchTerm = signal('');
  transforms: { [id: number]: string } = {};

  maxPrice = signal(60);

  authService = inject(AuthService);
  cartCount = signal(0);

  isHovering = false;
  isLeaving = false;

  // ✅ ORA DERIVA DA AUTH SERVICE
  user = this.authService.currentUser;

  showMenu = false;
  isDark = false;
  selectedGenre = signal('');
  generi = signal<string[]>([]);
  @ViewChild('menuIcon') menuIcon!: ElementRef;

  isThemeChanging = false;

  private giochiService = inject(GiochiService);
  private carrelloService = inject(CarrelloService);
  private router = inject(Router);
  private renderer = inject(Renderer2);

  // 🔥 AGGIUNTA SOLO ADMIN SERVICE
  private giochiAdminService = inject(GiochiAdminService);

  constructor(public theme: ThemeService) {}

  ngOnInit() {
    this.theme.init();
    this.isDark = this.theme.isDark();

    const user = this.authService.currentUser();

    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    this.authService.getMe().subscribe({
      next: (res: any) => {
        const current = this.authService.currentUser();

        if (current) {
          const updatedUser = {
            ...current,
            credito: res.credito,
            role: res.role
          };

          this.authService.setCurrentUser(updatedUser);
        }
      },
      error: (err) => {
        console.error("Errore caricamento utente:", err);
      }
    });

    this.caricaCartCount();

    this.giochiService.getGiochi().subscribe({
      next: (data) => {
        this.giochiModel.set(data);
      }
    });

    this.giochiService.getNomeCategoria().subscribe({
      next: (categorie) => {
        this.generi.set(categorie);
      }
    });
  }

  giochiFiltrati = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.giochiModel()
      .filter(gioco =>
        gioco.titolo.toLowerCase().includes(term) &&
        gioco.prezzo <= this.maxPrice()
      )
      .sort((a, b) => b.prezzo - a.prezzo);
  });

  onCategoryChange(genre: string) {
    this.selectedGenre.set(genre);

    const request = genre
      ? this.giochiService.getGiochiCategoria(genre)
      : this.giochiService.getGiochi();

    request.subscribe({
      next: (data) => this.giochiModel.set(data),
      error: (err) => console.error(err)
    });
  }

  aggiungiAlCarrello(gioco: GiochiModel, imgElement: HTMLElement) {
    this.animateToCart(imgElement);

    const user = this.authService.currentUser();

    if (!user) return;

    this.carrelloService.aggiungi(user.id, gioco.id, 1).subscribe({
      next: () => this.caricaCartCount(),
      error: (err) => console.error("Errore carrello:", err)
    });
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.sidebar') && !target.closest('.menu-icon')) {
      this.showMenu = false;
    }
  }

  goToProfile() { this.router.navigate(['/account']); this.showMenu = false; }
  goToCart() { this.router.navigate(['/carrello']); this.showMenu = false; }
  goToCredit() { this.router.navigate(['/credito']); }
  logout() { this.authService.logout(); }
  goToLibrary() { this.router.navigate(['/libreria']); this.showMenu = false; }

  caricaCartCount() {
    const user = this.authService.currentUser();

    if (!user) return;

    this.carrelloService.getTotaleArticoli(user.id).subscribe({
      next: (res: any) => this.cartCount.set(res.totaleArticoli || 0),
      error: (err) => console.error(err)
    });
  }

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

  animateToCart(img: HTMLElement) {
    const rect = img.getBoundingClientRect();
    const menuIconEl = this.menuIcon.nativeElement;
    const cartRect = menuIconEl.getBoundingClientRect();

    const clone = this.renderer.createElement('img');

    this.renderer.setAttribute(clone, 'src', (img as HTMLImageElement).src);
    this.renderer.addClass(clone, 'flying-image');

    this.renderer.setStyle(clone, 'top', rect.top + 'px');
    this.renderer.setStyle(clone, 'left', rect.left + 'px');
    this.renderer.setStyle(clone, 'width', rect.width + 'px');
    this.renderer.setStyle(clone, 'height', rect.height + 'px');

    this.renderer.appendChild(document.body, clone);

    this.renderer.addClass(menuIconEl, 'magnet');

    setTimeout(() => {
      this.renderer.setStyle(clone, 'top', cartRect.top + 'px');
      this.renderer.setStyle(clone, 'left', cartRect.left + 'px');
      this.renderer.setStyle(clone, 'width', '30px');
      this.renderer.setStyle(clone, 'height', '30px');
      this.renderer.setStyle(clone, 'opacity', '0.5');

      this.renderer.addClass(menuIconEl, 'pulse');
    }, 10);

    setTimeout(() => {
      this.renderer.removeChild(document.body, clone);
      this.renderer.addClass(menuIconEl, 'vibrate');

      setTimeout(() => {
        this.renderer.removeClass(menuIconEl, 'vibrate');
        this.renderer.removeClass(menuIconEl, 'pulse');
        this.renderer.removeClass(menuIconEl, 'magnet');
      }, 300);
    }, 700);
  }

  @ViewChild('titleEl') titleEl!: ElementRef;

  onHover(event: MouseEvent) {
    this.isHovering = true;
    this.isLeaving = false;
    this.onMoveTitle(event);
  }

  onLeave() {
    this.isHovering = false;
    this.isLeaving = true;
  }

  onMoveTitle(event: MouseEvent) {
    if (!this.isHovering) return;

    const el = this.titleEl.nativeElement;
    const rect = el.getBoundingClientRect();
    const mouseX = event.clientX;
    const centerX = rect.left + rect.width / 2;

    if (mouseX > centerX) {
      el.classList.remove('spin-left');
      el.classList.add('spin-right');
    } else {
      if (!el.classList.contains('spin-left')) {
        el.classList.remove('spin-right');
        el.classList.add('spin-left');
      }
    }
  }

  showPriceFilter = false;

  togglePriceFilter() {
    this.showPriceFilter = !this.showPriceFilter;
  }

  toggleTheme() {
    this.renderer.addClass(document.body, 'theme-switching');

    setTimeout(() => {
      this.isDark = this.theme.toggle();
    }, 150);

    setTimeout(() => {
      this.renderer.removeClass(document.body, 'theme-switching');
    }, 650);
  }

  // 🔥 ADMIN CHECK (AGGIUNTA MINIMA)
  get isAdmin(): boolean {
    return this.authService.currentUser()?.role === 'admin';
  }

  // 🔥 ADMIN ACTIONS (AGGIUNTE)
  modifica(g: GiochiModel) {
    if (!this.isAdmin) return;

    this.router.navigate(['/admin/giochi'], {
      state: { gioco: g }
    });
  }

  elimina(g: GiochiModel) {
    if (!this.isAdmin) return;

    if (!confirm(`Eliminare ${g.titolo}?`)) return;

    this.giochiAdminService.remove(g.id).subscribe({
      next: () => {
        this.giochiModel.update(list =>
          list.filter(x => x.id !== g.id)
        );
      },
      error: (err) => console.error(err)
    });
  }

  goToAdmin() {
    this.router.navigate(['/admin/giochi']);
  }
}