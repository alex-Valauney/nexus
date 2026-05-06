import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  template: `
    <div class="container mt-4">
      <h2>Your Shopping Cart</h2>
      <div *ngIf="cartItems.length === 0" class="alert alert-info">
        Your cart is empty. <a routerLink="/">Go shop!</a>
      </div>
      <div *ngIf="cartItems.length > 0">
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of cartItems">
                <td class="text-nowrap">{{ item.productName }}</td>
                <td>{{ item.price | currency }}</td>
                <td>
                  <input type="number" class="form-control d-inline-block" style="width: 70px;" 
                         [ngModel]="item.quantity" (ngModelChange)="updateQuantity(item.productId, $event)">
                </td>
                <td>{{ item.price * item.quantity | currency }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" (click)="removeItem(item.productId)">Remove</button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-end fw-bold">Total:</td>
                <td class="fw-bold">{{ total | currency }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-primary" (click)="proceedToCheckout()">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
