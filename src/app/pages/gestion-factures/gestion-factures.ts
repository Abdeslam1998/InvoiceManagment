import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  invoices: Invoice[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  totalUnpaid = 0;
  totalCollected = 0;
  totalPrice = 0;
  unpaidCount = 0;
  filteredClientId: string = '';
  filteredClientName: string = '';

  ngOnInit() {
    this.filteredClientId = this.route.snapshot.queryParamMap.get('clientId') || '';
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.invoiceService.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        const invoices = this.filteredClientId ? data.filter(i => this.getClientId(i.clientId) === this.filteredClientId) : data;
        if (this.filteredClientId && !this.filteredClientName) {
          const clientInvoice = invoices[0];
          this.filteredClientName = clientInvoice ? this.getClientName(clientInvoice.clientId) : '';
        }
        this.totalPrice = invoices.reduce((acc, i) => acc + (i.total || 0), 0);
        this.totalUnpaid = invoices.reduce((acc, i) => acc + (i.remaining || 0), 0);
        this.totalCollected = invoices.reduce((acc, i) => acc + ((i.total || 0) - (i.remaining || 0)), 0);
        this.unpaidCount = invoices.filter(i => i.remaining && i.remaining > 0).length;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  get filteredInvoices() {
    let invoices = this.invoices;

    if (this.filteredClientId) {
      invoices = invoices.filter(i => this.getClientId(i.clientId) === this.filteredClientId);
    }

    if (!this.searchTerm) return invoices;

    const term = this.searchTerm.toLowerCase();
    if (this.filteredClientId) {
      return invoices.filter(i => i.invoiceNumber?.toLowerCase().includes(term));
    }

    return invoices.filter(i => 
      (i.invoiceNumber && i.invoiceNumber.toLowerCase().includes(term)) ||
      (this.getClientName(i.clientId).toLowerCase().includes(term))
    );
  }

  getClientName(clientId: any): string {
    if (!clientId) return 'Client Inconnu';
    if (typeof clientId === 'string') return clientId;
    return clientId.name || 'Client Inconnu';
  }

  getClientId(clientId: any): string {
    if (!clientId) return '';
    if (typeof clientId === 'string') return clientId;
    return clientId._id || clientId.id || '';
  }

  printInvoice(id: string | undefined, event: Event) {
    event.stopPropagation();
    if (!id) return;
    const url = `${window.location.origin}/factures/${id}?print=true`;
    window.open(url, '_blank');
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
