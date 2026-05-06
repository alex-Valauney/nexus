import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  template: `
    <div class="container mt-4">
      <h2>Checkout</h2>
      <div class="row">
        <div class="col-md-7">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Shipping Address</h5>
              <div class="mb-3">
                <label class="form-label">Street</label>
                <input type="text" class="form-control" [(ngModel)]="address.street" placeholder="Street address">
              </div>
              <div class="row">
                <div class="col">
                  <label class="form-label">City</label>
                  <input type="text" class="form-control" [(ngModel)]="address.city" placeholder="City">
                </div>
                <div class="col">
                  <label class="form-label">Zip Code</label>
                  <input type="text" class="form-control" [(ngModel)]="address.zipCode" placeholder="Zip code">
                </div>
              </div>
              <div class="mb-3 mt-3">
                <label class="form-label">Country</label>
                <input type="text" class="form-control" [(ngModel)]="address.country" placeholder="Country">
              </div>

              <h5 class="card-title mt-4">Payment Method</h5>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="paymentMethod" id="payOnDelivery" 
                       [(ngModel)]="paymentMethod" value="PAY_ON_DELIVERY">
                <label class="form-check-label" for="payOnDelivery">
                  Pay on Delivery
                </label>
              </div>
              <div class="mt-4">
                <button class="btn btn-success w-100" (click)="placeOrder()" [disabled]="isPlacing">
                   {{ isPlacing ? 'Placing Order...' : 'Place Order (' + (total | currency) + ')' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-5">
           <div class="card shadow-sm">
             <div class="card-body">
               <h5 class="card-title">Order Summary</h5>
               <ul class="list-group list-group-flush">
                 <li class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let item of cartItems">
                   <div>
                     {{ item.productName }} <span class="badge bg-secondary">x{{ item.quantity }}</span>
                   </div>
                   <span>{{ item.price * item.quantity | currency }}</span>
                 </li>
                 <li class="list-group-item d-flex justify-content-between align-items-center fw-bold">
                   Total
                   <span>{{ total | currency }}</span>
                 </li>
               </ul>
             </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  address = { street: '', city: '', zipCode: '', country: '' };
  paymentMethod: string = 'PAY_ON_DELIVERY';
  isPlacing: boolean = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
      if (this.cartItems.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  placeOrder(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      alert('You must be logged in to place an order.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.address.street || !this.address.city || !this.address.zipCode || !this.address.country) {
      alert('Please fill in all address fields.');
      return;
    }

    const userData = this.authService.getUserData();
    const userName = userData?.name || 'Guest';

    const zip = Number(this.address.zipCode);
    if (isNaN(zip)) {
      alert('Invalid Zip Code. Please enter a number.');
      this.isPlacing = false;
      return;
    }

    this.isPlacing = true;
    const orderRequest = {
      userId: userId,
      userName: userName,
      items: this.cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        sellerId: item.sellerId
      })),
      amount: this.total,
      paymentMethod: this.paymentMethod,
      adress: {
        ...this.address,
        zipCode: zip
      }
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (res) => {
        alert('Order placed successfully!');
        this.cartService.clearCart();
        this.router.navigate(['/order']);
      },
      error: (err) => {
        console.error('Error placing order:', err);
        const errorMsg = err.error?.error || err.error?.message || err.message || 'Unknown error';
        alert('Failed to place order: ' + errorMsg);
        this.isPlacing = false;
      }
    });
  }
}

interface OrderRequest {
    userId: string;
    items: any[];
    amount: number;
    paymentMethod: string;
    adress: any;
}
