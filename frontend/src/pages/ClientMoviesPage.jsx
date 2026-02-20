import { useState } from 'react';
import {
  Film, Clock, Tag, Star, Clapperboard, Users, Calendar, Search,
} from 'lucide-react';
import { useMovies } from '../hooks/useMovies';
import { formatDuration } from '../lib/formatters';
import { GENRES } from '../lib/constants';
import GlassCard from '../components/ui/GlassCard';
import MoviePoster from '../components/ui/MoviePoster';

export default function ClientMoviesPage() {
  const { movies } = useMovies();
  const [genreFilter, setGenreFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = movies.filter((m) => {
    const matchesGenre = !genreFilter || m.genre === genreFilter;
    const matchesSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Film size={24} className="text-primary" />
          Cartelera
        </h1>
        <p className="text-text-muted text-sm m-0">{movies.length} peliculas disponibles</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar pelicula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-white placeholder-text-muted outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-white outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">Todos los generos</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Film size={48} className="mx-auto mb-3 text-text-muted opacity-40" />
          <p className="text-text-muted m-0">No se encontraron peliculas.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((movie) => (
            <GlassCard key={movie.id} hover className="overflow-hidden">
              <MoviePoster src={movie.poster_url} alt={movie.title} />
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="m-0 text-base font-semibold">{movie.title}</h3>
                  {movie.original_title && movie.original_title !== movie.title && (
                    <p className="text-xs text-text-muted italic m-0 mt-1">{movie.original_title}</p>
                  )}
                </div>

                {movie.description && (
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-3">{movie.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-full text-xs text-text-secondary">
                    <Clock size={12} /> {formatDuration(movie.duration_minutes)}
                  </span>
                  {movie.genre && (
                    <span className="inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-full text-xs text-text-secondary">
                      <Tag size={12} /> {movie.genre}
                    </span>
                  )}
                  {movie.rating > 0 && (
                    <span className="inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-full text-xs text-text-secondary">
                      <Star size={12} /> {movie.rating}/10
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-text-muted">
                  {movie.director && (
                    <p className="m-0 flex items-center gap-1.5"><Clapperboard size={12} /> {movie.director}</p>
                  )}
                  {movie.actors && (
                    <p className="m-0 flex items-center gap-1.5"><Users size={12} /> {movie.actors}</p>
                  )}
                  {movie.release_date && (
                    <p className="m-0 flex items-center gap-1.5"><Calendar size={12} /> {movie.release_date}</p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
