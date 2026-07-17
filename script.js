// ============ MOBILE NAV ============
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const panel = document.querySelector('.mobile-panel');
  if (burger && panel) {
    burger.addEventListener('click', () => {
      panel.classList.toggle('open');
      burger.setAttribute('aria-expanded', panel.classList.contains('open'));
    });
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => panel.classList.remove('open')));
  }

  // ============ REVEAL ON SCROLL ============
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ============ TABS (nosotros.html) ============
  document.querySelectorAll('[data-tabgroup]').forEach(group => {
    const name = group.getAttribute('data-tabgroup');
    const buttons = group.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-tab');
        document.querySelectorAll(`[data-panel-group="${name}"]`).forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-panel') === target);
        });
      });
    });
  });

  // ============ SERVICE FILTERS (servicios.html) ============
  const chips = document.querySelectorAll('.filter-chip');
  if (chips.length) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.getAttribute('data-filter');
        document.querySelectorAll('.service-card').forEach(card => {
          const match = cat === 'todos' || card.getAttribute('data-cat') === cat;
          card.classList.toggle('hidden', !match);
        });
      });
    });
  }

  // ============ SERVICE MODAL (servicios.html) ============
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    const modalTag = document.getElementById('modalTag');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalList = document.getElementById('modalList');
    const modalPrice = document.getElementById('modalPrice');
    const modalCta = document.getElementById('modalCta');

    document.querySelectorAll('[data-open-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.service-card');
        modalTag.textContent = card.getAttribute('data-cat-label');
        modalTitle.textContent = card.getAttribute('data-title');
        modalDesc.textContent = card.getAttribute('data-full');
        modalPrice.textContent = card.getAttribute('data-price');
        modalList.innerHTML = '';
        card.getAttribute('data-deliverables').split('|').forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<span>✓</span><span>${item}</span>`;
          modalList.appendChild(li);
        });
        modalCta.href = `contacto.html?servicio=${encodeURIComponent(card.getAttribute('data-title'))}`;
        const modalAddCart = document.getElementById('modalAddCart');
        if (modalAddCart) {
          modalAddCart.setAttribute('data-title', card.getAttribute('data-title'));
          modalAddCart.setAttribute('data-price', card.getAttribute('data-price'));
          modalAddCart.setAttribute('data-cat-label', card.getAttribute('data-cat-label'));
        }
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => { overlay.classList.remove('open'); document.body.style.overflow = ''; };
    document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  // ============ CONTACT FORM (contacto.html) ============
  const form = document.getElementById('contactForm');
  if (form) {
    // Prefill service from ?servicio= query param
    const params = new URLSearchParams(window.location.search);
    const servicioParam = params.get('servicio');
    const servicioSelect = document.getElementById('f-servicio');
    if (servicioParam && servicioSelect) {
      const opt = [...servicioSelect.options].find(o => o.value === servicioParam);
      if (opt) servicioSelect.value = servicioParam;
    }

    // Toggle marca / freelancer
    const toggleBtns = document.querySelectorAll('.user-toggle button');
    const marcaFields = document.querySelectorAll('.field-marca');
    const freelanceFields = document.querySelectorAll('.field-freelance');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const isMarca = btn.getAttribute('data-user') === 'marca';
        marcaFields.forEach(f => f.classList.toggle('field-hide', !isMarca));
        freelanceFields.forEach(f => f.classList.toggle('field-hide', isMarca));
        document.getElementById('f-tipo').value = isMarca ? 'Marca / emprendedor' : 'Freelancer creativo';
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        const wrapper = field.closest('.field');
        if (wrapper && wrapper.classList.contains('field-hide')) return;
        const empty = !field.value || !field.value.trim();
        const badEmail = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (empty || badEmail) {
          wrapper.classList.add('error');
          valid = false;
        } else if (wrapper) {
          wrapper.classList.remove('error');
        }
      });

      if (!valid) return;

      const nombre = document.getElementById('f-nombre').value.trim();
      const email = document.getElementById('f-email').value.trim();
      const tipo = document.getElementById('f-tipo').value;
      const servicio = servicioSelect ? servicioSelect.value : '';
      const mensaje = document.getElementById('f-mensaje').value.trim();

      const subject = encodeURIComponent(`Contacto desde mi tribu — ${tipo}`);
      const body = encodeURIComponent(
        `Nombre: ${nombre}\nCorreo: ${email}\nTipo: ${tipo}\nServicio de interés: ${servicio || 'No especificado'}\n\nMensaje:\n${mensaje}`
      );

      // Build functional mailto + WhatsApp links (real, working actions — no backend needed)
      const mailtoLink = `mailto:hola@mitribu.pe?subject=${subject}&body=${body}`;
      const waText = encodeURIComponent(`Hola mi tribu! Soy ${nombre} (${tipo}). ${mensaje}`);
      const waLink = `https://wa.me/51999999999?text=${waText}`;

      document.getElementById('sendEmailBtn').href = mailtoLink;
      document.getElementById('sendWaBtn').href = waLink;
      document.getElementById('successBox').classList.add('show');
      document.getElementById('successBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.querySelectorAll('input,select,textarea').forEach(f => f.disabled = true);
      document.getElementById('formSubmitBtn').disabled = true;
    });

    // live-clear error state
    form.querySelectorAll('input,select,textarea').forEach(f => {
      f.addEventListener('input', () => f.closest('.field') && f.closest('.field').classList.remove('error'));
    });
  }

  // ============ CARRITO ============
  function getCart(){ return JSON.parse(localStorage.getItem('mitribu_cart') || '[]'); }
  function saveCart(cart){ localStorage.setItem('mitribu_cart', JSON.stringify(cart)); updateCartBadge(); }
  function updateCartBadge(){
    const cart = getCart();
    const count = cart.reduce((s,i)=>s+i.qty,0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
  window.mitribuAddToCart = function(item){
    const cart = getCart();
    const existing = cart.find(i => i.title === item.title);
    if (existing) existing.qty += 1;
    else cart.push({ ...item, qty: 1 });
    saveCart(cart);
    showToastGlobal(`"${item.title}" se añadió al carrito`);
  };
  function showToastGlobal(msg){
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'toast';
      toast.style.cssText = 'position:fixed;bottom:26px;right:26px;background:#1A1A2E;color:#fff;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 12px 30px rgba(0,0,0,0.25);transform:translateY(20px);opacity:0;pointer-events:none;transition:.25s;z-index:200;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    clearTimeout(window._gToastTimer);
    window._gToastTimer = setTimeout(() => { toast.style.transform = 'translateY(20px)'; toast.style.opacity = '0'; }, 2600);
  }
  updateCartBadge();

  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('[data-title]');
      const title = btn.getAttribute('data-title') || (card && card.getAttribute('data-title'));
      const price = btn.getAttribute('data-price') || (card && card.getAttribute('data-price'));
      const cat = btn.getAttribute('data-cat-label') || (card && card.getAttribute('data-cat-label')) || '';
      if (title) window.mitribuAddToCart({ title, price: price || '', cat });
    });
  });

  // Cart page render
  const cartWrap = document.getElementById('cartWrap');
  if (cartWrap) {
    function parsePrice(str){
      const m = (str || '').match(/[\d,.]+/);
      return m ? parseFloat(m[0].replace(/,/g,'')) : 0;
    }
    function renderCart(){
      const cart = getCart();
      cartWrap.innerHTML = '';
      const summaryTotal = document.getElementById('cartTotal');
      const summaryCount = document.getElementById('cartCount');
      if (!cart.length) {
        document.getElementById('cartEmpty').style.display = 'block';
        document.getElementById('cartSummary').style.display = 'none';
        if (summaryTotal) summaryTotal.textContent = 'S/ 0.00';
        return;
      }
      document.getElementById('cartEmpty').style.display = 'none';
      document.getElementById('cartSummary').style.display = 'block';
      let total = 0;
      cart.forEach((item, i) => {
        const unit = parsePrice(item.price);
        total += unit * item.qty;
        const row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML = `
          <div class="ci-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 19l7-7a3 3 0 0 0-4-4l-7 7v4h4z" stroke="#6C3CE9" stroke-width="2" stroke-linejoin="round"/></svg></div>
          <div class="ci-info">
            <div class="ci-title">${item.title}</div>
            <div class="ci-cat">${item.cat || ''}</div>
          </div>
          <div class="qty-control">
            <button data-dec="${i}" aria-label="Restar">−</button>
            <span class="qn">${item.qty}</span>
            <button data-inc="${i}" aria-label="Sumar">+</button>
          </div>
          <div class="ci-price">S/ ${(unit * item.qty).toFixed(2)}</div>
          <button class="ci-remove" data-remove="${i}" aria-label="Quitar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        `;
        cartWrap.appendChild(row);
      });
      if (summaryTotal) summaryTotal.textContent = 'S/ ' + total.toFixed(2);
      const summaryTotal2 = document.getElementById('cartTotal2');
      if (summaryTotal2) summaryTotal2.textContent = 'S/ ' + total.toFixed(2);
      if (summaryCount) summaryCount.textContent = cart.reduce((s,i)=>s+i.qty,0);

      cartWrap.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
        const cart = getCart(); cart[+b.getAttribute('data-inc')].qty++; saveCart(cart); renderCart();
      }));
      cartWrap.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => {
        const cart = getCart(); const idx = +b.getAttribute('data-dec');
        cart[idx].qty--; if (cart[idx].qty <= 0) cart.splice(idx,1);
        saveCart(cart); renderCart();
      }));
      cartWrap.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
        const cart = getCart(); cart.splice(+b.getAttribute('data-remove'),1); saveCart(cart); renderCart();
      }));
    }
    renderCart();

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (!getCart().length) return;
        document.getElementById('checkoutPanel').classList.add('show');
        document.getElementById('checkoutPanel').scrollIntoView({ behavior: 'smooth' });
      });
    }
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    if (confirmOrderBtn) {
      confirmOrderBtn.addEventListener('click', () => {
        localStorage.removeItem('mitribu_cart');
        document.getElementById('checkoutPanel').innerHTML = `
          <div class="card" style="text-align:center;padding:44px;">
            <div style="font-size:40px;margin-bottom:14px;">✅</div>
            <h3 style="font-size:20px;margin-bottom:10px;">¡Pedido recibido!</h3>
            <p style="font-size:14px;color:var(--gray);max-width:420px;margin:0 auto;">Nuestro equipo te contactará por correo o WhatsApp para coordinar los detalles y confirmar el pago. Esta es una simulación de checkout para fines de demostración.</p>
            <a href="index.html" class="btn btn-primary" style="margin-top:20px;">Volver al inicio</a>
          </div>`;
        renderCart();
        updateCartBadge();
      });
    }
  }

  // ============ POPUP / BUMPER AD (home) ============
  const popupOverlay = document.getElementById('popupOverlay');
  if (popupOverlay && !sessionStorage.getItem('mitribu_popup_seen')) {
    setTimeout(() => { popupOverlay.classList.add('show'); }, 4000);
  }
  if (popupOverlay) {
    const closePopup = () => { popupOverlay.classList.remove('show'); sessionStorage.setItem('mitribu_popup_seen', '1'); };
    document.querySelectorAll('[data-close-popup]').forEach(el => el.addEventListener('click', closePopup));
    popupOverlay.addEventListener('click', (e) => { if (e.target === popupOverlay) closePopup(); });
    const popupForm = document.getElementById('popupForm');
    if (popupForm) {
      popupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('popupBody').innerHTML = '<div style="text-align:center;padding:10px 0;"><div style="font-size:32px;margin-bottom:10px;">🎉</div><p style="font-weight:700;font-size:15px;margin-bottom:6px;">¡Listo! Tu código es <span style="color:var(--purple);">TRIBU15</span></p><p style="font-size:13px;color:var(--gray);">Úsalo al contratar tu primer servicio.</p></div>';
        setTimeout(closePopup, 2200);
      });
    }
  }

  // ============ BUSCAR FREELANCERS: filtros ============
  const talentChips = document.querySelectorAll('.talent-filter');
  if (talentChips.length) {
    talentChips.forEach(chip => {
      chip.addEventListener('click', () => {
        talentChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.getAttribute('data-filter');
        document.querySelectorAll('.talent-card').forEach(card => {
          const match = cat === 'todos' || card.getAttribute('data-cat') === cat;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }
});
