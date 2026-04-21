# MellyOS 🌐

> **Your World. Connected.** — A centralized SaaS platform to manage multiple websites and receive real-time notifications from all of them in one place.

---

## Features

- 🔐 **Authentication** — Secure sign up / login with JWT session cookies
- 🖥️ **Multi-Site Management** — Register and manage multiple websites
- 🔔 **Real-Time Notifications** — Live push from connected sites via Socket.io
- 📦 **Order Tracking** — Orders from all your sites in one dashboard
- 🔑 **API Key System** — Each site gets a unique key to securely push data
- ⚙️ **Settings** — Profile management, key regeneration, API reference

---

## Tech Stack

| Layer     | Technology                         |
|-----------|-----------------------------------|
| Frontend  | Next.js 14 (App Router) + Tailwind CSS + TypeScript |
| Auth      | Custom JWT sessions (bcrypt + cookie) |
| Database  | PostgreSQL via Prisma ORM          |
| Realtime  | Socket.io (custom Node.js server)  |
| Hosting   | Vercel + Railway                   |

---

## Getting Started

### 1. Clone & Install

```bash
cd MellyOS
npm install
```

### 2. Set Up Environment Variables

Copy the example file and fill in your values:

```bash
copy .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mellyos"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

> **Get a free PostgreSQL database:**
> - [Railway](https://railway.app) — Click "New Project" → "PostgreSQL"
> - [Supabase](https://supabase.com) — Free tier, get the connection string from Settings → Database

### 3. Set Up Database

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to login.

---

## API Integration

Use these endpoints to push data from your external websites into MellyOS.

### Send a Notification

```bash
curl -X POST http://localhost:3000/api/notify \
  -H "Content-Type: application/json" \
  -H "x-api-key: mly_your_site_api_key" \
  -d '{
    "type": "CUSTOM",
    "title": "New contact form submission",
    "body": "Jane Doe submitted the contact form"
  }'
```

### Submit an Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-api-key: mly_your_site_api_key" \
  -d '{
    "externalId": "order-1234",
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "amount": 4999,
    "currency": "USD",
    "status": "PENDING"
  }'
```

### Notification Types

| Type             | Description                    |
|------------------|-------------------------------|
| `ORDER`          | New order from a store        |
| `MESSAGE`        | New message/inquiry           |
| `DESIGN_REQUEST` | Design/creative request       |
| `CUSTOM`         | Any custom event              |

---

## API Key Management

1. Go to **Sites** → Add your site
2. Copy the generated `mly_` API key
3. Use it in your external site's backend to call `/api/notify` or `/api/orders`
4. Regenerate keys anytime from **Settings → Sites & Keys**

---

## Deployment

### Vercel (Frontend + API)

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel Dashboard → Settings → Environment Variables.

**Note:** For Socket.io (real-time), you need a persistent server. Deploy backend to **Railway**:
1. Connect your repo to Railway
2. Set `PORT=3000` and all env vars
3. Railway auto-detects `npm run dev` / `npm start`

### Database on Railway

1. New Project → Add PostgreSQL
2. Copy `DATABASE_URL` from the Connect tab
3. Run `npm run db:push` with the Railway DB URL

---

## Project Structure

```
MellyOS/
├── app/
│   ├── (auth)/login/         ← Login page
│   ├── (auth)/register/      ← Register page
│   ├── (dashboard)/          ← Protected dashboard shell
│   │   ├── dashboard/        ← Overview
│   │   ├── sites/            ← Site management
│   │   ├── notifications/    ← Real-time notifications
│   │   └── settings/         ← Profile & API keys
│   └── api/
│       ├── auth/             ← login / register / logout
│       ├── notify/           ← External push endpoint
│       ├── orders/           ← External order endpoint
│       ├── sites/            ← CRUD for sites
│       ├── notifications/    ← Read/delete notifications
│       └── profile/          ← Profile updates
├── components/
│   ├── layout/               ← Sidebar, Header
│   ├── dashboard/            ← Stats, Orders, Notifications widgets
│   ├── sites/                ← SiteCard, AddSiteModal
│   ├── notifications/        ← Full notification panel
│   ├── settings/             ← Settings tabs
│   └── ui/                   ← Toast primitives
├── hooks/                    ← useSocket, use-toast
├── lib/                      ← prisma, session, api-key, utils
├── prisma/schema.prisma       ← Database schema
└── server.mjs                ← Custom Node.js + Socket.io server
```

---

## License

MIT — Built with ❤️ by MellyOS
