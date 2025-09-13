# TrustLedger Backend

This is the backend API for the TrustLedger application, a financial transparency platform that provides budget tracking, expenditure management, and audit trail capabilities.

## Features

- User authentication and authorization with JWT
- Budget, department, and project management
- Transaction tracking with document verification
- Vendor management
- Comprehensive audit logging system
- Document hash verification for integrity

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- bcrypt for password hashing

## Project Structure

```
├── server.js              # Entry point
├── .env                   # Environment variables
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── uploads/          # Uploaded files
│   └── utils/            # Utility functions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get single budget
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get single department
- `GET /api/departments/budget/:budgetId` - Get departments by budget
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `GET /api/projects/department/:departmentId` - Get projects by department
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get single vendor
- `POST /api/vendors` - Create vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get single transaction
- `GET /api/transactions/project/:projectId` - Get transactions by project
- `GET /api/transactions/vendor/:vendorId` - Get transactions by vendor
- `GET /api/transactions/:id/verify` - Verify transaction document
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Audit Logs
- `GET /api/audit` - Get all audit logs
- `GET /api/audit/:entityId` - Get audit logs for an entity
- `GET /api/audit/:id/verify` - Verify audit log integrity

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://<your_db_username>:<your_password>@trustledger.lalfgxo.mongodb.net/
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Seed the database with sample data (optional):
   ```
   npm run seed
   ```

## User Roles

- **Admin**: Full access to all features
- **Department Head**: Manage department budgets and projects
- **Project Manager**: Manage project transactions
- **Auditor**: View and verify audit logs

## Sample Users (after seeding)

- Admin: admin@example.com / password123
- Department Head: department@example.com / password123
- Project Manager: project@example.com / password123
- Auditor: auditor@example.com / password123
