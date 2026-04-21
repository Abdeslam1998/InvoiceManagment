import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppInput } from '../../shared/ui/input/input';
import { AppButton } from '../../shared/ui/button/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, AppInput, AppButton],
  templateUrl: './login.html'
})
export class Login {
  email = '';
  password = '';
  error = '';
  loading = false;
  
  private authService = inject(AuthService);
  private router = inject(Router);

  submit() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }
    
    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Email ou mot de passe incorrect';
        console.error(err);
      }
    });
  }
}
