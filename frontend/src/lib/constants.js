export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  MOVIES: '/peliculas',
  CINEMAS: '/salas',
  SESSIONS: '/sesiones',
  CHAT: '/chat',
};

export const SCREEN_TYPES = ['2D', '3D', 'IMAX', '4DX'];

export const GENRES = [
  'Acción',
  'Aventura',
  'Ciencia ficción',
  'Comedia',
  'Drama',
  'Fantasía',
  'Terror',
  'Animación',
];

export const SEAT_TYPES = {
  NORMAL: 'NORMAL',
  VIP: 'VIP',
  DISABLED: 'DISABLED',
};

export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.MOVIES, label: 'Películas', icon: 'Film' },
  { path: ROUTES.CINEMAS, label: 'Salas', icon: 'Building2' },
  { path: ROUTES.SESSIONS, label: 'Sesiones', icon: 'CalendarDays' },
  { path: ROUTES.CHAT, label: 'Chat', icon: 'MessageSquare' },
];
