import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-6xl font-extrabold text-primary">404</h2>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Page Not Found
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="mt-8">
          <div className="inline-flex rounded-md shadow">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;