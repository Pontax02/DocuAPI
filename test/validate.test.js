import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('../src/utils/ocr.utils.js', () => ({
  extractText: jest.fn().mockResolvedValue('DOCUMENTO NACIONAL DE IDENTIDAD'),
}));

const { app } = await import('../src/app.js');
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.join(__dirname, 'fixtures', name);

// ─── GET /api/status ──────────────────────────────────────────────────────────

describe('GET /api/status', () => {
  it('returns status OK', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

// ─── POST /api/validate-document ─────────────────────────────────────────────

describe('POST /api/validate-document', () => {

  it('returns 400 if no file is sent', async () => {
    const res = await request(app).post('/api/validate-document');
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('file_1_required');
  });

  it('valid image passes all validations', async () => {
    const res = await request(app)
      .post('/api/validate-document')
      .attach('file_1', fixture('valid.jpg'));

    expect(res.status).toBe(200);
    expect(res.body.file_1.valid).toBe(true);
    expect(res.body.file_1.errors).toHaveLength(0);
    expect(res.body.file_1.metadata.hash).toBeDefined();
    expect(res.body.file_1.metadata.width).toBeGreaterThanOrEqual(600);
  });

  it('small image triggers file_too_small', async () => {
    const res = await request(app)
      .post('/api/validate-document')
      .attach('file_1', fixture('small.jpg'));

    expect(res.status).toBe(200);
    expect(res.body.file_1.valid).toBe(false);
    expect(res.body.file_1.errors).toContain('file_too_small');
  });

  it('low resolution image triggers resolution_too_low', async () => {
    const res = await request(app)
      .post('/api/validate-document')
      .attach('file_1', fixture('low_res.jpg'));

    expect(res.status).toBe(200);
    expect(res.body.file_1.errors).toContain('resolution_too_low');
  });

  it('blank image triggers blank_or_black_image or file_too_small', async () => {
    const res = await request(app)
      .post('/api/validate-document')
      .attach('file_1', fixture('blank.jpg'));

    expect(res.status).toBe(200);
    expect(res.body.file_1.valid).toBe(false);
    const errors = res.body.file_1.errors;
    expect(
      errors.includes('blank_or_black_image') || errors.includes('file_too_small')
    ).toBe(true);
  });

  it('corrupted image triggers corrupted_file', async () => {
    const res = await request(app)
      .post('/api/validate-document')
      .attach('file_1', fixture('corrupted.jpg'));

    expect(res.status).toBe(200);
    expect(res.body.file_1.errors).toContain('corrupted_file');
  });

  it('fake pdf triggers fake_pdf', async () => {
    const res = await request(app)
      .post('/api/validate-document')
      .attach('file_1', fixture('fake.pdf'));

    expect(res.status).toBe(200);
    expect(res.body.file_1.errors).toContain('fake_pdf');
  });

  it('returns file_2 result when two files are sent', async () => {
    const res = await request(app)
      .post('/api/validate-document')
      .attach('file_1', fixture('valid.jpg'))
      .attach('file_2', fixture('low_res.jpg'));

    expect(res.status).toBe(200);
    expect(res.body.file_1).toBeDefined();
    expect(res.body.file_2).toBeDefined();
    expect(res.body.file_2.errors).toContain('resolution_too_low');
  });

});

// ─── GET /api/admin/logs ──────────────────────────────────────────────────────

describe('GET /api/admin/logs', () => {

  it('returns 401 without api key', async () => {
    const res = await request(app).get('/api/admin/logs');
    expect(res.status).toBe(401);
    expect(res.body.errors).toContain('unauthorized');
  });

  it('returns 401 with wrong api key', async () => {
    const res = await request(app)
      .get('/api/admin/logs')
      .set('x-api-key', 'wrongkey');
    expect(res.status).toBe(401);
  });

  it('returns logs with correct api key', async () => {
    const res = await request(app)
      .get('/api/admin/logs')
      .set('x-api-key', process.env.ADMIN_API_KEY || 'changeme');
    expect(res.status).toBe(200);
    expect(res.body.logs).toBeDefined();
  });

});
