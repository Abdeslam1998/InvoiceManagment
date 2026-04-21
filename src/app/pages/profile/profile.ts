import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AppInput } from '../../shared/ui/input/input';
import { AppButton } from '../../shared/ui/button/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AppInput, AppButton],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  profile = {
    email: '',
    responsibleName: '',
    companyName: '',
    address: '',
    phone: ''
  };
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  passwordSuccessMessage = '';
  showPasswordForm = false;
  loading = true;
  successMessage = '';

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = { ...this.profile, ...data };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        this.loading = false;
      }
    });
  }

  private validatePasswordChange(): boolean {
    this.passwordError = '';

    if (!this.oldPassword && !this.newPassword && !this.confirmPassword) {
      return true;
    }

    if (!this.oldPassword) {
      this.passwordError = 'Veuillez saisir votre mot de passe actuel.';
      return false;
    }

    if (!this.newPassword) {
      this.passwordError = 'Veuillez saisir le nouveau mot de passe.';
      return false;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'La confirmation ne correspond pas au nouveau mot de passe.';
      return false;
    }

    if (this.newPassword.length < 8) {
      this.passwordError = 'Le mot de passe doit contenir au moins 8 caractères.';
      return false;
    }

    if (!/[A-Z]/.test(this.newPassword) || !/[a-z]/.test(this.newPassword) || !/[0-9]/.test(this.newPassword)) {
      this.passwordError = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre.';
      return false;
    }

    return true;
  }

  save() {
    this.loading = true;
    this.successMessage = '';
    this.passwordError = '';
    this.passwordSuccessMessage = '';

    const payload: any = {
      email: this.profile.email,
      responsibleName: this.profile.responsibleName,
      companyName: this.profile.companyName,
      address: this.profile.address,
      phone: this.profile.phone
    };

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Profil mis à jour avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        this.passwordError = err?.error?.message || 'Erreur lors de la mise à jour du profil.';
        console.error('Error updating profile', err);
      }
    });
  }

  savePassword() {
    if (!this.validatePasswordChange()) {
      return;
    }

    if (!this.oldPassword || !this.newPassword) {
      this.passwordError = 'Ancien et nouveau mot de passe requis.';
      return;
    }

    this.loading = true;
    this.passwordError = '';
    this.passwordSuccessMessage = '';

    const payload: any = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.loading = false;
        this.passwordSuccessMessage = 'Mot de passe changé avec succès !';
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.passwordSuccessMessage = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        this.passwordError = err?.error?.message || 'Erreur lors du changement de mot de passe.';
        console.error('Error updating password', err);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
