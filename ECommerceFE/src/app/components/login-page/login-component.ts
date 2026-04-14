import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page-component',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {

  isLogin = true;

  form = {
    userid: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit() {
    const payload = {
      userid: this.form.userid,
      password: this.form.password
    };

    if (this.isLogin) {

      this.authService.login(payload).subscribe({
        next: (res: any) => {
          console.log('LOGIN SUCCESS:', res);

          // backend check (optional safety)
          if (res?.message === 'User not found') {
            console.log('Invalid credentials');
            return;
          }

          // optional: store user
          // localStorage.setItem('user', JSON.stringify(res));

          // redirect to home
          this.router.navigate(['/home']);
        },

        error: (err) => {
          console.log('LOGIN ERROR:', err);
        }
      });

    } else {
      console.log('REGISTER (not implemented yet)', this.form);
    }
  }
}