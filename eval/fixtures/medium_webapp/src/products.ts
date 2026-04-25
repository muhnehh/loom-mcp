export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: Category;
  tags: string[];
  variants: ProductVariant[];
  inventory: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  image?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  options: Record<string, string>;
  inventory: number;
}

export interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  tags?: string[];
  sortBy?: 'price' | 'name' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ProductService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async getProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    const params = new URLSearchParams();
    
    if (filters.category) params.set('category', filters.category);
    if (filters.priceMin) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const response = await fetch(`${this.baseUrl}/products?${params}`);
    return response.json();
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${id}`);
    if (!response.ok) throw new Error('Product not found');
    return response.json();
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/slug/${slug}`);
    if (!response.ok) throw new Error('Product not found');
    return response.json();
  }

  async getRelatedProducts(productId: string): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products/${productId}/related`);
    return response.json();
  }

  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/categories`);
    return response.json();
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/categories/slug/${slug}`);
    if (!response.ok) throw new Error('Category not found');
    return response.json();
  }

  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.json();
  }
}

export class CartService {
  private storageKey = 'shopping_cart';
  private items: CartItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.items = JSON.parse(stored);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  addItem(product: Product, quantity: number = 1, variantId?: string): void {
    const existing = this.items.find(
      item => item.product.id === product.id && item.variantId === variantId
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        product,
        quantity,
        variantId,
        addedAt: new Date()
      });
    }

    this.saveToStorage();
    this.dispatchUpdate();
  }

  removeItem(productId: string, variantId?: string): void {
    this.items = this.items.filter(
      item => !(item.product.id === productId && item.variantId === variantId)
    );
    this.saveToStorage();
    this.dispatchUpdate();
  }

  updateQuantity(productId: string, quantity: number, variantId?: string): void {
    const item = this.items.find(
      i => i.product.id === productId && i.variantId === variantId
    );
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId, variantId);
      } else {
        item.quantity = quantity;
        this.saveToStorage();
        this.dispatchUpdate();
      }
    }
  }

  clear(): void {
    this.items = [];
    this.saveToStorage();
    this.dispatchUpdate();
  }

  getSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  private dispatchUpdate(): void {
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: this.items }));
  }
}

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
  addedAt: Date;
}

export const productService = new ProductService();
export const cartService = new CartService();