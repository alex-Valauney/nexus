import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiBase = 'http://localhost:8082/api/products';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listAll()', () => {
    it('should fetch all products with GET request', () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 }
      ];

      service.listAll().subscribe(products => {
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(`${apiBase}?sortBy=name&sortOrder=asc`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should handle empty product list', () => {
      service.listAll().subscribe(products => {
        expect(products).toEqual([]);
      });

      const req = httpMock.expectOne(`${apiBase}?sortBy=name&sortOrder=asc`);
      req.flush([]);
    });

    it('should handle server error', () => {
      service.listAll().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiBase}?sortBy=name&sortOrder=asc`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getOne()', () => {
    it('should fetch a single product by ID', () => {
      const productId = '123';
      const mockProduct = { id: productId, name: 'Test Product', price: 150 };

      service.getOne(productId).subscribe(product => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpMock.expectOne(`${apiBase}/${productId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    it('should handle 404 for non-existent product', () => {
      const productId = '999';

      service.getOne(productId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiBase}/${productId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create()', () => {
    it('should create a new product with POST request', () => {
      const newProduct = { name: 'New Product', price: 300 };
      const mockResponse = { id: '456', ...newProduct };

      service.create(newProduct).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiBase);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush(mockResponse);
    });
  });

  describe('update()', () => {
    it('should update a product with PUT request', () => {
      const productId = '123';
      const updatedProduct = { name: 'Updated Product', price: 250 };
      const mockResponse = { id: productId, ...updatedProduct };

      service.update(productId, updatedProduct).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiBase}/${productId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedProduct);
      req.flush(mockResponse);
    });

    it('should handle update for non-existent product', () => {
      const productId = '999';
      const updatedProduct = { name: 'Ghost', price: 0 };

      service.update(productId, updatedProduct).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiBase}/${productId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('delete()', () => {
    it('should delete a product with DELETE request', () => {
      const productId = '123';
      const mockResponse = { success: true };

      service.delete(productId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiBase}/${productId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should return empty response on successful deletion', () => {
      const productId = '123';

      service.delete(productId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiBase}/${productId}`);
      req.flush(null); // Souvent, DELETE retourne null ou vide
    });

    it('should handle deletion of non-existent product', () => {
      const productId = '999';

      service.delete(productId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiBase}/${productId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('URL construction', () => {
    it('should use correct base URL for all endpoints', () => {
      const productId = 'test-id';
      const testData = { name: 'Test' };

      // Test listAll
      service.listAll().subscribe();
      let req = httpMock.expectOne(`${apiBase}?sortBy=name&sortOrder=asc`);
      expect(req.request.urlWithParams).toBe(`${apiBase}?sortBy=name&sortOrder=asc`);
      req.flush([]);

      // Test getOne
      service.getOne(productId).subscribe();
      req = httpMock.expectOne(`${apiBase}/${productId}`);
      expect(req.request.url).toBe(`${apiBase}/${productId}`);
      req.flush({});

      // Test create
      service.create(testData).subscribe();
      req = httpMock.expectOne(apiBase);
      expect(req.request.url).toBe(apiBase);
      req.flush({});

      // Test update
      service.update(productId, testData).subscribe();
      req = httpMock.expectOne(`${apiBase}/${productId}`);
      expect(req.request.url).toBe(`${apiBase}/${productId}`);
      req.flush({});

      // Test delete
      service.delete(productId).subscribe();
      req = httpMock.expectOne(`${apiBase}/${productId}`);
      expect(req.request.url).toBe(`${apiBase}/${productId}`);
      req.flush({});
    });
  });
});