import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuth } from '../../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);
router.get('/search', UserController.search);
router.get('/contacts', UserController.getContacts);
router.post('/contacts', UserController.addContact);

export default router;
