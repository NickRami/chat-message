import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

// Assuming base URL and withCredentials are set or we pass full URLs
const API_URL = 'http://localhost:5000/api';

interface ChatStore {
  chats: any[];
  messages: any[];
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  addMessage: (message: void) => void;
  accessChat: (userId: string) => Promise<any>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  messages: [],
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
    set({ messages: [...get().messages, message] });
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
}));
