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
- SHA-256 hash of the file included in every response
- Automatic cleanup of temporary files after validation
- Security: Helmet, CORS whitelist, rate limiting
- Layered architecture: routes → controller → service → utils

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

---

## Endpoints

### `POST /api/validate-document`

Validates one or two documents sent as `multipart/form-data`.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file_1` | File | Yes | Primary document |
| `file_2` | File | No | Secondary document |

---

**Successful response (valid document):**

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

**Response with validation errors:**

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
| `corrupted_file` | 200 | Sharp could not read the file |
| `route_not_found` | 404 | The requested route does not exist |
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
│   │   └── validate.routes.js      # POST /api/validate-document
│   ├── controllers/
│   │   └── validate.controller.js  # Request/response handling
│   ├── services/
│   │   └── validate.service.js     # Validation logic
│   ├── middlewares/
│   │   ├── upload.middleware.js    # Multer: file reception
│   │   └── error.middleware.js     # Global error handler
│   ├── utils/
│   │   ├── hash.utils.js           # SHA-256
│   │   ├── mime.utils.js           # MIME type validation
│   │   └── image.utils.js          # Sharp: metadata and validations
│   └── config/
│       ├── env.js                  # Environment variables
│       ├── cors.js                 # CORS configuration
│       └── rateLimit.js            # Rate limit configuration
├── uploads/                        # Temporary files (gitignored)
├── postman/
│   └── DocuAPI.postman_collection.json
├── .env.example
├── .gitignore
└── package.json
```

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Production server |
| `npm run dev` | Server with auto-reload |

---

## curl Examples

```bash
# Validate a single image
curl -X POST http://localhost:3000/api/validate-document \
  -F "file_1=@/path/to/image.jpg"

# Validate two documents
curl -X POST http://localhost:3000/api/validate-document \
  -F "file_1=@/path/to/document1.jpg" \
  -F "file_2=@/path/to/document2.png"
```

---

## License

MIT © Pablo Pontanilla Moreira
