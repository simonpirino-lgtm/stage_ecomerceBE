import { Component, OnInit, ChangeDetectorRef, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css'
})
@Injectable({
  providedIn: 'root'
})
export class SettingsPageComponent implements OnInit {
  
  userData = {
    oldUserid: '',
    oldPassword: '',
    newUserid: '',
    newPassword: ''
  };

  message = '';
  isError = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    public theme: ThemeService
  ) {}

  

  ngOnInit() {
    this.theme.init();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Usiamo 'userid' o 'id' in base a come lo salva il tuo login
      this.userData.oldUserid = user.userid || user.id || ''; 
    }
  }

  saveChanges() {
    this.message = '';
    this.isError = false;

    if (!this.userData.oldPassword || !this.userData.newPassword) {
      this.message = 'Inserisci le password per continuare';
      this.isError = true;
      return;
    }

    // 1. Verifichiamo se la vecchia password è corretta usando il servizio login
    this.authService.login(this.userData.oldUserid, this.userData.oldPassword).subscribe({
      next: (res: any) => {
        if (!res || res?.message === 'User not found') {
          this.message = 'Password attuale errata!';
          this.isError = true;
        } else {
          // 2. Se il login di prova ha successo, aggiorniamo il profilo
          this.message = 'Identità confermata! Salvataggio in corso...';
          this.isError = false;
          
          // Prepara i dati per l'update (solo i campi che sono stati modificati)
          const updateData: { newUserid?: string; newPassword?: string } = {};
          
          if (this.userData.newUserid && this.userData.newUserid !== this.userData.oldUserid) {
            updateData.newUserid = this.userData.newUserid;
          }
          
          if (this.userData.newPassword) {
            updateData.newPassword = this.userData.newPassword;
          }

          // 3. Chiama il metodo di update del profilo
          this.authService.updateProfile(updateData).subscribe({
            next: (updateRes: any) => {
              this.message = 'Profilo aggiornato con successo!';
              this.isError = false;
              
              // Aggiorna il localStorage se il userid è cambiato
              if (updateData.newUserid) {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                  const user = JSON.parse(savedUser);
                  user.userid = updateData.newUserid;
                  localStorage.setItem('user', JSON.stringify(user));
                  this.userData.oldUserid = updateData.newUserid; // Aggiorna anche il campo oldUserid
                }
              }
              
              // Resetta i campi di input (eccetto oldUserid)
              this.userData.newUserid = '';
              this.userData.newPassword = '';
              this.userData.oldPassword = '';
              
              this.cd.detectChanges();

              // logout
              setTimeout(() => {
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                this.router.navigate(['/']);
              }, 1000);
            },
            error: (updateErr: any) => {
              if (updateErr.status === 409) {
                this.message = 'Username già esistente!';
              } else {
                this.message = 'Errore durante l\'aggiornamento del profilo';
              }
              this.isError = true;
            }
          });
        }
      },
      error: () => {
        this.message = 'Errore di verifica credenziali';
        this.isError = true;
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}