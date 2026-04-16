import fs from 'fs';
import pdfParse from 'pdf-parse-fork';

export const validatePdf = async (filePath) => {
  const errors = [];
  const buffer = fs.readFileSync(filePath);

  if (!buffer.slice(0, 5).toString().startsWith('%PDF-')) {
    errors.push('fake_pdf');
    return { errors, metadata: null };
  }

  let data;
  try {
    data = await pdfParse(buffer);
  } catch {
    return { errors: ['corrupted_file'], metadata: null };
  }

  if (!data.numpages || data.numpages < 1) {
    errors.push('pdf_no_pages');
  }

  return {
    errors,
    metadata: {
      pages: data.numpages,
      pdfVersion: data.info?.PDFFormatVersion ?? null,
    },
  };
};
