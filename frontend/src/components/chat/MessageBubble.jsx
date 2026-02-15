export default function MessageBubble({ message }) {
  const isMe = message.sender === 'me';

  return (
    <div className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'items-start'}`}>
      {!isMe && message.sender && (
        <span className="text-[10px] text-primary/70 font-semibold mb-0.5 px-1">
          {message.sender}
        </span>
      )}
      <div
        className={`px-4 py-2.5 rounded-2xl text-sm shadow-md
          ${isMe
            ? 'bg-primary text-gray-900 rounded-br-sm'
            : 'bg-surface-active text-white rounded-bl-sm'
          }`}
      >
        {message.text}
      </div>
      <span className="text-[11px] text-text-muted mt-1 px-1">{message.time}</span>
    </div>
  );
}
