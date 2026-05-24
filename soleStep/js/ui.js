'use strict';

const UI = (() => {

  // Toast Notifications
  let toastTimer = null;

  /**
   * Show a toast notification
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} duration ms
   */
  function showToast(message, type = 'success', duration = 3000) {
    let toast = document.getElementById('ss-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ss-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    clearTimeout(toastTimer);
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Force reflow then animate in
    void toast.offsetHeight;
    toast.classList.add('toast-show');

    toastTimer = setTimeout(() => {
      toast.classList.remove('toast-show');
    }, duration);
  }

  // Product Card
  /**
   * Render a product card HTML string
   * @param {Object} product
   * @param {boolean} [animate=false] - stagger animation
   * @param {number} [index=0]
   */
  function renderProductCard(product, animate = false, index = 0) {
    const isDiscounted = product.discountedPrice && product.discountedPrice < product.price;
    const discount = isDiscounted
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : null;

    const stars = renderStars(product.rating || 0);
    const animStyle = animate
      ? `style="animation-delay:${index * 60}ms"`
      : '';

    const badge = product.badge
      ? `<span class="product-badge badge-${product.badge.toLowerCase().replace(/\s/g,'-')}">${product.badge}</span>`
      : '';

    // Original price is the higher price
    const originalPriceHtml = isDiscounted
      ? `<span class="product-price-original">$${product.price.toFixed(2)}</span>`
      : '';

    const currentPrice = isDiscounted ? product.discountedPrice : product.price;

    const outOfStock = product.inStock === false
      ? `<div class="product-out-of-stock-overlay"><span>Out of Stock</span></div>`
      : '';
      
    const imageUrl = product.image?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';
    const imageAlt = product.image?.alt || product.title;

    return `
      <article class="product-card${animate ? ' animate-fade-in' : ''}" 
               ${animStyle}
               data-product-id="${product.id}"
               role="article"
               aria-label="${product.title}">
        <a href="product.html?id=${product.id}" class="product-card-img-link" tabindex="-1">
          <div class="product-card-img-wrap">
            <img src="${imageUrl}" 
                 alt="${imageAlt}" 
                 class="product-card-img" 
                 loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'">
            ${badge}
            ${outOfStock}
            <button class="product-quick-add btn-primary${product.inStock === false ? ' disabled' : ''}"
                    onclick="event.preventDefault(); event.stopPropagation(); UI.quickAddToCart('${product.id}')"
                    ${product.inStock === false ? 'disabled' : ''}
                    aria-label="Quick add ${product.title} to cart">
              <i class="fa-solid fa-cart-shopping"></i> Quick Add
            </button>
          </div>
        </a>
        <div class="product-card-body">
          <div class="product-card-meta">
            <span class="product-brand">${product.tags?.[0] || 'SoleStep'}</span>
            <span class="product-category">${product.tags?.[1] || ''}</span>
          </div>
          <a href="product.html?id=${product.id}" class="product-name">${product.title}</a>
          <div class="product-rating">
            ${stars}
            <span class="product-review-count">(${product.reviews?.length || 0})</span>
          </div>
          <div class="product-pricing">
            <span class="product-price">$${currentPrice.toFixed(2)}</span>
            ${originalPriceHtml}
            ${discount ? `<span class="product-discount">-${discount}%</span>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Render multiple product cards into a container
   * @param {HTMLElement} container
   * @param {Array} products
   * @param {boolean} [animate=true]
   */
  function renderProductGrid(container, products, animate = true) {
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = renderEmptyState(
        '<i class="fa-solid fa-shoe-prints"></i>',
        'No products found',
        'Try adjusting your filters or search query.'
      );
      return;
    }

    container.innerHTML = products
      .map((p, i) => renderProductCard(p, animate, i))
      .join('');
  }

  // Stars
  /**
   * Render star rating HTML
   * @param {number} rating - 0–5
   */
  function renderStars(rating) {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return `
      <div class="stars" aria-label="Rating: ${rating} out of 5">
        ${'<span class="star star-full">★</span>'.repeat(full)}
        ${half ? '<span class="star star-half">★</span>' : ''}
        ${'<span class="star star-empty">★</span>'.repeat(empty)}
      </div>
    `;
  }

  // Cart Item
  /**
   * Render a single cart item row
   * @param {Object} item - cart item
   * @param {number} index - cart index
   */
  function renderCartItem(item, index) {
    const itemId = typeof item.id === 'string' ? `'${item.id}'` : item.id;
    return `
      <div class="cart-item animate-fade-in" data-cart-index="${index}" data-product-id="${item.id}">
        <a href="product.html?id=${item.id}" class="cart-item-img-link">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img"
               onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'">
        </a>
        <div class="cart-item-details">
          <div class="cart-item-header">
            <div>
              <p class="cart-item-brand">${item.brand}</p>
              <a href="product.html?id=${item.id}" class="cart-item-name">${item.name}</a>
              <div class="cart-item-meta">
                ${item.selectedSize  ? `<span class="cart-item-tag">Size: ${item.selectedSize}</span>` : ''}
                ${item.selectedColor ? `<span class="cart-item-tag"><span class="cart-item-color-dot" style="background:${item.selectedColor}"></span>${item.selectedColor}</span>` : ''}
              </div>
            </div>
            <button class="cart-item-remove"
                    onclick="CART.removeFromCart(${itemId}); renderCartPage();"
                    aria-label="Remove ${item.name}">
              ✕
            </button>
          </div>
          <div class="cart-item-footer">
            <div class="cart-qty-control">
              <button class="qty-btn"
                      onclick="CART.updateQuantity(${itemId}, ${item.quantity - 1}); renderCartPage();"
                      aria-label="Decrease quantity">−</button>
              <input type="number" class="qty-input" value="${item.quantity}" min="1" max="10"
                     onchange="CART.updateQuantity(${itemId}, parseInt(this.value) || 1); renderCartPage();"
                     aria-label="Quantity" style="width:44px;text-align:center;border:none;background:transparent;font-size:.9rem;font-weight:700;">
              <button class="qty-btn"
                      onclick="CART.updateQuantity(${itemId}, ${item.quantity + 1}); renderCartPage();"
                      aria-label="Increase quantity">+</button>
            </div>
            <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Empty States
  /**
   * Render a styled empty state block
   * @param {string} emoji
   * @param {string} title
   * @param {string} message
   * @param {string} [ctaHtml]
   */
  function renderEmptyState(emoji, title, message, ctaHtml = '') {
    return `
      <div class="empty-state">
        <div class="empty-state-emoji">${emoji}</div>
        <h3 class="empty-state-title">${title}</h3>
        <p class="empty-state-message">${message}</p>
        ${ctaHtml}
      </div>
    `;
  }

  // Loading Skeleton
  /**
   * Render N product card skeletons
   * @param {number} count
   */
  function renderSkeletons(count = 8) {
    return Array(count).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton skeleton-text skeleton-text-sm"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text skeleton-text-sm"></div>
          <div class="skeleton skeleton-text skeleton-text-price"></div>
        </div>
      </div>
    `).join('');
  }

  // Breadcrumb
  /**
   * Render breadcrumb navigation
   * @param {Array<{label:string, href?:string}>} crumbs
   */
  function renderBreadcrumb(crumbs) {
    const items = crumbs.map((c, i) => {
      const isLast = i === crumbs.length - 1;
      return isLast
        ? `<li class="breadcrumb-item active" aria-current="page">${c.label}</li>`
        : `<li class="breadcrumb-item"><a href="${c.href || '#'}">${c.label}</a></li>`;
    }).join('<li class="breadcrumb-sep">›</li>');

    return `<nav aria-label="Breadcrumb"><ol class="breadcrumb">${items}</ol></nav>`;
  }

  // Quick Add to Cart
  /**
   * Quick-add product from grid (picks first size)
   * @param {number} productId
   */
  async function quickAddToCart(productId) {
    try {
      // Show loading toast
      showToast('Adding to cart...', 'info', 1000);
      
      const product = await API.getProductById(productId);
      if (!product) return;
      
      // The API doesn't return inStock, so assume true
      const inStock = product.inStock !== false;
      if (!inStock) {
        showToast('This product is out of stock.', 'error');
        return;
      }

      // API products don't have explicit sizes/colors in this mock
      const defaultSize = product.sizes ? product.sizes[Math.floor(product.sizes.length / 2)] : null;
      CART.addItem(product, 1, defaultSize, product.colors?.[0] ?? null);
      showToast(`${product.title} added to cart!`, 'success');
    } catch (err) {
      showToast('Could not add item. Try again.', 'error');
    }
  }

  // Form Helpers
  /**
   * Set loading state on a button
   * @param {HTMLButtonElement} btn
   * @param {boolean} loading
   * @param {string} [loadingText]
   */
  function setButtonLoading(btn, loading, loadingText = 'Loading...') {
    if (!btn) return;
    if (loading) {
      btn._originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px"></span> ${loadingText}`;
    } else {
      btn.disabled = false;
      btn.innerHTML = btn._originalText || loadingText;
    }
  }

  /**
   * Show/hide an inline form error
   * @param {string} fieldId
   * @param {string|null} message - null clears error
   */
  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    let errEl = field.parentElement.querySelector('.field-error');

    if (message) {
      field.classList.add('input-error');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'field-error';
        field.parentElement.appendChild(errEl);
      }
      errEl.textContent = message;
    } else {
      field.classList.remove('input-error');
      if (errEl) errEl.remove();
    }
  }

  /**
   * Clear all errors in a form
   * @param {HTMLFormElement} form
   */
  function clearFormErrors(form) {
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    form.querySelectorAll('.field-error').forEach(el => el.remove());
  }

  // Modal
  /**
   * Show a simple modal dialog
   * @param {string} title
   * @param {string} bodyHtml
   * @param {Array<{label:string, action:function, primary?:boolean}>} actions
   */
  function showModal(title, bodyHtml, actions = []) {
    const existing = document.getElementById('ss-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'ss-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', title);

    const actionButtons = actions.map(a => `
      <button class="${a.primary ? 'btn-primary' : 'btn-secondary'} modal-action-btn"
              data-action="${encodeURIComponent(a.label)}">
        ${a.label}
      </button>
    `).join('');

    modal.innerHTML = `
      <div class="modal-content animate-scale-in">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modal-close-btn" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${actions.length ? `<div class="modal-footer">${actionButtons}</div>` : ''}
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close handlers
    const close = () => {
      modal.remove();
      document.body.style.overflow = '';
    };

    modal.querySelector('#modal-close-btn').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    // Action buttons
    modal.querySelectorAll('.modal-action-btn').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        if (actions[i]?.action) actions[i].action();
        close();
      });
    });

    // Close on Escape
    const escHandler = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
    document.addEventListener('keydown', escHandler);

    return { close };
  }

  // Scroll-reveal Init
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // Header scroll shadow
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Init
  function init() {
    initHeaderScroll();
    initScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    showToast,
    renderProductCard,
    renderProductGrid,
    renderStars,
    renderCartItem,
    renderEmptyState,
    renderSkeletons,
    renderBreadcrumb,
    quickAddToCart,
    setButtonLoading,
    setFieldError,
    clearFormErrors,
    showModal,
    initScrollReveal,
    initHeaderScroll,
  };
})();

window.UI = UI;
