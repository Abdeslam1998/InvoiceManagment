export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && (window as any).env?.API_URL) || 'http://localhost:3000/api'
};