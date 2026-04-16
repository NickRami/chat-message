import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Search, Phone, Video, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';

const ChatWindow: React.FC<{ socket: any }> = ({ socket }) => {
  const { user } = useAuthStore();
  const { 
    messages, 
    fetchMessages, 
    sendMessage, 
    chats,
    selectedChat: chatId 
  } = useChatStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find((c: any) => c._id?.toString() === chatId);
  const otherUser = activeChat?.users?.find((u: any) => (u._id?.toString() || u.toString()) !== user?.id) || activeChat?.users?.[0];


  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-brand-500 to-brand-700',
      'from-accent-purple to-brand-600',
      'from-accent-pink to-accent-purple',
      'from-accent-blue to-brand-500',
      'from-accent-green to-accent-blue',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-teal-500 to-cyan-600',
    ];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[idx];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages(chatId);
    if (socket) {
      socket.emit('join_chat', chatId);
    }
  }, [chatId, fetchMessages, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatId]);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showEmojiPicker || showOptions) {
        const target = e.target as HTMLElement;
        if (!target.closest('.relative') && !target.closest('.absolute')) {
          setShowEmojiPicker(false);
          setShowOptions(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showOptions]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;
    
    const msgContent = input;
    setInput('');
    setSending(true);

    try {
      await sendMessage(chatId, msgContent);
      const { messages: currentMessages } = useChatStore.getState();
      const newMsg = currentMessages[currentMessages.length - 1];
      if (socket) {
        socket.emit('new_message', newMsg);
      }
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, we would upload this. For now, we'll just log it.
      console.log('File selected:', file.name);
      alert(`Attachment feature simulated: ${file.name} would be uploaded here.`);
    }
  };

  const commonEmojis = ['😊', '😂', '😍', '👍', '🔥', '🙌', '😎', '😢', '❤️', '✨', '🤔', '🎉', '👋', '🙏', '💯', '🚀'];

  // Group messages by date
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  let lastDateLabel = '';

  return (
    <div className="flex flex-col h-full chat-pattern">
      {/* Header */}
      <div className="h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl flex items-center justify-between px-4 border-b border-zinc-200 dark:border-white/[0.06] shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(otherUser?.name || '')} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md`}>
            {getInitials(otherUser?.name || '')}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{otherUser?.name || 'User'}</p>
            <p className="text-[11px] text-accent-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-accent-green rounded-full inline-block" />
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg transition-all duration-200">
            <Phone size={18} />
          </button>
          <button className="p-2 text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg transition-all duration-200">
            <Video size={18} />
          </button>
          <button className="p-2 text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg transition-all duration-200">
            <Search size={18} />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg transition-all duration-200"
            >
              <MoreVertical size={18} />
            </button>
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 border border-zinc-200 dark:border-white/[0.06] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-surface-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04]">View Profile</button>
                <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-surface-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04]">Mute Notifications</button>
                <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-surface-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04]">Clear Chat</button>
                <div className="border-t border-zinc-100 dark:border-white/[0.04] my-1" />
                <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">Block User</button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg: any, idx: number) => {
          const msgSenderId = msg.senderId?._id?.toString() || msg.senderId?.toString();
          const isSender = msgSenderId === user?.id;
          const currentDateLabel = getDateLabel(msg.createdAt);

          const showDateLabel = currentDateLabel !== lastDateLabel;
          lastDateLabel = currentDateLabel;

          return (
            <React.Fragment key={msg._id || idx}>
              {showDateLabel && (
                <div className="flex justify-center py-3">
                  <span className="text-[11px] text-zinc-500 dark:text-surface-400 bg-zinc-100 dark:bg-surface-800/60 backdrop-blur-sm px-3 py-1 rounded-full border border-zinc-200 dark:border-white/[0.04]">
                    {currentDateLabel}
                  </span>
                </div>
              )}
              <div className={clsx("flex animate-slide-up", isSender ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "max-w-[70%] rounded-2xl px-3.5 py-2 shadow-md relative group",
                  isSender 
                    ? "bg-gradient-to-br from-brand-600 to-brand-700 rounded-br-md" 
                    : "bg-white dark:bg-surface-800/80 backdrop-blur-sm border border-zinc-200 dark:border-white/[0.06] rounded-bl-md"
                )}>
                  <p className={clsx(
                    "text-sm leading-relaxed",
                    isSender ? "text-white" : "text-zinc-800 dark:text-surface-200"
                  )}>
                    {msg.content}
                  </p>
                  <div className={clsx(
                    "flex items-center gap-1 justify-end mt-1",
                    isSender ? "text-white/50" : "text-surface-500"
                  )}>
                    <span className="text-[10px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isSender && (
                      <svg viewBox="0 0 16 15" width="14" height="13" className={msg.status === 'read' ? 'fill-accent-blue' : 'fill-white/40'}>
                        <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-t border-zinc-200 dark:border-white/[0.06] px-4 py-3 shrink-0 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-full left-4 mb-2 p-3 bg-white dark:bg-surface-800 border border-zinc-200 dark:border-white/[0.06] rounded-2xl shadow-2xl grid grid-cols-8 gap-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {commonEmojis.map(emoji => (
              <button 
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="w-10 h-10 flex items-center justify-center text-xl hover:bg-zinc-100 dark:hover:bg-white/[0.1] rounded-xl transition-all hover:scale-110 active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={clsx(
              "p-2 rounded-lg transition-all duration-200 shrink-0",
              showEmojiPicker ? "bg-brand-500/10 text-brand-500" : "text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
            )}
          >
            <Smile size={22} />
          </button>
          <button 
            onClick={handleFileClick}
            className="p-2 text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg transition-all duration-200 shrink-0"
          >
            <Paperclip size={22} />
          </button>
          <form onSubmit={handleSend} className="flex-1">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-surface-800/60 border border-zinc-200 dark:border-white/[0.06] rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-surface-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 focus:border-brand-500/30 transition-all duration-200"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </form>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={clsx(
              "p-2.5 rounded-xl transition-all duration-200 shrink-0",
              input.trim() 
                ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:scale-105 active:scale-95" 
                : "text-zinc-400 dark:text-surface-500 bg-zinc-100 dark:bg-surface-800/40"
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
