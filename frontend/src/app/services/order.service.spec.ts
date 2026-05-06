import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8084/api/order';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

    it('should fetch orders', () => {
    const mockOrders = [
      { id: '1', product: 'Product A', status: 'pending' },
      { id: '2', product: 'Product B', status: 'shipped' }
    ];

    service.getOrders().subscribe(orders => {
      expect(orders).toEqual(mockOrders);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should cancel an order', () => {
    const orderId = '1';
    service.cancelOrder(orderId).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${orderId}/cancel`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should redo an order', () => {
    const orderId = '1';
    service.redoOrder(orderId).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${orderId}/redo`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should delete an order', () => {
    const orderId = '1';
    service.deleteOrder(orderId).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${orderId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});