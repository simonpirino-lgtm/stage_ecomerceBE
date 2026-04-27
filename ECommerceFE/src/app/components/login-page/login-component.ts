import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login-page-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})



export class LoginComponent {

  isLogin = signal(true);
  errorMessage = signal('');
  shake = signal(false);

  form = {
    userid: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    //private cd: ChangeDetectorRef,
    private theme: ThemeService
  ) {}

  


  ngOnInit() {
    this.theme.init();
  }

  toggleMode() {
    this.isLogin.update(v => !v);
    this.errorMessage.set('');
    this.form = { userid: '', password: '' };

    //this.cd.detectChanges();
  }

  onSubmit() {
    this.errorMessage.set('');
    //this.cd.detectChanges();

    const payload = {
      userid: this.form.userid,
      password: this.form.password
    };

    if (this.isLogin()) {
      // LOGIN
      this.authService.login(this.form.userid, this.form.password).subscribe({
        next: (res: any) => {
          // Se arriva qui, il login è riuscito
          console.log('Login successful:', res);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.router.navigate(['/home']);
        },
        error: (err) => {
          // Gestione degli errori (401, 500, ecc.)
          console.log('Login error:', err);
          if (err.status === 401) {
            this.triggerError('Username o password errati');
          } else {
            this.triggerError(err?.error?.message || 'Errore di login');
          }
        }
      });
    } else {
      // REGISTER
      this.authService.register(this.form.userid, this.form.password).subscribe({
        next: (res: any) => {
          console.log('Register response:', res);
          if (!res) {
            this.triggerError('Errore durante la registrazione');
            return;
          }
          if (res?.message === 'User already exists') {
            this.triggerError('Utente già esistente');
            return;
          }

          // Registrazione riuscita
          const userData = res.utente || res;
          localStorage.setItem('user', JSON.stringify(userData));
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.log('Register error:', err);
          if (err.status === 409) {
            this.triggerError('Utente già esistente');
          } else {
            this.triggerError(err?.error?.message || 'Errore di registrazione');
          }
        }
      });
    }
  }

  triggerError(message: string) {
    this.errorMessage.set(message);

    //this.cd.detectChanges();

    // restart animation reliably
    this.shake.set(false);

    setTimeout(() => {
      this.shake.set(true);
      //this.cd.detectChanges();

      setTimeout(() => {
        this.shake.set(false);
        //this.cd.detectChanges();
      }, 400);
    });
  }
}