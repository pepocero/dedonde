# DeDónde

DeDónde es una PWA mobile-first para descubrir la procedencia de un producto de supermercado.

El flujo del MVP es deliberadamente corto: **escanear un código de barras con la cámara del móvil → consultar Open Food Facts → mostrar con claridad la información de origen disponible**, sin adivinar lo que la base de datos no proporciona.

La aplicación no está limitada a Mercadona. Cualquier código EAN/UPC puede consultarse.

## Tecnologías utilizadas

- React 18
- Vite
- TypeScript
- CSS moderno (mobile-first)
- PWA con `vite-plugin-pwa` (manifiesto + service worker + caché de recursos)
- API pública de Open Food Facts v3
- `BarcodeDetector` nativo, con `@zxing/browser` como respaldo

No hay backend propio, usuarios, login ni base de datos en esta versión.

## Cómo instalar el proyecto

Necesitas Node.js 18 o superior.

```bash
npm install
```

## Cómo ejecutarlo en desarrollo

```bash
npm run dev
```

Vite quedará escuchando en la red local (`--host`) para poder abrir la app desde un teléfono en la misma Wi-Fi.

La cámara solo funciona en un **contexto seguro**: `https://` o `http://localhost`. Si abres la IP local por HTTP (`http://192.168.x.x`), el navegador bloqueará el acceso a la cámara. En ese caso usa la introducción manual del código, o despliega la app con HTTPS.

## Cómo generar la build

```bash
npm run build
```

La carpeta de salida es `dist/`.

Para previsualizar la build:

```bash
npm run preview
```

## Cómo probar la PWA

1. Genera la build y sírvela por HTTPS.
2. En Chrome (Android o escritorio): menú del navegador → **Instalar aplicación** / **Añadir a la pantalla de inicio**.
3. En Safari (iPhone): botón Compartir → **Añadir a pantalla de inicio**.
4. En DevTools → Application: comprueba el manifiesto, los iconos y que el service worker esté activo.

La PWA usa:

- nombre: **DeDónde**
- nombre corto: **DeDónde**
- `theme_color`: `#2C3E2F`
- `background_color`: `#FAF6F1`
- `display`: `standalone`
- caché de los recursos de la aplicación (HTML, JS, CSS, iconos y fuentes)

## Cómo funciona el escáner

1. El usuario pulsa **Escanear producto**.
2. El navegador pide permiso de cámara.
3. Se muestra una guía visual para colocar el código de barras.
4. La detección es automática: no hay que hacer una foto.
5. En cuanto se lee un código, la cámara se detiene.
6. Se consulta Open Food Facts una sola vez.
7. Se muestra el resultado, el producto no encontrado o un error comprensible.

Prioridad del lector:

1. API nativa `BarcodeDetector`, si el navegador soporta EAN-13, EAN-8, UPC-A o UPC-E.
2. Si no está disponible (caso habitual de Safari en iPhone), se usa `@zxing/browser` sobre el mismo stream de cámara.

La aplicación no guarda fotografías ni envía imágenes a ningún servidor. El vídeo se usa solo en el dispositivo para leer el código.

También se puede introducir el código a mano. Solo se aceptan códigos numéricos con longitud y dígito de control válidos (EAN-8, UPC-A, EAN-13 o GTIN-14).

## Cómo funciona la API de Open Food Facts

Se consulta únicamente el producto pedido, nunca una descarga masiva:

```
GET https://world.openfoodfacts.org/api/v3/product/{codigo}
```

Parámetros usados:

- `fields`: solo los campos necesarios para nombre, marca, imagen y procedencia
- `lc=es`, `cc=es`, `tags_lc=es` para priorizar textos en español

Interpretación de la respuesta:

- `status: success` y `result.id: product_found`: producto encontrado
- `result.id: product_not_found` o HTTP 404: producto no encontrado
- timeout (12 s), error de red o HTTP 429/5xx: mensaje sencillo, sin detalles técnicos

Si un UPC-A de 12 dígitos no aparece, se reintenta una vez como EAN-13 con el `0` inicial, que es la equivalencia estándar de códigos, no una inferencia de origen.

Los resultados se guardan temporalmente en `localStorage`:

- producto encontrado: 7 días
- producto no encontrado: 24 horas

Pasado ese tiempo se vuelve a consultar la API.

## Qué información de origen puede y no puede proporcionar la aplicación

Open Food Facts distingue varios conceptos. DeDónde los muestra por separado y **no los mezcla**.

| Campo de Open Food Facts | Qué significa | Cómo lo muestra DeDónde |
| --- | --- | --- |
| `origins` / `origins_tags` | Origen de los **ingredientes** | Badge de origen |
| `manufacturing_places` | Lugar donde se **fabricó o transformó** el producto | Fabricado en |
| `production_places` | Lugar de elaboración, si existe | Elaborado en |
| `packaging_places` | Lugar de envasado, si existe | Envasado en |
| `manufacturers` | Fabricante, si existe | Fabricante |
| `origin` | Texto libre del envase, a menudo mezclado | Texto de origen indicado en el producto |
| `countries` / `countries_tags` | Países donde se **vende** | Se vende en |
| `brands` | Marca | Marca |

La API pública **no usa el prefijo del código de barras para deducir el país**. DeDónde tampoco.

Si hay un país de origen claro: `🇪🇸 España`, `🇲🇦 Marruecos`, `🇵🇹 Portugal`, etc.

Si hay varios: `🌍 Origen: varios países`.

Si no hay datos estructurados: `❓ Origen desconocido` y el aviso:

**No tenemos información suficiente sobre el origen de este producto.**

Los campos `production_places` y `packaging_places` se solicitan por si aparecen, pero no forman parte estable del esquema público. Si Open Food Facts no los envía, la app no inventa un lugar de elaboración ni de envasado.

`owner` de Open Food Facts es la cuenta que mantiene la ficha, no el fabricante. No se muestra como origen.

## Limitaciones conocidas

- Gran parte de los productos tienen origen incompleto o vacío en Open Food Facts.
- Los datos son colaborativos: pueden estar desactualizados o ser incorrectos.
- Safari en iPhone no suele soportar `BarcodeDetector`; el fallback de ZXing funciona, pero depende de la iluminación y del enfoque.
- La cámara exige HTTPS (o localhost).
- Open Food Facts limita las lecturas a unos 15 productos por minuto y IP.
- No hay historial, cuentas ni datos propios de Mercadona en esta versión.
- En escritorio funciona, pero la interfaz está pensada para usarse con una mano en el móvil.

## Cómo desplegarla

Es una aplicación estática. Sube el contenido de `dist/` a cualquier hosting con HTTPS:

- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages
- Cualquier servidor estático (nginx, Apache, etc.)

Comando de build:

```bash
npm run build
```

Directorio publicado: `dist`.

Configura la redirección de rutas al `index.html` si el hosting lo requiere. El service worker ya incluye `navigateFallback` para la build.

Sin HTTPS no se podrá instalar como PWA ni usar la cámara.

## Próximas mejoras

Solo documentadas. **No implementadas** en este MVP.

- Base de datos propia
- Productos específicamente de Mercadona
- Contribuciones de usuarios
- Fotografías de etiquetas
- OCR
- Sistema de confianza/verificación
- Historial de productos
- Favoritos
