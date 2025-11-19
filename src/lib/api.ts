const RAW_BASE = (import.meta.env.VITE_API_URL ?? '').trim();

const RAW_PREFIX = (import.meta.env.VITE_API_PREFIX ?? '/api').trim();

export const API_URL = RAW_BASE.replace(/\/+$/, ''); 
export const API_PREFIX = RAW_PREFIX.startsWith('/') ? RAW_PREFIX : `/${RAW_PREFIX}`; 

export const api = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${API_PREFIX}${cleanPath}`;
};

export const apiPublic = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
}
