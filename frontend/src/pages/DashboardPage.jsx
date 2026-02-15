import { Film, Building2, CalendarDays, Ticket, MessageSquare, Clock } from 'lucide-react';
import { useMovies } from '../hooks/useMovies';
import { useCinemas } from '../hooks/useCinemas';
import { useSessions } from '../hooks/useSessions';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const { movies } = useMovies();
  const { cinemas } = useCinemas();
  const { sessions } = useSessions();
  const { conversations, totalUnread } = useChat();

  const stats = [
    { icon: Film, title: 'Películas', value: movies.length, color: '#ff6b6b' },
    { icon: Building2, title: 'Salas', value: cinemas.length, color: '#4ecdc4' },
    { icon: CalendarDays, title: 'Sesiones', value: sessions.length, color: '#45b7d1' },
    { icon: MessageSquare, title: 'Chats activos', value: conversations.filter((c) => c.conversationStatus === 'OPEN').length, color: '#f9ca24' },
  ];

  // Próximas sesiones
  const upcomingSessions = sessions
    .filter((s) => new Date(s.session_datetime) > new Date())
    .sort((a, b) => new Date(a.session_datetime) - new Date(b.session_datetime))
    .slice(0, 4)
    .map((s) => {
      const movie = movies.find((m) => m.id === s.movie_id);
      const cinema = cinemas.find((c) => c.id === s.cinema_id);
      return { ...s, movieTitle: movie?.title || 'Película', cinemaName: cinema?.name || 'Sala' };
    });

  // Conversaciones recientes con actividad
  const recentChats = [...conversations]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  const hasActivity = upcomingSessions.length > 0 || recentChats.length > 0;

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
        {/* Próximas sesiones */}
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

        {/* Actividad de Chat */}
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
