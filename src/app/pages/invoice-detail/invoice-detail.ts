import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InvoiceService, Invoice } from '../../services/invoice.service';
import { AuthService } from '../../services/auth.service';
import { AppButton } from '../../shared/ui/button/button';
import { AppStatusChip } from '../../shared/ui/status-chip/status-chip';
import { AppInput } from '../../shared/ui/input/input';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppButton, AppStatusChip, AppInput],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.css'
})
export class InvoiceDetail implements OnInit {
  @Input() id!: string;

  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);
  private authService = inject(AuthService);

  invoice?: Invoice;
  adminProfile: any;
  loading = true;
  paymentAmount: number | null = null;
  paymentError = '';
  paymentSuccess = '';
  processingPayment = false;
  private printAfterLoad = false;

  ngOnInit() {
    const routeId = this.route.snapshot.paramMap.get('id');
    this.id = this.id || routeId || '';
    this.printAfterLoad = this.route.snapshot.queryParamMap.get('print') === 'true';
    this.loadData();
  }

  loadData() {
    if (!this.id) {
      this.loading = false;
      return;
    }

    this.invoiceService.getInvoiceById(this.id).subscribe({
      next: (data) => {
        this.invoice = data;
        this.loading = false;
        if (this.printAfterLoad) {
          requestAnimationFrame(() => this.print());
        }
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

  payPartial() {
    this.paymentError = '';
    this.paymentSuccess = '';

    if (this.paymentAmount === null || this.paymentAmount <= 0) {
      this.paymentError = 'Veuillez saisir un montant valide.';
      return;
    }

    if (!this.invoice) {
      this.paymentError = 'Facture introuvable.';
      return;
    }

    const payment = Number(this.paymentAmount);
    if (payment > this.invoice.remaining) {
      this.paymentError = 'Le montant ne peut pas dépasser le reste à payer.';
      return;
    }

    this.processingPayment = true;
    this.invoiceService.updateInvoicePayment(this.invoice._id!, payment).subscribe({
      next: (updated) => {
        this.invoice = updated;
        this.paymentSuccess = `Paiement de ${payment.toFixed(2)} EUR enregistré.`;
        this.paymentAmount = null;
        this.processingPayment = false;
      },
      error: (err) => {
        this.paymentError = err?.error?.message || 'Erreur lors du paiement.';
        this.processingPayment = false;
        console.error(err);
      }
    });
  }

  markAsPaid() {
    if (!this.invoice) return;
    if (this.invoice.remaining <= 0) {
      this.paymentError = 'La facture est déjà réglée.';
      return;
    }
    this.processingPayment = true;
    this.invoiceService.updateInvoicePayment(this.invoice._id!, this.invoice.remaining).subscribe({
      next: (updated) => {
        this.invoice = updated;
        this.paymentSuccess = 'Facture marquée comme payée.';
        this.paymentAmount = null;
        this.processingPayment = false;
      },
      error: (err) => {
        this.paymentError = err?.error?.message || 'Erreur lors de la mise à jour.';
        this.processingPayment = false;
        console.error(err);
      }
    });
  }
}
