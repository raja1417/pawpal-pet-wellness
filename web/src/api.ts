const baseUrl = import.meta.env.VITE_API_URL || '/api';

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('pawpal_token');
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers
    }
  });
  if (response.status === 401 && token) {
    localStorage.removeItem('pawpal_token');
    localStorage.removeItem('pawpal_user');
    window.dispatchEvent(new Event('pawpal:logout'));
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || 'Request failed');
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
