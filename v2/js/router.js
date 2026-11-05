// ============================================
// router.js — Hash 路由
// ============================================

class Router {
  constructor() {
    this.routes = {};
    this.current = null;
    window.addEventListener('hashchange', () => this.resolve());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    this.current = hash;
    
    // 找到匹配的路由
    const handler = this.routes[hash] || this.routes['*'];
    if (handler) {
      handler();
    }
  }

  navigate(path) {
    window.location.hash = path;
  }

  start() {
    this.resolve();
  }
}

export const router = new Router();
