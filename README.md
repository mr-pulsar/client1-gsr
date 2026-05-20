# Courier Label & Invoice Generator — MERN

Production-ready MERN stack courier label and billing invoice generator.

Features
- Raw address parsing (regex + heuristics)
- Courier label generation (vertical, thermal-friendly)
- Invoice generation with tax calculation
- Export to PNG/JPEG/PDF and direct print
- JWT authentication, admin dashboard, print history

Folders
- `backend/` — Express API, Mongoose models, controllers, services
- `frontend/` — React + Vite client, Tailwind UI, export utilities

Quick start

1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Environment
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret used to sign JWTs
- `JWT_EXPIRES_IN` — Token expiry (default `7d`)
- `PORT` — Backend port (default `5000`)
- `CORS_ORIGIN` — Allowed frontend origin for CORS

Notes
- The project contains address parser logic in `backend/src/services/addressParser.js` and `frontend/src/utils/parser.js`.
- Export and print utilities are implemented client-side in `frontend/src/utils/exporters.js` using `html2canvas`, `dom-to-image-more`, and `jsPDF`.

If you want, I can now run quick lint and start scripts locally or wire CI configuration.

Docker quickstart

```bash
docker-compose build --pull
docker-compose up -d
# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

# Courier Label & Billing Invoice Generator

Production-ready MERN stack app for generating courier labels, invoices, and print-ready exports.

## Stack

- MongoDB + Mongoose
- Express.js
- React.js + Vite
- Tailwind CSS
- Redux Toolkit
- JWT authentication
- html2canvas, dom-to-image-more, jsPDF

## Features

- JWT register/login with protected routes
- Intelligent address parser
- Courier category assignment from amount
- Courier label and invoice generation
- JPEG, PNG, PDF export and direct print
- Label history stored in MongoDB
- Admin analytics, filters, reprint, delete
- Bulk CSV upload, draft autosave, dark mode

## Setup

1. Install dependencies from the project root.
2. Copy backend/.env.example to backend/.env and fill values.
3. Copy frontend/.env.example to frontend/.env.
4. Start MongoDB.
5. Run `npm run dev`.

## Scripts

- `npm run dev` - runs backend and frontend
- `npm run build` - builds the frontend
- `npm run start` - runs the backend in production mode

## Notes

The project is structured for extension. Advanced features like CSV bulk upload, template management, and print history are wired into the API and UI scaffolding.