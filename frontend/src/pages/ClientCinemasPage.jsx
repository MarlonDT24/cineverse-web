import { useState } from 'react';
import {
  Building2, Eye, MapPin, Film, Glasses, Monitor, Sparkles,
} from 'lucide-react';
import { useCinemas } from '../hooks/useCinemas';
import { generateSeatMap } from '../lib/seatMapGenerator';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import IconButton from '../components/ui/IconButton';

const screenIcons = { '2D': Film, '3D': Glasses, IMAX: Monitor, '4DX': Sparkles };

const seatColors = {
  NORMAL: { available: 'bg-primary', occupied: 'bg-danger' },
  VIP: { available: 'bg-vip', occupied: 'bg-danger' },
  DISABLED: { available: 'bg-disabled-seat', occupied: 'bg-danger' },
};

export default function ClientCinemasPage() {
  const { cinemas } = useCinemas();
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Building2 size={24} className="text-primary" />
          Nuestras Salas
        </h1>
        <p className="text-text-muted text-sm m-0">{cinemas.length} salas disponibles</p>
      </div>

      {cinemas.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Building2 size={48} className="mx-auto mb-3 text-text-muted opacity-40" />
          <p className="text-text-muted m-0">No hay salas disponibles.</p>
        </GlassCard>
      ) : (
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
                  <IconButton
                    icon={Eye}
                    label={isExpanded ? 'Ocultar mapa' : 'Ver mapa de asientos'}
                    variant="primary"
                    onClick={() => setSelectedCinemaId(isExpanded ? null : cinema.id)}
                    size={15}
                  />
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
                                className={`w-4 h-4 rounded-sm transition-transform hover:scale-150
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
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
