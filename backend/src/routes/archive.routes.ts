import { Router } from 'express';
import { archiveOldOrders } from '../controllers/archive.controller';

const router = Router();

router.post('/', archiveOldOrders);

export default router;  