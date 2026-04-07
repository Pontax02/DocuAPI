export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'DocuAPI',
    version: '1.0.0',
    description: 'Local REST API for document validation (images and PDFs). No external services — everything runs on-premise.',
  },
  servers: [
    { url: 'http://localhost:3000/api', description: 'Local development' },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      },
    },
  },
  paths: {
    '/status': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                example: { status: 'OK' },
              },
            },
          },
        },
      },
    },
    '/validate-document': {
      post: {
        summary: 'Validate one or two documents',
        tags: ['Validation'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file_1'],
                properties: {
                  file_1: {
                    type: 'string',
                    format: 'binary',
                    description: 'Primary document (required). JPEG, PNG or PDF.',
                  },
                  file_2: {
                    type: 'string',
                    format: 'binary',
                    description: 'Secondary document (optional). JPEG, PNG or PDF.',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Validation result',
            content: {
              'application/json': {
                examples: {
                  valid_image: {
                    summary: 'Valid image',
                    value: {
                      file_1: {
                        valid: true,
                        errors: [],
                        metadata: {
                          mime: 'image/jpeg',
                          sizeKB: 450,
                          hash: '46b3349e...',
                          width: 1920,
                          height: 1080,
                          format: 'jpeg',
                        },
                      },
                    },
                  },
                  invalid_image: {
                    summary: 'Invalid image',
                    value: {
                      file_1: {
                        valid: false,
                        errors: ['resolution_too_low', 'file_too_small'],
                        metadata: {
                          mime: 'image/jpeg',
                          sizeKB: 20,
                          hash: 'ab318d...',
                          width: 300,
                          height: 200,
                          format: 'jpeg',
                        },
                      },
                    },
                  },
                  valid_pdf: {
                    summary: 'Valid PDF',
                    value: {
                      file_1: {
                        valid: true,
                        errors: [],
                        metadata: {
                          mime: 'application/pdf',
                          sizeKB: 1432,
                          hash: '08cae9b...',
                          pages: 3,
                          pdfVersion: '1.7',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Missing file_1',
            content: {
              'application/json': {
                example: { valid: false, errors: ['file_1_required'] },
              },
            },
          },
        },
      },
    },
    '/admin/logs': {
      get: {
        summary: 'Get application logs',
        tags: ['Admin'],
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: 'lines',
            in: 'query',
            description: 'Number of log lines to return (default: 100)',
            schema: { type: 'integer', default: 100 },
          },
        ],
        responses: {
          200: {
            description: 'Log entries',
            content: {
              'application/json': {
                example: {
                  total: 243,
                  showing: 100,
                  logs: [
                    '[2026-04-07 12:30:01] INFO: POST /validate-document - file_1: valid',
                    '[2026-04-07 12:30:10] ERROR: POST /validate-document - Sharp error',
                  ],
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                example: { errors: ['unauthorized'] },
              },
            },
          },
        },
      },
    },
  },
};
