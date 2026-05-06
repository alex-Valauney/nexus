import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-5">
        <div class="card shadow-sm mt-4">
          <div class="card-body p-4">
            <h3 class="card-title text-center mb-4">Register</h3>
            <form (submit)="register($event)">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" name="name" [(ngModel)]="name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" name="email" [(ngModel)]="email" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" name="password" [(ngModel)]="password" required>
              </div>
              <div class="mb-4">
                <label class="form-label">Role</label>
                <select class="form-select" name="role" [(ngModel)]="role">
                  <option value="CLIENT">Client</option>
                  <option value="SELLER">Seller</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary w-100">Register</button>
            </form>
            <div *ngIf="error" class="alert alert-danger mt-3">{{error}}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name=''; email=''; password=''; role='CLIENT'; error='';
  constructor(private auth: AuthService, private router: Router) {}

  register(evt: Event) {
    evt.preventDefault();
    this.error='';
    this.auth.register({ name: this.name, email: this.email, password: this.password, role: this.role }).subscribe({
      next: res => { this.auth.setToken(res.token); this.router.navigate(['/']); },
      error: err => { this.error = err.error?.error || 'Register failed'; }
    });
  }
}
