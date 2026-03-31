import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStatusChip } from '../../shared/ui/status-chip/status-chip';
import { AppInput } from '../../shared/ui/input/input';
import { AppButton } from '../../shared/ui/button/button';
import { InvoiceService, Invoice } from '../../services/invoice.service';
import { Fab } from '../../shared/fab/fab';

@Component({
  selector: 'app-gestion-factures',
  standalone: true,
  imports: [RouterLink, AppStatusChip, AppInput, AppButton, CommonModule, Fab, FormsModule],
  templateUrl: './gestion-factures.html',
  styleUrl: './gestion-factures.css',
})
export class GestionFactures implements OnInit {
  private invoiceService = inject(InvoiceService);

  invoices: Invoice[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  totalUnpaid = 0;
  totalCollected = 0;
  unpaidCount = 0;

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.invoiceService.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.totalUnpaid = data.reduce((acc, i) => acc + (i.remaining || 0), 0);
        this.totalCollected = data.reduce((acc, i) => acc + ((i.total || 0) - (i.remaining || 0)), 0);
        this.unpaidCount = data.filter(i => i.remaining && i.remaining > 0).length;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  get filteredInvoices() {
    if (!this.searchTerm) return this.invoices;
    const term = this.searchTerm.toLowerCase();
    return this.invoices.filter(i => 
      (i.invoiceNumber && i.invoiceNumber.toLowerCase().includes(term)) ||
      (this.getClientName(i.clientId).toLowerCase().includes(term))
    );
  }

  getClientName(clientId: any): string {
    if (!clientId) return 'Client Inconnu';
    if (typeof clientId === 'string') return clientId;
    return clientId.name || 'Client Inconnu';
  }

  deleteInvoice(id: string | undefined, event: Event) {
    event.stopPropagation();
    if (!id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      this.invoiceService.deleteInvoice(id).subscribe(() => {
        this.loadInvoices();
      });
    }
  }
}
