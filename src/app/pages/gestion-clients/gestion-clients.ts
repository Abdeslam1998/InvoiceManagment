import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppInput } from '../../shared/ui/input/input';
import { AppButton } from '../../shared/ui/button/button';
import { ClientService, Client } from '../../services/client.service';
import { Fab } from '../../shared/fab/fab';

@Component({
  selector: 'app-gestion-clients',
  standalone: true,
  imports: [RouterLink, AppInput, AppButton, CommonModule, Fab, FormsModule],
  templateUrl: './gestion-clients.html',
  styleUrl: './gestion-clients.css',
})
export class GestionClients implements OnInit {

  private clientService = inject(ClientService);

  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm: string = '';
  loading = true;

  ngOnInit(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.filteredClients = [...data]; // clone
      }
    });
  }

  trackById(index: number, client: Client) {
    return client._id;
  }
  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.onSearch(); // 🔥 IMPORTANT
      },
      error: (err) => console.error(err)
    });
  }

  onSearch() {
    const term = this.searchTerm?.toLowerCase() || '';

    if (!term) {
      this.filteredClients = this.clients;
      return;
    }

    this.filteredClients = this.clients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term))
    );
  }

  deleteClient(id: string | undefined) {
    if (!id) return;

    if (confirm('Are you sure you want to delete this client?')) {
      this.clientService.deleteClient(id).subscribe(() => {
        this.loadClients();
      });
    }
  }

  getInitials(name: string): string {
    if (!name) return '??';

    const parts = name.trim().split(' ');

    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }


    return name.substring(0, 2).toUpperCase();
  }
}
