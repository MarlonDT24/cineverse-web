import { useState } from 'react';
import {
  Clapperboard, Plus, X, Pencil, Trash2, Save, Check,
  Clock, Tag, Star, Users, Calendar,
} from 'lucide-react';
import { useMovies } from '../../hooks/useMovies';
import { useToast } from '../../context/ToastContext';
import { formatDuration } from '../../lib/formatters';
import { GENRES } from '../../lib/constants';
import GlassCard from '../../components/ui/GlassCard';
import IconButton from '../../components/ui/IconButton';
import MoviePoster from '../../components/ui/MoviePoster';
import FormField from '../../components/ui/FormField';
import Modal from '../../components/ui/Modal';

const emptyForm = {
  title: '', original_title: '', description: '', duration_minutes: '',
  genre: '', director: '', actors: '', release_date: '', rating: '',
};

export default function MoviesPage() {
  const { movies, addMovie, updateMovie, deleteMovie } = useMovies();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMovie(editingId, formData);
        toast('Película actualizada correctamente');
      } else {
        await addMovie(formData);
        toast('Película añadida correctamente');
      }
      resetForm();
    } catch {
      toast('Error al guardar la película', 'error');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (movie) => {
    setFormData({ ...movie });
    setEditingId(movie.id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await deleteMovie(deleteTarget);
        toast('Película eliminada', 'warning');
      } catch {
        toast('Error al eliminar la película', 'error');
      }
      setDeleteTarget(null);
    }
  };

  const genreOptions = GENRES.map((g) => ({ value: g, label: g }));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Clapperboard size={24} className="text-primary" />
            Gestión de Películas
          </h1>
          <p className="text-text-muted text-sm m-0">{movies.length} películas en cartelera</p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 px-5 py-2.5 border-none rounded-xl bg-primary text-gray-900 cursor-pointer
            font-semibold text-sm transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20"
        >
          {showForm ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Añadir Película</>}
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6 text-center">
            {editingId ? 'Editar Película' : 'Nueva Película'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Título" name="title" value={formData.title} onChange={handleChange} required />
              <FormField label="Título Original" name="original_title" value={formData.original_title} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <FormField label="Descripción" type="textarea" name="description" value={formData.description} onChange={handleChange} rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField label="Duración (minutos)" type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} required min="1" />
              <FormField label="Género" type="select" name="genre" value={formData.genre} onChange={handleChange} required options={genreOptions} />
              <FormField label="Rating" type="number" name="rating" value={formData.rating} onChange={handleChange} step="0.1" min="0" max="10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Director" name="director" value={formData.director} onChange={handleChange} />
              <FormField label="Fecha de Estreno" type="date" name="release_date" value={formData.release_date} onChange={handleChange} />
            </div>
            <div className="mb-6">
              <FormField label="Actores Principales" name="actors" value={formData.actors} onChange={handleChange} placeholder="Separados por comas" />
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button type="submit" className="flex items-center gap-2 px-6 py-2.5 border-none rounded-xl font-semibold text-sm cursor-pointer transition-all bg-success text-white hover:bg-success-hover">
                {editingId ? <><Save size={16} /> Guardar Cambios</> : <><Check size={16} /> Crear Película</>}
              </button>
              <button type="button" onClick={resetForm} className="flex items-center gap-2 px-6 py-2.5 border-none rounded-xl font-semibold text-sm cursor-pointer transition-all bg-white/10 text-white hover:bg-white/20">
                <X size={16} /> Cancelar
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <GlassCard key={movie.id} hover className="overflow-hidden">
            <MoviePoster src={movie.poster_url} alt={movie.title} />
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="m-0 text-base font-semibold flex-1 pr-2">{movie.title}</h3>
                <div className="flex gap-1.5">
                  <IconButton icon={Pencil} label="Editar" variant="warning" onClick={() => handleEdit(movie)} size={15} />
                  <IconButton icon={Trash2} label="Eliminar" variant="danger" onClick={() => setDeleteTarget(movie.id)} size={15} />
                </div>
              </div>
              {movie.original_title !== movie.title && (
                <p className="text-xs text-text-muted italic m-0 mb-2">{movie.original_title}</p>
              )}
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-3">{movie.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-full text-xs text-text-secondary">
                  <Clock size={12} /> {formatDuration(movie.duration_minutes)}
                </span>
                <span className="inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-full text-xs text-text-secondary">
                  <Tag size={12} /> {movie.genre}
                </span>
                <span className="inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-full text-xs text-text-secondary">
                  <Star size={12} /> {movie.rating}/10
                </span>
              </div>
              <div className="space-y-1 text-xs text-text-muted">
                <p className="m-0 flex items-center gap-1.5"><Clapperboard size={12} /> {movie.director}</p>
                <p className="m-0 flex items-center gap-1.5"><Users size={12} /> {movie.actors}</p>
                <p className="m-0 flex items-center gap-1.5"><Calendar size={12} /> {movie.release_date}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar película"
        message="¿Estás seguro de que quieres eliminar esta película? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}
