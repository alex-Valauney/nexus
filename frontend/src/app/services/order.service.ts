import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8084/api/order';

  constructor(private http: HttpClient) { }

  // Get all orders for the current user
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Create a new order
  createOrder(order: any): Observable<any> {
    return this.http.post(this.apiUrl, order);
  }

  // Cancel an order
  cancelOrder(orderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/cancel`, {});
  }

  // Redo an order
  redoOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/redo`, {});
  }

  // Complete an order
  completeOrder(orderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/complete`, {});
  }

  // Delete an order
  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${orderId}`);
  }
}