import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InvoiceService, Invoice } from '../../services/invoice.service';
import { AuthService } from '../../services/auth.service';
import { AppButton } from '../../shared/ui/button/button';
import { AppStatusChip } from '../../shared/ui/status-chip/status-chip';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, AppButton, AppStatusChip],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.css'
})
export class InvoiceDetail implements OnInit {
  @Input() id!: string;

  private invoiceService = inject(InvoiceService);
  private authService = inject(AuthService);

  invoice?: Invoice;
  adminProfile: any;
  loading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.invoiceService.getInvoiceById(this.id).subscribe({
      next: (data) => {
        this.invoice = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching invoice', err);
        this.loading = false;
      }
    });

    this.authService.getProfile().subscribe({
      next: (data) => this.adminProfile = data,
      error: (err) => console.error('Error fetching profile', err)
    });
  }

  print() {
    window.print();
  }

  getClientName(): string {
    const client = this.invoice?.clientId;
    if (!client) return 'Client Inconnu';
    return (client as any).name || 'Client Inconnu';
  }

  getClientEmail(): string {
    const client = this.invoice?.clientId;
    return (client as any)?.email || '';
  }

  getClientAddress(): string {
    const client = this.invoice?.clientId;
    return (client as any)?.address || '';
  }

  getProductName(item: any): string {
    if (!item.productId) return 'Produit inconnu';
    return typeof item.productId === 'string' ? 'Produit inconnu' : item.productId.name;
  }
}
