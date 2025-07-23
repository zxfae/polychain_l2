/**
 * Safe utility functions for handling backend responses without BigInt conversion errors
 * Since we use float64 throughout the system, we should not encounter BigInt values
 */

/**
 * Safely converts any numeric value to a regular JavaScript number
 * @param {any} value - The value to convert
 * @param {number} fallback - Fallback value if conversion fails
 * @returns {number} The converted number
 */
export const safeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  
  if (typeof value === 'bigint') {
    console.warn('BigInt detected - this should not happen with float64 backend:', value);
    try {
      return Number(value);
    } catch {
      return fallback;
    }
  }
  
  return fallback;
};

/**
 * Recursively converts an object, handling any potential BigInt values
 * @param {any} obj - The object to convert
 * @returns {any} The converted object
 */
export const safeConvertObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => safeConvertObject(item));
  }
  
  if (typeof obj !== 'object') {
    return safeNumber(obj, obj);
  }
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      converted[key] = value.map(item => safeConvertObject(item));
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = safeConvertObject(value);
    } else {
      converted[key] = safeNumber(value, value);
    }
  }
  return converted;
};

/**
 * Safely formats a number for display
 * @param {any} value - The value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export const safeFormat = (value, decimals = 2) => {
  const num = safeNumber(value, 0);
  return num.toFixed(decimals);
};

/**
 * Safely formats a large number with commas
 * @param {any} value - The value to format
 * @returns {string} Formatted string with commas
 */
export const safeFormatLarge = (value) => {
  const num = safeNumber(value, 0);
  return num.toLocaleString();
};