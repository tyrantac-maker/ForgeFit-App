const HARDCODED_BACKEND = 'https://e83b2e91-fba9-47b3-9274-d58a092b36b1-00-2b1jg0mjp8yxk.riker.replit.dev:5000';

const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL || '';

function resolveBackendUrl(env: string): string {
  if (!env) return HARDCODED_BACKEND;
  const url = env.replace(/\/$/, '');
  if (url.includes('riker.replit.dev') && !url.includes(':5000')) {
    return url + ':5000';
  }
  return url;
}

export const BACKEND_URL = resolveBackendUrl(envUrl);
