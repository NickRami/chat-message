import { useEffect, useRef } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { MessageCircle } from 'lucide-react';

const ENDPOINT = 'http://localhost:5000';

const Chat = () => {
  const { selectedChat, addMessage } = useChatStore();
  const { token } = useAuthStore();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (token && !socketRef.current) {
      socketRef.current = io(ENDPOINT, {
        auth: { token },
      });

      socketRef.current.on('message_received', (newMessageReceived: any) => {
        addMessage(newMessageReceived);
      });

      socketRef.current.on('update_online_users', (users: string[]) => {
        useChatStore.getState().setOnlineUsers(users);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, addMessage]);

  return (
    <div className="h-screen w-full bg-white dark:bg-surface-950 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-[340px] min-w-[300px] shrink-0">
        <Sidebar />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedChat ? (
          <ChatWindow key={selectedChat} socket={socketRef.current} />
        ) : (


          <div className="flex-1 flex items-center justify-center chat-pattern">
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-500/10 to-brand-700/10 dark:from-brand-500/20 dark:to-brand-700/20 rounded-3xl flex items-center justify-center border border-brand-500/10 animate-float">
                <MessageCircle size={36} className="text-brand-500 dark:text-brand-400" />
              </div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">Welcome to Chat</h1>
              <p className="text-sm text-zinc-500 dark:text-surface-400 max-w-sm">
                Select a conversation from the sidebar or start a new one by searching for users.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

};

export default Chat;
