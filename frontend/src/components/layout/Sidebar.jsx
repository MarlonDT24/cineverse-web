import { NavLink } from 'react-router-dom';
import {
  Clapperboard,
  LayoutDashboard,
  Film,
  Building2,
  CalendarDays,
  MessageSquare,
  Ticket,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { STAFF_NAV_ITEMS, CLIENT_NAV_ITEMS } from '../../lib/constants';

const iconMap = {
  LayoutDashboard,
  Film,
  Building2,
  CalendarDays,
  MessageSquare,
  Ticket,
};

export default function Sidebar({ className = '' }) {
  const { user, logout } = useAuth();
  const { totalUnread } = useChat();

  const isClient = user?.role === 'client';
  const navItems = isClient ? CLIENT_NAV_ITEMS : STAFF_NAV_ITEMS;

  const roleBadge = user?.role === 'admin'
    ? 'Admin Panel'
    : isClient
      ? 'Mi CineVerse'
      : 'Staff Portal';

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={`w-64 bg-sidebar-bg backdrop-blur-xl border-r border-border flex flex-col h-screen sticky top-0 ${className}`}
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Clapperboard size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-coral to-teal bg-clip-text text-transparent m-0">
              CineVerse
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              {roleBadge}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1" aria-label="Navegación principal">
        {navItems.map(({ path, label, icon }) => {
          const Icon = iconMap[icon];
          return (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline
                ${
                  isActive
                    ? 'bg-nav-active text-primary font-semibold shadow-sm'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-sm">{label}</span>
              {label === 'Chat' && totalUnread > 0 && (
                <span className="ml-auto bg-coral text-white text-[10px] min-w-[20px] text-center px-1.5 py-0.5 rounded-full font-bold">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate m-0">{user?.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-text-muted m-0">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-transparent border-none cursor-pointer text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
