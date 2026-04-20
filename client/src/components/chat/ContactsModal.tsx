import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, MessageSquare, Loader2, User as UserIcon } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

interface ContactsModalProps {
  onClose: () => void;
  onSelectContact: (userId: string) => void;
}

const ContactsModal: React.FC<ContactsModalProps> = ({ onClose, onSelectContact }) => {
  const { token } = useAuthStore();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'search'>('all');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/users/contacts', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddContact = async (contactId: string) => {
    try {
      await axios.post('http://localhost:5000/api/users/contacts', { contactId }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      fetchContacts();
      setActiveTab('all');
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to add contact', err);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['from-brand-500 to-brand-700', 'from-violet-500 to-brand-600', 'from-pink-500 to-violet-500', 'from-blue-500 to-brand-500'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/[0.06] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Contacts</h3>
            <p className="text-xs text-zinc-500 dark:text-surface-400">Start a new conversation</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-xl text-zinc-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-1 bg-zinc-50 dark:bg-white/[0.02]">
          <button 
            onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
            className={clsx(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
              activeTab === 'all' ? "bg-white dark:bg-surface-800 text-brand-500 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-surface-200"
            )}
          >
            MY CONTACTS
          </button>
          <button 
            onClick={() => { setActiveTab('search'); setSearchQuery(''); }}
            className={clsx(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
              activeTab === 'search' ? "bg-white dark:bg-surface-800 text-brand-500 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-surface-200"
            )}
          >
            FIND PEOPLE
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              placeholder={activeTab === 'all' ? "Search in your contacts..." : "Search users by name or email..."}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-surface-800/60 border border-zinc-200 dark:border-white/[0.06] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => activeTab === 'all' ? setSearchQuery(e.target.value) : handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="h-[400px] overflow-y-auto px-2 pb-4">
          {activeTab === 'all' ? (
            loading ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <Loader2 size={32} className="animate-spin text-brand-500 mb-2" />
                <p className="text-sm">Loading contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 opacity-50">
                <UserIcon size={48} className="mb-4 text-zinc-300" />
                <p className="text-sm font-medium">No contacts found</p>
                <p className="text-xs mt-1">Add people from the "Find People" tab to start chatting.</p>
              </div>
            ) : (
              filteredContacts.map(contact => (
                <div 
                  key={contact._id}
                  onClick={() => onSelectContact(contact._id)}
                  className="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.04] rounded-2xl cursor-pointer transition-all group"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(contact.name)} flex items-center justify-center text-white font-bold shadow-md`}>
                    {getInitials(contact.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-white truncate">{contact.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-surface-400 truncate">{contact.email}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-2 bg-brand-500/10 text-brand-500 rounded-xl">
                      <MessageSquare size={18} />
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            searching ? (
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-brand-500" />
              </div>
            ) : searchResults.length === 0 && searchQuery ? (
              <div className="text-center py-12 opacity-50">
                <p className="text-sm font-medium">No users found for "{searchQuery}"</p>
              </div>
            ) : (
              searchResults.map(user => {
                const isContact = contacts.some(c => c._id === user._id);
                return (
                  <div 
                    key={user._id}
                    className="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.04] rounded-2xl transition-all"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold shadow-md`}>
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-surface-400 truncate">{user.email}</p>
                    </div>
                    {isContact ? (
                      <button 
                        onClick={() => onSelectContact(user._id)}
                        className="px-4 py-2 bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-surface-200 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all"
                      >
                        MESSAGE
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAddContact(user._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all"
                      >
                        <UserPlus size={14} />
                        ADD
                      </button>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsModal;
