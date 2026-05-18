const DNI_KEYWORDS = ['DOCUMENTO NACIONAL', 'REINO DE ESPA', 'NATIONAL IDENTITY CARD'];

const NAME_BLOCKLIST = new Set([
  'REINO', 'ESPANA', 'ESPAÑA', 'DOCUMENTO', 'NACIONAL', 'IDENTIDAD',
  'IDENTIDADE', 'IDENTITAT', 'CARD', 'NATIONAL', 'IDENTITY',
]);

export const isDni = (text) => {
  const upper = text.toUpperCase();
  return DNI_KEYWORDS.some((keyword) => upper.includes(keyword));
};

export const parseDniFields = (text) => {
  const upper = text.toUpperCase();

  const genderMatch = upper.match(/\b([MF])\s+ESP\b/);
  const gender = genderMatch ? genderMatch[1] : null;

  const dateMatch = upper.match(/ESP\s+(\d{2})\s+(\d{2})\s+(\d{4})/);
  const birthDate = dateMatch
    ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`
    : null;

  const nameSection = upper.split(/SEXO/)[0] ?? upper;
  const nameWords = nameSection
    .split('\n')
    .map((line) => {
      const match = line.match(/([A-ZÁÉÍÓÚÜÑ]{4,})(?:\s*)$/);
      return match ? match[1] : null;
    })
    .filter((w) => w && !NAME_BLOCKLIST.has(w));

  const last3 = nameWords.slice(-3);
  const surname = last3.slice(0, 2).join(' ') || null;
  const name = last3[2] ?? null;

  return { name, surname, birthDate, gender };
};
