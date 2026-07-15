import { z } from 'zod';

export const createOrderSchema = z.object({
  storeId: z.string().uuid({ message: 'storeId must be a valid UUID' }),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1),
        itemName: z.string().min(1),
        qty: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .min(1, { message: 'Order must contain at least one item' }),
});

export const updateStatusSchema = z.object({
  status: z.enum(['PLACED', 'PREPARING', 'COMPLETED']),
});

export const getOrdersQuerySchema = z.object({
  store_id: z.string().uuid().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});