import React, { useState } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <div className="h-screen w-full bg-chat-bg flex overflow-hidden">
      <div className="w-[30%] min-w-[300px] border-r border-gray-200 bg-white flex flex-col">
        <Sidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      </div>
      <div className="flex-1 flex flex-col bg-chat-bg">
        {selectedChat ? (
          <ChatWindow chatId={selectedChat} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-3xl text-gray-500 font-light mt-4">WhatsApp Web</h1>
              <p className="text-sm text-gray-400 mt-2">Send and receive messages without keeping your phone online.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
