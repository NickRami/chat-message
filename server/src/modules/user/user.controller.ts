import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { UserService } from './user.service';

export class UserController {
  static async search(req: AuthRequest, res: Response) {
    try {
      const { q } = req.query;
      const currentUserId = req.user?.id;
      if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });
      
      const users = await UserService.searchUsers(q as string || '', currentUserId);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addContact(req: AuthRequest, res: Response) {
    try {
      const { contactId } = req.body;
      const currentUserId = req.user?.id;
      if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });
      
      const contacts = await UserService.addContact(currentUserId, contactId);
      res.json(contacts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getContacts(req: AuthRequest, res: Response) {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });
      
      const contacts = await UserService.getContacts(currentUserId);
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
