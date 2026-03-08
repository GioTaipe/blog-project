# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack blog application. Backend: Express.js + MongoDB. Frontend: Vue 3 + Vuetify 3 + Pinia.

## Commands

### Backend (`cd backend`)
```bash
npm start           # Start server on port 3001 (node server.js)
npm test            # Run Jest tests in watch mode (--watchAll --verbose)
```
To run a single test file: `npx jest src/tests/auth.test.js --verbose`

### Frontend (`cd frontend/vuetify-project`)
```bash
npm run dev         # Dev server on port 3000
npm run build       # Production build
npm run lint        # ESLint with auto-fix
```

## Environment Variables

**Backend** (`.env` in `backend/`):
- `URL_MONGO` — MongoDB connection URI
- `DATABASE_NAME` — MongoDB database name
- `SECRET_KEY` — JWT signing key
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials

**Frontend** (`.env` in `frontend/vuetify-project/`):
- `VITE_API_BASE_URL` — Backend URL (defaults to `http://localhost:3001/api`)

## Architecture

### Backend — Layered Architecture

```
Controller → Service → Repository → Model
```

- **Controllers** handle HTTP request/response, delegate to services.
- **Services** contain business logic (image upload, like toggling, data orchestration).
- **Repositories** isolate Mongoose queries from business logic.
- **Models** define schemas with pre-save hooks and cascade deletes.

All async controller/service calls are wrapped with `asyncHandler` (`src/utils/asyncHandler.js`), which forwards errors to the global error middleware in `app.js`.

### Backend — Key Behaviors

- **Auth**: Stateless JWT (1-day expiry). `verifyToken` middleware extracts `user._id` from the Bearer token and attaches it to `req.user`.
- **File uploads**: `express-fileupload` populates `req.files`. Cloudinary (`src/utils/cloudinary.js`) handles upload/delete. Images go to `BLOG/IMAGES-POST`, `BLOG/IMAGES-PROFILE`, or `BLOG/IMAGES-BANNER` folders.
- **Cascade deletes**: User delete → posts deleted via Mongoose post-hook. Post delete → comments deleted via Mongoose post-hook.
- **Likes**: Stored as array of user IDs on the Post document; service toggles add/remove.

### API Routes (all prefixed `/api`)

| Prefix | Router |
|--------|--------|
| `/api/users` | userRouter (register, login, profile, image upload) |
| `/api/posts` | postRouter (CRUD, likes, by-user) |
| `/api/comments` | commentRouter (create on post, delete) |

### Frontend — State & Data Flow

- **Pinia stores**: `authStore` (token, user, profile update/avatar upload) and `postStore` (posts list, create, like, delete, comments).
- **Axios instance** (`src/api/axiosConfig.js`): injects Bearer token from `authStore` on every request; auto-calls `authStore.logout()` on 401 responses.
- **Router guards** (`src/router/index.js`): routes with `meta: { requiresAuth: true }` redirect unauthenticated users to `/login`; authenticated users are redirected away from `/login` to `/posts`.
- **File-based routing**: `unplugin-vue-router` auto-generates routes from `src/pages/`. Layouts use `vite-plugin-vue-layouts-next`.

### Testing

Tests live in `backend/src/tests/` and use Jest + Supertest + `mongodb-memory-server` (in-memory DB). Cloudinary is mocked with `jest.mock()`. The shared DB setup/teardown helper is `src/tests/db-handler.js`.

Test files:
- `auth.test.js` — user registration, login, profile, search
- `post.test.js` — post CRUD, likes, per-user posts
- `comment.test.js` — comment create/delete with authorization checks
