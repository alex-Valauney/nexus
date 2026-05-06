import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

// Mocks
class MockAuthService {
  getToken(): string | null {
    return null;
  }
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('when user is logged in', () => {
    beforeEach(() => {
      spyOn(authService, 'getToken').and.returnValue('some-token');
    });

    it('should return true and allow navigation', () => {
      const result = guard.canActivate();

      expect(result).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('when user is NOT logged in', () => {
    beforeEach(() => {
      spyOn(authService, 'getToken').and.returnValue(null);
    });

    it('should return false and redirect to login', () => {
      const result = guard.canActivate();

      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});