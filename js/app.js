/**
 * CORPORACIÓN AYALA S.A.C. - LÓGICA DE INTERFAZ Y RENDERIZADO
 * Maneja eventos de navegación, renderizado dinámico desde DataService,
 * filtros, buscador, modales y WhatsApp.
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await App.init();
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    App.showGlobalError();
  }
});

const App = {
  config: null,
  currentCategory: 'todos',
  searchQuery: '',

  async init() {
    // 1. Cargar Configuración general
    this.config = await window.dataService.getConfig();
    this.applyConfig();

    // 2. Cargar módulos
    await Promise.all([
      this.loadServicios(),
      this.loadFeaturedProducts(),
      this.loadCatalog(),
      this.loadMarcas(),
      this.loadSoporte(),
      this.loadNosotros(),
      this.loadSucursales(),
      this.loadBlog()
    ]);

    // 3. Configurar listeners e interacción
    this.setupNavigation();
    this.setupSearch();
    this.setupModals();
    this.setupContactForm();
    this.setupFaqAccordion();
  },

  // -------------------------------------------------------------
  // CONFIGURACIÓN DINÁMICA
  // -------------------------------------------------------------
  applyConfig() {
    const { empresa, configuracion } = this.config;

    // Teléfonos y WhatsApp en top bar y header
    document.querySelectorAll('[data-bind="empresa-telefono"]').forEach(el => {
      el.textContent = empresa.telefono;
      if (el.tagName === 'A') el.href = empresa.telefonoLlamadas;
    });

    document.querySelectorAll('[data-bind="empresa-horario"]').forEach(el => {
      el.textContent = empresa.horario;
    });

    document.querySelectorAll('[data-bind="empresa-direccion"]').forEach(el => {
      el.textContent = empresa.direccion;
    });

    document.querySelectorAll('[data-bind="empresa-ruc"]').forEach(el => {
      el.textContent = `RUC: ${empresa.ruc}`;
    });

    // Enlaces de WhatsApp
    const waUrl = this.getWhatsAppUrl(empresa.whatsapp, empresa.whatsappTextoPredeterminado);
    document.querySelectorAll('[data-bind="whatsapp-link"]').forEach(el => {
      el.href = waUrl;
      el.target = '_blank';
    });

    // Botón flotante de WhatsApp
    const floatWa = document.getElementById('floating-whatsapp');
    if (floatWa) {
      if (configuracion.mostrarBotonWhatsappFlotante && empresa.whatsappHabilitado) {
        floatWa.style.display = 'flex';
        floatWa.href = waUrl;
        floatWa.target = '_blank';
      } else {
        floatWa.style.display = 'none';
      }
    }
  },

  getWhatsAppUrl(numero, mensaje) {
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  },

  // -------------------------------------------------------------
  // MÓDULO 1: SERVICIOS EN INICIO
  // -------------------------------------------------------------
  async loadServicios() {
    const servicios = await window.dataService.getServicios();
    const container = document.getElementById('services-grid');
    if (!container) return;

    container.innerHTML = servicios.map(s => `
      <article class="service-card" data-service-id="${s.id}">
        <div class="service-thumb">
          <img src="${s.imagen}" alt="${s.titulo}" loading="lazy">
        </div>
        <div class="service-body">
          <h3 class="service-title">${s.titulo}</h3>
          <div class="service-subtitle">${s.subtitulo}</div>
          <p class="service-text">${s.resumen}</p>
          <button type="button" class="service-btn-detail" onclick="App.openServiceModal('${s.id}')">
            Ver detalle técnico
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </article>
    `).join('');
  },

  async openServiceModal(id) {
    const servicio = await window.dataService.getServicioById(id);
    if (!servicio) return;

    const modal = document.getElementById('generic-modal');
    const content = document.getElementById('generic-modal-content');

    const waMsg = `Hola Corporación Ayala, deseo consultar por el servicio de ${servicio.titulo}.`;
    const waUrl = this.getWhatsAppUrl(this.config.empresa.whatsapp, waMsg);

    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <span class="badge-referencia" style="margin-bottom: 10px;">Detalle de Especialidad</span>
        <h2 style="font-family: var(--font-heading); color: var(--ayala-navy); font-size: 1.75rem; margin-top: 6px;">${servicio.titulo}</h2>
        <div style="color: var(--ayala-red); font-weight: 700; margin-bottom: 14px;">${servicio.subtitulo}</div>
      </div>
      <img src="${servicio.imagen}" alt="${servicio.titulo}" style="width: 100%; height: 260px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
      <p style="font-size: 0.9375rem; color: var(--ayala-text-muted); line-height: 1.6; margin-bottom: 20px;">${servicio.descripcionCompleta}</p>
      
      <h3 style="font-family: var(--font-heading); font-size: 1.125rem; color: var(--ayala-navy); margin-bottom: 12px;">Capacidades y Alcance de Taller:</h3>
      <ul style="list-style: none; margin-bottom: 24px;">
        ${servicio.capacidades.map(c => `
          <li style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.875rem; margin-bottom: 8px;">
            <svg style="width: 16px; height: 16px; stroke: var(--ayala-red); flex-shrink: 0; margin-top: 3px;" viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${c}</span>
          </li>
        `).join('')}
      </ul>

      <div style="display: flex; gap: 14px; flex-wrap: wrap;">
        <a href="${waUrl}" target="_blank" class="btn btn-whatsapp" style="flex: 1;">
          <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
          Consultar por WhatsApp
        </a>
        <a href="#contacto" onclick="App.closeModals()" class="btn btn-secondary">
          Contactar por Formulario
        </a>
      </div>
    `;

    modal.classList.add('active');
  },

  // -------------------------------------------------------------
  // PRODUCTOS DESTACADOS EN INICIO
  // -------------------------------------------------------------
  async loadFeaturedProducts() {
    const destacados = await window.dataService.getProductosDestacados();
    const container = document.getElementById('featured-products-grid');
    if (!container) return;

    container.innerHTML = destacados.slice(0, 3).map(p => this.renderProductCardHtml(p)).join('');
  },

  // -------------------------------------------------------------
  // MÓDULO 2: CATÁLOGO COMPLETO
  // -------------------------------------------------------------
  async loadCatalog() {
    const categorias = await window.dataService.getCategorias();
    const pillsContainer = document.getElementById('category-filter-pills');
    
    if (pillsContainer) {
      pillsContainer.innerHTML = `
        <button type="button" class="filter-pill ${this.currentCategory === 'todos' ? 'active' : ''}" data-cat="todos">
          Todos los Productos
        </button>
        ${categorias.map(c => `
          <button type="button" class="filter-pill ${this.currentCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
            ${c.nombre} ${!c.confirmada ? '<small>(Próximamente)</small>' : ''}
          </button>
        `).join('')}
      `;

      pillsContainer.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          pillsContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentCategory = btn.dataset.cat;
          this.filterAndRenderCatalog();
        });
      });
    }

    await this.filterAndRenderCatalog();
  },

  async filterAndRenderCatalog() {
    const grid = document.getElementById('catalog-products-grid');
    if (!grid) return;

    const productos = await window.dataService.getProductos(this.currentCategory, this.searchQuery);
    const categorias = await window.dataService.getCategorias();
    const currentCatObj = categorias.find(c => c.id === this.currentCategory);

    // Si la categoría no está confirmada
    if (currentCatObj && !currentCatObj.confirmada && productos.length === 0) {
      grid.innerHTML = `
        <div class="empty-catalog-state" style="grid-column: 1 / -1;">
          <svg class="empty-catalog-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <h3 class="empty-catalog-title">Categoría "${currentCatObj.nombre}" en Preparación</h3>
          <p class="empty-catalog-desc">${currentCatObj.mensajeProvisional}</p>
          <a href="${this.getWhatsAppUrl(this.config.empresa.whatsapp, `Hola Corporación Ayala, deseo consultar por disponibilidad en la categoría ${currentCatObj.nombre}`)}" target="_blank" class="btn btn-whatsapp">
            Consultar disponibilidad por WhatsApp
          </a>
        </div>
      `;
      return;
    }

    // Si no hay resultados de búsqueda
    if (productos.length === 0) {
      grid.innerHTML = `
        <div class="empty-catalog-state" style="grid-column: 1 / -1;">
          <svg class="empty-catalog-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <h3 class="empty-catalog-title">Sin resultados de búsqueda</h3>
          <p class="empty-catalog-desc">No encontramos productos que coincidan con "${this.searchQuery}". Intenta con otros términos como "Placa", "A36", "Cartela" o "Base".</p>
          <button type="button" class="btn btn-secondary" onclick="App.resetSearch()">
            Restablecer búsqueda
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = productos.map(p => this.renderProductCardHtml(p)).join('');
  },

  renderProductCardHtml(p) {
    const waMsg = `Hola Corporación Ayala, deseo consultar por el producto: ${p.nombre} (ID: ${p.id}).`;
    const waUrl = this.getWhatsAppUrl(this.config.empresa.whatsapp, waMsg);

    return `
      <article class="product-card" data-product-id="${p.id}">
        <div class="product-thumb">
          <div class="product-badge-pos">
            <span class="badge-referencia">
              <svg style="width: 12px; height: 12px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              ${p.etiquetaTipoImagen || 'Referencia Técnica'}
            </span>
          </div>
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
        </div>
        <div class="product-body">
          <div class="product-category-tag">${p.categoriaNombre}</div>
          <h3 class="product-title">${p.nombre}</h3>
          <p class="product-desc">${p.descripcionCorta}</p>
          <div class="product-actions">
            <button type="button" class="btn-card-spec" onclick="App.openProductModal('${p.id}')">
              Ver Especificaciones
            </button>
            <a href="${waUrl}" target="_blank" class="btn-card-wa" title="Consultar por este producto en WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
            </a>
          </div>
        </div>
      </article>
    `;
  },

  async openProductModal(id) {
    const producto = await window.dataService.getProductoById(id);
    if (!producto) return;

    const modal = document.getElementById('generic-modal');
    const content = document.getElementById('generic-modal-content');

    const waMsg = `Hola Corporación Ayala, deseo consultar por el producto: ${producto.nombre} (ID: ${producto.id}).`;
    const waUrl = this.getWhatsAppUrl(this.config.empresa.whatsapp, waMsg);

    const specsRows = Object.entries(producto.especificaciones || {}).map(([key, val]) => `
      <tr>
        <th>${key}</th>
        <td>${val}</td>
      </tr>
    `).join('');

    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <span class="badge-referencia" style="margin-bottom: 8px;">${producto.categoriaNombre}</span>
        <h2 style="font-family: var(--font-heading); color: var(--ayala-navy); font-size: 1.625rem; margin-top: 6px;">${producto.nombre}</h2>
      </div>

      <div style="position: relative; margin-bottom: 20px;">
        <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; height: 260px; object-fit: cover; border-radius: 8px;">
        <div style="font-size: 0.75rem; color: var(--ayala-steel); margin-top: 6px; font-style: italic;">
          * Fotografía referencial para especificación de corte y fabricación sobre plano en taller.
        </div>
      </div>

      <p style="font-size: 0.9375rem; color: var(--ayala-text-muted); line-height: 1.6; margin-bottom: 18px;">${producto.descripcionLarga}</p>

      <h3 style="font-family: var(--font-heading); font-size: 1.0625rem; color: var(--ayala-navy); margin-bottom: 8px;">Ficha de Especificaciones Disponibles:</h3>
      <table class="spec-table">
        <tbody>
          ${specsRows}
        </tbody>
      </table>

      ${producto.aplicaciones ? `
        <h3 style="font-family: var(--font-heading); font-size: 1.0625rem; color: var(--ayala-navy); margin: 18px 0 8px;">Aplicaciones habituales:</h3>
        <ul style="list-style: none; margin-bottom: 24px;">
          ${producto.aplicaciones.map(a => `
            <li style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.875rem; margin-bottom: 6px;">
              <svg style="width: 15px; height: 15px; stroke: var(--ayala-red); flex-shrink: 0; margin-top: 3px;" viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${a}</span>
            </li>
          `).join('')}
        </ul>
      ` : ''}

      <div style="display: flex; gap: 14px; flex-wrap: wrap;">
        <a href="${waUrl}" target="_blank" class="btn btn-whatsapp" style="flex: 1;">
          <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
          Consultar por este producto en WhatsApp
        </a>
        <a href="#contacto" onclick="App.closeModals()" class="btn btn-secondary">
          Consultar por Formulario
        </a>
      </div>
    `;

    modal.classList.add('active');
  },

  // -------------------------------------------------------------
  // MÓDULO 3: MARCAS
  // -------------------------------------------------------------
  async loadMarcas() {
    const container = document.getElementById('brands-container');
    if (!container) return;

    const data = await window.dataService.getMarcas();

    if (!data.marcasConfirmadas) {
      container.innerHTML = `
        <div class="brands-empty-banner">
          <svg class="brands-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h3 class="brands-empty-title">${data.estadoVacio.titulo}</h3>
          <p class="brands-empty-text">${data.estadoVacio.mensaje}</p>
          <a href="${this.getWhatsAppUrl(this.config.empresa.whatsapp, 'Hola Corporación Ayala, deseo consultar por las marcas y especificaciones de aceros e insumos que comercializan.')}" target="_blank" class="btn btn-secondary">
            ${data.estadoVacio.botonContacto}
          </a>
        </div>
      `;
    } else {
      // Estructura lista para cuando se confirmen marcas
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;">
          ${data.marcas.map(m => `
            <div style="background: var(--ayala-white); border: 1px solid var(--ayala-steel-border); padding: 24px; text-align: center; border-radius: 8px;">
              <img src="${m.logo}" alt="${m.nombre}" style="max-height: 50px; margin: 0 auto 12px;">
              <h4 style="font-family: var(--font-heading); color: var(--ayala-navy);">${m.nombre}</h4>
              <p style="font-size: 0.8125rem; color: var(--ayala-steel);">${m.descripcion}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
  },

  // -------------------------------------------------------------
  // MÓDULO 4: SOPORTE TÉCNICO
  // -------------------------------------------------------------
  async loadSoporte() {
    const data = await window.dataService.getSoporte();

    // Pasos de guía de planos
    const stepsGrid = document.getElementById('support-steps-grid');
    if (stepsGrid && data.guiaEnvioPlanos) {
      stepsGrid.innerHTML = data.guiaEnvioPlanos.pasos.map(p => `
        <div class="support-step-card">
          <div class="step-badge-num">${p.numero}</div>
          <h4 class="step-card-title">${p.titulo}</h4>
          <p class="step-card-desc">${p.detalle}</p>
        </div>
      `).join('');
    }

    // FAQ Acordeón
    const faqContainer = document.getElementById('faq-accordion');
    if (faqContainer && data.preguntasFrecuentes) {
      faqContainer.innerHTML = data.preguntasFrecuentes.map(f => `
        <div class="faq-item" id="${f.id}">
          <button type="button" class="faq-trigger" aria-expanded="false">
            <span>${f.pregunta}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="faq-content">
            <p>${f.respuesta}</p>
          </div>
        </div>
      `).join('');
    }
  },

  setupFaqAccordion() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.faq-trigger');
      if (!trigger) return;

      const item = trigger.closest('.faq-item');
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  },

  // -------------------------------------------------------------
  // MÓDULO 5: NOSOTROS
  // -------------------------------------------------------------
  async loadNosotros() {
    const data = await window.dataService.getNosotros();

    const textEl1 = document.getElementById('nosotros-parrafo-1');
    const textEl2 = document.getElementById('nosotros-parrafo-2');
    if (textEl1) textEl1.textContent = data.presentacion.parrafo1;
    if (textEl2) textEl2.textContent = data.presentacion.parrafo2;

    // Valores
    const valuesContainer = document.getElementById('nosotros-valores-grid');
    if (valuesContainer && data.presentacion.valores) {
      valuesContainer.innerHTML = data.presentacion.valores.map(v => `
        <div class="value-box">
          <h4>${v.titulo}</h4>
          <p>${v.descripcion}</p>
        </div>
      `).join('');
    }

    // Galería instalaciones / Taller
    const photosContainer = document.getElementById('nosotros-fotos-grid');
    if (photosContainer && data.galeriaInstalaciones) {
      photosContainer.innerHTML = data.galeriaInstalaciones.map(f => `
        <div class="about-photo-card">
          <div class="about-photo-box">
            <img src="${f.imagen}" alt="${f.titulo}" loading="lazy">
            <span class="badge-referencia" style="position: absolute; top: 12px; left: 12px; background: rgba(105, 118, 128, 0.95);">${f.etiqueta}</span>
          </div>
          <div class="about-photo-info">
            <h4>${f.titulo}</h4>
            <p>${f.descripcion}</p>
          </div>
        </div>
      `).join('');
    }
  },

  // -------------------------------------------------------------
  // MÓDULO 6: SUCURSALES / UBICACIÓN
  // -------------------------------------------------------------
  async loadSucursales() {
    const data = await window.dataService.getSucursales();
    const container = document.getElementById('branches-container');
    if (!container) return;

    const sede = data.sucursales[0];
    if (!sede) return;

    container.innerHTML = `
      <div class="branch-card-detailed">
        <div class="branch-info-col">
          <span class="branch-type-tag">${sede.tipo}</span>
          <h3 class="branch-name">${sede.nombre}</h3>
          
          <div class="branch-detail-item">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div>
              <strong>Dirección de Sede:</strong>
              <span>${sede.direccion}</span>
            </div>
          </div>

          <div class="branch-detail-item">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <div>
              <strong>Horario de Operaciones:</strong>
              <span>${sede.horario}</span>
            </div>
          </div>

          <div class="branch-detail-item">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <div>
              <strong>Teléfono Directo:</strong>
              <a href="tel:${sede.telefono.replace(/\s+/g, '')}">${sede.telefono}</a>
            </div>
          </div>

          <div style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap;">
            <a href="${sede.enlaceMapa}" target="_blank" class="btn btn-primary">
              Ver Ruta en Google Maps
            </a>
            <a href="${this.getWhatsAppUrl(this.config.empresa.whatsapp, 'Hola Corporación Ayala, deseo consultar por la ubicación y coordinación para recojo en taller.')}" target="_blank" class="btn btn-whatsapp">
              Coordinar Recojo
            </a>
          </div>
        </div>
        <div class="branch-map-col">
          <iframe src="${sede.mapaEmbed}" loading="lazy" title="Ubicación de Corporación Ayala S.A.C."></iframe>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // MÓDULO 7: BLOG
  // -------------------------------------------------------------
  async loadBlog() {
    const articulos = await window.dataService.getArticulos();

    // Preview en página de Inicio
    const homeBlogContainer = document.getElementById('home-blog-grid');
    if (homeBlogContainer) {
      homeBlogContainer.innerHTML = articulos.slice(0, 3).map(a => this.renderBlogCardHtml(a)).join('');
    }

    // Grid en sección completa de Blog
    const fullBlogContainer = document.getElementById('full-blog-grid');
    if (fullBlogContainer) {
      fullBlogContainer.innerHTML = articulos.map(a => this.renderBlogCardHtml(a)).join('');
    }
  },

  renderBlogCardHtml(a) {
    return `
      <article class="blog-card" data-article-id="${a.id}">
        <div class="blog-thumb">
          <div class="blog-badge-pos">
            <span class="badge-demo">Demostración</span>
          </div>
          <img src="${a.imagen}" alt="${a.titulo}" loading="lazy">
        </div>
        <div class="blog-body">
          <div class="blog-meta">
            <span class="blog-category-label">${a.categoriaNombre}</span>
            <span>•</span>
            <span>${a.tiempoLectura}</span>
          </div>
          <h3 class="blog-title">${a.titulo}</h3>
          <p class="blog-summary">${a.resumen}</p>
          <button type="button" class="blog-link" onclick="App.openArticleModal('${a.id}')">
            Leer más
            <svg style="width: 14px; height: 14px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </article>
    `;
  },

  async openArticleModal(id) {
    const articulo = await window.dataService.getArticuloById(id);
    if (!articulo) return;

    const modal = document.getElementById('generic-modal');
    const content = document.getElementById('generic-modal-content');

    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
          <span class="badge-demo">Artículo Demostrativo</span>
          <span style="font-size: 0.8125rem; color: var(--ayala-steel);">${articulo.categoriaNombre} • ${articulo.fecha}</span>
        </div>
        <h2 style="font-family: var(--font-heading); color: var(--ayala-navy); font-size: 1.75rem; line-height: 1.3;">${articulo.titulo}</h2>
      </div>

      <img src="${articulo.imagen}" alt="${articulo.titulo}" style="width: 100%; height: 280px; object-fit: cover; border-radius: 8px; margin-bottom: 24px;">

      <div style="font-size: 0.9375rem; color: var(--ayala-text-main); line-height: 1.7;" class="article-rich-body">
        ${articulo.contenidoHtml}
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--ayala-steel-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: gap;">
        <span style="font-size: 0.8125rem; color: var(--ayala-steel);">Corporación Ayala S.A.C. - Área Técnica</span>
        <a href="${this.getWhatsAppUrl(this.config.empresa.whatsapp, `Hola Corporación Ayala, leí su artículo \"${articulo.titulo}\" y deseo hacer una consulta.`)}" target="_blank" class="btn btn-whatsapp" style="padding: 8px 16px; font-size: 0.8125rem;">
          Consultar sobre este tema
        </a>
      </div>
    `;

    modal.classList.add('active');
  },

  // -------------------------------------------------------------
  // MÓDULO 8: FORMULARIO DE CONTACTO (TRANSPARENTE, SIN ENVÍO FALSO)
  // -------------------------------------------------------------
  setupContactForm() {
    const form = document.getElementById('contact-form');
    const resultBox = document.getElementById('contact-action-result');
    const previewEl = document.getElementById('action-preview-text');
    const copyBtn = document.getElementById('btn-copy-inquiry');
    const waSubmitBtn = document.getElementById('btn-wa-inquiry');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('c-name')?.value.trim();
      const contacto = document.getElementById('c-contact')?.value.trim();
      const servicio = document.getElementById('c-service')?.value;
      const mensaje = document.getElementById('c-message')?.value.trim();

      if (!nombre || !contacto || !mensaje) {
        alert('Por favor completa tu nombre, medio de contacto y mensaje.');
        return;
      }

      const formattedInquiry = `*CONSULTA TÉCNICA - CORPORACIÓN AYALA S.A.C.*\n\n` +
        `👤 *Cliente / Empresa:* ${nombre}\n` +
        `📞 *Teléfono / Correo:* ${contacto}\n` +
        `⚙️ *Servicio de Interés:* ${servicio}\n` +
        `📝 *Detalle del requerimiento:*\n${mensaje}\n\n` +
        `_Consulta generada desde corporacionayalasac.com_`;

      if (previewEl) previewEl.textContent = formattedInquiry;
      if (resultBox) resultBox.classList.add('active');

      // Configurar acción WhatsApp
      if (waSubmitBtn) {
        const waUrl = this.getWhatsAppUrl(this.config.empresa.whatsapp, formattedInquiry);
        waSubmitBtn.onclick = () => {
          window.open(waUrl, '_blank');
        };
      }

      // Configurar acción Copiar
      if (copyBtn) {
        copyBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(formattedInquiry);
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `✓ Mensaje copiado`;
            setTimeout(() => { copyBtn.innerHTML = originalText; }, 2500);
          } catch (err) {
            alert('No se pudo copiar automáticamente. Puedes seleccionar el texto arriba y copiarlo manualmente.');
          }
        };
      }
    });
  },

  // -------------------------------------------------------------
  // BUSCADOR FUNCIONAL (HEADER & CATÁLOGO)
  // -------------------------------------------------------------
  setupSearch() {
    const headerInput = document.getElementById('header-search-input');
    const headerForm = document.getElementById('header-search-form');
    const dropdown = document.getElementById('search-results-dropdown');
    const catalogInput = document.getElementById('catalog-search-input');

    if (headerInput && dropdown) {
      headerInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
          dropdown.classList.remove('active');
          return;
        }

        const matches = await window.dataService.getProductos('todos', query);
        if (matches.length === 0) {
          dropdown.innerHTML = `<div class="search-empty-msg">No se encontraron productos para "${query}"</div>`;
        } else {
          dropdown.innerHTML = matches.slice(0, 5).map(p => `
            <div class="search-result-item" onclick="App.openProductModal('${p.id}'); document.getElementById('search-results-dropdown').classList.remove('active');">
              <img src="${p.imagen}" class="search-result-thumb" alt="${p.nombre}">
              <div class="search-result-info">
                <div class="search-result-title">${p.nombre}</div>
                <div class="search-result-cat">${p.categoriaNombre}</div>
              </div>
            </div>
          `).join('');
        }
        dropdown.classList.add('active');
      });

      // Cerrar dropdown al hacer click fuera
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-search-wrap')) {
          dropdown.classList.remove('active');
        }
      });
    }

    if (headerForm) {
      headerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = headerInput.value.trim();
        if (query) {
          dropdown.classList.remove('active');
          window.location.hash = '#catalogo';
          this.searchQuery = query;
          if (catalogInput) catalogInput.value = query;
          this.filterAndRenderCatalog();
        }
      });
    }

    if (catalogInput) {
      catalogInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.filterAndRenderCatalog();
      });
    }
  },

  resetSearch() {
    this.searchQuery = '';
    this.currentCategory = 'todos';
    const catalogInput = document.getElementById('catalog-search-input');
    if (catalogInput) catalogInput.value = '';
    
    const pills = document.getElementById('category-filter-pills');
    if (pills) {
      pills.querySelectorAll('.filter-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === 'todos');
      });
    }
    this.filterAndRenderCatalog();
  },

  // -------------------------------------------------------------
  // NAVEGACIÓN Y MENÚ MÓVIL (OFF-CANVAS DRAWER)
  // -------------------------------------------------------------
  setupNavigation() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const closeBtn = document.getElementById('mobile-drawer-close');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const desktopLinks = document.querySelectorAll('.nav-link');

    const openDrawer = () => {
      if (drawer) drawer.classList.add('active');
      if (backdrop) backdrop.classList.add('active');
      if (toggle) {
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
      }
      document.body.classList.add('mobile-nav-open');
      if (drawer) drawer.setAttribute('aria-hidden', 'false');
    };

    const closeDrawer = () => {
      if (drawer) drawer.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      if (toggle) {
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
      document.body.classList.remove('mobile-nav-open');
      if (drawer) drawer.setAttribute('aria-hidden', 'true');
    };

    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (drawer && drawer.classList.contains('active')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    desktopLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('active')) {
        closeDrawer();
      }
    });

    // Hash change tracker
    window.addEventListener('hashchange', () => {
      this.updateActiveNavLink();
    });
    this.updateActiveNavLink();
  },

  updateActiveNavLink() {
    const hash = window.location.hash || '#inicio';
    
    // Enlaces de escritorio
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });

    // Enlaces del drawer móvil
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });
  },

  // -------------------------------------------------------------
  // MODALES
  // -------------------------------------------------------------
  setupModals() {
    const modal = document.getElementById('generic-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModals());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModals();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModals();
    });
  },

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  },

  showGlobalError() {
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#E00820;color:#fff;padding:12px;text-align:center;z-index:99999;font-weight:700;';
    banner.innerHTML = 'Atención: No se pudieron cargar algunos datos locales. Por favor ejecuta el proyecto desde un servidor local (ej. Live Server o PHP) para permitir la lectura de archivos JSON.';
    document.body.prepend(banner);
  }
};
