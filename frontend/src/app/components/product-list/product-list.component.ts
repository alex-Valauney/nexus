import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { MediaService } from '../../services/media.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  template: `
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <h3 class="mb-0">Products</h3>
      <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
        <input class="form-control" type="search" placeholder="Search products..." (input)="onSearch($any($event.target).value)" />
        <div class="d-flex gap-2">
          <select class="form-select flex-grow-1" (change)="onSortChange($any($event.target).value)" style="min-width: 140px;">
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="date-desc">Date (Newest)</option>
          </select>
          <button class="btn btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#filterCollapse">
            <i class="bi bi-filter"></i> Filters
          </button>
        </div>
      </div>
    </div>
    
    <div class="collapse mb-4" id="filterCollapse">
      <div class="card card-body">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label class="form-label fw-semibold">Price Range</label>
            <div class="d-flex gap-2">
              <input type="number" class="form-control" placeholder="Min" (input)="onPriceChange('min', $any($event.target).value)" />
              <input type="number" class="form-control" placeholder="Max" (input)="onPriceChange('max', $any($event.target).value)" />
            </div>
          </div>
          <div class="col-12 col-md-8">
            <label class="form-label fw-semibold">Categories</label>
            <div class="d-flex flex-wrap gap-2">
              <div *ngFor="let cat of availableCategories" class="form-check me-2">
                <input class="form-check-input" type="checkbox" [id]="cat" [value]="cat" (change)="onCategoryChange(cat, $any($event.target).checked)" />
                <label class="form-check-label" [for]="cat">{{cat}}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3" *ngFor="let p of filteredProducts">
        <div class="card product-card h-100">
          <div *ngIf="p.images && p.images.length" class="card-img-top text-center" style="padding:12px; height: 200px; display: flex; align-items: center; justify-content: center;">
            <img [src]="p.images[0].imagePath" alt="{{p.name}}" style="max-width:100%; max-height:100%; object-fit:contain" />
          </div>
          <div *ngIf="!p.images || !p.images.length" class="placeholder-img">
            <i class="bi bi-image text-muted" style="font-size: 2rem;"></i>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0 text-truncate" [title]="p.name">{{p.name}}</h5>
              <span class="badge bg-primary ms-2">{{p.price | currency}}</span>
            </div>
            <div class="small-id mb-2">ID: {{p.id || p._id}}</div>
            <p class="card-text product-description flex-grow-1 text-muted small">{{p.description}}</p>
            <div class="mt-auto pt-3">
              <button *ngIf="isLoggedIn$ | async" class="btn btn-outline-primary w-100" (click)="addToCart(p)">
                <i class="bi bi-cart-plus"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  isLoggedIn$: Observable<boolean>;
  isClient$: Observable<boolean>;
  currentSort: string = 'name-asc';
  availableCategories: string[] = [];
  selectedCategories: string[] = [];
  minPrice?: number;
  maxPrice?: number;

  constructor(
    private productService: ProductService, 
    private media: MediaService,
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isClient$ = this.authService.currentUser$.pipe(
      map(u => u?.role === 'CLIENT')
    );
  }
  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: (cats: string[]) => { this.availableCategories = cats; }
    });
    this.loadProducts();
  }

  loadProducts() {
    const [sortBy, sortOrder] = this.currentSort.split('-');
    this.productService.listAll(sortBy, sortOrder, this.minPrice, this.maxPrice, this.selectedCategories).subscribe({
      next: (data: any[]) => {
        this.products = data;
        this.onSearch((document.getElementById('fileSearch') as HTMLInputElement)?.value || '');
        for (const p of this.products) {
          const pid = p.id || p._id;
          this.media.byProduct(pid).subscribe({
            next: (meds: any[]) => { p.images = meds; },
            error: () => { p.images = []; }
          });
        }
      },
      error: () => {
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  onSearch(term: string) {
    const t = (term || '').toLowerCase().trim();
    if (!t) { this.filteredProducts = this.products; return; }
    this.filteredProducts = this.products.filter(p => (p.name || '').toLowerCase().includes(t) || (p.description || '').toLowerCase().includes(t));
  }

  onSortChange(value: string) {
    this.currentSort = value;
    this.loadProducts();
  }

  onPriceChange(type: 'min' | 'max', value: string) {
    const num = value ? parseFloat(value) : NaN;
    if (type === 'min') this.minPrice = isNaN(num) ? undefined : num;
    else this.maxPrice = isNaN(num) ? undefined : num;
    this.loadProducts();
  }

  onCategoryChange(category: string, checked: boolean) {
    if (checked) {
      if (!this.selectedCategories.includes(category)) {
        this.selectedCategories.push(category);
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    }
    this.loadProducts();
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }
}
