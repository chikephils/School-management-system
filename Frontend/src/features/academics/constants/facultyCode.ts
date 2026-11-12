export const FACULTY_CODE_PREFIX = "F";

function normalizeCode(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

function ensureCodePrefix(value: string, prefix: string) {
  const normalizedValue = normalizeCode(value);

  if (!normalizedValue) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith(prefix)) {
    return normalizedValue;
  }

  return `${prefix}${normalizedValue}`;
}

export function formatFacultyCode(code: string) {
  return ensureCodePrefix(code, FACULTY_CODE_PREFIX);
}
