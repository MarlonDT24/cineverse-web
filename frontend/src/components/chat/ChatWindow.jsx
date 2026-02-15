import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { useAuth } from '../../context/AuthContext';

function ChatAvatar({ name }) {
  const initials = (name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
      {initials}
    </div>
  );
}

function formatHeaderDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  if (diff < 86400000 && date.getDate() === now.getDate()) return 'Hoy';
  if (diff < 172800000) return 'Ayer';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ChatWindow({ chat, onSend, onBack, connected }) {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const dateLabel = formatHeaderDate(chat.createdAt);

  return (
    <div className="flex-1 flex flex-col bg-black/20 h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer text-text-secondary hover:text-white hover:bg-surface-hover transition-colors lg:hidden"
            aria-label="Volver a conversaciones"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="relative">
          <ChatAvatar name={chat.user} />
          {!connected && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-surface" title="Sin conexión" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="m-0 font-semibold text-sm text-white truncate">{chat.user}</h3>
          {isAdmin ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400">
                Cliente
              </span>
              <span className="text-[11px] text-text-muted">{chat.userUsername}</span>
              <span className="text-[10px] text-text-muted">&rarr;</span>
              {chat.employeeUsername ? (
                <>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">
                    Empleado
                  </span>
                  <span className="text-[11px] text-text-muted">{chat.employeeUsername}</span>
                </>
              ) : (
                <span className="text-[11px] text-amber-400 font-medium">Sin asignar</span>
              )}
            </div>
          ) : chat.subtitle ? (
            <span className={`text-[11px] ${chat.isOrphan ? 'text-amber-400' : 'text-text-muted'}`}>
              {chat.subtitle}
            </span>
          ) : null}
        </div>
        {dateLabel && (
          <span className="text-[10px] text-text-muted shrink-0">{dateLabel}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-text-muted">No hay mensajes en esta conversación.</p>
          </div>
        )}
        {chat.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-surface border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe una respuesta..."
            className="flex-1 bg-surface-hover border-none rounded-full px-5 py-2.5 text-sm text-white placeholder-text-muted
              focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || !connected}
            className="bg-primary hover:bg-primary-hover text-gray-900 w-10 h-10 rounded-full border-none cursor-pointer
              flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Enviar mensaje"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
