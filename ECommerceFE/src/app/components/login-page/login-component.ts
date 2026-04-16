import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page-component',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {

  isLogin = true;

  errorMessage = '';
  shake = false;

  form = {
    userid: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    this.form = { userid: '', password: '' };

    this.cd.detectChanges();
  }

  onSubmit() {
    this.errorMessage = '';
    this.cd.detectChanges();

    const payload = {
      userid: this.form.userid,
      password: this.form.password
    };

    if (this.isLogin) {
      // LOGIN
      this.authService.login(payload).subscribe({
        next: (res: any) => {
          if (!res || res?.message === 'User not found') {
            this.triggerError('Wrong username or password');
            return;
          }

          console.log('Saving user:', res);
          localStorage.setItem('user', JSON.stringify(res));
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.triggerError(err?.error?.message || 'Login failed');
        }
      });
    } else {
      // REGISTER
      this.authService.register(payload).subscribe({
        next: (res: any) => {
          if (!res) {
            // backend può ritornare null se utente esiste
            this.triggerError('User already exists');
            return;
          }
          if (res?.message === 'User already exists') {
            this.triggerError('User already exists');
            return;
          }

          console.log('User created successfully:', res);
          const userData = res.utente || res;
          localStorage.setItem('user', JSON.stringify(userData));
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.triggerError(err?.error?.message || 'Register failed');
        }
      });
    }
  }

  triggerError(message: string) {
    this.errorMessage = message;

    this.cd.detectChanges();

    // restart animation reliably
    this.shake = false;

    setTimeout(() => {
      this.shake = true;
      this.cd.detectChanges();

      setTimeout(() => {
        this.shake = false;
        this.cd.detectChanges();
      }, 400);
    });
  }
}