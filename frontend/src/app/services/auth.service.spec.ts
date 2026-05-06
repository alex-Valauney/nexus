// auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  // Mock localStorage
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Mock de localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return localStorageMock[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete localStorageMock[key];
    });

    spyOn(localStorage, 'clear').and.callFake(() => {
      localStorageMock = {};
    });

    // Mock du Router
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'il n'y a pas de requêtes HTTP non traitées
    localStorageMock = {}; // Réinitialise le localStorage mocké
  });

  // Test 1: Création du service
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test 2: Login
  describe('login', () => {
    it('should send POST request to login endpoint', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        token: 'jwt-token-123'
      };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should NOT store token in localStorage on successful login', () => {
      const mockResponse = { token: 'jwt-token-123' };

      service.login({ email: 'test@example.com', password: 'password123' })
        .subscribe(() => {
          expect(localStorage.setItem).not.toHaveBeenCalled();
        });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
      req.flush(mockResponse);
    });

    it('should handle login errors', () => {
      service.login({ email: 'wrong@example.com', password: 'wrong' })
        .subscribe({
          next: () => fail('Should have failed'),
          error: (error) => {
            expect(error.status).toBe(401);
          }
        });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });
  });

  // Test 3: tests pour setToken
  describe('setToken', () => {
    it('should store token in localStorage', () => {
      service.setToken('new-jwt-token');

      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-jwt-token');
    });

    it('should update isLoggedIn$ to true when token is valid', (done) => {
      const payload = btoa(JSON.stringify({ userId: '123' }));
      const validToken = `header.${payload}.signature`;

      service.isLoggedIn$.subscribe(isLoggedIn => {
        if (isLoggedIn) {
          expect(isLoggedIn).toBeTrue();
          done();
        }
      });

      service.setToken(validToken);
    });
  });

  // Test 4: Register
  describe('register', () => {
    it('should send POST request to register endpoint', () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      };
      const mockResponse = {
        id: 'user-456',
        email: 'new@example.com'
      };

      service.register(userData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8081/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockResponse);
    });
  });

  // Test 4: Logout
  describe('logout', () => {
    it('should remove token from localStorage', () => {
      // Simuler un token existant
      localStorageMock['token'] = 'existing-token';

      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock['token']).toBeUndefined();
    });

    it('should update isLoggedIn$ to false', (done) => {
      // Simuler un login avec un token valide
      const payload = btoa(JSON.stringify({ userId: '123' }));
      const validToken = `header.${payload}.signature`;
      service.setToken(validToken);

      // Réinitialiser les appels
      (localStorage.setItem as jasmine.Spy).calls.reset();

      // S'abonner à l'observable
      let subscription: any;
      subscription = service.isLoggedIn$.subscribe({
        next: (isLoggedIn) => {
          // On s'attend à recevoir false après logout
          if (!isLoggedIn) {
            expect(isLoggedIn).toBeFalse();
            if (subscription) {
              subscription.unsubscribe();
            }
            done();
          }
        },
        error: (err) => {
          fail(`Should not error: ${err}`);
          done();
        }
      });

      service.logout();
    });

    it('should navigate to login page', () => {
      service.logout();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // Test 6: getToken
  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorageMock['token'] = 'jwt-token-123';

      expect(service.getToken()).toBe('jwt-token-123');
    });

    it('should return null when no token', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  // Test 7: isSeller
  describe('isSeller', () => {
    it('should return false when no token', () => {
      expect(service.isSeller()).toBeFalse();
    });

    it('should return false for invalid token format', () => {
      localStorageMock['token'] = 'invalid.token.format';

      expect(service.isSeller()).toBeFalse();
    });

    it('should return true when token has SELLER role', () => {
      // Créer un token JWT mock avec role=SELLER
      const payload = btoa(JSON.stringify({ role: 'SELLER', sub: 'user123' }));
      const token = `header.${payload}.signature`;
      localStorageMock['token'] = token;

      expect(service.isSeller()).toBeTrue();
    });

    it('should return false when token has CLIENT role', () => {
      const payload = btoa(JSON.stringify({ role: 'CLIENT', sub: 'user123' }));
      const token = `header.${payload}.signature`;
      localStorageMock['token'] = token;

      expect(service.isSeller()).toBeFalse();
    });

    it('should return false when token has no role', () => {
      const payload = btoa(JSON.stringify({ sub: 'user123' }));
      const token = `header.${payload}.signature`;
      localStorageMock['token'] = token;

      expect(service.isSeller()).toBeFalse();
    });
  });

  // Test 8: getUserId
  describe('getUserId', () => {
    it('should return null when no token', () => {
      expect(service.getUserId()).toBeNull();
    });

    it('should return userId from payload', () => {
      const payload = btoa(JSON.stringify({ userId: '123', role: 'CLIENT' }));
      const token = `header.${payload}.signature`;
      localStorageMock['token'] = token;

      expect(service.getUserId()).toBe('123');
    });

    it('should return sub from payload when no userId', () => {
      const payload = btoa(JSON.stringify({ sub: '456', role: 'CLIENT' }));
      const token = `header.${payload}.signature`;
      localStorageMock['token'] = token;

      expect(service.getUserId()).toBe('456');
    });

    it('should return null when neither userId nor sub exists', () => {
      const payload = btoa(JSON.stringify({ role: 'CLIENT' }));
      const token = `header.${payload}.signature`;
      localStorageMock['token'] = token;

      expect(service.getUserId()).toBeNull();
    });

    it('should handle invalid token gracefully', () => {
      localStorageMock['token'] = 'invalid.token';

      expect(service.getUserId()).toBeNull();
    });

    it('should handle invalid base64 in payload', () => {
      const token = 'header.not-valid-base64.signature';
      localStorageMock['token'] = token;

      expect(service.getUserId()).toBeNull();
    });
  });
});