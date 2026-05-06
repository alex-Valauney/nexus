import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';

describe('TokenInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  const testUrl = 'http://test.api/data';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear(); // Clean up after each test
  });

  it('should be created', () => {
      const interceptors = TestBed.inject(HTTP_INTERCEPTORS) as any[];
      const hasTokenInterceptor = interceptors.some(i => i instanceof TokenInterceptor);
      expect(hasTokenInterceptor).toBeTrue();
  });

  describe('when token exists in localStorage', () => {
    const mockToken = 'fake-jwt-token-12345';

    beforeEach(() => {
      localStorage.setItem('token', mockToken);
    });

    it('should add Authorization header with Bearer token', () => {
      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

      req.flush({});
    });

    it('should add token to multiple requests', () => {
      httpClient.get(testUrl).subscribe();
      httpClient.post(testUrl, { data: 'test' }).subscribe();

      const requests = httpMock.match(testUrl);
      expect(requests.length).toBe(2);

      requests.forEach(req => {
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
        req.flush({});
      });
    });

    it('should preserve other headers when adding Authorization', () => {
      const customHeaders = { 'X-Custom-Header': 'CustomValue' };

      httpClient.get(testUrl, { headers: customHeaders }).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.headers.get('X-Custom-Header')).toBe('CustomValue');

      req.flush({});
    });

    it('should add token to POST requests with body', () => {
      const requestBody = { name: 'Test', value: 123 };

      httpClient.post(testUrl, requestBody).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(requestBody);

      req.flush({});
    });

    it('should add token to PUT requests', () => {
      httpClient.put(testUrl, { id: 1 }).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.method).toBe('PUT');

      req.flush({});
    });

    it('should add token to DELETE requests', () => {
      httpClient.delete(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.method).toBe('DELETE');

      req.flush({});
    });
  });

  describe('when token does NOT exist in localStorage', () => {
    it('should NOT add Authorization header', () => {
      // Ensure no token is present
      expect(localStorage.getItem('token')).toBeNull();

      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('Authorization')).toBeFalse();

      req.flush({});
    });

    it('should send request without modification', () => {
      const customHeaders = { 'X-Other-Header': 'Test' };

      httpClient.get(testUrl, { headers: customHeaders }).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('Authorization')).toBeFalse();
      expect(req.request.headers.get('X-Other-Header')).toBe('Test');

      req.flush({});
    });
  });

  describe('edge cases', () => {
    it('should handle token with special characters', () => {
      const specialToken = 'token.with.dots-and-dashes_123!@#';
      localStorage.setItem('token', specialToken);

      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${specialToken}`);

      req.flush({});
    });

    it('should handle very long token', () => {
      const longToken = 'a'.repeat(1000);
      localStorage.setItem('token', longToken);

      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${longToken}`);

      req.flush({});
    });

    it('should work with different URLs', () => {
      const mockToken = 'test-token';
      localStorage.setItem('token', mockToken);

      const urls = [
        'http://api.example.com/users',
        'http://api.example.com/products',
        'http://api.example.com/orders'
      ];

      urls.forEach(url => {
        httpClient.get(url).subscribe();
        const req = httpMock.expectOne(url);
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
        req.flush({});
      });
    });
  });

  describe('token changes during runtime', () => {
    it('should use current token value at time of request', () => {
      // First request with token1
      localStorage.setItem('token', 'token1');
      httpClient.get(testUrl).subscribe();

      let req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe('Bearer token1');
      req.flush({});

      // Change token
      localStorage.setItem('token', 'token2');

      // Second request with token2
      httpClient.get(testUrl).subscribe();
      req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe('Bearer token2');
      req.flush({});

      // Remove token
      localStorage.removeItem('token');

      // Third request without token
      httpClient.get(testUrl).subscribe();
      req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });
  });
});