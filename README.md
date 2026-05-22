# DocuAPI

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

A local REST API for document validation (images and PDFs). Files are processed entirely on-premise, with no external services, returning a structured JSON with the validation result.

---

## Features

- Real MIME type validation (`image/jpeg`, `image/png`, `application/pdf`)
- Configurable minimum and maximum file size validation
- Minimum resolution validation (width and height) using Sharp
- Blank or completely black image detection (histogram analysis)
- Corrupted file detection
- PDF validation: fake PDF detection, page count, PDF version
- Support for two documents per request (`file_1` required, `file_2` optional)
- SHA-256 hash of each file included in every response
- Automatic cleanup of temporary files after validation (even on error)
- Structured logging with Winston: console + file output (`logs/`)
- Protected admin endpoint to read logs via API key
- Security: Helmet, CORS whitelist, rate limiting
- Layered architecture: routes → controller → service → utils
- Swagger UI available at `/docs` (OpenAPI 3.0)
- OCR text extraction from images using Tesseract.js (English + Spanish)
- Spanish DNI detection and structured field parsing (name, surname, birth date, gender, age)
- Optional `birthDate` body field to cross-validate against the DNI's extracted birth date

---

## Requirements

- Node.js >= 18
- npm

---

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/Pontax02/DocuAPI.git
cd DocuAPI

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values

# 4. Create uploads folder (if it does not exist)
mkdir uploads

# 5. Start the server
npm run dev
```

The server starts at `http://localhost:3000` by default.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment (`development` / `production`) |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated list of allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window in milliseconds (15 min) |
| `RATE_LIMIT_MAX` | `100` | Maximum requests per window |
| `MAX_FILE_SIZE_MB` | `5` | Maximum file size in MB |
| `MIN_FILE_SIZE_KB` | `50` | Minimum file size in KB |
| `MIN_RESOLUTION_PX` | `600` | Minimum image resolution in pixels (width and height) |
| `UPLOAD_DIR` | `uploads` | Temporary folder for uploaded files |
| `ADMIN_API_KEY` | — | Secret key for the admin logs endpoint |

---

## Endpoints

### `GET /api/status`

Returns API health status.

```json
{ "status": "OK" }
```

---

### `GET /docs`

Interactive Swagger UI. Explore and test all endpoints directly from the browser.

> No authentication required to access the docs UI.

---

### `GET /api/admin/logs`

Returns the last N lines from the application log.

**Headers:**

| Header | Value |
|--------|-------|
| `x-api-key` | Your `ADMIN_API_KEY` value |

**Query params:**

| Param | Default | Description |
|-------|---------|-------------|
| `lines` | `100` | Number of log lines to return |

**Response:**

```json
{
  "total": 243,
  "showing": 100,
  "logs": [
    "[2026-04-07 12:30:01] INFO: POST /validate-document - file_1: valid",
    "[2026-04-07 12:30:10] ERROR: POST /validate-document - Sharp error"
  ]
}
```

---

### `POST /api/validate-document`

Validates one or two documents sent as `multipart/form-data`.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file_1` | File | Yes | Primary document (image or PDF) |
| `file_2` | File | No | Secondary document |
| `birthDate` | String | No | Expected birth date in `DD/MM/YYYY` format — validated against the OCR-extracted DNI value |

---

**Successful response — single file (DNI image):**

```json
{
  "file_1": {
    "valid": true,
    "errors": [],
    "metadata": {
      "mime": "image/jpeg",
      "sizeKB": 450,
      "hash": "46b3349ea995a715f0f8dd2c9b594622b0ade9b10a69b907d71cf59faf89c72f",
      "width": 1920,
      "height": 1080,
      "format": "jpeg",
      "ocrRawText": "REINO DE ESPANA\nDOCUMENTO NACIONAL DE IDENTIDAD\n...",
      "dni": {
        "name": "PABLO",
        "surname": "PONTANILLA MOREIRA",
        "birthDate": "04/04/2006",
        "gender": "M",
        "age": 20
      }
    }
  }
}
```

**Successful response — two files:**

```json
{
  "file_1": {
    "valid": true,
    "errors": [],
    "metadata": {
      "mime": "image/jpeg",
      "sizeKB": 450,
      "hash": "46b3349...",
      "width": 1920,
      "height": 1080,
      "format": "jpeg"
    }
  },
  "file_2": {
    "valid": true,
    "errors": [],
    "metadata": {
      "mime": "application/pdf",
      "sizeKB": 1432,
      "hash": "08cae9b...",
      "pages": 3,
      "pdfVersion": "1.7"
    }
  }
}
```

**Response with validation errors:**

```json
{
  "file_1": {
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
}
```

**Missing file (`400`):**

```json
{
  "valid": false,
  "errors": ["file_1_required"]
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `file_1_required` | 400 | `file_1` field was not provided |
| `mime_not_allowed` | 200 | MIME type is not in the allowed list |
| `file_too_small` | 200 | File size is below `MIN_FILE_SIZE_KB` |
| `file_too_large` | 400 | File exceeds `MAX_FILE_SIZE_MB` (Multer limit) |
| `resolution_too_low` | 200 | Width or height is below `MIN_RESOLUTION_PX` |
| `blank_or_black_image` | 200 | Image is entirely white or black |
| `corrupted_file` | 200 | File could not be parsed (image or PDF) |
| `fake_pdf` | 200 | File does not have a valid PDF header |
| `pdf_no_pages` | 200 | PDF was parsed but has no pages |
| `ocr_no_text_detected` | 200 | OCR ran but extracted no text from the image |
| `ocr_not_a_dni` | 200 | Extracted text does not contain DNI document markers |
| `birthDate_mismatch` | 200 | `birthDate` body field does not match the DNI's extracted birth date |
| `route_not_found` | 404 | The requested route does not exist |
| `unauthorized` | 401 | Missing or invalid `x-api-key` header |
| `internal_server_error` | 500 | Unhandled internal server error |

---

## Security

- **Helmet** — secure HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`, etc.)
- **CORS** — only origins listed in `ALLOWED_ORIGINS` can call the API
- **Rate limiting** — maximum 100 requests per 15 minutes per IP
- **Body limit** — maximum 10MB JSON body
- **MIME validation** — double check: Multer filter + custom service logic
- **File cleanup** — temporary files are deleted after each validation

---

## Project Structure

```
DocuAPI/
├── src/
│   ├── app.js                      # Express: middlewares and routes
│   ├── server.js                   # Server startup
│   ├── routes/
│   │   ├── validate.routes.js      # POST /api/validate-document
│   │   ├── health.routes.js        # GET /api/status
│   │   └── admin.routes.js         # GET /api/admin/logs
│   ├── controllers/
│   │   └── validate.controller.js  # Request/response handling
│   ├── services/
│   │   └── validate.service.js     # Validation logic
│   ├── middlewares/
│   │   ├── upload.middleware.js    # Multer: file reception
│   │   ├── auth.middleware.js      # API key validation
│   │   └── error.middleware.js     # Global error handler
│   ├── utils/
│   │   ├── hash.utils.js           # SHA-256
│   │   ├── mime.utils.js           # MIME type validation
│   │   ├── image.utils.js          # Sharp: metadata and validations
│   │   ├── pdf.utils.js            # PDF validation
│   │   ├── ocr.utils.js            # Tesseract.js: text extraction (eng+spa)
│   │   └── dni.utils.js            # Spanish DNI detection and field parsing
│   └── config/
│       ├── env.js                  # Environment variables
│       ├── cors.js                 # CORS configuration
│       ├── rateLimit.js            # Rate limit configuration
│       ├── logger.js               # Winston logger
│       └── swagger.js              # OpenAPI 3.0 document
├── logs/                           # Log files (gitignored)
├── uploads/                        # Temporary files (gitignored)
├── test/
│   ├── fixtures/                   # Test files (jpg, pdf, corrupted, blank…)
│   ├── utils.test.js               # Unit tests: hash, mime, image utils
│   └── validate.test.js            # Integration tests: POST /api/validate-document
├── .env.example
├── .gitignore
└── package.json
```

---

## Testing

The project includes unit and integration tests using Jest.

```bash
npm test
```

| File | Coverage |
|------|----------|
| `test/utils.test.js` | `hash.utils`, `mime.utils`, `image.utils` |
| `test/validate.test.js` | `POST /api/validate-document` (valid, invalid, PDF, corrupted…) |

Test fixtures are located in `test/fixtures/` and cover: valid JPEG, small file, low resolution, blank image, corrupted file, valid PDF, and fake PDF.

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Production server |
| `npm run dev` | Server with auto-reload (Node.js `--watch`) |
| `npm run devStart` | Server with auto-reload (nodemon) |
| `npm test` | Run Jest test suite |

---

## curl Examples

```bash
# Validate a single image
curl -X POST http://localhost:3000/api/validate-document \
  -F "file_1=@/path/to/image.jpg"

# Validate a DNI image with birth date cross-check
curl -X POST http://localhost:3000/api/validate-document \
  -F "file_1=@/path/to/dni.jpg" \
  -F "birthDate=04/04/2006"

# Validate two documents
curl -X POST http://localhost:3000/api/validate-document \
  -F "file_1=@/path/to/document1.jpg" \
  -F "file_2=@/path/to/document2.png"
```

---

## License

MIT © Pablo Pontanilla Moreira
