import { Chat, Message } from '../../models/chat.model';
import { User } from '../../models/user.model';

export const accessChat = async (userId: string, currentUserId: string) => {
  if (!userId) throw new Error('UserId param not sent with request');

  // Check if chat exists and is not a group chat
  const chat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: currentUserId } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  }).populate('users', '-password').populate('latestMessage');

  if (chat) {
    // Populate latest message sender
    const finalChat = await User.populate(chat, {
      path: 'latestMessage.senderId',
      select: 'name email avatar'
    });
    return finalChat;
  }

  // Create new chat
  const chatData = {
    name: 'sender',
    isGroupChat: false,
    users: [currentUserId, userId]
  };

  const createdChat = await Chat.create(chatData);
  const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
  return fullChat;
};

export const fetchChats = async (currentUserId: string) => {
  const chats = await Chat.find({ users: { $elemMatch: { $eq: currentUserId } } })
    .populate('users', '-password')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });

  const finalChats = await User.populate(chats, {
    path: 'latestMessage.senderId',
    select: 'name email avatar'
  });

  return finalChats;
};

export const sendMessage = async (chatId: string, senderId: string, content: string) => {
  if (!content || !chatId) {
    throw new Error('Invalid data passed into request');
  }

  const newMessage = {
    senderId,
    content,
    chatId
  };

  let message = await Message.create(newMessage);

  message = await message.populate('senderId', 'name avatar');
  message = await message.populate('chatId');
  message = await User.populate(message, {
    path: 'chatId.users',
    select: 'name email avatar'
  }) as any;

  await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

  return message;
};

export const fetchMessages = async (chatId: string) => {
  const messages = await Message.find({ chatId })
    .populate('senderId', 'name email avatar')
    .populate('chatId');

  return messages;
};
