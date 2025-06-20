# Real Estate Property Listing and Management System

A full-stack web application for listing, booking, and managing real estate properties, with admin and user dashboards, AI-powered analysis, and secure authentication.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Environments & Requirements](#environments--requirements)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- User and Admin authentication
- Property listing, booking, and management
- Appointment scheduling
- Testimonials and news/blog management
- AI-powered property analysis (local only by default)
- Payment integration (Stripe)
- Responsive frontend (React + Tailwind)
- Admin dashboard for managing users, properties, and bookings

---
## Project Structure

```plaintext
Real-Estate-Website/
│
├── admin/                # Admin dashboard (React app for admin users)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ... (other config files)
│
├── backend/              # Backend API (Node.js/Express)
│   ├── src/
│   ├── models/
│   ├── routes/
│   ├── controller/
│   ├── scripts/
│   ├── config/
│   ├── middleware/
│   ├── uploads/
│   ├── package.json
│   └── ... (other config files)
│
├── frontend/             # Main user-facing frontend (React app)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ... (other config files)
│
├── README.md             # Project documentation
├── package.json          # (optional, for monorepo tools)
└── ... (other root files)
```

---

---

## Environments & Requirements

- **Node.js** (v14 or higher recommended)
- **npm** (v6 or higher)
- **MongoDB** (Atlas or local)
- **Render/Vercel** (for deployment, optional)
- **Razorpay account** (for payments, optional)
- **Email service credentials** (for password reset, optional)

---

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/Prajwal4707/Real-Estate-Property-Listing-and-Management-System.git
cd Real-Estate-Property-Listiong-and-Management-System
```

### 2. Install Dependencies

Install for each subproject:

```sh
cd backend
npm install

cd ../frontend
npm install

cd ../admin
npm install
```

### 3. Set Up Environment Variables

- Copy `.env.example` to `.env` in each subproject (`backend`, `frontend`, `admin`).
- Fill in the required values (see [Environment Variables](#environment-variables)).

### 4. Seed/Create Admin User

In the `backend` directory, run:

```sh
node scripts/createAdmin.js
```

This will create or update the admin user in your database.

### 5. Start the Development Servers

**Backend:**
```sh
cd backend
npm run dev
```

**Frontend:**
```sh
cd frontend
npm run dev
```

**Admin:**
```sh
cd admin
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Admin: [http://localhost:5174](http://localhost:5174)
- Backend API: [http://localhost:4000](http://localhost:4000)

---

## Environment Variables

### **Backend (`backend/.env`)**

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@buildestate.com
ADMIN_PASSWORD=admin123
EMAIL=your_email@example.com
EMAIL_PASSWORD=your_email_password
STRIPE_SECRET_KEY=your_stripe_secret_key
WEBSITE_URL=http://localhost:5173
BACKEND_URL=http://localhost:4000
```

### **Frontend/Admin (`frontend/.env`, `admin/.env`)**

```env
VITE_API_URL=http://localhost:4000
```

> **Note:** Never commit your real `.env` files to GitHub. Use `.env.example` for sharing required variable names.

---

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server (backend)
- `node scripts/createAdmin.js` — Create or update admin user
---

## License

The Project is licensed under MIT. Check here-[LICENSE]

---
## Contact

For questions or support, open an issue or contact allayyanavarprajwal@gmail.com
