import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutComponent } from './checkout.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

class MockRouter {
  navigate = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));
}

class MockCartService {
  private items = [
    { productId: 'p1', productName: 'Product A', price: 10, quantity: 2, sellerId: 's1' }
  ];
  getCart() { return of([...this.items]); }
  getTotal() { return 20; }
  clearCart = jasmine.createSpy('clearCart');
}

class MockOrderService {
  createOrder = jasmine.createSpy('createOrder').and.returnValue(of({ id: 'order-1' }));
}

class MockAuthService {
  private _userId: string | null = 'user-123';
  private _userData: any = { name: 'Alice' };
  getUserId() { return this._userId; }
  getUserData() { return this._userData; }
  setUserId(id: string | null) { this._userId = id; }
  setUserData(data: any) { this._userData = data; }
}

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let mockRouter: MockRouter;
  let mockCartService: MockCartService;
  let mockOrderService: MockOrderService;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockRouter = new MockRouter();
    mockCartService = new MockCartService();
    mockOrderService = new MockOrderService();
    mockAuthService = new MockAuthService();

    await TestBed.configureTestingModule({
      declarations: [CheckoutComponent],
      imports: [FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CartService, useValue: mockCartService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cart items and total on init', () => {
    expect(component.cartItems.length).toBe(1);
    expect(component.cartItems[0].productName).toBe('Product A');
    expect(component.total).toBe(20);
  });

  it('should set default payment method to PAY_ON_DELIVERY', () => {
    expect(component.paymentMethod).toBe('PAY_ON_DELIVERY');
  });

  it('should navigate to /cart when cart is empty on init', () => {
    spyOn(mockCartService, 'getCart').and.returnValue(of([]));
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/cart']);
  });

  it('should alert and navigate to /login when user is not logged in', () => {
    mockAuthService.setUserId(null);
    spyOn(window, 'alert');
    component.placeOrder();
    expect(window.alert).toHaveBeenCalledWith('You must be logged in to place an order.');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should alert when address fields are incomplete', () => {
    spyOn(window, 'alert');
    component.address = { street: '', city: '', zipCode: '', country: '' };
    component.placeOrder();
    expect(window.alert).toHaveBeenCalledWith('Please fill in all address fields.');
    expect(mockOrderService.createOrder).not.toHaveBeenCalled();
  });

  it('should alert when only street is missing', () => {
    spyOn(window, 'alert');
    component.address = { street: '', city: 'Paris', zipCode: '75000', country: 'France' };
    component.placeOrder();
    expect(window.alert).toHaveBeenCalledWith('Please fill in all address fields.');
  });

  it('should alert on invalid zip code', () => {
    spyOn(window, 'alert');
    component.address = { street: '1 Rue de Rivoli', city: 'Paris', zipCode: 'ABC', country: 'France' };
    component.placeOrder();
    expect(window.alert).toHaveBeenCalledWith('Invalid Zip Code. Please enter a number.');
    expect(component.isPlacing).toBeFalse();
    expect(mockOrderService.createOrder).not.toHaveBeenCalled();
  });

  it('should call createOrder with the correct payload on success', () => {
    spyOn(window, 'alert');
    component.address = { street: '1 Rue de Rivoli', city: 'Paris', zipCode: '75001', country: 'France' };

    component.placeOrder();

    expect(mockOrderService.createOrder).toHaveBeenCalledWith(
      jasmine.objectContaining({
        userId: 'user-123',
        userName: 'Alice',
        amount: 20,
        paymentMethod: 'PAY_ON_DELIVERY',
        items: [
          jasmine.objectContaining({
            productId: 'p1',
            productName: 'Product A',
            price: 10,
            quantity: 2,
            sellerId: 's1'
          })
        ],
        adress: jasmine.objectContaining({
          street: '1 Rue de Rivoli',
          city: 'Paris',
          zipCode: 75001,
          country: 'France'
        })
      })
    );
  });

  it('should alert success, clear cart and navigate to /order on successful order', () => {
    spyOn(window, 'alert');
    component.address = { street: '1 Rue de Rivoli', city: 'Paris', zipCode: '75001', country: 'France' };

    component.placeOrder();

    expect(window.alert).toHaveBeenCalledWith('Order placed successfully!');
    expect(mockCartService.clearCart).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/order']);
  });

  it('should use "Guest" as userName when getUserData returns null', () => {
    spyOn(window, 'alert');
    mockAuthService.setUserData(null);
    component.address = { street: '1 Rue de Rivoli', city: 'Paris', zipCode: '75001', country: 'France' };

    component.placeOrder();

    expect(mockOrderService.createOrder).toHaveBeenCalledWith(
      jasmine.objectContaining({ userName: 'Guest' })
    );
  });

  it('should set isPlacing to true before calling createOrder', () => {
    spyOn(window, 'alert');
    // Make createOrder synchronous but capture state mid-call
    let placingDuringCall = false;
    mockOrderService.createOrder.and.callFake(() => {
      placingDuringCall = component.isPlacing;
      return of({ id: 'order-1' });
    });

    component.address = { street: '1 Rue de Rivoli', city: 'Paris', zipCode: '75001', country: 'France' };
    component.placeOrder();

    expect(placingDuringCall).toBeTrue();
  });

  it('should alert error message and reset isPlacing on order failure', () => {
    spyOn(window, 'alert');
    mockOrderService.createOrder.and.returnValue(
      throwError(() => ({ error: { message: 'Payment failed' }, message: 'HTTP error' }))
    );
    component.address = { street: '1 Rue de Rivoli', city: 'Paris', zipCode: '75001', country: 'France' };

    component.placeOrder();

    expect(window.alert).toHaveBeenCalledWith('Failed to place order: Payment failed');
    expect(component.isPlacing).toBeFalse();
    expect(mockCartService.clearCart).not.toHaveBeenCalled();
  });

  it('should fall back to error.message when error.error is absent', () => {
    spyOn(window, 'alert');
    mockOrderService.createOrder.and.returnValue(
      throwError(() => ({ message: 'Network error' }))
    );
    component.address = { street: '1 Rue de Rivoli', city: 'Paris', zipCode: '75001', country: 'France' };

    component.placeOrder();

    expect(window.alert).toHaveBeenCalledWith('Failed to place order: Network error');
  });

  it('should fall back to "Unknown error" when no error message is available', () => {
    spyOn(window, 'alert');
    mockOrderService.createOrder.and.returnValue(throwError(() => ({})));
    component.address = { street: '1 Rue de Rivoli', city: 'Paris', zipCode: '75001', country: 'France' };

    component.placeOrder();

    expect(window.alert).toHaveBeenCalledWith('Failed to place order: Unknown error');
  });
});
