import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Context Provider
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Budget Pages
import Budgets from './pages/budgets/Budgets';
import BudgetDetail from './pages/budgets/BudgetDetail';

// Department Pages
import Departments from './pages/departments/Departments';
import DepartmentDetail from './pages/departments/DepartmentDetail';

// Project Pages
import Projects from './pages/projects/Projects';
import ProjectDetail from './pages/projects/ProjectDetail';

// Vendor Pages
import Vendors from './pages/vendors/Vendors';
import VendorDetail from './pages/vendors/VendorDetail';

// Transaction Pages
import Transactions from './pages/transactions/Transactions';
import TransactionDetail from './pages/transactions/TransactionDetail';

// Audit Pages
import Audit from './pages/audit/Audit';

// Private Route Component
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Private Routes */}
              <Route path="/" element={<PrivateRoute />}>
                <Route index element={<Dashboard />} />
                
                {/* Budget Routes */}
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/budgets/:id" element={<BudgetDetail />} />
                
                {/* Department Routes */}
                <Route path="/departments" element={<Departments />} />
                <Route path="/departments/:id" element={<DepartmentDetail />} />
                
                {/* Project Routes */}
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                
                {/* Vendor Routes */}
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/vendors/:id" element={<VendorDetail />} />
                
                {/* Transaction Routes */}
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/transactions/:id" element={<TransactionDetail />} />
                
                {/* Audit Routes */}
                <Route path="/audit" element={<Audit />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;