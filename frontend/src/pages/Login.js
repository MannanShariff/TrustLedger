import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;
  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }

    // Clear any previous errors
    clearError();
  }, [isAuthenticated, navigate, clearError]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter all fields');
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      toast.success('Login successful');
      navigate('/');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-primary-600 mb-6">Login to TrustLedger</h1>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Sign In
            </button>
          </div>
        </form>
        
        <p className="text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-800">
            Register
          </Link>
        </p>

        <div className="mt-6 border-t pt-4">
          <p className="text-center text-gray-600 text-sm mb-2">Demo Accounts:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <p><strong>Admin:</strong> admin@example.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
            <div>
              <p><strong>Auditor:</strong> auditor@example.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;