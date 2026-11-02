# Guía de Actualización de Contenido - Corporación Ayala S.A.C.

Esta guía explica cómo modificar textos, añadir productos, actualizar datos de contacto y publicar nuevos artículos sin tocar código HTML ni estilos CSS.

---

## 1. Actualizar Datos de Contacto y Teléfonos
**Archivo:** `data/config.json`

```json
{
  "empresa": {
    "nombre": "Corporación Ayala S.A.C.",
    "ruc": "20535988111",
    "telefono": "+51 987 654 321",        // Cambiar por el teléfono oficial
    "telefonoLlamadas": "tel:+51987654321",
    "whatsapp": "51987654321",             // Número sin signos para enlace wa.me
    "whatsappHabilitado": true,             // true = activo, false = desactiva botón flotante
    "correo": "contacto@corporacionayalasac.com",
    "direccion": "Mz. B, Lote 11, Urb. Parcela Semirústica Zavaleta, Ate, Lima, Perú",
    "horario": "Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 8:00 AM - 1:00 PM"
  }
}
```

---

## 2. Agregar o Modificar Productos en el Catálogo
**Archivo:** `data/productos.json`

Para agregar un nuevo producto, añade un objeto dentro del arreglo `"productos"`:

```json
{
  "id": "prod-nueva-placa",
  "nombre": "Placa de Asiento para Viga W",
  "categoriaId": "placas-industriales",
  "categoriaNombre": "Placas Industriales",
  "descripcionCorta": "Placa de conexión reforzada para vigas de perfil W.",
  "descripcionLarga": "Descripción técnica detallada del producto...",
  "imagen": "assets/images/tu-foto.jpg",
  "tipoImagen": "referencia",
  "etiquetaTipoImagen": "Referencia Técnica",
  "destacado": true,
  "especificaciones": {
    "Norma / Material": "Acero estructural ASTM A36",
    "Espesores Disponibles": "3/8\" a 1\"",
    "Dimensiones": "A medida según plano"
  },
  "aplicaciones": [
    "Conexión de vigas principales en pórticos",
    "Soporte de tijerales"
  ]
}
```

---

## 3. Activar Marcas Comerciales
**Archivo:** `data/marcas.json`

Por defecto, el sitio muestra un estado elegante de **"Marcas en Proceso de Homologación"** para no inventar vínculos comerciales no respaldados. Cuando la empresa confirme sus marcas proveedoras, cambia `"marcasConfirmadas": true` y completa los datos:

```json
{
  "marcasConfirmadas": true,
  "marcas": [
    {
      "id": "aceros-arequipa",
      "nombre": "Aceros Arequipa",
      "logo": "assets/images/marca-arequipa.svg",
      "descripcion": "Barras de construcción y planchas estructurales ASTM",
      "activo": true
    }
  ]
}
```

---

## 4. Agregar Nuevos Artículos al Blog
**Archivo:** `data/articulos.json`

Añade un nuevo objeto dentro del arreglo `"articulos"`. Recuerda que si el artículo es provisional, mantén `"esDemostracion": true`:

```json
{
  "id": "nuevo-articulo-soldadura",
  "titulo": "Buenas Prácticas en Soldadura de Filete para Placas Base",
  "slug": "buenas-practicas-soldadura-filete",
  "categoriaId": "procesos",
  "categoriaNombre": "Procesos",
  "fecha": "02 Nov 2026",
  "tiempoLectura": "4 min de lectura",
  "esDemostracion": true,
  "resumen": "Resumen breve que aparecerá en la tarjeta...",
  "imagen": "assets/images/blog-corte.jpg",
  "contenidoHtml": "<p>Primer párrafo...</p><h3>Subtítulo técnico</h3><p>Segundo párrafo...</p>"
}
```
