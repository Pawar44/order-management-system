import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import {
  createOrderSchema,
  updateStatusSchema,
  getOrdersQuerySchema,
} from '../validators/order.validator';
import { getIO } from '../sockets/socket';

// POST /orders
export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = createOrderSchema.parse(req.body);

    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );

    const order = await prisma.order.create({
      data: {
        storeId: data.storeId,
        totalAmount,
        items: {
          create: data.items.map((item) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            qty: item.qty,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    // Emit real-time event to the specific store's room (Task 2)
    getIO().to(order.storeId).emit('order:created', order);

    return res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// GET /orders?store_id=&page=&limit=
export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = getOrdersQuerySchema.parse(req.query);
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where = query.store_id ? { storeId: query.store_id } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /orders/:id/status
export async function updateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id as string;
    const { status } = updateStatusSchema.parse(req.body);

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    // Emit real-time event (Task 2)
    getIO().to(order.storeId).emit('order:status_updated', order);

    return res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}