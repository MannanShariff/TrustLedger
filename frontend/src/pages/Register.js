import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const { name, email, password, password2 } = formData;
  const { register, isAuthenticated, error, clearError } = useContext(AuthContext);
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
    
    if (!name || !email || !password) {
      toast.error('Please enter all required fields');
      return;
    }
    
    if (password !== password2) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const result = await register({
      name,
      email,
      password
    });
    
    if (result.success) {
      toast.success('Registration successful');
      navigate('/');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-primary-600 mb-6">Register for TrustLedger</h1>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your full name"
              required
            />
          </div>
          
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
          
          <div className="mb-4">
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
              minLength="6"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password2">
              Confirm Password
            </label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Confirm your password"
              required
              minLength="6"
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Register
            </button>
          </div>
        </form>
        
        <p className="text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-800">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;