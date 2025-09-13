# TrustLedger - Blockchain-Inspired Financial Management System

## Overview

TrustLedger is a modern financial management system designed for organizations to track budgets, departments, projects, vendors, and transactions with blockchain-inspired security features. The system provides transparent, immutable record-keeping with cryptographic verification of financial transactions.

## Features

- **Budget Management**: Create and track organizational budgets with fiscal year planning
- **Department Allocation**: Manage department-level budget allocations
- **Project Tracking**: Monitor project expenses against allocated budgets
- **Vendor Management**: Maintain vendor information and transaction history
- **Transaction Verification**: Cryptographically verify transaction integrity
- **Audit Logging**: Comprehensive audit trail for all system activities
- **User Authentication**: Role-based access control system
- **Document Storage**: Secure storage for transaction receipts and invoices

## Tech Stack

### Frontend
- React.js with functional components and hooks
- Redux for state management
- Tailwind CSS for styling
- Axios for API communication
- React Router for navigation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Cryptographic hashing for transaction verification
- Express middleware for security (helmet, rate limiting, etc.)

## Project Structure

```
TrustLedger/
├── frontend/               # React frontend application
│   ├── public/             # Static files
│   └── src/                # Source files
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API service files
│       ├── store/          # Redux store configuration
│       ├── utils/          # Utility functions
│       └── App.js          # Main application component
│
├── backend/                # Node.js backend application
│   ├── src/                # Source files
│       ├── controllers/    # Request handlers
│       ├── middleware/     # Express middleware
│       ├── models/         # Mongoose models
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       ├── utils/          # Utility functions
│       └── uploads/        # Uploaded files storage
│   └── server.js           # Express server configuration
│
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/trustledger.git
   cd trustledger
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://<your_db_username>:<your_password>@trustledger.lalfgxo.mongodb.net/
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   FRONTEND_URL=http://localhost:3000
   ```

### Running the Application

1. Start the backend server
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server
   ```bash
   cd frontend
   npm start
   ```

3. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user info

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get budget by ID
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/:id` - Update a budget
- `DELETE /api/budgets/:id` - Delete a budget

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create a new department
- `PUT /api/departments/:id` - Update a department
- `DELETE /api/departments/:id` - Delete a department

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create a new vendor
- `PUT /api/vendors/:id` - Update a vendor
- `DELETE /api/vendors/:id` - Delete a vendor

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction
- `POST /api/transactions/:id/verify` - Verify transaction integrity

### Audit Logs
- `GET /api/audit` - Get all audit logs
- `GET /api/audit/:id` - Get audit log by ID

## Security Features

- **JWT Authentication**: Secure API access with JSON Web Tokens
- **Password Hashing**: Bcrypt for secure password storage
- **Transaction Hashing**: SHA-256 hashing for transaction verification
- **API Rate Limiting**: Prevent brute force attacks
- **Input Sanitization**: Prevent NoSQL injection and XSS attacks
- **CORS Protection**: Configured for secure cross-origin requests
- **Helmet Security**: HTTP header security

## Future Enhancements

- **Blockchain Integration**: Full blockchain implementation for transaction ledger
- **Smart Contracts**: Automated budget allocation and expense approval
- **Multi-factor Authentication**: Enhanced security for user accounts
- **Advanced Analytics**: Financial reporting and forecasting
- **Mobile Application**: iOS and Android companion apps

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by blockchain technology principles
- Built with modern JavaScript frameworks and libraries
- Designed for organizational financial transparency and security