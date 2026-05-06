import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = 'http://localhost:8082/api/products';
  constructor(private http: HttpClient) {}

  listAll(sortBy: string = 'name', sortOrder: string = 'asc', minPrice?: number, maxPrice?: number, categories?: string[]) {
    let params = new HttpParams()
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);
    if (minPrice !== undefined && minPrice !== null) {
      params = params.set('minPrice', minPrice.toString());
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      params = params.set('maxPrice', maxPrice.toString());
    }
    if (categories && categories.length > 0) {
      params = params.set('categories', categories.join(','));
    }
    return this.http.get<any[]>(this.base, { params });
  }

  getCategories() {
    return this.http.get<string[]>(this.base + '/categories');
  }

  getOne(id: string) { return this.http.get(this.base + '/' + id); }
  create(body: any) { return this.http.post(this.base, body); }
  update(id: string, body: any) { return this.http.put(this.base + '/' + id, body); }
  delete(id: string) { return this.http.delete(this.base + '/' + id); }
}