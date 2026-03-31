import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from './client.service';
import { Product } from './product.service';

export interface InvoiceItem {
  productId: string | Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  clientId: string | Client;
  products: InvoiceItem[];
  total: number;
  remaining: number;
  status: 'unpaid' | 'partial' | 'paid';
  date: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:3000/api/invoices';

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  updateInvoice(id: string, invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  deleteInvoice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateInvoicePayment(id: string, paymentAmount: number): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${id}/payment`, { paidAmount: paymentAmount });
  }
}
