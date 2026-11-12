# School Management System

A full-stack School Management System designed to simplify and centralise academic and administrative operations within an educational institution.
The application provides a role-based platform for managing students, staff, academic structures, courses, course offerings and other essential academic activities.
Built with **React, TypeScript, NestJS, Prisma ORM and PostgreSQL**, the system follows a structured backend architecture and a modern, responsive frontend.
---

## Project Overview

The School Management System is designed to provide a centralised platform for managing the academic structure and administrative processes of an educational institution.

It uses a role-based access control system to ensure that users can only access the features and information permitted by their assigned roles.

The system is developed as a full-stack application, with a React-based frontend communicating with a REST API powered by NestJS. PostgreSQL handles persistent data storage, while Prisma ORM manages database access and schema operations.

## Features

The system is being developed around the following functional areas:

- **Role-Based Access Control:** Access permissions based on user roles.
- **Academic Structure Management:** Organisation of faculties, departments and programmes.
- **Student Management:** Student registration, profiles and academic information.
- **Staff Management:** Management of academic and administrative personnel.
- **Course Management:** Creation and management of academic courses.
- **Course Offerings:** Assignment of courses to different academic audiences and levels.
- **Academic Sessions and Semesters:** Organisation of academic activities by session and semester.
- **Lecturer Assignment:** Association of lecturers with course offerings.
- **Authentication and Authorisation:** Protected application routes and API endpoints.

## User Roles

The application supports five main user roles:

| Role | Description |
|---|---|
| SUPER_ADMIN | Highest-level administrative access across the institution. |
| ADMIN | General administrative access within assigned institutional boundaries. |
| DEPARTMENT_ADMIN | Administrative access scoped to a particular department. |
| LECTURER | Access to lecturer-related academic functionality. |
| STUDENT | Access to student-related functionality and academic information. |

The application uses role-based permissions to control access to protected resources and administrative operations.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Redux Toolkit
- React Query
- React Hook Form
- Zod
- Tailwind CSS

### Backend

- Node.js
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Role-Based Access Control

### Development Tools

- Git and GitHub
- Visual Studio Code
- npm
- Prisma CLI

## Project Structure

The repository is organised into two main applications:

```text
School-management-system/
│
├── Backend/
│   ├── prisma/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── prisma/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   ├── components/
│   │   ├── ...
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

### Backend

Responsible for business logic, authentication, authorisation, database operations and API endpoints.

### Frontend

Responsible for the user interface, application state, form handling and communication with the backend API.

## Getting Started

Follow these instructions to run the project locally.

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

### 2. Backend Setup

Navigate to the backend:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Configure the backend environment variables using the appropriate environment configuration file.

### 3. Database Setup

Create a PostgreSQL database and configure the database connection.

Run the required Prisma migration and client-generation commands from the Backend directory.

### 4. Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend API base URL to point to your running backend.

### 5. Start the Applications

Start the backend development server from the Backend directory.

Start the frontend development server from the Frontend directory.

The frontend and backend should now be running locally.

---

## Environment Variables

The application requires environment variables for database connectivity, authentication and API communication.

Create the appropriate environment files inside the Backend and Frontend directories.

Never commit actual environment files or production credentials to GitHub.

Use example environment files to document the required configuration.

## Database Setup

The application uses PostgreSQL as its relational database and Prisma ORM for database management.

Prisma is responsible for:

- Database schema definition.
- Database migrations.
- Type-safe database queries.
- Data access through the Prisma Client.

## Demo Accounts

The application includes seeded demo users for testing its different access levels.

Demo accounts are intended for development and demonstration purposes only.


## Deployment

The application is designed for separate frontend and backend deployment.

Potential hosting services include:

- Frontend: Vercel
- Backend: Render
- Database: Neon or Supabase PostgreSQL

## Future Improvements

Planned improvements may include:

- Additional academic management functionality.
- Expanded student and lecturer portals.
- Improved reporting and analytics.
- Further automation of academic workflows.
- Additional testing and performance optimisation.

## Author

**Oreva Philips Okumor**

- GitHub: [@chikephils](https://github.com/chikephils)
- Portfolio: [orevaportfolio.vercel.app](https://orevaportfolio.vercel.app)

---

*Developed as a full-stack software engineering project using modern web technologies.*
