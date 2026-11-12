export const FACULTY_PREFIX = "Faculty of";
export const DEPARTMENT_PREFIX = "Department of";

function normalizeSpaces(value: string) {
  return value?.trim().replace(/\s+/g, " ");
}

function ensurePrefix(value: string, prefix: string) {
  const normalizedValue = normalizeSpaces(value);

  if (!normalizedValue) {
    return normalizedValue;
  }

  const prefixPattern = new RegExp(`^${prefix}\\s+`, "i");
  const nameWithoutPrefix = normalizedValue?.replace(prefixPattern, "")?.trim();

  return `${prefix} ${nameWithoutPrefix}`;
}

export function formatFacultyName(name: string) {
  return ensurePrefix(name, FACULTY_PREFIX);
}

export function formatDepartmentName(name: string) {
  return ensurePrefix(name, DEPARTMENT_PREFIX);
}
