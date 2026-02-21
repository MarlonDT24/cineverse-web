import { MessageSquare } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import EmptyState from '../../components/ui/EmptyState';

export default function ChatPage() {
  const { user } = useAuth();
  const {
    conversations,
    activeChat,
    connected,
    loading,
    selectChat,
    closeChat,
    sendMessage,
    createConversation,
    claimConversation,
  } = useChat();

  return (
    <div className="p-4 lg:p-6 h-[calc(100vh-64px)] lg:h-screen">
      <div className="flex h-full bg-surface rounded-2xl backdrop-blur-md overflow-hidden border border-border shadow-xl">
        {/* Conversation list: visible on desktop always, on mobile only when no chat selected */}
        <div className={`w-full lg:w-80 xl:w-96 border-r border-border shrink-0
          ${activeChat ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
          <ConversationList
            conversations={conversations}
            activeChat={activeChat}
            onSelect={selectChat}
            onNewConversation={createConversation}
            onClaim={claimConversation}
            userRole={user?.role}
            connected={connected}
            loading={loading}
          />
        </div>

        {/* Chat window: visible on desktop always, on mobile only when chat selected */}
        <div className={`flex-1 min-w-0
          ${activeChat ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
          {activeChat ? (
            <ChatWindow
              chat={activeChat}
              onSend={sendMessage}
              onBack={closeChat}
              connected={connected}
            />
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Selecciona una conversación"
              description="Elige una conversación del panel izquierdo para comenzar"
            />
          )}
        </div>
      </div>
    </div>
  );
}
