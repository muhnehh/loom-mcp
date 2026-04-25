export interface Route {
  path: string;
  name: string;
  component: string;
  meta?: RouteMeta;
  children?: Route[];
  guards?: Guard[];
}

export interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
  roles?: string[];
  layout?: string;
}

export interface Guard {
  check(): boolean | Promise<boolean>;
  redirect?: string;
}

export interface Router {
  currentRoute: Route | null;
  history: string[];
  push(path: string): void;
  replace(path: string): void;
  go(n: number): void;
  back(): void;
  forward(): void;
}

export function createRouter(routes: Route[]): Router {
  const history: string[] = [];
  let currentRoute: Route | null = null;
  let currentIndex = -1;

  function findRoute(path: string): Route | null {
    for (const route of routes) {
      if (route.path === path) return route;
      if (route.children) {
        const child = findRouteInChildren(path, route.children);
        if (child) return child;
      }
    }
    return null;
  }

  function findRouteInChildren(path: string, children: Route[]): Route | null {
    for (const child of children) {
      if (child.path === path) return child;
      if (child.children) {
        const found = findRouteInChildren(path, child.children);
        if (found) return found;
      }
    }
    return null;
  }

  function navigate(path: string, replace: boolean = false): void {
    const route = findRoute(path);
    if (!route) {
      console.warn(`Route not found: ${path}`);
      return;
    }

    if (replace && currentIndex >= 0) {
      history[currentIndex] = path;
    } else {
      history.push(path);
      currentIndex++;
    }

    currentRoute = route;
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      currentIndex = history.length - 1;
      currentRoute = findRoute(window.location.pathname);
    });
  }

  return {
    get currentRoute() { return currentRoute; },
    get history() { return [...history]; },
    push(path: string) { navigate(path, false); },
    replace(path: string) { navigate(path, true); },
    go(n: number) {
      currentIndex += n;
      if (currentIndex >= 0 && currentIndex < history.length) {
        currentRoute = findRoute(history[currentIndex]);
        window.history.pushState({}, '', history[currentIndex]);
      }
    },
    back() { this.go(-1); },
    forward() { this.go(1); }
  };
}

export function withAuth Guard (guard: Guard, redirect: string = '/login'): Guard {
  return {
    async check() {
      const allowed = await guard.check();
      if (!allowed && redirect) {
        window.location.href = redirect;
      }
      return allowed;
    }
  };
}

export const routes: Route[] = [
  { path: '/', name: 'home', component: 'HomePage' },
  { path: '/products', name: 'products', component: 'ProductsPage' },
  { path: '/products/:id', name: 'product-detail', component: 'ProductDetailPage' },
  { path: '/cart', name: 'cart', component: 'CartPage' },
  { path: '/checkout', name: 'checkout', component: 'CheckoutPage', meta: { requiresAuth: true } },
  { path: '/account', name: 'account', component: 'AccountPage', meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: 'LoginPage' },
  { path: '/register', name: 'register', component: 'RegisterPage' },
  { path: '/admin', name: 'admin', component: 'AdminPage', meta: { requiresAuth: true, roles: ['admin'] } }
];