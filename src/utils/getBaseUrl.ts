/**
 * Get the base URL for the application
 * Uses environment variable if available, otherwise uses production URL
 */
export function getBaseUrl(): string {
  // Check for environment variable first (for local development)
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }
  
  // Production URL - deployed at https://namjukes.netlify.app
  // Note: If using a custom domain, update this URL
  return 'https://namjukes.netlify.app';
}

/**
 * Get the full bar URL for a given slug
 */
export function getBarUrl(slug: string): string {
  return `${getBaseUrl()}/bar/${slug}`;
}
