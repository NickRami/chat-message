import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

// Assuming base URL and withCredentials are set or we pass full URLs
const API_URL = 'http://localhost:5000/api';

interface ChatStore {
  chats: any[];
  messages: any[];
  onlineUsers: string[];
  selectedChat: string | null;
  setOnlineUsers: (users: string[]) => void;
  setSelectedChat: (chatId: string | null) => void;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string | null) => Promise<void>;
  sendMessage: (chatId: string | null, content: string) => Promise<void>;
  addMessage: (message: any) => void;
  accessChat: (userId: string) => Promise<any>;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      messages: [],
      onlineUsers: [],
      selectedChat: null,
      setOnlineUsers: (users) => set({ onlineUsers: users }),
      setSelectedChat: (chatId) => set({ selectedChat: chatId }),

      fetchChats: async () => {
        try {
          const token = useAuthStore.getState().token;
          const response = await axios.get(`${API_URL}/chats`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          set({ chats: response.data });
        } catch (error) {
          console.error('Failed to fetch chats', error);
        }
      },
      fetchMessages: async (chatId) => {
        if (!chatId) return;
        try {
          const token = useAuthStore.getState().token;
          const response = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          set({ messages: response.data });
        } catch (error) {
          console.error('Failed to fetch messages', error);
        }
      },
      sendMessage: async (chatId, content) => {
        if (!chatId || !content.trim()) return;
        try {
          const token = useAuthStore.getState().token;
          const response = await axios.post(`${API_URL}/chats/${chatId}/messages`, { content }, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          set({ messages: [...get().messages, response.data] });
        } catch (error) {
          console.error('Failed to send message', error);
        }
      },
      addMessage: (message: any) => {
        // 1. Update the chat list to show the latest message
        const currentChats = get().chats;
        const msgChatId = (message.chatId?._id || message.chatId)?.toString();
        
        let chatExists = false;
        const updatedChats = currentChats.map((chat: any) => {
          if (chat._id?.toString() === msgChatId) {
            chatExists = true;
            return { ...chat, latestMessage: message };
          }
          return chat;
        });
        
        // Logic to handle if chat is not in our list yet (e.g. someone started a chat with us)
        if (!chatExists && message.chatId) {
           // We might need to fetch the chat details or depend on fetchChats
           // For now, let's just trigger a re-fetch of chats to be safe
           get().fetchChats();
        } else {
          // Sort chats so the one with the new message is at the top
          updatedChats.sort((a, b) => {
            const timeA = a.latestMessage ? new Date(a.latestMessage.createdAt).getTime() : 0;
            const timeB = b.latestMessage ? new Date(b.latestMessage.createdAt).getTime() : 0;
            return timeB - timeA;
          });
          set({ chats: updatedChats });
        }

        // 2. Update messages array if this message belongs to the currently viewed chat
        const currentSelectedChat = get().selectedChat;
        if (currentSelectedChat === msgChatId) {
          const currentMessages = get().messages;
          // Prevent duplicates
          if (!currentMessages.find((m: any) => m._id?.toString() === message._id?.toString())) {
            set({ messages: [...currentMessages, message] });
          }
        }
      },


      accessChat: async (userId: string) => {
        try {
          const token = useAuthStore.getState().token;
          const response = await axios.post(`${API_URL}/chats`, { userId }, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          
          const currentChats = get().chats;
          if (!currentChats.find((c: any) => c._id === response.data._id)) {
            set({ chats: [response.data, ...currentChats] });
          }
          return response.data;
        } catch (error) {
          console.error('Failed to access chat', error);
          throw error;
        }
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedChat: state.selectedChat }), // Only persist selectedChat to avoid stale data
    }
  )
);
