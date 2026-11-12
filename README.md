# School Management System

A full-stack School Management System built to simplify and centralise academic and administrative operations within an educational institution.

The application provides a role-based platform for managing students, staff, academic structures, courses, course offerings, academic sessions and semesters.

Built with **React, TypeScript, NestJS, Prisma ORM and PostgreSQL**, the system combines a modern frontend with a structured backend API.

## Overview

The School Management System is designed to provide a centralised environment for managing academic structures and administrative activities within an educational institution.

It implements role-based access control (RBAC), ensuring that users have access to the resources and functionality permitted by their assigned roles.

The application is organised into two main components:

- **Frontend:** A responsive React application responsible for the user interface, application state and API communication.
- **Backend:** A NestJS REST API responsible for business logic, authentication, authorisation and database operations.

PostgreSQL provides relational data storage, while Prisma ORM handles database access and migrations.

## Features

### Academic Management
- Faculty, department and programme management.
- Academic session and semester management.
- Course creation and management.
- Course offerings and academic audience assignment.
- Lecturer assignment to course offerings.
- Academic organisation by programme and level.

### Student Management
- Student registration and profile management.
- Student academic information.
- Faculty, department, programme and level-based student filtering.
- Role-based access to student information.

### User and Access Management
- User authentication and authorisation.
- Role-based access control.
- Protected application routes and API endpoints.
- Separate access levels for administrative, academic and student users.

## User Roles

The application supports five primary user roles:

| Role | Description |
|---|---|
| SUPER_ADMIN | Highest administrative access across the institution. |
| ADMIN | General administrative access within the institution. |
| DEPARTMENT_ADMIN | Administrative access scoped to an assigned department. |
| LECTURER | Access to lecturer-related academic functionality. |
| STUDENT | Access to student-related functionality and academic information. |

Access to resources and administrative operations is controlled by the user's assigned role.

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | User interface |
| TypeScript | Static typing |
| Vite | Development server and build tooling |
| Tailwind CSS 4 | Styling |
| Redux Toolkit | Global state management |
| Redux Persist | State persistence |
| TanStack React Query | Server state and data fetching |
| Axios | HTTP requests |
| React Router 7 | Client-side routing |
| React Hook Form | Form management |
| Zod | Schema validation |
| React Hot Toast | Notifications |
| Lucide React / React Icons | Icons |

### Backend

| Technology | Purpose |
|---|---|
| NestJS 11 | Backend framework |
| TypeScript | Static typing |
| PostgreSQL | Relational database |
| Prisma ORM 7 | Database access and migrations |
| JWT | Authentication |
| bcryptjs | Password hashing |
| class-validator | Request validation |
| class-transformer | Data transformation |


### Development


- ESLint
- Prettier
- Git
- GitHub

---

## Project Structure

The repository uses a separated frontend and backend architecture.

```text
School-management-system/
│
├── Backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── prisma/
│   │   └── ...
│   │
│   ├── prisma.config.ts
│   ├── package.json
│   └── ...
│
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   ├── components/
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

### Backend

Contains the NestJS application, authentication and authorisation logic, API modules, Prisma configuration, database schema, migrations and seed data.

### Frontend

Contains the React application, reusable components, feature modules, routing, state management, form handling and API integration.

---

## Getting Started

Follow these instructions to run the application locally.

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/chikephils/School-management-system.git
```

Navigate into the project directory:

```bash
cd School-management-system
```

### 2. Backend Installation

Navigate to the backend directory:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

### 3. Frontend Installation

Open another terminal at the project root:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

---

## Environment Configuration

The application requires environment variables for database connectivity, authentication and frontend-to-backend communication.

### Backend Environment Variables

Create a `.env` file inside the `Backend` directory.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"
JWT_SECRET="your-strong-secret-key"
JWT_EXPIRES_IN="1d"
```

Replace the database connection details with your PostgreSQL credentials.

Generate a strong, unique JWT secret for your environment.

### Frontend Environment Variables

Create a `.env` file inside the `Frontend` directory.

```env
VITE_API_BASE_URL="http://localhost:3000"
```

Replace the URL with the actual backend API base URL if your backend uses a different port or deployment address.

**Important:** Never commit actual `.env` files, database credentials, JWT secrets or private API keys to GitHub.

---

## Database Setup

The application uses PostgreSQL with Prisma ORM.

### 1. Create a PostgreSQL Database

Create a database for the application using PostgreSQL.

Ensure the `DATABASE_URL` in the backend environment file points to the correct database.

### 2. Generate Prisma Client

From the `Backend` directory:

```bash
npx prisma generate
```

### 3. Apply Database Migrations

Run the existing migrations:

```bash
npx prisma migrate deploy
```

### 4. Seed the Database

Run:

```bash
npx prisma db seed
```

This executes the configured seed script and creates the initial Super Admin account if one does not already exist.

### Creating New Migrations

During development, when making changes to the Prisma schema, create a migration using:

```bash
npx prisma migrate dev --name migration_name
```

Replace `migration_name` with a descriptive name for the migration.

---

## Running the Application

The frontend and backend run independently.

### Start the Backend

From the `Backend` directory:

```bash
npm run start:dev
```

The NestJS application will start in development mode.

### Start the Frontend

From the `Frontend` directory:

```bash
npm run dev
```

Vite will start the frontend development server and display its local address in the terminal.

Open that address in your browser to access the application.

### Production Build

**Backend**

```bash
npm run build
```

**Frontend**

```bash
npm run build
```

---

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm run start:dev` | Start development server with watch mode |
| `npm run start` | Start the application |
| `npm run build` | Build the backend |
| `npm run start:prod` | Run the production build |
| `npm run lint` | Run ESLint with automatic fixes |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build the frontend |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

---

## Deployment

The application is designed to support separate frontend, backend and database hosting.

Potential deployment services include:

| Component | Suggested Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| PostgreSQL Database | Neon or Supabase |

For production deployment:

1. Create and configure a production PostgreSQL database.
2. Configure the backend environment variables on the hosting platform.
3. Apply database migrations using `npx prisma migrate deploy`.
4. Build and deploy the NestJS backend.
5. Configure the frontend's `VITE_API_BASE_URL` to point to the deployed backend.
6. Build and deploy the React frontend.

Production credentials should always be stored securely using the hosting platform's environment-variable settings.

---

## Branching Strategy

The project uses two primary Git branches:

| Branch | Purpose |
|---|---|
| `main` | Stable and production-ready code |
| `dev` | Active development and testing |

New features and improvements are developed and tested on `dev` before being merged into `main`.

---

## Author

**Oreva Philips Okumor**

Full-Stack Software Developer

- GitHub: [@chikephils](https://github.com/chikephils)
- Portfolio: [orevaportfolio.vercel.app](https://orevaportfolio.vercel.app)

---

*Built with React, TypeScript, NestJS, Prisma and PostgreSQL.*
