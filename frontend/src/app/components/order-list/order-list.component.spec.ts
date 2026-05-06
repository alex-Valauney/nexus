import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderListComponent } from './order-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

class MockOrderService {
  getOrders() {
    return of([
      { id: '1', userName: 'User 1', createdAt: new Date(), amount: 100, orderStatus: 'PENDING' },
      { id: '2', userName: 'User 2', createdAt: new Date(), amount: 200, orderStatus: 'COMPLETED' }
    ]);
  }
  cancelOrder(id: string) { return of({}); }
  redoOrder(id: string) { return of({}); }
  deleteOrder(id: string) { return of({}); }
}

class MockAuthService {
  currentUserSubject = new BehaviorSubject<any>({ role: 'CLIENT' });
  currentUser$ = this.currentUserSubject.asObservable();
}

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let orderService: OrderService;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderListComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: OrderService, useClass: MockOrderService },
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load orders on init if logged in', () => {
      localStorage.setItem('token', 'fake-token');
      const spy = spyOn(orderService, 'getOrders').and.callThrough();
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
      expect(component.orders.length).toBe(2);
    });

    it('should not load orders if not logged in', () => {
      localStorage.removeItem('token');
      const spy = spyOn(orderService, 'getOrders').and.callThrough();
      component.ngOnInit();
      expect(spy).not.toHaveBeenCalled();
      expect(component.orders.length).toBe(0);
    });

    it('should handle error when loading orders fails', () => {
      localStorage.setItem('token', 'fake-token');
      spyOn(orderService, 'getOrders').and.returnValue(throwError(() => ({ error: { error: 'Service error' } })));
      component.loadOrders();
      expect(component.orders.length).toBe(0);
      expect(component.errorMessage).toBe('Service error');
    });
  });

  describe('Actions', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'fake-token');
      component.ngOnInit();
    });

    it('should call cancelOrder and reload on onCancel success', () => {
      const cancelSpy = spyOn(orderService, 'cancelOrder').and.callThrough();
      const loadSpy = spyOn(component, 'loadOrders').and.callThrough();
      component.onCancel('1');
      expect(cancelSpy).toHaveBeenCalledWith('1');
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should set errorMessage on onCancel failure', () => {
      spyOn(orderService, 'cancelOrder').and.returnValue(throwError(() => ({ error: { error: 'Cancel failed' } })));
      component.onCancel('1');
      expect(component.errorMessage).toBe('Cancel failed');
    });

    it('should call redoOrder and reload on onRedo success', () => {
      const redoSpy = spyOn(orderService, 'redoOrder').and.callThrough();
      const loadSpy = spyOn(component, 'loadOrders').and.callThrough();
      component.onRedo('1');
      expect(redoSpy).toHaveBeenCalledWith('1');
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should set errorMessage on onRedo failure', () => {
      spyOn(orderService, 'redoOrder').and.returnValue(throwError(() => ({ error: { error: 'Redo failed' } })));
      component.onRedo('1');
      expect(component.errorMessage).toBe('Redo failed');
    });

    it('should call deleteOrder and reload on onDelete success', () => {
      const deleteSpy = spyOn(orderService, 'deleteOrder').and.callThrough();
      const loadSpy = spyOn(component, 'loadOrders').and.callThrough();
      component.onDelete('1');
      expect(deleteSpy).toHaveBeenCalledWith('1');
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should set errorMessage on onDelete failure', () => {
      spyOn(orderService, 'deleteOrder').and.returnValue(throwError(() => ({ error: { error: 'Delete failed' } })));
      component.onDelete('1');
      expect(component.errorMessage).toBe('Delete failed');
    });
  });

  describe('Role-based visibility', () => {
    beforeEach(() => {
      component.orders = [
        { id: '1', userName: 'User 1', createdAt: new Date(), amount: 100, orderStatus: 'PENDING' }
      ];
    });

    it('should show Actions column and buttons for SELLER', () => {
      authService.currentUserSubject.next({ role: 'SELLER' });
      fixture.detectChanges();
      const actionHeaders = fixture.debugElement.queryAll(By.css('th'));
      const hasActionsHeader = actionHeaders.some(h => h.nativeElement.textContent.includes('Actions'));
      expect(hasActionsHeader).toBeTrue();

      const redoButtons = fixture.debugElement.queryAll(By.css('button')).filter(b => b.nativeElement.textContent.includes('Redo'));
      expect(redoButtons.length).toBeGreaterThan(0);
    });

    it('should hide Actions column and buttons for CLIENT', () => {
      authService.currentUserSubject.next({ role: 'CLIENT' });
      fixture.detectChanges();
      const actionHeaders = fixture.debugElement.queryAll(By.css('th'));
      const hasActionsHeader = actionHeaders.some(h => h.nativeElement.textContent.includes('Actions'));
      expect(hasActionsHeader).toBeFalse();

      const redoButtons = fixture.debugElement.queryAll(By.css('button')).filter(b => b.nativeElement.textContent.includes('Redo'));
      expect(redoButtons.length).toBe(0);
    });
  });
});
