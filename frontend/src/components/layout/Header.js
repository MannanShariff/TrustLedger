import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const authLinks = (
    <>
      <Link to="/budgets" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
        Budgets
      </Link>
      <Link to="/departments" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
        Departments
      </Link>
      <Link to="/projects" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
        Projects
      </Link>
      <Link to="/vendors" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
        Vendors
      </Link>
      <Link to="/transactions" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
        Transactions
      </Link>
      {user && (user.role === 'admin' || user.role === 'auditor') && (
        <Link to="/audit" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
          Audit Logs
        </Link>
      )}
    </>
  );

  const guestLinks = (
    <>
      <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
        Login
      </Link>
      <Link to="/register" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
        Register
      </Link>
    </>
  );

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                TrustLedger
              </Link>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-4 md:items-center">
              {isAuthenticated ? authLinks : guestLinks}
            </nav>
          </div>

          <div className="hidden md:flex md:items-center md:ml-6">
            {isAuthenticated && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-4">
                  {user && user.name} ({user && user.role.replace('_', ' ')})
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isAuthenticated ? authLinks : guestLinks}
        </div>
        {isAuthenticated && (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                  {user && user.name.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user && user.name}</div>
                <div className="text-sm font-medium text-gray-500">{user && user.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;