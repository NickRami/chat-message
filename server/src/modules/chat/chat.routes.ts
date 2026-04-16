import { Router } from 'express';
import * as chatController from './chat.controller';
import { requireAuth } from '../../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/', chatController.accessChat);
router.get('/', chatController.fetchChats);
router.post('/:id/messages', chatController.sendMessage);
router.get('/:id/messages', chatController.fetchMessages);

export default router;
