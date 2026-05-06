import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { CartService, CartItem } from './cart.service';
import { AuthService } from './auth.service';

describe('CartService', () => {
  let service: CartService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject<any>(null);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId', 'currentUser$'], {
        currentUser$: currentUserSubject.asObservable()
    });
    authServiceSpy.getUserId.and.returnValue(null);

    // Mock localStorage
    let store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addToCart', () => {
    it('should add a new product to the cart', (done) => {
      const product = { id: 'p1', name: 'Product 1', price: 10, sellerId: 's1', images: [{ imagePath: 'img1.jpg' }] };
      service.addToCart(product);

      service.getCart().subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].productId).toBe('p1');
        expect(items[0].quantity).toBe(1);
        expect(items[0].productName).toBe('Product 1');
        done();
      });
    });

    it('should increment quantity if product already in cart', (done) => {
      const product = { id: 'p1', name: 'Product 1', price: 10 };
      service.addToCart(product);
      service.addToCart(product);

      service.getCart().subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].quantity).toBe(2);
        done();
      });
    });

    it('should handle product with _id', (done) => {
      const product = { _id: 'p2', name: 'Product 2', price: 20 };
      service.addToCart(product);

      service.getCart().subscribe(items => {
        expect(items[0].productId).toBe('p2');
        done();
      });
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', (done) => {
      const product = { id: 'p1', name: 'Product 1', price: 10 };
      service.addToCart(product);
      service.removeFromCart('p1');

      service.getCart().subscribe(items => {
        expect(items.length).toBe(0);
        done();
      });
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', (done) => {
      const product = { id: 'p1', name: 'Product 1', price: 10 };
      service.addToCart(product);
      service.updateQuantity('p1', 5);

      service.getCart().subscribe(items => {
        expect(items[0].quantity).toBe(5);
        done();
      });
    });

    it('should remove item if quantity is 0 or less', (done) => {
      const product = { id: 'p1', name: 'Product 1', price: 10 };
      service.addToCart(product);
      service.updateQuantity('p1', 0);

      service.getCart().subscribe(items => {
        expect(items.length).toBe(0);
        done();
      });
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', (done) => {
      service.addToCart({ id: 'p1', name: 'P1', price: 10 });
      service.addToCart({ id: 'p2', name: 'P2', price: 20 });
      service.clearCart();

      service.getCart().subscribe(items => {
        expect(items.length).toBe(0);
        done();
      });
    });
  });

  describe('getTotal', () => {
    it('should calculate the total price correctly', () => {
      service.addToCart({ id: 'p1', name: 'P1', price: 10 });
      service.addToCart({ id: 'p1', name: 'P1', price: 10 }); // quantity 2
      service.addToCart({ id: 'p2', name: 'P2', price: 20 }); // quantity 1
      
      expect(service.getTotal()).toBe(40);
    });

    it('should return 0 for empty cart', () => {
      expect(service.getTotal()).toBe(0);
    });
  });

  describe('Persistence and Auth', () => {
    it('should save to localStorage', () => {
      const product = { id: 'p1', name: 'P1', price: 10 };
      service.addToCart(product);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('cart_guest', jasmine.any(String));
      const savedData = JSON.parse((localStorage.getItem as jasmine.Spy)('cart_guest'));
      expect(savedData[0].productId).toBe('p1');
    });

    it('should use user-specific key when logged in', () => {
      authServiceSpy.getUserId.and.returnValue('user123');
      service.addToCart({ id: 'p1', name: 'P1', price: 10 });
      
      expect(localStorage.setItem).toHaveBeenCalledWith('cart_user123', jasmine.any(String));
    });

    it('should reload cart when user changes', (done) => {
      // First, save something for user123
      const userCart = [{ productId: 'p-user', productName: 'User Item', price: 50, quantity: 1 }];
      localStorage.setItem('cart_user123', JSON.stringify(userCart));
      
      authServiceSpy.getUserId.and.returnValue('user123');
      
      // Trigger user change
      currentUserSubject.next({ id: 'user123' });

      // The service should have loaded the cart for user123
      service.getCart().subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].productId).toBe('p-user');
        done();
      });
    });
  });
});
