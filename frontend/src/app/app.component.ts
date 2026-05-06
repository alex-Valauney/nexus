import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthService} from "./services/auth.service";
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
    public isLoggedIn$: Observable<boolean>;
    public currentUser$: Observable<any>;
    public isSeller$: Observable<boolean>;
    public isClient$: Observable<boolean>;
    public cartCount$: Observable<number>;

    constructor(private authService: AuthService, private cartService: CartService) {
        this.isLoggedIn$ = this.authService.isLoggedIn$;
        this.currentUser$ = this.authService.currentUser$;
        this.isSeller$ = this.authService.isSeller$;
        this.isClient$ = this.authService.currentUser$.pipe(
          map(u => u?.role === 'CLIENT')
        );
        this.cartCount$ = this.cartService.getCart().pipe(
          map(items => items.reduce((count, item) => count + item.quantity, 0))
        );
    }


    logout(): void {
        this.authService.logout();
    }
}
