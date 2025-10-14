'use client';

import { useState } from 'react';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.12:3001';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email.endsWith('@mavs.uta.edu'))
      newErrors.email = 'Please use your UTA email address.';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match.';
    if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem(
          'authState',
          JSON.stringify({ user: data.data.user, token: data.data.token })
        );
        alert(`Welcome, ${formData.firstName}!`);
        window.location.href = '/';
      } else {
        alert(`Registration failed: ${data.message}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <Link href="/" className="text-3xl font-extrabold text-emerald-400">
            OutdoorSpot
          </Link>
          <h2 className="mt-2 text-lg text-neutral-400">
            Create your UTA account (@mavs.uta.edu)
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input name="email" type="email" placeholder="UTA Email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl p-3 font-semibold text-white transition">
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
