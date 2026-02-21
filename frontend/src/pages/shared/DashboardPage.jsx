import {
  Film, Building2, CalendarDays, Ticket, MessageSquare, Clock,
  Star, Tag, Glasses, Monitor, Sparkles, Plus, ArrowUpRight,
  Activity, Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMovies } from '../../hooks/useMovies';
import { useCinemas } from '../../hooks/useCinemas';
import { useSessions } from '../../hooks/useSessions';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDuration, calculateEndTime } from '../../lib/formatters';
import StatCard from '../../components/ui/StatCard';
import GlassCard from '../../components/ui/GlassCard';
import MoviePoster from '../../components/ui/MoviePoster';

const screenIcons = { '2D': Film, '3D': Glasses, IMAX: Monitor, '4DX': Sparkles };
const screenTypeColors = { '2D': '#45b7d1', '3D': '#66bb6a', IMAX: '#ff7043', '4DX': '#ab47bc' };

function formatSessionDate(datetimeStr) {
  const date = new Date(datetimeStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Hoy a las ${time}`;
  if (isTomorrow) return `Mañana a las ${time}`;
  return `${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} a las ${time}`;
}

function formatChatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return `Hoy ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diff < 172800000) return 'Ayer';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function getOccupancyStatus(pct) {
  if (pct >= 95) return { label: 'Llena', color: '#f44336' };
  if (pct >= 70) return { label: 'Casi llena', color: '#ff9800' };
  return { label: 'Abierta', color: '#4caf50' };
}

/* ─── Skeleton components ─── */
function SkeletonCard() {
  return (
    <div className="bg-surface backdrop-blur-md rounded-2xl border border-border p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-surface-hover" />
        <div className="w-16 h-6 rounded-lg bg-surface-hover" />
      </div>
      <div className="w-12 h-8 rounded bg-surface-hover mb-1.5" />
      <div className="w-24 h-4 rounded bg-surface-hover mb-2" />
      <div className="w-32 h-3 rounded bg-surface-hover" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-surface-hover shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 rounded bg-surface-hover w-3/4" />
        <div className="h-3 rounded bg-surface-hover w-1/2" />
      </div>
      <div className="w-14 h-5 rounded-full bg-surface-hover" />
    </div>
  );
}

/* ─── Dashboard del cliente ─── */
function ClientDashboard({ user, movies, cinemas, sessions }) {
  const featuredMovies = [...movies]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);

  const upcomingSessions = sessions
    .sort((a, b) => new Date(a.session_datetime) - new Date(b.session_datetime))
    .slice(0, 6)
    .map((s) => {
      const movie = movies.find((m) => m.id === s.movie_id);
      const cinema = cinemas.find((c) => c.id === s.cinema_id);
      const dateStr = s.session_datetime.split('T')[0];
      const timeStr = s.session_datetime.split('T')[1]?.slice(0, 5);
      const end = movie ? calculateEndTime(dateStr, timeStr, movie.duration_minutes) : '';
      return { ...s, movie, cinema, dateStr, timeStr, end };
    });

  const screenTypes = [...new Set(cinemas.map((c) => c.screen_type))];
  const cinemasByType = screenTypes.map((type) => ({
    type,
    count: cinemas.filter((c) => c.screen_type === type).length,
    totalSeats: cinemas.filter((c) => c.screen_type === type).reduce((sum, c) => sum + c.total_seats, 0),
  }));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          Hola, {user?.firstName || user?.name}
        </h1>
        <p className="text-text-muted text-sm m-0">
          Descubre las peliculas en cartelera y las sesiones disponibles.
        </p>
      </div>

      {/* Películas destacadas */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Film size={20} className="text-[#ff6b6b]" />
          <h2 className="text-lg font-semibold m-0">En Cartelera</h2>
          <span className="text-xs text-text-muted ml-1">({movies.length} peliculas)</span>
        </div>
        {featuredMovies.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Film size={36} className="mx-auto mb-2 text-text-muted opacity-40" />
            <p className="text-sm text-text-muted m-0">No hay peliculas en cartelera.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {featuredMovies.map((movie) => (
              <GlassCard key={movie.id} hover className="overflow-hidden">
                <MoviePoster src={movie.poster_url} alt={movie.title} />
                <div className="p-4">
                  <h3 className="m-0 text-sm font-semibold mb-1">{movie.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-full text-[11px] text-text-secondary">
                      <Clock size={10} /> {formatDuration(movie.duration_minutes)}
                    </span>
                    {movie.genre && (
                      <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-full text-[11px] text-text-secondary">
                        <Tag size={10} /> {movie.genre}
                      </span>
                    )}
                    {movie.rating > 0 && (
                      <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-full text-[11px] text-text-secondary">
                        <Star size={10} /> {movie.rating}/10
                      </span>
                    )}
                  </div>
                  {movie.description && (
                    <p className="text-xs text-text-muted line-clamp-2 m-0">{movie.description}</p>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Próximas sesiones */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Ticket size={20} className="text-[#45b7d1]" />
          <h2 className="text-lg font-semibold m-0">Proximas Sesiones</h2>
        </div>
        {upcomingSessions.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <CalendarDays size={36} className="mx-auto mb-2 text-text-muted opacity-40" />
            <p className="text-sm text-text-muted m-0">No hay sesiones disponibles.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingSessions.map((s) => (
              <GlassCard key={s.id} hover className="p-4">
                <p className="text-primary font-semibold text-sm m-0 mb-1">
                  {s.movie?.title || 'Pelicula'}
                </p>
                <p className="text-[11px] text-text-muted m-0 mb-2">
                  {s.cinema?.name || 'Sala'}
                  {s.cinema?.screen_type && (
                    <span className="ml-1 px-1.5 py-0.5 bg-surface rounded text-[10px]">
                      {s.cinema.screen_type}
                    </span>
                  )}
                </p>
                <div className="flex justify-between items-center bg-surface p-2.5 rounded-lg mb-2 text-xs">
                  <span>
                    <CalendarDays size={11} className="inline mr-1 text-text-muted" />
                    {formatSessionDate(s.session_datetime)}
                  </span>
                  <span className="font-semibold text-gold">
                    {s.timeStr} — {s.end}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-text-secondary">
                  <span>Normal: {formatCurrency(s.price_normal)}</span>
                  <span>VIP: {formatCurrency(s.price_vip)}</span>
                  <span className="text-primary font-medium">{s.available_seats} plazas</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Nuestras Salas */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-[#4ecdc4]" />
          <h2 className="text-lg font-semibold m-0">Nuestras Salas</h2>
        </div>
        {cinemasByType.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Building2 size={36} className="mx-auto mb-2 text-text-muted opacity-40" />
            <p className="text-sm text-text-muted m-0">No hay salas disponibles.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cinemasByType.map(({ type, count, totalSeats }) => {
              const ScreenIcon = screenIcons[type] || Film;
              return (
                <GlassCard key={type} hover className="p-5 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#4ecdc4]/15 flex items-center justify-center mx-auto mb-3">
                    <ScreenIcon size={24} className="text-[#4ecdc4]" />
                  </div>
                  <h3 className="text-base font-bold m-0 mb-1">{type}</h3>
                  <p className="text-xs text-text-muted m-0">
                    {count} {count === 1 ? 'sala' : 'salas'} &middot; {totalSeats} asientos
                  </p>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Panel de actividad ─── */
function ActivityFeed({ sessions, conversations }) {
  const now = new Date();

  const entries = [];

  // Sesiones que ocurren hoy
  const allSessions = sessions; // already upcoming, enriched
  allSessions.forEach((s) => {
    const dt = new Date(s.session_datetime);
    const isToday = dt.toDateString() === now.toDateString();
    const isNow = dt <= now && now <= new Date(dt.getTime() + 3 * 60 * 60 * 1000);
    if (isNow) {
      entries.push({
        icon: Zap,
        color: '#f9ca24',
        title: `En curso: ${s.movieTitle}`,
        subtitle: `${s.cinemaName}${s.screenType ? ` · ${s.screenType}` : ''}`,
        time: formatSessionDate(s.session_datetime),
        priority: 0,
      });
    } else if (isToday) {
      entries.push({
        icon: CalendarDays,
        color: '#45b7d1',
        title: `Sesión programada: ${s.movieTitle}`,
        subtitle: `${s.cinemaName}${s.screenType ? ` · ${s.screenType}` : ''}`,
        time: formatSessionDate(s.session_datetime),
        priority: 1,
      });
    }
  });

  // Chats con mensajes sin leer
  conversations
    .filter((c) => c.unread > 0)
    .forEach((c) => {
      entries.push({
        icon: MessageSquare,
        color: '#be1919',
        title: `Mensaje sin leer de ${c.user}`,
        subtitle: c.lastMessage || 'Sin vista previa',
        time: formatChatDate(c.createdAt),
        priority: 0,
      });
    });

  // Chats abiertos sin unread
  conversations
    .filter((c) => c.conversationStatus === 'OPEN' && !c.unread)
    .slice(0, 2)
    .forEach((c) => {
      entries.push({
        icon: MessageSquare,
        color: '#f9ca24',
        title: `Chat abierto con ${c.user}`,
        subtitle: c.lastMessage || 'Sin mensajes recientes',
        time: formatChatDate(c.createdAt),
        priority: 2,
      });
    });

  entries.sort((a, b) => a.priority - b.priority);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <Activity size={32} className="text-text-muted mb-2 opacity-40" />
        <p className="text-sm text-text-muted m-0">Sin actividad destacada hoy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {entries.map((entry, i) => {
        const Icon = entry.icon;
        return (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface/50 transition-colors">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: `${entry.color}18`, color: entry.color }}
            >
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium m-0 truncate">{entry.title}</p>
              <p className="text-[11px] text-text-muted m-0 truncate">{entry.subtitle}</p>
            </div>
            <span className="text-[11px] text-text-muted shrink-0 mt-0.5">{entry.time}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Dashboard de admin/empleado ─── */
function StaffDashboard({ user, movies, cinemas, sessions, conversations, totalUnread, loading }) {
  const today = new Date();
  const greeting = getGreeting();
  const dateLabel = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateCapitalized = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  const todaySessions = sessions.filter(
    (s) => new Date(s.session_datetime).toDateString() === today.toDateString()
  ).length;

  const activeCinemasToday = new Set(
    sessions
      .filter((s) => new Date(s.session_datetime).toDateString() === today.toDateString())
      .map((s) => s.cinema_id)
  ).size;

  const openChats = conversations.filter((c) => c.conversationStatus === 'OPEN').length;

  const stats = [
    {
      icon: Film,
      title: 'Películas',
      value: movies.length,
      color: '#ff6b6b',
      to: '/peliculas',
      sublabel: `${sessions.length} sesiones registradas`,
    },
    {
      icon: Building2,
      title: 'Salas',
      value: cinemas.length,
      color: '#4ecdc4',
      to: '/salas',
      sublabel: `${activeCinemasToday} activas hoy`,
    },
    {
      icon: CalendarDays,
      title: 'Sesiones',
      value: sessions.length,
      color: '#45b7d1',
      to: '/sesiones',
      trend: todaySessions,
      sublabel: 'programadas hoy',
    },
    {
      icon: MessageSquare,
      title: 'Chats abiertos',
      value: openChats,
      color: '#f9ca24',
      to: '/chat',
      sublabel: totalUnread > 0 ? `${totalUnread} sin leer` : 'Sin mensajes pendientes',
    },
  ];

  const upcomingSessions = sessions
    .filter((s) => new Date(s.session_datetime) > new Date())
    .sort((a, b) => new Date(a.session_datetime) - new Date(b.session_datetime))
    .slice(0, 6)
    .map((s) => {
      const movie = movies.find((m) => m.id === s.movie_id);
      const cinema = cinemas.find((c) => c.id === s.cinema_id);
      const totalSeats = cinema?.total_seats || 0;
      const occupancy = totalSeats > 0
        ? Math.round(((totalSeats - s.available_seats) / totalSeats) * 100)
        : 0;
      return {
        ...s,
        movieTitle: movie?.title || 'Película',
        cinemaName: cinema?.name || 'Sala',
        screenType: cinema?.screen_type,
        totalSeats,
        occupancy,
      };
    });

  const recentChats = [...conversations]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  const quickActions = [
    { label: 'Nueva Sesión', icon: Plus, to: '/sesiones', color: '#45b7d1' },
    { label: 'Añadir Película', icon: Plus, to: '/peliculas', color: '#ff6b6b' },
    { label: 'Ver Chats', icon: ArrowUpRight, to: '/chat', color: '#f9ca24', badge: totalUnread },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto" style={{ animation: 'fadeIn 0.3s ease forwards' }}>

      {/* ─── Header ─── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs text-text-muted m-0 mb-1 uppercase tracking-wider">{dateCapitalized}</p>
            <h1 className="text-2xl font-bold m-0">
              {greeting}, {user?.firstName || user?.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {todaySessions > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ color: '#45b7d1', backgroundColor: 'rgba(69,183,209,0.12)' }}>
                  <CalendarDays size={12} />
                  {todaySessions} sesión{todaySessions !== 1 ? 'es' : ''} hoy
                </span>
              )}
              {totalUnread > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ color: '#f9ca24', backgroundColor: 'rgba(249,202,36,0.12)' }}>
                  <MessageSquare size={12} />
                  {totalUnread} sin leer
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {quickActions.map(({ label, icon: Icon, to, color, badge }) => (
              <Link
                key={to}
                to={to}
                className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 no-underline"
                style={{
                  color,
                  backgroundColor: `${color}18`,
                  border: `1px solid ${color}30`,
                }}
              >
                <Icon size={14} />
                {label}
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-coral text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-border" />
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat) => <StatCard key={stat.title} {...stat} />)
        }
      </div>

      {/* ─── Tabla de Sesiones (full width) ─── */}
      <GlassCard className="mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-[#45b7d1]" />
            <h2 className="text-base font-semibold m-0">Próximas Sesiones</h2>
          </div>
          <Link
            to="/sesiones"
            className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-[#45b7d1] transition-colors no-underline"
          >
            Gestionar <ArrowUpRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : upcomingSessions.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Clock size={32} className="text-text-muted mb-2 opacity-40" />
            <p className="text-sm text-text-muted m-0">No hay sesiones programadas.</p>
          </div>
        ) : (
          <>
            {/* Table header — desktop only */}
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_80px_1.5fr_1fr_90px] gap-4 px-6 py-2.5 text-[11px] uppercase tracking-wider text-text-muted border-b border-border/50">
              <span>Película</span>
              <span>Sala</span>
              <span>Tipo</span>
              <span>Horario</span>
              <span>Ocupación</span>
              <span className="text-right">Estado</span>
            </div>

            <div className="divide-y divide-border/30">
              {upcomingSessions.map((s) => {
                const status = getOccupancyStatus(s.occupancy);
                const typeColor = screenTypeColors[s.screenType] || '#45b7d1';
                return (
                  <div
                    key={s.id}
                    className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_80px_1.5fr_1fr_90px] gap-2 md:gap-4 items-center px-6 py-3.5 hover:bg-surface/50 transition-colors"
                  >
                    {/* Película */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${typeColor}18`, color: typeColor }}
                      >
                        <Film size={13} />
                      </div>
                      <span className="text-sm font-medium truncate">{s.movieTitle}</span>
                    </div>

                    {/* Sala */}
                    <span className="text-sm text-text-secondary truncate">{s.cinemaName}</span>

                    {/* Tipo */}
                    {s.screenType ? (
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-md font-semibold w-fit"
                        style={{ color: typeColor, backgroundColor: `${typeColor}18` }}
                      >
                        {s.screenType}
                      </span>
                    ) : (
                      <span />
                    )}

                    {/* Horario */}
                    <span className="text-[12px] text-text-secondary">{formatSessionDate(s.session_datetime)}</span>

                    {/* Ocupación */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-active overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${s.occupancy}%`, backgroundColor: status.color }}
                        />
                      </div>
                      <span className="text-[11px] text-text-muted shrink-0 w-12 text-right">
                        {s.available_seats} lib.
                      </span>
                    </div>

                    {/* Estado */}
                    <div className="md:text-right">
                      <span
                        className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                        style={{ color: status.color, backgroundColor: `${status.color}18` }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </GlassCard>

      {/* ─── Fila inferior: Actividad + Chat ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">

        {/* Panel de Actividad */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-primary" />
            <h2 className="text-base font-semibold m-0">Actividad</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : (
            <ActivityFeed sessions={upcomingSessions} conversations={recentChats} />
          )}
        </GlassCard>

        {/* Chat Reciente */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-[#f9ca24]" />
              <h2 className="text-base font-semibold m-0">Chat Reciente</h2>
              {totalUnread > 0 && (
                <span className="bg-coral text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {totalUnread} sin leer
                </span>
              )}
            </div>
            <Link
              to="/chat"
              className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-[#f9ca24] transition-colors no-underline"
            >
              Ver todos <ArrowUpRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : recentChats.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <MessageSquare size={32} className="text-text-muted mb-2 opacity-40" />
              <p className="text-sm text-text-muted m-0">No hay conversaciones recientes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentChats.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    c.unread > 0 ? 'bg-coral/15' : 'bg-[#f9ca24]/15'
                  }`}>
                    <MessageSquare size={18} className={c.unread > 0 ? 'text-coral' : 'text-[#f9ca24]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate m-0">{c.user}</p>
                      {c.unread > 0 && (
                        <span className="bg-coral text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted m-0">
                      {c.lastMessage || 'Sin mensajes'} · {formatChatDate(c.createdAt)}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    c.conversationStatus === 'OPEN'
                      ? 'bg-success/15 text-success'
                      : 'bg-text-muted/15 text-text-muted'
                  }`}>
                    {c.conversationStatus === 'OPEN' ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { movies, loading: moviesLoading } = useMovies();
  const { cinemas } = useCinemas();
  const { sessions, loading: sessionsLoading } = useSessions();
  const { conversations, totalUnread } = useChat();

  const isLoading = moviesLoading || sessionsLoading;

  if (user?.role === 'client') {
    return <ClientDashboard user={user} movies={movies} cinemas={cinemas} sessions={sessions} />;
  }

  return (
    <StaffDashboard
      user={user}
      movies={movies}
      cinemas={cinemas}
      sessions={sessions}
      conversations={conversations}
      totalUnread={totalUnread}
      loading={isLoading}
    />
  );
}
