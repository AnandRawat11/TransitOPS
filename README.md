# TransitOps - Transport Operations Platform

TransitOps is a transport operations platform designed to manage fleet vehicles, driver assignments, trip logs, maintenance schedules, fuel costs, and operational expenses. It is a monorepo containing a backend REST API built with Node.js, Express, and MongoDB, and a frontend client application built with React, Vite, and Tailwind CSS.

## Project Structure

```
transitops/
├── backend/            # Express REST API & MongoDB models
└── frontend/           # React client application (Vite + Tailwind CSS)
```

## Setup and Installation

### Prerequisites

- Node.js (version >= 18.0.0)
- MongoDB running locally or a MongoDB Atlas connection string

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run the database seed script to insert sample data:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and configure the API URL:
   ```bash
   cp .env.example .env
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Branch Strategy

The team members will work on their respective modules on the following branches:

- `feature/auth-vehicle` (Anand Rawat)
- `feature/driver-dashboard` (Deepika)
- `feature/trip-maintenance` (Nitin Singh)
- `feature/fuel-reports` (Saurav Shandilya)
