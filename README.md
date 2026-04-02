# DocuAPI

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

API REST local para validación de documentos (imágenes y PDFs). Procesa archivos completamente en local, sin servicios externos, y devuelve un JSON estructurado con el resultado de la validación.

---

## Features

- Validación de tipo MIME real (`image/jpeg`, `image/png`, `application/pdf`)
- Validación de tamaño mínimo y máximo configurable
- Validación de resolución mínima (ancho y alto) con Sharp
- Detección de imágenes en blanco o completamente negras (análisis de histograma)
- Detección de archivos corruptos
- Hash SHA-256 del archivo en cada respuesta
- Limpieza automática de archivos temporales tras la validación
- Seguridad: Helmet, CORS con whitelist, rate limiting
- Arquitectura en capas: routes → controller → service → utils

---

## Requisitos

- Node.js >= 18
- npm

---

## Setup

```bash
# 1. Clonar el repositorio
git clone https://github.com/Pontax02/DocuAPI.git
cd DocuAPI

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Crear carpeta de uploads (si no existe)
mkdir uploads

# 5. Arrancar el servidor
npm run dev
```

El servidor arranca en `http://localhost:3000` por defecto.

---

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto del servidor |
| `NODE_ENV` | `development` | Entorno (`development` / `production`) |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Orígenes CORS permitidos (separados por comas) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Ventana de rate limiting en ms (15 min) |
| `RATE_LIMIT_MAX` | `100` | Máximo de requests por ventana |
| `MAX_FILE_SIZE_MB` | `5` | Tamaño máximo de archivo en MB |
| `MIN_FILE_SIZE_KB` | `50` | Tamaño mínimo de archivo en KB |
| `MIN_RESOLUTION_PX` | `600` | Resolución mínima en píxeles (ancho y alto) |
| `UPLOAD_DIR` | `uploads` | Carpeta temporal para archivos subidos |

---

## Endpoints

### `POST /api/validate-document`

Valida uno o dos documentos enviados como `multipart/form-data`.

**Campos:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `file_1` | File | Sí | Documento principal |
| `file_2` | File | No | Documento secundario |

---

**Respuesta exitosa (documento válido):**

```json
{
  "valid": true,
  "errors": [],
  "metadata": {
    "mime": "image/jpeg",
    "sizeKB": 450,
    "hash": "46b3349ea995a715f0f8dd2c9b594622b0ade9b10a69b907d71cf59faf89c72f",
    "width": 1920,
    "height": 1080,
    "format": "jpeg"
  }
}
```

**Respuesta con errores de validación:**

```json
{
  "valid": false,
  "errors": ["resolution_too_low", "file_too_small"],
  "metadata": {
    "mime": "image/jpeg",
    "sizeKB": 20,
    "hash": "ab318d...",
    "width": 300,
    "height": 200,
    "format": "jpeg"
  }
}
```

**Sin archivo (`400`):**

```json
{
  "valid": false,
  "errors": ["file_1_required"]
}
```

---

## Códigos de error

| Código | HTTP | Descripción |
|--------|------|-------------|
| `file_1_required` | 400 | No se envió el campo `file_1` |
| `mime_not_allowed` | 200 | El tipo MIME no está permitido |
| `file_too_small` | 200 | El archivo es menor que `MIN_FILE_SIZE_KB` |
| `file_too_large` | 400 | El archivo supera `MAX_FILE_SIZE_MB` (Multer) |
| `resolution_too_low` | 200 | Ancho o alto menor que `MIN_RESOLUTION_PX` |
| `blank_or_black_image` | 200 | La imagen está completamente en blanco o negro |
| `corrupted_file` | 200 | Sharp no pudo leer el archivo |
| `route_not_found` | 404 | La ruta solicitada no existe |
| `internal_server_error` | 500 | Error interno no controlado |

---

## Seguridad

- **Helmet** — cabeceras HTTP seguras (`X-Content-Type-Options`, `X-Frame-Options`, etc.)
- **CORS** — solo los orígenes en `ALLOWED_ORIGINS` pueden llamar a la API
- **Rate limiting** — máximo 100 requests cada 15 minutos por IP
- **Límite de body** — máximo 10MB en el body JSON
- **Validación de MIME** — doble validación: Multer + lógica propia
- **Limpieza de archivos** — los archivos temporales se borran tras cada validación

---

## Estructura del proyecto

```
DocuAPI/
├── src/
│   ├── app.js                      # Express: middlewares y rutas
│   ├── server.js                   # Arranque del servidor
│   ├── routes/
│   │   └── validate.routes.js      # POST /api/validate-document
│   ├── controllers/
│   │   └── validate.controller.js  # Manejo de req/res
│   ├── services/
│   │   └── validate.service.js     # Lógica de validación
│   ├── middlewares/
│   │   ├── upload.middleware.js    # Multer: recepción de archivos
│   │   └── error.middleware.js     # Manejador global de errores
│   ├── utils/
│   │   ├── hash.utils.js           # SHA-256
│   │   ├── mime.utils.js           # Validación de MIME types
│   │   └── image.utils.js          # Sharp: metadatos y validaciones
│   └── config/
│       ├── env.js                  # Variables de entorno
│       ├── cors.js                 # Configuración CORS
│       └── rateLimit.js            # Configuración rate limit
├── uploads/                        # Archivos temporales (gitignored)
├── postman/
│   └── DocuAPI.postman_collection.json
├── .env.example
├── .gitignore
└── package.json
```

---

## Scripts npm

| Script | Descripción |
|--------|-------------|
| `npm start` | Servidor de producción |
| `npm run dev` | Servidor con recarga automática |

---

## Ejemplo con curl

```bash
# Validar una imagen
curl -X POST http://localhost:3000/api/validate-document \
  -F "file_1=@/ruta/a/tu/imagen.jpg"

# Validar dos documentos
curl -X POST http://localhost:3000/api/validate-document \
  -F "file_1=@/ruta/documento1.jpg" \
  -F "file_2=@/ruta/documento2.png"
```

---

## Licencia

MIT © Pablo Pontanilla Moreira
