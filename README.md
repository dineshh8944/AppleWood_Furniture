# Applewood Furnitures - MERN (React + Node + Express + MongoDB, TypeScript, Tailwind CSS)

* `client/`  React 18 + TypeScript + Tailwind CSS (Vite): customer website + owner dashboard
* `server/`  Node.js + Express + TypeScript + MongoDB: API
* `api/`     Vercel entry point (runs the Express app as a serverless function)

## 1. Owner login (dashboard)
* Address: `/admin`  (link "Owner login" is also on the website)
* Email:    `madanMahesh02mmm@gmail.com`
* Password: `123jas456mineSMM`

Only this one account can open the dashboard; there is no way to register another. It is created from the
`ADMIN_EMAIL` / `ADMIN_PASSWORD` values when the server first starts (password stored hashed). Change it any time
in Dashboard > Setting. Forgot it? `npm run reset-admin -w server`.

## 2. Environment files
Backend  - copy `.env.example` to `.env` (project root) and fill it in:

    MONGODB_URI=...           your MongoDB Atlas (or local) connection string
    MONGODB_DB=applewood
    ADMIN_EMAIL=madanMahesh02mmm@gmail.com
    ADMIN_PASSWORD=123jas456mineSMM
    # optional: JWT_SECRET, CLIENT_URL

Frontend - `client/.env.example` (copy to `client/.env` only if needed): `VITE_API_URL` stays EMPTY unless the API is on a different address.

## 3. Run on your computer
    npm install
    copy .env.example .env        (Mac/Linux: cp)
Terminal 1 (backend):   `cd server` then `npm run dev`      -> http://localhost:4000
Terminal 2 (frontend):  `cd client` then `npm run dev`      -> http://localhost:5173
(or both at once from the project root: `npm run dev`)
Check MongoDB: http://localhost:4000/api/health

## 4. Deploy on Vercel (website + API in ONE project, recommended)
1. MongoDB Atlas: create a free cluster > Database Access: add a user > Network Access: allow `0.0.0.0/0`
   (Vercel uses changing IP addresses) > Connect > copy the connection string.
2. Put this project on GitHub (`.env` is git-ignored, never upload it).
3. Vercel > Add New > Project > import the repository.
   * Root Directory: the folder that contains `vercel.json` (the project root).
   * Framework Preset: Other. Build/Output settings are already in `vercel.json`.
4. Settings > Environment Variables (add for Production):
   `MONGODB_URI`, `MONGODB_DB` (= applewood), `ADMIN_EMAIL`, `ADMIN_PASSWORD`  (optional `JWT_SECRET`)
5. Deploy. Then open `https://YOUR-SITE.vercel.app/api/health` (should say mongodb connected),
   the website, and `https://YOUR-SITE.vercel.app/admin`.

How it works: `vercel.json` builds the React app to `client/dist` and sends every `/api/*` request to `api/index.js`,
which runs the Express app. Website and API share one address, so the owner login cookie just works.

### Optional: frontend and backend as two separate Vercel projects
Import the same repository twice.
* Backend project: env vars as above + `CLIENT_URL=https://your-frontend.vercel.app`
* Frontend project: env var `VITE_API_URL=https://your-backend.vercel.app`
(CORS and cross-site cookies are switched on automatically when `CLIENT_URL` is set.)
Some browsers block cross-site cookies, so the single-project setup above is more reliable.

## 5. Owner dashboard
Dashboard, Inventory, Orders, Customers, Enquiries, Login Activity, Setting, Help. Works on phones (records become cards).
Every list has search, Add, Edit, Delete, and PDF / Word (DOCX) / CSV downloads.
* Delete moves a record to Archived; from there the owner can Restore it or Delete it forever.
* Login Activity is a permanent read-only history. Customer data is never overwritten by a returning login.
* Price, cost and stock are visible to the owner only; the customer website shows no prices.

## 6. Pages for customers
Login (name + mobile) with photo background, Home, Shop, Bag / order request, enquiry form, showroom map.
* Login page photo: replace `client/public/login-bg.jpg`.
* Showroom address / Google Maps link: `client/src/lib/shop.ts`.
* Missing product photos show a drawn picture of the category instead of a blank box.

## API
    POST /api/customers/login      POST /api/enquiries      POST /api/requests      GET /api/products     GET /api/health
    POST /api/admin/login          GET  /api/admin/stats    GET  /api/admin/login-events
    GET|POST /api/admin/:resource  PUT|DELETE /api/admin/:resource/:id  POST /api/admin/:resource/:id/restore
    (:resource = customers | enquiries | requests | products)   DELETE ...?permanent=1 erases an archived record
