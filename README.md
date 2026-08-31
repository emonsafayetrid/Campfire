# Campfire — Full Stack Project Management App

This package contains your original **backend** (unchanged, in `backend/`) and a
new **frontend** (`frontend/`) built with React, React Router, Tailwind CSS,
and a Basecamp-inspired visual style — cream paper background, bold black
outlines, chunky yellow/pink/green/blue/purple accents, hard drop-shadow
buttons, and a friendly "camp" wordmark.

## What's included

- **Auth**: register, login, logout, email verification, forgot/reset
  password, change password, silent session refresh.
- **Projects**: create, rename/describe, delete, dashboard grid of your
  projects.
- **Members**: invite by email, change role (`admin` / `project_admin` /
  `member`), remove members. Actions are hidden for people without the
  `admin` role, matching your backend's permission checks.
- **Tasks**: a three-column board (To‑do / In progress / Done), create tasks
  with a description, assignee and file attachments, and a task detail
  drawer for editing, adding more attachments, and managing subtasks.
- **Account page**: change password, resend the verification email.

Note: your backend's PRD mentions a Notes feature, but `note.routes.js` isn't
wired into `app.js` yet, so there's no working notes API to build a UI
against. I left it out — happy to add it once that route exists.

## Running it locally

### 1. Backend

```bash
cd backend
npm install
# fill in backend/.env — it already exists with placeholders for:
# MONGO_URI, PORT, CORS_ORIGIN, ACCESS/REFRESH token secrets, mail settings,
# and FORGOT_PASSWORD_REDIRECT_URL
npm run dev   # or: node src/index.js, depending on your package.json scripts
```

The backend listens on `PORT` (defaults to `3000`) and already has
`CORS_ORIGIN` defaulting to `http://localhost:5173`, which is Vite's default
port — no CORS setup needed if you use the defaults.

**Important env value to set for the reset-password flow to work:**

```
FORGOT_PASSWORD_REDIRECT_URL=http://localhost:5173/reset-password
```

The backend appends `?token=...` itself, and the frontend's reset-password
page reads the token from that query string.

**One thing to know about email verification:** the backend's verification
email links straight to the API (`/api/v1/auth/verify-email/:token`), not to
a frontend page, so clicking it hits the backend directly rather than
rendering the frontend's `VerifyEmailPage`. That page is still there and
works if you ever point the email link at the frontend instead, or for
manually testing a token at `/verify-email/:token`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # adjust VITE_API_URL if your backend isn't on :3000
npm run dev
```

Visit `http://localhost:5173`.

### 3. Build for production

```bash
cd frontend
npm run build
npm run preview   # serve the dist/ build locally to sanity-check it
```

## Design notes

- Colors, type, and shadows live entirely in `frontend/src/index.css` and
  `frontend/tailwind.config.js`, as requested — no other CSS files.
- Font pairing: **Space Grotesk** for headings/buttons, **Inter** for body
  text, loaded via Google Fonts in `index.html`.
- Each project/user gets a deterministic accent color (yellow, pink, green,
  blue, or purple) derived from their name, so the UI feels lively without
  needing you to pick colors manually.
