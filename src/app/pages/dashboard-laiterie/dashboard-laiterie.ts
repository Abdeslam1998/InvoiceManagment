import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStatusChip } from '../../shared/ui/status-chip/status-chip';
import { InvoiceService, Invoice } from '../../services/invoice.service';

@Component({
  selector: 'app-dashboard-laiterie',
  standalone: true,
  imports: [RouterLink, AppStatusChip, CommonModule],
  templateUrl: './dashboard-laiterie.html',
  styleUrl: './dashboard-laiterie.css',
})
export class DashboardLaiterie implements OnInit {
  private invoiceService = inject(InvoiceService);

  totalRevenues = 0;
  pending = 0;
  paid = 0;
  paidPercentage = 0;
  pendingPercentage = 0;

  recentInvoices: Invoice[] = [];

  ngOnInit() {
    this.invoiceService.getInvoices().subscribe({
      next: (invoices) => {
        this.totalRevenues = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        this.pending = invoices.reduce((sum, inv) => sum + (inv.remaining || 0), 0);
        this.paid = this.totalRevenues - this.pending;

        if (this.totalRevenues > 0) {
          this.paidPercentage = Math.round((this.paid / this.totalRevenues) * 100);
          this.pendingPercentage = 100 - this.paidPercentage;
        }

        // Sort by date desc and take top 2
        this.recentInvoices = invoices
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 2);
      },
      error: (err) => console.error('Failed to load invoices', err)
    });
  }
}
