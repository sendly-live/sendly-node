/**
 * Response transformation utilities
 * Converts API snake_case responses to SDK camelCase types
 * @packageDocumentation
 */

/**
 * Convert snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Transform object keys from snake_case to camelCase
 */
export function transformKeys<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item)) as T;
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = transformKeys(value);
    }
    return result as T;
  }

  return obj as T;
}

/**
 * Transform webhook API response to SDK Webhook type
 */
export function transformWebhook<T>(apiResponse: unknown): T {
  return transformKeys<T>(apiResponse);
}

/**
 * Transform webhook delivery API response to SDK WebhookDelivery type
 */
export function transformWebhookDelivery<T>(apiResponse: unknown): T {
  return transformKeys<T>(apiResponse);
}
