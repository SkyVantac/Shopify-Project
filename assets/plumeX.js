/* =============================================
   PlumeX — Conversion JS 2026
   ============================================= */
(function () {
  'use strict';

  /* ── HEADER SCROLL EFFECT ── */
  function initHeader() {
    const header = document.querySelector('.px-header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── STICKY ATC ── */
  function initStickyATC() {
    const atcSection = document.querySelector('.px-quantity-row');
    const stickyBar = document.querySelector('.px-sticky-atc');
    if (!atcSection || !stickyBar) return;
    const io = new IntersectionObserver(
      ([entry]) => stickyBar.classList.toggle('visible', !entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(atcSection);
    const stickyBtn = stickyBar.querySelector('.px-atc-btn');
    const mainBtn = document.querySelector('.px-quantity-row .px-atc-btn');
    if (stickyBtn && mainBtn) {
      stickyBtn.addEventListener('click', () => mainBtn.click());
    }
  }

  /* ── GALLERY ── */
  function initGallery() {
    const thumbs = document.querySelectorAll('.px-gallery-thumb');
    const mainImg = document.querySelector('.px-gallery-main img');
    if (!thumbs.length || !mainImg) return;
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const src = thumb.querySelector('img')?.src;
        if (src) {
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.src = src.replace('_100x', '_800x');
            mainImg.style.opacity = '1';
          }, 150);
        }
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
    mainImg.style.transition = 'opacity 0.2s ease';
  }

  /* ── QUANTITY INPUT ── */
  function initQuantity() {
    document.querySelectorAll('.px-quantity-input').forEach(wrapper => {
      const minus = wrapper.querySelector('[data-qty="minus"]');
      const plus = wrapper.querySelector('[data-qty="plus"]');
      const val = wrapper.querySelector('.px-qty-value');
      if (!val) return;
      minus?.addEventListener('click', () => {
        const n = Math.max(1, parseInt(val.value || val.textContent) - 1);
        if (val.tagName === 'INPUT') val.value = n;
        else val.textContent = n;
      });
      plus?.addEventListener('click', () => {
        const n = parseInt(val.value || val.textContent) + 1;
        if (val.tagName === 'INPUT') val.value = n;
        else val.textContent = n;
      });
    });
  }

  /* ── CART DRAWER ── */
  function initCartDrawer() {
    const overlay = document.querySelector('.px-cart-overlay');
    const drawer = document.querySelector('.px-cart-drawer');
    const openBtns = document.querySelectorAll('[data-open-cart]');
    const closeBtns = document.querySelectorAll('[data-close-cart]');
    if (!drawer) return;

    function openCart() {
      overlay?.classList.add('open');
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeCart() {
      overlay?.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }

    openBtns.forEach(btn => btn.addEventListener('click', openCart));
    closeBtns.forEach(btn => btn.addEventListener('click', closeCart));
    overlay?.addEventListener('click', closeCart);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeCart();
    });

    window.PXCart = { open: openCart, close: closeCart };
  }

  /* ── MOBILE MENU ── */
  function initMobileMenu() {
    const menu = document.querySelector('.px-mobile-nav');
    const openBtn = document.querySelector('[data-open-menu]');
    const closeBtn = document.querySelector('[data-close-menu]');
    if (!menu) return;

    openBtn?.addEventListener('click', () => {
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    closeBtn?.addEventListener('click', () => {
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  /* ── ADD TO CART ── */
  function initAddToCart() {
    document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', async function (e) {
        e.preventDefault();
        const form = this.closest('form') || document.querySelector('[data-product-form]');
        const variantId = form?.querySelector('[name="id"]')?.value
          || this.dataset.variantId;
        if (!variantId) return;

        const qty = parseInt(
          form?.querySelector('.px-qty-value')?.value
          || form?.querySelector('.px-qty-value')?.textContent
          || 1
        );

        this.classList.add('loading');
        this.disabled = true;

        try {
          const res = await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: variantId, quantity: qty })
          });
          if (!res.ok) throw new Error('Add to cart failed');
          const item = await res.json();
          await refreshCart();
          window.PXCart?.open();
          showToast('Ajouté au panier', item.title, 'success');
        } catch (err) {
          showToast('Erreur', 'Impossible d\'ajouter au panier.', 'error');
        } finally {
          this.classList.remove('loading');
          this.disabled = false;
        }
      });
    });
  }

  /* ── REFRESH CART ── */
  async function refreshCart() {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      updateCartUI(cart);
    } catch (_) {}
  }

  function updateCartUI(cart) {
    const counts = document.querySelectorAll('.px-cart-count, .px-cart-count-bubble');
    counts.forEach(el => {
      el.textContent = cart.item_count;
      el.style.display = cart.item_count > 0 ? 'flex' : 'none';
    });

    const subtotalEls = document.querySelectorAll('.px-cart-subtotal-price');
    const formatted = formatMoney(cart.total_price);
    subtotalEls.forEach(el => el.textContent = formatted);

    const freeShipping = 6000; // €60 free shipping threshold (in cents)
    const remaining = Math.max(0, freeShipping - cart.total_price);
    const fills = document.querySelectorAll('.px-cart-free-shipping-fill');
    const msgs = document.querySelectorAll('.px-cart-free-shipping');
    fills.forEach(fill => {
      fill.style.width = Math.min(100, (cart.total_price / freeShipping) * 100) + '%';
    });
    msgs.forEach(msg => {
      if (remaining > 0) {
        msg.querySelector('span') && (msg.querySelector('span').textContent =
          `Plus que ${formatMoney(remaining)} pour la livraison offerte !`);
      } else {
        msg.querySelector('span') && (msg.querySelector('span').textContent =
          '🎉 Livraison offerte débloquée !');
      }
    });
  }

  function formatMoney(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  /* ── TOAST NOTIFICATION ── */
  function showToast(title, desc, type = 'success') {
    let toast = document.querySelector('.px-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'px-toast';
      toast.innerHTML = `
        <svg class="px-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <div class="px-toast-title"></div>
          <div class="px-toast-desc"></div>
        </div>
      `;
      document.body.appendChild(toast);
    }
    toast.querySelector('.px-toast-title').textContent = title;
    toast.querySelector('.px-toast-desc').textContent = desc;
    toast.style.background = type === 'error' ? '#c0392b' : 'var(--px-navy)';

    clearTimeout(toast._timeout);
    toast.classList.add('show');
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  /* ── SCROLL REVEAL ── */
  function initReveal() {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  }

  /* ── BACK TO TOP ── */
  function initBackToTop() {
    const btn = document.querySelector('.px-back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── COUNTDOWN TIMER ── */
  function initCountdown() {
    document.querySelectorAll('[data-countdown]').forEach(el => {
      const end = new Date(el.dataset.countdown).getTime();
      function tick() {
        const diff = end - Date.now();
        if (diff <= 0) { el.textContent = 'Expiré'; return; }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      }
      tick();
      setInterval(tick, 1000);
    });
  }

  /* ── STOCK BAR ANIMATION ── */
  function initStockBar() {
    document.querySelectorAll('.px-stock-bar-fill').forEach(fill => {
      const target = fill.dataset.width || fill.style.width;
      fill.style.width = '0%';
      setTimeout(() => { fill.style.width = target; }, 300);
    });
  }

  /* ── VARIANT SELECTION ── */
  function initVariants() {
    document.querySelectorAll('.px-variant-buttons').forEach(group => {
      group.querySelectorAll('.px-variant-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          if (this.classList.contains('unavailable')) return;
          group.querySelectorAll('.px-variant-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const variantId = this.dataset.variantId;
          if (variantId) {
            const input = document.querySelector('[name="id"]');
            if (input) input.value = variantId;
            updateProductPrice(this.dataset.price, this.dataset.comparePrice);
          }
        });
      });
    });
  }

  function updateProductPrice(price, comparePrice) {
    const priceEl = document.querySelector('.px-product-info-price .px-price');
    const compareEl = document.querySelector('.px-product-info-price .px-price-compare');
    const savingEl = document.querySelector('.px-product-info-price .px-price-saving');
    if (priceEl && price) priceEl.textContent = formatMoney(parseInt(price));
    if (compareEl && comparePrice) {
      compareEl.textContent = formatMoney(parseInt(comparePrice));
      compareEl.style.display = '';
    } else if (compareEl) compareEl.style.display = 'none';
    if (savingEl && price && comparePrice) {
      const saving = parseInt(comparePrice) - parseInt(price);
      const pct = Math.round((saving / parseInt(comparePrice)) * 100);
      savingEl.textContent = `-${pct}%`;
    }
  }

  /* ── QUICK VIEW ── */
  function initQuickView() {
    document.querySelectorAll('[data-quick-view]').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        const handle = this.dataset.quickView;
        if (!handle) return;
        try {
          const res = await fetch(`/products/${handle}.js`);
          const product = await res.json();
          openQuickView(product);
        } catch (_) {}
      });
    });
  }

  function openQuickView(product) {
    let modal = document.querySelector('.px-quick-view-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'px-quick-view-modal';
      modal.style.cssText = `
        position:fixed;inset:0;z-index:500;
        display:flex;align-items:center;justify-content:center;
        background:rgba(14,19,32,0.6);backdrop-filter:blur(8px);
        padding:1.5rem;
      `;
      document.body.appendChild(modal);
    }
    const variant = product.variants[0];
    modal.innerHTML = `
      <div style="background:white;border-radius:20px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;display:grid;grid-template-columns:1fr 1fr;position:relative;">
        <button onclick="this.closest('.px-quick-view-modal').remove()" style="position:absolute;top:1rem;right:1rem;z-index:1;background:rgba(14,19,32,0.1);border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;">×</button>
        <img src="${product.featured_image}" alt="${product.title}" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:20px 0 0 20px;">
        <div style="padding:2rem;">
          <p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:#4d6945;letter-spacing:0.1em;margin-bottom:0.5rem;">${product.vendor}</p>
          <h3 style="font-size:1.4rem;font-weight:800;color:#0e1320;margin-bottom:0.75rem;line-height:1.2;">${product.title}</h3>
          <p style="font-size:1.5rem;font-weight:800;color:#0e1320;margin-bottom:1.5rem;">${formatMoney(variant.price)}</p>
          <input type="hidden" name="id" value="${variant.id}">
          <button data-add-to-cart class="px-atc-btn px-btn-full" style="background:#4d6945;color:white;padding:0.875rem;border-radius:14px;font-size:1rem;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(77,105,69,0.35);">
            <span class="btn-text">Ajouter au panier</span>
            <div class="loading-spinner"></div>
          </button>
          <a href="/products/${product.handle}" style="display:block;text-align:center;margin-top:0.75rem;font-size:0.85rem;color:#4d6945;font-weight:600;">Voir le produit complet →</a>
        </div>
      </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    initAddToCart();
  }

  /* ── UPSELL ADD TO CART ── */
  function initUpsellAdd() {
    document.querySelectorAll('.px-upsell-add').forEach(btn => {
      btn.addEventListener('click', async function() {
        const variantId = this.dataset.variantId;
        if (!variantId) return;
        this.textContent = '...';
        try {
          await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: variantId, quantity: 1 })
          });
          await refreshCart();
          this.textContent = '✓ Ajouté';
          this.style.background = '#4d6945';
          this.style.color = 'white';
          this.style.borderColor = '#4d6945';
        } catch (_) {
          this.textContent = '+ Ajouter';
        }
      });
    });
  }

  /* ── PROGRESS BAR ── */
  function initProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'px-progress-bar';
    document.body.appendChild(bar);
    function update() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ── LAZY LOAD IMAGES ── */
  function initLazyLoad() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const img = e.target;
        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
        if (img.dataset.srcset) { img.srcset = img.dataset.srcset; delete img.dataset.srcset; }
        io.unobserve(img);
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
  }

  /* ── NEWSLETTER FORM ── */
  function initNewsletter() {
    document.querySelectorAll('.px-newsletter-form').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]')?.value;
        if (!email) return;
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.textContent = '...'; btn.disabled = true; }
        await new Promise(r => setTimeout(r, 800));
        showToast('Inscription réussie !', 'Merci pour votre inscription.', 'success');
        form.reset();
        if (btn) { btn.textContent = 'S\'inscrire'; btn.disabled = false; }
      });
    });
  }

  /* ── INIT ALL ── */
  function init() {
    initHeader();
    initStickyATC();
    initGallery();
    initQuantity();
    initCartDrawer();
    initMobileMenu();
    initAddToCart();
    initReveal();
    initBackToTop();
    initCountdown();
    initStockBar();
    initVariants();
    initQuickView();
    initUpsellAdd();
    initProgressBar();
    initLazyLoad();
    initNewsletter();
    refreshCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PlumeX = { showToast, refreshCart, formatMoney };
})();
