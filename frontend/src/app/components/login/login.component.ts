import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card shadow-sm mt-4">
          <div class="card-body p-4">
            <h3 class="card-title text-center mb-4">Login</h3>
            <form (submit)="login($event)">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input id="email" type="email" class="form-control" name="email" [(ngModel)]="email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input id="password" type="password" class="form-control" name="password" [(ngModel)]="password" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            <div *ngIf="error" class="alert alert-danger mt-3">{{error}}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  constructor(private auth: AuthService, private router: Router) {}

  login(evt: Event) {
    evt.preventDefault();
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: res => { this.auth.setToken(res.token); this.router.navigate(['/']); },
      error: err => { this.error = err.error?.error || 'Login failed'; }
    });
  }
}
