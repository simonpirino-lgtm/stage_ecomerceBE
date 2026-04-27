import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'toast-component.ts',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast" [class]="t.type">{{ t.message }}</div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 1rem; right: 1rem; z-index: 9999; }
    .toast { padding: .8rem 1.2rem; margin-bottom: .5rem; border-radius: .4rem; color: #fff; }
    .toast.success { background: #2e7d32; }
    .toast.error   { background: #c62828; }
    .toast.info    { background: #1565c0; }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}

