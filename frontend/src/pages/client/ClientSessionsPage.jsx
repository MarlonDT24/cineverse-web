import { useState } from 'react';
import {
  CalendarDays, Clock, Film, Building2, Search, Ticket,
} from 'lucide-react';
import { useSessions } from '../../hooks/useSessions';
import { formatCurrency, formatDuration, calculateEndTime } from '../../lib/formatters';
import GlassCard from '../../components/ui/GlassCard';

export default function ClientSessionsPage() {
  const { sessions, movies, cinemas } = useSessions();
  const [movieFilter, setMovieFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const getMovie = (id) => movies.find((m) => m.id === id);
  const getCinema = (id) => cinemas.find((c) => c.id === id);

  const upcomingSessions = sessions
    .filter((s) => {
      const matchesMovie = !movieFilter || s.movie_id === parseInt(movieFilter, 10);
      const matchesDate = !dateFilter || s.session_datetime.startsWith(dateFilter);
      return matchesMovie && matchesDate;
    })
    .sort((a, b) => new Date(a.session_datetime) - new Date(b.session_datetime));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Ticket size={24} className="text-primary" />
          Sesiones Disponibles
        </h1>
        <p className="text-text-muted text-sm m-0">
          {upcomingSessions.length} sesiones disponibles
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={movieFilter}
          onChange={(e) => setMovieFilter(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-white outline-none focus:border-primary transition-colors cursor-pointer min-w-[200px]"
        >
          <option value="">Todas las peliculas</option>
          {movies.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-white outline-none focus:border-primary transition-colors cursor-pointer"
        />
        {(movieFilter || dateFilter) && (
          <button
            onClick={() => { setMovieFilter(''); setDateFilter(''); }}
            className="px-4 py-2.5 bg-white/10 border-none rounded-xl text-sm text-white cursor-pointer hover:bg-white/20 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {upcomingSessions.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CalendarDays size={48} className="mx-auto mb-3 text-text-muted opacity-40" />
          <p className="text-text-muted m-0">No hay sesiones disponibles.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {upcomingSessions.map((s) => {
            const movie = getMovie(s.movie_id);
            const cinema = getCinema(s.cinema_id);
            const dateStr = s.session_datetime.split('T')[0];
            const timeStr = s.session_datetime.split('T')[1]?.slice(0, 5);
            const end = movie ? calculateEndTime(dateStr, timeStr, movie.duration_minutes) : '';

            return (
              <GlassCard key={s.id} hover className="p-5">
                <div className="mb-2">
                  <h3 className="text-primary font-semibold text-sm m-0">
                    {movie?.title || 'Pelicula'}
                  </h3>
                  {movie && (
                    <p className="text-[11px] text-text-muted m-0 mt-0.5">
                      {formatDuration(movie.duration_minutes)} &middot; {movie.genre}
                    </p>
                  )}
                </div>

                <p className="text-xs text-text-muted mb-3 m-0 flex items-center gap-1">
                  <Building2 size={12} />
                  {cinema?.name || 'Sala'}
                  {cinema?.screen_type && (
                    <span className="ml-1 px-1.5 py-0.5 bg-surface rounded text-[10px]">
                      {cinema.screen_type}
                    </span>
                  )}
                </p>

                <div className="flex justify-between items-center bg-surface p-3 rounded-xl mb-3">
                  <div className="text-sm">
                    <CalendarDays size={13} className="inline mr-1 text-text-muted" />
                    {dateStr}
                  </div>
                  <div className="text-sm font-semibold text-gold">
                    <Clock size={13} className="inline mr-1" />
                    {timeStr} — {end}
                  </div>
                </div>

                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Normal: {formatCurrency(s.price_normal)}</span>
                  <span>VIP: {formatCurrency(s.price_vip)}</span>
                  <span className="text-primary font-medium">{s.available_seats} plazas</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
