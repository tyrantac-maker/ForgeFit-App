const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const fetchWithAuth = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
};

export const getStats = async (token: string) => {
  return fetchWithAuth('/api/stats/overview', token);
};

export const getWeeklyStats = async (token: string) => {
  return fetchWithAuth('/api/stats/weekly', token);
};

export const getPersonalBests = async (token: string) => {
  return fetchWithAuth('/api/personal-bests/top', token);
};

export const getSessions = async (token: string, limit = 20) => {
  return fetchWithAuth(`/api/sessions?limit=${limit}`, token);
};

export const saveEquipment = async (token: string, equipment: any[]) => {
  return fetchWithAuth('/api/equipment', token, {
    method: 'POST',
    body: JSON.stringify(equipment),
  });
};
