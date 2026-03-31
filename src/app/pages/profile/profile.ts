import { Component, OnInit, inject } from '@angular/core';
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

  profile = {
    email: '',
    responsibleName: '',
    companyName: '',
    address: '',
    phone: ''
  };
  loading = false;
  successMessage = '';

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = { ...this.profile, ...data };
      },
      error: (err) => console.error('Error fetching profile', err)
    });
  }

  save() {
    this.loading = true;
    this.successMessage = '';
    this.authService.updateProfile(this.profile).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Profil mis à jour avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error updating profile', err);
      }
    });
  }
}
