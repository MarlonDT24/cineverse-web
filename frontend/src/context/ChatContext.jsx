import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import api, { toSnakeCase } from '../services/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const stompRef = useRef(null);
  const subsRef = useRef({});

  // ── Mappers ───────────────────────────────────────────────────────

  const mapConversation = useCallback(
    (conv) => {
      if (!user) return conv;

      const isClient = user.role === 'client';
      const isAdmin = user.role === 'admin';
      const isOrphan = !conv.employee_id;

      let displayName;
      let subtitle = null;

      if (isClient) {
        displayName = conv.employee_username || 'Soporte CineVerse';
      } else if (isAdmin) {
        displayName = conv.user_username;
        subtitle = conv.employee_username || null;
      } else {
        displayName = conv.user_username;
        subtitle = isOrphan ? 'Sin asignar' : null;
      }

      return {
        id: conv.id,
        user: displayName,
        subtitle,
        userId: conv.user_id,
        employeeId: conv.employee_id,
        userUsername: conv.user_username,
        employeeUsername: conv.employee_username,
        conversationStatus: conv.status,
        isOrphan,
        unread: 0,
        lastMessage: '',
        messages: [],
        createdAt: conv.created_at,
      };
    },
    [user]
  );

  const mapMessage = useCallback(
    (msg) => {
      if (!user) return msg;
      const sentAt = msg.sent_at ? new Date(msg.sent_at) : new Date();
      return {
        id: msg.id || Date.now(),
        sender: msg.sender_id === user.id ? 'me' : msg.sender_username,
        text: msg.message,
        time: sentAt.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        senderId: msg.sender_id,
        senderUsername: msg.sender_username,
      };
    },
    [user]
  );

  // ── REST API ──────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/chat/conversations/user/${user.id}`);
      setConversations(res.data.map(mapConversation));
    } catch (err) {
      console.error('Error cargando conversaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [user, mapConversation]);

  const loadMessages = useCallback(
    async (conversationId) => {
      try {
        const res = await api.get(
          `/chat/conversations/${conversationId}/messages`
        );
        return res.data.map(mapMessage);
      } catch (err) {
        console.error('Error cargando mensajes:', err);
        return [];
      }
    },
    [mapMessage]
  );

  // ── STOMP Subscription ────────────────────────────────────────────

  const subscribeToConversation = useCallback(
    (conversationId) => {
      const client = stompRef.current;
      if (!client?.connected || subsRef.current[conversationId]) return;

      const sub = client.subscribe(
        `/topic/conversation/${conversationId}`,
        (frame) => {
          const raw = JSON.parse(frame.body);

          if (raw.type === 'EMPLOYEE_JOINED') {
            loadConversations();
            return;
          }

          if (raw.type === 'CONVERSATION_CLOSED') {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === conversationId
                  ? { ...c, conversationStatus: 'CLOSED' }
                  : c
              )
            );
            return;
          }

          const normalized = toSnakeCase(raw);
          const msg = {
            id: normalized.id || Date.now(),
            sender:
              normalized.sender_id === user?.id
                ? 'me'
                : normalized.sender_username,
            text: normalized.message,
            time: new Date(normalized.sent_at || Date.now()).toLocaleTimeString(
              'es-ES',
              { hour: '2-digit', minute: '2-digit' }
            ),
            senderId: normalized.sender_id,
            senderUsername: normalized.sender_username,
          };

          if (normalized.sender_id === user?.id) return;

          setActiveChat((prev) => {
            if (prev?.id === conversationId) {
              return { ...prev, messages: [...prev.messages, msg] };
            }
            return prev;
          });

          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId
                ? { ...c, lastMessage: msg.text, unread: c.unread + 1 }
                : c
            )
          );
        }
      );

      subsRef.current[conversationId] = sub;
    },
    [user, loadConversations]
  );

  // ── WebSocket Connection (persiste entre navegaciones) ────────────

  useEffect(() => {
    if (!user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        loadConversations();
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers?.message);
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      Object.values(subsRef.current).forEach((sub) => sub.unsubscribe());
      subsRef.current = {};
      client.deactivate();
    };
  }, [user, loadConversations]);

  useEffect(() => {
    if (!connected) return;
    conversations.forEach((conv) => subscribeToConversation(conv.id));
  }, [conversations, connected, subscribeToConversation]);

  // ── Acciones ──────────────────────────────────────────────────────

  const selectChat = useCallback(
    async (chat) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c))
      );
      const messages = await loadMessages(chat.id);
      setActiveChat({ ...chat, messages, unread: 0 });
    },
    [loadMessages]
  );

  const closeChat = useCallback(() => {
    setActiveChat(null);
  }, []);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !activeChat || !stompRef.current?.connected) return;

      const optimisticMsg = {
        id: Date.now(),
        sender: 'me',
        text,
        time: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        senderId: user.id,
        senderUsername: user.username,
      };

      setActiveChat((prev) => ({
        ...prev,
        messages: [...prev.messages, optimisticMsg],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeChat.id ? { ...c, lastMessage: text } : c
        )
      );

      stompRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          conversationId: activeChat.id,
          senderId: user.id,
          senderUsername: user.username,
          message: text,
          messageType: 'TEXT',
        }),
      });
    },
    [activeChat, user]
  );

  const createConversation = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.post('/chat/conversations', {
        user_id: user.id,
      });
      const mapped = mapConversation(res.data);
      setConversations((prev) => [mapped, ...prev]);
      setActiveChat({ ...mapped, messages: [] });
      subscribeToConversation(mapped.id);
      return mapped;
    } catch (err) {
      console.error('Error creando conversación:', err);
    }
  }, [user, mapConversation, subscribeToConversation]);

  const claimConversation = useCallback(
    async (conversationId) => {
      if (!user) return;
      try {
        await api.put(`/chat/conversations/${conversationId}/assign`, {
          employee_id: user.id,
        });
        await loadConversations();
      } catch (err) {
        console.error('Error reclamando conversación:', err);
      }
    },
    [user, loadConversations]
  );

  // ── Contador global de no leídos ─────────────────────────────────

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations]
  );

  const value = useMemo(
    () => ({
      conversations,
      activeChat,
      connected,
      loading,
      totalUnread,
      selectChat,
      closeChat,
      sendMessage,
      createConversation,
      claimConversation,
    }),
    [
      conversations,
      activeChat,
      connected,
      loading,
      totalUnread,
      selectChat,
      closeChat,
      sendMessage,
      createConversation,
      claimConversation,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
