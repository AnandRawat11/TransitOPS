# Antigravity Prompt — TransitOps Initial Scaffold

Copy-paste this entire prompt into Antigravity to generate the base repo structure. This is the ONLY thing that gets pushed to `main` before the team splits into branches — do not build features yet, just the skeleton.

---

## PROMPT TO PASTE:

```
Create the initial folder structure and base configuration for a MERN stack project called "TransitOps" — a transport operations platform. This is a monorepo with separate backend and frontend folders. I need ONLY the skeleton/scaffold right now — no business logic, no feature implementation. Four team members will pull this and build their own modules on separate branches afterward.

Generate the following exact structure:

transitops/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Driver.js
│   │   ├── Trip.js
│   │   ├── MaintenanceLog.js
│   │   ├── FuelLog.js
│   │   └── Expense.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── maintenanceRoutes.js
│   │   ├── fuelRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── reportRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── vehicleController.js
│   │   ├── driverController.js
│   │   ├── dashboardController.js
│   │   ├── tripController.js
│   │   ├── maintenanceController.js
│   │   ├── fuelController.js
│   │   ├── expenseController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorHandler.js
│   ├── config/
│   │   └── db.js
│   ├── utils/
│   │   └── apiResponse.js
│   ├── seed/
│   │   └── seedData.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── authApi.js
│   │   │   ├── vehicleApi.js
│   │   │   ├── driverApi.js
│   │   │   ├── dashboardApi.js
│   │   │   ├── tripApi.js
│   │   │   ├── maintenanceApi.js
│   │   │   ├── fuelApi.js
│   │   │   ├── expenseApi.js
│   │   │   └── reportApi.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Topbar.jsx
│   │   │   ├── common/
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── VehicleListPage.jsx
│   │   │   ├── DriverListPage.jsx
│   │   │   ├── TripListPage.jsx
│   │   │   ├── MaintenancePage.jsx
│   │   │   ├── FuelExpensePage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .gitignore
└── README.md

Requirements for each file:

1. BACKEND:
   - server.js: Express app setup, CORS enabled, JSON body parsing, connects to MongoDB via config/db.js, mounts all route files under /api/auth, /api/vehicles, /api/drivers, /api/dashboard, /api/trips, /api/maintenance, /api/fuel, /api/expenses, /api/reports. Include a global error handler middleware at the end.
   - config/db.js: Mongoose connection function using process.env.MONGO_URI, with connection success/error logging.
   - All model files: define ONLY the Mongoose schema fields exactly as follows (use these exact field names, no changes):
     - User: name (String), email (String, unique, required), password (String), role (String, enum: ['FleetManager','Driver','SafetyOfficer','FinancialAnalyst']), timestamps: true
     - Vehicle: registrationNumber (String, unique, required), name (String), type (String), maxLoadCapacity (Number), odometer (Number), acquisitionCost (Number), status (String, enum: ['Available','On Trip','In Shop','Retired'], default 'Available'), region (String), timestamps: true
     - Driver: name (String), licenseNumber (String, unique), licenseCategory (String), licenseExpiryDate (Date), contactNumber (String), safetyScore (Number, default 100), status (String, enum: ['Available','On Trip','Off Duty','Suspended'], default 'Available'), timestamps: true
     - Trip: source (String), destination (String), vehicle (ObjectId ref Vehicle), driver (ObjectId ref Driver), cargoWeight (Number), plannedDistance (Number), actualDistance (Number), fuelConsumed (Number), status (String, enum: ['Draft','Dispatched','Completed','Cancelled'], default 'Draft'), createdBy (ObjectId ref User), dispatchedAt (Date), completedAt (Date), timestamps: true
     - MaintenanceLog: vehicle (ObjectId ref Vehicle), type (String), description (String), cost (Number), status (String, enum: ['Active','Closed'], default 'Active'), startDate (Date), closedDate (Date), timestamps: true
     - FuelLog: vehicle (ObjectId ref Vehicle), trip (ObjectId ref Trip, optional), liters (Number), cost (Number), date (Date), timestamps: true
     - Expense: vehicle (ObjectId ref Vehicle), type (String), amount (Number), date (Date), notes (String), timestamps: true
   - All route files: just an Express router with placeholder comments like "// GET / - list all - Deepika to implement" for each expected endpoint, exported but not yet connected to real controller logic.
   - All controller files: export empty async function stubs matching the routes, each with a comment "// TODO: implement" and a temporary res.status(200).json({ success: true, message: 'not implemented yet' }) response so routes don't crash if hit early.
   - middleware/authMiddleware.js: working JWT verification middleware that reads Authorization: Bearer token header, verifies with process.env.JWT_SECRET, attaches req.user = { id, role }, calls next(), returns 401 on failure. This should be FULLY functional, not a stub, since everyone depends on it immediately.
   - middleware/roleMiddleware.js: working higher-order function roleMiddleware(allowedRoles) that checks req.user.role against allowedRoles array, returns 403 if not permitted. FULLY functional.
   - middleware/errorHandler.js: basic Express error-handling middleware returning { success: false, message } JSON.
   - utils/apiResponse.js: two helper functions successResponse(data) and errorResponse(message) returning consistent JSON shape { success: true/false, data/message }.
   - seed/seedData.js: a script that connects to DB and inserts 1 sample user per role (password "password123" hashed with bcrypt), 3 sample vehicles, 3 sample drivers (with varied statuses/expiry dates), runnable via "node seed/seedData.js".
   - .env.example: MONGO_URI=, JWT_SECRET=, PORT=5000
   - package.json: include dependencies express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken, and dev dependency nodemon with a "dev" script.

2. FRONTEND:
   - Set up with Vite + React + Tailwind CSS (Tailwind config + PostCSS config included).
   - api/axios.js: create an axios instance with baseURL from import.meta.env.VITE_API_URL, and a request interceptor that attaches the JWT token from localStorage/context to the Authorization header automatically.
   - Each api/*.js file: export empty async functions matching backend routes (e.g., getVehicles(), createVehicle(data)) that call the axios instance — stubbed to hit the correct endpoint paths but can return placeholder data for now.
   - context/AuthContext.jsx: FULLY functional — provides user, token, login(email, password), logout(), wraps children, persists token to localStorage, exposes useAuth() hook.
   - components/common/ProtectedRoute.jsx: FULLY functional — redirects to /login if no valid token in context.
   - components/layout/AppLayout.jsx, Sidebar.jsx, Topbar.jsx: basic working layout shell with a sidebar nav (placeholder links to all pages) and topbar showing logged-in user's name/role and a logout button. Sidebar nav items should conditionally hide based on role using useAuth().
   - components/common/StatusBadge.jsx: reusable colored badge component accepting a status string and mapping to colors (Available=green, On Trip=blue, In Shop=orange, Retired=gray, Draft=gray, Dispatched=blue, Completed=green, Cancelled=red, Off Duty=gray, Suspended=red).
   - components/common/LoadingSpinner.jsx and EmptyState.jsx: simple reusable UI components.
   - All page files (LoginPage, DashboardPage, VehicleListPage, DriverListPage, TripListPage, MaintenancePage, FuelExpensePage, ReportsPage): create as functional components with just a page title heading and a "TODO: implement by [assign owner name in a comment]" placeholder — LoginPage should be the one fully functional exception, wired to AuthContext.login().
   - App.jsx: set up React Router with routes for /login (public) and all other pages wrapped in ProtectedRoute + AppLayout.
   - .env.example: VITE_API_URL=http://localhost:5000/api
   - tailwind.config.js and index.css: basic Tailwind setup with content paths configured correctly for Vite.

3. ROOT:
   - Root .gitignore covering node_modules, .env, dist, build folders for both backend and frontend.
   - README.md: project title, short description from the hackathon brief, setup instructions (clone, cd backend && npm install && npm run dev, cd frontend && npm install && npm run dev), and a "Branch Strategy" section listing:
     - feature/auth-vehicle (Anand Rawat)
     - feature/driver-dashboard (Deepika)
     - feature/trip-maintenance (Nitin Singh)
     - feature/fuel-reports (Saurav Shandilya)

Do not implement any actual feature logic beyond what's marked "FULLY functional" above (auth middleware, role middleware, AuthContext, ProtectedRoute, LoginPage, axios instance, seed script). Everything else should be a clean, non-crashing stub so each team member can pull this branch and immediately start replacing their own stubs with real logic without touching anyone else's files.

After generating, run the backend once to confirm server.js starts without errors and MongoDB connection logic works, and run the frontend once to confirm it builds and the login page renders.
```

---

## What to do with this

1. Run this prompt in Antigravity **once**, on your own machine, before anyone branches off.
2. Test both `npm run dev` in `backend/` and `frontend/` actually boot without crashing.
3. `git init`, commit, push to `main` on the shared GitHub repo.
4. Everyone else: `git clone`, then `git checkout -b feature/xxx`, and starts replacing their own stub files per their individual task doc.
