import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// GET /analytics/orders-per-day
export async function ordersPerDay(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result: { day: string; order_count: string }[] =
      await prisma.$queryRawUnsafe(`
        SELECT DATE("createdAt") as day, COUNT(*)::text as order_count
        FROM "Order"
        GROUP BY DATE("createdAt")
        ORDER BY day DESC
      `);

    const formatted = result.map((row) => ({
      day: row.day,
      orderCount: Number(row.order_count),
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
}

// GET /analytics/revenue-per-store
export async function revenuePerStore(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await prisma.order.groupBy({
      by: ['storeId'],
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
    });

    // Attach store names for readability
    const storeIds = result.map((r) => r.storeId);
    const stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
    });

    const formatted = result.map((row) => ({
      storeId: row.storeId,
      storeName: stores.find((s) => s.id === row.storeId)?.name ?? 'Unknown',
      totalRevenue: row._sum.totalAmount ?? 0,
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
}

// GET /analytics/top-items
export async function topItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await prisma.orderItem.groupBy({
      by: ['itemId', 'itemName'],
      _sum: { qty: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 5,
    });

    const formatted = result.map((row) => ({
      itemId: row.itemId,
      itemName: row.itemName,
      totalQtySold: row._sum.qty ?? 0,
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
}