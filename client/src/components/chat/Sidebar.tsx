import React, { useEffect, useState, useRef } from 'react';
import { Search, LogOut, MessageSquarePlus, X, Loader2, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { useThemeStore } from '../../store/useThemeStore';


const Sidebar: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const { chats, fetchChats, accessChat, selectedChat, setSelectedChat } = useChatStore();

  const { theme, toggleTheme } = useThemeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/search?q=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, token]);

  const handleSelectUser = async (userId: string) => {
    try {
      const chat = await accessChat(userId);
      setSearchQuery('');
      setSearchActive(false);
      setSearchResults([]);
      setSelectedChat(chat._id);
    } catch (err) {
      console.error('Error accessing chat', err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      // Even if API call fails, clear local state
    }
    logout();
  };

  const getOtherUser = (users: any[]) => {
    return users?.find((u: any) => (u._id?.toString() || u.toString()) !== user?.id) || users?.[0];
  };


  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.charAt(0).toUpperCase();
  };

  // Color generator based on name
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-900 border-r border-zinc-200 dark:border-white/[0.06]">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-zinc-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 bg-gradient-to-br ${getAvatarColor(user?.name || '')} rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
            {getInitials(user?.name || '')}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{user?.name}</p>
            <p className="text-[11px] text-zinc-500 dark:text-surface-400">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme}
            className="p-2 text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg transition-all duration-200"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => { setSearchActive(!searchActive); setSearchQuery(''); setSearchResults([]); }} 
            className="p-2 text-zinc-500 dark:text-surface-400 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg transition-all duration-200"
            title="New Chat"
          >
            <MessageSquarePlus size={20} />
          </button>

          <button onClick={handleLogout}
            className="p-2 text-zinc-500 dark:text-surface-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input 
            type="text"
            placeholder={searchActive ? "Search users by name or email..." : "Search conversations..."}
            className="w-full pl-9 pr-9 py-2.5 bg-zinc-100 dark:bg-surface-800/60 border border-zinc-200 dark:border-white/[0.06] rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-surface-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 focus:border-brand-500/30 transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (!searchActive) setSearchActive(false); }}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchActive && searchQuery && (
        <div className="px-2 pb-2 shrink-0 animate-fade-in">
          <p className="text-[11px] uppercase tracking-wider text-surface-500 font-medium px-2 mb-2">
            {isSearching ? 'Searching...' : `${searchResults.length} users found`}
          </p>
          {isSearching && (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-brand-400" />
            </div>
          )}
          {searchResults.map((u: any) => (
            <div
              key={u._id}
              onClick={() => handleSelectUser(u._id)}
              className="flex items-center px-3 py-2.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/[0.04] rounded-lg transition-all duration-150 animate-slide-up"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(u.name)} rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                {getInitials(u.name)}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                <p className="text-xs text-surface-400 truncate">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      {searchActive && searchQuery && (
        <div className="mx-4 border-t border-white/[0.04]" />
      )}

      {/* Chat List */}
      <div className="overflow-y-auto flex-1 px-2 py-1">
        {chats.length === 0 && !searchActive && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 opacity-50">
            <MessageSquarePlus size={40} className="text-surface-500 mb-3" />
            <p className="text-sm text-surface-400">No conversations yet</p>
            <p className="text-xs text-surface-500 mt-1">Click the + icon to start chatting</p>
          </div>
        )}
        {chats.map((chat: any) => {
          const otherUser = getOtherUser(chat.users);
          const isActive = selectedChat === chat._id;

          return (
            <div 
              key={chat._id} 
              onClick={() => setSelectedChat(chat._id)}
              className={clsx(
                "flex items-center px-3 py-3 cursor-pointer rounded-xl mb-0.5 transition-all duration-150",
                isActive 
                  ? "bg-brand-600/10 dark:bg-brand-600/15 border border-brand-500/20" 
                  : "hover:bg-zinc-100 dark:hover:bg-white/[0.04] border border-transparent"
              )}
            >
              <div className={`w-11 h-11 bg-gradient-to-br ${getAvatarColor(otherUser?.name || '')} rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                {getInitials(otherUser?.name || '')}
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className={clsx(
                    "font-medium truncate text-sm",
                    isActive ? "text-brand-600 dark:text-white" : "text-zinc-900 dark:text-surface-200"
                  )}>
                    {otherUser?.name}
                  </span>
                  <span className="text-[11px] text-surface-500 ml-2 shrink-0">
                    {chat.latestMessage 
                      ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : ''
                    }
                  </span>
                </div>
                <p className="text-xs text-surface-400 truncate mt-0.5">
                  {chat.latestMessage ? chat.latestMessage.content : 'Start a conversation'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
