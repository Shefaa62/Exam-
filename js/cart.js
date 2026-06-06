'use strict';

const CART = (() => {
  const CART_KEY = 'soleStep_cart';

  // Storage Helpers
  /** Check if localStorage is available */
  function isStorageAvailable() {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return true;
    } catch {
      return false;
    }
  }

  /** Load cart from localStorage */
  function load() {
    if (!isStorageAvailable()) return [];
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /** Persist cart to localStorage */
  function save(cart) {
    if (!isStorageAvailable()) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // Storage full or unavailable
    }
    updateCartBadge();
  }

  /** Get current cart items */
  function getItems() {
    return load();
  }

  // Cart Operations
  /**
   * Add item to cart (or increase quantity if exists)
   * @param {Object} product - Product object from API
   * @param {number} [quantity=1]
   * @param {number|null} [size=null] - Selected shoe size
   * @param {string|null} [color=null] - Selected color hex
   */
  function addItem(product, quantity = 1, size = null, color = null) {
    const cart = load();

    // Find existing item with same product + size + color
    const existingIndex = cart.findIndex(item =>
      item.id === product.id &&
      item.selectedSize  === size &&
      item.selectedColor === color
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity = Math.min(
        cart[existingIndex].quantity + quantity,
        10 // max per variant
      );
    } else {
      const currentPrice = (product.discountedPrice !== undefined && product.discountedPrice < product.price) ? product.discountedPrice : product.price;
      cart.push({
        id:             product.id,
        name:           product.title || product.name,
        brand:          product.tags?.[0] || product.brand || 'SoleStep',
        price:          currentPrice,
        image:          product.image?.url || product.image,
        category:       product.tags?.[1] || product.category || '',
        selectedSize:   size,
        selectedColor:  color,
        quantity:       Math.min(quantity, 10),
        addedAt:        new Date().toISOString(),
      });
    }

    save(cart);
    return cart;
  }

  /**
   * Remove item from cart
   * @param {number} cartIndex - index in cart array
   */
  function removeItem(cartIndex) {
    const cart = load();
    cart.splice(cartIndex, 1);
    save(cart);
    return cart;
  }

  /**
   * Update quantity for a cart item
   * @param {number} cartIndex
   * @param {number} quantity
   */
  function updateQuantity(cartIndex, quantity) {
    const cart = load();
    if (!cart[cartIndex]) return cart;

    if (quantity <= 0) {
      return removeItem(cartIndex);
    }

    cart[cartIndex].quantity = Math.min(Math.max(1, quantity), 10);
    save(cart);
    return cart;
  }

  /**
   * Clear entire cart
   */
  function clear() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
  }

  // Calculations
  /** Total number of items (sum of quantities) */
  function getItemCount() {
    return load().reduce((sum, item) => sum + item.quantity, 0);
  }

  /** Subtotal before tax/shipping */
  function getSubtotal() {
    return load().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /** Estimated shipping (free over $100) */
  function getShipping() {
    const subtotal = getSubtotal();
    return subtotal >= 100 ? 0 : 9.99;
  }

  /** Tax (8.5%) */
  function getTax() {
    return getSubtotal() * 0.085;
  }

  /** Grand total */
  function getTotal() {
    return getSubtotal() + getShipping() + getTax();
  }

  /** Format price as currency string */
  function formatPrice(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /** Get cart summary object */
  function getSummary() {
    const subtotal  = getSubtotal();
    const shipping  = getShipping();
    const tax       = getTax();
    const total     = getTotal();
    const itemCount = getItemCount();

    return {
      items:     getItems(),
      itemCount,
      subtotal,
      shipping,
      tax,
      total,
      freeShippingThreshold: 100,
      freeShippingRemaining: Math.max(0, 100 - subtotal),
      formatted: {
        subtotal:  formatPrice(subtotal),
        shipping:  shipping === 0 ? 'FREE' : formatPrice(shipping),
        tax:       formatPrice(tax),
        total:     formatPrice(total),
      },
    };
  }

  // Badge Update
  /** Update cart count badge in header */
  function updateCartBadge() {
    const count = getItemCount();
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  // Coupon / Discount
  const VALID_COUPONS = {
    'SOLE10':  { type: 'percent', value: 10, label: '10% off' },
    'FIRST20': { type: 'percent', value: 20, label: '20% off your first order' },
    'SAVE15':  { type: 'fixed',   value: 15, label: '$15 off' },
    'STEP5':   { type: 'fixed',   value: 5,  label: '$5 off' },
  };

  /**
   * Validate and apply a coupon code
   * @param {string} code
   */
  function applyCoupon(code) {
    const coupon = VALID_COUPONS[code.toUpperCase().trim()];
    if (!coupon) throw new Error('Invalid coupon code. Try SOLE10 or FIRST20.');
    
    const subtotal = getSubtotal();
    const discount = coupon.type === 'percent'
      ? subtotal * (coupon.value / 100)
      : Math.min(coupon.value, subtotal);

    return {
      code:     code.toUpperCase().trim(),
      discount,
      label:    coupon.label,
      formatted: formatPrice(discount),
    };
  }

  // Init
  function init() {
    updateCartBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ID-based operations (required API spec)
  /**
   * Remove item from cart by product ID
   * @param {string|number} id - Product ID
   */
  function removeFromCart(id) {
    const cart = load();
    const index = cart.findIndex(item => item.id == id);
    if (index > -1) {
      cart.splice(index, 1);
      save(cart);
    }
    return cart;
  }

  /**
   * Update quantity for an item by product ID.
   * If quantity <= 0, removes the item.
   * @param {string|number} id - Product ID
   * @param {number} quantity
   */
  function updateQuantityById(id, quantity) {
    const cart = load();
    const index = cart.findIndex(item => item.id == id);
    if (index === -1) return cart;

    if (quantity <= 0) {
      return removeFromCart(id);
    }

    cart[index].quantity = Math.min(Math.max(1, quantity), 10);
    save(cart);
    return cart;
  }

  // Public API
  // Aliases to match the required API spec
  const getCart = getItems;
  const addToCart = addItem;
  const clearCart = clear;
  function getCartTotal() {
    return { subtotal: getSubtotal(), itemCount: getItemCount() };
  }

  return {
    // Original index-based functions (used by cart.html rendering)
    getItems,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    getItemCount,
    getSubtotal,
    getShipping,
    getTax,
    getTotal,
    getSummary,
    formatPrice,
    applyCoupon,
    updateCartBadge,
    // Required id-based API
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity: updateQuantityById,
    clearCart,
    getCartTotal,
  };
})();

window.CART = CART;
