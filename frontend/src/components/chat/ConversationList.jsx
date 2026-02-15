import { MessageSquare, Plus, Wifi, WifiOff, Loader2, UserPlus } from 'lucide-react';

function UserAvatar({ name }) {
  const initials = (name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
      {initials}
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    cliente: 'bg-teal-500/15 text-teal-400',
    empleado: 'bg-violet-500/15 text-violet-400',
  };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${styles[role] || ''}`}>
      {role}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 172800000) return 'Ayer';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function ConversationList({
  conversations,
  activeChat,
  onSelect,
  onNewConversation,
  onClaim,
  userRole,
  connected,
  loading,
}) {
  const isAdmin = userRole === 'admin';

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            <h2 className="text-base font-bold m-0">Mensajes</h2>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <Wifi size={16} className="text-success" title="Socket conectado" />
            ) : (
              <WifiOff size={16} className="text-text-muted" title="Socket desconectado" />
            )}
            {userRole === 'client' && (
              <button
                onClick={onNewConversation}
                className="p-1.5 rounded-lg bg-primary/20 border-none cursor-pointer text-primary hover:bg-primary/30 transition-colors"
                title="Nueva conversación"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-sm text-text-muted mt-3">Cargando conversaciones...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageSquare size={40} className="text-text-muted mb-3 opacity-40" />
            <p className="text-sm text-text-muted m-0">
              {userRole === 'client'
                ? 'No tienes conversaciones aún.'
                : 'No hay conversaciones de soporte todavía.'}
            </p>
            {userRole === 'client' && (
              <button
                onClick={onNewConversation}
                className="mt-3 px-4 py-2 bg-primary text-gray-900 rounded-full border-none cursor-pointer text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Iniciar conversación
              </button>
            )}
          </div>
        ) : (
          conversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelect(chat)}
              className={`w-full p-3.5 flex items-start gap-3 cursor-pointer transition-colors border-none text-left bg-transparent
                hover:bg-surface-hover border-b border-b-border/50
                ${activeChat?.id === chat.id ? 'bg-surface-active border-l-4 border-l-primary' : ''}
                ${chat.isOrphan && userRole !== 'client' ? 'border-l-4 border-l-amber-500/60' : ''}`}
            >
              <UserAvatar name={chat.user} />
              <div className="flex-1 min-w-0">
                {/* Fila 1: Nombre + fecha */}
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-sm font-semibold text-white truncate">{chat.user}</span>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    {chat.unread > 0 && (
                      <span className="bg-coral text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {chat.unread}
                      </span>
                    )}
                    <span className="text-[10px] text-text-muted">
                      {formatDate(chat.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Fila 2: Info contextual por rol */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <RoleBadge role="cliente" />
                    <span className="text-[11px] text-text-muted">{chat.userUsername}</span>
                    <span className="text-[10px] text-text-muted mx-0.5">&rarr;</span>
                    {chat.employeeUsername ? (
                      <>
                        <RoleBadge role="empleado" />
                        <span className="text-[11px] text-text-muted">{chat.employeeUsername}</span>
                      </>
                    ) : (
                      <span className="text-[11px] text-amber-400 font-medium">Sin asignar</span>
                    )}
                  </div>
                )}

                {/* Subtítulo para empleados */}
                {!isAdmin && chat.subtitle && (
                  <span className={`text-[11px] font-medium block mb-0.5 ${chat.isOrphan ? 'text-amber-400' : 'text-text-muted'}`}>
                    {chat.subtitle}
                  </span>
                )}

                {/* Último mensaje */}
                <p className="text-xs text-text-muted truncate m-0">
                  {chat.lastMessage || 'Sin mensajes'}
                </p>
              </div>

              {/* Botón Reclamar para empleados */}
              {chat.isOrphan && userRole === 'employee' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClaim(chat.id);
                  }}
                  className="px-2.5 py-1.5 bg-amber-500/20 text-amber-400 text-[11px] font-semibold rounded-lg border border-amber-500/30
                    hover:bg-amber-500/30 transition-colors cursor-pointer shrink-0 flex items-center gap-1 mt-1"
                  title="Reclamar esta conversación"
                >
                  <UserPlus size={13} />
                  Tomar
                </button>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
