import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  about?: string;
  status: 'online' | 'offline';
  lastSeen?: Date;
  contacts: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  about: { type: String, default: "Available" },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now },
  contacts: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
