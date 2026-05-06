import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SellerDashboardComponent } from './seller-dashboard.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MediaService } from '../../services/media.service';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('SellerDashboardComponent', () => {
    let component: SellerDashboardComponent;
    let fixture: ComponentFixture<SellerDashboardComponent>;
    let httpMock: HttpTestingController;
    let authSpy: jasmine.SpyObj<AuthService>;
    let productSpy: jasmine.SpyObj<ProductService>;
    let mediaSpy: jasmine.SpyObj<MediaService>;
    let router: Router;

    beforeEach(async () => {
        authSpy = jasmine.createSpyObj('AuthService', ['getUserId']);
        productSpy = jasmine.createSpyObj('ProductService', ['listAll', 'create', 'delete', 'update']);
        mediaSpy = jasmine.createSpyObj('MediaService', ['byProduct']);

        await TestBed.configureTestingModule({
            declarations: [SellerDashboardComponent],
            imports: [FormsModule, HttpClientTestingModule],
            providers: [
                { provide : AuthService, useValue: authSpy},
                { provide : ProductService, useValue: productSpy},
                { provide : MediaService, useValue: mediaSpy},
                { provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SellerDashboardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have initial values', () => {
        expect(component.name).toBe('');
        expect(component.price).toBe(0);
        expect(component.quantity).toBe(0);
        expect(component.description).toBe('');
        expect(component.myProducts).toEqual([]);
    });

    it('should load and filter products for current user and call media for each', () => {
        const products = [
              { id: 'p1', userId: 'user1', name: 'A' },
              { id: 'p2', userId: 'user2', name: 'B' },
              { _id: 'p3', userId: 'user1', name: 'C' }
            ];
        authSpy.getUserId.and.returnValue('user1');
            productSpy.listAll.and.returnValue(of(products));
            mediaSpy.byProduct.and.returnValue(of([{ imagePath: 'img.png' }]));

            fixture.detectChanges();

        expect(productSpy.listAll).toHaveBeenCalled();
        expect(component.currentUserId).toBe('user1');
        expect(component.myProducts.length).toBe(2);
        expect(component.myProducts[0].id).toBe('p1');
        // vérifie que byProduct est appelé pour chaque produit du vendeur
        expect(mediaSpy.byProduct.calls.count()).toBe(2);
        expect(component.myProducts[0].images).toBeDefined();
    });

    it('should send product with userId and reload', () => {
        authSpy.getUserId.and.returnValue('user1');
        productSpy.create.and.returnValue(of({}));
        spyOn(component, 'loadMyProducts');

        component.name = 'New Product';
        component.price = 100;
        component.quantity = 10;
        component.description = 'A test product';

        component.create(new Event('submit'));

        expect(productSpy.create).toHaveBeenCalledWith({
            name: 'New Product',
            price: 100,
            quantity: 10,
            description: 'A test product',
            category: '',
            userId: 'user1'
        });
        expect(component.loadMyProducts).toHaveBeenCalled();
    });

    it('confirmDelete should call delete when user confirms', () => {
        const product = { id: 'p1', name: 'To Delete Product' };
        spyOn(window, 'confirm').and.returnValue(true);
        productSpy.delete.and.returnValue(of({}));
        spyOn(component, 'loadMyProducts');

        component.confirmDelete(product);

        expect(productSpy.delete).toHaveBeenCalledWith('p1');
        expect(component.loadMyProducts).toHaveBeenCalled();
    });

    it('deleteSelected should set error when no id chosen', () => {
        component.deleteProductId = '';
        component.deleteError = '';
        component.deleteSelected();
        expect(component.deleteError).toBe('Choose a product first');
    });

    it('editProduct should call update when prompt returns new name', () => {
        const product = { id: 'p1', name: 'Old Name', price: 50, quantity: 5, description: 'Desc', category: 'default'};
        spyOn(window, 'prompt').and.returnValues('New Name', 'default', '50', '5', 'Desc');
        productSpy.update.and.returnValue(of({}));
        spyOn(component, 'loadMyProducts');

        component.editProduct(product);

        expect(productSpy.update).toHaveBeenCalledWith('p1', {
            name: 'New Name'
        });
        expect(component.loadMyProducts).toHaveBeenCalled();
    });
});