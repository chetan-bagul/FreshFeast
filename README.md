# Fresh Feast

Fresh Feast is a MERN food-ordering platform with customer, kitchen, delivery-partner, and administrator workflows. Orders include a fixed Rs. 20 delivery fee and synchronize across portals in real time.

## Features

- Customers browse dishes, manage a cart, place cash-on-delivery orders, and track statuses.
- Kitchens manage dishes and move orders through preparation and ready-for-pickup stages.
- Delivery partners accept ready pickups, update delivery progress, and see earnings.
- Administrators manage users, kitchens, dishes, and orders from one dashboard.
- Socket.IO automatically updates active screens when order or delivery data changes.

## Order workflow

`placed` -> `confirmed` -> `preparing` -> `ready` -> `out_for_delivery` -> `delivered`

Kitchen marks an order ready, a delivery partner accepts the pickup, then progresses it through delivery. Customers, kitchens, delivery partners, and admins receive synchronized updates without manually refreshing.

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop

## Local setup

### 1. Start MongoDB

The project uses a local MongoDB database at `mongodb://127.0.0.1:27017/freshfeast`.

Open Docker Desktop, then run:

```powershell
docker start freshfeast-mongodb
```

If the container has not been created yet:

```powershell
docker run -d --name freshfeast-mongodb --restart unless-stopped -p 127.0.0.1:27017:27017 -v freshfeast-mongodb-data:/data/db mongo:7
```

### 2. Start the API

In `server/.env`, use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/freshfeast
PORT=5000
CLIENT_URL=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

Run:

```powershell
cd server
npm.cmd install
npm.cmd run dev
```

Expected output:

```text
MongoDB connected: 127.0.0.1
Fresh Feast API listening on port 5000
```

### 3. Seed demo data

```powershell
cd server
npm.cmd run seed:menu
npm.cmd run seed:admin
```

The sample kitchen uses pincode `425412`.

### 4. Start the customer app

```powershell
cd client
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173`.

Optional dedicated portals:

```powershell
npm.cmd run dev:kitchen   # http://localhost:5174
npm.cmd run dev:delivery  # http://localhost:5175
```

## Accounts

Create customer, kitchen, and delivery-partner accounts from their registration pages.

The local admin seed creates:

```text
Email: admin@freshfeast.local
Password: admin123
```

Sign in at `http://localhost:5173/admin/login`. Change these credentials before deployment.

## Pricing

Pricing is calculated on the server:

```text
Food subtotal: Rs. 180
Delivery charge: Rs. 20
Order total: Rs. 200
```

Checkout and the Place Order button use the same total. The Rs. 20 delivery charge is saved on the order and becomes the delivery partner’s earning when they accept its pickup.

## Real-time synchronization

The browser connects to Socket.IO at `VITE_SOCKET_URL` (default: `http://localhost:5000`). Orders, delivery tasks, kitchen queues, delivery earnings, and administrator tables automatically refresh their cached data when related events occur.

## API overview

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/dishes/home-feed`
- `POST /api/v1/orders`
- `GET /api/v1/orders/mine`
- `GET /api/v1/delivery/available`
- `POST /api/v1/delivery/tasks/claim`
- `GET /api/v1/delivery/earnings`
- `GET /api/v1/admin/overview` (admin only)

## Troubleshooting

- **Database connection fails**: start Docker Desktop and check `docker ps` for `freshfeast-mongodb`.
- **No dishes appear**: run `npm.cmd run seed:menu` in `server`.
- **Login fails**: ensure the API runs on port 5000 and use the correct portal/role.
- **Real-time changes do not appear**: set `VITE_SOCKET_URL=http://localhost:5000` in `client/.env` and restart Vite.

## Production notes

Before deployment, use secure environment secrets, HTTPS, authenticated Socket.IO rooms, a managed database, a payment provider, and a unique administrator password.
