import { useState } from 'react';
import {
  Building2, Plus, X, Pencil, Trash2, Save, Check, Eye, MapPin,
  Film, Glasses, Monitor, Sparkles,
} from 'lucide-react';
import { useCinemas } from '../../hooks/useCinemas';
import { useToast } from '../../context/ToastContext';
import { SCREEN_TYPES } from '../../lib/constants';
import { generateSeatMap } from '../../lib/seatMapGenerator';
import GlassCard from '../../components/ui/GlassCard';
import IconButton from '../../components/ui/IconButton';
import FormField from '../../components/ui/FormField';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const screenIcons = { '2D': Film, '3D': Glasses, IMAX: Monitor, '4DX': Sparkles };

const seatColors = {
  NORMAL: { available: 'bg-primary', occupied: 'bg-danger' },
  VIP: { available: 'bg-vip', occupied: 'bg-danger' },
  DISABLED: { available: 'bg-disabled-seat', occupied: 'bg-danger' },
};

const emptyForm = { name: '', rows_count: '', seats_per_row: '', screen_type: '2D' };

export default function CinemasPage() {
  const { cinemas, addCinema, updateCinema, deleteCinema } = useCinemas();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalSeats = (parseInt(formData.rows_count, 10) || 0) * (parseInt(formData.seats_per_row, 10) || 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCinema(editingId, formData);
        toast('Sala actualizada correctamente');
      } else {
        await addCinema(formData);
        toast('Sala añadida correctamente');
      }
      resetForm();
    } catch {
      toast('Error al guardar la sala', 'error');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (cinema) => {
    setFormData({ ...cinema });
    setEditingId(cinema.id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await deleteCinema(deleteTarget);
        toast('Sala eliminada', 'warning');
      } catch {
        toast('Error al eliminar la sala', 'error');
      }
      setDeleteTarget(null);
    }
  };

  const screenOptions = SCREEN_TYPES.map((t) => ({ value: t, label: t }));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Building2 size={24} className="text-primary" />
            Gestión de Salas
          </h1>
          <p className="text-text-muted text-sm m-0">{cinemas.length} salas configuradas</p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 px-5 py-2.5 border-none rounded-xl bg-primary text-gray-900 cursor-pointer
            font-semibold text-sm transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20"
        >
          {showForm ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Añadir Sala</>}
        </button>
      </div>

      {showForm && (
        <GlassCard className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6 text-center">
            {editingId ? 'Editar Sala' : 'Nueva Sala'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Nombre de la Sala" name="name" value={formData.name} onChange={handleChange} required placeholder="Ej: Sala 5 - Premium" />
              <FormField label="Tipo de Pantalla" type="select" name="screen_type" value={formData.screen_type} onChange={handleChange} required options={screenOptions} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <FormField label="Número de Filas" type="number" name="rows_count" value={formData.rows_count} onChange={handleChange} required min="1" max="20" />
              <FormField label="Asientos por Fila" type="number" name="seats_per_row" value={formData.seats_per_row} onChange={handleChange} required min="1" max="30" />
              <FormField label="Total de Asientos" type="number" name="total_seats" value={totalSeats} readOnly />
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button type="submit" className="flex items-center gap-2 px-6 py-2.5 border-none rounded-xl font-semibold text-sm cursor-pointer transition-all bg-success text-white hover:bg-success-hover">
                {editingId ? <><Save size={16} /> Guardar Cambios</> : <><Check size={16} /> Crear Sala</>}
              </button>
              <button type="button" onClick={resetForm} className="flex items-center gap-2 px-6 py-2.5 border-none rounded-xl font-semibold text-sm cursor-pointer transition-all bg-white/10 text-white hover:bg-white/20">
                <X size={16} /> Cancelar
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cinemas.map((cinema) => {
          const ScreenIcon = screenIcons[cinema.screen_type] || Film;
          const isExpanded = selectedCinemaId === cinema.id;

          return (
            <GlassCard key={cinema.id} hover className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="m-0 mb-2 text-base font-semibold">{cinema.name}</h3>
                  <Badge variant={cinema.screen_type}>
                    <ScreenIcon size={12} /> {cinema.screen_type}
                  </Badge>
                </div>
                <div className="flex gap-1.5">
                  <IconButton
                    icon={Eye}
                    label={isExpanded ? 'Ocultar mapa' : 'Ver mapa de asientos'}
                    variant="primary"
                    onClick={() => setSelectedCinemaId(isExpanded ? null : cinema.id)}
                    size={15}
                  />
                  <IconButton icon={Pencil} label="Editar" variant="warning" onClick={() => handleEdit(cinema)} size={15} />
                  <IconButton icon={Trash2} label="Eliminar" variant="danger" onClick={() => setDeleteTarget(cinema.id)} size={15} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center bg-surface p-3 rounded-xl">
                  <span className="block text-xs text-text-muted mb-1">Total</span>
                  <span className="block text-xl font-bold text-primary">{cinema.total_seats}</span>
                </div>
                <div className="text-center bg-surface p-3 rounded-xl">
                  <span className="block text-xs text-text-muted mb-1">Filas</span>
                  <span className="block text-xl font-bold text-primary">{cinema.rows_count}</span>
                </div>
                <div className="text-center bg-surface p-3 rounded-xl">
                  <span className="block text-xs text-text-muted mb-1">Por fila</span>
                  <span className="block text-xl font-bold text-primary">{cinema.seats_per_row}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-center mb-3 flex items-center justify-center gap-1.5">
                    <MapPin size={14} className="text-primary" /> Mapa de Asientos
                  </h4>
                  <div className="bg-gradient-to-r from-gray-600 to-gray-500 text-white text-center py-1.5 mx-6 mb-4 rounded-full font-semibold text-xs">
                    PANTALLA
                  </div>
                  <div className="flex flex-col gap-0.5 mb-4 overflow-x-auto">
                    {generateSeatMap(cinema).map((row) => (
                      <div key={row.row} className="flex items-center gap-1.5">
                        <span className="w-4 text-[10px] font-bold text-center text-primary shrink-0">{row.row}</span>
                        <div className="flex gap-px flex-1 justify-center">
                          {row.seats.map((seat) => (
                            <div
                              key={seat.id}
                              className={`w-4 h-4 rounded-sm cursor-pointer transition-transform hover:scale-150
                                ${seat.available
                                  ? seatColors[seat.type]?.available
                                  : seatColors[seat.type]?.occupied}`}
                              title={`${seat.id} — ${seat.type} — ${seat.available ? 'Disponible' : 'Ocupado'}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-4 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-sm bg-primary" /> Normal
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-sm bg-vip" /> VIP
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-sm bg-disabled-seat" /> Accesible
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-sm bg-danger" /> Ocupado
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar sala"
        message="¿Estás seguro de que quieres eliminar esta sala? Se eliminarán también las sesiones asociadas."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}
