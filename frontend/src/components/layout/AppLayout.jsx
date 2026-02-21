import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ChatProvider } from '../../context/ChatContext';
import { ToastProvider } from '../../context/ToastContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileDrawer from './MobileDrawer';
import CommandPalette from '../features/CommandPalette';

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <ToastProvider>
      <ChatProvider>
        <div className="min-h-screen flex">
          <Sidebar className="hidden lg:flex" />
          <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar onMenuClick={() => setDrawerOpen(true)} />
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </ChatProvider>
    </ToastProvider>
  );
}
