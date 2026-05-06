import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { CartService, CartItem } from '../../services/cart.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartServiceMock: any;
  let cartSubject: BehaviorSubject<CartItem[]>;
  beforeEach(async () => {
    cartSubject = new BehaviorSubject<CartItem[]>([]);
    cartServiceMock = {
      getCart: jasmine.createSpy('getCart').and.returnValue(cartSubject.asObservable()),
      getTotal: jasmine.createSpy('getTotal').and.returnValue(0),
      updateQuantity: jasmine.createSpy('updateQuantity'),
      removeFromCart: jasmine.createSpy('removeFromCart')
    };

    await TestBed.configureTestingModule({
      declarations: [ CartComponent ],
      imports: [ 
        FormsModule,
        RouterTestingModule 
      ],
      providers: [
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cart items and total on init', () => {
    const mockItems: CartItem[] = [
      { productId: '1', productName: 'Prod 1', price: 10, quantity: 2 }
    ];
    cartServiceMock.getTotal.and.returnValue(20);
    cartSubject.next(mockItems);

    expect(component.cartItems).toEqual(mockItems);
    expect(component.total).toBe(20);
  });

  it('should show empty cart message when no items', () => {
    cartSubject.next([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.alert-info')?.textContent).toContain('Your cart is empty');
  });

  it('should call updateQuantity on service when updateQuantity is called', () => {
    component.updateQuantity('1', 5);
    expect(cartServiceMock.updateQuantity).toHaveBeenCalledWith('1', 5);
  });

  it('should call removeFromCart on service when removeItem is called', () => {
    component.removeItem('1');
    expect(cartServiceMock.removeFromCart).toHaveBeenCalledWith('1');
  });

  it('should navigate to checkout when proceedToCheckout is called', () => {
    const router = TestBed.inject(Router);
    component.proceedToCheckout();
    expect(router.navigate).toHaveBeenCalledWith(['/checkout']);
  });
});
