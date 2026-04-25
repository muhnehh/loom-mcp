export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export async function getProducts(category?: string): Promise<Product[]> {
  const url = category ? `/api/products?category=${category}` : '/api/products';
  const response = await fetch(url);
  return response.json();
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${id}`);
  return response.json();
}

export async function createCart(): Promise<Cart> {
  return { items: [], total: 0 };
}

export async function addToCart(cart: Cart, productId: string, quantity: number): Promise<Cart> {
  const product = await getProduct(productId);
  const existing = cart.items.find(item => item.product.id === productId);
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product, quantity });
  }
  
  cart.total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return cart;
}

export async function checkout(cart: Cart): Promise<{ orderId: string }> {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ items: cart.items, total: cart.total })
  });
  return response.json();
}