import { OrderService } from './../../services/order.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../services/auth.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-order-list',
  template: `
  <div class="container">
  <h2>Order List</h2>

  <div class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th class="text-nowrap">Order ID</th>
          <th>Client</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Status</th>
          <th *ngIf="isSeller$ | async" class="text-nowrap">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let order of orders">
          <td><small class="text-muted">{{ order.id }}</small></td>
          <td class="text-nowrap">{{ order.userName }}</td>
          <td class="text-nowrap">{{ order.createdAt | date:'short' }}</td>
          <td>{{ order.amount | currency }}</td>
          <td>
            <span [ngClass]="{
              'bg-warning text-dark': order.orderStatus === 'PENDING',
              'bg-danger': order.orderStatus === 'CANCELED',
              'bg-success': order.orderStatus === 'COMPLETED'
            }" class="badge">
              {{ order.orderStatus }}
            </span>
          </td>
          <td *ngIf="isSeller$ | async" class="text-nowrap">
            <button (click)="onRedo(order.id)" class="btn btn-sm btn-outline-primary me-1">🔄 Redo</button>
  
            <button *ngIf="order.orderStatus === 'PENDING'"
                    (click)="onCancel(order.id)"
                    class="btn btn-sm btn-outline-warning me-1">❌ Cancel</button>
  
            <button *ngIf="order.orderStatus === 'PENDING'"
                    (click)="onComplete(order.id)"
                    class="btn btn-sm btn-outline-success me-1">✅ Complete</button>
  
            <button (click)="onDelete(order.id)" class="btn btn-sm btn-link text-danger">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `
})
export class OrderListComponent implements OnInit {
  orders: any[] = [];
  isSeller$: Observable<boolean>;

  constructor(private orderService: OrderService, private authService: AuthService) {
    this.isSeller$ = this.authService.currentUser$.pipe(
      map(u => u?.role === 'SELLER')
    );
  }

  ngOnInit() {
    if (localStorage.getItem('token')) { // check logged in
        this.loadOrders();
     }
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data: any[]) => {
        this.orders = data;
      },
      error: (err) => {
        this.orders = [];
        this.errorMessage = err.error?.error || 'Failed to load orders';
      }
    });
  }

  onCancel(orderId: string) {
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to cancel order';
      }
    });
  }

  onRedo(orderId: string) {
    this.orderService.redoOrder(orderId).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to redo order';
      }
    });
  }

  onComplete(orderId: string) {
    this.orderService.completeOrder(orderId).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to complete order';
      }
    });
  }

  onDelete(orderId: string) {
    this.orderService.deleteOrder(orderId).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to delete order';
      }
    });
  }

   errorMessage = '';
}