# Kritika AI Solutions

A full-stack marketing website and admin dashboard for an AI software studio, built with **Node.js, Express, EJS, and SQLite**. It showcases services and case studies, captures project inquiries and client reviews, and gives the studio owner a password-protected dashboard to manage that incoming data.

## Features

### Public site
- **Home** — hero section, services overview, and the 3 most recent client reviews
- **Solutions** — service offerings overview
- **Case Studies** — list page plus individual detail pages (chatbot triage, reporting automation, semantic search, lead-gen bots, OCR pipelines, recommendation engines)
- **Articles** — content/blog listing with search
- **Gallery** — events and gallery showcase
- **Feedback** — public reviews list with aggregate star rating, plus a form for new client reviews
- **Contact** — project inquiry form with full server-side validation (name, email, phone format/length checks, required-field checks, 2–2000 character bounds, etc.)
- **AI chat widget** — a floating chat bubble/panel (`public/js/chat.js`) with suggested-question quick replies, present on all public pages

### Admin dashboard (session-protected, under `/admin`)
- **Login/Logout** — bcrypt-hashed password auth with session regeneration on login (prevents session fixation) and no-store cache headers so the browser back button can't reveal the dashboard after logout
- **Dashboard** — inquiry totals, unread/in-progress counts, average review rating
- **Inquiries** — list + detail view, with status updates (New → In progress → Replied, etc.)
- **Reviews** — manage client feedback
- **Articles / Events / Gallery / Settings** — content management screens

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Web framework | Express 4 |
| Views | EJS templates (`views/`) |
| Database | SQLite (file-based, via `sqlite3`) |
| Auth | `express-session` + `bcryptjs` |
| Config | `dotenv` |

## Project structure

```
.
├── server.js            # Express app, routes, session/auth middleware
├── db.js                # SQLite connection + query/execute/getOne helpers, table schema
├── seed.js               # Populates an admin account + sample inquiries/reviews
├── views/                # EJS templates (public pages, admin/* pages, partials/)
├── public/
│   ├── css/style.css
│   ├── js/               # main.js, chat.js (chat widget)
│   └── images/
├── package.json
└── .env                  # local-only config (not committed)
```

## Getting started

### Prerequisites
- Node.js 18+ and npm

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy the example file and fill in your own values:
```bash
cp .env.example .env
```
| Variable | Required | Description |
|---|---|---|
| `PORT` | No (defaults to `3000`) | Port the server listens on |
| `SESSION_SECRET` | Yes (in production) | Secret used to sign session cookies. Falls back to an insecure default in `server.js` if unset — always set your own value. |

The database is a local SQLite file (`database.sqlite`) created automatically on first run — no external database server needed.

### 3. Seed sample data (optional but recommended)
```bash
npm run seed
```
This creates an admin login and populates sample inquiries/reviews:
- **Username:** `admin@kritika.ai`
- **Password:** `admin123`

> Change or remove this account before deploying anywhere public.

### 4. Run the server
```bash
npm start        # production
npm run dev      # auto-restarts on file changes (node --watch)
```

Then visit:
- Public site: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

## Available scripts

| Script | Description |
|---|---|
| `npm start` | Start the server with `node server.js` |
| `npm run dev` | Start with `node --watch` for auto-reload during development |
| `npm run seed` | Reset and seed the admin account, inquiries, and reviews |

## Security notes

- Passwords are hashed with `bcryptjs`; the database never stores plaintext passwords.
- Sessions are regenerated on login to prevent session fixation, and cookies are `httpOnly` + `sameSite: lax`, with `secure` enabled automatically when `NODE_ENV=production`.
- Admin routes are guarded by session-based middleware and respond with `no-store` cache headers.
- The contact form validates and trims all fields server-side (length bounds and character allow-lists for name/email/phone) before writing to the database.
- `.env` and `database.sqlite` are git-ignored — never commit real secrets or the production database file.

## License

ISC — see `package.json`.
