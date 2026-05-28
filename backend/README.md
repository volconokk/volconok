# Volconok — Backend

REST + Socket.IO API for the Volconok social network.

## Stack
- Node.js 18+
- Express 4
- MongoDB (Mongoose 8)
- JWT auth
- Socket.IO for realtime messages & notifications
- Multer for image uploads

## Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed   # optional: creates demo users (password: volconok)
npm run dev
```

The API will be available at `http://localhost:4000`.

## Endpoints (summary)
- `POST /api/auth/register` — `{ username, email, password, displayName? }`
- `POST /api/auth/login` — `{ login, password }` (login = username OR email)
- `GET  /api/auth/me`
- `GET  /api/users/:idOrUsername`
- `GET  /api/users/search?q=`
- `PATCH /api/users/me` — profile fields
- `PATCH /api/users/me/settings` — `{ language, theme, notifications }`
- `POST /api/users/me/password`
- `GET  /api/posts/feed?cursor=&limit=`
- `POST /api/posts` — `{ text, images: [url, ...] }`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/react` — `{ type: 'like' | 'love' | ... }`
- `GET/POST /api/comments/post/:postId`
- `POST /api/comments/:id/like`
- `GET /api/messages/threads`
- `GET/POST /api/messages/with/:userId`
- `GET/POST /api/friends/...` (request, accept, decline)
- `POST /api/upload/image` (multipart `file`)
- `POST /api/upload/images` (multipart `files[]`)

## Realtime

Connect Socket.IO with the JWT in `auth.token`. Events received by the client:
- `message:new` — new direct message
- `notification:new` — like, comment, friend request, etc.
- `typing` — `{ from, typing }`
