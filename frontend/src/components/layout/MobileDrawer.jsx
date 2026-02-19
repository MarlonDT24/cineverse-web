import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  Clapperboard,
  LayoutDashboard,
  Film,
  Building2,
  CalendarDays,
  MessageSquare,
  Ticket,
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

export default function MobileDrawer({ open, onClose }) {
  const { user } = useAuth();
  const { totalUnread } = useChat();

  const isClient = user?.role === 'client';
  const navItems = isClient ? CLIENT_NAV_ITEMS : STAFF_NAV_ITEMS;

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden
          ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900/95 backdrop-blur-xl border-r border-border z-50
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menú de navegación"
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clapperboard size={22} className="text-primary" />
            <span className="font-bold text-lg bg-gradient-to-r from-coral to-teal bg-clip-text text-transparent">
              CineVerse
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-transparent border-none cursor-pointer text-text-muted hover:text-white transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          {navItems.map(({ path, label, icon }) => {
            const Icon = iconMap[icon];
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline
                  ${
                    isActive
                      ? 'bg-nav-active text-primary font-semibold'
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-medium text-white m-0">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-text-muted m-0">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
