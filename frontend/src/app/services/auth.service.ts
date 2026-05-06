import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:8081/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(!!this.getToken());

  constructor(private http: HttpClient, private router: Router) {}

  // Crée un Observable qui émet les infos user dès qu'on est loggé
  public currentUser$: Observable<any> = this.loggedIn.asObservable().pipe(
      map(isLogged => isLogged ? this.getUserData() : null)
  );

  public isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(
      map(user => !!user)
  );

  public isSeller$: Observable<boolean> = this.currentUser$.pipe(map(u => u?.role === 'SELLER'));

  register(body: any) { return this.http.post<any>(`${this.base}/register`, body); }
  login(body: any) { return this.http.post<any>(`${this.base}/login`, body); }

  getUserData(): any {
      const token = this.getToken();
      if (!token) return null;
      try {
          // On décode la partie centrale (payload) du JWT
          return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
          return null;
      }
  }

  setToken(token: string) {
      localStorage.setItem('token', token);
      this.loggedIn.next(true);
  }
  getToken(): string | null { return localStorage.getItem('token'); }
  logout() {
      localStorage.removeItem('token');
      this.loggedIn.next(false);
      this.router.navigate(['/login']);
  }

  isSeller(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.role === 'SELLER';
    } catch { return false; }
  }

  isClient(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.role === 'CLIENT';
    } catch { return false; }
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.userId || payload.sub || null;

    } catch(e) { 
      console.error('Token error:', e);
      return null; 
    }
  }
}
