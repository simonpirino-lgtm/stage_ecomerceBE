import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Per *ngIf
import { FormsModule } from '@angular/forms';   // Per ngModel
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings-page',
  standalone: true, // Questo indica che il componente si gestisce da solo
  imports: [CommonModule, FormsModule], // AGGIUNGI QUESTI DUE QUI
  templateUrl: './settings-page.html',
  styleUrls: ['./settings-page.css']
})
export class SettingsPageComponent {
  userData = {
    newUserid: '',
    newPassword: ''
  };
  message = '';

  constructor(private authService: AuthService) {}

  saveChanges() {
    this.authService.updateProfile(this.userData).subscribe({
      next: (res) => {
        this.message = "Profilo aggiornato!";
      },
      error: (err) => {
        this.message = "Errore durante l'aggiornamento.";
      }
    });
  }
}