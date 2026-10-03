/**
 * Process a text template with variables like {{username}}, {{link}}, {{product_name}}, {{post_url}}
 * @param {string} template - Raw template string
 * @param {Record<string, string>} variables - Map of variable key-values
 * @returns {string} Interpolated text
 */
export const processTemplate = (template = '', variables = {}) => {
  if (!template) return '';
  
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    const normalizedKey = key.toLowerCase();
    
    // Find matching key case-insensitively
    const actualKey = Object.keys(variables).find(
      (k) => k.toLowerCase() === normalizedKey
    );
    
    if (actualKey && variables[actualKey] !== undefined && variables[actualKey] !== null) {
      return String(variables[actualKey]);
    }
    
    // Default fallback placeholders
    if (normalizedKey === 'username') return '@user';
    if (normalizedKey === 'link') return variables.link || '';
    if (normalizedKey === 'product_name') return 'our product';
    if (normalizedKey === 'post_url') return '';
    
    return match; // Return unchanged if key is unrecognized
  });
};
