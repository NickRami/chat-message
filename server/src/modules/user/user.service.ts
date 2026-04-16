import { User } from '../../models/user.model';
import mongoose from 'mongoose';

export class UserService {
  static async searchUsers(query: string, currentUserId: string) {
    const regex = new RegExp(query, 'i');
    return User.find({
      _id: { $ne: currentUserId },
      $or: [{ name: regex }, { email: regex }]
    }).select('-password').limit(20);
  }

  static async addContact(userId: string, contactId: string) {
    if (userId === contactId) throw new Error("A user cannot add themselves as a contact");
    
    const contactExists = await User.findById(contactId);
    if (!contactExists) throw new Error("Contact user not found");

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { contacts: contactId } }, // $addToSet prevents duplicates
      { new: true }
    ).populate('contacts', 'name email avatar about status lastSeen');
    
    return updatedUser?.contacts;
  }

  static async getContacts(userId: string) {
    const user = await User.findById(userId).populate('contacts', 'name email avatar about status lastSeen');
    return user?.contacts || [];
  }
}
