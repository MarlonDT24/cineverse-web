import axios from 'axios';

// --- Mapeo de campos snake_case <-> camelCase ---

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function mapKeys(obj, mapper) {
  if (Array.isArray(obj)) return obj.map((item) => mapKeys(item, mapper));
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [mapper(key), mapKeys(value, mapper)])
    );
  }
  return obj;
}

/** Transforma camelCase (backend) → snake_case (frontend) */
export function toSnakeCase(data) {
  return mapKeys(data, camelToSnake);
}

/** Transforma snake_case (frontend) → camelCase (backend) */
export function toCamelCase(data) {
  return mapKeys(data, snakeToCamel);
}

// --- Instancia Axios ---

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: adjunta token JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cineverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: transforma body de request snake_case → camelCase
api.interceptors.request.use((config) => {
  if (config.data) {
    config.data = toCamelCase(config.data);
  }
  return config;
});

// Interceptor: transforma response camelCase → snake_case + maneja 401
api.interceptors.response.use(
  (response) => {
    response.data = toSnakeCase(response.data);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('cineverse_token');
      localStorage.removeItem('cineverse_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
