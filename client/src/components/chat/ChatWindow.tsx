import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Search } from 'lucide-react';
import clsx from 'clsx';
// import { io } from 'socket.io-client';

interface ChatWindowProps {
  chatId: string;
}

const mockMessages = [
  { id: '1', text: 'Hey, how are you?', sender: 'other', time: '10:00 AM' },
  { id: '2', text: 'I am good, thanks! You?', sender: 'me', time: '10:05 AM', status: 'read' },
  { id: '3', text: 'Working on the new project structure.', sender: 'other', time: '10:06 AM' }
];

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatId]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    setMessages([...messages, newMsg]);
    setInput('');
    // TODO: Emit socket event here.
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2]">
      {/* Header */}
      <div className="h-16 bg-gray-100 flex items-center justify-between px-4 border-l border-gray-200 z-10 sticky top-0">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white">
            U
          </div>
          <div className="ml-3">
            <div className="font-medium">User or Group {chatId}</div>
            <div className="text-xs text-gray-500">last seen today at 10:05 AM</div>
          </div>
        </div>
        <div className="flex space-x-4 text-gray-600">
          <Search className="cursor-pointer hover:text-gray-800" />
          <MoreVertical className="cursor-pointer hover:text-gray-800" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={clsx("flex", msg.sender === 'me' ? "justify-end" : "justify-start")}>
            <div className={clsx(
              "max-w-[65%] rounded-lg px-3 py-1.5 shadow-sm relative",
              msg.sender === 'me' ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white rounded-tl-none"
            )}>
              <span className="text-[15px] text-gray-800 leading-snug">{msg.text}</span>
              <span className="text-[11px] text-gray-500 ml-2 float-right mt-2 flex items-center gap-1">
                {msg.time}
                {msg.sender === 'me' && (
                  <svg viewBox="0 0 16 15" width="16" height="15" className={msg.status === 'read' ? 'fill-blue-500' : 'fill-gray-400'}>
                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path>
                  </svg>
                )}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="h-[62px] bg-gray-100 flex items-center px-4 py-2 gap-3 fixed bottom-0 w-[70%]">
        <Smile className="text-gray-500 cursor-pointer" size={26} />
        <Paperclip className="text-gray-500 cursor-pointer" size={26} />
        <form onSubmit={handleSend} className="flex-1">
          <input 
            type="text" 
            placeholder="Type a message" 
            className="w-full bg-white rounded-lg px-4 py-2 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
        {input ? (
          <button onClick={handleSend} className="text-gray-500 cursor-pointer p-1">
             <Send size={24} className="text-primary" />
          </button>
        ) : (
          <button className="text-gray-500 cursor-pointer p-1">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.468 2.349 8.468 4.35v7.061c0 2.001 1.53 3.531 3.531 3.531z" fillOpacity=".3"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
