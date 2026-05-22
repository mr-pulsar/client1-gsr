export function normalizeText(input) {
  return String(input || '')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .join('\n');
}

function extractValue(text, labels) {
  for (const label of labels) {
    const match = text.match(new RegExp(`${label}\\s*[:\-]?\\s*([^\\n]+)`, 'i'));
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

export function parseRawInput(rawInput) {
  const text = normalizeText(rawInput);
  const name = extractValue(text, ['name']) || text.split('\n')[0] || '';
  const phone = extractValue(text, ['ph no', 'phone', 'mobile']) || (text.match(/(?:\+91[\s-]?)?(\d{10})/) || [])[1] || '';
  const pincode = extractValue(text, ['pincode', 'pin code']) || (text.match(/\b\d{6}\b/) || [])[0] || '';
  const amount = Number((extractValue(text, ['amount']) || (text.match(/\b\d+(?:\.\d{1,2})?\b(?!.*\d)/) || [])[0] || 0).toString().replace(/[^\d.]/g, '')) || 0;
  const address = text
    .replace(/name\s*[:\-]?.*/gi, '')
    .replace(/address\s*[:\-]?/gi, '')
    .replace(/^\s*:\s*/gm, '')
    .replace(/pincode\s*[:\-]?/gi, '')
    .replace(/ph\s*no\s*[:\-]?/gi, '')
    .replace(/phone\s*[:\-]?/gi, '')
    .replace(/amount\s*[:\-]?/gi, '')
    // Don't globally strip all digit sequences (house numbers can be short).
    // We'll remove specific extracted phone/pincode values only below.
    .split('\n')
    .map((line) => line.replace(/\s{2,}/g, ' ').trim())
    .filter(Boolean)
    .join(', ')
    .replace(/,\s*,/g, ', ')
    .trim();

  // Remove exact phone/pincode occurrences from the address only if they were extracted above
  function escapeRegex(s) {
    return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  let cleanedAddress = address;
  if (phone) {
    cleanedAddress = cleanedAddress.replace(new RegExp(escapeRegex(phone), 'g'), '').replace(/\s{2,}/g, ' ').trim();
  }
  if (pincode) {
    cleanedAddress = cleanedAddress.replace(new RegExp(escapeRegex(pincode), 'g'), '').replace(/\s{2,}/g, ' ').trim();
  }

  return { name, address: cleanedAddress, pincode, phone, amount };
}

export function categoryFromAmount(amount) {
  if (amount <= 499) return 'A';
  if (amount <= 799) return 'B';
  if (amount <= 999) return 'C';
  if (amount <= 1499) return 'D';
  return 'E';
}
