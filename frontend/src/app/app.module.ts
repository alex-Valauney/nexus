import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { OrderListComponent } from './components/order-list/order-list.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { SellerDashboardComponent } from './components/seller-dashboard/seller-dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MediaManagerComponent } from './components/media-manager/media-manager.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { TokenInterceptor } from './services/token.interceptor';
import { AuthGuard } from './services/auth.guard';
import { SellerGuard } from './services/seller.guard';

const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'order', component: OrderListComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'seller', component: SellerDashboardComponent, canActivate: [SellerGuard] }
];

// comment

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProductListComponent,
    OrderListComponent,
    SellerDashboardComponent,
    ProfileComponent,
    MediaManagerComponent,
    CartComponent,
    CheckoutComponent
  ],
  imports: [BrowserModule, HttpClientModule, FormsModule, RouterModule.forRoot(routes)],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
