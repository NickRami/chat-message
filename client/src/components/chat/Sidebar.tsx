import React, { useEffect, useState } from 'react';
import { Search, LogOut, MessageSquarePlus, Sun, Moon, User as UserIcon, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { useThemeStore } from '../../store/useThemeStore';
import ContactsModal from './ContactsModal';

/* ── Tooltip ─────────────────────────────────────────────────── */
const Tooltip: React.FC<{ label: string; children: React.ReactNode; position?: 'bottom' | 'top' | 'left' }> = ({
  label, children, position = 'bottom'
}) => (
  <div className="relative group/tip">
    {children}
    <span className={clsx(
      "pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
      "px-2 py-1 rounded-lg text-[11px] font-medium",
      "bg-surface-900 dark:bg-surface-950 text-white border border-white/10 shadow-xl",
      "opacity-0 group-hover/tip:opacity-100 translate-y-1 group-hover/tip:translate-y-0",
      "transition-all duration-200 z-50",
      position === 'bottom' ? 'top-full mt-2' : position === 'top' ? 'bottom-full mb-2' : 'right-full mr-2 left-auto -translate-x-0'
    )}>
      {label}
    </span>
  </div>
);

/* ── Sidebar action icon button ─────────────────────────────── */
const SidebarIconBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
}> = ({ icon, label, onClick, active, danger }) => (
  <Tooltip label={label} position="bottom">
    <button
      onClick={onClick}
      className={clsx(
        "p-2 rounded-xl transition-all duration-200",
        danger
          ? "text-zinc-400 dark:text-surface-400 hover:text-red-500 hover:bg-red-500/10"
          : active
          ? "text-brand-500 bg-brand-500/10"
          : "text-zinc-500 dark:text-surface-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
      )}
    >
      {icon}
    </button>
  </Tooltip>
);


const Sidebar: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const { chats, fetchChats, accessChat, selectedChat, setSelectedChat } = useChatStore();

  const { theme, toggleTheme } = useThemeStore();
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    fetchChats();
    fetchContacts();
  }, [fetchChats, token]);

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const res = await axios.get('http://localhost:5000/api/users/contacts', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleSelectUser = async (userId: string) => {
    try {
      const chat = await accessChat(userId);
      setSelectedChat(chat._id);
      setActiveTab('chats');
      setSearchQuery('');
      setShowContactsModal(false);
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
        <div className="flex items-center gap-0.5">
          <SidebarIconBtn
            icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            onClick={toggleTheme}
          />
          <SidebarIconBtn
            icon={<MessageSquarePlus size={18} />}
            label="New chat"
            onClick={() => setShowContactsModal(true)}
            active={showContactsModal}
          />
          {/* Separator */}
          <div className="w-px h-4 bg-zinc-200 dark:bg-white/[0.08] mx-0.5" />
          <SidebarIconBtn
            icon={<LogOut size={18} />}
            label="Sign out"
            onClick={handleLogout}
            danger
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-4 gap-1">
        <button
          onClick={() => setActiveTab('chats')}
          className={clsx(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
            activeTab === 'chats'
              ? "bg-brand-500/10 text-brand-500 shadow-sm"
              : "text-zinc-500 dark:text-surface-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
          )}
        >
          CHATS
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={clsx(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
            activeTab === 'contacts'
              ? "bg-brand-500/10 text-brand-500 shadow-sm"
              : "text-zinc-500 dark:text-surface-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
          )}
        >
          CONTACTS
        </button>
      </div>


      {/* Search Bar */}
      <div className="p-3 shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input 
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-9 pr-9 py-2.5 bg-zinc-100 dark:bg-surface-800/60 border border-zinc-200 dark:border-white/[0.06] rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-surface-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 focus:border-brand-500/30 transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="overflow-y-auto flex-1 px-2 py-1">
        {activeTab === 'chats' ? (
          chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12 opacity-50">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquarePlus size={32} className="text-surface-500" />
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">No conversations yet</p>
              <p className="text-xs text-surface-500 mt-1">Click the + icon to start chatting with your contacts.</p>
            </div>
          ) : (
            chats.filter((c: any) => {
              const other = getOtherUser(c.users);
              return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            }).map((chat: any) => {
              const otherUser = getOtherUser(chat.users);
              const isActive = selectedChat === chat._id;
              return (
                <div 
                  key={chat._id} 
                  onClick={() => setSelectedChat(chat._id)}
                  className={clsx(
                    "flex items-center px-3 py-3 cursor-pointer rounded-xl mb-0.5 transition-all duration-150",
                    isActive 
                      ? "bg-brand-600/10 dark:bg-brand-600/15 border border-brand-500/20 shadow-sm shadow-brand-500/5" 
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
            })
          )
        ) : (
          /* Contacts Tab */
          loadingContacts ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-brand-500" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12 opacity-50">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mb-4">
                <UserIcon size={32} className="text-surface-500" />
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Your contact list is empty</p>
              <p className="text-xs text-surface-500 mt-1">Add people from the search to start chatting.</p>
            </div>
          ) : (
            contacts.filter((c: any) => 
              c.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((contact: any) => (
              <div 
                key={contact._id} 
                onClick={() => handleSelectUser(contact._id)}
                className="flex items-center px-3 py-3 cursor-pointer rounded-xl mb-0.5 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all duration-150 border border-transparent"
              >
                <div className={`w-11 h-11 bg-gradient-to-br ${getAvatarColor(contact.name)} rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                  {getInitials(contact.name)}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="font-medium truncate text-sm text-zinc-900 dark:text-surface-200">
                    {contact.name}
                  </p>
                  <p className="text-xs text-surface-500 truncate mt-0.5">
                    {contact.email}
                  </p>
                </div>
              </div>
            ))
          )
        )}
      </div>

        {/* Contacts Modal */}
        {showContactsModal && (
          <ContactsModal 
            onClose={() => setShowContactsModal(false)} 
            onSelectContact={handleSelectUser}
          />
        )}
    </div>
  );
};

export default Sidebar;
