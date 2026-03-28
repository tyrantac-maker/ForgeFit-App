const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL || '';

function ensurePort(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('riker.replit.dev') && !parsed.port) {
      parsed.port = '5000';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return url;
  }
}

export const BACKEND_URL = ensurePort(envUrl);
