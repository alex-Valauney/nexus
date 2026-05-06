import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaManagerComponent } from './media-manager.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

// Mock du Router
class MockRouter {
  navigate(path: string[]) {
    // Mock implementation
    return Promise.resolve(true);
  }
}

class MockProductService {
    listAll() {
        return of([
            { id: '1', name: 'Product 1', userId: 'user1' },
            { id: '2', name: 'Product 2', userId: 'user2' }
        ]);
    }
}

class MockAuthService {
    getUserId() {
        return 'user1';
    }
}

describe('MediaManagerComponent', () => {
    let component: MediaManagerComponent;
    let fixture: ComponentFixture<MediaManagerComponent>;
    let httpMock: HttpTestingController;
    let productService: ProductService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MediaManagerComponent],
            imports: [FormsModule, HttpClientTestingModule],
            providers: [
                { provide: ProductService, useClass: MockProductService },
                { provide: AuthService, useClass: MockAuthService },
                { provide: Router, useClass: MockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MediaManagerComponent);
        component = fixture.componentInstance;
        productService = TestBed.inject(ProductService);
        httpMock = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
      });

    afterEach(() => {
      httpMock.verify();
      localStorage.removeItem('token');
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should have initial properties set correctly', () => {
        expect(component.productId).toBe('');
        expect(component.file).toBeNull();
        expect(component.error).toBe('');
        expect(component.products.length).toBe(1);
        expect(component.uploaded).toBeDefined();
    });

    it('should load products on init', () => {
        // MockProductService returns product1 & product2
        expect(component.products.length).toBe(1);
        expect(component.products[0].id).toBe('1');
    });

    it('upload should require a file', () => {
        component.file = null;
        component.upload(new Event('submit'));
        expect(component.error).toBe('Choose a file');
    });

    it('upload should reject files > 2MB', () => {
        component.file = new File([new ArrayBuffer(3 * 1024 * 1024)], 'large.png', { type: 'image/png' });
        component.upload(new Event('submit'));
        expect(component.error).toBe('File too large (max 2MB)');
    });

    it('upload should reject wrong format file', () => {
        component.file = new File([new ArrayBuffer(100)], 'file.txt', { type: 'text/plain' });
        component.upload(new Event('submit'));
        expect(component.error).toBe('Unsupported file type');
    });

    it('upload should reject if not logged in', () => {
        localStorage.removeItem('token');
        component.file = new File([new ArrayBuffer(100)], 'image.png', { type: 'image/png' });
        component.upload(new Event('submit'));
        expect(component.error).toBe('Login first');
    });
});
