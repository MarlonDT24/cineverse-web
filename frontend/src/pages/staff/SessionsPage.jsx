import { useState } from 'react';
import {
  CalendarDays, Plus, X, Check, Trash2, Clock, AlertCircle,
} from 'lucide-react';
import { useSessions } from '../../hooks/useSessions';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDuration, calculateEndTime } from '../../lib/formatters';
import GlassCard from '../../components/ui/GlassCard';
import IconButton from '../../components/ui/IconButton';
import FormField from '../../components/ui/FormField';
import Modal from '../../components/ui/Modal';

const emptyForm = {
  movie_id: '', cinema_id: '', date: '', start_time: '', price_normal: '', price_vip: '',
};

export default function SessionsPage() {
  const { sessions, addSession, deleteSession, movies, cinemas } = useSessions();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const selectedMovie = movies.find((m) => m.id === parseInt(formData.movie_id, 10));

  const endTime =
    selectedMovie && formData.date && formData.start_time
      ? calculateEndTime(formData.date, formData.start_time, selectedMovie.duration_minutes)
      : null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addSession(formData);
    if (result.success) {
      setFormData(emptyForm);
      setShowForm(false);
      setFormError('');
      toast('Sesión creada correctamente');
    } else {
      setFormError(result.error);
      toast(result.error, 'error');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setShowForm(false);
    setFormError('');
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await deleteSession(deleteTarget);
        toast('Sesión eliminada', 'warning');
      } catch {
        toast('Error al eliminar la sesión', 'error');
      }
      setDeleteTarget(null);
    }
  };

  const getMovieTitle = (id) => movies.find((m) => m.id === id)?.title || 'Desconocida';
  const getCinemaName = (id) => cinemas.find((c) => c.id === id)?.name || 'Desconocida';

  const movieOptions = movies.map((m) => ({
    value: m.id,
    label: `${m.title} (${formatDuration(m.duration_minutes)})`,
  }));
  const cinemaOptions = cinemas.map((c) => ({
    value: c.id,
    label: `${c.name} — ${c.total_seats} asientos`,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <CalendarDays size={24} className="text-primary" />
            Gestión de Sesiones
          </h1>
          <p className="text-text-muted text-sm m-0">{sessions.length} sesiones programadas</p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 px-5 py-2.5 border-none rounded-xl bg-primary text-gray-900 cursor-pointer
            font-semibold text-sm transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20"
        >
          {showForm ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Programar Sesión</>}
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6 text-center">Nueva Sesión</h2>

          {formError && (
            <div className="flex items-center gap-2 bg-danger/15 text-red-300 p-3 rounded-lg mb-4 text-sm border border-danger/30">
              <AlertCircle size={16} className="shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Película" type="select" name="movie_id" value={formData.movie_id} onChange={handleChange} required options={movieOptions} />
              <FormField label="Sala" type="select" name="cinema_id" value={formData.cinema_id} onChange={handleChange} required options={cinemaOptions} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Fecha" type="date" name="date" value={formData.date} onChange={handleChange} required />
              <FormField label="Hora de Inicio" type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
            </div>

            {endTime && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 text-sm">
                <Clock size={16} className="text-primary shrink-0" />
                <span className="text-text-secondary">
                  Fin estimado: <strong className="text-white">{endTime}</strong>
                  {selectedMovie && <span className="text-text-muted ml-1">({formatDuration(selectedMovie.duration_minutes)})</span>}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <FormField label="Precio Normal" type="number" name="price_normal" value={formData.price_normal} onChange={handleChange} required step="0.50" min="0" placeholder="8.50" />
              <FormField label="Precio VIP" type="number" name="price_vip" value={formData.price_vip} onChange={handleChange} required step="0.50" min="0" placeholder="12.00" />
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                type="submit"
                disabled={!!formError}
                className="flex items-center gap-2 px-6 py-2.5 border-none rounded-xl font-semibold text-sm cursor-pointer transition-all
                  bg-success text-white hover:bg-success-hover disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check size={16} /> Confirmar Sesión
              </button>
              <button type="button" onClick={resetForm} className="flex items-center gap-2 px-6 py-2.5 border-none rounded-xl font-semibold text-sm cursor-pointer transition-all bg-white/10 text-white hover:bg-white/20">
                <X size={16} /> Cancelar
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sessions.map((s) => {
          const movie = movies.find((m) => m.id === s.movie_id);
          const dateStr = s.session_datetime.split('T')[0];
          const timeStr = s.session_datetime.split('T')[1]?.slice(0, 5);
          const end = movie ? calculateEndTime(dateStr, timeStr, movie.duration_minutes) : '';

          return (
            <GlassCard key={s.id} hover className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-primary font-semibold text-sm">{getMovieTitle(s.movie_id)}</span>
                <IconButton icon={Trash2} label="Eliminar sesión" variant="danger" onClick={() => setDeleteTarget(s.id)} size={14} />
              </div>
              <p className="text-xs text-text-muted mb-3 m-0">{getCinemaName(s.cinema_id)}</p>
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
                <span>{s.available_seats} plazas</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar sesión"
        message="¿Estás seguro de que quieres eliminar esta sesión?"
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}
