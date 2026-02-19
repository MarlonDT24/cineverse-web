import {
  Film, Building2, CalendarDays, Ticket, MessageSquare, Clock,
  Star, Tag, Glasses, Monitor, Sparkles,
} from 'lucide-react';
import { useMovies } from '../hooks/useMovies';
import { useCinemas } from '../hooks/useCinemas';
import { useSessions } from '../hooks/useSessions';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDuration, calculateEndTime } from '../lib/formatters';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';

const screenIcons = { '2D': Film, '3D': Glasses, IMAX: Monitor, '4DX': Sparkles };

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
              <GlassCard key={movie.id} hover className="p-4">
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

/* ─── Dashboard de admin/empleado ─── */
function StaffDashboard({ user, movies, cinemas, sessions, conversations, totalUnread }) {
  const stats = [
    { icon: Film, title: 'Películas', value: movies.length, color: '#ff6b6b' },
    { icon: Building2, title: 'Salas', value: cinemas.length, color: '#4ecdc4' },
    { icon: CalendarDays, title: 'Sesiones', value: sessions.length, color: '#45b7d1' },
    { icon: MessageSquare, title: 'Chats activos', value: conversations.filter((c) => c.conversationStatus === 'OPEN').length, color: '#f9ca24' },
  ];

  const upcomingSessions = sessions
    .filter((s) => new Date(s.session_datetime) > new Date())
    .sort((a, b) => new Date(a.session_datetime) - new Date(b.session_datetime))
    .slice(0, 4)
    .map((s) => {
      const movie = movies.find((m) => m.id === s.movie_id);
      const cinema = cinemas.find((c) => c.id === s.cinema_id);
      return { ...s, movieTitle: movie?.title || 'Película', cinemaName: cinema?.name || 'Sala' };
    });

  const recentChats = [...conversations]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-text-muted text-sm m-0">
          Bienvenido, {user?.firstName || user?.name}. Resumen general del sistema.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-[#45b7d1]" />
            <h2 className="text-lg font-semibold m-0">Próximas Sesiones</h2>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Clock size={32} className="text-text-muted mb-2 opacity-40" />
              <p className="text-sm text-text-muted m-0">No hay sesiones programadas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#45b7d1]/15 flex items-center justify-center shrink-0">
                    <Film size={18} className="text-[#45b7d1]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate m-0">{s.movieTitle}</p>
                    <p className="text-[11px] text-text-muted m-0">
                      {s.cinemaName} &middot; {formatSessionDate(s.session_datetime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-[#f9ca24]" />
            <h2 className="text-lg font-semibold m-0">Chat Reciente</h2>
            {totalUnread > 0 && (
              <span className="bg-coral text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {totalUnread} sin leer
              </span>
            )}
          </div>
          {recentChats.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <MessageSquare size={32} className="text-text-muted mb-2 opacity-40" />
              <p className="text-sm text-text-muted m-0">No hay conversaciones recientes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentChats.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    c.unread > 0 ? 'bg-coral/15' : 'bg-[#f9ca24]/15'
                  }`}>
                    <MessageSquare size={18} className={c.unread > 0 ? 'text-coral' : 'text-[#f9ca24]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate m-0">{c.user}</p>
                      {c.unread > 0 && (
                        <span className="bg-coral text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted m-0">
                      {c.lastMessage || 'Sin mensajes'} &middot; {formatChatDate(c.createdAt)}
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
  const { movies } = useMovies();
  const { cinemas } = useCinemas();
  const { sessions } = useSessions();
  const { conversations, totalUnread } = useChat();

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
    />
  );
}
