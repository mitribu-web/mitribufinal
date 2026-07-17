// ============ HELPERS ============
function getName(){ return localStorage.getItem('mitribu_name') || 'Ana López'; }
function getRole(){ return localStorage.getItem('mitribu_role') || 'freelancer'; }
function initials(name){ return name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>t.classList.remove('show'), 3200);
}

function paintIdentity(){
  const name = getName();
  const role = getRole() === 'marca' ? 'Marca / emprendedor' : 'Freelancer creativo';
  document.querySelectorAll('.js-user-name').forEach(el => el.textContent = name);
  document.querySelectorAll('.js-user-role').forEach(el => el.textContent = role);
  document.querySelectorAll('.js-user-initials').forEach(el => el.textContent = initials(name));
}

document.addEventListener('DOMContentLoaded', () => {
  paintIdentity();

  // ============ SIDEBAR TOGGLE (mobile) ============
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const openBtn = document.querySelector('.sidebar-toggle');
  const closeBtn = document.querySelector('.sidebar-close');
  const openSidebar = () => { sidebar && sidebar.classList.add('open'); overlay && overlay.classList.add('show'); };
  const closeSidebar = () => { sidebar && sidebar.classList.remove('open'); overlay && overlay.classList.remove('show'); };
  openBtn && openBtn.addEventListener('click', openSidebar);
  closeBtn && closeBtn.addEventListener('click', closeSidebar);
  overlay && overlay.addEventListener('click', closeSidebar);

  // ============ LOGOUT ============
  document.querySelectorAll('.js-logout').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('mitribu_role');
      window.location.href = 'login.html';
    });
  });

  // ============ LOGIN FORM ============
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    let role = 'marca';
    const roleBtns = document.querySelectorAll('.role-toggle button');
    roleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        role = btn.getAttribute('data-role');
      });
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      loginForm.querySelectorAll('[required]').forEach(f => {
        const wrapper = f.closest('.field');
        const bad = !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        wrapper && wrapper.classList.toggle('error', bad);
        if (bad) valid = false;
      });
      if (!valid) return;

      const name = document.getElementById('f-login-nombre').value.trim();
      localStorage.setItem('mitribu_name', name);
      localStorage.setItem('mitribu_role', role);
      window.location.href = role === 'freelancer' ? 'perfil.html' : 'publicar-proyecto.html';
    });
  }

  // ============ PROFILE PAGE ============
  const bioField = document.getElementById('bioField');
  if (bioField) {
    bioField.value = localStorage.getItem('mitribu_bio') || bioField.value;
    document.getElementById('saveBioBtn').addEventListener('click', () => {
      localStorage.setItem('mitribu_bio', bioField.value);
      showToast('Perfil actualizado ✓');
    });

    const skillsWrap = document.getElementById('skillsWrap');
    let skills = JSON.parse(localStorage.getItem('mitribu_skills') || '["Branding","Diseño de logo","Identidad visual","Packaging"]');
    function renderSkills(){
      skillsWrap.innerHTML = '';
      skills.forEach((s, i) => {
        const pill = document.createElement('span');
        pill.className = 'tag-pill';
        pill.innerHTML = `${s} <button data-i="${i}" aria-label="Quitar">×</button>`;
        skillsWrap.appendChild(pill);
      });
      skillsWrap.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
          skills.splice(Number(b.getAttribute('data-i')), 1);
          localStorage.setItem('mitribu_skills', JSON.stringify(skills));
          renderSkills();
        });
      });
    }
    renderSkills();
    const skillInput = document.getElementById('skillInput');
    skillInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && skillInput.value.trim()) {
        e.preventDefault();
        skills.push(skillInput.value.trim());
        localStorage.setItem('mitribu_skills', JSON.stringify(skills));
        skillInput.value = '';
        renderSkills();
      }
    });

    document.querySelectorAll('.js-add-portfolio').forEach(btn => {
      btn.addEventListener('click', () => showToast('Simulación: aquí subirías una imagen de tu portafolio'));
    });
  }

  // ============ WIZARD: PUBLICAR PROYECTO ============
  const wizard = document.getElementById('wizard');
  if (wizard) {
    let step = 1;
    const total = 4;
    const panels = document.querySelectorAll('.wstep-panel');
    const steps = document.querySelectorAll('.wstep');

    function paint(){
      panels.forEach(p => p.classList.toggle('active', Number(p.getAttribute('data-step')) === step));
      steps.forEach(s => {
        const n = Number(s.getAttribute('data-step'));
        s.classList.toggle('active', n === step);
        s.classList.toggle('done', n < step);
      });
      document.getElementById('wizBack').style.visibility = step === 1 ? 'hidden' : 'visible';
      document.getElementById('wizNext').textContent = step === total ? 'Publicar proyecto →' : 'Siguiente →';
      if (step === total) fillReview();
    }

    function validateStep(){
      if (step === 1) {
        const picked = wizard.querySelector('input[name="servicio"]:checked');
        if (!picked) { showToast('Elige un tipo de servicio para continuar'); return false; }
      }
      if (step === 2) {
        const titulo = document.getElementById('p-titulo');
        const desc = document.getElementById('p-desc');
        let ok = true;
        [titulo, desc].forEach(f => {
          const bad = !f.value.trim();
          f.closest('.field').classList.toggle('error', bad);
          if (bad) ok = false;
        });
        if (!ok) return false;
      }
      if (step === 3) {
        const presupuesto = document.getElementById('p-presupuesto');
        const bad = !presupuesto.value.trim();
        presupuesto.closest('.field').classList.toggle('error', bad);
        if (bad) return false;
      }
      return true;
    }

    function fillReview(){
      const picked = wizard.querySelector('input[name="servicio"]:checked');
      document.getElementById('rev-servicio').textContent = picked ? picked.nextElementSibling.querySelector('.spick-title').textContent : '—';
      document.getElementById('rev-titulo').textContent = document.getElementById('p-titulo').value || '—';
      document.getElementById('rev-presupuesto').textContent = 'S/ ' + (document.getElementById('p-presupuesto').value || '—');
      document.getElementById('rev-categoria').textContent = document.getElementById('p-categoria').value || '—';
    }

    document.getElementById('wizNext').addEventListener('click', () => {
      if (!validateStep()) return;
      if (step < total) { step++; paint(); window.scrollTo({top:0, behavior:'smooth'}); return; }
      // final submit
      const picked = wizard.querySelector('input[name="servicio"]:checked');
      const project = {
        servicio: picked ? picked.nextElementSibling.querySelector('.spick-title').textContent : '',
        titulo: document.getElementById('p-titulo').value,
        descripcion: document.getElementById('p-desc').value,
        presupuesto: document.getElementById('p-presupuesto').value,
        categoria: document.getElementById('p-categoria').value
      };
      localStorage.setItem('mitribu_project', JSON.stringify(project));
      localStorage.removeItem('mitribu_hired');
      window.location.href = 'propuestas.html?nuevo=1';
    });
    document.getElementById('wizBack').addEventListener('click', () => { if (step > 1) { step--; paint(); } });

    paint();
  }

  // ============ PROPUESTAS ============
  const propWrap = document.getElementById('propuestasWrap');
  if (propWrap) {
    const project = JSON.parse(localStorage.getItem('mitribu_project') || 'null');
    if (project) {
      document.getElementById('projTitle').textContent = project.titulo || 'Tu proyecto';
      document.getElementById('projMeta').textContent = `${project.servicio || 'Servicio'} · Presupuesto: S/ ${project.presupuesto || '—'}`;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('nuevo')) showToast('¡Proyecto publicado! Estas son propuestas de ejemplo');

    let hiredId = localStorage.getItem('mitribu_hired');
    document.querySelectorAll('.proposal-card').forEach(card => {
      const id = card.getAttribute('data-id');
      const hireBtn = card.querySelector('.js-hire');
      if (hiredId) {
        if (id === hiredId) {
          card.classList.add('hired');
          hireBtn.outerHTML = '<span class="hired-badge">✓ Contratado</span>';
        } else {
          hireBtn.disabled = true;
          hireBtn.textContent = 'No seleccionado';
        }
      }
      hireBtn && hireBtn.addEventListener('click', () => {
        localStorage.setItem('mitribu_hired', id);
        showToast('¡Freelancer contratado! Revisa Pagos para ver el detalle');
        setTimeout(()=> window.location.href = 'pagos.html', 900);
      });
    });
  }

  // ============ PAGOS: transacciones -> detalle ============
  document.querySelectorAll('.tx-row[data-tx]').forEach(row => {
    row.addEventListener('click', () => { window.location.href = 'detalle-pago.html?id=' + row.getAttribute('data-tx'); });
    row.setAttribute('tabindex','0');
    row.addEventListener('keydown', (e) => { if (e.key === 'Enter') row.click(); });
  });

  // pagos tabs
  document.querySelectorAll('[data-tabgroup="pagos"] .tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('[data-tabgroup="pagos"] .tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('[data-panel-group="pagos"]').forEach(p=>{
        p.classList.toggle('active', p.getAttribute('data-panel')===target);
      });
    });
  });

  // ============ DETALLE DE PAGO ============
  const txDetail = document.getElementById('txDetail');
  if (txDetail) {
    const data = {
      'tx1': {title:'Diseño de logo — marca de skincare', name:'Ana López', date:'15 May 2026, 10:40 a.m.', subtotal:950, comision:190, total:760, status:'Completado', dir:'in'},
      'tx2': {title:'Reel de marca — cafetería local', name:'Carlos Torres', date:'12 May 2026, 4:15 p.m.', subtotal:400, comision:80, total:320, status:'Completado', dir:'in'},
      'tx3': {title:'Calendario de contenido — tienda de ropa', name:'María Fernández', date:'8 May 2026, 9:05 a.m.', subtotal:600, comision:120, total:480, status:'En camino', dir:'in'},
      'tx4': {title:'Pago a freelancer — Identidad visual', name:'Diego Ramos', date:'5 May 2026, 1:30 p.m.', subtotal:700, comision:0, total:700, status:'Completado', dir:'out'}
    };
    const id = new URLSearchParams(window.location.search).get('id') || 'tx1';
    const tx = data[id] || data['tx1'];
    document.getElementById('tx-title').textContent = tx.title;
    document.getElementById('tx-name').textContent = tx.name;
    document.getElementById('tx-date').textContent = tx.date;
    document.getElementById('tx-status').textContent = tx.status;
    document.getElementById('tx-subtotal').textContent = 'S/ ' + tx.subtotal.toFixed(2);
    document.getElementById('tx-comision').textContent = '- S/ ' + tx.comision.toFixed(2);
    document.getElementById('tx-total').textContent = 'S/ ' + tx.total.toFixed(2);
    document.getElementById('tx-amount-badge').textContent = (tx.dir === 'in' ? '+ ' : '- ') + 'S/ ' + tx.total.toFixed(2);
    document.getElementById('tx-amount-badge').style.color = tx.dir === 'in' ? '#1FA971' : '#E63975';
  }

  document.querySelectorAll('.js-withdraw').forEach(btn => {
    btn.addEventListener('click', () => showToast('Solicitud de retiro enviada — llega en 1-2 días hábiles'));
  });
});
