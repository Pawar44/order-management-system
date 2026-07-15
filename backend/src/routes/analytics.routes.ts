import { Router } from 'express';
import {
  ordersPerDay,
  revenuePerStore,
  topItems,
} from '../controllers/analytics.controller';

const router = Router();

router.get('/orders-per-day', ordersPerDay);
router.get('/revenue-per-store', revenuePerStore);
router.get('/top-items', topItems);

export default router;