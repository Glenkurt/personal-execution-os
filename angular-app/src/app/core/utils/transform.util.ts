/**
 * Transform object keys from snake_case to camelCase recursively.
 * Used to convert API responses to Angular property naming conventions.
 */
export function transformSnakeToCamelCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformSnakeToCamelCase(item));
  }

  if (obj instanceof Date || obj instanceof RegExp) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const transformed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    transformed[camelKey] = transformSnakeToCamelCase(value);
  }

  return transformed;
}

/**
 * Convert a single snake_case string to camelCase.
 * Example: 'first_name' -> 'firstName'
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}
