# Task Management API & Frontend

A full-stack task management application with user authentication, role-based access (User/Admin), and CRUD operations for tasks.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Zod
- **Frontend**: React, Vite, React Router
- **Database**: MongoDB

## Features

- User registration & login with JWT (httpOnly cookies + Bearer token)
- Role-based access: User and Admin
- Task CRUD (Create, Read, Update, Delete)
- Admin dashboard (stats, user list)
- API versioning (`/api/v1/`)
- Input validation (Zod)
- Global error handling
- Swagger API documentation
- Refresh token support

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd server
cp .env.example .env
# Edit .env with your MONGODB_URI, JWT_SECRET (or TOKEN_SECRET)
npm install
npm run dev
```

Server runs on `http://localhost:7000` (or PORT from .env).

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to the backend.

### Create Admin User

1. Register a user via the app or API
2. Run: `node scripts/createAdmin.js your@email.com`

## API Documentation

- **Swagger UI**: `http://localhost:7000/api-docs`
- **Postman**: Import `server/postman_collection.json`

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/users/register | No | Register |
| POST | /api/v1/users/login | No | Login |
| POST | /api/v1/users/refresh | No | Refresh token |
| GET | /api/v1/users/me | Yes | Current user |
| POST | /api/v1/users/logout | Yes | Logout |
| GET | /api/v1/tasks | Yes | List tasks (paginated) |
| POST | /api/v1/tasks | Yes | Create task |
| GET | /api/v1/tasks/:id | Yes | Get task |
| PATCH | /api/v1/tasks/:id | Yes | Update task |
| DELETE | /api/v1/tasks/:id | Yes | Delete task |
| GET | /api/v1/admin/dashboard | Admin | Dashboard stats |
| GET | /api/v1/admin/users | Admin | All users |

**Auth**: Use `Authorization: Bearer <token>` header or cookies (set by login/register).

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET / TOKEN_SECRET | JWT signing secret |
| JWT_EXPIRY / TOKEN_EXPIRY | Access token expiry (e.g. 1d) |
| JWT_REFRESH_SECRET | Optional; separate secret for refresh tokens |
| FRONTEND_URL | CORS origin for frontend |

## Scalability

See [SCALABILITY.md](./SCALABILITY.md) for notes on scaling (load balancing, caching, microservices, etc.).

## Project Structure

```
primetrade_intern/
├── server/
│   ├── api/
│   │   ├── config/       # Swagger config
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── utils/
│   │   └── validators/
│   ├── scripts/         # createAdmin.js
│   └── postman_collection.json
├── client/              # React frontend
├── README.md
└── SCALABILITY.md
```
