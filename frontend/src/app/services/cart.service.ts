import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(() => {
      this.loadCart();
    });
  }

  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  addToCart(product: any): void {
    const existingItem = this.cartItems.find(item => item.productId === (product.id || product._id));
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({
        productId: product.id || product._id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        image: product.images && product.images.length ? product.images[0].imagePath : null,
        sellerId: product.sellerId || product.userId
      });
    }
    this.saveCart();
  }

  removeFromCart(productId: string): void {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.cartItems.find(item => item.productId === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
      }
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  private getCartKey(): string {
    const userId = this.authService.getUserId();
    return userId ? `cart_${userId}` : 'cart_guest';
  }

  private saveCart(): void {
    localStorage.setItem(this.getCartKey(), JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]);
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem(this.getCartKey());
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    } else {
      this.cartItems = [];
    }
    this.cartSubject.next([...this.cartItems]);
  }
}
