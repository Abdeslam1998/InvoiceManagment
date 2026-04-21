import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppInput } from '../../shared/ui/input/input';
import { AppButton } from '../../shared/ui/button/button';
import { ProductService, Product } from '../../services/product.service';
import { Fab } from '../../shared/fab/fab';

@Component({
  selector: 'app-catalogue-produits',
  standalone: true,
  imports: [RouterLink, AppInput, AppButton, CommonModule, Fab, FormsModule],
  templateUrl: './catalogue-produits.html',
  styleUrl: './catalogue-produits.css',
})
export class CatalogueProduits implements OnInit {
  private productService = inject(ProductService);
  
  products: Product[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  lowStockCount = 0;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.lowStockCount = data.filter(p => p.stock < 20).length;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
  get filteredProducts() {
    const term = this.searchTerm?.trim().toLowerCase() || '';
    if (!term) return this.products;
    return this.products.filter(p => p.name.toLowerCase().includes(term));
  }

  deleteProduct(id: string | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }
}
