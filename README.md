# Order Management System

A multi-store order management system with real-time updates and sales analytics, built for a full-stack developer take-home assessment.

**Live demo:** (https://order-management-system-azure-two.vercel.app)

## Tech Stack

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Socket.IO (real-time updates)
- Zod (validation)
- Docker (database containerization)

**Frontend**
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- TanStack React Query
- Socket.IO Client
- Recharts (analytics dashboard)

## Features

- **Order Management** — create orders, list/filter by store with pagination, update order status
- **Real-time Sync** — order creation and status changes broadcast live to all connected clients via Socket.IO, scoped per store
- **Data Archival** — move orders older than 30 days into a separate archive table via a single API call
- **Analytics Dashboard** — orders per day, revenue per store, and top-selling items, visualized with bar and pie charts

## Project Structure

```
order-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Store, Order, OrderItem, OrderArchive models
│   │   └── migrations/
│   ├── src/
│   │   ├── config/prisma.ts    # Shared Prisma client
│   │   ├── controllers/        # order, archive, analytics
│   │   ├── routes/             # order, archive, analytics
│   │   ├── validators/         # Zod schemas
│   │   ├── middleware/         # centralized error handler
│   │   ├── sockets/socket.ts   # Socket.IO server setup
│   │   └── server.ts           # entry point
│   └── .env                    # DATABASE_URL, PORT
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx                    # homepage
│       │   ├── orders/create/page.tsx      # create order
│       │   ├── orders/page.tsx             # order list + live updates
│       │   ├── orders/[id]/status/page.tsx # update status
│       │   ├── analytics/page.tsx          # analytics dashboard
│       │   └── components/Navbar.tsx
│       └── lib/
│           ├── api.ts          # axios client
│           ├── socket.ts       # socket.io client
│           └── useOrders.ts    # data fetching + live updates hook
└── docker-compose.yml           # PostgreSQL container
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Docker Desktop
- npm

### 1. Clone the repository
```bash
git clone https://github.com/Pawar44/order-management-system.git
cd order-management-system
```

### 2. Start the database
```bash
docker compose up -d
```
This starts a PostgreSQL container on port `5433` (mapped to `5432` inside the container).

### 3. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/order_management?schema=public"
PORT=5000
```

Run migrations and start the server:
```bash
npx prisma migrate dev
npm run dev
```
Backend runs at `http://localhost:5000`.

### 4. Frontend setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`.

### 5. Create a test store
The API doesn't expose a "create store" endpoint (not required by the assessment), so add one directly via Prisma Studio:
```bash
cd backend
npx prisma studio
```
Open `http://localhost:5555`, go to the `Store` table, add a record with a `name`, and copy its generated `id` — use this as the `storeId` when creating orders.

## API Documentation

Base URL: `http://localhost:5000`

### Orders

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Create a new order |
| `GET` | `/orders?store_id=&page=&limit=` | List orders, optionally filtered by store, paginated |
| `PATCH` | `/orders/:id/status` | Update an order's status |

**POST /orders** — request body:
```json
{
  "storeId": "uuid",
  "items": [
    { "itemId": "item-1", "itemName": "Burger", "qty": 2, "price": 150 }
  ]
}
```

**PATCH /orders/:id/status** — request body:
```json
{ "status": "PREPARING" }
```
Valid statuses: `PLACED`, `PREPARING`, `COMPLETED`

### Archival

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/archive-old-orders` | Move orders older than 30 days into the archive table |

Optional request body to customize the threshold:
```json
{ "days": 30 }
```

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/orders-per-day` | Order count grouped by calendar day |
| `GET` | `/analytics/revenue-per-store` | Total revenue grouped by store |
| `GET` | `/analytics/top-items` | Top 5 items by quantity sold |

### Real-time Events (Socket.IO)

Connect to `http://localhost:5000`. After connecting, emit `join_store` with a `storeId` to receive events scoped to that store:

```js
socket.emit('join_store', storeId);
socket.on('order:created', (order) => { /* ... */ });
socket.on('order:status_updated', (order) => { /* ... */ });
```

## Database Design Notes

- Indexes on `Order.storeId` and `Order.createdAt` for efficient filtering and sorting.
- `OrderArchive` stores items as a JSON snapshot rather than a live relation, since archived orders are read-only history.
- Archival and analytics use database-level aggregation (`groupBy`, raw SQL for date grouping) to avoid pulling large datasets into application memory.

## Assumptions

- No authentication was implemented, as it wasn't specified in the assessment requirements.
- A "create store" endpoint wasn't built since the assessment's Order schema treats `store_id` as a given input; stores are seeded manually via Prisma Studio for testing.
- The archive endpoint defaults to a 30-day threshold as specified, with an optional override.
