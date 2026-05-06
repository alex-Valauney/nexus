import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

// Mock du service AuthService
class MockAuthService {
  login(credentials: any) {
    return of({ token: 'fake-jwt-token' });
  }

  setToken(token: string) {
    // Mock implementation
  }
}

// Mock du Router
class MockRouter {
  navigate(path: string[]) {
    // Mock implementation
    return Promise.resolve(true);
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule], // Important pour ngModel
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // Test 1: Création du composant
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

 // Test 2: Vérification des propriétés initiales
  it('should initialize with empty email, password and error', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.error).toBe('');
  });

  // Test 3: Vérification du template
  it('should render login form elements', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('h3').textContent).toContain('Login');
    expect(compiled.querySelector('input[name="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[type="password"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
    expect(compiled.querySelector('button').textContent).toContain('Login');
  });

  // Test 4: Liaison two-way avec ngModel pour email
  it('should bind email input to component property', () => {
    const emailInput = fixture.nativeElement.querySelector('input[name="email"]');

    // Simuler la saisie utilisateur
    emailInput.value = 'test@example.com';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.email).toBe('test@example.com');
    expect(emailInput.value).toBe('test@example.com');
  });

  // Test 5: Liaison two-way avec ngModel pour password
  it('should bind password input to component property', () => {
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');

    passwordInput.value = 'secret123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.password).toBe('secret123');
    expect(passwordInput.value).toBe('secret123');
  });

  // Test 6: Méthode login() - appel avec preventDefault
  it('should call preventDefault on form submit', () => {
    const mockEvent = {
      preventDefault: jasmine.createSpy('preventDefault')
    } as unknown as Event;

    component.login(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  // Test 7: Login réussi avec Spy
  it('should handle successful login', fakeAsync(() => {
    // Créer des spies
    const loginSpy = spyOn(authService, 'login').and.returnValue(
      of({ token: 'fake-jwt-token' })
    );
    const setTokenSpy = spyOn(authService, 'setToken');
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    // Remplir le formulaire
    component.email = 'user@example.com';
    component.password = 'password123';

    // Simuler la soumission
    const mockEvent = { preventDefault: jasmine.createSpy('preventDefault') } as unknown as Event;
    component.login(mockEvent);

    // Vérifications
    expect(loginSpy).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    });

    // Attendre l'exécution asynchrone
    tick();

    expect(setTokenSpy).toHaveBeenCalledWith('fake-jwt-token');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
    expect(component.error).toBe('');
  }));

  // Test 9: Login échoué avec erreur générique
  it('should show generic error when no specific error message', fakeAsync(() => {
    const loginSpy = spyOn(authService, 'login').and.returnValue(
      throwError(() => ({ error: null }))
    );

    const mockEvent = { preventDefault: jasmine.createSpy('preventDefault') } as unknown as Event;
    component.login(mockEvent);

    tick();

    expect(component.error).toBe('Login failed');
  }));

  // Test 11: Vérifier que l'erreur n'est pas affichée initialement
  it('should not show error div initially', () => {
    const errorDiv = fixture.nativeElement.querySelector('div[style*="color:red"]');
    expect(errorDiv).toBeFalsy();
  });

  // Test 13: Test d'intégration du formulaire
  it('should update component properties when user types in form', () => {
    const emailInput = fixture.nativeElement.querySelector('input[name="email"]');
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');

    // Simuler la saisie dans le champ email
    emailInput.value = 'new@email.com';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.email).toBe('new@email.com');

    // Simuler la saisie dans le champ password
    passwordInput.value = 'newpassword';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.password).toBe('newpassword');
  });

  // Test 14: Vérification de la soumission du formulaire via bouton
  it('should trigger login when submit button is clicked', () => {
    // Spy sur la méthode login du composant
    const loginSpy = spyOn(component, 'login').and.callThrough();

    // Spy sur authService.login pour éviter un vrai appel HTTP
    spyOn(authService, 'login').and.returnValue(of({ token: 'token' }));

    // Remplir le formulaire
    component.email = 'test@example.com';
    component.password = 'password123';
    fixture.detectChanges();

    // Trouver et cliquer sur le bouton
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    const form = fixture.nativeElement.querySelector('form');

    // Simuler l'événement submit du formulaire
    const submitEvent = new Event('submit');
    spyOn(submitEvent, 'preventDefault');
    form.dispatchEvent(submitEvent);

    expect(loginSpy).toHaveBeenCalled();
    expect(submitEvent.preventDefault).toHaveBeenCalled();
  });

  // Test 15: Test avec des valeurs vides
  it('should handle empty credentials', () => {
    spyOn(authService, 'login').and.returnValue(
      throwError(() => ({ error: { error: 'Email and password required' } }))
    );

    component.email = '';
    component.password = '';

    const mockEvent = { preventDefault: jasmine.createSpy('preventDefault') } as unknown as Event;
    component.login(mockEvent);

    expect(authService.login).toHaveBeenCalledWith({
      email: '',
      password: ''
    });
  });

  // Test 16: Vérification de l'accessibilité
  it('should have proper labels for accessibility', () => {
    const emailLabel = fixture.nativeElement.querySelector('label[for="email"]') ||
                       fixture.nativeElement.querySelector('label:has(input[name="email"])');
    const passwordLabel = fixture.nativeElement.querySelector('label[for="password"]') ||
                         fixture.nativeElement.querySelector('label:has(input[type="password"])');

    expect(emailLabel).toBeTruthy();
    expect(emailLabel.textContent).toContain('Email');

    expect(passwordLabel).toBeTruthy();
    expect(passwordLabel.textContent).toContain('Password');
  });
});