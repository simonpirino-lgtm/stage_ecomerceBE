import { Injectable, signal } from '@angular/core';

export type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info', durationMs = 3000) {
    const toast: Toast = { id: ++this.nextId, message, type };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== toast.id));
    }, durationMs);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error'); }
}