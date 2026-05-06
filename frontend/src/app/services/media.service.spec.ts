import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let service: MediaService;
  let httpMock: HttpTestingController;
  const apiBase = 'http://localhost:8083/api/media';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MediaService]
    });

    service = TestBed.inject(MediaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'il n'y a pas de requêtes non résolues
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('upload()', () => {
    it('should upload a file with productId', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const productId = '123';
      const mockResponse = { id: '456', filename: 'test.jpg' };

      service.upload(mockFile, productId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiBase}/upload`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();

      // Vérifier le contenu du FormData
      const formData = req.request.body as FormData;
      expect(formData.get('file')).toBe(mockFile);
      expect(formData.get('productId')).toBe(productId);

      req.flush(mockResponse);
    });

    it('should handle different file types', () => {
      const mockFile = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' });
      const productId = '789';

      service.upload(mockFile, productId).subscribe();

      const req = httpMock.expectOne(`${apiBase}/upload`);
      expect(req.request.method).toBe('POST');

      req.flush({});
    });
  });

  describe('byProduct()', () => {
    it('should fetch media by product ID', () => {
      const productId = '123';
      const mockResponse = [
        { id: '1', filename: 'image1.jpg', url: 'http://localhost/image1.jpg' },
        { id: '2', filename: 'image2.jpg', url: 'http://localhost/image2.jpg' }
      ];

      service.byProduct(productId).subscribe(media => {
        expect(media).toEqual(mockResponse);
        expect(media.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiBase}/product/${productId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty response for product without media', () => {
      const productId = '999';

      service.byProduct(productId).subscribe(media => {
        expect(media).toEqual([]);
      });

      const req = httpMock.expectOne(`${apiBase}/product/${productId}`);
      req.flush([]);
    });

    it('should handle error response', () => {
      const productId = 'invalid-id';

      service.byProduct(productId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiBase}/product/${productId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  it('should have correct API endpoints', () => {
    // Test indirect pour vérifier les URLs
    const productId = 'test';

    service.byProduct(productId).subscribe();

    const req = httpMock.expectOne(`${apiBase}/product/${productId}`);
    expect(req.request.url).toBe(`${apiBase}/product/${productId}`);
    req.flush([]);

    // Pour upload
    const file = new File([''], 'test.jpg');
    service.upload(file, productId).subscribe();

    const uploadReq = httpMock.expectOne(`${apiBase}/upload`);
    expect(uploadReq.request.url).toBe(`${apiBase}/upload`);
    uploadReq.flush({});
  });
});