function normalize(text) {
  return String(text || '')
    .replace(/\r/g, '\n')
    .replace(/[\t]+/g, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

function extractField(text, labels) {
  for (const label of labels) {
    const regex = new RegExp(`${label}\s*[:\-]?\s*([^\n]+)`, 'i');
    const match = text.match(regex);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function detectPhone(text) {
  const match = text.match(/(?:\+91[\s-]?)?((?:\d[\s-]?){10})/);
  return match ? match[1].replace(/\D/g, '').slice(-10) : '';
}

function detectPincode(text) {
  const match = text.match(/\b\d{6}\b/);
  return match ? match[0] : '';
}

function detectAmount(text) {
  const match = text.match(/amount\s*[:\-]?\s*(\d+(?:\.\d{1,2})?)/i) || text.match(/\b(\d+(?:\.\d{1,2})?)\b(?!.*\d)/);
  return match ? Number(match[1]) : 0;
}

function cleanAddress(text) {
  return text
    .replace(/name\s*[:\-]?.*/gi, '')
    .replace(/address\s*[:\-]?/gi, '')
    .replace(/pincode\s*[:\-]?/gi, '')
    .replace(/ph\s*no\s*[:\-]?/gi, '')
    .replace(/phone\s*[:\-]?/gi, '')
    .replace(/amount\s*[:\-]?/gi, '')
    .replace(/\b\d{10}\b/g, '')
    .replace(/\b\d{6}\b/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .split('\n')
    .map((line) => line.trim().replace(/^[:\-]+/, '').trim())
    .filter(Boolean)
    .join(', ')
    .replace(/,\s*,/g, ', ')
    .replace(/\s+,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseAddressInput(rawInput) {
  const normalized = normalize(rawInput);
  const name = extractField(normalized, ['name']) || normalized.split('\n')[0]?.trim() || '';
  const phone = extractField(normalized, ['ph no', 'phone', 'mobile']) || detectPhone(normalized);
  const pincode = extractField(normalized, ['pincode', 'pin code']) || detectPincode(normalized);
  const amount = detectAmount(normalized);
  const address = cleanAddress(normalized)
    .replace(new RegExp(name, 'i'), '')
    .replace(phone, '')
    .replace(pincode, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^,|,$/g, '')
    .trim();

  return {
    name: name.replace(/name\s*[:\-]?/i, '').trim(),
    address,
    pincode,
    phone,
    amount,
    raw: normalized,
  };
}

function getCategory(amount) {
  if (amount <= 499) return 'A';
  if (amount <= 799) return 'B';
  if (amount <= 999) return 'C';
  if (amount <= 1499) return 'D';
  return 'E';
}

module.exports = { parseAddressInput, getCategory };