import { Menu, Clapperboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="lg:hidden bg-sidebar-bg backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg bg-transparent border-none cursor-pointer text-white hover:bg-surface-hover transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-2">
        <Clapperboard size={20} className="text-primary" />
        <span className="font-bold text-white">CineVerse</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          {initials}
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-lg bg-transparent border-none cursor-pointer text-text-muted hover:text-danger transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
