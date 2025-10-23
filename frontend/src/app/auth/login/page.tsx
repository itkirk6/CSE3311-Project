'use client';

import { useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate UTA email domain
    if (!formData.email.endsWith('@mavs.uta.edu')) {
      alert('Please use your UTA email address (@mavs.uta.edu)');
      return;
    }
    
    // Call the backend API
    try {
      // Check if API_URL is properly set
      if (!API_URL || API_URL === 'undefined') {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (data.success) {
        // Save auth state to localStorage
        const authState = {
          isLoggedIn: true,
          user: data.data.user,
          token: data.data.token
        };
        localStorage.setItem('authState', JSON.stringify(authState));
        
        alert(`Login successful! Welcome back, ${data.data.user.name}!`);
        // Redirect to main page or dashboard
        window.location.href = '/';
      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            <span className="text-3xl font-bold text-blue-600">OutdoorSpot</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">UTA Student Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Use your UTA email (@mavs.uta.edu) to sign in
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  UTA Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="yourname@mavs.uta.edu"
                />
                {formData.email && !formData.email.endsWith('@mavs.uta.edu') && (
                  <p className="mt-1 text-sm text-red-600">Please use your UTA email address (@mavs.uta.edu)</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                          Forgot your password?
                        </a>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                Sign in to OutdoorSpot
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                🎓 This platform is exclusively for UTA students. Please use your official @mavs.uta.edu email address.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
