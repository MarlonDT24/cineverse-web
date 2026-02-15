import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ChatProvider } from '../../context/ChatContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileDrawer from './MobileDrawer';

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
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
    </ChatProvider>
  );
}
