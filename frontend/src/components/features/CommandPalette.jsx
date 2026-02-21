import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Film, Building2, CalendarDays, MessageSquare,
  LayoutDashboard, ArrowRight, X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const NAV_ITEMS = [
  { type: 'nav', label: 'Dashboard',  icon: LayoutDashboard, to: '/' },
  { type: 'nav', label: 'Películas',  icon: Film,             to: '/peliculas' },
  { type: 'nav', label: 'Salas',      icon: Building2,        to: '/salas' },
  { type: 'nav', label: 'Sesiones',   icon: CalendarDays,     to: '/sesiones' },
  { type: 'nav', label: 'Chat',       icon: MessageSquare,    to: '/chat' },
];

const TYPE_ICON_CLASS = {
  nav:    'text-text-muted',
  movie:  'text-[#ff6b6b]',
  cinema: 'text-[#4ecdc4]',
};

export default function CommandPalette({ open, onClose }) {
  const { movies, cinemas } = useData();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const q = query.toLowerCase().trim();

  const results = q === ''
    ? NAV_ITEMS
    : [
        ...NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(q)),
        ...movies
          .filter((m) => m.title?.toLowerCase().includes(q))
          .slice(0, 5)
          .map((m) => ({ type: 'movie', label: m.title, sublabel: m.genre, icon: Film, to: '/peliculas' })),
        ...cinemas
          .filter((c) => c.name?.toLowerCase().includes(q))
          .slice(0, 3)
          .map((c) => ({ type: 'cinema', label: c.name, sublabel: c.screen_type, icon: Building2, to: '/salas' })),
      ];

  const handleSelect = (item) => {
    navigate(item.to);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden border border-border"
        style={{
          backgroundColor: 'rgba(13,17,23,0.98)',
          animation: 'fadeIn 0.15s ease forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search size={18} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar películas, salas, páginas..."
            className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
          />
          {query ? (
            <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-primary transition-colors">
              <X size={15} />
            </button>
          ) : (
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted font-mono">
              Ctrl K
            </kbd>
          )}
        </div>

        {/* Section label */}
        {q === '' && (
          <p className="text-[10px] uppercase tracking-widest text-text-muted px-4 pt-3 pb-1 m-0">
            Navegación rápida
          </p>
        )}

        {/* Results */}
        <div className="max-h-72 overflow-y-auto pb-2">
          {results.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8 m-0">
              Sin resultados para "{query}"
            </p>
          ) : (
            results.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selectedIndex ? 'bg-surface-hover' : 'hover:bg-surface'
                  }`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <Icon size={15} className={TYPE_ICON_CLASS[item.type] || 'text-text-muted'} />
                  <span className="flex-1 text-sm">{item.label}</span>
                  {item.sublabel && (
                    <span className="text-[11px] text-text-muted">{item.sublabel}</span>
                  )}
                  {i === selectedIndex && (
                    <ArrowRight size={14} className="text-text-muted shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-[11px] text-text-muted">
          <span>
            <kbd className="font-mono bg-surface px-1 py-0.5 rounded border border-border mr-1">↑↓</kbd>
            navegar
          </span>
          <span>
            <kbd className="font-mono bg-surface px-1 py-0.5 rounded border border-border mr-1">↵</kbd>
            seleccionar
          </span>
          <span>
            <kbd className="font-mono bg-surface px-1 py-0.5 rounded border border-border mr-1">Esc</kbd>
            cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
