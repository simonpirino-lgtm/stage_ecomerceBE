import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { GiochiService } from '../../services/giochi-service';
import { GiochiAdminService } from '../../services/giochi-admin.service';
import { ToastService } from '../../services/toast.service';
import { GiochiModel } from '../../models/giochi-model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-giochi',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  templateUrl: './admin-giochi.html',
  styleUrl: './admin-giochi.css',
})
export class AdminGiochiComponent implements OnInit {
  private fb = inject(FormBuilder);
  private giochiService = inject(GiochiService);
  private adminService = inject(GiochiAdminService);
  private toast = inject(ToastService);

  giochi = signal<GiochiModel[]>([]);
  inEditing = signal<GiochiModel | null>(null);

  // ✅ NUOVA SEARCH
  search = signal('');

  // ✅ FILTRO REATTIVO
  giochiFiltrati = computed(() => {
    const term = this.search().toLowerCase();
    return this.giochi().filter(g =>
      g.titolo.toLowerCase().includes(term) ||
      g.sviluppatore.toLowerCase().includes(term)
    );
  });

  form = this.fb.nonNullable.group({
    titolo:        ['', Validators.required],
    prezzo:        [0, [Validators.required, Validators.min(0)]],
    datarilascio:  ['', Validators.required],
    sviluppatore:  ['', Validators.required],
    image_url:     ['', Validators.required],
    descrizione:   ['', Validators.required],
    game_url:      ['', Validators.required]
  });

  ngOnInit() {
    this.carica();
  }

  carica() {
    this.giochiService.getGiochi().subscribe(g => this.giochi.set(g));
  }

  onSubmit() {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue();
    const editing = this.inEditing();

    const obs = editing
      ? this.adminService.update(editing.id, payload)
      : this.adminService.create(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(editing ? 'Gioco aggiornato' : 'Gioco creato');
        this.form.reset();
        this.inEditing.set(null);
        this.carica();
      },
      error: () => this.toast.error('Errore salvataggio')
    });
  }

  modifica(g: GiochiModel) {
    this.inEditing.set(g);
    this.form.patchValue(g);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  elimina(g: GiochiModel) {
    if (!confirm(`Eliminare "${g.titolo}"?`)) return;
    this.adminService.remove(g.id).subscribe({
      next: () => { this.toast.success('Eliminato'); this.carica(); },
      error: () => this.toast.error('Errore eliminazione')
    });
  }

  annullaModifica() {
    this.inEditing.set(null);
    this.form.reset();
  }
}