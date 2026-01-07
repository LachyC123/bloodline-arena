/**
 * Asset URL helper for GitHub Pages compatibility
 * Resolves asset paths relative to the Vite base URL
 */

/**
 * Get the full URL for a public asset
 * @param path - Asset path relative to public folder (e.g., "assets/ui/panel.svg")
 * @returns Full URL that works in dev and on GitHub Pages
 */
export function assetUrl(path: string): string {
  // Remove leading slashes to prevent double-slashes
  const cleanPath = path.replace(/^\/+/, '');
  // import.meta.env.BASE_URL is set by Vite based on the `base` config
  const base = import.meta.env.BASE_URL || './';
  return `${base}${cleanPath}`;
}

/**
 * Batch helper for multiple assets
 */
export function assetUrls(paths: string[]): string[] {
  return paths.map(assetUrl);
}
