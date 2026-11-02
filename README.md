# Web Corporativa - Corporación Ayala S.A.C.

Sitio web corporativo e industrial desarrollado a medida para **Corporación Ayala S.A.C.**, empresa especializada en cortes metálicos, venta de placas industriales, soldadura calificada y estructuras metálicas en Lima, Perú.

---

## 🏗️ Identidad Visual Aplicada

- **Azul Marino Predominante**: `#06275E` (Header, navegación, botones secundarios y acentos estructurales).
- **Rojo Industrial**: `#E00820` (Acciones principales, llamadas a la acción, acentos y líneas divisorias).
- **Gris Acero**: `#697680` (Textos secundarios, bordes y fichas técnicas).
- **Blanco**: `#FFFFFF` (Superficies de tarjetas y fondos limpios).
- **Gris Claro**: `#F3F5F7` (Fondo de secciones alternadas).

> [!NOTE]
> Se eliminó cualquier rastro de la referencia externa (Soldamundo / Casa Lima): no hay amarillo, no hay marcas ajenas, y **se suprimió totalmente el carrito de compras, pagos y cotizador en línea**. Todas las consultas se canalizan de manera directa por Contacto y WhatsApp.

---

## 📁 Estructura del Proyecto

```text
SOLDADOR/
├── index.html               # Página web principal con todos los módulos
├── index.php                # Entrada compatible para hosting PHP
├── .htaccess                # Configuración optimizada para Apache/cPanel (Gzip, MIME, Cache)
├── README.md                # Este archivo de documentación
├── GUIA_ACTUALIZACION.md    # Manual para modificar productos, servicios y artículos en JSON
├── DATOS_PENDIENTES.md      # Lista de verificación de datos a confirmar con la empresa
├── css/
│   └── style.css            # Hoja de estilos con variables, diseño responsivo y modales
├── js/
│   ├── data-service.js      # Capa centralizada e independiente de lectura de datos
│   └── app.js               # Lógica de interfaz, filtros, buscador, modales y WhatsApp
├── data/
│   ├── config.json          # Configuración global, contactos, teléfono, RUC, WhatsApp
│   ├── productos.json       # Catálogo de placas industriales y categorías en preparación
│   ├── servicios.json       # Cortes metálicos, placas, soldadura y estructuras
│   ├── marcas.json          # Marcas y proveedores (con estado vacío elegante para demo)
│   ├── soporte.json         # Guía de planos CAD/PDF y preguntas frecuentes (FAQ)
│   ├── nosotros.json        # Presentación institucional, valores y metodología
│   ├── sucursales.json      # Sede confirmada en Ate (SUNAT) y mapa interactivo
│   └── articulos.json       # Artículos técnicos demostrativos del blog
└── assets/
    ├── icons/               # Iconografía vectorial
    └── images/              # Logotipos (SVG), fotografía de portada y placas técnicas
```

---

## 🚀 Cómo Probar el Proyecto Localmente

Para que el navegador pueda leer los archivos JSON mediante `fetch()`, se requiere ejecutar el sitio desde un servidor HTTP local (no abrirlo directamente como `file:///` en Chrome):

### Opción 1: Con Python (Recomendado)
Abre PowerShell en la carpeta del proyecto y ejecuta:
```powershell
python -m http.server 8080
```
Luego abre tu navegador en: [http://localhost:8080](http://localhost:8080)

### Opción 2: Con la extensión Live Server (VS Code / Antigravity)
Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.

### Opción 3: Con PHP
```powershell
php -S localhost:8080
```

---

## 🌐 Cómo Subirlo a un Hosting Compartido (cPanel / Hostinger / GoDaddy)

El proyecto está diseñado bajo arquitectura estática desacoplada, por lo que **no requiere Node.js, compilación ni bases de datos activas** en esta fase:

1. Ingresa al panel de tu hosting (cPanel, Plesk, etc.).
2. Abre el **Administrador de Archivos** (File Manager).
3. Navega al directorio público principal (habitualmente `public_html/` o `www/`).
4. Sube todos los archivos y carpetas (`index.html`, `index.php`, `.htaccess`, `css/`, `js/`, `data/`, `assets/`).
5. ¡Listo! El sitio web cargará inmediatamente con soporte para compresión Gzip y tipos MIME correctos gracias al archivo `.htaccess`.

---

## 🔌 Migración Futura a Base de Datos (MySQL / API)

Toda la lectura de información está centralizada en `js/data-service.js`. Cuando desees conectar una base de datos MySQL o un backend PHP:
1. No necesitas tocar `index.html` ni `css/style.css`.
2. En `js/data-service.js`, simplemente reemplaza las rutas locales `data/*.json` por tus endpoints PHP (ejemplo: `api/getProductos.php`).
3. La interfaz continuará funcionando sin ninguna modificación.
