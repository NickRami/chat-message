import React from 'react';
import { Search, MoreVertical, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  onSelectChat: (id: string) => void;
  selectedChat: string | null;
}

const mockChats = [
  { id: '1', name: 'Alice Smith', lastMessage: 'See you tomorrow!', time: '10:45 AM' },
  { id: '2', name: 'Bob Johnson', lastMessage: 'Project files attached.', time: '09:20 AM' },
  { id: '3', name: 'Engineering Team', lastMessage: 'Deploy is successful', time: 'Yesterday' }
];

const Sidebar: React.FC<SidebarProps> = ({ onSelectChat, selectedChat }) => {
  const { user, logout } = useAuthStore();

  return (
    <>
      <div className="h-16 bg-gray-100 flex items-center justify-between px-4 sticky top-0 z-10 border-b border-gray-200">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex space-x-4 text-gray-600">
          <MessageSquare className="cursor-pointer hover:text-gray-800" />
          <MoreVertical onClick={logout} className="cursor-pointer hover:text-gray-800" title="Logout" />
        </div>
      </div>

      <div className="p-2 bg-white">
        <div className="bg-gray-100 rounded-lg flex items-center px-3 py-1.5">
          <Search size={18} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm placeholder-gray-500"
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {mockChats.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => onSelectChat(chat.id)}
            className={clsx(
              "flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100",
              selectedChat === chat.id && "bg-gray-100"
            )}
          >
            <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
              {chat.name.charAt(0)}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 truncate">{chat.name}</span>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
