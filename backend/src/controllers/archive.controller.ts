import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { archiveOldOrdersSchema } from '../validators/analytics.validator';

// POST /archive-old-orders
export async function archiveOldOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { days } = archiveOldOrdersSchema.parse(req.body ?? {});

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Find orders older than the cutoff, including their items
    const oldOrders = await prisma.order.findMany({
      where: { createdAt: { lt: cutoffDate } },
      include: { items: true },
    });

    if (oldOrders.length === 0) {
      return res.status(200).json({
        message: 'No orders to archive',
        archivedCount: 0,
      });
    }

    // Transaction: insert into archive + delete from live tables together
    await prisma.$transaction(async (tx) => {
      // Insert into archive table (items stored as JSON snapshot)
      await tx.orderArchive.createMany({
        data: oldOrders.map((order) => ({
          originalId: order.id,
          storeId: order.storeId,
          items: order.items as unknown as object,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        })),
      });

      const orderIds = oldOrders.map((o) => o.id);

      // Delete order items first (foreign key dependency)
      await tx.orderItem.deleteMany({
        where: { orderId: { in: orderIds } },
      });

      // Then delete the orders themselves
      await tx.order.deleteMany({
        where: { id: { in: orderIds } },
      });
    });

    return res.status(200).json({
      message: 'Orders archived successfully',
      archivedCount: oldOrders.length,
    });
  } catch (err) {
    next(err);
  }
}