import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppInput } from '../../shared/ui/input/input';
import { AppButton } from '../../shared/ui/button/button';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [RouterLink, AppInput, AppButton, CommonModule, FormsModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css'
})
export class ClientForm implements OnInit {
  @Input() id?: string;
  
  name = '';
  email = '';
  phone = '';
  address = '';
  loading = false;

  private clientService = inject(ClientService);
  private router = inject(Router);

  get isEdit() {
    return !!this.id;
  }

  ngOnInit() {
    if (this.isEdit && this.id) {
      this.clientService.getClientById(this.id).subscribe(client => {
        this.name = client.name;
        this.email = client.email;
        this.phone = client.phone;
        this.address = client.address;
      });
    }
  }

  save() {
    if (!this.name || !this.email || !this.phone) return;
    
    this.loading = true;
    const client = { name: this.name, email: this.email, phone: this.phone, address: this.address };
    
    if (this.isEdit && this.id) {
      this.clientService.updateClient(this.id, client).subscribe({
        next: () => this.router.navigate(['/clients']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    } else {
      this.clientService.createClient(client).subscribe({
        next: () => this.router.navigate(['/clients']),
        error: (err) => { console.error(err); this.loading = false; }
      });
    }
  }
}
