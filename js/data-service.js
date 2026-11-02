/**
 * DataService - Capa centralizada e independiente de acceso a datos
 * Corporación Ayala S.A.C.
 * 
 * Esta clase abstrae completamente la obtención de información para la interfaz.
 * En esta etapa consume archivos estáticos JSON.
 * Cuando se migre a un backend o base de datos (PHP / MySQL / API REST),
 * solo se modifican los métodos de esta clase sin tocar la UI ni el renderizado.
 */

class AyalaDataService {
  constructor() {
    this.basePath = 'data/';
    this.cache = new Map();
  }

  /**
   * Petición genérica con manejo de errores y caché en memoria
   */
  async _fetch(endpoint) {
    if (this.cache.has(endpoint)) {
      return this.cache.get(endpoint);
    }

    try {
      const response = await fetch(`${this.basePath}${endpoint}?v=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status} al cargar ${endpoint}`);
      }
      const data = await response.json();
      this.cache.set(endpoint, data);
      return data;
    } catch (error) {
      console.error(`[AyalaDataService] Error en endpoint "${endpoint}":`, error);
      throw error;
    }
  }

  // CONFIGURACIÓN GENERAL Y EMPRESA
  async getConfig() {
    return await this._fetch('config.json');
  }

  // SERVICIOS (Cortes, Placas, Soldadura, Estructuras)
  async getServicios() {
    return await this._fetch('servicios.json');
  }

  async getServicioById(id) {
    const servicios = await this.getServicios();
    return servicios.find(s => s.id === id) || null;
  }

  // PRODUCTOS Y CATEGORÍAS
  async getProductosData() {
    return await this._fetch('productos.json');
  }

  async getCategorias() {
    const data = await this.getProductosData();
    return data.categorias || [];
  }

  async getProductos(filtroCategoria = 'todos', textoBusqueda = '') {
    const data = await this.getProductosData();
    let lista = data.productos || [];

    if (filtroCategoria && filtroCategoria !== 'todos') {
      lista = lista.filter(p => p.categoriaId === filtroCategoria);
    }

    if (textoBusqueda && textoBusqueda.trim() !== '') {
      const query = textoBusqueda.trim().toLowerCase();
      lista = lista.filter(p => 
        p.nombre.toLowerCase().includes(query) ||
        p.descripcionCorta.toLowerCase().includes(query) ||
        (p.descripcionLarga && p.descripcionLarga.toLowerCase().includes(query)) ||
        (p.categoriaNombre && p.categoriaNombre.toLowerCase().includes(query))
      );
    }

    return lista;
  }

  async getProductosDestacados() {
    const data = await this.getProductosData();
    const productos = data.productos || [];
    return productos.filter(p => p.destacado);
  }

  async getProductoById(id) {
    const data = await this.getProductosData();
    const productos = data.productos || [];
    return productos.find(p => p.id === id) || null;
  }

  // MARCAS
  async getMarcas() {
    return await this._fetch('marcas.json');
  }

  // SOPORTE TÉCNICO Y FAQ
  async getSoporte() {
    return await this._fetch('soporte.json');
  }

  // NOSOTROS
  async getNosotros() {
    return await this._fetch('nosotros.json');
  }

  // SUCURSALES / UBICACIÓN
  async getSucursales() {
    return await this._fetch('sucursales.json');
  }

  // BLOG Y ARTÍCULOS
  async getArticulosData() {
    return await this._fetch('articulos.json');
  }

  async getCategoriasBlog() {
    const data = await this.getArticulosData();
    return data.categorias || [];
  }

  async getArticulos(categoriaId = 'todos') {
    const data = await this.getArticulosData();
    let articulos = data.articulos || [];
    if (categoriaId && categoriaId !== 'todos') {
      articulos = articulos.filter(a => a.categoriaId === categoriaId);
    }
    return articulos;
  }

  async getArticuloById(id) {
    const data = await this.getArticulosData();
    const articulos = data.articulos || [];
    return articulos.find(a => a.id === id || a.slug === id) || null;
  }
}

// Instancia global exportada
window.dataService = new AyalaDataService();
