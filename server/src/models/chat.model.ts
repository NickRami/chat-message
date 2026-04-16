import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  status: 'sent' | 'delivered' | 'read';
}

const messageSchema = new Schema<IMessage>({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
}, { timestamps: true });

export const Message = mongoose.model<IMessage>('Message', messageSchema);

export interface IChat extends Document {
  isGroupChat: boolean;
  users: mongoose.Types.ObjectId[];
  latestMessage?: mongoose.Types.ObjectId;
  name?: string;
}

const chatSchema = new Schema<IChat>({
  isGroupChat: { type: Boolean, default: false },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  latestMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  name: { type: String }
}, { timestamps: true });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
