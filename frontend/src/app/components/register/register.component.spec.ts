import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let httpMock: HttpTestingController;
    let authService: AuthService;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RegisterComponent],
            imports: [FormsModule, HttpClientTestingModule],
            providers: [
                // { provide: AuthService, useClass: MockAuthService },
                { provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService);
        router = TestBed.inject(Router);
        httpMock = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have initial values', () => {
        expect(component.name).toBe('');
        expect(component.email).toBe('');
        expect(component.password).toBe('');
        expect(component.role).toBe('CLIENT');
        expect(component.error).toBe('');
    });

    it ('should register a user successfully', () => {
        component.name = 'Test User';
        component.email = 'test@mail.com';
        component.password = 'password';
        component.role = 'CLIENT';

        component.register(new Event('submit'));

        const req = httpMock.expectOne(req => req.url.endsWith('/api/auth/register') && req.method === 'POST');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
            name: 'Test User',
            email: 'test@mail.com',
            password: 'password',
            role: 'CLIENT'
        });

        req.flush({ token: 'dummy-token' });

        expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
});