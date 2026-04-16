import { Response } from 'express';
import * as chatService from './chat.service';

export const accessChat = async (req: any, res: Response) => {
  try {
    const { userId } = req.body;
    const chat = await chatService.accessChat(userId, req.user.id);
    res.status(200).json(chat);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const fetchChats = async (req: any, res: Response) => {
  try {
    const chats = await chatService.fetchChats(req.user.id);
    res.status(200).json(chats);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const { content } = req.body;
    const { id: chatId } = req.params;
    const message = await chatService.sendMessage(chatId, req.user.id, content);
    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const fetchMessages = async (req: any, res: Response) => {
  try {
    const { id: chatId } = req.params;
    const messages = await chatService.fetchMessages(chatId);
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
