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
});
