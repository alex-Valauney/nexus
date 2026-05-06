import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const baseOrders = [
    {
      id: 'o-1',
      userId: 'user-1',
      amount: 120,
      orderStatus: 'completed',
      items: [
        { productId: 'p1', productName: 'Alpha', quantity: 2, price: 10, sellerId: 'user-1' },
        { productId: 'p2', productName: 'Beta', quantity: 1, price: 100, sellerId: 'user-2' }
      ]
    },
    {
      id: 'o-2',
      userId: 'user-1',
      amount: '80',
      orderStatus: 'PENDING',
      items: [
        { productId: 'p1', productName: 'Alpha', quantity: '1', price: '10', sellerId: 'user-1' },
        { productId: 'p3', productName: 'Gamma', quantity: 1, price: 70, sellerId: 'user-1' }
      ]
    },
    {
      id: 'o-3',
      userId: 'user-2',
      amount: 50,
      orderStatus: 'COMPLETED',
      items: [
        { productId: 'p3', productName: 'Gamma', quantity: 2, price: 70 }
      ]
    },
    {
      id: 'o-4',
      userId: 'user-1',
      amount: 40,
      orderStatus: 'canceled',
      items: [
        { productId: 'p1', productName: 'Alpha', quantity: 5, price: 10, sellerId: 'user-1' }
      ]
    }
  ];

  const baseProducts = [
    { id: 'p3', name: 'Gamma', userId: 'user-1' },
    { id: 'p4', name: 'Delta', sellerId: 'user-1' }
  ];

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserData', 'getUserId']);
    orderServiceSpy = jasmine.createSpyObj('OrderService', ['getOrders']);
    productServiceSpy = jasmine.createSpyObj('ProductService', ['listAll']);

    authServiceSpy.getUserData.and.returnValue({ name: 'Sam Seller', role: 'SELLER' });
    authServiceSpy.getUserId.and.returnValue('user-1');
    orderServiceSpy.getOrders.and.returnValue(of(baseOrders));
    productServiceSpy.listAll.and.returnValue(of(baseProducts));

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [CommonModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: ProductService, useValue: productServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute buyer and seller summaries on init', () => {
    component.ngOnInit();

    expect(component.loading).toBeFalse();
    expect(component.displayName).toBe('Sam Seller');
    expect(component.role).toBe('SELLER');
    expect(component.userOrders.length).toBe(3);
    expect(component.totalSpent).toBe(240);

    expect(component.buyerTopProducts[0].key).toBe('p1');
    expect(component.buyerBestProducts[0].key).toBe('p2');

    expect(component.sellerTopProducts.length).toBeGreaterThan(0);
    const sellerBestKeys = component.sellerBestProducts.map(product => product.key);
    expect(sellerBestKeys).toContain('p1');
    expect(sellerBestKeys).toContain('p3');
    expect(component.totalEarned).toBe(160);
  });

  it('should render seller section when role is SELLER', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const eyebrowTexts = fixture.debugElement
      .queryAll(By.css('.eyebrow'))
      .map(el => (el.nativeElement?.textContent || '').trim());
    const hasSellerHeader = eyebrowTexts.some(text => text.includes('Seller summary'));
    expect(hasSellerHeader).toBeTrue();
  });

  it('should hide seller section when role is CLIENT', () => {
    authServiceSpy.getUserData.and.returnValue({ name: 'Sam Client', role: 'CLIENT' });

    component.ngOnInit();
    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent as string;
    expect(textContent).not.toContain('Seller summary');
  });

  it('should show a warning when sales exist but earnings are zero', () => {
    const pendingOnlyOrders = [
      {
        id: 'o-9',
        userId: 'user-9',
        amount: 20,
        orderStatus: 'PENDING',
        items: [
          { productId: 'p1', productName: 'Alpha', quantity: 2, price: 10, sellerId: 'user-1' }
        ]
      }
    ];

    orderServiceSpy.getOrders.and.returnValue(of(pendingOnlyOrders));
    component.ngOnInit();
    fixture.detectChanges();

    const warning = fixture.debugElement.query(By.css('.alert-warning'))?.nativeElement?.textContent || '';
    expect(warning).toContain('Sales are present, but none are completed yet');
  });

  it('should reset state on data load error', () => {
    orderServiceSpy.getOrders.and.returnValue(throwError(() => new Error('boom')));

    component.ngOnInit();

    expect(component.loading).toBeFalse();
    expect(component.userOrders.length).toBe(0);
    expect(component.buyerTopProducts.length).toBe(0);
    expect(component.sellerTopProducts.length).toBe(0);
    expect(component.totalSpent).toBe(0);
    expect(component.totalEarned).toBe(0);
  });
});

