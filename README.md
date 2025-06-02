# Google Cloud Storage GUI Client

This project contains a lightweight Google Cloud Storage bucket explorer that you can run entirely on your laptop (requires HMAC credentials, see in detail below).

## Features

* Browse your bucket in a familiar tree view
* Click to expand folders and view files
* Click a file to open it in a new browser tab via a short-lived signed-URL
* Credentials stay on your machine – the React UI talks to a small local Express proxy which signs every request with your HMAC credentials

## Structure

```
.
├── server        # Express + @google-cloud/storage (TypeScript)
└── client        # Vite + React (TypeScript)
```

## Prerequisites

* Node.js 18+
* GCS HMAC credentials (service account email, access key, and secret)

## Quick start

1. Clone / copy this folder.
2. From the project root run:
   ```bash
   cd server
   npm install          # installs server deps
   cd ../client
   npm install          # installs UI deps
   ```
3. Export your credentials and bucket name (or put them in a `.env` file in `server/`):
   ```bash
   export GCS_BUCKET_NAME=
   export GCS_SERVICE_ACCOUNT=
   export GCS_ACCESS_KEY=
   export GCS_SECRET=
   ```
4. In one terminal start the backend:
   ```bash
   cd server
   npm run dev
   ```
   This starts the Express proxy on <http://localhost:5173>.
5. In another terminal start the React UI:
   ```bash
   cd client
   npm run dev
   ```
   Vite will open <http://localhost:5174> (or another free port). All `/api/**` requests are automatically proxied to the backend.

6. Open the UI in your browser and start exploring!

## Production build

```bash
cd client && npm run build        # build the React app into client/dist
cd ../server && npm run build     # compile TypeScript
node dist/server.js               # serve API & static UI from the same port (5173)
```

---
### Error handling

Per project conventions **`try/catch` blocks are avoided** – instead we use
`errorHandler()` (see `server/src/errorHandler.ts`) to wrap every async route
and let Express deal with unexpected errors gracefully. 