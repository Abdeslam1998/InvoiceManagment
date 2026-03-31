import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppInput } from '../../shared/ui/input/input';
import { AppButton } from '../../shared/ui/button/button';
import { InvoiceService } from '../../services/invoice.service';
import { ClientService, Client } from '../../services/client.service';
import { ProductService, Product } from '../../services/product.service';

interface InvoiceItemForm {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-creation-facture',
  standalone: true,
  imports: [RouterLink, AppInput, AppButton, CommonModule, FormsModule],
  templateUrl: './creation-facture.html',
  styleUrl: './creation-facture.css',
})
export class CreationFacture implements OnInit {
  private invoiceService = inject(InvoiceService);
  private clientService = inject(ClientService);
  private productService = inject(ProductService);
  private router = inject(Router);

  clients: Client[] = [];
  products: Product[] = [];

  selectedClientId: string = '';
  invoiceDate: string = new Date().toISOString().split('T')[0];

  selectedProductId: string = '';
  selectedQuantity: number = 1;
  loading = false;

  items: InvoiceItemForm[] = [];

  ngOnInit() {
    this.clientService.getClients().subscribe(c => this.clients = c);
    this.productService.getProducts().subscribe(p => this.products = p);
  }

  addItem() {
    const product = this.products.find(p => p._id === this.selectedProductId);
    if (product && this.selectedQuantity > 0) {
      // Prevent duplicates
      const exists = this.items.find(i => i.product._id === product._id);
      if (exists) {
        exists.quantity += this.selectedQuantity;
      } else {
        this.items.push({ product, quantity: this.selectedQuantity });
      }
      this.selectedProductId = '';
      this.selectedQuantity = 1;
    }
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  saveInvoice() {
    if (!this.selectedClientId || this.items.length === 0) return;
    this.loading = true;

    // Backend calculates total, remaining, invoiceNumber automatically
    const payload = {
      clientId: this.selectedClientId,
      date: this.invoiceDate,
      products: this.items.map(item => ({
        productId: item.product._id || '',
        quantity: item.quantity,
      }))
    };

    this.invoiceService.createInvoice(payload as any).subscribe({
      next: () => this.router.navigate(['/factures']),
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
