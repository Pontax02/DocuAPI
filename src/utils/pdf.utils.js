// pdf.utils.js — PDF validation utilities
// Validates PDF files without any external service.
// Uses 'pdf-parse-fork' to extract metadata from the binary.

import fs from 'fs';
import pdfParse from 'pdf-parse-fork';

// validatePdf — runs all PDF-specific checks and returns errors + metadata.
// Parameter: filePath — absolute path to the PDF saved by Multer
export const validatePdf = async (filePath) => {
  const errors = [];

  const buffer = fs.readFileSync(filePath);

  // --- Magic bytes check ---
  // Real PDF files always start with the 5-byte signature '%PDF-'.
  // If this is missing, the file has a .pdf extension but is not actually a PDF.
  if (!buffer.slice(0, 5).toString().startsWith('%PDF-')) {
    errors.push('fake_pdf');
    return { errors, metadata: null }; // No point parsing further
  }

  // --- Parse PDF structure ---
  // pdf-parse-fork reads the binary and extracts page count, version, text, etc.
  let data;
  try {
    data = await pdfParse(buffer);
  } catch {
    // If parsing throws, the file is corrupted or malformed
    return { errors: ['corrupted_file'], metadata: null };
  }

  // --- Page count check ---
  // A valid document must contain at least one page
  if (!data.numpages || data.numpages < 1) {
    errors.push('pdf_no_pages');
  }

  return {
    errors,
    metadata: {
      pages: data.numpages,                         // Total number of pages
      pdfVersion: data.info?.PDFFormatVersion ?? null, // e.g. '1.7' (null if not found)
    },
  };
};
